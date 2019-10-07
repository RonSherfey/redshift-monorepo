import { config } from '../config';
import { HttpClient } from './http-client';
import { WebSocketClient } from './websocket-client';

export class RedshiftClient {
  private _http: HttpClient;
  private _ws: WebSocketClient;

  /**
   * The REDSHIFT HTTP API client instance
   */
  get http() {
    return this._http;
  }

  /**
   * The REDSHIFT WebSocket API client instance
   */
  get ws() {
    return this._ws;
  }

  /**
   * Instantiate the REDSHIFT client
   * @param url The redshift WebSocket & HTTP API urls without the paths
   */
  constructor(url: string = config.url) {
    this._http = new HttpClient(url);
    this._ws = new WebSocketClient(url);
  }
}
