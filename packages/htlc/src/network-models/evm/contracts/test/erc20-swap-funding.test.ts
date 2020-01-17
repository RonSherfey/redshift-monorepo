import BigNumber from 'bignumber.js';
import {
  Dummy18DecimalERC20TokenInstance,
  ERC20SwapInstance,
} from '../types/truffle-contracts';
import { config, expect } from './lib';

// tslint:disable:variable-name
const ERC20Token = artifacts.require('Dummy18DecimalERC20Token');
const ERC20Swap = artifacts.require('ERC20Swap');
ERC20Swap.numberFormat = 'String';

contract('ERC20Swap - Funding', () => {
  const [
    { orderUUID, paymentHash, refundHash, tokenAmount, refundDelay },
  ] = config.valid;

  let erc20Token: Dummy18DecimalERC20TokenInstance;
  let swap: ERC20SwapInstance;

  const fundSwap = async () => {
    return swap.fund({
      orderUUID,
      paymentHash,
      tokenAmount,
      tokenContractAddress: erc20Token.address,
    });
  };

  const fundSwapWithAdminRefundEnabled = async () => {
    return swap.fundWithAdminRefundEnabled({
      orderUUID,
      paymentHash,
      tokenAmount,
      refundHash,
      tokenContractAddress: erc20Token.address,
    });
  };

  before(async () => {
    erc20Token = await ERC20Token.deployed();
  });

  describe('fund', () => {
    before(async () => {
      swap = await ERC20Swap.new();
    });

    it('should emit the expected logs when a valid funding payment is received', async () => {
      await erc20Token.approve(swap.address, tokenAmount);
      const res = await fundSwap();
      expect(res.logs).to.shallowDeepEqual([
        {
          event: 'OrderFundingReceived',
          args: {
            orderUUID,
            paymentHash,
            onchainAmount: tokenAmount.toString(),
            refundBlockHeight: String(res.receipt.blockNumber + refundDelay),
            tokenContractAddress: erc20Token.address,
          },
        },
      ]);
    });

    it('should increment the on chain amount when a second valid funding payment is received', async () => {
      await erc20Token.approve(swap.address, tokenAmount);
      const res = await fundSwap();
      expect(res.logs).to.shallowDeepEqual([
        {
          event: 'OrderFundingReceived',
          args: {
            orderUUID,
            paymentHash,
            onchainAmount: new BigNumber(tokenAmount).times(2).toString(),
            refundBlockHeight: String(
              res.receipt.blockNumber + refundDelay - 2,
            ), // because 2 function calls: approve and fund
            tokenContractAddress: erc20Token.address,
          },
        },
      ]);
    });
  });

  describe('fundWithAdminRefundEnabled', () => {
    before(async () => {
      swap = await ERC20Swap.new();
    });

    it('should emit the expected logs when a valid funding payment is received', async () => {
      await erc20Token.approve(swap.address, tokenAmount);
      const res = await fundSwapWithAdminRefundEnabled();
      expect(res.logs).to.shallowDeepEqual([
        {
          event: 'OrderFundingReceivedWithAdminRefundEnabled',
          args: {
            orderUUID,
            paymentHash,
            refundHash,
            onchainAmount: tokenAmount.toString(),
            refundBlockHeight: String(res.receipt.blockNumber + refundDelay),
            tokenContractAddress: erc20Token.address,
          },
        },
      ]);
    });

    it('should increment the on chain amount when a second valid funding payment is received', async () => {
      await erc20Token.approve(swap.address, tokenAmount);
      const res = await fundSwapWithAdminRefundEnabled();
      expect(res.logs).to.shallowDeepEqual([
        {
          event: 'OrderFundingReceivedWithAdminRefundEnabled',
          args: {
            orderUUID,
            paymentHash,
            refundHash,
            onchainAmount: new BigNumber(tokenAmount).times(2).toString(),
            refundBlockHeight: String(
              res.receipt.blockNumber + refundDelay - 2,
            ), // because 2 function calls: approve and fund
            tokenContractAddress: erc20Token.address,
          },
        },
      ]);
    });
  });
});
