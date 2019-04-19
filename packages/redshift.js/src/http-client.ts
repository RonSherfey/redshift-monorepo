import {
  ApiError,
  MarketsResponse,
  Network,
  NetworkError,
  OrderResponse,
  UserSwapState,
} from '@radar/redshift-types';
import axios from 'axios';
import sha256 from 'simple-sha256';
import { config } from './config';
import { utils } from './utils';

export class HttpClient {
  private _apiBase: string;

  constructor(url: string = config.url) {
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
   * Get a swap order
   * @param network The network of the on-chain asset used to fund the swap
   * @param invoice The invoice that will be payed by the swap provider
   */
  public async getOrder(
    network: Network,
    invoice: string,
  ): Promise<OrderResponse> {
    if (!utils.isValidNetwork(network)) {
      throw new Error(NetworkError.INVALID_NETWORK);
    }
    if (!utils.isValidBech32(invoice)) {
      throw new Error(ApiError.INVALID_INVOICE);
    }
    const invoiceHash = await sha256(invoice);
    const json = await axios.get<OrderResponse>(
      `${this._apiBase}/${network}/orders/${invoiceHash}`,
    );
    return json.data;
  }

  /**
   * Get the state of an order
   * @param network The network of the on-chain asset used to fund the swap
   * @param invoice The invoice that will be payed by the swap provider
   */
  public async getOrderState(
    network: Network,
    invoice: string,
  ): Promise<UserSwapState> {
    if (!utils.isValidNetwork(network)) {
      throw new Error(NetworkError.INVALID_NETWORK);
    }
    if (!utils.isValidBech32(invoice)) {
      throw new Error(ApiError.INVALID_INVOICE);
    }
    const invoiceHash = await sha256(invoice);
    const json = await axios.get<UserSwapState>(
      `${this._apiBase}/${network}/orders/${invoiceHash}/state`,
    );
    return json.data;
  }
}
