import bitcore from 'bitcore-lib';
import { DecredHtlc, HTLC } from '../../../../src';
import { DecredSubnet, Network } from '../../../../src/types';
import { expect } from '../../../lib/helpers';

describe('Decred HTLC - Decred Network', () => {
  describe('Create', () => {
    it('should create htlc address', async () => {
      const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
        Network.DECRED,
        DecredSubnet.DCRTESTNET,
        { secret: 'serverSecret' },
      );
      expect(htlc).to.equal(htlc);
    });
  });
});
