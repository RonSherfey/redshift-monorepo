import { Network } from '@radar/redshift-types';
import { UTXO } from '../../../types';

export const isRefundPublicKeyRedeemScript = (
  details: any,
): details is UTXO.DetailsPublicKey<Network> => {
  return !!(details as UTXO.DetailsPublicKey<Network>).refundPublicKey;
};

export const isRefundPublicKeyHashRedeemScript = (
  details: any,
): details is UTXO.DetailsPublicKeyHash<Network> => {
  return !!(details as UTXO.DetailsPublicKeyHash<Network>).refundPublicKeyHash;
};
