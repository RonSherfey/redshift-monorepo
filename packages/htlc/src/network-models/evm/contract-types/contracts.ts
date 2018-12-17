import Contract from 'web3/eth/contract';
import { TransactionObject } from 'web3/eth/types';

/**
 * The Ethereum swap contract
 */
export interface EtherSwapContract extends Contract {
  methods: {
    [fnName: string]: (...args: any[]) => TransactionObject<any>;
    fund(lninvoiceHash: string, paymentHash: string): TransactionObject<any>;

    claim(lninvoiceHash: string, preimage: string): TransactionObject<any>;

    refund(lninvoiceHash: string): TransactionObject<any>;

    setRefundDelay(delay: number | string): TransactionObject<any>;
  };
}
