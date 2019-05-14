import { EthereumSubnet } from '@radar/redshift-types';

export interface ContractAddresses {
  etherSwap: string;
  erc20Swap: string;
}

const subnetToAddresses: { [subnet: string]: ContractAddresses } = {
  [EthereumSubnet.KOVAN_TESTNET]: {
    etherSwap: '0x5F4200bB489318C0Ea7A59FBE2241dF0FB1C8f8B',
    erc20Swap: '0xdcE79992251CD3646DCDC69F9B55D14d0eEFd997',
  },
  [EthereumSubnet.GANACHE_SIMNET]: {
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
