import {
  BitcoinSubnet,
  EthereumSubnet,
  LitecoinSubnet,
  Network,
  StellarSubnet,
} from './constants';

/**
 * Subnet by network
 */
export interface SubnetMap {
  [Network.BITCOIN]: BitcoinSubnet;
  [Network.LITECOIN]: LitecoinSubnet;
  [Network.ETHEREUM]: EthereumSubnet;
  [Network.STELLAR]: StellarSubnet;
}
