import {
  Dummy18DecimalERC20TokenInstance,
  ERC20SwapInstance,
} from '../types/truffle-contracts';
import { config, expect } from './lib';

// tslint:disable:variable-name
const ERC20Token = artifacts.require('Dummy18DecimalERC20Token');
const ERC20Swap = artifacts.require('ERC20Swap');

contract('ERC20Swap - Refunding', accounts => {
  const [{ orderUUID, tokenAmount, hash }] = config.valid;
  const invalidArgs = config.invalid;
  let erc20TokenInstance: Dummy18DecimalERC20TokenInstance;
  let erc20SwapInstance: ERC20SwapInstance;

  before(async () => {
    // deploy test erc20 token
    erc20TokenInstance = await ERC20Token.deployed();
    // deploy erc20 swap contract
    erc20SwapInstance = await ERC20Swap.deployed();
    // 0 block delay for testing purposes
    await erc20SwapInstance.setRefundDelay(0);
  });

  it('should revert if the order does not exist', async () => {
    await expect(
      erc20SwapInstance.refund(
        invalidArgs.orderUUID,
        erc20TokenInstance.address,
      ),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should revert if the preimage is incorrect', async () => {
    await expect(
      erc20SwapInstance.refund(
        invalidArgs.orderUUID,
        erc20TokenInstance.address,
      ),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should revert if the timelock has not been exceeded', async () => {
    await expect(
      erc20SwapInstance.refund(
        invalidArgs.orderUUID,
        erc20TokenInstance.address,
      ),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should succeed if the args are valid', async () => {
    // approve token for transfer
    await erc20TokenInstance.approve(erc20SwapInstance.address, tokenAmount);
    // fund swap contract
    await erc20SwapInstance.fund(
      orderUUID,
      hash,
      erc20TokenInstance.address,
      tokenAmount,
    );
    // fast forward to the future
    const res = await erc20SwapInstance.refund(
      orderUUID,
      erc20TokenInstance.address,
    );
    expect(res.logs).to.shallowDeepEqual([
      {
        event: 'OrderRefunded',
        args: {
          orderUUID,
        },
      },
    ]);
  });
});
