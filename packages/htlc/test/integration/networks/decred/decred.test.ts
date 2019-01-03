import explorers from 'bitcore-explorers';
import bitcore from 'bitcore-lib';
import { DecredHtlc, HTLC } from '../../../../src';
import { DecredSubnet, Network } from '../../../../src/types';
import { expect } from '../../../lib/helpers';

describe('Decred HTLC - Decred Network', () => {
  describe('Fund', () => {
    it('should create htlc address', async () => {
      const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
        Network.DECRED,
        DecredSubnet.DCRTESTNET,
        {
          secret:
            '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
        },
      );

      htlc.fund('hashHere', 'TsRDtJmAbavWHUEaDcCjG7YwDRJThhAnafp');
      expect(typeof htlc.timelock).to.equal('number');
      expect(bitcore.Address.isValid(htlc.serverAddress)).to.equal(true);
    });
  });
});
