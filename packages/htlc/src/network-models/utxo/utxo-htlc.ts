import {
  FundTxOutput,
  Network,
  SubnetMap,
  SwapError,
  TxOutput,
} from '@radar/redshift-types';
import bip65 from 'bip65';
import {
  address,
  crypto,
  ECPair,
  payments,
  Psbt,
  script,
  Transaction,
} from 'bitcoinjs-lib';
import { Output } from 'bitcoinjs-lib/types/transaction';
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
    utxos: FundTxOutput[],
    amount: number,
    privateKey: string,
    fee: number = 0,
  ): string {
    const networkPayload = getBitcoinJSNetwork(this._network, this._subnet);
    const tx = new Psbt({
      network: networkPayload,
    });

    // The signing key
    const signingKey = ECPair.fromWIF(privateKey, networkPayload);

    // Get change address
    const { address } = payments.p2wpkh({
      pubkey: signingKey.publicKey,
      network: networkPayload,
    });
    if (!address) {
      throw new Error(SwapError.EXPECTED_ADDRESS);
    }

    // Add the inputs being spent to the transaction
    utxos.forEach(utxo => {
      const { txId, index, txHex, redeemScript, witnessScript } = utxo;
      if (isDefined(txId) && isDefined(index) && isDefined(txHex)) {
        tx.addInput({
          index,
          hash: toReversedByteOrderBuffer(txId),
          sequence: 0,
          nonWitnessUtxo: Buffer.from(txHex, 'hex'),
          ...(redeemScript ? { redeemScript } : {}),
          ...(witnessScript ? { witnessScript } : {}),
        });
      }
    });

    // Total spendable amount
    const tokens = utxos.reduce((t, c) => t + Number(c.tokens), 0);

    tx.addOutputs([
      {
        address: this.details.p2shP2wshAddress, // HTLC address
        value: amount,
      },
      {
        address, // Change address
        value: tokens - amount - fee,
      },
    ]);

    // Sign the inputs
    tx.signAllInputs(signingKey);

    return tx
      .finalizeAllInputs()
      .extractTransaction()
      .toHex();
  }

  /**
   * Generate the claim transaction and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param destinationAddress The address the funds will be claimed to
   * @param currentBlockHeight The current block height on the network
   * @param feeTokensPerVirtualByte The fee per byte (satoshi/byte)
   * @param paymentSecret The payment secret
   * @param privateKey The private key WIF string
   */
  public claim(
    utxos: TxOutput[],
    destinationAddress: string,
    currentBlockHeight: number,
    feeTokensPerVirtualByte: number,
    paymentSecret: string,
    privateKey: string,
  ): string {
    return this.buildTransaction(
      utxos,
      destinationAddress,
      currentBlockHeight,
      feeTokensPerVirtualByte,
      paymentSecret,
      privateKey,
      true,
    );
  }

  /**
   * Generate the refund transaction and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param destinationAddress The address the funds will be refunded to
   * @param currentBlockHeight The current block height on the network
   * @param feeTokensPerVirtualByte The fee per byte (satoshi/byte)
   * @param privateKey The private key WIF string
   */
  public refund(
    utxos: TxOutput[],
    destinationAddress: string,
    currentBlockHeight: number,
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
      currentBlockHeight,
      feeTokensPerVirtualByte,
      publicKey.toString('hex'),
      privateKey,
    );
  }

  /**
   * Generate the refund transaction and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param destinationAddress The address the funds will be refunded to
   * @param currentBlockHeight The current block height on the network
   * @param feeTokensPerVirtualByte The fee per byte (satoshi/byte)
   * @param refundSecret The adminRefund secret used to offer instant refunds
   * @param privateKey The private key WIF string
   */
  public adminRefund(
    utxos: TxOutput[],
    destinationAddress: string,
    currentBlockHeight: number,
    feeTokensPerVirtualByte: number,
    refundSecret: string,
    privateKey: string,
  ): string {
    const { publicKey } = ECPair.fromWIF(
      privateKey,
      getBitcoinJSNetwork(this._network, this._subnet),
    );

    return this.buildTransaction(
      utxos,
      destinationAddress,
      currentBlockHeight,
      feeTokensPerVirtualByte,
      refundSecret,
      privateKey,
      false,
      publicKey.toString('hex'),
    );
  }

  /**
   * Build the transaction using the provided params and return the raw tx hex
   * @param utxos The unspent funding tx outputs
   * @param destinationAddress The address the funds will be sent to
   * @param currentBlockHeight The current block height on the network
   * @param feeTokensPerVirtualByte The fee per byte (satoshi/byte)
   * @param unlock Claim secret (preimage) or refund public key
   * @param privateKey The private key WIF string
   * @param isClaim Whether it is a claim transaction or not
   * @param adminRefundPublicKey The public key allowed to retrieve funds via adminRefund
   */
  private buildTransaction(
    utxos: TxOutput[],
    destinationAddress: string,
    currentBlockHeight: number,
    feeTokensPerVirtualByte: number,
    unlock: string,
    privateKey: string,
    isClaim?: boolean,
    adminRefundPublicKey?: string,
  ): string {
    // Create a new transaction instance
    const tx = new Transaction();

    // BIP 68 applies
    tx.version = 2;

    // Total the utxos
    const tokens = utxos.reduce((t, c) => t + Number(c.tokens), 0);

    // Add a single output containing the destination address
    tx.addOutput(
      address.toOutputScript(
        destinationAddress,
        getBitcoinJSNetwork(this._network, this._subnet),
      ),
      tokens,
    );

    tx.locktime = bip65.encode({
      blocks: currentBlockHeight,
    });

    let nSequence = 0;
    if (this._details.timelockType === UTXO.LockType.RELATIVE && !isClaim) {
      // The nSequence must be specified if a relative timelock is used and it's not a claim tx
      nSequence = this._details.timelockValue;
    }

    // Add the inputs being spent to the transaction
    this.addInputs(utxos, tx, nSequence, this.generateInputScript());

    let fee;
    // Estimate the tx fee
    if (adminRefundPublicKey) {
      fee = estimateFee(
        this.redeemScript,
        utxos,
        [unlock, adminRefundPublicKey],
        tx.weight(),
        feeTokensPerVirtualByte,
      );
    } else {
      fee = estimateFee(
        this.redeemScript,
        utxos,
        unlock,
        tx.weight(),
        feeTokensPerVirtualByte,
      );
    }

    // Exit early when the ratio of the amount spent on fees would be too high
    const dustRatio = 1 / 3; // Fee exceeds one third of tx value
    if (fee > tokens || fee / (tokens - fee) > dustRatio) {
      throw new Error(SwapError.FEES_TOO_HIGH);
    }

    // Reduce the final output value to give some tokens over to fees
    const [out] = tx.outs as Output[];
    out.value -= fee;

    // Set the signed witnesses
    if (adminRefundPublicKey) {
      this.addWitnessScripts(
        utxos,
        privateKey,
        unlock,
        tx,
        adminRefundPublicKey,
      );
    } else {
      this.addWitnessScripts(utxos, privateKey, unlock, tx);
    }

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
   * @param nSequence The nSequence number
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
   * @param adminRefundPublicKey The public key allowed to retrieve funds via adminRefund
   */
  private addWitnessScripts(
    utxos: TxOutput[],
    privateKey: string,
    unlock: string,
    tx: Transaction,
    adminRefundPublicKey?: string,
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
        Number(output.tokens),
        Transaction.SIGHASH_ALL,
      );
      const signature = script.signature.encode(
        signingKey.sign(sigHash),
        Transaction.SIGHASH_ALL,
      );

      let witness;
      // if we are adminRefunding, we need another item on the stack
      if (adminRefundPublicKey) {
        witness = [
          signature,
          Buffer.from(adminRefundPublicKey, 'hex'),
          Buffer.from(unlock, 'hex'),
          this.redeemScriptBuffer,
        ];
      } else {
        witness = [
          signature,
          Buffer.from(unlock, 'hex'),
          this.redeemScriptBuffer,
        ];
      }
      tx.setWitness(i, witness);
    });
  }
}
