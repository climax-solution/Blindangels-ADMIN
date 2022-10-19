// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const owners = ["0x0F09aE2ba91449a7B4201721f98f482cAF9737Ee", "0x8bD154D7b5ADbDab1d45D5C59512F2e9EbBcF219", "0x2f1e0ffCC0CcAeEDAD34Ff26767488C67f98B41f"];

  const BlindAngelTreasury = await hre.ethers.getContractFactory("BlindAngelTreasury");
  const treasury = await BlindAngelTreasury.deploy(owners);
  await treasury.deployed();

  console.log(
    `BlindAngelTreasury is deployed to ${treasury.address}`
  );

  const nft = "0x0D8A260Da16D90fF15327850a192CAF933837E26";
  const BlindAngelClaim = await hre.ethers.getContractFactory("BlindAngelClaim");
  const claim = await BlindAngelClaim.deploy(owners, nft);
  await claim.deployed();
  console.log(
    `BlindAngelClaim is deployed to ${claim.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
