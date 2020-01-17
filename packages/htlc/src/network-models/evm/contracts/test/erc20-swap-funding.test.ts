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
  let erc20TokenInstance: Dummy18DecimalERC20TokenInstance;
  let erc20SwapInstance: ERC20SwapInstance;

  before(async () => {
    // deploy test erc20 token
    erc20TokenInstance = await ERC20Token.deployed();
  });

  describe('fund', () => {
    before(async () => {
      // deploy erc20 swap contract
      erc20SwapInstance = await ERC20Swap.new();
    });

    it('should emit the expected logs when a valid funding payment is received', async () => {
      // approve token for transfer
      await erc20TokenInstance.approve(erc20SwapInstance.address, tokenAmount);
      // fund swap contract
      const res = await erc20SwapInstance.fund({
        orderUUID,
        paymentHash,
        tokenAmount,
        tokenContractAddress: erc20TokenInstance.address,
      });
      expect(res.logs).to.shallowDeepEqual([
        {
          event: 'OrderFundingReceived',
          args: {
            orderUUID,
            paymentHash,
            onchainAmount: tokenAmount.toString(),
            refundBlockHeight: String(res.receipt.blockNumber + refundDelay),
            tokenContractAddress: erc20TokenInstance.address,
          },
        },
      ]);
    });

    it('should increment the on chain amount when a second valid funding payment is received', async () => {
      // approve token for transfer
      await erc20TokenInstance.approve(erc20SwapInstance.address, tokenAmount);
      // fund swap contract
      const res = await erc20SwapInstance.fund({
        orderUUID,
        paymentHash,
        tokenAmount,
        tokenContractAddress: erc20TokenInstance.address,
      });
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
            tokenContractAddress: erc20TokenInstance.address,
          },
        },
      ]);
    });
  });

  describe('fundWithAdminRefundEnabled', () => {
    before(async () => {
      // deploy erc20 swap contract
      erc20SwapInstance = await ERC20Swap.new();
    });

    it('should emit the expected logs when a valid funding payment is received', async () => {
      // approve token for transfer
      await erc20TokenInstance.approve(erc20SwapInstance.address, tokenAmount);
      // fund swap contract
      const res = await erc20SwapInstance.fundWithAdminRefundEnabled({
        orderUUID,
        paymentHash,
        refundHash,
        tokenAmount,
        tokenContractAddress: erc20TokenInstance.address,
      });
      expect(res.logs).to.shallowDeepEqual([
        {
          event: 'OrderFundingReceivedWithAdminRefundEnabled',
          args: {
            orderUUID,
            paymentHash,
            refundHash,
            onchainAmount: tokenAmount.toString(),
            refundBlockHeight: String(res.receipt.blockNumber + refundDelay),
            tokenContractAddress: erc20TokenInstance.address,
          },
        },
      ]);
    });

    it('should increment the on chain amount when a second valid funding payment is received', async () => {
      // approve token for transfer
      await erc20TokenInstance.approve(erc20SwapInstance.address, tokenAmount);
      // fund swap contract
      const res = await erc20SwapInstance.fundWithAdminRefundEnabled({
        orderUUID,
        paymentHash,
        refundHash,
        tokenAmount,
        tokenContractAddress: erc20TokenInstance.address,
      });
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
            tokenContractAddress: erc20TokenInstance.address,
          },
        },
      ]);
    });
  });
});
