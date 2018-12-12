import BN from 'bn.js';
import Contract from 'web3/eth/contract';
import { TransactionObject } from 'web3/eth/types';

/**
 * The Ethereum swap contract
 */
export interface EtherSwapContract extends Contract {
  methods: {
    [fnName: string]: (...args: any[]) => TransactionObject<any>;
    fund(
      lninvoiceHash: string | BN,
      paymentHash: string | BN,
    ): TransactionObject<any>;

    claim(
      lninvoiceHash: string | BN,
      preimage: string | BN,
    ): TransactionObject<any>;

    refund(lninvoiceHash: string | BN): TransactionObject<any>;

    setRefundDelay(delay: number | BN | string): TransactionObject<any>;
  };
}
