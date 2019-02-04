import {
  EVM,
  Network,
  Stellar,
  SubnetMap,
  UTXO,
} from '@radartech/redshift-types';
import { EvmHtlc, StellarHtlc, UtxoHtlc } from './network-models';
import { NetworkModelMap, Options } from './types';

/**
 * This namespace contains function(s) that simplify HTLC construction across multiple networks and network models.
 */
export namespace HTLC {
  /**
   * Construct an HTLC for the provided network & subnet.
   * @param network The on-chain network
   * @param subnet The network subnet
   * @param options Options used to construct or interact with the HTLC
   */
  export function construct<N extends keyof NetworkModelMap<N>>(
    network: N,
    subnet: SubnetMap[N],
    options: Options[N],
  ): NetworkModelMap<N>[N] {
    switch (network) {
      case Network.ETHEREUM:
        return new EvmHtlc(network, subnet, options as EVM.Options);
      case Network.STELLAR:
        return new StellarHtlc(network, subnet, options as Stellar.Options);
      default:
        return new UtxoHtlc(network, subnet, options as UTXO.Options);
    }
  }
}
