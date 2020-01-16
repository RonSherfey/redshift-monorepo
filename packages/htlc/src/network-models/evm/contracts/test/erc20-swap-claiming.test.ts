import {
  Dummy18DecimalERC20TokenInstance,
  ERC20SwapInstance,
} from '../types/truffle-contracts';
import { config, expect } from './lib';

// tslint:disable:variable-name
const ERC20Token = artifacts.require('Dummy18DecimalERC20Token');
const ERC20Swap = artifacts.require('ERC20Swap');

contract('ERC20Swap - Claiming', accounts => {
  const [validArgs] = config.valid;
  const invalidArgs = config.invalid;

  let erc20TokenInstance: Dummy18DecimalERC20TokenInstance;
  let erc20SwapInstance: ERC20SwapInstance;
  before(async () => {
    // deploy test erc20 token
    erc20TokenInstance = await ERC20Token.deployed();
    // deploy erc20 swap contract
    erc20SwapInstance = await ERC20Swap.deployed();
    // approve token for transfer
    await erc20TokenInstance.approve(
      erc20SwapInstance.address,
      validArgs.tokenAmount,
    );
    // fund swap contract
    await erc20SwapInstance.fund({
      orderUUID: validArgs.orderUUID,
      paymentHash: validArgs.paymentHash,
      tokenContractAddress: erc20TokenInstance.address,
      tokenAmount: validArgs.tokenAmount,
    });
  });

  it('should revert if the order does not exist', async () => {
    await expect(
      erc20SwapInstance.claim({
        orderUUID: invalidArgs.orderUUID,
        paymentPreimage: validArgs.paymentPreimage,
      }),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should revert if the preimage is incorrect', async () => {
    await expect(
      erc20SwapInstance.claim({
        orderUUID: validArgs.orderUUID,
        paymentPreimage: invalidArgs.paymentPreimage,
      }),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should succeed if the args are valid', async () => {
    const res = await erc20SwapInstance.claim({
      orderUUID: validArgs.orderUUID,
      paymentPreimage: validArgs.paymentPreimage,
    });
    expect(res.logs).to.shallowDeepEqual([
      {
        event: 'OrderClaimed',
        args: {
          orderUUID: validArgs.orderUUID,
        },
      },
    ]);
  });
});
