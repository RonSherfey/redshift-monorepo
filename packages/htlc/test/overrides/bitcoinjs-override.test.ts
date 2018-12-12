import { expect } from 'chai';
import blockchainUtils from '../../src/overrides/bitcoinjs-lib';
import config from '../../src/overrides/bitcoinjs-lib/config.json';

describe('overrides/bitcoinjs-override', () => {
  it('should add additional blockchains from the configuration file', () => {
    for (const key in config) {
      expect(blockchainUtils.networks[key]).to.exist;
      expect(blockchainUtils.networks[key].bech32).to.equal(config[key].bech32);
      expect(blockchainUtils.networks[key].bip32).to.deep.equal({
        private: parseInt(config[key].bip32.private, 16),
        public: parseInt(config[key].bip32.public, 16),
      });
      expect(blockchainUtils.networks[key].messagePrefix).to.equal(
        config[key].messagePrefix,
      );
      expect(blockchainUtils.networks[key].pubKeyHash).to.equal(
        parseInt(config[key].pubKeyHash, 16),
      );
      expect(blockchainUtils.networks[key].scriptHash).to.equal(
        parseInt(config[key].scriptHash, 16),
      );
      expect(blockchainUtils.networks[key].wif).to.equal(
        parseInt(config[key].wif, 16),
      );
    }
  });
});
