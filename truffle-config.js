/**
 * Truffle Configuration for Blockchain Banking DApp
 * Connects to Ganache local blockchain on port 8545
 */
module.exports = {
  contracts_build_directory: "./src/abis",

  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
  },

  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
