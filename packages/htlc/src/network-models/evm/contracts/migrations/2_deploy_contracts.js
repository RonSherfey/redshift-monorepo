var EtherSwap = artifacts.require('./EtherSwap.sol');
var Dummy6DecimalERC20Token = artifacts.require('./Dummy6DecimalERC20Token.sol'); 
var Dummy18DecimalERC20Token = artifacts.require('./Dummy18DecimalERC20Token.sol'); 
var ERC20Swap = artifacts.require('./ERC20Swap.sol');

module.exports = function(deployer) {
  deployer.deploy(EtherSwap);
  deployer.deploy(Dummy6DecimalERC20Token);
  deployer.deploy(Dummy18DecimalERC20Token);
  deployer.deploy(ERC20Swap);
};
