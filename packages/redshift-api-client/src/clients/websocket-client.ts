import {
  ApiError,
  BlockHeightUpdate,
  BroadcastTxRequest,
  Network,
  Quote,
  RefundDetails,
  RefundDetailsResponse,
  StateUpdate,
  Subnet,
  TakerQuoteRequest,
  TxResult,
  WebSocketError,
  WebSocketResponse,
  WebSocketSuccess,
  Ws,
} from '@radar/redshift-types';
import { validator } from '@radar/redshift-utils';
import io from 'socket.io-client';
import { config } from '../config';

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
        reject(new Error(WebSocketError.SOCKET_CONNECT_ERROR));
      });
      this._socket.once('connect_timeout', () => {
        reject(new Error(WebSocketError.SOCKET_CONNECT_TIMEOUT));
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
        return reject(new Error(WebSocketError.SOCKET_NOT_CONNECTED));
      }
      if (!request) {
        return reject(
          new Error(ApiError.INVALID_OR_MISSING_QUOTE_REQUEST_FIELDS),
        );
      }
      if (!validator.isValidMarket(request.market)) {
        return reject(new Error(ApiError.INVALID_MARKET));
      }
      if (!validator.isValidBech32(request.invoice)) {
        return reject(new Error(ApiError.INVALID_INVOICE));
      }
      if (
        request.refundAddress &&
        !validator.isValidBase58CheckOrBech32(request.refundAddress)
      ) {
        return reject(new Error(ApiError.INVALID_REFUND_ADDRESS));
      }
      this._socket.emit(
        Ws.Event.REQUEST_QUOTE,
        request,
        ({ success, message }: WebSocketResponse<Quote | string>) => {
          if (success) {
            return resolve(message as Quote);
          }
          return reject(new Error(message as string));
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
        return reject(new Error(WebSocketError.SOCKET_NOT_CONNECTED));
      }
      if (!validator.isValidUUID(orderId)) {
        return reject(new Error(ApiError.INVALID_ORDER_ID));
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
          return reject(new Error(message));
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
        return reject(new Error(WebSocketError.SOCKET_NOT_CONNECTED));
      }
      if (!validator.isValidUUID(orderId)) {
        return reject(new Error(ApiError.INVALID_ORDER_ID));
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
          return reject(new Error(message));
        },
      );
    });
  }

  /**
   * Subscribe to block height updates for the provided network and subnet
   * @param network The on-chain network
   * @param subnet The on-chain subnet
   */
  public async subscribeToBlockHeight(
    network: Network,
    subnet: Subnet,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._socket || !this._socket.connected) {
        return reject(new Error(WebSocketError.SOCKET_NOT_CONNECTED));
      }
      if (!validator.isValidNetworkAndSubnet(network, subnet)) {
        return reject(new Error(ApiError.INVALID_NETWORK_OR_SUBNET));
      }
      this._socket.emit(
        Ws.Event.SUBSCRIBE_TO_BLOCK_HEIGHT,
        {
          network,
          subnet,
        },
        ({ success, message }: WebSocketResponse<string>) => {
          if (success) {
            return resolve();
          }
          return reject(new Error(message));
        },
      );
    });
  }

  /**
   * Listen for block height changes and execute the callback function when one is received
   * @param cb The function to call when we get the event
   */
  public onBlockHeightChanged(cb: (update: BlockHeightUpdate) => void) {
    if (!this._socket || !this._socket.connected) {
      throw new Error(WebSocketError.SOCKET_NOT_CONNECTED);
    }
    this._socket.on(Ws.Event.BLOCK_HEIGHT_CHANGED, cb);
  }

  /**
   * Unsubscribe from block height updates for the provided network and subnet
   * @param network The on-chain network
   * @param subnet The on-chain subnet
   */
  public async unsubscribeFromBlockHeight(
    network: Network,
    subnet: Subnet,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._socket || !this._socket.connected) {
        return reject(new Error(WebSocketError.SOCKET_NOT_CONNECTED));
      }
      if (!validator.isValidNetworkAndSubnet(network, subnet)) {
        return reject(new Error(ApiError.INVALID_NETWORK_OR_SUBNET));
      }
      this._socket.emit(
        Ws.Event.UNSUBSCRIBE_FROM_BLOCK_HEIGHT,
        {
          network,
          subnet,
        },
        ({ success, message }: WebSocketResponse<string>) => {
          if (success) {
            return resolve();
          }
          return reject(new Error(message));
        },
      );
    });
  }

  /**
   * Request refund details for a swap order
   * @param orderId The uuid of the order
   */
  public async requestRefundDetails<D extends RefundDetails = RefundDetails>(
    orderId: string,
  ): Promise<RefundDetailsResponse<D>> {
    return new Promise((resolve, reject) => {
      if (!this._socket || !this._socket.connected) {
        return reject(new Error(WebSocketError.SOCKET_NOT_CONNECTED));
      }
      if (!validator.isValidUUID(orderId)) {
        return reject(new Error(ApiError.INVALID_ORDER_ID));
      }
      this._socket.emit(
        Ws.Event.REQUEST_REFUND_DETAILS,
        {
          orderId,
        },
        ({
          success,
          message,
        }: WebSocketResponse<RefundDetailsResponse<D> | string>) => {
          if (success) {
            return resolve(message as RefundDetailsResponse<D>);
          }
          return reject(new Error(message as string));
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
        return reject(new Error(WebSocketError.SOCKET_NOT_CONNECTED));
      }
      if (!request) {
        return reject(
          new Error(ApiError.INVALID_OR_MISSING_BROADCAST_TX_REQUEST_FIELDS),
        );
      }
      if (!validator.isValidOnchainTicker(request.onchainTicker)) {
        return reject(new Error(ApiError.INVALID_ONCHAIN_TICKER));
      }
      if (!validator.isValidHex(request.signedTxHex)) {
        return reject(new Error(ApiError.INVALID_SIGNED_TX_HEX));
      }
      this._socket.emit(
        Ws.Event.BROADCAST_TRANSACTION,
        request,
        ({ success, message }: WebSocketResponse<TxResult | string>) => {
          if (success) {
            return resolve(message as TxResult);
          }
          return reject(new Error(message as string));
        },
      );
    });
  }
}
