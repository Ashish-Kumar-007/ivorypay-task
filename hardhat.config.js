require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
require("@nomicfoundation/hardhat-verify");

const { RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  networks: {
    sepolia: {
      url: RPC_URL, // Sepolia testnet RPC URL
      accounts: [PRIVATE_KEY],
    },
  },
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY, // Your Etherscan API key to verify contracts
  },
  mocha: {
    timeout: 40000,
  },
};
