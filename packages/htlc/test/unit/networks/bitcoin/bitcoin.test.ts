import { BitcoinSubnet, Network } from '@radar/redshift-types';
import { HTLC } from '../../../../src';
import { config, expect } from '../../../lib/helpers';

describe('UTXO HTLC - Bitcoin Network', () => {
  const { valid, invalid } = config.bitcoin.unit;
  describe('General', () => {
    it('should decompile the redeem script when a valid relative timelock redeem script is passed in the constructor', () => {
      const htlc = HTLC.construct(
        Network.BITCOIN,
        BitcoinSubnet.SIMNET,
        valid.relativeTimeLock.redeemScript,
      );
      expect(htlc.details).to.deep.equal(valid.relativeTimeLock.htlc.details);
    });

    it('should compile the relative timelock redeem script when valid htlc args are passed in the constructor', () => {
      const htlc = HTLC.construct(
        Network.BITCOIN,
        BitcoinSubnet.SIMNET,
        valid.relativeTimeLock.htlc.args,
      );
      expect(htlc.redeemScript).to.equal(valid.relativeTimeLock.redeemScript);
      expect(htlc.details).to.deep.equal(valid.relativeTimeLock.htlc.details);
    });

    it('should decompile the redeem script when a valid absolute timelock redeem script is passed in the constructor', () => {
      const htlc = HTLC.construct(
        Network.BITCOIN,
        BitcoinSubnet.SIMNET,
        valid.absoluteTimeLock.redeemScript,
      );
      expect(htlc.details).to.deep.equal(valid.absoluteTimeLock.htlc.details);
    });

    it('should compile the absolute timelock redeem script when valid htlc args are passed in the constructor', () => {
      const htlc = HTLC.construct(
        Network.BITCOIN,
        BitcoinSubnet.SIMNET,
        valid.absoluteTimeLock.htlc.args,
      );
      expect(htlc.redeemScript).to.equal(valid.absoluteTimeLock.redeemScript);
      expect(htlc.details).to.deep.equal(valid.absoluteTimeLock.htlc.details);
    });

    it('should throw an InvalidRedeemScriptLength error when an arg with an invalid length is passed', () => {
      expect(() =>
        HTLC.construct(
          Network.BITCOIN,
          BitcoinSubnet.SIMNET,
          invalid.redeemScript,
        ),
      ).to.throw(Error, /InvalidRedeemScriptLength/);
    });
  });
});
