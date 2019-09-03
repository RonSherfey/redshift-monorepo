declare module Chai {
  export type ChaiPlugin = (chai: any, utils: any) => void;
}

declare module Truffle {
  export interface Contract<T> extends ContractNew<any[]> {
    numberFormat: 'BigNumber' | 'BN' | 'String';
  }
}
