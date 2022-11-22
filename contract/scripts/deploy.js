// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const owners = ["0xbD8F90c889692b80aC1B3E5301449eB0eA2Cf950", "0x03C850825ddcd950B1eb4010bEcA9F87a2E64D55", "0xb9971b5dF187d6c71b3925Ad72f0787b8e1a8959"];
  const BlindAngelInboundTreasury = await hre.ethers.getContractFactory("BlindAngelInboundTreasury");
  const inboundTreasury = await BlindAngelInboundTreasury.deploy(owners);
  await inboundTreasury.deployed();

  console.log(
    `BlindAngelInboundTreasury is deployed to ${inboundTreasury.address}`
  );

  const BlindAngelOutboundTreasury = await hre.ethers.getContractFactory("BlindAngelOutboundTreasury");
  const outboundTreasury = await BlindAngelOutboundTreasury.deploy(owners);
  await outboundTreasury.deployed();

  console.log(
    `BlindAngelOutboundTreasury is deployed to ${outboundTreasury.address}`
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
