import Contract from 'web3/eth/contract';
import { TransactionObject } from 'web3/eth/types';

/**
 * The Ethereum swap contract
 */
export interface EtherSwapContract extends Contract {
  methods: {
    [fnName: string]: (...args: any[]) => TransactionObject<any>;
    fund(orderUUID: string, paymentHash: string): TransactionObject<any>;

    claim(orderUUID: string, preimage: string): TransactionObject<any>;

    refund(orderUUID: string): TransactionObject<any>;

    setRefundDelay(delay: number | string): TransactionObject<any>;
  };
}

/**
 * The ERC20 swap contract
 */
export interface ERC20SwapContract extends Contract {
  methods: {
    [fnName: string]: (...args: any[]) => TransactionObject<any>;
    fund(
      orderUUID: string,
      paymentHash: string,
      tokenContractAddress: string,
      tokenAmount: string,
    ): TransactionObject<any>;

    claim(
      orderUUID: string,
      tokenContractAddress: string,
      preimage: string,
    ): TransactionObject<any>;

    refund(
      orderUUID: string,
      tokenContractAddress: string,
    ): TransactionObject<any>;

    setRefundDelay(delay: number | string): TransactionObject<any>;
  };
}
