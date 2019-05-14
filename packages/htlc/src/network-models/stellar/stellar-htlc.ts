import {
  Network,
  NetworkError,
  StellarSubnet,
  SubnetMap,
} from '@radar/redshift-types';
import {
  Asset,
  Keypair,
  Network as StellarNetwork,
  Networks as StellarNetworks,
  Operation,
  Server,
  Transaction,
  TransactionBuilder,
} from 'stellar-sdk';
import { Stellar } from '../../types';
import { BaseHtlc } from '../shared';

export class StellarHtlc<N extends Network> extends BaseHtlc<N> {
  private _server: Server;
  private _serverKeyPair: Keypair;
  private _escrowKeyPair: Keypair;

  get escrowKeyPair() {
    return this._escrowKeyPair;
  }

  /**
   * Create a new Stellar HTLC instance
   * @param network The chain network
   * @param subnet The chain subnet
   * @param config The htlc config
   */
  constructor(network: N, subnet: SubnetMap[N], config: Stellar.Config) {
    super(network, subnet);
    const {
      url,
      passphrase,
      allowHttp = false,
    } = this.getServerDetailsForSubnet(subnet, config.server);
    StellarNetwork.use(new StellarNetwork(passphrase));
    this._server = new Server(url, {
      allowHttp,
    });
    this._serverKeyPair = Keypair.fromSecret(config.secret);
    this._escrowKeyPair = Keypair.random();
  }

  /**
   * Connect to mainnet, testnet, zulucrypto simnet, or custom
   * @param subnet The chain subnet
   * @param serverConfig The optional server config
   */
  private getServerDetailsForSubnet(
    subnet: SubnetMap[N],
    serverConfig?: Stellar.ServerConfig,
  ) {
    switch (subnet) {
      case StellarSubnet.MAINNET:
        return {
          url: 'https://horizon.stellar.org',
          passphrase: StellarNetworks.PUBLIC,
          allowHttp: false,
        };
      case StellarSubnet.TESTNET:
        return {
          url: 'https://horizon-testnet.stellar.org',
          passphrase: StellarNetworks.TESTNET,
          allowHttp: false,
        };
      case StellarSubnet.ZULUCRYPTO_SIMNET:
        return {
          url: 'http://localhost:8000',
          passphrase: 'Integration Test Network ; zulucrypto',
          allowHttp: true,
        };
      case StellarSubnet.CUSTOM:
        return {
          ...(serverConfig as Stellar.ServerConfig),
        };
      default:
        throw new Error(NetworkError.INVALID_SUBNET);
    }
  }

  /**
   * Get stellar account info
   * @param pubKey
   */
  public async accountInfo(pubKey: string) {
    return this._server.loadAccount(pubKey);
  }

  /**
   * Create a generic escrow account
   * @param shouldBroadcast Whether or not the transaction should be broadcast
   */
  public async create(shouldBroadcast: boolean = true): Promise<string | any> {
    const serverAccount = await this._server.loadAccount(
      this._serverKeyPair.publicKey(),
    );

    // Build transaction with operations
    const tb = new TransactionBuilder(serverAccount)
      .addOperation(
        Operation.createAccount({
          destination: this.escrowKeyPair.publicKey(), // Create escrow account
          startingBalance: '2.00001', // 1 base + 0.5[base_reserve] per op(2) + tx fee (0.00001) => 2.00001 XLM minimum
        }),
      )
      .addOperation(
        Operation.setOptions({
          source: this.escrowKeyPair.publicKey(),
          signer: {
            ed25519PublicKey: this._serverKeyPair.publicKey(), // Add server as signer on escrow account
            weight: 1,
          },
        }),
      );

    // Build and sign transaction
    const tx = tb.build();
    tx.sign(this.escrowKeyPair, this._serverKeyPair);
    const base64Tx = tx.toEnvelope().toXDR('base64');

    if (shouldBroadcast) {
      return this._server.submitTransaction(new Transaction(base64Tx));
    }
    return base64Tx;
  }

  /**
   * Create the fund envelope. User must sign to make valid. Once signed, the escrow account becomes a multisig.
   * @param userPubKey The user's public key
   * @param amount The fund amount
   * @param paymentHash The hash of the payment secret
   */
  public async fund(
    userPubKey: string,
    amount: number,
    paymentHash: string,
  ): Promise<string> {
    // Load account to sign with
    const account = await this._server.loadAccount(userPubKey);

    // Add a payment operation to the transaction
    const tb = new TransactionBuilder(account)
      .addOperation(
        Operation.payment({
          amount: amount.toString(), // User pays amount
          destination: this.escrowKeyPair.publicKey(),
          asset: Asset.native(),
        }),
      )
      .addOperation(
        Operation.setOptions({
          source: this.escrowKeyPair.publicKey(),
          signer: {
            ed25519PublicKey: this._serverKeyPair.publicKey(), // Add server as signer on escrow account
            weight: 1,
          },
        }),
      )
      .addOperation(
        Operation.setOptions({
          source: this.escrowKeyPair.publicKey(),
          signer: {
            ed25519PublicKey: userPubKey, // Add user as signer on escrow account
            weight: 1,
          },
        }),
      )
      .addOperation(
        Operation.setOptions({
          source: this.escrowKeyPair.publicKey(),
          signer: {
            sha256Hash: paymentHash, // Add hash(x) as signer on escrow acount
            weight: 1,
          },
          masterWeight: 0, // Escrow cannot sign its own txs
          lowThreshold: 2, // Add signing thresholds (2 signatures required)
          medThreshold: 2,
          highThreshold: 2,
        }),
      );

    // Build and sign transaction
    const tx = tb.build();
    tx.sign(this._serverKeyPair);
    return tx.toEnvelope().toXDR('base64');
  }

  /**
   * Create claim envelope once the payment secret is revealed
   * @param paymentSecret The payment secret
   * @param shouldBroadcast Whether or not the transaction should be broadcast
   */
  public async claim(
    paymentSecret: string,
    shouldBroadcast: boolean = true,
  ): Promise<string | any> {
    // Load escrow account from pub key
    const escrowAccount = await this._server.loadAccount(
      this.escrowKeyPair.publicKey(),
    );

    // Build claim transaction
    const tb = new TransactionBuilder(escrowAccount).addOperation(
      Operation.accountMerge({
        destination: this._serverKeyPair.publicKey(),
      }),
    );

    // Build and sign transaction
    const tx = tb.build();
    tx.sign(this._serverKeyPair);
    tx.signHashX(paymentSecret);
    const base64Tx = tx.toEnvelope().toXDR('base64');

    if (shouldBroadcast) {
      return this._server.submitTransaction(new Transaction(base64Tx));
    }
    return base64Tx;
  }

  /**
   * Create refund envelope in case something goes wrong. User must sign to make valid. Can only broadcast after timelock.
   * @param userPubKey The user's public key
   * @param timelockSeconds The timelock in seconds
   */
  public async refund(
    userPubKey: string,
    timelockSeconds: number,
  ): Promise<string> {
    // Load escrow account from pub key
    const escrowAccount = await this._server.loadAccount(
      this.escrowKeyPair.publicKey(),
    );

    // Build claim transaction with timelock
    const tb = new TransactionBuilder(escrowAccount, {
      timebounds: {
        minTime: Math.floor(Date.now() / 1000) + timelockSeconds,
        maxTime: 0,
      },
    })
      .addOperation(
        Operation.payment({
          destination: this._serverKeyPair.publicKey(),
          asset: Asset.native(),
          amount: '2.00001', // Send upfront cost back to server
        }),
      )
      .addOperation(
        Operation.accountMerge({
          destination: userPubKey, // Merge remainder back to user
        }),
      );

    // Build and sign transaction
    const tx = tb.build();
    tx.sign(this._serverKeyPair);
    return tx.toEnvelope().toXDR('base64');
  }
}
