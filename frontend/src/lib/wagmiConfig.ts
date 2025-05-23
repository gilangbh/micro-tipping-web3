'use client'; // Though config itself isn't a component, its creation might be tied to client module evaluation

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { type Chain } from 'wagmi/chains';

// Camp Testnet (Basecamp) Configuration
const campTestnetChain: Chain = {
  id: 123420001114,
  name: 'Basecamp Testnet',
  nativeCurrency: { name: 'CAMP', symbol: 'CAMP', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.basecamp.t.raas.gelato.cloud'] },
    public: { http: ['https://rpc.basecamp.t.raas.gelato.cloud'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://basecamp.cloud.blockscout.com' },
  },
  testnet: true,
};

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  console.warn(
    'WalletConnect Project ID is not set. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local'
  );
}

const config = getDefaultConfig({
  appName: 'Micro-Tipping Platform',
  projectId: walletConnectProjectId || 'PLACEHOLDER_PROJECT_ID', // Fallback to avoid error if not set, but log warning
  chains: [campTestnetChain],
  ssr: true, // Required for Next.js App Router
});

export const wagmiConfigInstance = config; 