import bip65 from 'bip65';
import { isString } from 'util';
import {
  address,
  crypto,
  ECPair,
  payments,
  script,
  Transaction,
  TransactionBuilder,
} from '../../overrides/bitcoinjs-lib';
import { Network, SubnetMap, SwapError, TxOutput, UTXO } from '../../types';
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
   * @param options The redeem script or htlc creation options
   */
  constructor(network: N, subnet: SubnetMap[N], options: UTXO.Options) {
    super(network, subnet);
    this._redeemScript = isString(options)
      ? options
      : createSwapRedeemScript(options);
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
  ): string {
    const networkPayload = getBitcoinJSNetwork(this._network, this._subnet);
    const tx = new TransactionBuilder(networkPayload);

    // The signing key
    const signingKey = ECPair.fromWIF(privateKey, networkPayload);

    // Generate prev output script
    const { output, address } = payments.p2wpkh({
      pubkey: signingKey.publicKey,
      network: networkPayload,
    });

    // Add the inputs being spent to the transaction
    utxos.forEach(utxo => {
      if (isDefined(utxo.tx_id) && isDefined(utxo.index)) {
        tx.addInput(
          toReversedByteOrderBuffer(utxo.tx_id),
          utxo.index,
          0,
          output,
        );
      }
    });

    // Total spendable amount
    const tokens = utxos.reduce((t, c) => t + c.tokens, 0);

    tx.addOutput(this.details.p2sh_p2wsh_address, amount);
    tx.addOutput(address, tokens - amount - fee);

    // Sign the inputs
    utxos.forEach((output, i) => {
      tx.sign(i, signingKey, undefined, undefined, output.tokens);
    });

    return tx.build().toHex();
  }

  /**
   * Generate the claim transaction and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param destinationAddress The claim destination address
   * @param currentBlockHeight The current block height on the network
   * @param feeTokensPerVirtualByte The fee per byte (satoshi/byte)
   * @param privateKey The private key WIF string
   * @param paymentSecret The payment secret
   */
  public claim(
    utxos: TxOutput[],
    destinationAddress: string,
    currentBlockHeight: number,
    feeTokensPerVirtualByte: number,
    privateKey: string,
    paymentSecret: string,
  ): string {
    return this.buildTransaction(
      utxos,
      destinationAddress,
      currentBlockHeight,
      feeTokensPerVirtualByte,
      privateKey,
      paymentSecret,
    );
  }

  /**
   * Generate the refund transaction and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param destinationAddress The refund destination address
   * @param currentBlockHeight The current block height on the network
   * @param feeTokensPerVirtualByte The fee per byte (satoshi/byte)
   * @param privateKey The private key WIF string
   * @param publicKey The public key corresponding to the provided public key hash
   */
  public refund(
    utxos: TxOutput[],
    destinationAddress: string,
    currentBlockHeight: number,
    feeTokensPerVirtualByte: number,
    privateKey: string,
    publicKey: string,
  ): string {
    return this.buildTransaction(
      utxos,
      destinationAddress,
      currentBlockHeight,
      feeTokensPerVirtualByte,
      privateKey,
      publicKey,
    );
  }

  /**
   * Build the transaction using the provided params and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param destinationAddress The destination address of the transaction
   * @param currentBlockHeight The current block height on the network
   * @param feeTokensPerVirtualByte The fee per byte (satoshi/byte)
   * @param privateKey The private key WIF string
   * @param unlock Claim secret (preimage) or refund public key
   */
  private buildTransaction(
    utxos: TxOutput[],
    destinationAddress: string,
    currentBlockHeight: number,
    feeTokensPerVirtualByte: number,
    privateKey: string,
    unlock: string,
  ): string {
    // Create a new transaction instance
    const tx = new Transaction();

    // Total the utxos
    const tokens = utxos.reduce((t, c) => t + c.tokens, 0);

    // Add output containing the destination public key
    tx.addOutput(
      address.toOutputScript(
        destinationAddress,
        getBitcoinJSNetwork(this._network, this._subnet),
      ),
      tokens,
    );

    // Set transaction locktime
    tx.locktime = bip65.encode({
      blocks: currentBlockHeight,
    });

    // Add the inputs being spent to the transaction
    this.addInputs(utxos, tx, this.generateInputScript());

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
      throw new Error(SwapError.FEES_TOO_HIGH_TO_CLAIM);
    }

    // Reduce the final output value to give some tokens over to fees
    const [out] = tx.outs;
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
