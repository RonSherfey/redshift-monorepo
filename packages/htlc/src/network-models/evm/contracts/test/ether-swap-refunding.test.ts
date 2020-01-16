import { EtherSwapInstance } from '../types/truffle-contracts';
import { config, etherToWei, expect } from './lib';

// tslint:disable:variable-name
const Swap = artifacts.require('EtherSwap');

contract('EtherSwap - Refunding', accounts => {
  const [validArgs] = config.valid;
  const invalidArgs = config.invalid;
  let swapInstance: EtherSwapInstance;

  const fundSwap = async () => {
    await swapInstance.fund(
      {
        orderUUID: validArgs.orderUUID,
        paymentHash: validArgs.paymentHash,
      },
      {
        from: accounts[1],
        value: etherToWei(0.01),
      },
    );
  };

  const fundSwapWithRefundHashlock = async () => {
    await swapInstance.fundWithRefundHashlock(
      {
        orderUUID: validArgs.orderUUID,
        paymentHash: validArgs.paymentHash,
        refundHash: validArgs.refundHash,
      },
      {
        from: accounts[1],
        value: etherToWei(0.01),
      },
    );
  };

  beforeEach(async () => {
    swapInstance = await Swap.new();
  });

  describe('refund', () => {
    it('should revert if the timelock has not been met', async () => {
      await fundSwap();
      await expect(swapInstance.refund(validArgs.orderUUID)).to.be.rejectedWith(
        /VM Exception while processing transaction: revert/,
      );
    });

    it('should revert if the order does not exist', async () => {
      await swapInstance.setRefundDelay(0);
      await fundSwap();
      await expect(
        swapInstance.refund(invalidArgs.orderUUID),
      ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
    });

    it('should succeed if the order exists and the timelock has been met', async () => {
      await swapInstance.setRefundDelay(0);
      await fundSwap();
      const res = await swapInstance.refund(validArgs.orderUUID);
      expect(res.logs).to.shallowDeepEqual([
        {
          event: 'OrderRefunded',
          args: {
            orderUUID: validArgs.orderUUID,
          },
        },
      ]);
    });

    it('should revert if already refunded', async () => {
      await swapInstance.setRefundDelay(0);
      await fundSwap();
      await swapInstance.refund(validArgs.orderUUID);
      await expect(swapInstance.refund(validArgs.orderUUID)).to.be.rejectedWith(
        /VM Exception while processing transaction: revert/,
      );
    });
  });

  describe('adminRefund', () => {
    it('should revert if the order does not exist', async () => {
      await fundSwapWithRefundHashlock();
      await expect(
        swapInstance.adminRefund({
          orderUUID: invalidArgs.orderUUID,
          refundPreimage: validArgs.refundPreimage,
        }),
      ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
    });

    it('should revert if the preimage is incorrect', async () => {
      await fundSwapWithRefundHashlock();
      await expect(
        swapInstance.adminRefund({
          orderUUID: validArgs.orderUUID,
          refundPreimage: invalidArgs.refundPreimage,
        }),
      ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
    });

    it('should succeed if the order exists and the refund preimage is correct', async () => {
      await fundSwapWithRefundHashlock();
      const res = await swapInstance.adminRefund({
        orderUUID: validArgs.orderUUID,
        refundPreimage: validArgs.refundPreimage,
      });
      expect(res.logs).to.shallowDeepEqual([
        {
          event: 'OrderRefunded',
          args: {
            orderUUID: validArgs.orderUUID,
          },
        },
      ]);
    });

    it('should revert if already refunded', async () => {
      await fundSwapWithRefundHashlock();
      await swapInstance.adminRefund({
        orderUUID: validArgs.orderUUID,
        refundPreimage: validArgs.refundPreimage,
      });
      await expect(
        swapInstance.adminRefund({
          orderUUID: validArgs.orderUUID,
          refundPreimage: validArgs.refundPreimage,
        }),
      ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
    });
  });
});
