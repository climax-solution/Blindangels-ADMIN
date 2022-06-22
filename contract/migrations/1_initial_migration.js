const RewardClaimSig = artifacts.require("RewardClaimSig");

const owners = ["0x0F09aE2ba91449a7B4201721f98f482cAF9737Ee", "0x8bD154D7b5ADbDab1d45D5C59512F2e9EbBcF219", "0x2f1e0ffCC0CcAeEDAD34Ff26767488C67f98B41f"];
const tokenAddress = "0x15A3FA31B3235954531fAD104Caa60ca400d6d4f";
const _nft = "0x5C15F7A49A3CBb7Dfdae1b79A4B1B3a3DD90F524";
const _treasury = "0x0F09aE2ba91449a7B4201721f98f482cAF9737Ee";
const _claim = "0x0F09aE2ba91449a7B4201721f98f482cAF9737Ee";

module.exports = function (deployer) {
  deployer.deploy(RewardClaimSig, owners, tokenAddress, _nft, _treasury, _claim);
};
