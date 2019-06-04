import {
  ApiError,
  BroadcastTxRequest,
  Quote,
  RefundDetails,
  StateUpdate,
  TakerQuoteRequest,
  TxResult,
  WebSocketError,
  WebSocketResponse,
  WebSocketSuccess,
  Ws,
} from '@radar/redshift-types';
import io from 'socket.io-client';
import { config } from './config';
import { utils } from './utils';

export class WebSocketClient {
  private _url: string;
  private _socket: SocketIOClient.Socket | undefined = undefined;

  /**
   * The socket.io client socket instance
   */
  get socket() {
    return this._socket;
  }

  /**
   * Instantiate the WebSocket client
   * @param url The redshift WebSocket API url without the path
   */
  constructor(url: string = config.url) {
    this._url = `${url}/user/v1`;
  }

  /**
   * Establish a connection to the Redshift WebSocket API
   * @param opts The socket connection options
   */
  public async connect(opts?: SocketIOClient.ConnectOpts): Promise<string> {
    return new Promise((resolve, reject) => {
      this._socket = io.connect(
        this._url,
        opts,
      );
      this._socket.once('connect', () => {
        resolve(WebSocketSuccess.SOCKET_CONNECTED);
      });
      this._socket.once('connect_error', () => {
        reject(WebSocketError.SOCKET_CONNECT_ERROR);
      });
      this._socket.once('connect_timeout', () => {
        reject(WebSocketError.SOCKET_CONNECT_TIMEOUT);
      });
    });
  }

  /**
   * Disconnect from the Redshift WebSocket API
   */
  public disconnect() {
    if (this._socket && this._socket.connected) {
      this._socket.disconnect();
    }
  }

  /**
   * Request a quote for the provided invoice and selected on-chain asset
   * @param request The quote request details
   */
  public async requestQuote(request: TakerQuoteRequest): Promise<Quote> {
    return new Promise((resolve, reject) => {
      if (!this._socket || !this._socket.connected) {
        return reject(WebSocketError.SOCKET_NOT_CONNECTED);
      }
      if (!request) {
        return reject(ApiError.INVALID_OR_MISSING_QUOTE_REQUEST_FIELDS);
      }
      if (!utils.isValidMarket(request.market)) {
        return reject(ApiError.INVALID_MARKET);
      }
      if (!utils.isValidBech32(request.invoice)) {
        return reject(ApiError.INVALID_INVOICE);
      }
      if (
        request.refundAddress &&
        !utils.isValidUtxoAddress(request.refundAddress)
      ) {
        return reject(ApiError.INVALID_REFUND_ADDRESS);
      }
      this._socket.emit(
        Ws.Event.REQUEST_QUOTE,
        request,
        ({ success, message }: WebSocketResponse<Quote>) => {
          if (success) {
            return resolve(message);
          }
          return reject(message);
        },
      );
    });
  }

  /**
   * Subscribe to order state updates for the provided order id
   * @param orderId The uuid of the order
   */
  public async subscribeToOrderState(orderId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._socket || !this._socket.connected) {
        return reject(WebSocketError.SOCKET_NOT_CONNECTED);
      }
      if (!utils.isValidUUID(orderId)) {
        return reject(ApiError.INVALID_ORDER_ID);
      }
      this._socket.emit(
        Ws.Event.SUBSCRIBE_TO_ORDER_STATE,
        {
          orderId,
        },
        ({ success, message }: WebSocketResponse<string>) => {
          if (success) {
            return resolve();
          }
          return reject(message);
        },
      );
    });
  }

  /**
   * Listen for order state changes and execute the callback function when one is received
   * @param cb The function to call when we get the event
   */
  public onOrderStateChanged(cb: (update: StateUpdate) => void) {
    if (!this._socket || !this._socket.connected) {
      throw new Error(WebSocketError.SOCKET_NOT_CONNECTED);
    }
    this._socket.on(Ws.Event.STATE_CHANGED, cb);
  }

  /**
   * Unsubscribe from order state updates for the provided order id
   * @param orderId The uuid of the order
   */
  public async unsubscribeFromOrderState(orderId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._socket || !this._socket.connected) {
        return reject(WebSocketError.SOCKET_NOT_CONNECTED);
      }
      if (!utils.isValidUUID(orderId)) {
        return reject(ApiError.INVALID_ORDER_ID);
      }
      this._socket.emit(
        Ws.Event.UNSUBSCRIBE_FROM_ORDER_STATE,
        {
          orderId,
        },
        ({ success, message }: WebSocketResponse<string>) => {
          if (success) {
            return resolve();
          }
          return reject(message);
        },
      );
    });
  }

  /**
   * Request refund details for a swap order
   * @param orderId The uuid of the order
   */
  public async requestRefundDetails(orderId: string): Promise<RefundDetails> {
    return new Promise((resolve, reject) => {
      if (!this._socket || !this._socket.connected) {
        return reject(WebSocketError.SOCKET_NOT_CONNECTED);
      }
      if (!utils.isValidUUID(orderId)) {
        return reject(ApiError.INVALID_ORDER_ID);
      }
      this._socket.emit(
        Ws.Event.REQUEST_REFUND_DETAILS,
        {
          orderId,
        },
        ({ success, message }: WebSocketResponse<RefundDetails>) => {
          if (success) {
            return resolve(message);
          }
          return reject(message);
        },
      );
    });
  }

  /**
   * Broadcast signed transaction hex to your network of choice
   * @param request The on-chain ticker and signed tx hex
   */
  public async broadcastTransaction(
    request: BroadcastTxRequest,
  ): Promise<TxResult> {
    return new Promise((resolve, reject) => {
      if (!this._socket || !this._socket.connected) {
        return reject(WebSocketError.SOCKET_NOT_CONNECTED);
      }
      if (!request) {
        return reject(ApiError.INVALID_OR_MISSING_BROADCAST_TX_REQUEST_FIELDS);
      }
      if (!utils.isValidOnchainTicker(request.onchainTicker)) {
        return reject(ApiError.INVALID_ONCHAIN_TICKER);
      }
      if (!utils.isValidHex(request.signedTxHex)) {
        return reject(ApiError.INVALID_SIGNED_TX_HEX);
      }
      this._socket.emit(
        Ws.Event.BROADCAST_TRANSACTION,
        request,
        ({ success, message }: WebSocketResponse<TxResult>) => {
          if (success) {
            return resolve(message);
          }
          return reject(message);
        },
      );
    });
  }
}
