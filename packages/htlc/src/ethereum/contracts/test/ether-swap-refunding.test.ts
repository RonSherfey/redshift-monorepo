import { init } from 'truffle-test-utils';
import { EtherSwapInstance } from '../types/truffle-contracts';
import { config, etherToWei } from './lib';
import { expect } from 'chai';

const Swap = artifacts.require('EtherSwap');

contract('EtherSwap - Refunding', accounts => {
  const recipient = accounts[1];
  const [validArgs] = config.valid;
  const invalidArgs = config.invalid;
  let swapInstance: EtherSwapInstance;
  before(async () => {
    init();
    swapInstance = await Swap.deployed();
    await swapInstance.fund(validArgs.lninvoiceHash, validArgs.hash, {
      from: accounts[1],
      value: etherToWei(0.01),
    });
    await swapInstance.setRefundDelay(0); // 0 block delay for testing purposes
  });

  it('should revert if the order does not exist', async () => {
    await expect(
      swapInstance.refund(invalidArgs.lninvoiceHash),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should revert if the preimage is incorrect', async () => {
    await expect(
      swapInstance.refund(invalidArgs.lninvoiceHash),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should revert if the timelock has not been exceeded', async () => {
    await expect(
      swapInstance.refund(invalidArgs.lninvoiceHash),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should succeed if the args are valid', async () => {
    const moreValidArgs = config.valid[1];
    await swapInstance.fund(moreValidArgs.lninvoiceHash, moreValidArgs.hash, {
      from: accounts[1],
      value: etherToWei(0.01),
    });
    const res = await swapInstance.refund(moreValidArgs.lninvoiceHash);
    assert.web3Event(
      res,
      {
        event: 'OrderRefunded',
        args: {
          lninvoiceHash: moreValidArgs.lninvoiceHash,
        },
      },
      'OrderRefunded was emitted',
    );
  });
});
