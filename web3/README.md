# Web3 - Smart Contracts (Hardhat)

This directory contains the Solidity smart contracts, deployment scripts, and Hardhat configuration for the micro-tipping platform, specifically for the Camp Testnet (Basecamp).

## Overview

*   **Contracts**:
    *   **`contracts/Tipping.sol`**: Allows users to send native currency (CAMP) tips to an address. Emits a `TipSent` event for each successful tip. Includes functionality for contextual tipping via an `ipId`.
    *   **`contracts/CreatorRegistry.sol`**: Enables creators to register their intellectual property (IPs) on-chain, associating them with an IP name and metadata URL. Generates unique IP IDs and allows for owner-based verification.
*   **Hardhat**: Used for compiling, testing, and deploying the smart contracts.
*   **Network**: Configured for Camp Testnet (Basecamp).

## Deployed Contract Addresses

*   The deployed contract addresses for `Tipping.sol` (as `tippingAddress`) and `CreatorRegistry.sol` (as `creatorRegistryAddress`) on Camp Testnet (Basecamp) will be saved to:
    *   `../../frontend/src/generated/contract-address.json`
    *   `../../backend/src/generated/contract-address.json`
*   Additionally, the ABI JSON files (e.g., `Tipping.json`, `CreatorRegistry.json`) will be copied to:
    *   `../../frontend/src/generated/abi/`
    *   `../../backend/src/generated/abi/`
*   This process is handled automatically by the respective deployment scripts (`scripts/deploy_*.js`). The scripts will also log the deployed addresses to the console.
    *   _Note: These addresses and ABIs are generated during each deployment. The frontend and backend applications read from these generated files automatically._

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

*   **Deploy Contracts:**
    *   The `scripts/deploy_tipping.js` script handles the deployment of `Tipping.sol`.
    *   The `scripts/deploy_creator_registry.js` script handles the deployment of `CreatorRegistry.sol`.
    ```bash
    npx hardhat run scripts/deploy_tipping.js --network campTestnet
    npx hardhat run scripts/deploy_creator_registry.js --network campTestnet
    ```
    *   The `--network campTestnet` flag tells Hardhat to use the network configuration defined in `hardhat.config.js`.
    *   The scripts will log the deployed contract addresses to the console and save them, along with their ABIs, to the `generated/` (and `generated/abi/`) directories within both the `frontend/` and `backend/` project folders, using keys like `tippingAddress` and `creatorRegistryAddress` in the `contract-address.json` file.

## `hardhat.config.js`

This file is configured for:
*   Solidity compiler version `0.8.24`.
*   The `campTestnet` network, using the `RPC_URL` and `PRIVATE_KEY` from the `.env` file.

## Contract Details

### `Tipping.sol`

*   **`tipNative(address payable _recipient, string calldata _message, bytes32 _ipId)`**: Allows a user to send native currency (ETH/CAMP) along with a message and an IP identifier. Emits `TipSent`.
*   **`tipToken(address _tokenAddress, address _recipient, uint256 _amount, string calldata _message)`**: (Currently not the primary focus but included) Allows a user to send ERC20 tokens. Requires prior approval of the token for the contract. Emits `TipSent` with a default `ipId` of `bytes32(0)`.
*   **`TipSent` Event**: `event TipSent(address indexed tipper, address indexed recipient, address tokenAddress, uint256 amount, string message, bytes32 ipId, uint256 timestamp);`
    *   `tokenAddress` will be `address(0)` for native tips.

### `CreatorRegistry.sol`

*   **`registerIp(string calldata _ipName, string calldata _ipMetadataUrl)`**: Allows a creator to register an IP. Generates a unique `ipId`. Emits `IpRegistered`.
*   **`updateIpMetadata(bytes32 _ipId, string calldata _newIpMetadataUrl)`**: Allows the original creator of an IP to update its metadata URL. Emits `IpMetadataUpdated`.
*   **`setIpVerificationStatus(bytes32 _ipId, bool _isVerified)`**: Allows the contract owner to set the verification status of an IP. Emits `IpVerificationStatusChanged`.
*   **`getIpDetails(bytes32 _ipId)`**: Returns a struct `RegisteredIp` containing details for a given `ipId`.
*   **`getCreatorIpList(address _creator)`**: Returns an array of `ipId`s registered by a specific creator.
*   **Events**:
    *   `IpRegistered(address indexed creator, bytes32 indexed ipId, string ipName, string ipMetadataUrl, uint256 creationTimestamp)`
    *   `IpMetadataUpdated(bytes32 indexed ipId, string newIpMetadataUrl)`
    *   `IpVerificationStatusChanged(bytes32 indexed ipId, bool isVerified)`

## Notes & Troubleshooting

*   **Node.js Version**: Ensure you are using Node.js v20.x.x. Earlier issues with v21+ (like `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`) were resolved by downgrading.
*   **Artifacts Not Found (`HardhatError: HH700`)**: If you encounter issues with contract artifacts not being found, try:
    1.  `npx hardhat clean`
    2.  `npx hardhat compile --force`
    3.  Manually delete `artifacts/` and `cache/` folders, then recompile.
    4.  Ensure contract names in `deploy.js` match exactly (case-sensitive).
*   **RPC URL**: Ensure it starts with `https://`.

This setup provides a foundation for interacting with your smart contracts on the Camp Testnet. 