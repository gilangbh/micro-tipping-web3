# Micro-Tipping Platform for Content (Camp Network)

This project is a decentralized micro-tipping platform that allows users to send small amounts of cryptocurrency (CAMP tokens on the Camp Testnet) to content creators. It features a Solidity smart contract, a Next.js frontend, and a Node.js/Express backend with Supabase for data persistence.

## Project Architecture

The project is divided into three main components:

1.  **`web3/`**: Contains the Solidity smart contracts, deployment scripts, and Hardhat configuration for interacting with the Camp Testnet.
    *   **Smart Contracts**:
        *   **`Tipping.sol`**: Allows users to send tips (native CAMP tokens) to a specific address.
            *   Supports an optional `ipId` (IP Identifier as a `bytes32`) for contextual tipping, allowing tips to be associated with specific registered intellectual property or content items.
            *   Logs these tips via a `TipSent` event, which includes the sender, recipient, amount, message, timestamp, and the `ipId`.
        *   **`CreatorRegistry.sol`**: Allows creators to register their intellectual property (IPs) on-chain.
            *   Each IP registration includes an IP name, a metadata URL, and is associated with the creator's address.
            *   Generates a unique `ipId` for each registered IP.
            *   Includes functions for creators to manage their IPs and for an owner to verify IPs.
            *   Emits events for IP registration, metadata updates, and verification status changes.
2.  **`frontend/`**: A Next.js application that provides the user interface.
    *   **Main Tipping Page (`/`)**:
        *   Users can connect their wallets (e.g., MetaMask via RainbowKit).
        *   Input a recipient address, an amount to tip, an optional message, and an `ipId` for contextual tips.
        *   Executes the tip via the `Tipping.sol` smart contract.
    *   **Creator IP Portfolio Page (`/my-ips`)**:
        *   Allows connected creators to view their list of registered IPs from `CreatorRegistry.sol`.
        *   Provides a modal form for creators to register new IPs (name and metadata URL) on-chain.
    *   **General Frontend Features**:
        *   Provides input validation for all forms to guide the user.
        *   Displays transaction status and feedback (e.g., loading spinners, success/error messages via toasts).
        *   Displays connected wallet information and relevant deployed contract addresses.
3.  **`backend/`**: A Node.js/Express server using Supabase.
    *   **API Endpoints**:
        *   `GET /api/creators/:wallet_address`: Fetches creator profile and their registered IPs.
        *   `GET /api/ips/:ip_id_onchain`: Fetches details for a specific IP.
        *   `GET /api/ips`: Lists/searches all registered IPs with filtering and pagination.
    *   **Data Caching**:
        *   Implements a script (`scripts/sync_contract_data.js`) to cache data from `CreatorRegistry.sol` (specifically `IpRegistered` events) into Supabase tables (`creators`, `registered_ips`).
        *   Supports initial population and periodic updates based on the last processed block number (tracked in `src/generated/sync_status.json`).
        *   Serves as a data source for the frontend, reducing direct on-chain calls for IP and creator information.

## Prerequisites

*   **Node.js**: Version 20.x.x (LTS recommended). Use [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm) or [NVM for Windows](https://github.com/coreybutler/nvm-windows) to manage Node.js versions.
*   **npm**: Comes with Node.js.
*   **MetaMask Browser Extension**: Configured for the Camp Testnet (Basecamp).
    *   **Network Name:** Basecamp Testnet
    *   **RPC URL:** `https://rpc.basecamp.t.raas.gelato.cloud`
    *   **Chain ID:** `123420001114`
    *   **Currency Symbol:** `CAMP`
    *   **Block Explorer URL:** `https://basecamp.cloud.blockscout.com`
*   **CAMP Tokens**: Obtainable from a Camp Testnet faucet for your wallet address.
*   **Supabase Account**: For backend data storage. Create a project at [supabase.com](https://supabase.com).
*   **WalletConnect Project ID**: For frontend wallet connections. Create a project at [cloud.walletconnect.com](https://cloud.walletconnect.com).

## Getting Started

### 1. Clone the Repository (if applicable)

```bash
git clone <repository-url>
cd micro-tipping-web3
```

### 2. Setup `web3/` (Smart Contracts)

Detailed instructions are in `web3/README.md`. Key steps:
*   Navigate to the `web3` directory.
*   Create a `.env` file with your `PRIVATE_KEY` and `RPC_URL`.
*   Install dependencies: `npm install`
*   Compile contracts: `npx hardhat compile`
*   Deploy contracts:
    *   `npx hardhat run scripts/deploy_tipping.js --network <yourNetworkName>`
    *   `npx hardhat run scripts/deploy_creator_registry.js --network <yourNetworkName>`
    *   These scripts will also create/update `contract-address.json` and copy ABI files into `src/generated/abi/` within *both* the `frontend/` and `backend/` directories. The keys used are `tippingAddress` and `creatorRegistryAddress`.

**Deployed Contract Addresses (on Camp Testnet):** The addresses will be automatically populated in `frontend/src/generated/contract-address.json` and `backend/src/generated/contract-address.json` after deployment. Check these files or the console output of the deployment scripts.

### 3. Setup `backend/` (Node.js Server)

Detailed instructions are in `backend/README.md`. Key steps:
*   Navigate to the `backend` directory.
*   Create a `.env` file with your `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `RPC_URL` (for the sync script).
*   Install dependencies: `npm install`
*   Run the data synchronization script (if needed, or set up as a cron job): `node scripts/sync_contract_data.js`
*   Start the server: `node index.js` (typically runs on `http://localhost:3001`).

### 4. Setup `frontend/` (Next.js DApp)

Detailed instructions are in `frontend/README.md`. Key steps:
*   Navigate to the `frontend` directory.
*   Create a `.env.local` file with your `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
*   Install dependencies: `npm install`
*   Ensure `frontend/src/generated/abi/Tipping.json` and `frontend/src/generated/abi/CreatorRegistry.json` are up-to-date (these are copied by the web3 deployment scripts).
*   Ensure `frontend/src/generated/contract-address.json` exists and contains the correct deployed contract addresses (it's created/updated by the web3 deployment scripts). If not, run the deployment scripts first.
*   Start the development server: `npm run dev` (typically runs on `http://localhost:3000`).

## Project Structure

```
micro-tipping-web3/
├── backend/          # Node.js/Express backend
│   ├── node_modules/
│   ├── routes/       # API route handlers
│   ├── scripts/      # Data synchronization scripts
│   ├── src/
│   │   └── generated/  # Auto-generated by deployment scripts
│   │       ├── abi/
│   │       │   ├── CreatorRegistry.json
│   │       │   └── Tipping.json
│   │       ├── contract-address.json
│   │       └── sync_status.json
│   ├── .env          # Supabase keys, port, RPC_URL
│   ├── index.js      # Main server file
│   ├── package.json
│   └── README.md
├── frontend/         # Next.js frontend
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── providers.tsx
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions, services
│   │   └── generated/  # Auto-generated by deployment scripts
│   │       ├── abi/
│   │       │   ├── CreatorRegistry.json
│   │       │   └── Tipping.json
│   │       └── contract-address.json
│   ├── .env.local    # WalletConnect Project ID
│   ├── next.config.js
│   ├── package.json
│   └── README.md
├── web3/             # Hardhat project (Smart Contracts)
│   ├── artifacts/
│   ├── cache/
│   ├── contracts/
│   │   ├── Tipping.sol
│   │   └── CreatorRegistry.sol
│   ├── node_modules/
│   ├── scripts/
│   │   ├── deploy_tipping.js
│   │   └── deploy_creator_registry.js
│   ├── .env          # Private key, RPC URL
│   ├── hardhat.config.js
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md         # This file
```

## Current Features

*   **Native Currency Tipping**: Send CAMP tokens on the Camp Testnet via `Tipping.sol`.
*   **Contextual Tipping**: Associate tips with a specific `ipId` (bytes32 IP Identifier).
*   **Creator IP Registration**: Creators can register their IPs (name, metadata URL) on-chain via `CreatorRegistry.sol`.
*   **Creator IP Portfolio**: Dedicated page (`/my-ips`) for creators to view their registered IPs and register new ones.
*   **Wallet Integration**: Connect Web3 wallets using RainbowKit (MetaMask, WalletConnect, etc.).
*   **Real-time Feedback**: View transaction status (pending, confirmed, error) and loading states using toasts and status messages.
*   **Input Validation**: Client-side checks for forms (tipping, IP registration) for improved UX.
*   **Event Emission**: Smart contracts emit events for tips, IP registrations, etc.
*   **Modular Deployment Scripts**: Separate, refactored scripts for deploying each contract, updating shared address files and ABIs for both frontend and backend.
*   **Backend API & Caching**: Node.js backend provides API endpoints for creator and IP data, cached from the blockchain via a sync script to improve frontend performance and reduce on-chain calls.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate. 