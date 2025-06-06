# Micro-Tipping Platform for Content (Camp Network)

This project is a decentralized micro-tipping platform that allows users to send small amounts of cryptocurrency (CAMP tokens on the Camp Testnet) to content creators. It features a Solidity smart contract, a Next.js frontend, and a Node.js/Express backend with Supabase for data persistence.

## Project Architecture

The project is divided into three main components:

1.  **`web3/`**: Contains the Solidity smart contract, deployment scripts, and Hardhat configuration for interacting with the Camp Testnet.
    *   **Smart Contract (`Tipping.sol`)**: Allows users to send tips (native CAMP tokens) to a specific address. 
        *   Supports an optional `ipId` (IP Identifier as a `bytes32`) for contextual tipping, allowing tips to be associated with specific registered intellectual property or content items.
        *   Logs these tips via a `TipSent` event, which includes the sender, recipient, amount, message, timestamp, and the `ipId`.
2.  **`frontend/`**: A Next.js application that provides the user interface.
    *   Users can connect their wallets (e.g., MetaMask via RainbowKit).
    *   Input a recipient address, an amount to tip, an optional message, and an `ipId` for contextual tips.
    *   Executes the tip via the smart contract.
    *   Provides input validation for all fields to guide the user.
    *   Displays transaction status and feedback (e.g., loading spinners, success/error messages).
    *   Displays connected wallet information and the deployed contract address.
3.  **`backend/`**: A Node.js/Express server using Supabase.
    *   Intended for managing content creator profiles (optional).
    *   Could display leaderboards or aggregate tipping data for analytics (future enhancement).

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
*   Deploy contracts: `npx hardhat run scripts/deploy.js --network campTestnet`. This will also create/update `frontend/src/generated/contract-address.json`.

**Deployed Tipping Contract Address (on Camp Testnet):** The address will be automatically populated in `frontend/src/generated/contract-address.json` after deployment. Check this file or the console output of the deployment script.

### 3. Setup `backend/` (Node.js Server)

Detailed instructions are in `backend/README.md`. Key steps:
*   Navigate to the `backend` directory.
*   Create a `.env` file with your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
*   Install dependencies: `npm install`
*   Start the server: `node index.js` (typically runs on `http://localhost:3001`).

### 4. Setup `frontend/` (Next.js DApp)

Detailed instructions are in `frontend/README.md`. Key steps:
*   Navigate to the `frontend` directory.
*   Create a `.env.local` file with your `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
*   Install dependencies: `npm install`
*   Ensure `frontend/src/abi/Tipping.json` is up-to-date with the latest compiled contract.
*   Ensure `frontend/src/generated/contract-address.json` exists and contains the correct deployed contract address (it's created/updated by the web3 deployment script). If not, run the deployment script first.
*   Start the development server: `npm run dev` (typically runs on `http://localhost:3000`).

## Project Structure

```
micro-tipping-web3/
├── backend/          # Node.js/Express backend
│   ├── node_modules/
│   ├── .env          # Supabase keys, port
│   ├── index.js      # Main server file
│   ├── package.json
│   └── README.md
├── frontend/         # Next.js frontend
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   └── app/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       └── providers.tsx
│   │   └── generated/
│   │       └── contract-address.json # Auto-generated by deployment script
│   ├── .env.local    # WalletConnect Project ID
│   ├── next.config.js
│   ├── package.json
│   ├── README.md
│   └── ...
├── web3/             # Hardhat project (Smart Contracts)
│   ├── artifacts/
│   ├── cache/
│   ├── contracts/
│   │   └── Tipping.sol
│   ├── node_modules/
│   ├── scripts/
│   │   └── deploy.js
│   ├── .env          # Private key, RPC URL
│   ├── hardhat.config.js
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md         # This file
```

## Current Features

*   **Native Currency Tipping**: Send CAMP tokens on the Camp Testnet.
*   **Contextual Tipping**: Associate tips with a specific `ipId` (bytes32 IP Identifier).
*   **Wallet Integration**: Connect Web3 wallets using RainbowKit (MetaMask, WalletConnect, etc.).
*   **Real-time Feedback**: View transaction status (pending, confirmed, error) and loading states.
*   **Input Validation**: Client-side checks for recipient address, tip amount, and IP ID format for improved UX.
*   **Event Emission**: Smart contract emits `TipSent` events detailing each tip, including the `ipId`.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate. 