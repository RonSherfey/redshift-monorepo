import { KnownKeys, ValueOf } from '../lib';

// tslint:disable:variable-name

/**
 * Bitcoin simnet, testnet, & mainnet
 */
export enum BitcoinSubnet {
  SIMNET = 'simnet',
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}

/**
 * Litecoin testnet & mainnet
 */
export enum LitecoinSubnet {
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}

/**
 * Ethereum private chain, testnet, & mainnet
 */
export enum EthereumSubnet {
  GANACHE_SIMNET = 'ganache_simnet',
  KOVAN_TESTNET = 'kovan_testnet',
  MAINNET = 'mainnet',
}

export enum StellarSubnet {
  ZULUCRYPTO_SIMNET = 'zulucrypto_simnet',
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
  CUSTOM = 'custom',
}

/**
 * Supported networks
 */
export enum Network {
  BITCOIN = 'bitcoin',
  LITECOIN = 'litecoin',
  ETHEREUM = 'ethereum',
  STELLAR = 'stellar',
}

/**
 * Supported network subnets
 */
export const Subnet = {
  ...BitcoinSubnet,
  ...LitecoinSubnet,
  ...EthereumSubnet,
  ...StellarSubnet,
};
export type Subnet = ValueOf<Pick<typeof Subnet, KnownKeys<typeof Subnet>>>;
