# Backend - Node.js, Express, Supabase

This directory contains the backend server for the micro-tipping platform. It's built with Node.js, Express, and integrates with Supabase for database functionalities.

## Overview

The primary purpose of this backend is to potentially manage creator profiles, display leaderboards, and aggregate tipping data. Currently, it provides a basic Express server setup and initializes a Supabase client.

**Key Features (Planned/Potential):**

*   API endpoints for user/creator profiles.
*   Storing and retrieving tipping data (potentially listening to smart contract events or periodically querying).
*   Leaderboards or analytics based on tips.

## Prerequisites

*   **Node.js**: v20.x.x (LTS) recommended.
*   **npm**.
*   **Supabase Account & Project**: You will need a Supabase project to get a URL and an anonymous key.

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
    Create a `.env` file in this `backend/` directory with your Supabase project URL and anonymous key. You can also define the port for the server.
    ```env
    SUPABASE_URL="YOUR_SUPABASE_URL"
    SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    PORT=3001
    ```
    *   Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual Supabase project credentials.
    *   The `PORT` is optional; if not set, the application might default to another port or one defined in `index.js`.

## Running the Server

*   **Start the server:**
    ```bash
    node index.js
    ```
    Or, if you have `nodemon` installed for development:
    ```bash
    nodemon index.js
    ```
    By default (or as configured in `.env`), the server will typically run on `http://localhost:3001`.

## Current Functionality (`index.js`)

*   Initializes an Express application.
*   Initializes the Supabase client using credentials from the `.env` file.
*   Starts listening on the configured port.
*   Includes a basic root route (`/`) that responds with "Backend server is running".

## Supabase Integration

The `@supabase/supabase-js` client is initialized and ready to be used. You will need to:

1.  **Define your database schema in Supabase:** Create tables for users, tips, creators, etc., as needed through the Supabase dashboard.
2.  **Implement API Endpoints:** Add Express routes in `index.js` (or in separate route files) to perform CRUD operations on your Supabase tables.

**Example Supabase Table (`tips` - conceptual):**

*   `id` (uuid, primary key)
*   `created_at` (timestampz, default now())
*   `tipper_address` (text)
*   `recipient_address` (text)
*   `amount` (numeric)
*   `token_address` (text, nullable, for ERC20s)
*   `message` (text, nullable)
*   `transaction_hash` (text, unique)

## Future Enhancements

*   Secure API endpoints (e.g., using JWTs or Supabase Auth).
*   Webhook to listen for `TipSent` events from the smart contract (requires an event listener service like an Ethers.js script or a third-party service that can call your webhook).
*   More sophisticated data aggregation and analytics.
*   User authentication and profile management tied to wallet addresses. 