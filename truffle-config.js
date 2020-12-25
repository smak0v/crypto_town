const HDWalletProvider = require("@truffle/hdwallet-provider");

const gasPrice = process.env.npm_package_config_ganache_gasPrice;
const gasLimit = process.env.npm_package_config_ganache_gasLimit;
const etherscanApiKey = process.env.npm_package_config_deploy_etherscanApiKey;
const account = process.env.npm_package_config_deploy_account;
const deployKey = [process.env.npm_package_config_deploy_key];
const projectId = process.env.npm_package_config_deploy_projectId;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: gasLimit,
      gasPrice: gasPrice,
      skipDryRun: true,
    },
    kovan: {
      network_id: "42",
      provider: () =>
        new HDWalletProvider(
          deployKey,
          "https://kovan.infura.io/v3/" + projectId
        ),
      gasPrice: 50000000000, // 50 gwei
      gas: 7000000,
      from: account,
      timeoutBlocks: 500,
      skipDryRun: true,
    },
    ropsten: {
      network_id: "3",
      provider: () =>
        new HDWalletProvider(
          deployKey,
          "https://ropsten.infura.io/v3/" + projectId
        ),
      gasPrice: 50000000000, // 50 gwei
      gas: 7000000,
      from: account,
      timeoutBlocks: 500,
      skipDryRun: true,
    },
    rinkeby: {
      network_id: "4",
      provider: () =>
        new HDWalletProvider(
          deployKey,
          "https://rinkeby.infura.io/v3/" + projectId
        ),
      gasPrice: 50000000000, // 50 gwei
      gas: 7000000,
      from: account,
      timeoutBlocks: 500,
      skipDryRun: true,
    },
    main: {
      network_id: "1",
      provider: () =>
        new HDWalletProvider(
          deployKey,
          "https://mainnet.infura.io/v3/" + projectId
        ),
      gasPrice: 50000000000, // 50 gwei
      gas: 7000000,
      from: account,
      timeoutBlocks: 500,
      skipDryRun: true,
    },
  },

  mocha: {
    reporter: "eth-gas-reporter",
    reporterOptions: {
      currency: "USD",
      gasPrice: gasPrice,
    },
  },

  compilers: {
    solc: {
      version: "^0.7.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },

  plugins: [
    "truffle-plugin-verify",
  ],

  api_keys: {
    etherscan: etherscanApiKey,
  },
};
