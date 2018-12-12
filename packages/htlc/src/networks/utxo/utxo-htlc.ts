import { isString } from 'util';
import {
  address,
  crypto,
  ECPair,
  networks,
  script,
  Transaction,
  TransactionBuilder,
} from '../../overrides/bitcoinjs-lib';
import {
  ConditionalSubnet,
  Network,
  SwapError,
  TxOutput,
  UtxoHtlcOptions,
  UtxoSwapDetails,
} from '../../types';
import { Htlc } from '../shared';
import {
  createSwapRedeemScript,
  estimateFee,
  getSwapRedeemScriptDetails,
  toReversedByteOrderBuffer,
} from './utils';

export class UtxoHtlc<N extends Network> extends Htlc<N> {
  private _redeemScript: string;
  private _htlcDetails: UtxoSwapDetails;

  get redeemScript(): string {
    return this._redeemScript;
  }

  get redeemScriptBuffer(): Buffer {
    return Buffer.from(this.redeemScript, 'hex');
  }

  get htlcDetails(): UtxoSwapDetails {
    return this._htlcDetails;
  }

  /**
   * Create a new UTXO HTLC instance
   * @param network The chain network
   * @param subnet The chain subnet
   * @param scriptArgs The redeem script or htlc creation options
   */
  constructor(
    network: N,
    subnet: ConditionalSubnet<N>,
    scriptArgs: UtxoHtlcOptions,
  ) {
    super(network, subnet);
    this._redeemScript = isString(scriptArgs)
      ? scriptArgs
      : createSwapRedeemScript(scriptArgs);
    this._htlcDetails = getSwapRedeemScriptDetails(
      this._network,
      this._subnet,
      this._redeemScript,
    );
  }

  /**
   * Generate the funding transaction and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param amount The funding amount in satoshis
   * @param privateKey The private key WIF string
   */
  public fund(utxos: TxOutput[], amount: number, privateKey: string): string {
    const tx = new TransactionBuilder();

    // Add the inputs being spent to the transaction
    utxos.forEach(utxo => {
      tx.addInput(toReversedByteOrderBuffer(utxo.tx_id), utxo.index, 0);
    });

    // Add output containing the p2sh address
    tx.addOutput(this.htlcDetails.p2sh_p2wsh_address, amount);

    // The signing key
    const signingKey = ECPair.fromWIF(
      privateKey,
      networks[this._subnet as any],
    );

    // Sign the inputs
    utxos.forEach((_output, i) => {
      tx.sign(i, signingKey);
    });

    return tx.build().toHex();
  }

  /**
   * Generate the claim transaction and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param recipientPublicKey The recipient's public key
   * @param currentBlockHeight The current block height on the network
   * @param feeTokensPerVirtualByte The fee per byte (satoshi/byte)
   * @param paymentSecret The payment secret
   * @param privateKey The private key WIF string
   */
  public claim(
    utxos: TxOutput[],
    recipientPublicKey: string,
    currentBlockHeight: number,
    feeTokensPerVirtualByte: number,
    paymentSecret: string,
    privateKey: string,
  ): string {
    return this.buildTransaction(
      utxos,
      recipientPublicKey,
      currentBlockHeight,
      feeTokensPerVirtualByte,
      paymentSecret,
      privateKey,
    );
  }

  /**
   * Generate the refund transaction and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param recipientPublicKey The recipient's public key
   * @param currentBlockHeight The current block height on the network
   * @param feeTokensPerVirtualByte The fee per byte (satoshi/byte)
   * @param paymentSecret The payment secret
   * @param privateKey The private key WIF string
   */
  public refund(
    utxos: TxOutput[],
    recipientPublicKeyHash: string,
    currentBlockHeight: number,
    feeTokensPerVirtualByte: number,
    paymentSecret: string,
    privateKey: string,
  ): string {
    // The refund tx recipient
    const recipientOutputPubKey = address.toOutputScript(
      recipientPublicKeyHash,
      networks[this._subnet as any],
    );

    return this.buildTransaction(
      utxos,
      recipientOutputPubKey,
      currentBlockHeight,
      feeTokensPerVirtualByte,
      paymentSecret,
      privateKey,
    );
  }

  /**
   * Build the transaction using the provided params and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param recipientPublicKey The recipient's public key
   * @param currentBlockHeight The current block height on the network
   * @param feeTokensPerVirtualByte The fee per byte (satoshi/byte)
   * @param paymentSecret The payment secret
   * @param privateKey The private key WIF string
   */
  private buildTransaction(
    utxos: TxOutput[],
    recipientPublicKey: string | Buffer,
    currentBlockHeight: number,
    feeTokensPerVirtualByte: number,
    paymentSecret: string,
    privateKey: string,
  ): string {
    // Create a new transaction instance
    const tx = new Transaction();

    // Total the utxos
    const tokens = utxos.reduce((t, c) => t + c.tokens, 0);

    // Add output containing the recipient public key
    tx.addOutput(recipientPublicKey, tokens);

    // Set transaction locktime
    tx.locktime = currentBlockHeight;

    // Add the inputs being spent to the transaction
    this.addInputs(utxos, tx, this.generateInputScript());

    // Estimate the tx fee
    const fee = estimateFee(
      this.redeemScript,
      utxos,
      paymentSecret,
      tx.weight(),
      feeTokensPerVirtualByte,
    );

    // Exit early when the ratio of the amount spent on fees would be too high
    const dustRatio = 1 / 3; // Fee exceeds one third of tx value
    if (fee > tokens || fee / (tokens - fee) > dustRatio) {
      throw new Error(SwapError.FEES_TOO_HIGH_TO_CLAIM);
    }

    // Reduce the final output value to give some tokens over to fees
    const [out] = tx.outs;
    out.value -= fee;

    // Set the signed witnesses
    this.addWitnessScripts(utxos, privateKey, paymentSecret, tx);

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
  private addInputs(utxos: TxOutput[], tx: Transaction, inputScript?: Buffer) {
    // Add Inputs
    utxos.forEach(utxo => {
      tx.addInput(
        toReversedByteOrderBuffer(utxo.tx_id),
        utxo.index,
        0,
        inputScript,
      );
    });
  }

  /**
   * Add witness scripts. hashForWitnessV0 must be called after all inputs
   * have been added. Otherwise, you'll end up with a different sig hash.
   * @param utxos The utxos we're spending
   * @param privateKey The private key WIF string
   * @param tx The tx instance
   */
  private addWitnessScripts(
    utxos: TxOutput[],
    privateKey: string,
    paymentSecret: string,
    tx: Transaction,
  ) {
    // Create the signing key from the WIF string
    const signingKey = ECPair.fromWIF(
      privateKey,
      networks[this._subnet as any],
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
        Buffer.from(paymentSecret, 'hex'),
        this.redeemScriptBuffer,
      ];
      tx.setWitness(i, witness);
    });
  }
}
