import { EtherSwapInstance } from '../types/truffle-contracts';
import { expect } from './lib';

// tslint:disable:variable-name
const Swap = artifacts.require('EtherSwap');

contract('EtherSwap - General', accounts => {
  const deployer = accounts[0];

  let swap: EtherSwapInstance;
  before(async () => {
    swap = await Swap.new();
  });

  it('should return the contract owner', async () => {
    const owner = await swap.owner.call(undefined);
    assert.equal(owner, deployer, 'Owner is deployer');
  });

  it('should return the default refund delay', async () => {
    const refundDelay = await swap.refundDelay();
    assert.equal(refundDelay.toString(), '960');
  });

  it('should not allow a non-owner to set the refund delay', async () => {
    await expect(
      swap.setRefundDelay(10 * 60 * 4, {
        from: accounts[2],
      }),
    ).to.be.rejectedWith(/Only owner can call this function./);
  });

  it('should not allow the owner to set the refund delay greater than the maximum', async () => {
    await expect(swap.setRefundDelay(60 * 60 * 2 * 4 + 1)).to.be.rejectedWith(
      /Delay is too large./,
    );
  });

  it('should allow the owner to set the refund delay below the maximum', async () => {
    const defaultRefundDelay = await swap.refundDelay();
    await swap.setRefundDelay(10 * 60 * 4); // 10 hours
    const newRefundDelay = await swap.refundDelay();

    assert.equal(defaultRefundDelay.toString(), '960'); // 4 hours
    assert.equal(newRefundDelay.toString(), '2400');
  });

  it('should allow transfer ownership', async () => {
    const newOwner = accounts[1];
    await swap.transferOwnership(newOwner);
    const owner = await swap.owner.call(undefined);
    assert.equal(owner, newOwner, 'New owner is deployer');
  });

  it('should not allow a non-owner to transfer ownership', async () => {
    const newOwner = accounts[1];
    await expect(
      swap.transferOwnership(newOwner, {
        from: accounts[2],
      }),
    ).to.be.rejectedWith(/Only owner can call this function./);
  });
});
