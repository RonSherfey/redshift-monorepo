import { EthereumSubnet } from '@radar/redshift-types';

export interface ContractAddresses {
  etherSwap: string;
  erc20Swap: string;
}

const subnetToAddresses: { [subnet: string]: ContractAddresses } = {
  [EthereumSubnet.MAINNET]: {
    etherSwap: '0x46340430971885eFfA5757eE03356eD228258ac0',
    erc20Swap: '0x920412379dB3CbBf17b4c81F93F065115aFaCb96',
  },
  [EthereumSubnet.KOVAN_TESTNET]: {
    etherSwap: '0xd4589fB5b5ABB44e1A8cb95CfF0Ca9E0e78D9D5d',
    erc20Swap: '0xA102bB327123afc530AC122b69c0c675627f6c19',
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
