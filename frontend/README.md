# Frontend - Next.js DApp (Micro-Tipping & IP Registry)

This directory contains the Next.js frontend application for the micro-tipping and IP registry platform. It allows users to connect their wallets, interact with the `Tipping.sol` and `CreatorRegistry.sol` smart contracts on the Camp Testnet, send tips, and manage their registered intellectual property.

## Features

*   **Wallet Connection**: Uses RainbowKit and Wagmi for connecting to Ethereum wallets (e.g., MetaMask).
*   **Network**: Configured for Camp Testnet (Basecamp).
*   **Tipping Interface (`/`)**: Allows users to specify a recipient address, amount, message, and optional `ipId` to send a tip via `Tipping.sol`.
*   **Creator IP Portfolio (`/my-ips`)**: 
    *   Displays a list of IPs registered by the connected user via `CreatorRegistry.sol`.
    *   Provides a modal form for creators to register new IPs on-chain.
*   **Contract Information Display (`ContractInfo.tsx`)**: A component that displays the deployed addresses for both `Tipping.sol` and `CreatorRegistry.sol`, network name, and provides direct links to view them on a block explorer.
*   **Contract Interaction**: Communicates with the deployed `Tipping.sol` and `CreatorRegistry.sol` smart contracts.
*   **UI**: Built with Next.js (App Router), React, Tailwind CSS, and shadcn components (e.g., Card, Dialog, Button, Toast).
*   **Real-time Feedback**: Toasts and status messages for transaction lifecycle.
*   **Input Validation**: For all user input forms.

## Prerequisites

*   **Node.js**: v20.x.x (LTS) recommended (due to Next.js version compatibility).
*   **npm**.
*   **MetaMask Browser Extension**: Configured for the Camp Testnet (Basecamp).
    *   **Network Name:** Basecamp Testnet
    *   **RPC URL:** `https://rpc.basecamp.t.raas.gelato.cloud`
    *   **Chain ID:** `123420001114`
    *   **Currency Symbol:** `CAMP`
    *   **Block Explorer URL:** `https://basecamp.cloud.blockscout.com`
*   **WalletConnect Project ID**: Obtain one from [cloud.walletconnect.com](https://cloud.walletconnect.com).

## Setup

1.  **Navigate to this directory:**
    ```bash
    cd frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```
    *Note: This project uses Next.js v14.2.4, React v18.3.1, and `ethers` v6. These versions were chosen to resolve compatibility issues with `@campnetwork/sdk` (which requires React 18). If you encounter issues, ensure your Node.js version is compatible (v20.x.x recommended).*

3.  **Create `.env.local` file:**
    Create a `.env.local` file in this `frontend/` directory for your WalletConnect Project ID:
    ```env
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="YOUR_WALLETCONNECT_PROJECT_ID"
    ```
    *   Replace `YOUR_WALLETCONNECT_PROJECT_ID` with your actual ID.

4.  **Smart Contract Configuration:**
    The smart contract addresses are automatically read from `src/generated/contract-address.json`. This file is created/updated by the smart contract deployment scripts located in the `web3/` directory (`web3/scripts/deploy_tipping.js` and `web3/scripts/deploy_creator_registry.js`).

    **Ensure you have run the deployment scripts from the `web3/` directory successfully before starting the frontend.** If the file is missing or incorrect, the DApp will not be able to connect to the contracts.

    The addresses are used in the frontend components, for example:
    ```typescript
    import contractAddressData from '@/generated/contract-address.json';
    // ...
    const tippingAddress = contractAddressData.tippingAddress;
    const creatorRegistryAddress = contractAddressData.creatorRegistryAddress;
    ```

5.  **Smart Contract ABIs:**
    Ensure `src/generated/abi/Tipping.json` and `src/generated/abi/CreatorRegistry.json` are present and up-to-date. These are automatically copied from the `web3/artifacts/contracts/...` directory into `src/generated/abi/` by the web3 deployment scripts.

## Running the Development Server

*   **Start the Next.js development server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:3000`.

## Key Files & Structure

*   **`src/app/page.tsx`**: The main tipping page component. Contains the UI for wallet connection and the tipping form.
*   **`src/app/my-ips/page.tsx`**: The Creator IP Portfolio page. Displays registered IPs and includes a modal form for registering new IPs.
*   **`src/components/IpDisplayCard.tsx`**: Component used on the `/my-ips` page to display details of a single registered IP.
*   **`src/components/Header.tsx`**: Global header component with wallet connection status and navigation links (including to `/my-ips`).
*   **`src/components/ContractInfo.tsx`**: Component to display deployed contract addresses and block explorer links.
*   **`src/app/layout.tsx`**: The main layout component, wraps the application with global providers.
*   **`src/app/providers.tsx`**: Configures and provides `WagmiProvider` and `RainbowKitProvider` for wallet connectivity. This is where the Camp Testnet (Basecamp) chain is defined for Wagmi.
*   **`src/generated/contract-address.json`**: This file is automatically generated by the smart contract deployment scripts. It contains the addresses of the deployed `Tipping.sol` (as `tippingAddress`) and `CreatorRegistry.sol` (as `creatorRegistryAddress`) contracts. **Do not edit this file manually.**
*   **`src/generated/abi/`**: Contains JSON ABI files for the smart contracts (e.g., `Tipping.json`, `CreatorRegistry.json`), also auto-generated by deployment scripts.
*   **`next.config.js`**: Next.js configuration file.
*   **`tailwind.config.ts`