import {
  Market,
  RefundDetailsResponse,
  UserSwapState,
} from '@radar/redshift.js';

///#region Globals

declare global {
  interface Window {
    ethereum: {
      enable: () => Promise<[string]>;
      _metamask: {
        isApproved: () => Promise<boolean>;
      };
      selectedAddress: string;
      networkVersion: string;
      autoRefreshOnNetworkChange: boolean;
    };
    web3: {
      currentProvider: Provider;
    };
  }
}

//#endregion

//#region Ethereum

export enum MetaMaskError {
  METAMASK_NOT_FOUND = 'METAMASK_NOT_FOUND',
  METAMASK_ACCESS_DENIED = 'METAMASK_ACCESS_DENIED',
  TX_SIGN_DENIED = 'TX_SIGN_DENIED',
  WRONG_NETWORK = 'WRONG_NETWORK',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface RawMetaMaskError {
  message: string;
  stack: string;
}

export interface Provider {
  sendAsync(
    payload: any,
    cb: (_: null, response: { result?: any; error: RawMetaMaskError }) => void,
  ): void;
}

//#endregion

//#region Swap

export interface SwapFormFields {
  invoice: string;
  market: Market;
  refundAddress?: string;
}

export interface Progress {
  percent: number;
  status: 'success' | 'exception' | 'active';
}

export interface SwapDetails {
  state: UserSwapState;
  progress: Progress;
  preimage?: string | undefined;
}

export interface RefundDetails {
  state: UserSwapState;
  progress: Progress;
  details: RefundDetailsResponse;
}

//#endregion
