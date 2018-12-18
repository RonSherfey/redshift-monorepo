import stellarSdk from 'stellar-sdk';
import { Network, Stellar, SubnetMap } from '../../types';
import { BaseHtlc } from '../shared';

export class StellarHtlc<N extends Network> extends BaseHtlc<N> {
  private server: any;

  constructor(network: N, subnet: SubnetMap[N], options: Stellar.Options) {
    super(network, subnet);
    this.network(subnet);
  }

  private network(subnet: SubnetMap[N]) {
    // https://www.stellar.org/developers/js-stellar-sdk/reference/examples.html
    if (subnet === 'xlmtestnet') {
      stellarSdk.Network.useTestNetwork();
      this.server = new stellarSdk.Server(
        'https://horizon-testnet.stellar.org',
      );
    } else if (subnet === 'stellar') {
      stellarSdk.Network.usePublicNetwork();
      this.server = new stellarSdk.Server('https://horizon.stellar.org');
    } else if (subnet === 'zulucrypto') {
      // https://github.com/zulucrypto/docker-stellar-integration-test-network
      stellarSdk.Network.use(
        new stellarSdk.Network('Integration Test Network ; zulucrypto'),
      );
      // https://github.com/RadarRelay/redshift-submarine-backend/pull/48
      this.server = new stellarSdk.Server('http://localhost:8000', {
        allowHttp: true,
      });
    } else {
      throw new Error('unable to connect stellar network');
    }
  }

  public async broadcast(envelope: string) {
    try {
      const txFromEnvelope = new stellarSdk.Transaction(envelope);
      const resp = await this.server.submitTransaction(txFromEnvelope);
      return resp;
    } catch (err) {
      throw new Error(err);
    }
  }

  public sign(keyPair: stellarSdk.Keypair, envelope: string) {
    try {
      const tx = new stellarSdk.Transaction(envelope);
      tx.sign(keyPair);
      return tx.toEnvelope().toXDR('base64');
    } catch (err) {
      throw new Error(err);
    }
  }

  public async create(
    keyPair: stellarSdk.Keypair,
  ): Promise<{ createEnvelope: string; escrowPubKey: string }> {
    try {
      // create a completely new and unique pair of keys
      const escrowKeyPair = stellarSdk.Keypair.random();
      const userAccount = await this.server.loadAccount(keyPair.publicKey());
      // build transaction with operations
      const tb = new stellarSdk.TransactionBuilder(userAccount)
        .addOperation(
          stellarSdk.Operation.createAccount({
            destination: escrowKeyPair.publicKey(), // create escrow account
            startingBalance: '2.00001', // 1 base + 0.5[base_reserve] per op(2) + tx fee (0.00001) => 2.00001 XLM minimum
          }),
        )
        .addOperation(
          stellarSdk.Operation.setOptions({
            source: escrowKeyPair.publicKey(),
            signer: {
              ed25519PublicKey: keyPair.publicKey(), // add radar as signer on escrow account
              weight: 1,
            },
          }),
        );

      // build and sign transaction
      const tx = tb.build();
      tx.sign(escrowKeyPair);
      tx.sign(keyPair);
      return {
        createEnvelope: tx.toEnvelope().toXDR('base64'),
        escrowPubKey: escrowKeyPair.publicKey(),
      };
    } catch (err) {
      throw new Error(err);
    }
  }

  public async accountInfo(pubKey: string) {
    return this.server.loadAccount(pubKey);
  }

  public async claim(
    keyPair: stellarSdk.Keypair,
    escrowPubKey: string,
    preimage: string,
  ): Promise<string> {
    try {
      // load escrow account from pub key
      const escrowAccount = await this.server.loadAccount(escrowPubKey);
      // build claim transaction
      const tb = new stellarSdk.TransactionBuilder(escrowAccount).addOperation(
        stellarSdk.Operation.accountMerge({
          destination: keyPair.publicKey(),
        }),
      );

      // build and sign transaction
      const tx = tb.build();
      tx.sign(keyPair);
      // https://stellar.github.io/js-stellar-sdk/Transaction.html#signHashX
      tx.signHashX(preimage);
      return tx.toEnvelope().toXDR('base64');
    } catch (err) {
      throw new Error(err);
    }
  }

  public async fund(
    keyPair: stellarSdk.Keypair,
    userPubKey: string,
    escrowPubKey: string,
    amount: number,
    hashX: string,
  ): Promise<string> {
    try {
      // load account to sign with
      const account = await this.server.loadAccount(userPubKey);
      // add a payment operation to the transaction
      const tb = new stellarSdk.TransactionBuilder(account)
        .addOperation(
          stellarSdk.Operation.payment({
            amount: amount.toString(), // user pays amount
            destination: escrowPubKey,
            asset: stellarSdk.Asset.native(),
          }),
        )
        .addOperation(
          stellarSdk.Operation.setOptions({
            source: escrowPubKey,
            signer: {
              ed25519PublicKey: keyPair.publicKey(), // add radar as signer on escrow account
              weight: 1,
            },
          }),
        )
        .addOperation(
          stellarSdk.Operation.setOptions({
            source: escrowPubKey,
            signer: {
              ed25519PublicKey: userPubKey, // add user as signer on escrow account
              weight: 1,
            },
          }),
        )
        .addOperation(
          stellarSdk.Operation.setOptions({
            source: escrowPubKey,
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
      tx.sign(keyPair);
      return tx.toEnvelope().toXDR('base64');
    } catch (err) {
      throw new Error(err);
    }
  }

  public async refund(
    keyPair: stellarSdk.Keypair,
    userPubKey: string,
    escrowPubKey: string,
    timelockSeconds: number,
  ) {
    try {
      // load escrow account from pub key
      const escrowAccount = await this.server.loadAccount(escrowPubKey);
      // load all payments
      const escrowPayments = await escrowAccount.payments();
      // build claim transaction with timelock
      const tb = new stellarSdk.TransactionBuilder(escrowAccount, {
        timebounds: {
          minTime: Math.floor(Date.now() / 1000) + timelockSeconds, // timelock of 2 seconds
          maxTime: 0,
        },
      })
        .addOperation(
          stellarSdk.Operation.payment({
            destination: keyPair.publicKey(),
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
      tx.sign(keyPair);
      // https://www.stellar.org/developers/horizon/reference/xdr.html
      return tx.toEnvelope().toXDR('base64');
    } catch (err) {
      throw new Error(err);
    }
  }
}
