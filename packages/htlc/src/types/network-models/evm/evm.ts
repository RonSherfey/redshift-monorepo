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

export interface EIP1193Provider {
  send(method: string, params?: any): Promise<any>;
}

export interface LegacyProvider {
  send(
    request: JsonRpcPayload,
    callback: (
      err: Error | null,
      response: JsonRpcResponse | undefined,
    ) => void,
  ): void;
}

export type Provider = EIP1193Provider | LegacyProvider;
