import stellarSdk from 'stellar-sdk';
import {
  Network,
  NetworkError,
  Stellar,
  StellarSubnet,
  SubnetMap,
} from '../../types';
import { BaseHtlc } from '../shared';

export class StellarHtlc<N extends Network> extends BaseHtlc<N> {
  private _server: stellarSdk.Server;
  private _serverKeyPair: stellarSdk.Keypair;
  public escrowKeyPair: stellarSdk.Keypair;

  /**
   * Create a new Stellar HTLC instance
   * @param network
   * @param subnet
   * @param options
   */
  constructor(network: N, subnet: SubnetMap[N], options: Stellar.Options) {
    super(network, subnet);
    const {
      url,
      passphrase,
      allowHttp = false,
    } = this.getServerDetailsForSubnet(subnet, options.server);
    stellarSdk.Network.use(new stellarSdk.Network(passphrase));
    this._server = new stellarSdk.Server(url, {
      allowHttp,
    });
    this._serverKeyPair = stellarSdk.Keypair.fromSecret(options.secret);
    // create a completely new and unique pair of keys
    this.escrowKeyPair = stellarSdk.Keypair.random();
  }

  /**
   * Connect to mainnet, testnet or local
   * @param subnet
   */
  private getServerDetailsForSubnet(
    subnet: SubnetMap[N],
    serverOptions?: Stellar.ServerOptions,
  ) {
    switch (subnet) {
      case StellarSubnet.STELLAR:
        return {
          url: 'https://horizon.stellar.org',
          passphrase: stellarSdk.Networks.PUBLIC,
          allowHttp: false,
        };
      case StellarSubnet.XLMTESTNET:
        return {
          url: 'https://horizon-testnet.stellar.org',
          passphrase: stellarSdk.Networks.TESTNET,
          allowHttp: false,
        };
      case StellarSubnet.ZULUCRYPTO:
        return {
          url: 'http://localhost:8000',
          passphrase: 'Integration Test Network ; zulucrypto',
          allowHttp: true,
        };
      case StellarSubnet.CUSTOM:
        return {
          ...(serverOptions as Stellar.ServerOptions),
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
   * Broadcast signed envelope to network
   * @param envelope
   */
  public async broadcast(envelope: string) {
    const txFromEnvelope = new stellarSdk.Transaction(envelope);
    const resp = await this._server.submitTransaction(txFromEnvelope);
    return resp;
  }

  /**
   * Create a generic escrow account
   * @param keyPair stellarSdk.Keypair.fromSecret('secret-here')
   */
  public async create(): Promise<string> {
    const serverAccount = await this._server.loadAccount(
      this._serverKeyPair.publicKey(),
    );
    // build transaction with operations
    const tb = new stellarSdk.TransactionBuilder(serverAccount)
      .addOperation(
        stellarSdk.Operation.createAccount({
          destination: this.escrowKeyPair.publicKey(), // create escrow account
          startingBalance: '2.00001', // 1 base + 0.5[base_reserve] per op(2) + tx fee (0.00001) => 2.00001 XLM minimum
        }),
      )
      .addOperation(
        stellarSdk.Operation.setOptions({
          source: this.escrowKeyPair.publicKey(),
          signer: {
            ed25519PublicKey: this._serverKeyPair.publicKey(), // add radar as signer on escrow account
            weight: 1,
          },
        }),
      );

    // build and sign transaction
    const tx = tb.build();
    tx.sign(this.escrowKeyPair, this._serverKeyPair);
    return tx
      .toEnvelope()
      .toXDR('base64')
      .toString();
  }

  /**
   * Create claim envelope once the preimage is revealed. Broadcast to complete swap
   * @param keyPair stellarSdk.Keypair.fromSecret('secret-here')
   * @param escrowPubKey
   * @param preimage
   */
  public async claim(preimage: string): Promise<string> {
    // load escrow account from pub key
    const escrowAccount = await this._server.loadAccount(
      this.escrowKeyPair.publicKey(),
    );
    // build claim transaction
    const tb = new stellarSdk.TransactionBuilder(escrowAccount).addOperation(
      stellarSdk.Operation.accountMerge({
        destination: this._serverKeyPair.publicKey(),
      }),
    );

    // build and sign transaction
    const tx = tb.build();
    tx.sign(this._serverKeyPair);
    // https://stellar.github.io/js-stellar-sdk/Transaction.html#signHashX
    tx.signHashX(preimage);
    return tx
      .toEnvelope()
      .toXDR('base64')
      .toString();
  }

  /**
   * Create fund envelope. User must sign to make valid. Once signed the escrow account becomes a multisig
   * @param keyPair stellarSdk.Keypair.fromSecret('secret-here')
   * @param userPubKey
   * @param escrowPubKey
   * @param amount
   * @param hashX
   */
  public async fund(
    userPubKey: string,
    amount: number,
    hashX: string,
  ): Promise<string> {
    // load account to sign with
    const account = await this._server.loadAccount(userPubKey);
    // add a payment operation to the transaction
    const tb = new stellarSdk.TransactionBuilder(account)
      .addOperation(
        stellarSdk.Operation.payment({
          amount: amount.toString(), // user pays amount
          destination: this.escrowKeyPair.publicKey(),
          asset: stellarSdk.Asset.native(),
        }),
      )
      .addOperation(
        stellarSdk.Operation.setOptions({
          source: this.escrowKeyPair.publicKey(),
          signer: {
            ed25519PublicKey: this._serverKeyPair.publicKey(), // add radar as signer on escrow account
            weight: 1,
          },
        }),
      )
      .addOperation(
        stellarSdk.Operation.setOptions({
          source: this.escrowKeyPair.publicKey(),
          signer: {
            ed25519PublicKey: userPubKey, // add user as signer on escrow account
            weight: 1,
          },
        }),
      )
      .addOperation(
        stellarSdk.Operation.setOptions({
          source: this.escrowKeyPair.publicKey(),
          signer: {
            sha256Hash: hashX, // add hash(x) as signer on escrow acount
            weight: 1,
          },
          masterWeight: 0, // escrow cannot sign its own txs
          lowThreshold: 2, // and add signing thresholds (2 signatures required)
          medThreshold: 2,
          highThreshold: 2,
        }),
      );

    // build and sign transaction
    const tx = tb.build();
    tx.sign(this._serverKeyPair);
    return tx
      .toEnvelope()
      .toXDR('base64')
      .toString();
  }

  /**
   * Create refund envelope in case something goes wrong. user must sign to be valid. can only broadcast after timelock
   * @param keyPair stellarSdk.Keypair.fromSecret('secret-here')
   * @param userPubKey
   * @param escrowPubKey
   * @param timelockSeconds
   */
  public async refund(
    userPubKey: string,
    timelockSeconds: number,
  ): Promise<string> {
    // load escrow account from pub key
    const escrowAccount = await this._server.loadAccount(
      this.escrowKeyPair.publicKey(),
    );
    // build claim transaction with timelock
    const tb = new stellarSdk.TransactionBuilder(escrowAccount, {
      timebounds: {
        minTime: Math.floor(Date.now() / 1000) + timelockSeconds,
        maxTime: 0,
      },
    })
      .addOperation(
        stellarSdk.Operation.payment({
          destination: this._serverKeyPair.publicKey(),
          asset: stellarSdk.Asset.native(),
          amount: '2.00001', // send upfront cost back to radar
        }),
      )
      .addOperation(
        stellarSdk.Operation.accountMerge({
          destination: userPubKey, // merge remainder back to user
        }),
      );
    // build and sign transaction
    const tx = tb.build();
    tx.sign(this._serverKeyPair);
    // https://www.stellar.org/developers/horizon/reference/xdr.html
    return tx
      .toEnvelope()
      .toXDR('base64')
      .toString();
  }

  /**
   * Sign fund envelope or refund envelope
   * @param keyPair stellarSdk.Keypair.fromSecret('secret-here')
   * @param envelope
   */
  public sign(envelope: string): string {
    const tx = new stellarSdk.Transaction(envelope);
    tx.sign(this._serverKeyPair);
    return tx
      .toEnvelope()
      .toXDR('base64')
      .toString();
  }
}
