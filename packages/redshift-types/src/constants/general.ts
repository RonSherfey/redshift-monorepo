import { KnownKeys, ValueOf } from '../lib';

// tslint:disable:variable-name

/**
 * The swap order state
 */
export enum InternalSwapState {
  WAITING_FOR_FUNDING_TX = 'WaitingForFundingTx',
  WAITING_FOR_FUNDING_TX_CONFIRMATION = 'WaitingForFundingTxConfirmation',
  WAITING_FOR_ADDITIONAL_FUNDING_TX_CONFIRMATION = 'WaitingForAdditionalFundingTxConfirmation',
  PARTIALLY_FUNDED = 'PartiallyFunded',
  FUNDED = 'Funded',

  WAITING_FOR_CLAIMING_TX = 'WaitingForClaimingTx',
  WAITING_FOR_CLAIMING_TX_CONFIRMATION = 'WaitingForClaimingTxConfirmation',
  COMPLETE = 'Complete', // On-chain funds have been claimed

  WAITING_FOR_REFUND_TX = 'WaitingForRefundTx',
  WAITING_FOR_REFUND_TX_CONFIRMATION = 'WaitingForRefundTxConfirmation',
  REFUNDED = 'Refunded',

  INACTIVE = 'Inactive', // The fund window had elapsed or another quote has been funded
}

/**
 * The swap order state that concerns the user
 */
export enum UserSwapState {
  WAITING_FOR_FUNDING_TX = 'WaitingForFundingTx',
  WAITING_FOR_FUNDING_TX_CONFIRMATION = 'WaitingForFundingTxConfirmation',
  WAITING_FOR_ADDITIONAL_FUNDING_TX_CONFIRMATION = 'WaitingForAdditionalFundingTxConfirmation',
  PARTIALLY_FUNDED = 'PartiallyFunded',
  FUNDED = 'Funded',

  COMPLETE = 'Complete', // Invoice has been paid

  WAITING_FOR_REFUND_TX = 'WaitingForRefundTx',
  WAITING_FOR_REFUND_TX_CONFIRMATION = 'WaitingForRefundTxConfirmation',
  REFUNDED = 'Refunded',

  INACTIVE = 'Inactive', // The fund window had elapsed or another quote has been funded
}

/**
 * Swap transaction types
 */
export enum TransactionType {
  FUND = 0,
  CLAIM = 1,
  REFUND = 2,
}

/**
 * Ticker symbols for supported simnet on-chain assets (testing only)
 */
export enum SimnetOnChainTicker {
  SBTC = 'SBTC', // Simnet Bitcoin
  SETH = 'SETH', // Simnet Ether
  SLTC = 'SLTC', // Simnet Litecoin
  SDAI = 'SDAI', // Simnet DAI
  SXLM = 'SXLM', // Simnet Stellar Lumens
  SDCR = 'SDCR', // Simnet Decred
}

/**
 * Ticker symbols for supported testnet on-chain assets (live and potential)
 */
export enum TestnetOnChainTicker {
  TBTC = 'TBTC', // Testnet Bitcoin
  KETH = 'KETH', // Kovan Testnet Ether
  TLTC = 'TLTC', // Testnet Litecoin
  KDAI = 'KDAI', // Kovan Testnet DAI
  TXLM = 'TXLM', // Testnet Stellar Lumens
  TDCR = 'TDCR', // Testnet Decred
}

/**
 * Ticker symbols for supported mainnet on-chain assets (live and potential)
 */
export enum MainnetOnChainTicker {
  BTC = 'BTC', // Bitcoin
  ETH = 'ETH', // Ether
  LTC = 'LTC', // Litecoin
  DAI = 'DAI', // DAI
  XLM = 'XLM', // Stellar Lumens
  DCR = 'DCR', // Decred
}

/**
 * Ticker symbols for supported on-chain assets (live and potential)
 */
export const OnChainTicker = {
  ...SimnetOnChainTicker,
  ...TestnetOnChainTicker,
  ...MainnetOnChainTicker,
};
export type OnChainTicker = ValueOf<
  Pick<typeof OnChainTicker, KnownKeys<typeof OnChainTicker>>
>;

/**
 * Ticker symbols for supported testnet off-chain assets (live and potential)
 */
export enum TestnetOffChainTicker {
  LTBTC = 'LTBTC', // Lightning Testnet Bitcoin
  LTLTC = 'LTLTC', // Lightning Testnet Litecoin
}

/**
 * Ticker symbols for supported mainnet off-chain assets (live and potential)
 */
export enum MainnetOffChainTicker {
  LBTC = 'LBTC', // Lightning Bitcoin
  LLTC = 'LLTC', // Lightning Litecoin
}

/**
 * Ticker symbols for supported off-chain assets (live and potential)
 */
export const OffChainTicker = {
  ...TestnetOffChainTicker,
  ...MainnetOffChainTicker,
};
export type OffChainTicker = ValueOf<
  Pick<typeof OffChainTicker, KnownKeys<typeof OffChainTicker>>
>;

/**
 * Supported Testnet Markets (live and potential)
 */
export enum TestnetMarket {
  TBTC_LTBTC = 'TBTC_LTBTC',
  KETH_LTBTC = 'KETH_LTBTC',
  TLTC_LTBTC = 'TLTC_LTBTC',
  KDAI_LTBTC = 'KDAI_LTBTC',
  TXLM_LTBTC = 'TXLM_LTBTC',
  TDCR_LTBTC = 'TDCR_LTBTC',
}

/**
 * Supported Mainnet Markets (live and potential)
 */
export enum MainnetMarket {
  BTC_LBTC = 'BTC_LBTC',
  ETH_LBTC = 'ETH_LBTC',
  LTC_LBTC = 'LTC_LBTC',
  DAI_LBTC = 'DAI_LBTC',
  XLM_LBTC = 'XLM_LBTC',
  DCR_LBTC = 'DCR_LBTC',
}

/**
 * Supported Markets (live and potential)
 */
export const Market = {
  ...TestnetMarket,
  ...MainnetMarket,
};
export type Market = ValueOf<Pick<typeof Market, KnownKeys<typeof Market>>>;

export namespace Ws {
  /**
   * Liquidity provider event names
   */
  enum LiquidityProviderEvent {
    // REDSHIFT
    AUTHENTICATE = 'authenticate',
    SUBSCRIBE_TO_QUOTES = 'subscribeToQuotes',
    UNSUBSCRIBE_FROM_QUOTES = 'unsubscribeFromQuotes',
    MAKER_QUOTE = 'makerQuote',
    // LIQUIDITY PROVIDER
    REQUEST_QUOTE = 'requestQuote',
  }

  /**
   * User websocket event names
   */
  enum UserEvent {
    // SERVER
    REQUEST_QUOTE = 'requestQuote',
    SUBSCRIBE_TO_ORDER_STATE = 'subscribeToOrderState',
    UNSUBSCRIBE_FROM_ORDER_STATE = 'unsubscribeFromOrderState',
    BROADCAST_TRANSACTION = 'broadcastTransaction',
    REQUEST_REFUND_DETAILS = 'requestRefundDetails',
    // CLIENT
    MAKER_QUOTE = 'makerQuote',
    STATE_CHANGED = 'stateChanged',
  }

  /**
   * WebSocket namespaces
   */
  export enum Namespace {
    PROVIDER_V1 = '/provider/v1',
    USER_V1 = '/user/v1',
  }

  /**
   * WebSocket event names
   */
  // tslint:disable-next-line: variable-name
  export const Event = {
    ...LiquidityProviderEvent,
    ...UserEvent,
  };
}

/**
 * WebSocket success states
 */
export enum WebSocketSuccess {
  SOCKET_CONNECTED = 'SocketConnected',
}
