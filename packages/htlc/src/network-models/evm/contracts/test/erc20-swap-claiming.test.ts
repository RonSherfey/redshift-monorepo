import {
  Dummy18DecimalERC20TokenInstance,
  ERC20SwapInstance,
} from '../types/truffle-contracts';
import { config, expect } from './lib';

// tslint:disable:variable-name
const ERC20Token = artifacts.require('Dummy18DecimalERC20Token');
const ERC20Swap = artifacts.require('ERC20Swap');

contract('ERC20Swap - Claiming', () => {
  const [validArgs] = config.valid;
  const invalidArgs = config.invalid;

  let erc20Token: Dummy18DecimalERC20TokenInstance;
  let swap: ERC20SwapInstance;

  beforeEach(async () => {
    erc20Token = await ERC20Token.new();
    swap = await ERC20Swap.new();

    await erc20Token.approve(swap.address, validArgs.tokenAmount);

    await swap.fund({
      orderUUID: validArgs.orderUUID,
      paymentHash: validArgs.paymentHash,
      tokenContractAddress: erc20Token.address,
      tokenAmount: validArgs.tokenAmount,
    });
  });

  it('should revert if the order does not exist', async () => {
    await expect(
      swap.claim({
        orderUUID: invalidArgs.orderUUID,
        paymentPreimage: validArgs.paymentPreimage,
      }),
    ).to.be.rejectedWith(/Order does not exist./);
  });

  it('should revert if the preimage is incorrect', async () => {
    await expect(
      swap.claim({
        orderUUID: validArgs.orderUUID,
        paymentPreimage: invalidArgs.paymentPreimage,
      }),
    ).to.be.rejectedWith(/Incorrect payment preimage./);
  });

  it('should succeed if the order exists and the payment preimage is correct', async () => {
    const res = await swap.claim({
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

  it('should revert if already claimed', async () => {
    await swap.claim({
      orderUUID: validArgs.orderUUID,
      paymentPreimage: validArgs.paymentPreimage,
    });
    await expect(
      swap.claim({
        orderUUID: validArgs.orderUUID,
        paymentPreimage: validArgs.paymentPreimage,
      }),
    ).to.be.rejectedWith(/Order not in claimable state./);
  });
});
