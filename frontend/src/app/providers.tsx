'use client';

import * as React from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfigInstance } from '@/lib/wagmiConfig'; // Import the singleton instance

// Camp Testnet (Basecamp) Configuration, RainbowKit and other imports related to config generation were removed

// Ensure your WalletConnect Project ID is set in .env.local as NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  console.warn(
    'WalletConnect Project ID is not set. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local'
  );
  // throw new Error('WalletConnect Project ID is not set. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local');
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Ensure QueryClient is stable across re-renders
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfigInstance}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 