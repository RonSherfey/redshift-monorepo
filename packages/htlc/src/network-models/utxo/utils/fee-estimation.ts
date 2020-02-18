import { TxOutput, WeightEstimationError } from '@radar/redshift-types';
import { isArray, isDefined } from '../../../utils';

const shortPushdataLength = 1;
const ecdsaSignatureLength = 72; // ECDSA Signature Max Byte Length
const sequenceLength = 4; // Sequence Number Byte Length

/**
 * Estimate the weight of a transaction after signed SegWit inputs are added
 * @param unlock Claim secret (preimage) OR refund public key OR refund public key AND refund secret
 * @param utxos The funding utxos
 * @param weight Weight Without Signed Inputs Number
 * @param redeem The redeem script buffer
 */
export function estimateWeightWithInputs(
  unlock: string | [string, string] | undefined,
  utxos: TxOutput[],
  weight: number,
  redeem: Buffer,
): number {
  // if (!isDefined(unlock)) {
  //   throw new Error(WeightEstimationError.EXPECTED_UNLOCK_ELEMENT);
  // }

  if (!isArray(utxos)) {
    throw new Error(WeightEstimationError.EXPECTED_UTXOS);
  }

  if (!weight) {
    throw new Error(WeightEstimationError.EXPECTED_UNSIGNED_TX_WEIGHT);
  }

  let feeEstimation: number;
  // if adminRefund, unlock is an array of the publicKey and refundSecret
  if (Array.isArray(unlock)) {
    const [refundSecret, publicKey] = unlock;
    feeEstimation = utxos.reduce(sum => {
      return [
        shortPushdataLength,
        ecdsaSignatureLength,
        shortPushdataLength,
        Buffer.from(publicKey, 'hex').length,
        shortPushdataLength,
        Buffer.from(refundSecret, 'hex').length,
        sequenceLength,
        redeem.length,
        sum,
      ].reduce((sum, n) => sum + n);
    }, weight);
  } else if (unlock) {
    feeEstimation = utxos.reduce(sum => {
      return [
        shortPushdataLength,
        ecdsaSignatureLength,
        !!unlock ? shortPushdataLength : [].length,
        Buffer.from(unlock, 'hex').length,
        sequenceLength,
        redeem.length,
        sum,
      ].reduce((sum, n) => sum + n);
    }, weight);
  } else {
    feeEstimation = utxos.reduce(sum => {
      return [
        shortPushdataLength,
        ecdsaSignatureLength,
        sequenceLength,
        redeem.length,
        sum,
      ].reduce((sum, n) => sum + n);
    }, weight);
  }

  return feeEstimation;
}

/**
 * Estimate the transaction fee for a specific tx using target fee
 * per kilobyte of the passed network and the transaction's weight
 * @param swap The swap stored in Redis
 * @param unlock Claim secret (preimage) OR refund public key OR refund public key AND refund secret
 * @param txWeight The transaction's weight in weight units
 * @param daemon The target daemon. Different daemon's can support different RPC methods
 */
export function estimateFee(
  redeemScript: string,
  utxos: TxOutput[],
  unlock: string | [string, string] | undefined,
  txWeight: number,
  feeTokensPerVirtualByte: number,
) {
  // Guess at the final weight of the transaction for fee/vbyte calculation
  const anticipatedWeight = estimateWeightWithInputs(
    unlock,
    utxos,
    txWeight,
    Buffer.from(redeemScript, 'hex'),
  );

  const vRatio = 4; // A witness byte weighs one weight unit; compared to four non-witness weight units.
  return feeTokensPerVirtualByte * Math.ceil(anticipatedWeight / vRatio);
}
