module.exports = {
//   defaultNetwork: "sepolia",
  networks: {

  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  mocha: {
    timeout: 40000
  }
}