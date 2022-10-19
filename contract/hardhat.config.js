require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-deploy');


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  etherscan: {
    apiKey: {
      bscTestnet: "ANZWAZS69JPGZYJKQ9ZKID8AQM5UGRA32G",
      goerli: "YSHSEYVHY6WMK6FFB7EAIBR7ZPTBAC4MA8",
      polygonMumbai: "U8NP3QURFCGGD2HUS2NFS6PY5XMT5D5INJ"
    },
  },
  networks: {
    hardhat: {
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/8f5e92cb285941fdb81c80e01a6ca167",
      accounts: {
        mnemonic: "endorse story siege cycle beef club fiscal abuse obey piano window wise"
      }
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/123abc123abc123abc123abc123abcde",
      accounts: []
    },
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/LYuZuxHIZHqSqR5qCsT768jCORqGoXqn",
      accounts: {
        mnemonic: "endorse story siege cycle beef club fiscal abuse obey piano window wise"
        // mnemonic: "pave put assist tone tuition father roast warfare humble slender crop lyrics"
      }
    },
    polygonMumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/xld9GjhRe49YjJ84wt-IjjJe9Y6_cAyx",
      accounts: {
        // mnemonic: "endorse story siege cycle beef club fiscal abuse obey piano window wise"
        mnemonic: "pave put assist tone tuition father roast warfare humble slender crop lyrics"
      }
    },
    tbsc: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: {
        mnemonic: "endorse story siege cycle beef club fiscal abuse obey piano window wise"
      }
    },
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org/",
      accounts: {
        // mnemonic: "endorse story siege cycle beef club fiscal abuse obey piano window wise"
        mnemonic: "pave put assist tone tuition father roast warfare humble slender crop lyrics"
      }
    },
    optimisticGoerli: {
      url: "https://opt-goerli.g.alchemy.com/v2/fIwgr_-MC3O1-wdI0NhFghzu8kYemNha",
      accounts: {
        mnemonic: "pave put assist tone tuition father roast warfare humble slender crop lyrics"
      }
    },
    arbitrumGoerli: {
      url: "https://arb-goerli.g.alchemy.com/v2/yDhSDsPwvDVk6_IPUHSThPqXpYWwFVzO",
      accounts: {
        mnemonic: "endorse story siege cycle beef club fiscal abuse obey piano window wise"
        // mnemonic: "pave put assist tone tuition father roast warfare humble slender crop lyrics"
      }
    },
  },
  solidity: {
    version: "0.8.13",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  },
  plugins: ['solidity-coverage'],
}
