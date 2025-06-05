import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
// import Header from "@/components/Header"; // Header will be rendered in page.tsx
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CAMP Tips - Micro-Tipping Platform",
  description: "Support your favorite content creators with instant CAMP token tips on the Camp Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Placeholder state and functions REMOVED from here.
  // Actual state will be managed in page.tsx and passed to Header there.
  // For the initial server render, Header might get default/undefined props.

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full flex flex-col`}>
        <div className="flex flex-col flex-grow bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
          <Providers>
            {/* Header removed from here, will be placed in page.tsx or other page layouts */}
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            {/* 
            <footer className="border-t py-4">
              <div className="container mx-auto px-4">
                <NetworkStatus isConnected={isConnected} networkName="Camp Testnet" />
              </div>
            </footer>
            */}
            <Toaster />
          </Providers>
        </div>
      </body>
    </html>
  );
}
// --- IMPORTANT NOTE ---
// The Header component requires actual web3 state management (isConnected, address, onConnect, onDisconnect).
// The dummy state (React.useState) and functions (handleConnect, handleDisconnect) above are placeholders.
// These need to be replaced with your actual RainbowKit/Wagmi state and functions.
// For example, you might get isConnected and address from useAccount, and connect/disconnect from useConnect/useDisconnect.
// This integration will likely happen in a parent component or directly in page.tsx where web3 context is available.
// I've added a React import for the dummy state.
