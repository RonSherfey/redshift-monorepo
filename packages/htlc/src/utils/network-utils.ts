import {
  BitcoinSubnet,
  DecredSubnet,
  EthereumSubnet,
  LitecoinSubnet,
  Network,
  NetworkError,
  StellarSubnet,
} from '../types';

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
    case Network.DECRED:
      return DecredSubnet;
    default:
      throw new Error(NetworkError.INVALID_NETWORK);
  }
}
