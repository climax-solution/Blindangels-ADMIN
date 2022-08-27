const BlindAngelTreasury = artifacts.require("BlindAngelTreasury");

const owners = ["0x0F09aE2ba91449a7B4201721f98f482cAF9737Ee", "0x8bD154D7b5ADbDab1d45D5C59512F2e9EbBcF219", "0x2f1e0ffCC0CcAeEDAD34Ff26767488C67f98B41f"];
// const tokenAddress = "0xC964fFD97d750c843000fCf632BBA01ef4692933";
// 0xC964fFD97d750c843000fCf632BBA01ef4692933
module.exports = function (deployer) {
  deployer.deploy(BlindAngelTreasury, owners);
};
