import { Market, OffChainTicker, OnChainTicker } from '.';
import { TxOutput } from './blockchain';
import { InternalSwapState, UserSwapState } from './constants';

//#region HTTP

export type MarketsResponse = {
  onchainTicker: OnChainTicker;
  offchainTicker: OffChainTicker;
  market: Market;
}[];

export interface OrderResponse {
  id: string;
  market: Market;
  onchainTicker: OnChainTicker;
  createdAt: string;
  state: UserSwapState;
  payToAddress: string;
  amount: string;
  amountPaid: string;
  paymentHash: string;
}

export type OrdersResponse = OrderResponse[];

export interface UtxoRefundDetails {
  refundAddress: string;
  redeemScript: string;
  currentBlockHeight: number;
  feeTokensPerVirtualByte: number;
  utxos: TxOutput[];
}

export interface EthRefundDetails {
  to: string;
  data: string;
}

export type RefundDetails = UtxoRefundDetails | EthRefundDetails;

export interface RefundDetailsResponse<T extends RefundDetails> {
  blocksRemaining: string | number;
  refundBalance: string;
  details: T;
}

//#endregion

//#region WebSocket - General

export interface WebSocketResponse<T> {
  success: boolean;
  message?: T;
}

//#endregion

//#region WebSocket - User

export interface TakerQuoteRequest {
  market: Market;
  invoice: string;
  refundAddress?: string;
}

export interface StateUpdateRequest {
  orderId: string;
}

export interface BroadcastTxRequest {
  onchainTicker: OnChainTicker;
  signedTxHex: string;
}

export interface RefundDetailsRequest {
  orderId: string;
}

export interface TxResult {
  txId: string;
}

export interface StateUpdate {
  state: InternalSwapState;
}

export interface Quote {
  orderId: string;
  expiryTimestampMs: number;
  details: FundDetails;
}

//#endregion

//#region WebSocket - Liquidity Provider

export interface AuthenticationRequest {
  apiKey: string;
  secretKey: string;
}

export type QuoteSubscriptionRequest = Market[];

export interface UtxoDetails {
  redeemScript: string;
  amount: string;
  payToAddress: string;
}

export interface PartialEvmTxParams {
  from?: string | number;
  gas?: number | string;
  gasPrice?: number | string;
  nonce?: number;
}

export interface EvmUnsignedTx extends PartialEvmTxParams {
  to: string;
  data: string;
  value?: string | number;
}

export interface EvmDetails {
  unsignedFundingTx: EvmUnsignedTx;
}

export type FundDetails = UtxoDetails | EvmDetails;

export interface MakerQuoteRequest {
  orderId: string;
  market: Market;
  invoice: string;
  refundAddress?: string;
  requestExpiryTimestampMs: number;
}

export interface MakerQuote {
  orderId: string;
  details: FundDetails;
  quoteExpiryTimestampMs: number;
}

//#endregion
