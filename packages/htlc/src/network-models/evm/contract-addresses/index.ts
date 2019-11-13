import { EthereumSubnet } from '@radar/redshift-types';

export interface ContractAddresses {
  etherSwap: string;
  erc20Swap: string;
}

const subnetToAddresses: { [subnet: string]: ContractAddresses } = {
  [EthereumSubnet.MAINNET]: {
    etherSwap: '0x46340430971885eFfA5757eE03356eD228258ac0',
    erc20Swap: '0x06dedDf1BAE98256a3CD5e8434022E1863E6cfD6',
  },
  [EthereumSubnet.KOVAN_TESTNET]: {
    etherSwap: '0xd4589fB5b5ABB44e1A8cb95CfF0Ca9E0e78D9D5d',
    erc20Swap: '0x99ae80f430462f05F7CcaB5468942D33E4FE12db',
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
