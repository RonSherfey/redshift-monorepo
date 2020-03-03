import { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers';
import { ERC20SwapContract, EtherSwapContract } from './contracts';

export namespace EVM {
  export enum AssetType {
    ETHER = 'ether',
    ERC20 = 'erc20',
  }

  interface SharedConfig {
    orderUUID: string;
    assetType: AssetType;
    provider?: Provider;
  }

  export interface EtherConfig extends SharedConfig {
    assetType: AssetType.ETHER;
  }

  export interface ERC20Config extends SharedConfig {
    assetType: AssetType.ERC20;
    tokenContractAddress: string;
  }

  export type Config = EtherConfig | ERC20Config;

  export interface FundDetails {
    amount: string;
    paymentHash: string;
  }

  export interface FundDetailsWithAdminRefundEnabled extends FundDetails {
    refundHash: string;
  }
}

export type SwapContract<C extends EVM.Config> = C extends EVM.ERC20Config
  ? ERC20SwapContract
  : EtherSwapContract;

export declare class Provider {
  send(
    payload: JsonRpcPayload,
    callback: (error: Error | null, result?: JsonRpcResponse) => void,
  ): void;
}
