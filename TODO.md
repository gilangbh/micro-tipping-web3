# Project TODO List

This file tracks pending tasks, future enhancements, and known issues for the Micro-Tipping Platform.

## Pending Tasks

- [v] **Test Tipping Thoroughly**: Confirm tips are processed correctly on Camp Testnet, balances update, and events are emitted as expected.
- [v] **Frontend UI/UX Polish**: 
    - [v] Improve visual feedback during and after transaction submission (e.g., more distinct loading spinners, success/error modals or toasts instead of just text).
    - [v] Add input validation for recipient address (e.g., check for valid Ethereum address format).
    - [v] Add input validation for amount (e.g., ensure it's a positive number, perhaps check against user's balance though this is complex with gas).
- [v] **Error Handling**: Enhance error handling across all parts of the DApp (frontend, backend, smart contract interactions).
    - [v] Provide more user-friendly error messages.

## Future Enhancements

### Feature: Contextual Tipping for Registered IP & Verified Creator Badges (Camp Network IP)
- [v] **Phase 1: Core Smart Contract & Basic Frontend Integration (Proof of Concept)**
    - [v] **Smart Contracts (`web3/`):**
        - [v] Modify `Tipping.sol`: `tipNative` to accept `bytes32 _ipId`, update `TipSent` event.
        - [v] Deploy updated `Tipping.sol`.
    - [v] **Frontend (`frontend/`):**
        - [v] Update `Tipping.json` ABI.
        - [v] Modify `page.tsx`: Add manual `ipId` input, pass to `writeContract`, update `txStatus`.
    - [v] **Testing**: Manually test tipping with an `ipId`.
- [ ] **Phase 2: `CreatorRegistry.sol` and Frontend IP Display**
    - [ ] **Smart Contracts (`web3/`):**
        - [ ] Create and deploy `CreatorRegistry.sol` (for creator IP portfolio & verification).
    - [ ] **Frontend (`frontend/`):**
        - [ ] Add `CreatorRegistry.json` ABI.
        - [ ] New page/section for creators to manage their IP portfolio.
        - [ ] Modify `page.tsx`/`CreatorProfilePage.tsx`: Fetch/display IP portfolio & verification status.
    - [ ] **Backend (`backend/` - optional for this phase):**
        - [ ] Plan/start schema for `creators` and `registered_ips`.
        - [ ] Plan API endpoint to cache/serve `CreatorRegistry.sol` data.
    - [ ] **Testing**: Creator registration, IP addition, tipper viewing portfolio and tipping specific IP.
- [ ] **Phase 3: Backend Integration & Polish**
    - [ ] **Backend (`backend/`):**
        - [ ] Implement caching layer for `CreatorRegistry.sol` data.
        - [ ] Implement admin functionality for verification if off-chain.
        - [ ] Enhance `tips` table for `target_ip_id`.
        - [ ] (Stretch) Event listener service for `TipSent` & `CreatorRegistry` events.
    - [ ] **Frontend (`frontend/`):**
        - [ ] Refine UI/UX for IP display and tipping.

### Feature: Enhanced Creator Profiles with Linked Socials (using @campnetwork/sdk)
- [ ] **Phase 1: Basic SDK Integration & Current User Linking**
    - [ ] **Frontend (`frontend/`):**
        - [ ] Install `@campnetwork/sdk`.
        - [ ] Wrap application in `CampProvider` (`providers.tsx`), render `<CampModal />` (`layout.tsx`).
        - [ ] Create `/my-socials` page for authenticated user to link their Twitter/Spotify using Camp SDK hooks/components.
        - [ ] Display current user's linked social status on `/my-socials`.
    - [ ] **Testing**: Current user wallet connection, navigation to `/my-socials`, linking/unlinking socials, UI updates correctly.
- [ ] **Phase 2: Displaying Linked Socials on Public Profiles (Requires Backend Cache Strategy)**
    - [ ] **Backend (`backend/`):**
        - [ ] Extend `creators` table schema in Supabase for cached social link status (e.g., `is_twitter_linked_camp`).
        - [ ] API endpoint for frontend to notify backend of successful social link/unlink by current user (for cache update).
        - [ ] API endpoint to serve creator profiles including cached social link status.
    - [ ] **Frontend (`frontend/`):**
        - [ ] Call backend API to update cache after Camp SDK confirms social link/unlink for current user.
        - [ ] On public creator profiles, fetch profile data (with social links) from backend API.
        - [ ] Implement `CreatorSocialBadges.tsx` to display linked socials.
    - [ ] **Testing**: User A links social, backend cache updates. User B (or unauth) views User A's profile and sees linked social icon.

### Other Frontend Enhancements
- [ ] **Display Recent Tips**: Fetch and display recent tips (either for the connected user, a specific creator, or globally) by listening to `TipSent` events or querying the contract/backend.
- [ ] **ERC20 Token Tipping**: Fully implement and test the `tipToken` functionality in the smart contract and add UI for it on the frontend.
    - [ ] UI to select token (if multiple are supported).
    - [ ] Handle ERC20 approvals if necessary.
- [ ] **Creator Profiles**: If backend supports it, display basic creator profiles (expanded beyond just linked socials/IP).
- [ ] **Leaderboards**: If backend supports it, display tipping leaderboards.
- [ ] **Dark Mode/Light Mode Toggle**: Implement a manual theme switcher if not relying solely on system preference.
- [ ] **Wallet Balance Display**: Show the user's CAMP token balance more prominently.
- [ ] **Transaction History**: Allow users to see their past tipping transactions within the DApp.

### Other Backend (`backend/`) Enhancements
- [ ] **Database Schema**: Define and implement Supabase database schema for:
    - [ ] General User profiles (linking wallet addresses to usernames, etc.)
    - [ ] Expanded Creator profiles
    - [ ] Aggregated tip data for analytics
- [ ] **API Endpoints**: Develop Express API endpoints for:
    - [ ] Managing general user/creator profiles.
    - [ ] Storing/retrieving tip data (e.g., a service to listen to `TipSent` events and record them).
    - [ ] Serving data for leaderboards or analytics.
- [ ] **Authentication/Authorization**: Secure backend APIs, potentially using Supabase Auth.
- [ ] **Event Listener Service**: Create a service (could be part of the backend or standalone) to listen to `TipSent` events from the smart contract and store them in the Supabase database. This is more robust than relying on the frontend to catch all events.

### Other Smart Contract (`web3/`) Enhancements
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