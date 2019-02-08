import { Network, SubnetMap, UtxoNetwork } from '@radartech/redshift-types';

/**
 * Get bitcoinjs-lib network, which includes address and message prefixes
 * @param network The network
 * @param subnet The network's subnet
 */
export function getBitcoinJSNetwork<N extends Network>(
  network: N,
  subnet: SubnetMap[N],
) {
  return UtxoNetwork[`${network}_${subnet}`];
}
