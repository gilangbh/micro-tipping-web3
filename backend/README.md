# Backend - Node.js, Express, Supabase

This directory contains the backend server for the micro-tipping platform. It's built with Node.js, Express, and integrates with Supabase for database functionalities and caching on-chain data.

## Overview

The primary purpose of this backend is to serve data related to content creators and their registered Intellectual Properties (IPs). It caches data from the `CreatorRegistry.sol` smart contract into a Supabase database to provide fast and efficient access for the frontend, reducing the need for direct and frequent on-chain calls.

**Key Features:**

*   **API Endpoints:**
    *   `GET /api/creators/:wallet_address`: Fetches a creator's profile and their list of registered IPs.
    *   `GET /api/ips/:ip_id_onchain`: Retrieves details for a specific registered IP using its on-chain ID.
    *   `GET /api/ips`: Lists all registered IPs, with support for searching, filtering, and pagination.
*   **Data Synchronization (`scripts/sync_contract_data.js`):**
    *   A Node.js script that fetches `IpRegistered` events from the `CreatorRegistry.sol` contract.
    *   Upserts creator and IP data into `creators` and `registered_ips` tables in Supabase.
    *   Tracks the last processed block number in `src/generated/sync_status.json` to ensure continuous and efficient updates.
*   **Contract Artifacts:**
    *   Consumes contract addresses and ABIs from `src/generated/`, which are automatically populated by the `web3/` deployment scripts.

## Prerequisites

*   **Node.js**: v20.x.x (LTS) recommended.
*   **npm**.
*   **Supabase Account & Project**: You will need a Supabase project to get a URL and an anonymous key.
*   **RPC URL**: A URL for a Camp Testnet RPC endpoint (e.g., from Gelato) is required for the data synchronization script to query contract events.

## Setup

1.  **Navigate to this directory:**
    ```bash
    cd backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Create `.env` file:**
    Create a `.env` file in this `backend/` directory.
    ```env
    SUPABASE_URL="YOUR_SUPABASE_URL"
    SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    PORT=3001
    RPC_URL="YOUR_CAMP_TESTNET_RPC_URL"
    # Optional: Define contract addresses if not relying on generated files for some reason
    # CREATOR_REGISTRY_CONTRACT_ADDRESS="0x..."
    # TIPPING_CONTRACT_ADDRESS="0x..."
    ```
    *   Replace `YOUR_SUPABASE_URL`, `YOUR_SUPABASE_ANON_KEY`, and `YOUR_CAMP_TESTNET_RPC_URL` with your actual credentials.

## Running the Server

1.  **Run Data Synchronization (Initial & Periodic):**
    Before starting the server for the first time, or periodically to update the cache, run the sync script:
    ```bash
    node scripts/sync_contract_data.js
    ```
    This script requires the `RPC_URL` and Supabase credentials to be set in `.env`. It will populate/update the `creators` and `registered_ips` tables in your Supabase database. For production, consider running this as a cron job.

2.  **Start the API Server:**
    ```bash
    node index.js
    ```
    Or, if you have `nodemon` installed for development:
    ```bash
    nodemon index.js
    ```
    By default (or as configured in `.env`), the server will typically run on `http://localhost:3001`.

## API Endpoints

The API endpoints are defined in `routes/` and mounted in `index.js`.

*   **`GET /api/creators/:wallet_address`**:
    *   Responds with a creator's details and a list of their registered IPs.
*   **`GET /api/ips/:ip_id_onchain`**:
    *   Responds with details for a single IP, identified by its on-chain `ipId`.
*   **`GET /api/ips`**:
    *   Responds with a paginated list of all registered IPs. Supports query parameters for searching and filtering (e.g., `?search=...`, `?page=...`, `?limit=...`).

## Contract Artifacts

The deployment scripts in the `web3/` directory automatically generate and copy the necessary contract information:

*   **`backend/src/generated/contract-address.json`**: Contains the deployed addresses of `CreatorRegistry.sol` and `Tipping.sol`.
*   **`backend/src/generated/abi/CreatorRegistry.json`**: ABI for the Creator Registry contract.
*   **`backend/src/generated/abi/Tipping.json`**: ABI for the Tipping contract.
*   **`backend/src/generated/sync_status.json`**: Stores the last block number processed by the `sync_contract_data.js` script.

The `sync_contract_data.js` script and potentially other backend services rely on these files.

## Supabase Integration

The `@supabase/supabase-js` client is used for all database interactions. The backend assumes the following tables and basic structure exist in your Supabase project (the SQL for creating them is typically managed separately or through Supabase Studio):

*   **`creators` table:**
    *   `id` (UUID, PK)
    *   `wallet_address` (TEXT, UNIQUE, NOT NULL)
    *   `name` (TEXT, nullable)
    *   `bio` (TEXT, nullable)
    *   `is_verified` (BOOLEAN, DEFAULT false)
    *   `created_at` (TIMESTAMPZ, DEFAULT now())
    *   `updated_at` (TIMESTAMPZ, DEFAULT now())
*   **`registered_ips` table:**
    *   `id` (UUID, PK)
    *   `ip_id_onchain` (TEXT, UNIQUE, NOT NULL)
    *   `creator_id` (UUID, FK to `creators.id`)
    *   `name` (TEXT, NOT NULL)
    *   `description` (TEXT, nullable)
    *   `metadata_url` (TEXT, nullable)
    *   `tags` (ARRAY OF TEXT, nullable)
    *   `registered_onchain_at` (TIMESTAMPZ, nullable)
    *   `cached_at` (TIMESTAMPZ, DEFAULT now())
    *   `updated_at` (TIMESTAMPZ, DEFAULT now())

Make sure these tables are created in your Supabase project.

## Directory Structure

```
backend/
├── node_modules/
├── routes/                     # API route handlers
│   ├── creators.js
│   └── ips.js
├── scripts/                    # Utility and synchronization scripts
│   └── sync_contract_data.js
├── src/
│   └── generated/              # Auto-generated by web3 deployment scripts
│       ├── abi/
│       │   ├── CreatorRegistry.json
│       │   └── Tipping.json
│       ├── contract-address.json
│       └── sync_status.json    # Tracks sync progress
├── .env                        # Environment variables (Supabase, RPC, Port)
├── index.js                    # Main Express server setup
├── package.json
├── package-lock.json
└── README.md                   # This file
```

## Future Enhancements

*   Secure API endpoints further if user-specific write operations are added.
*   More sophisticated error handling and logging.
*   Add endpoints for updating off-chain creator/IP metadata if needed. 