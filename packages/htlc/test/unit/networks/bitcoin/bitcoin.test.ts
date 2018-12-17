import { HTLC } from '../../../../src';
import { BitcoinSubnet, Network } from '../../../../src/types';
import { config, expect } from '../../../lib/helpers';

describe('UTXO HTLC - Bitcoin Network', () => {
  const { valid, invalid } = config.bitcoin.unit;
  describe('General', () => {
    it('should decompile the redeem script when a valid redeem script is passed in the constructor', () => {
      const htlc = HTLC.construct(
        Network.BITCOIN,
        BitcoinSubnet.SIMNET,
        config.bitcoin.unit.valid.redeemScript,
      );
      expect(htlc.details).to.deep.equal(valid.htlc.details);
    });

    it('should compile the redeem script when valid htlc args are passed in the constructor', () => {
      const htlc = HTLC.construct(
        Network.BITCOIN,
        BitcoinSubnet.SIMNET,
        valid.htlc.args,
      );
      expect(htlc.redeemScript).to.equal(valid.redeemScript);
      expect(htlc.details).to.deep.equal(valid.htlc.details);
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
