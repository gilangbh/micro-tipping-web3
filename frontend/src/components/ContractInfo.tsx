'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, CopyIcon } from 'lucide-react';

interface ContractInfoProps {
  tippingAddress?: string;
  creatorRegistryAddress?: string;
  networkName: string;
  blockExplorerUrl?: string;
}

const ContractInfo: React.FC<ContractInfoProps> = ({ 
  tippingAddress, 
  creatorRegistryAddress,
  networkName, 
  blockExplorerUrl 
}) => {
  const { toast } = useToast();

  const handleCopyAddress = (addressToCopy: string | undefined, contractName: string) => {
    if (addressToCopy) {
      navigator.clipboard.writeText(addressToCopy);
      toast({
        title: `${contractName} Address Copied!`,
        description: `${contractName} address copied to clipboard.`,
      });
    } else {
      toast({ title: "Address Not Available", description: `${contractName} address is not available to copy.`, variant: "default" });
    }
  };

  const handleOpenExplorer = (addressToOpen: string | undefined, contractName: string) => {
    if (!blockExplorerUrl) {
      toast({ title: "Explorer Not Available", description: "Block explorer URL is not configured.", variant: "default" });
      return;
    }
    if (addressToOpen) {
      window.open(`${blockExplorerUrl}/address/${addressToOpen}`, '_blank');
    } else {
      toast({ title: "Address Not Available", description: `${contractName} address is not available to open in explorer.`, variant: "default" });
    }
  };

  const formatAddress = (addr: string | undefined): string => {
    if (!addr || addr.length < 10) return 'N/A';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="w-full max-w-md glass-effect border-blue-200 dark:border-slate-700 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-xl gradient-text font-semibold">Contract Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b dark:border-slate-600">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Network:</span>
          <Badge variant="outline" className="border-green-500 text-green-700 dark:border-green-400 dark:text-green-300 bg-green-50 dark:bg-green-900/30">
            {networkName}
          </Badge>
        </div>

        {tippingAddress && (
          <div className="space-y-2">
            <div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tipping Contract</span>
              <div className="flex items-center space-x-2 mt-1">
                <code 
                  className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono cursor-default text-slate-800 dark:text-slate-200 truncate"
                  title={tippingAddress}
                >
                  {formatAddress(tippingAddress)}
                </code>
                <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => handleCopyAddress(tippingAddress, 'Tipping Contract')}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    title="Copy Tipping Address"
                  >
                    <CopyIcon className="w-4 h-4" />
                  </Button>
                {blockExplorerUrl && (
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => handleOpenExplorer(tippingAddress, 'Tipping Contract')}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    title="View Tipping Contract on Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              Handles native currency tips and IP-specific tipping.
            </p>
          </div>
        )}

        {creatorRegistryAddress && (
          <div className="space-y-2 pt-3 border-t dark:border-slate-600">
            <div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Creator Registry Contract</span>
              <div className="flex items-center space-x-2 mt-1">
                <code 
                  className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono cursor-default text-slate-800 dark:text-slate-200 truncate"
                  title={creatorRegistryAddress}
                >
                  {formatAddress(creatorRegistryAddress)}
                </code>
                <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => handleCopyAddress(creatorRegistryAddress, 'Creator Registry')}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    title="Copy Creator Registry Address"
                  >
                    <CopyIcon className="w-4 h-4" />
                  </Button>
                {blockExplorerUrl && (
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => handleOpenExplorer(creatorRegistryAddress, 'Creator Registry')}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    title="View Creator Registry on Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              Manages creator IP registration and verification.
            </p>
          </div>
        )}

        {!tippingAddress && !creatorRegistryAddress && (
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-4">Contract addresses are not currently available.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractInfo;