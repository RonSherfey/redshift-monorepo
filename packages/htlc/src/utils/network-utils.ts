import {
  BitcoinSubnet,
  EthereumSubnet,
  LitecoinSubnet,
  Network,
  NetworkError,
  StellarSubnet,
} from '@radar/redshift-types';

/**
 * Get the subnets for a specific network
 * @param network The network
 */
export function getSubnetForNetwork(network: Network) {
  switch (network) {
    case Network.BITCOIN:
      return BitcoinSubnet;
    case Network.ETHEREUM:
      return EthereumSubnet;
    case Network.LITECOIN:
      return LitecoinSubnet;
    case Network.STELLAR:
      return StellarSubnet;
    default:
      throw new Error(NetworkError.INVALID_NETWORK);
  }
}
