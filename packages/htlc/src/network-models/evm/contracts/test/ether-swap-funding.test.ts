import { EtherSwapInstance } from '../types/truffle-contracts';
import { config, etherToWei, expect } from './lib';

// tslint:disable:variable-name
const Swap = artifacts.require('EtherSwap');
Swap.numberFormat = 'String';

contract('EtherSwap - Funding', accounts => {
  const [{ orderUUID, paymentHash, refundHash, refundDelay }] = config.valid;

  let swap: EtherSwapInstance;

  describe('fund', () => {
    let res: Truffle.TransactionResponse;
    before(async () => {
      swap = await Swap.new();
    });

    beforeEach(async () => {
      res = await swap.fund(
        {
          orderUUID,
          paymentHash,
        },
        {
          value: etherToWei(0.01),
        },
      );
    });

    it('should emit the expected logs when a valid funding payment is received', async () => {
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
    let res: Truffle.TransactionResponse;
    before(async () => {
      swap = await Swap.new();
    });

    beforeEach(async () => {
      res = await swap.fundWithAdminRefundEnabled(
        {
          orderUUID,
          paymentHash,
          refundHash,
        },
        {
          value: etherToWei(0.01),
        },
      );
    });

    it('should emit the expected logs when a valid funding payment is received', async () => {
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
