import { EvmHtlc, UtxoHtlc } from '..';
import {
  BitcoinSubnet,
  EthereumSubnet,
  LitecoinSubnet,
  Network,
} from './constants';
import { EVM, UTXO } from './network-models';

/**
 * HTLC options by network
 */
export interface Options {
  [Network.BITCOIN]: UTXO.Options;
  [Network.LITECOIN]: UTXO.Options;
  [Network.ETHEREUM]: EVM.Options;
}

/**
 * Subnet by network
 */
export interface SubnetMap {
  [Network.BITCOIN]: BitcoinSubnet;
  [Network.LITECOIN]: LitecoinSubnet;
  [Network.ETHEREUM]: EthereumSubnet;
}

/**
 * HTLC model by network
 */
export interface NetworkModelMap<N extends Network> {
  [Network.BITCOIN]: UtxoHtlc<N>;
  [Network.LITECOIN]: UtxoHtlc<N>;
  [Network.ETHEREUM]: EvmHtlc<N>;
}
