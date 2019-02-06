import { Network } from '@radartech/redshift-types';
import { EvmHtlc, StellarHtlc, UtxoHtlc } from '../network-models';
import { EVM, Stellar, UTXO } from './network-models';

/**
 * HTLC options by network
 */
export interface Options {
  [Network.BITCOIN]: UTXO.Options;
  [Network.LITECOIN]: UTXO.Options;
  [Network.ETHEREUM]: EVM.Options;
  [Network.STELLAR]: Stellar.Options;
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
