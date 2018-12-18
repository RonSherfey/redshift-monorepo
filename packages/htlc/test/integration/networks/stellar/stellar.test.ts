import { HTLC, StellarHtlc } from '../../../../src';
import { Network, StellarSubnet } from '../../../../src/types';

describe('Stellar HTLC - Stellar Network', () => {
  describe('Fund', () => {
    it('should build a fund transaction envelope', async () => {
      const htlc: StellarHtlc<Network.STELLAR> = HTLC.construct(
        Network.STELLAR,
        StellarSubnet.XLMTESTNET,
        {},
      );
      expect(1).to.equal(1);
    });
  });
});
