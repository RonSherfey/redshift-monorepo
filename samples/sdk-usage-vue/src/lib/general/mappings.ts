import { MetaMaskError } from '@/types';
import {
  ApiError,
  Market,
  OffChainTicker,
  OnChainTicker,
  UserSwapState,
} from '@radar/redshift.js';

/**
 * API error to human readable string
 */
export const errorToHumanReadable = {
  [ApiError.INVALID_INVOICE]: 'Invalid Lightning invoice',
  [ApiError.INVALID_INVOICE_HASH]: 'Invalid Lightning invoice',
  [ApiError.INTERNAL_SERVER_ERROR]: 'An unknown error occurred',
  [ApiError.INVALID_MARKET]: 'The requested marker does not exist',
  [ApiError.INVALID_REFUND_ADDRESS]: 'Invalid refund address',
  [ApiError.ORDER_NOT_FOUND]: 'Order not found',
  [ApiError.INVALID_OR_MISSING_QUOTE_REQUEST_FIELDS]: 'Invalid request fields',
  [ApiError.INVALID_OR_MISSING_BROADCAST_TX_REQUEST_FIELDS]:
    'Invalid request fields',
  [ApiError.INVALID_ONCHAIN_TICKER]: 'Invalid payment asset',
  [ApiError.INVALID_SIGNED_TX_HEX]: 'Invalid signed transaction',
  [ApiError.INVALID_MARKET_FOR_INVOICE]:
    'Invalid market for the provided invoice',
  [ApiError.NO_QUOTES_AVAILABLE]: 'No quotes available',
  [ApiError.NO_QUOTE_PROVIDERS_FOR_THE_REQUESTED_MARKET]: 'No quotes available',
  [ApiError.SWAP_ALREADY_IN_PROGRESS]:
    'Swap already in progess or complete for this invoice',
  [ApiError.INVOICE_EXPIRES_TOO_SOON]: 'The provided invoice expires too soon',
  [ApiError.INVOICE_AMOUNT_BELOW_MINIMUM]: 'Invoice amount too low',
  [ApiError.INVOICE_AMOUNT_ABOVE_MAXIMUM]: 'Invoice amount too high',
  [ApiError.INVOICE_PAYMENT_NOT_ROUTABLE]: 'No route found to pay invoice',
  [MetaMaskError.METAMASK_ACCESS_DENIED]: 'Access to MetaMask was denied',
  [MetaMaskError.METAMASK_NOT_FOUND]:
    "MetaMask not found. Install <a class='color-secondary' rel='noopener' target='_blank' href='https://metamask.io/'>here</a>",
  [MetaMaskError.TX_SIGN_DENIED]: 'Transaction signature denied',
  [MetaMaskError.UNKNOWN_ERROR]: 'An unknown error occurred',
  [MetaMaskError.WRONG_NETWORK]:
    'Wrong network. Update your network to continue',
};

/**
 * Swap state to human readable string
 */
export const stateToHumanReadable = {
  [UserSwapState.WAITING_FOR_FUNDING_TX]: 'Waiting for transaction',
  [UserSwapState.WAITING_FOR_FUNDING_TX_CONFIRMATION]:
    'Waiting for transaction confirmation',
  [UserSwapState.WAITING_FOR_ADDITIONAL_FUNDING_TX_CONFIRMATION]:
    'Waiting for additional transaction confirmation',
  [UserSwapState.PARTIALLY_FUNDED]: 'Partially funded',
  [UserSwapState.FUNDED]: 'Paying invoice',
  [UserSwapState.COMPLETE]: 'Invoice paid',
  [UserSwapState.WAITING_FOR_REFUND_TX]: 'Waiting for refund transaction',
  [UserSwapState.ADDRESS_BLACKLISTED_WAITING_FOR_REFUND_TX]:
    'Address blacklisted. Waiting for refund transaction',
  [UserSwapState.WAITING_FOR_REFUND_TX_CONFIRMATION]:
    'Waiting for refund transaction confirmation',
  [UserSwapState.REFUNDED]: 'Order refunded',
  [UserSwapState.FUND_WINDOW_ELAPSED]: 'Quote expired',
};

/**
 * On-Chain ticker to it's name
 */
export const onchainTickerToName = {
  [OnChainTicker.SBTC]: 'Simnet bitcoin (sBTC)',
  [OnChainTicker.TBTC]: 'Testnet bitcoin (tBTC)',
  [OnChainTicker.BTC]: 'bitcoin (BTC)',
  [OnChainTicker.SETH]: 'Simnet ether (sETH)',
  [OnChainTicker.KETH]: 'Kovan testnet ether (kETH)',
  [OnChainTicker.ETH]: 'ether (ETH)',
};

/**
 * Extract the on-chain ticker from a market
 */
export const marketToOnchainTicker = {
  [Market.BTC_LBTC]: OnChainTicker.BTC,
  [Market.TBTC_LTBTC]: OnChainTicker.TBTC,
  [Market.SBTC_LSBTC]: OnChainTicker.SBTC,
  [Market.ETH_LBTC]: OnChainTicker.ETH,
  [Market.KETH_LTBTC]: OnChainTicker.KETH,
  [Market.SETH_LSBTC]: OnChainTicker.SETH,
};

/**
 * Extract the off-chain ticker from a market
 */
export const marketToOffchainTicker = {
  [Market.BTC_LBTC]: OffChainTicker.LBTC,
  [Market.TBTC_LTBTC]: OffChainTicker.LTBTC,
  [Market.SBTC_LSBTC]: OffChainTicker.LSBTC,
  [Market.ETH_LBTC]: OffChainTicker.LBTC,
  [Market.KETH_LTBTC]: OffChainTicker.LTBTC,
  [Market.SETH_LSBTC]: OffChainTicker.LSBTC,
};
