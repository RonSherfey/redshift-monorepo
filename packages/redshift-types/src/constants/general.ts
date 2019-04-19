// tslint:disable:variable-name

/**
 * The swap order state
 */
export enum SwapState {
  WaitingForFundingTx = 0,
  WaitingForFundingTxConfirmation = 1,
  WaitingForAdditionalFundingTxConfirmation = 2,
  PartiallyFunded = 3,
  Funded = 4,

  WaitingForClaimingTx = 5,
  WaitingForClaimingTxConfirmation = 6,
  Complete = 7,

  WaitingForRefundTx = 8,
  WaitingForRefundTxConfirmation = 9,
  Refunded = 10,
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
 * Ticker symbols for supported on-chain assets (live and potential)
 */
export enum OnChainTicker {
  BTC = 'BTC', // Bitcoin
  ETH = 'ETH', // Ether
  LTC = 'LTC', // Litecoin
  DAI = 'DAI', // DAI
  XLM = 'XLM', // Stellar Lumens
  DCR = 'DCR', // Decred
}

/**
 * Ticker symbols for supported off-chain assets (live and potential)
 */
export enum OffChainTicker {
  LBTC = 'LBTC', // Lightning Bitcoin
  LLTC = 'LLTC', // Lightning Litecoin
}

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
export type Market = typeof Market;

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
