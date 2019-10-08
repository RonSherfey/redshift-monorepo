require("ts-node/register");
var path = require("path");
var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "REPLACE_ME_WITH_TESTNET_MNEMONIC";

module.exports = {
  networks: {
    dev: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    kovan: {
      provider: new HDWalletProvider(mnemonic, "https://kovan.infura.io"),
      network_id: 42,
      gasPrice: 1000000000,
    }
  },
  contracts_build_directory: path.join(__dirname, "../contract-artifacts"),
  test_file_extension_regexp: /.*\.ts$/
};
