'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogOut, UserCircle, ListTree, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  isConnected: boolean;
  isConnecting: boolean;
  address?: `0x${string}`;
  balance?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

const Header: React.FC<HeaderProps> = ({ isConnected, isConnecting, address, balance, onConnect, onDisconnect }) => {
  const { toast } = useToast();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <ListTree className="h-6 w-6 text-purple-600" />
          <span className="font-bold text-xl gradient-text">MicroTip</span>
        </Link>

        <div className="flex items-center space-x-3">
          {isConnected && address ? (
            <>
              <Link href="/my-ips" passHref legacyBehavior>
                <Button variant="outline" asChild className="text-purple-700 border-purple-300 hover:bg-purple-50">
                  <a>
                    <ListTree className="mr-2 h-5 w-5" /> My IPs
                  </a>
                </Button>
              </Link>
              <div className="flex items-center space-x-2 p-2 border rounded-md bg-purple-50 border-purple-200">
                <UserCircle className="h-5 w-5 text-purple-700" />
                <span className="text-sm font-medium text-purple-700">
                  {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
                </span>
                {balance && (
                    <span className="text-xs text-purple-600">({parseFloat(balance).toFixed(3)} CAMP)</span>
                )}
              </div>
              <Button variant="outline" onClick={onDisconnect} className="text-red-600 border-red-300 hover:bg-red-50">
                <LogOut className="mr-2 h-5 w-5" /> Disconnect
              </Button>
            </>
          ) : (
            <Button onClick={onConnect} disabled={isConnecting} className="web3-gradient text-white">
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;