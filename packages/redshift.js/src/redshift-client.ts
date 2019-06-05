import { config } from './config';
import { HttpClient } from './http-client';
import { WebSocketClient } from './websocket-client';

export class RedshiftClient {
  private _http: HttpClient;
  private _ws: WebSocketClient;

  /**
   * The Redshift HTTP API client instance
   */
  get http() {
    return this._http;
  }

  /**
   * The Redshift WebSocket API client instance
   */
  get ws() {
    return this._ws;
  }

  /**
   * Instantiate the Redshift client
   * @param url The redshift WebSocket & HTTP API urls without the paths
   */
  constructor(url: string = config.url) {
    this._http = new HttpClient(url);
    this._ws = new WebSocketClient(url);
  }
}
