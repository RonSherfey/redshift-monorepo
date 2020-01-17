import { ERC20SwapInstance } from '../types/truffle-contracts';
import { expect } from './lib';

// tslint:disable:variable-name
const ERC20Swap = artifacts.require('ERC20Swap');

contract('ERC20Swap - General', accounts => {
  const deployer = accounts[0];

  let swap: ERC20SwapInstance;
  before(async () => {
    swap = await ERC20Swap.deployed();
  });

  it('should return the contract owner', async () => {
    const owner = await swap.owner.call();
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
});
