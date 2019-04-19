import { ApiError, NetworkError, UserSwapState } from '@radar/redshift-types';
import nock from 'nock';
import sha256 from 'simple-sha256';
import { HttpClient } from '../src';
import { config } from '../src/config';
import { expect, fixtures } from './lib';

describe('HTTP Client', () => {
  let client: HttpClient;
  before(() => {
    client = new HttpClient();
  });

  describe('getMarkets', () => {
    before(() => {
      nock(`${config.url}/api`)
        .get('/markets')
        .reply(200, fixtures.valid.markets.response);
    });

    it('should return the active markets', async () => {
      const markets = await client.getMarkets();
      expect(markets).to.deep.equal(fixtures.valid.markets.response);
    });
  });

  describe('getOrder', () => {
    before(async () => {
      nock(`${config.url}/api`)
        .get(
          `/${fixtures.valid.network}/orders/${await sha256(
            fixtures.valid.invoice,
          )}`,
        )
        .reply(200, fixtures.valid.order.response);
    });

    it('should return an error if the network is invalid', async () => {
      await expect(
        client.getOrder(fixtures.invalid.network, fixtures.valid.invoice),
      ).to.be.rejectedWith(Error, NetworkError.INVALID_NETWORK);
    });

    it('should return an error if the invoice is invalid', async () => {
      await expect(
        client.getOrder(fixtures.valid.network, fixtures.invalid.invoice),
      ).to.be.rejectedWith(Error, ApiError.INVALID_INVOICE);
    });

    it('should return an order when passed valid params', async () => {
      const order = await client.getOrder(
        fixtures.valid.network,
        fixtures.valid.invoice,
      );
      expect(order).to.deep.equal(fixtures.valid.order.response);
    });
  });

  describe('getOrderState', () => {
    before(async () => {
      nock(`${config.url}/api`)
        .get(
          `/${fixtures.valid.network}/orders/${await sha256(
            fixtures.valid.invoice,
          )}/state`,
        )
        .reply(200, fixtures.valid.orderState.response);
    });

    it('should return an error if the network is invalid', async () => {
      await expect(
        client.getOrderState(fixtures.invalid.network, fixtures.valid.invoice),
      ).to.be.rejectedWith(Error, NetworkError.INVALID_NETWORK);
    });

    it('should return an error if the invoice is invalid', async () => {
      await expect(
        client.getOrderState(fixtures.valid.network, fixtures.invalid.invoice),
      ).to.be.rejectedWith(Error, ApiError.INVALID_INVOICE);
    });

    it('should return an order', async () => {
      const state = await client.getOrderState(
        fixtures.valid.network,
        fixtures.valid.invoice,
      );
      expect(state).to.equal(UserSwapState.Complete);
    });
  });
});
