import { EtherSwapInstance } from '../types/truffle-contracts';
import { config, etherToWei, expect } from './lib';

// tslint:disable:variable-name
const Swap = artifacts.require('EtherSwap');

contract('EtherSwap - Refunding', () => {
  const [validArgs] = config.valid;
  const invalidArgs = config.invalid;
  let swap: EtherSwapInstance;

  const fundSwap = async () => {
    await swap.fund(
      {
        orderUUID: validArgs.orderUUID,
        paymentHash: validArgs.paymentHash,
      },
      {
        value: etherToWei(0.01),
      },
    );
  };

  const fundSwapWithAdminRefundEnabled = async () => {
    await swap.fundWithAdminRefundEnabled(
      {
        orderUUID: validArgs.orderUUID,
        paymentHash: validArgs.paymentHash,
        refundHash: validArgs.refundHash,
      },
      {
        value: etherToWei(0.01),
      },
    );
  };

  beforeEach(async () => {
    swap = await Swap.new();
  });

  describe('refund', () => {
    it('should revert if the timelock has not been met', async () => {
      await fundSwap();
      await expect(swap.refund(validArgs.orderUUID)).to.be.rejectedWith(
        /Too early to refund./,
      );
    });

    it('should revert if the order does not exist', async () => {
      await swap.setRefundDelay(0);
      await fundSwap();
      await expect(swap.refund(invalidArgs.orderUUID)).to.be.rejectedWith(
        /Order does not exist./,
      );
    });

    it('should succeed if the order exists and the timelock has been met', async () => {
      await swap.setRefundDelay(0);
      await fundSwap();
      const res = await swap.refund(validArgs.orderUUID);
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
      await swap.setRefundDelay(0);
      await fundSwap();
      await swap.refund(validArgs.orderUUID);
      await expect(swap.refund(validArgs.orderUUID)).to.be.rejectedWith(
        /Order not in refundable state./,
      );
    });
  });

  describe('adminRefund', () => {
    it('should revert if the order does not exist', async () => {
      await fundSwapWithAdminRefundEnabled();
      await expect(
        swap.adminRefund({
          orderUUID: invalidArgs.orderUUID,
          refundPreimage: validArgs.refundPreimage,
        }),
      ).to.be.rejectedWith(/Order does not exist./);
    });

    it('should revert if the preimage is incorrect', async () => {
      await fundSwapWithAdminRefundEnabled();
      await expect(
        swap.adminRefund({
          orderUUID: validArgs.orderUUID,
          refundPreimage: invalidArgs.refundPreimage,
        }),
      ).to.be.rejectedWith(/Incorrect refund preimage./);
    });

    it('should revert if the swap was not funded with admin refund disabled', async () => {
      await fundSwap();
      await expect(
        swap.adminRefund({
          orderUUID: validArgs.orderUUID,
          refundPreimage: validArgs.refundPreimage,
        }),
      ).to.be.rejectedWith(/Admin refund not allowed./);
    });

    it('should succeed if the order exists and the refund preimage is correct', async () => {
      await fundSwapWithAdminRefundEnabled();
      const res = await swap.adminRefund({
        orderUUID: validArgs.orderUUID,
        refundPreimage: validArgs.refundPreimage,
      });
      expect(res.logs).to.shallowDeepEqual([
        {
          event: 'OrderAdminRefunded',
          args: {
            orderUUID: validArgs.orderUUID,
          },
        },
      ]);
    });

    it('should revert if already refunded', async () => {
      await fundSwapWithAdminRefundEnabled();
      await swap.adminRefund({
        orderUUID: validArgs.orderUUID,
        refundPreimage: validArgs.refundPreimage,
      });
      await expect(
        swap.adminRefund({
          orderUUID: validArgs.orderUUID,
          refundPreimage: validArgs.refundPreimage,
        }),
      ).to.be.rejectedWith(/Order not in refundable state./);
    });
  });
});
