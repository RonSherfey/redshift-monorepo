import {
  ApiError,
  FundDetails,
  Market,
  MarketsResponse,
  OnChainTicker,
  OrderDetailsResponse,
  OrdersResponse,
  RefundDetails,
  RefundDetailsResponse,
  Requirements,
  TransactionsResponse,
  UserSwapState,
} from '@radar/redshift-types';
import { validator } from '@radar/redshift-utils';
import axios from 'axios';
import sha256 from 'simple-sha256';
import { RedshiftApiUrl } from '../constants';

export class HttpClient {
  private _apiBase: string;

  /**
   * Instantiate the HTTP client
   * @param url The redshift API url without the path
   */
  constructor(url: string = RedshiftApiUrl.MAINNET) {
    this._apiBase = `${url}/api`;
  }

  /**
   * Get the active markets
   */
  public async getMarkets(): Promise<MarketsResponse> {
    const json = await axios.get<MarketsResponse>(`${this._apiBase}/markets`);
    return json.data;
  }

  /**
   * Get the quote request requirements for one or all markets
   * @param market The optional market to fetch requirements for
   */
  public async getMarketRequirements<M extends Market | undefined = undefined>(
    market?: M,
  ): Promise<Requirements<M>> {
    if (market) {
      if (!validator.isValidMarket(market as Market)) {
        throw new Error(ApiError.INVALID_MARKET);
      }
      const json = await axios.get<Requirements<M>>(
        `${this._apiBase}/markets/${market}/requirements`,
      );
      return json.data;
    }

    const json = await axios.get<Requirements<M>>(
      `${this._apiBase}/markets/requirements`,
    );
    return json.data;
  }

  /**
   * Get all general information about all swap orders for a specific invoice
   * @param invoice The invoice that will be payed by the swap provider
   * @param onchainTicker The optional ticker of the on-chain asset used to fund the swap
   */
  public async getOrders(
    invoice: string,
    onchainTicker?: OnChainTicker,
  ): Promise<OrdersResponse> {
    if (!validator.isValidBech32(invoice)) {
      throw new Error(ApiError.INVALID_INVOICE);
    }
    if (onchainTicker && !validator.isValidOnchainTicker(onchainTicker)) {
      throw new Error(ApiError.INVALID_ONCHAIN_TICKER);
    }
    const invoiceHash = await sha256(invoice);
    const json = await axios.get<OrdersResponse>(`${this._apiBase}/orders`, {
      params: {
        invoiceHash,
        onchainTicker,
      },
    });
    return json.data;
  }

  /**
   * Get the details for a single swap order
   * @param orderId The uuid of the order
   */
  public async getOrder(orderId: string): Promise<OrderDetailsResponse> {
    if (!validator.isValidUUID(orderId)) {
      throw new Error(ApiError.INVALID_ORDER_ID);
    }
    const json = await axios.get<OrderDetailsResponse>(
      `${this._apiBase}/orders/${orderId}`,
    );
    return json.data;
  }

  /**
   * Get the state of an order
   * @param orderId The uuid of the order
   */
  public async getOrderState(orderId: string): Promise<UserSwapState> {
    if (!validator.isValidUUID(orderId)) {
      throw new Error(ApiError.INVALID_ORDER_ID);
    }
    const json = await axios.get<UserSwapState>(
      `${this._apiBase}/orders/${orderId}/state`,
    );
    return json.data;
  }

  /**
   * Get the fund details for an order
   * @param orderId The uuid of the order
   */
  public async getOrderFundDetails(orderId: string): Promise<FundDetails> {
    if (!validator.isValidUUID(orderId)) {
      throw new Error(ApiError.INVALID_ORDER_ID);
    }
    const json = await axios.get<FundDetails>(
      `${this._apiBase}/orders/${orderId}/fundDetails`,
    );
    return json.data;
  }

  /**
   * Get the transactions relating to an order
   * @param orderId The uuid of the order
   */
  public async getOrderTransactions(
    orderId: string,
  ): Promise<TransactionsResponse> {
    if (!validator.isValidUUID(orderId)) {
      throw new Error(ApiError.INVALID_ORDER_ID);
    }
    const json = await axios.get<TransactionsResponse>(
      `${this._apiBase}/orders/${orderId}/transactions`,
    );
    return json.data;
  }

  /**
   * Get the refund details for an order
   * @param orderId The uuid of the order
   */
  public async getOrderRefundDetails<D extends RefundDetails = RefundDetails>(
    orderId: string,
  ): Promise<RefundDetailsResponse<D>> {
    if (!validator.isValidUUID(orderId)) {
      throw new Error(ApiError.INVALID_ORDER_ID);
    }
    const json = await axios.get<RefundDetailsResponse<D>>(
      `${this._apiBase}/orders/${orderId}/refund`,
    );
    return json.data;
  }
}
