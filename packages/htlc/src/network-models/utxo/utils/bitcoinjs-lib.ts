import { Network, SubnetMap } from '@radartech/redshift-types';
import { networks } from '../../../overrides/bitcoinjs-lib';

/**
 * Get bitcoinjs-lib network, which includes address and message prefixes
 * @param network The network
 * @param subnet The network's subnet
 */
export function getBitcoinJSNetwork<N extends Network>(
  network: N,
  subnet: SubnetMap[N],
) {
  return networks[`${network}_${subnet}`];
}
