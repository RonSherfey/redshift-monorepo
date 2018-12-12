import blockchainUtils from 'bitcoinjs-lib';
import config from './config.json';

const hex = 16;

// adds support for other blockchains not in bitcoinjs-lib
Object.keys(config).forEach(chainKey => {
  blockchainUtils.networks[chainKey] = {
    bech32: config[chainKey].bech32,
    bip32: {
      private: parseInt(config[chainKey].bip32.private, hex),
      public: parseInt(config[chainKey].bip32.public, hex),
    },
    messagePrefix: config[chainKey].messagePrefix,
    pubKeyHash: parseInt(config[chainKey].pubKeyHash, hex),
    scriptHash: parseInt(config[chainKey].scriptHash, hex),
    wif: parseInt(config[chainKey].wif, hex),
  };
});

export default blockchainUtils;
export * from 'bitcoinjs-lib';
