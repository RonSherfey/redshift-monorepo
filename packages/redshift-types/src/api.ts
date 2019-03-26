import { UnsignedTx } from '@radar/htlc';
import { Market } from '.';

//#region User

export interface TakerQuoteRequest {
  market: Market;
  invoice: string;
  refundAddress?: string;
}

export interface StateUpdateRequest {
  invoiceHash: string;
}

//#endregion

//#region Liquidity Provider

export interface AuthenticationRequest {
  apiKey: string;
  secretKey: string;
}

export type QuoteSubscriptionRequest = Market[];

export interface UtxoDetails {
  redeemScript: string;
  payToAddress: string;
}

export interface EvmDetails {
  unsignedFundingTx: UnsignedTx;
}

export interface MakerQuoteRequest {
  market: Market;
  details: UtxoDetails | EvmDetails;
  id: string; // The socket id that was passed to the maker in the quote request
}

//#endregion
