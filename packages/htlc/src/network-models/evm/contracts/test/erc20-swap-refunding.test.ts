import {
  Dummy18DecimalERC20TokenInstance,
  ERC20SwapInstance,
} from '../types/truffle-contracts';
import { config, expect } from './lib';

// tslint:disable:variable-name
const ERC20Token = artifacts.require('Dummy18DecimalERC20Token');
const Swap = artifacts.require('ERC20Swap');

contract('ERC20Swap - Refunding', () => {
  const [validArgs] = config.valid;
  const invalidArgs = config.invalid;
  let erc20Token: Dummy18DecimalERC20TokenInstance;
  let swap: ERC20SwapInstance;

  const fundSwap = async () => {
    await swap.fund({
      orderUUID: validArgs.orderUUID,
      paymentHash: validArgs.paymentHash,
      tokenContractAddress: erc20Token.address,
      tokenAmount: validArgs.tokenAmount,
    });
  };

  const fundSwapWithAdminRefundEnabled = async () => {
    await swap.fundWithAdminRefundEnabled({
      orderUUID: validArgs.orderUUID,
      paymentHash: validArgs.paymentHash,
      tokenContractAddress: erc20Token.address,
      tokenAmount: validArgs.tokenAmount,
      refundHash: validArgs.refundHash,
    });
  };

  before(async () => {
    erc20Token = await ERC20Token.new();
  });

  beforeEach(async () => {
    swap = await Swap.new();
    await erc20Token.approve(swap.address, validArgs.tokenAmount);
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
