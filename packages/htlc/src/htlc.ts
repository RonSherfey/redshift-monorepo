import { Network, SubnetMap } from '@radar/redshift-types';
import { EvmHtlc, StellarHtlc, UtxoHtlc } from './network-models';
import { Config, EVM, NetworkModelMap, Stellar, UTXO } from './types';

/**
 * This namespace contains function(s) that simplify HTLC construction across multiple networks and network models.
 */
export namespace HTLC {
  /**
   * Construct an HTLC for the provided network & subnet.
   * @param network The on-chain network
   * @param subnet The network subnet
   * @param config Config options used to construct or interact with the HTLC
   */
  export function construct<N extends keyof NetworkModelMap<N>>(
    network: N,
    subnet: SubnetMap[N],
    config: Config[N],
  ): NetworkModelMap<N>[N] {
    switch (network) {
      case Network.ETHEREUM:
        return new EvmHtlc(network, subnet, config as EVM.Config);
      case Network.STELLAR:
        return new StellarHtlc(network, subnet, config as Stellar.Config);
      default:
        return new UtxoHtlc(network, subnet, config as UTXO.Config);
    }
  }
}
