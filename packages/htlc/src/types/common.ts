import { EvmHtlc, UtxoHtlc } from '..';
import { DecredHtlc, StellarHtlc } from '../network-models/index';
import {
  BitcoinSubnet,
  DecredSubnet,
  EthereumSubnet,
  LitecoinSubnet,
  Network,
  StellarSubnet,
} from './constants';
import { Decred, EVM, Stellar, UTXO } from './network-models';

/**
 * HTLC options by network
 */
export interface Options {
  [Network.BITCOIN]: UTXO.Options;
  [Network.LITECOIN]: UTXO.Options;
  [Network.ETHEREUM]: EVM.Options;
  [Network.STELLAR]: Stellar.Options;
  [Network.DECRED]: Decred.Options;
}

/**
 * Subnet by network
 */
export interface SubnetMap {
  [Network.BITCOIN]: BitcoinSubnet;
  [Network.LITECOIN]: LitecoinSubnet;
  [Network.ETHEREUM]: EthereumSubnet;
  [Network.STELLAR]: StellarSubnet;
  [Network.DECRED]: DecredSubnet;
}

/**
 * HTLC model by network
 */
export interface NetworkModelMap<N extends Network> {
  [Network.BITCOIN]: UtxoHtlc<N>;
  [Network.LITECOIN]: UtxoHtlc<N>;
  [Network.ETHEREUM]: EvmHtlc<N>;
  [Network.STELLAR]: StellarHtlc<N>;
  [Network.DECRED]: DecredHtlc<N>;
}
