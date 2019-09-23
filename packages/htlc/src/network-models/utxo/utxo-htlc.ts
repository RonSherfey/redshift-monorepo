import { Network, SubnetMap, SwapError, TxOutput } from '@radar/redshift-types';
import bip68 from 'bip68';
import {
  address,
  crypto,
  ECPair,
  payments,
  script,
  Transaction,
  TransactionBuilder,
} from 'bitcoinjs-lib';
import { isString } from 'util';
import { UTXO } from '../../types';
import { isDefined } from '../../utils';
import { BaseHtlc } from '../shared';
import {
  createSwapRedeemScript,
  estimateFee,
  getBitcoinJSNetwork,
  getSwapRedeemScriptDetails,
  toReversedByteOrderBuffer,
} from './utils';

export class UtxoHtlc<N extends Network> extends BaseHtlc<N> {
  private _redeemScript: string;
  private _details: UTXO.Details<N>;

  get redeemScript(): string {
    return this._redeemScript;
  }

  get redeemScriptBuffer(): Buffer {
    return Buffer.from(this.redeemScript, 'hex');
  }

  get details(): UTXO.Details<N> {
    return this._details;
  }

  /**
   * Create a new UTXO HTLC instance
   * @param network The chain network
   * @param subnet The chain subnet
   * @param config The redeem script or htlc creation config
   */
  constructor(network: N, subnet: SubnetMap[N], config: UTXO.Config) {
    super(network, subnet);
    this._redeemScript = isString(config)
      ? config
      : createSwapRedeemScript(config);
    this._details = getSwapRedeemScriptDetails(
      this._network,
      this._subnet,
      this._redeemScript,
    );
  }

  /**
   * Generate the funding transaction and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param amount The funding amount in satoshis
   * @param privateKey The private key WIF string used to sign
   * @param fee Fee tokens for the transaction
   */
  public fund(
    utxos: TxOutput[],
    amount: number,
    privateKey: string,
    fee: number = 0,
    nSequence: number,
  ): string {
    const networkPayload = getBitcoinJSNetwork(this._network, this._subnet);
    const tx = new TransactionBuilder(networkPayload);

    // TODO: remove or make dynamic
    // tx.setLockTime(54);

    // The signing key
    const signingKey = ECPair.fromWIF(privateKey, networkPayload);

    // Generate prev output script
    const { output, address } = payments.p2wpkh({
      pubkey: signingKey.publicKey,
      network: networkPayload,
    });

    // Add the inputs being spent to the transaction
    utxos.forEach(utxo => {
      if (isDefined(utxo.txId) && isDefined(utxo.index)) {
        tx.addInput(
          toReversedByteOrderBuffer(utxo.txId),
          utxo.index,
          nSequence,
          output,
        );
      }
    });

    // Total spendable amount
    const tokens = utxos.reduce((t, c) => t + c.tokens, 0);

    tx.addOutput(this.details.p2shP2wshAddress, amount);
    tx.addOutput(address || '', tokens - amount - fee);

    // Sign the inputs
    utxos.forEach((output, i) => {
      tx.sign(i, signingKey, undefined, undefined, output.tokens);
    });

    return tx.build().toHex();
  }

  /**
   * Generate the claim transaction and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param destinationAddress The address the funds will be claimed to
   * @param nSequence The nSequence number (for relative timelocks)
   * @param feeTokensPerVirtualByte The fee per byte (satoshi/byte)
   * @param paymentSecret The payment secret
   * @param privateKey The private key WIF string
   */
  public claim(
    utxos: TxOutput[],
    destinationAddress: string,
    nSequence: number,
    feeTokensPerVirtualByte: number,
    paymentSecret: string,
    privateKey: string,
  ): string {
    return this.buildTransaction(
      utxos,
      destinationAddress,
      nSequence,
      feeTokensPerVirtualByte,
      paymentSecret,
      privateKey,
    );
  }

  /**
   * Generate the refund transaction and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param destinationAddress The address the funds will be refunded to
   * @param nSequence The nSequence number (for relative timelocks)
   * @param feeTokensPerVirtualByte The fee per byte (satoshi/byte)
   * @param privateKey The private key WIF string
   */
  public refund(
    utxos: TxOutput[],
    destinationAddress: string,
    nSequence: number,
    feeTokensPerVirtualByte: number,
    privateKey: string,
  ): string {
    const { publicKey } = ECPair.fromWIF(
      privateKey,
      getBitcoinJSNetwork(this._network, this._subnet),
    );
    return this.buildTransaction(
      utxos,
      destinationAddress,
      nSequence,
      feeTokensPerVirtualByte,
      publicKey.toString('hex'),
      privateKey,
    );
  }

  /**
   * Build the transaction using the provided params and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param destinationAddress The address the funds will be sent to
   * @param nSequence The nSequence (for relative timelocks)
   * @param feeTokensPerVirtualByte The fee per byte (satoshi/byte)
   * @param unlock Claim secret (preimage) or refund public key
   * @param privateKey The private key WIF string
   */
  private buildTransaction(
    utxos: TxOutput[],
    destinationAddress: string,
    nSequence: number,
    feeTokensPerVirtualByte: number,
    unlock: string,
    privateKey: string,
  ): string {
    // Create a new transaction instance
    const tx = new Transaction();

    // Total the utxos
    const tokens = utxos.reduce((t, c) => t + c.tokens, 0);

    // Add a single output containing the destination address
    tx.addOutput(
      address.toOutputScript(
        destinationAddress,
        getBitcoinJSNetwork(this._network, this._subnet),
      ),
      tokens,
    );

    // Set version to 2 for segwit
    tx.version = 2;

    // Set transaction locktime
    tx.locktime = bip68.encode({
      blocks: nSequence,
    });

    // Add the inputs being spent to the transaction
    this.addInputs(utxos, tx, nSequence, this.generateInputScript());

    // Estimate the tx fee
    const fee = estimateFee(
      this.redeemScript,
      utxos,
      unlock,
      tx.weight(),
      feeTokensPerVirtualByte,
    );

    // Exit early when the ratio of the amount spent on fees would be too high
    const dustRatio = 1 / 3; // Fee exceeds one third of tx value
    if (fee > tokens || fee / (tokens - fee) > dustRatio) {
      throw new Error(SwapError.FEES_TOO_HIGH);
    }

    // Reduce the final output value to give some tokens over to fees
    const [out] = tx.outs;
    // @ts-ignore - for some reason typescript doesn't recognize that value is a valid param
    out.value -= fee;

    // Set the signed witnesses
    this.addWitnessScripts(utxos, privateKey, unlock, tx);

    return tx.toHex();
  }

  /**
   * Generates the input script, which consists
   * of the prefixed redeem script buffer.
   * prefix: 22 => length; 00 => OP_0; 20 => len(sha256)
   */
  private generateInputScript(): Buffer {
    return Buffer.concat([
      Buffer.from('220020', 'hex'),
      crypto.sha256(this.redeemScriptBuffer),
    ]);
  }

  /**
   * Add the transaction inputs.
   * @param utxos The utxos we're spending
   * @param tx The tx instance
   * @param inputScript The input unlock script
   */
  private addInputs(
    utxos: TxOutput[],
    tx: Transaction,
    nSequence: number,
    inputScript?: Buffer,
  ) {
    // Add Inputs
    utxos.forEach(utxo => {
      tx.addInput(
        toReversedByteOrderBuffer(utxo.txId),
        utxo.index,
        nSequence,
        inputScript,
      );
    });
  }

  /**
   * Add witness scripts. hashForWitnessV0 must be called after all inputs
   * have been added. Otherwise, you'll end up with a different sig hash.
   * @param utxos The utxos we're spending
   * @param privateKey The private key WIF string
   * @param unlock Claim secret (preimage) or refund public key
   * @param tx The tx instance
   */
  private addWitnessScripts(
    utxos: TxOutput[],
    privateKey: string,
    unlock: string,
    tx: Transaction,
  ) {
    // Create the signing key from the WIF string
    const signingKey = ECPair.fromWIF(
      privateKey,
      getBitcoinJSNetwork(this._network, this._subnet),
    );

    utxos.forEach((output, i) => {
      const sigHash = tx.hashForWitnessV0(
        i,
        this.redeemScriptBuffer,
        output.tokens,
        Transaction.SIGHASH_ALL,
      );
      const signature = script.signature.encode(
        signingKey.sign(sigHash),
        Transaction.SIGHASH_ALL,
      );
      const witness = [
        signature,
        Buffer.from(unlock, 'hex'),
        this.redeemScriptBuffer,
      ];
      tx.setWitness(i, witness);
    });
  }
}
