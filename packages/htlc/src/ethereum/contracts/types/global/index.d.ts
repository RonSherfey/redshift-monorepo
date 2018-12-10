declare module Chai {
  export interface AssertStatic {
    web3Event(response: Truffle.TransactionResponse, eventArgs: any, message?: string): void;
  }
}
