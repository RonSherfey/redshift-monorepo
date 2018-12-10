import { init } from 'truffle-test-utils';
import { EtherSwapInstance } from '../types/truffle-contracts';
import { config, etherToWei } from './lib';
import { expect } from 'chai';

const Swap = artifacts.require('EtherSwap');

contract('EtherSwap - Claiming', accounts => {
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
  });

  it('should revert if the order does not exist', async () => {
    await expect(
      swapInstance.claim(invalidArgs.lninvoiceHash, validArgs.preimage),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should revert if the preimage is incorrect', async () => {
    await expect(
      swapInstance.claim(validArgs.lninvoiceHash, invalidArgs.preimage),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should succeed if the args are valid', async () => {
    const res = await swapInstance.claim(
      validArgs.lninvoiceHash,
      validArgs.preimage,
    );
    assert.web3Event(
      res,
      {
        event: 'OrderClaimed',
        args: {
          lninvoiceHash: validArgs.lninvoiceHash,
        },
      },
      'OrderClaimed was emitted',
    );
  });
});
