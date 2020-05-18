import { EthereumSubnet, EvmChainId } from '@radar/redshift-types';

export interface ContractAddresses {
  etherSwap: string;
  erc20Swap: string;
}

const subnetToAddresses: { [subnet: string]: ContractAddresses } = {
  [EthereumSubnet.MAINNET]: {
    etherSwap: '0x2de4ffCFc958395348a8b3F90f48a3BeeaC83Af2',
    erc20Swap: '0x92a705c983CFaCC40B709CbCfc2B925Dc6B66316',
  },
  [EthereumSubnet.KOVAN_TESTNET]: {
    etherSwap: '0x3328f84d5Aa084a64f4f703241683E95203aD401',
    erc20Swap: '0xA681C77e657f3d54E1c16D4749920ACe50Dc93E4',
  },
  [EthereumSubnet.GANACHE_SIMNET]: {
    etherSwap: '0x5315e44798395d4a952530d131249fE00f554565',
    erc20Swap: '0xda54ecF5A234D6CD85Ce93A955860834aCA75878',
  },
};

const chainIdToSubnet: { [chainId: number]: EthereumSubnet } = {
  [EvmChainId.Mainnet]: EthereumSubnet.MAINNET,
  [EvmChainId.Kovan]: EthereumSubnet.KOVAN_TESTNET,
  [EvmChainId.Ganache]: EthereumSubnet.GANACHE_SIMNET,
};

/**
 * Used to get addresses of contracts that have been deployed to either the
 * Ethereum mainnet or a supported testnet. Throws if there are no known
 * contracts deployed on the corresponding subnet.
 * @param subnet The desired subnet.
 * @returns The set of addresses for contracts which have been deployed on the
 * given subnet.
 */
export function getContractAddressesForSubnetOrThrow(
  subnet: EthereumSubnet,
): ContractAddresses {
  if (!subnetToAddresses[subnet]) {
    throw new Error(
      `Unknown network subnet (${subnet}). No known redshift contracts have been deployed on this network.`,
    );
  }
  return subnetToAddresses[subnet];
}

/**
 * Used to get addresses of contracts that have been deployed to either the
 * Ethereum mainnet or a supported testnet. Throws if there are no known
 * contracts deployed on the corresponding chain.
 * @param chainId The desired chainId.
 * @returns The set of addresses for contracts which have been deployed on the
 * given chainId.
 */
export function getContractAddressesForChainOrThrow(
  chainId: EvmChainId,
): ContractAddresses {
  if (!subnetToAddresses[chainIdToSubnet[chainId]]) {
    throw new Error(
      `Unknown chain id (${chainId}). No known redshift contracts have been deployed on this chain.`,
    );
  }
  return subnetToAddresses[chainIdToSubnet[chainId]];
}
