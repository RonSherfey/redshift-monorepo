import { Network } from '@radar/redshift-types';
import { EvmHtlc, StellarHtlc, UtxoHtlc } from '../network-models';
import { EVM, Stellar, UTXO } from './network-models';

/**
 * HTLC config options by network
 */
export interface Config {
  [Network.BITCOIN]: UTXO.Config;
  [Network.LITECOIN]: UTXO.Config;
  [Network.ETHEREUM]: EVM.Config;
  [Network.STELLAR]: Stellar.Config;
}

/**
 * HTLC model by network
 */
export interface NetworkModelMap<N extends Network> {
  [Network.BITCOIN]: UtxoHtlc<N>;
  [Network.LITECOIN]: UtxoHtlc<N>;
  [Network.ETHEREUM]: EvmHtlc<N>;
  [Network.STELLAR]: StellarHtlc<N>;
}

export * from './network-models';
