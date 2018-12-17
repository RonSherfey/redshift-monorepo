var EtherSwap = artifacts.require('./EtherSwap.sol');
var ERC20Token = artifacts.require('./ERC20Token.sol'); 
var ERC20Swap = artifacts.require('./ERC20Swap.sol');

module.exports = function(deployer) {
  deployer.deploy(EtherSwap);
  deployer.deploy(ERC20Token);
  deployer.deploy(ERC20Swap);
};
