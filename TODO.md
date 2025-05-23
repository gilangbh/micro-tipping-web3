# Project TODO List

This file tracks pending tasks, future enhancements, and known issues for the Micro-Tipping Platform.

## Pending Tasks

- [ ] **Test Tipping Thoroughly**: Confirm tips are processed correctly on Camp Testnet, balances update, and events are emitted as expected.
- [ ] **Frontend UI/UX Polish**: 
    - [ ] Improve visual feedback during and after transaction submission (e.g., more distinct loading spinners, success/error modals or toasts instead of just text).
    - [ ] Add input validation for recipient address (e.g., check for valid Ethereum address format).
    - [ ] Add input validation for amount (e.g., ensure it's a positive number, perhaps check against user's balance though this is complex with gas).
- [ ] **Error Handling**: Enhance error handling across all parts of the DApp (frontend, backend, smart contract interactions).
    - [ ] Provide more user-friendly error messages.

## Future Enhancements

### Frontend
- [ ] **Display Recent Tips**: Fetch and display recent tips (either for the connected user, a specific creator, or globally) by listening to `TipSent` events or querying the contract/backend.
- [ ] **ERC20 Token Tipping**: Fully implement and test the `tipToken` functionality in the smart contract and add UI for it on the frontend.
    - [ ] UI to select token (if multiple are supported).
    - [ ] Handle ERC20 approvals if necessary.
- [ ] **Creator Profiles**: If backend supports it, display basic creator profiles.
- [ ] **Leaderboards**: If backend supports it, display tipping leaderboards.
- [ ] **Dark Mode/Light Mode Toggle**: Implement a manual theme switcher if not relying solely on system preference.
- [ ] **Wallet Balance Display**: Show the user's CAMP token balance more prominently.
- [ ] **Transaction History**: Allow users to see their past tipping transactions within the DApp.

### Backend (`backend/`)
- [ ] **Database Schema**: Define and implement Supabase database schema for:
    - [ ] User profiles (linking wallet addresses to usernames, etc.)
    - [ ] Creator profiles
    - [ ] Aggregated tip data
- [ ] **API Endpoints**: Develop Express API endpoints for:
    - [ ] Managing user/creator profiles.
    - [ ] Storing/retrieving tip data (e.g., a service to listen to `TipSent` events and record them).
    - [ ] Serving data for leaderboards or analytics.
- [ ] **Authentication/Authorization**: Secure backend APIs, potentially using Supabase Auth.
- [ ] **Event Listener Service**: Create a service (could be part of the backend or standalone) to listen to `TipSent` events from the smart contract and store them in the Supabase database. This is more robust than relying on the frontend to catch all events.

### Smart Contract (`web3/`)
- [ ] **Contract Upgradability**: Consider making the contract upgradeable (e.g., using OpenZeppelin Upgrades Plugins) for future modifications without changing the address.
- [ ] **Gas Optimizations**: Review for any potential gas optimizations if the contract becomes complex.
- [ ] **Batch Tipping**: Allow a user to tip multiple creators in a single transaction.
- [ ] **More Detailed Events**: Emit more detailed events if needed for off-chain services.

### General
- [ ] **Unit & Integration Tests**: Write comprehensive tests for:
    - [ ] Smart contract functions.
    - [ ] Backend API endpoints.
    - [ ] Frontend components and interactions.
- [ ] **Deployment Scripts**: Enhance deployment scripts (e.g., for backend, automated frontend deployment).
- [ ] **CI/CD Pipeline**: Set up a Continuous Integration/Continuous Deployment pipeline.
- [ ] **Add .env.example files**: For `web3/`, `backend/`, and `frontend/` to guide users on required environment variables. (Attempted, tool blocked, do manually).

## Known Issues

- [ ] **WalletConnect Core Initialization Warning**: The "WalletConnect Core is already initialized" warning persists in the browser console during development, even with React Strict Mode disabled. This seems to be a dev-only artifact and doesn't appear to break functionality. (Status: Accepted as dev-only for now).
- [ ] **Styling for Form Inputs**: Ensure text in input fields is clearly visible in both light and dark modes (partially addressed by adding `text-black dark:text-white`, but review further). 