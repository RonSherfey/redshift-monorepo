declare module Truffle {
  export interface Contract<T> extends ContractNew<any[]> {
    numberFormat: 'BigNumber' | 'BN' | 'String';
  }
}
