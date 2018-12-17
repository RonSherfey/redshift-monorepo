import Web3 from 'web3';

export namespace EVM {
  export interface Options {
    web3: Web3;
  }
}

export interface UnsignedTx {
  to: string;
  data: string;
  value?: string | number;
}

export interface PartialTxParams {
  nonce?: string | number;
  from?: string;
  gas?: string | number;
  gasPrice?: string | number;
}
