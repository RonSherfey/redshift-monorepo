import { KnownKeys, ValueOf } from '../lib';

// tslint:disable:variable-name

/**
 * Bitcoin simnet, testnet, & mainnet
 */
export enum BitcoinSubnet {
  SIMNET = 'simnet',
  TESTNET = 'testnet',
  BITCOIN = 'bitcoin',
}

/**
 * Litecoin testnet & mainnet
 */
export enum LitecoinSubnet {
  LTCTESTNET = 'ltctestnet',
  LITECOIN = 'litecoin',
}

/**
 * Ethereum private chain, testnet, & mainnet
 */
export enum EthereumSubnet {
  GANACHE = 'ganache',
  KOVAN = 'kovan',
  MAINNET = 'mainnet',
}

/**
 * Supported networks
 */
export enum Network {
  BITCOIN = 'bitcoin',
  LITECOIN = 'litecoin',
  ETHEREUM = 'ethereum',
}

/**
 * Supported network subnets
 */
export const Subnet = {
  ...BitcoinSubnet,
  ...LitecoinSubnet,
  ...EthereumSubnet,
};
export type Subnet = ValueOf<Pick<typeof Subnet, KnownKeys<typeof Subnet>>>;

/**
 * Returns the subnet enum for the provided network
 */
export interface SubnetMap {
  [Network.BITCOIN]: BitcoinSubnet;
  [Network.LITECOIN]: LitecoinSubnet;
  [Network.ETHEREUM]: EthereumSubnet;
}
