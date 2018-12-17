import { EthereumSubnet } from '../../../types';

export interface ContractAddresses {
  etherSwap: string;
  erc20Swap: string;
}

const subnetToAddresses: { [subnet: string]: ContractAddresses } = {
  [EthereumSubnet.KOVAN]: {
    etherSwap: '0x5AEB1ce106a82ebB205707053eAB17a3B88Be8FC',
    erc20Swap: '0x7915411b93C4db6272a66fC3b67965B0de29cB70',
  },
  [EthereumSubnet.GANACHE]: {
    etherSwap: '0xf0398fad8c2aa38c476b010c269158d442730e98',
    erc20Swap: '0x85a43913f2d14c045c630206db83510a677fad1d',
  },
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
      `Unknown network subnet (${subnet}). No known swap contracts have been deployed on this network.`,
    );
  }
  return subnetToAddresses[subnet];
}
