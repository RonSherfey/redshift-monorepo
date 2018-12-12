import { expect } from 'chai';
import { UtxoHtlc } from '../../../src';
import { BitcoinSubnet, Network } from '../../../src/types';
import { config } from '../../lib';

describe('networks/utxo/utco-htlc', () => {
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
  });
});
