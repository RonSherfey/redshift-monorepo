import stellarSdk from 'stellar-sdk';
import { Network, Stellar, SubnetMap } from '../../types';
import { BaseHtlc } from '../shared';

// TODO move
stellarSdk.Network.useTestNetwork();
const server = new stellarSdk.Server('https://horizon-testnet.stellar.org');

export class StellarHtlc<N extends Network> extends BaseHtlc<N> {
  constructor(network: N, subnet: SubnetMap[N], options: Stellar.Options) {
    super(network, subnet);
  }

  public async sign(keyPair: stellarSdk.Keypair, envelope: string) {
    try {
      const txFromEnvelope = new stellarSdk.Transaction(envelope);
      txFromEnvelope.sign(keyPair);
      const resp = await server.submitTransaction(txFromEnvelope);
      return resp.hash;
    } catch (err) {
      throw new Error(err);
    }
  }

  public async create(keyPair: stellarSdk.Keypair) {
    try {
      // create a completely new and unique pair of keys
      const escrowKeyPair = stellarSdk.Keypair.random();
      const userAccount = await server.loadAccount(keyPair.publicKey());
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
      return tx.toEnvelope().toXDR('base64');
    } catch (err) {
      throw new Error(err);
    }
  }

  public async claim(
    keyPair: stellarSdk.Keypair,
    escrowPubKey: string,
    preimage: string,
  ) {
    try {
      // load escrow account from pub key
      const escrowAccount = await server.loadAccount(escrowPubKey);
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
      // broadcast transaction
      return await server.submitTransaction(tx);
    } catch (err) {
      console.log('claim transaction failed');
      console.log(err.response.data.extras);
    }
  }

  public async fund(
    keyPair: stellarSdk.Keypair,
    userPubKey: string,
    escrowPubKey: string,
    amount: string,
    hashX: string,
  ) {
    try {
      // load account to sign with
      const account = await server.loadAccount(userPubKey);
      // add a payment operation to the transaction
      const tb = new stellarSdk.TransactionBuilder(account)
        .addOperation(
          stellarSdk.Operation.payment({
            amount, // user pays amount
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
  ) {
    try {
      // load escrow account from pub key
      const escrowAccount = await server.loadAccount(escrowPubKey);
      // load all payments
      const escrowPayments = await escrowAccount.payments();
      // build claim transaction with timelock
      const tb = new stellarSdk.TransactionBuilder(escrowAccount, {
        timebounds: {
          minTime: Math.floor(Date.now() / 1000) + 2, // timelock of 2 seconds
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
