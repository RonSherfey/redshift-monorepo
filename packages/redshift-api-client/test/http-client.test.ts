import { ApiError, UserSwapState } from '@radar/redshift-types';
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

  describe('getMarketRequirements', () => {
    before(async () => {
      //  All market requirements
      nock(`${config.url}/api`)
        .get(`/markets/requirements`)
        .reply(200, fixtures.valid.allMarketRequirements.response);

      //  Single market requirements
      nock(`${config.url}/api`)
        .get(`/markets/${fixtures.valid.market}/requirements`)
        .reply(200, fixtures.valid.singleMarketRequirements.response);
    });

    it('should return an error if the market is invalid', async () => {
      await expect(
        client.getMarketRequirements(fixtures.invalid.market),
      ).to.be.rejectedWith(Error, ApiError.INVALID_MARKET);
    });

    it('should return requirements for a single market if the market is valid', async () => {
      const requirements = await client.getMarketRequirements(
        fixtures.valid.market,
      );
      expect(requirements).to.deep.equal(
        fixtures.valid.singleMarketRequirements.response,
      );
    });

    it('should return requirements for all markets', async () => {
      const requirements = await client.getMarketRequirements();
      expect(requirements).to.deep.equal(
        fixtures.valid.allMarketRequirements.response,
      );
    });
  });

  describe('getOrders', () => {
    before(async () => {
      nock(`${config.url}/api`)
        .get('/orders')
        .query({ invoiceHash: await sha256(fixtures.valid.invoice) })
        .reply(200, fixtures.valid.orders.response);
    });

    it('should return an error if the invoice is invalid', async () => {
      await expect(
        client.getOrders(fixtures.invalid.invoice),
      ).to.be.rejectedWith(Error, ApiError.INVALID_INVOICE);
    });

    it('should return orders if the invoice is valid', async () => {
      const orders = await client.getOrders(fixtures.valid.invoice);
      expect(orders).to.deep.equal(fixtures.valid.orders.response);
    });
  });

  describe('getOrder', () => {
    before(async () => {
      nock(`${config.url}/api`)
        .get(`/orders/${fixtures.valid.orderId}`)
        .reply(200, fixtures.valid.order.response);
    });

    it('should return an error if the order id is invalid', async () => {
      await expect(
        client.getOrder(fixtures.invalid.orderId),
      ).to.be.rejectedWith(Error, ApiError.INVALID_ORDER_ID);
    });

    it('should return an order if the order id is valid', async () => {
      const order = await client.getOrder(fixtures.valid.orderId);
      expect(order).to.deep.equal(fixtures.valid.order.response);
    });
  });

  describe('getOrderState', () => {
    before(async () => {
      nock(`${config.url}/api`)
        .get(`/orders/${fixtures.valid.orderId}/state`)
        .reply(200, fixtures.valid.orderState.response);
    });

    it('should return an error if the order id is invalid', async () => {
      await expect(
        client.getOrderState(fixtures.invalid.orderId),
      ).to.be.rejectedWith(Error, ApiError.INVALID_ORDER_ID);
    });

    it('should return an orders state if the order id is valid', async () => {
      const state = await client.getOrderState(fixtures.valid.orderId);
      expect(state).to.equal(UserSwapState.COMPLETE);
    });
  });

  describe('getOrderFundDetails', () => {
    before(async () => {
      nock(`${config.url}/api`)
        .get(`/orders/${fixtures.valid.orderId}/fundDetails`)
        .reply(200, fixtures.valid.orderFundDetails.response);
    });

    it('should return an error if the order id is invalid', async () => {
      await expect(
        client.getOrderFundDetails(fixtures.invalid.orderId),
      ).to.be.rejectedWith(Error, ApiError.INVALID_ORDER_ID);
    });

    it('should return an orders fund details if the order id is valid', async () => {
      const details = await client.getOrderFundDetails(fixtures.valid.orderId);
      expect(details).to.deep.equal(fixtures.valid.orderFundDetails.response);
    });
  });

  describe('getOrderTransactions', () => {
    before(async () => {
      nock(`${config.url}/api`)
        .get(`/orders/${fixtures.valid.orderId}/transactions`)
        .reply(200, fixtures.valid.orderTransactions.response);
    });

    it('should return an error if the order id is invalid', async () => {
      await expect(
        client.getOrderTransactions(fixtures.invalid.orderId),
      ).to.be.rejectedWith(Error, ApiError.INVALID_ORDER_ID);
    });

    it('should return an orders transactions if the order id is valid', async () => {
      const details = await client.getOrderTransactions(fixtures.valid.orderId);
      expect(details).to.deep.equal(fixtures.valid.orderTransactions.response);
    });
  });

  describe('getOrderRefundDetails', () => {
    before(async () => {
      nock(`${config.url}/api`)
        .get(`/orders/${fixtures.valid.orderId}/refund`)
        .reply(200, fixtures.valid.orderRefund.response);
    });

    it('should return an error if the order id is invalid', async () => {
      await expect(
        client.getOrderRefundDetails(fixtures.invalid.orderId),
      ).to.be.rejectedWith(Error, ApiError.INVALID_ORDER_ID);
    });

    it('should return an orders refund details if the id is valid', async () => {
      const details = await client.getOrderRefundDetails(
        fixtures.valid.orderId,
      );
      expect(details).to.deep.equal(fixtures.valid.orderRefund.response);
    });
  });
});
