require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Loads .env file from the current directory (web3/)

const privateKey = process.env.PRIVATE_KEY;
const rpcUrl = process.env.RPC_URL;

if (!privateKey) {
  console.warn("PRIVATE_KEY not found in .env file. Deployments will not be possible.");
}
if (!rpcUrl) {
  console.warn("RPC_URL not found in .env file. Network configuration might be incomplete.");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  // Paths are relative to the Hardhat project root, which is now web3/
  paths: {
    sources: "./contracts",   // Look for .sol files in web3/contracts/
    tests: "./test",          // Look for tests in web3/test/
    cache: "./cache",         // Cache will be in web3/cache/
    artifacts: "./artifacts"    // Artifacts will be in web3/artifacts/
  },
  networks: {
    campTestnet: {
      url: rpcUrl || "",
      accounts: privateKey ? [privateKey] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  etherscan: {
    // Add your Etherscan/block explorer API key here if needed for verification
    // apiKey: process.env.ETHERSCAN_API_KEY,
    // customChains: [
    //   {
    //     network: "campTestnet",
    //     chainId: YOUR_CHAIN_ID, // Replace with Camp Testnet Chain ID
    //     urls: {
    //       apiURL: "YOUR_API_URL", // e.g., https://api-testnet.campscan.io/api
    //       browserURL: "YOUR_BROWSER_URL" // e.g., https://testnet.campscan.io
    //     }
    //   }
    // ]
  },
  sourcify: {
    enabled: false // Disabled for troubleshooting libuv error
  }
};
