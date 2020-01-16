import { EtherSwapInstance } from '../types/truffle-contracts';
import { config, etherToWei, expect } from './lib';

// tslint:disable:variable-name
const Swap = artifacts.require('EtherSwap');
Swap.numberFormat = 'String';

contract('EtherSwap - Funding', accounts => {
  const [{ orderUUID, paymentHash, refundHash, refundDelay }] = config.valid;
  let swapInstance: EtherSwapInstance;

  describe('fund', () => {
    before(async () => {
      swapInstance = await Swap.new();
    });

    it('should emit the expected logs when a valid funding payment is received', async () => {
      const res = await swapInstance.fund(
        {
          orderUUID,
          paymentHash,
        },
        {
          from: accounts[1],
          value: etherToWei(0.01),
        },
      );
      expect(res.logs).to.shallowDeepEqual([
        {
          event: 'OrderFundingReceived',
          args: {
            orderUUID,
            paymentHash,
            onchainAmount: etherToWei(0.01),
            refundBlockHeight: String(res.receipt.blockNumber + refundDelay),
          },
        },
      ]);
    });

    it('should increment the on chain amount when a second valid funding payment is received', async () => {
      const res = await swapInstance.fund(
        {
          orderUUID,
          paymentHash,
        },
        {
          from: accounts[1],
          value: etherToWei(0.01),
          gas: 200000,
        },
      );
      expect(res.logs).to.shallowDeepEqual([
        {
          event: 'OrderFundingReceived',
          args: {
            orderUUID,
            paymentHash,
            onchainAmount: etherToWei(0.01 * 2),
            refundBlockHeight: String(
              res.receipt.blockNumber + refundDelay - 1,
            ), // because 1 function call: fund
          },
        },
      ]);
    });
  });

  describe('fundWithAdminRefundEnabled', () => {
    before(async () => {
      swapInstance = await Swap.new();
    });

    it('should emit the expected logs when a valid funding payment is received', async () => {
      const res = await swapInstance.fundWithAdminRefundEnabled(
        {
          orderUUID,
          paymentHash,
          refundHash,
        },
        {
          from: accounts[1],
          value: etherToWei(0.01),
        },
      );
      expect(res.logs).to.shallowDeepEqual([
        {
          event: 'OrderFundingReceivedWithAdminRefundEnabled',
          args: {
            orderUUID,
            paymentHash,
            refundHash,
            onchainAmount: etherToWei(0.01),
            refundBlockHeight: String(res.receipt.blockNumber + refundDelay),
          },
        },
      ]);
    });

    it('should increment the on chain amount when a second valid funding payment is received', async () => {
      const res = await swapInstance.fundWithAdminRefundEnabled(
        {
          orderUUID,
          paymentHash,
          refundHash,
        },
        {
          from: accounts[1],
          value: etherToWei(0.01),
          gas: 200000,
        },
      );
      expect(res.logs).to.shallowDeepEqual([
        {
          event: 'OrderFundingReceivedWithAdminRefundEnabled',
          args: {
            orderUUID,
            paymentHash,
            refundHash,
            onchainAmount: etherToWei(0.01 * 2),
            refundBlockHeight: String(
              res.receipt.blockNumber + refundDelay - 1,
            ), // because 1 function call: fund
          },
        },
      ]);
    });
  });
});
