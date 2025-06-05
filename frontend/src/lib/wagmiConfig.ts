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

const walletConnectProjectIdFromEnv = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Log the projectId to the server console during startup/build
console.log("[wagmiConfig] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID from env:", walletConnectProjectIdFromEnv);

if (!walletConnectProjectIdFromEnv) {
  console.warn(
    '[wagmiConfig] WalletConnect Project ID is not set in .env.local. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.'
  );
  // Consider if you want to throw an error here in development to make it more obvious
  // throw new Error("[wagmiConfig] WalletConnect Project ID is essential and not set.");
}

const config = getDefaultConfig({
  appName: 'Micro-Tipping Platform',
  // Use the variable directly, and handle the undefined case if necessary (though warning is good)
  projectId: walletConnectProjectIdFromEnv || 'FALLBACK_ID_IF_YOU_MUST_HAVE_ONE_BUT_WARN_HEAVILY', 
  chains: [campTestnetChain],
  ssr: true, // Required for Next.js App Router
});

export const wagmiConfigInstance = config; 