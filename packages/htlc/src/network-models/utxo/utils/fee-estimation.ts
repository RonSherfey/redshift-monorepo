import { TxOutput, WeightEstimationError } from '@radar/redshift-types';
import { isArray, isDefined } from '../../../utils';

const shortPushdataLength = 1;
const ecdsaSignatureLength = 72; // ECDSA Signature Max Byte Length
const sequenceLength = 4; // Sequence Number Byte Length

/**
 * Estimate the weight of a transaction after signed SegWit inputs are added
 * @param unlock Claim secret (preimage) or refund public key
 * @param utxos The funding utxos
 * @param weight Weight Without Signed Inputs Number
 * @param redeem The redeem script buffer
 */
export function estimateWeightWithInputs(
  unlock: string,
  utxos: TxOutput[],
  weight: number,
  redeem: Buffer,
) {
  if (!isDefined(unlock)) {
    throw new Error(WeightEstimationError.EXPECTED_UNLOCK_ELEMENT);
  }

  if (!isArray(utxos)) {
    throw new Error(WeightEstimationError.EXPECTED_UTXOS);
  }

  if (!weight) {
    throw new Error(WeightEstimationError.EXPECTED_UNSIGNED_TX_WEIGHT);
  }

  return utxos.reduce(sum => {
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
}

/**
 * Estimate the transaction fee for a specific tx using target fee
 * per kilobyte of the passed network and the transaction's weight
 * @param swap The swap stored in Redis
 * @param unlock Claim Preimage, Refund Pubkey, Dummy Preimage Hex String
 * @param txWeight The transaction's weight in weight units
 * @param daemon The target daemon. Different daemon's can support different RPC methods
 */
export function estimateFee(
  redeemScript: string,
  utxos: TxOutput[],
  unlock: string,
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
