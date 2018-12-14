import { UtxoHtlc } from '../../../../src';
import { BitcoinSubnet, Network } from '../../../../src/types';
import { config, expect } from '../../../lib/helpers';

describe('networks/utxo/utxo-htlc', () => {
  describe('General', () => {
    it('should decompile the redeem script when a valid redeem script is passed in the constructor', () => {
      const htlc = new UtxoHtlc(
        Network.BITCOIN,
        BitcoinSubnet.SIMNET,
        config.bitcoin.valid.redeemScript,
      );
      expect(htlc.details).to.deep.equal(config.bitcoin.valid.htlc.details);
    });

    it('should compile the redeem script when valid htlc args are passed in the constructor', () => {
      const htlc = new UtxoHtlc(
        Network.BITCOIN,
        BitcoinSubnet.SIMNET,
        config.bitcoin.valid.htlc.args,
      );
      expect(htlc.redeemScript).to.equal(config.bitcoin.valid.redeemScript);
      expect(htlc.details).to.deep.equal(config.bitcoin.valid.htlc.details);
    });

    it('should throw an InvalidRedeemScriptLength error when an arg with an invalid length is passed', () => {
      expect(
        () =>
          new UtxoHtlc(
            Network.BITCOIN,
            BitcoinSubnet.SIMNET,
            config.bitcoin.invalid.redeemScript,
          ),
      ).to.throw(Error, /InvalidRedeemScriptLength/);
    });
  });
});
