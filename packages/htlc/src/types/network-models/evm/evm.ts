import { ERC20SwapContract, EtherSwapContract } from './contracts';

export namespace EVM {
  export enum AssetType {
    ETHER = 'ether',
    ERC20 = 'erc20',
  }

  interface SharedOptions {
    orderUUID: string;
    assetType: AssetType;
    provider?: Provider;
  }

  export interface EtherOptions extends SharedOptions {
    assetType: AssetType.ETHER;
  }

  export interface ERC20Options extends SharedOptions {
    assetType: AssetType.ERC20;
    tokenContractAddress: string;
  }

  export type Options = EtherOptions | ERC20Options;
}

export type SwapContract<O extends EVM.Options> = O extends EVM.ERC20Options
  ? ERC20SwapContract
  : EtherSwapContract;

export declare class Provider {
  send(method: string, params: any): Promise<any>;
}
