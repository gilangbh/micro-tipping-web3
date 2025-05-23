# Web3 - Smart Contracts (Hardhat)

This directory contains the Solidity smart contracts, deployment scripts, and Hardhat configuration for the micro-tipping platform, specifically for the Camp Testnet (Basecamp).

## Overview

*   **Contract**: `contracts/Tipping.sol`
    *   Allows users to send native currency (CAMP) tips to an address.
    *   Emits a `TipSent` event for each successful tip.
    *   Includes a function to retrieve all tips sent by a specific user (though this is primarily for on-chain record, frontend/backend will likely handle display of recent/aggregated tips).
    *   Uses OpenZeppelin's `Ownable` for basic access control (e.g., if you wanted to add pausable functionality later, managed by the owner).
*   **Hardhat**: Used for compiling, testing, and deploying the smart contract.
*   **Network**: Configured for Camp Testnet (Basecamp).

## Deployed Contract Address

*   The deployed contract address for `Tipping.sol` on Camp Testnet (Basecamp) will be saved to `frontend/src/generated/contract-address.json` after running the deployment script. The script will also log it to the console.
    *   _Note: This address is generated during each deployment. The frontend reads from this file automatically._

## Prerequisites

*   **Node.js**: v20.x.x (LTS) recommended.
*   **npm**.
*   A **private key** for an Ethereum account with Camp Testnet (Basecamp) CAMP tokens for deployment gas fees. **NEVER COMMIT YOUR PRIVATE KEY TO GIT.**
*   **Camp Testnet RPC URL**.

## Setup

1.  **Navigate to this directory:**
    ```bash
    cd web3
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Create `.env` file:**
    Create a `.env` file in this `web3/` directory with your Camp Testnet RPC URL and your private key:
    ```env
    RPC_URL="https://rpc.basecamp.t.raas.gelato.cloud"
    PRIVATE_KEY="YOUR_METAMASK_PRIVATE_KEY_HERE"
    ```
    *   Replace `YOUR_METAMASK_PRIVATE_KEY_HERE` with your actual private key.
    *   Ensure the `RPC_URL` is correct for the Camp Testnet.
    *   This `.env` file is already in the `.gitignore` of this directory to prevent accidental commits.

## Available Hardhat Tasks

*   **Compile Contracts:**
    ```bash
    npx hardhat compile
    ```
    This will create `artifacts/` and `cache/` directories.

*   **Clean Artifacts and Cache:**
    ```bash
    npx hardhat clean
    ```

*   **Run Tests (if any are added):**
    ```bash
    npx hardhat test
    ```

*   **Deploy Contract:**
    The `scripts/deploy.js` script handles the deployment of `Tipping.sol`.
    ```bash
    npx hardhat run scripts/deploy.js --network campTestnet
    ```
    *   The `--network campTestnet` flag tells Hardhat to use the network configuration defined in `hardhat.config.js`.
    *   The script will log the deployed contract address to the console and save it to `../../frontend/src/generated/contract-address.json`.

## `hardhat.config.js`

This file is configured for:
*   Solidity compiler version `0.8.24`.
*   The `campTestnet` network, using the `RPC_URL` and `PRIVATE_KEY` from the `.env` file.

## Contract Details (`Tipping.sol`)

*   **`tipNative(address payable _recipient, string calldata _message)`**: Allows a user to send native currency (ETH/CAMP) along with a message. Emits `TipSent`.
*   **`tipToken(address _tokenAddress, address _recipient, uint256 _amount, string calldata _message)`**: (Currently not the primary focus but included) Allows a user to send ERC20 tokens. Requires prior approval of the token for the contract. Emits `TipSent`.
*   **`getTipsByUser(address _user)`**: Returns an array of all tips (address and amount) sent by a particular user.
*   **`TipSent` Event**: `event TipSent(address indexed tipper, address indexed recipient, address token, uint256 amount, string message, uint256 timestamp);`
    *   `token` will be `address(0)` for native tips.

## Notes & Troubleshooting

*   **Node.js Version**: Ensure you are using Node.js v20.x.x. Earlier issues with v21+ (like `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`) were resolved by downgrading.
*   **Artifacts Not Found (`HardhatError: HH700`)**: If you encounter issues with contract artifacts not being found, try:
    1.  `npx hardhat clean`
    2.  `npx hardhat compile --force`
    3.  Manually delete `artifacts/` and `cache/` folders, then recompile.
    4.  Ensure contract names in `deploy.js` match exactly (case-sensitive).
*   **RPC URL**: Ensure it starts with `https://`.

This setup provides a foundation for interacting with your smart contracts on the Camp Testnet. 