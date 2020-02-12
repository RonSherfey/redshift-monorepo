import Contract from 'web3/eth/contract';
import { TransactionObject } from 'web3/eth/types';

export interface EtherSwapFundDetails {
  orderUUID: string;
  paymentHash: string;
}

export interface EtherSwapFundDetailsWithAdminRefundEnabled
  extends EtherSwapFundDetails {
  refundHash: string;
}

export interface EtherSwapClaimDetails {
  orderUUID: string;
  paymentPreimage: string;
}

export interface EtherSwapAdminRefundDetails {
  orderUUID: string;
  refundPreimage: string;
}

/**
 * The Ethereum swap contract
 */
export interface EtherSwapContract extends Contract {
  methods: {
    [fnName: string]: (...args: any[]) => TransactionObject<any>;
    fund(details: EtherSwapFundDetails): TransactionObject<any>;

    fundWithAdminRefundEnabled(
      details: EtherSwapFundDetailsWithAdminRefundEnabled,
    ): TransactionObject<any>;

    claim(details: EtherSwapClaimDetails): TransactionObject<any>;

    refund(orderUUID: string): TransactionObject<any>;

    adminRefund(details: EtherSwapAdminRefundDetails): TransactionObject<any>;

    setRefundDelay(delay: number | string): TransactionObject<any>;
  };
}

export interface ERC20SwapFundDetails {
  orderUUID: string;
  paymentHash: string;
  tokenContractAddress: string;
  tokenAmount: string;
}

export interface ERC20SwapFundDetailsWithAdminRefundEnabled
  extends ERC20SwapFundDetails {
  refundHash: string;
}

export interface ERC20SwapClaimDetails {
  orderUUID: string;
  paymentPreimage: string;
}

export interface ERC20SwapAdminRefundDetails {
  orderUUID: string;
  refundPreimage: string;
}

/**
 * The ERC20 swap contract
 */
export interface ERC20SwapContract extends Contract {
  methods: {
    [fnName: string]: (...args: any[]) => TransactionObject<any>;
    fund(details: ERC20SwapFundDetails): TransactionObject<any>;

    fundWithAdminRefundEnabled(
      details: ERC20SwapFundDetailsWithAdminRefundEnabled,
    ): TransactionObject<any>;

    claim(details: ERC20SwapClaimDetails): TransactionObject<any>;

    refund(orderUUID: string): TransactionObject<any>;

    adminRefund(details: ERC20SwapAdminRefundDetails): TransactionObject<any>;

    setRefundDelay(delay: number | string): TransactionObject<any>;
  };
}
