import { EtherSwapInstance } from '../types/truffle-contracts';
import { config, etherToWei, expect } from './lib';

// tslint:disable:variable-name
const Swap = artifacts.require('EtherSwap');

contract('EtherSwap - Claiming', accounts => {
  const [validArgs] = config.valid;
  const invalidArgs = config.invalid;

  let swap: EtherSwapInstance;

  beforeEach(async () => {
    swap = await Swap.new();
    await swap.fund(
      {
        orderUUID: validArgs.orderUUID,
        paymentHash: validArgs.paymentHash,
      },
      {
        value: etherToWei(0.01),
      },
    );
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
