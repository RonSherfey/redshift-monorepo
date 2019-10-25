import { MetaMaskError, Provider, RawMetaMaskError } from '@/types';
import {
  EvmUnsignedTx,
  OnChainTicker,
  PartialEvmTxParams,
} from '@radar/redshift-types';
import { getEthChainIdForTicker } from './utils';

export const metamask = {
  provider: undefined as undefined | Provider,

  /**
   * Attempt to establish a connection to MetaMask and return the provider
   */
  async connectAndFetchProvider(): Promise<Provider> {
    if (window.ethereum || window.web3) {
      try {
        // Request account access if needed
        const address = await window.ethereum.enable();
        if (!address) {
          // Temporary fix for https://github.com/MetaMask/metamask-extension/issues/6631
          throw new Error(MetaMaskError.METAMASK_ACCESS_DENIED);
        }
      } catch (error) {
        // User denied account access
        throw new Error(MetaMaskError.METAMASK_ACCESS_DENIED);
      }
      return window.web3.currentProvider;
    }
    throw new Error(MetaMaskError.METAMASK_NOT_FOUND);
  },

  /**
   * Attempt to establish a connection to MetaMask and return the active address
   */
  async connectAndFetchAddress(): Promise<string> {
    if (window.ethereum || window.web3) {
      try {
        // Request account access if needed
        const [address] = (await window.ethereum.enable()) || [''];
        if (!address) {
          // Temporary fix for https://github.com/MetaMask/metamask-extension/issues/6631
          throw new Error(MetaMaskError.METAMASK_ACCESS_DENIED);
        }
        return address;
      } catch (error) {
        // User denied account access
        throw new Error(MetaMaskError.METAMASK_ACCESS_DENIED);
      }
    }
    throw new Error(MetaMaskError.METAMASK_NOT_FOUND);
  },

  /**
   * Determine if MetaMask has a cached approval
   */
  async isApproved(): Promise<boolean> {
    return window.ethereum && window.ethereum._metamask.isApproved();
  },

  /**
   * Determine if the user is on the correct subnet
   * @param ticker The ticker
   */
  isSubnetCorrect(ticker: OnChainTicker): boolean {
    if (ticker === OnChainTicker.SETH) return true; // Simnet isn't locked to a single chain id
    const chainId = getEthChainIdForTicker(ticker);
    return window.ethereum && window.ethereum.networkVersion === chainId;
  },

  /**
   * Do not refresh the page when the MetaMask network is changed
   */
  disableNetworkChangeRefresh() {
    if (window.ethereum) {
      window.ethereum.autoRefreshOnNetworkChange = false;
    }
  },

  /**
   * Sign the provided transaction and broadcast it with MetaMask
   */
  async sendTransaction(tx: EvmUnsignedTx & PartialEvmTxParams) {
    if (!this.provider) {
      this.provider = await this.connectAndFetchProvider();
    }
    return new Promise((resolve, reject) => {
      this.provider.sendAsync(
        {
          method: 'eth_sendTransaction',
          params: [tx],
        },
        (_, response) => {
          if (!response.error) {
            return resolve(response.result);
          }
          reject(this.parseError(response.error));
        },
      );
    });
  },

  /**
   * Parse raw MetaMask errors
   * @param error The raw MetaMask error
   */
  parseError(error: RawMetaMaskError) {
    const signDeniedError = 'User denied transaction signature';
    const message = (error && error.message) || '';
    const stack = (error && error.stack) || '';
    if (message.includes(signDeniedError) || stack.includes(signDeniedError)) {
      return new Error(MetaMaskError.TX_SIGN_DENIED);
    }
    return new Error(MetaMaskError.UNKNOWN_ERROR);
  },
};
