// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const owners = ["0x8264CA428e39E42b6A8208E8B368BbB94225Dfa2", "0xcB8e26623C2e908d7e38c3A4cF9035208A14227f", "0xf97ABeA6207881eC1b4695b08194D6488cb4D2BE"];
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
