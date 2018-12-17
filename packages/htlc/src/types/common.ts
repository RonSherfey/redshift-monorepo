import { EvmHtlc, UtxoHtlc } from '..';
import { StellarHtlc } from '../network-models/index';
import {
  BitcoinSubnet,
  EthereumSubnet,
  LitecoinSubnet,
  Network,
  StellarSubnet,
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
  [Network.STELLAR]: StellarSubnet;
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
