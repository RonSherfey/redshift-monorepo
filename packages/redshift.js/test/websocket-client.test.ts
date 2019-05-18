import {
  ApiError,
  RefundDetails,
  WebSocketResponse,
  Ws,
} from '@radar/redshift-types';
import fixtureSocket from 'can-fixture-socket';
import sinon from 'sinon';
import io from 'socket.io-client';
import { WebSocketClient } from '../src';
import { config } from '../src/config';
import { expect, fixtures } from './lib';

describe('WebSocket Client', () => {
  let client: WebSocketClient;
  let server: fixtureSocket.Server;
  let socket: SocketIOClient.Socket;
  let socketStub: sinon.SinonStub<any[], any>;
  before(done => {
    client = new WebSocketClient();
    server = new fixtureSocket.Server(io);

    socket = io(config.url);
    socketStub = sinon.stub(client, '_socket' as any).get(() => {
      return socket;
    });

    let connected: boolean;
    server.on('connection', () => {
      if (!connected) {
        done();
        connected = true;
      }
    });
  });

  after(() => {
    socketStub.restore();
  });

  describe('subscribeToOrderState', () => {
    before(() => {
      // Stubbed websocket server success response
      server.on(Ws.Event.SUBSCRIBE_TO_ORDER_STATE, (_, cb: Function) => {
        cb({
          success: true,
        });
      });
    });

    it('should throw an error if the order id is invalid', async () => {
      await expect(
        client.subscribeToOrderState(fixtures.invalid.orderId),
      ).to.be.rejectedWith(ApiError.INVALID_ORDER_ID);
    });

    it('should succeed when valid params are provided', async () => {
      await expect(client.subscribeToOrderState(fixtures.valid.orderId)).to.not
        .be.rejected;
    });
  });

  describe('unsubscribeFromOrderState', () => {
    before(() => {
      // Stubbed websocket server success response
      server.on(Ws.Event.UNSUBSCRIBE_FROM_ORDER_STATE, (_, cb: Function) => {
        cb({
          success: true,
        });
      });
    });

    it('should throw an error if the order id is invalid', async () => {
      await expect(
        client.unsubscribeFromOrderState(fixtures.invalid.orderId),
      ).to.be.rejectedWith(ApiError.INVALID_ORDER_ID);
    });

    it('should succeed when valid params are provided', async () => {
      await expect(client.unsubscribeFromOrderState(fixtures.valid.orderId)).to
        .not.be.rejected;
    });
  });

  describe('requestRefundDetails', () => {
    const serverResponse: WebSocketResponse<RefundDetails> = {
      success: true,
      message: {
        to: '0xdeadbeed',
        data: '0xdeadbeef',
      },
    };
    before(() => {
      // Stubbed websocket server success response
      server.on(Ws.Event.REQUEST_REFUND_DETAILS, (_, cb: Function) => {
        cb(serverResponse);
      });
    });

    it('should throw an error if the order id is invalid', async () => {
      await expect(
        client.requestRefundDetails(fixtures.invalid.orderId),
      ).to.be.rejectedWith(ApiError.INVALID_ORDER_ID);
    });

    it('should succeed when valid params are provided', async () => {
      await expect(client.requestRefundDetails(fixtures.valid.orderId)).to.to
        .not.be.rejected;
    });
  });

  describe('broadcastTransaction', () => {
    const serverResponse: WebSocketResponse<any> = {
      success: true,
      message: {
        txId: '0xdeadbeef', // TODO: Use fixtures
      },
    };
    before(() => {
      // Stubbed websocket server success response
      server.on(Ws.Event.BROADCAST_TRANSACTION, (_, cb: Function) => {
        cb(serverResponse);
      });
    });

    it('should throw an error if the on-chain ticker is invalid', async () => {
      await expect(
        client.broadcastTransaction({
          onchainTicker: fixtures.invalid.onchainTicker,
          signedTxHex: fixtures.valid.hex,
        }),
      ).to.be.rejectedWith(ApiError.INVALID_ONCHAIN_TICKER);
    });

    it('should throw an error if the signed tx hex is invalid', async () => {
      await expect(
        client.broadcastTransaction({
          onchainTicker: fixtures.valid.onchainTicker,
          signedTxHex: fixtures.invalid.hex,
        }),
      ).to.be.rejectedWith(ApiError.INVALID_SIGNED_TX_HEX);
    });

    it('should succeed when valid params are provided', async () => {
      const response = await client.broadcastTransaction({
        onchainTicker: fixtures.valid.onchainTicker,
        signedTxHex: fixtures.valid.hex,
      });
      expect(response).to.deep.equal(serverResponse.message);
    });
  });
});
