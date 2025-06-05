'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'lucide-react';

interface ContractInfoProps {
  contractAddress: string;
  networkName: string;
  blockExplorerUrl?: string;
}

const ContractInfo: React.FC<ContractInfoProps> = ({ 
  contractAddress, 
  networkName, 
  blockExplorerUrl 
}) => {
  const { toast } = useToast();

  const copyContractAddress = () => {
    navigator.clipboard.writeText(contractAddress);
    toast({
      title: "Contract Address Copied!",
      description: "Contract address copied to clipboard",
    });
  };

  const openBlockExplorer = () => {
    if (blockExplorerUrl) {
      window.open(`${blockExplorerUrl}/address/${contractAddress}`, '_blank');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="w-full max-w-md glass-effect border-blue-200">
      <CardHeader>
        <CardTitle className="text-center text-lg">Contract Information</CardTitle>
        <CardDescription className="text-center">
          Tipping contract details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Network:</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {networkName}
          </Badge>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Contract Address:</span>
          <div className="flex items-center space-x-2">
            <code 
              className="flex-1 px-2 py-1 bg-muted rounded text-xs font-mono cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={copyContractAddress}
            >
              {formatAddress(contractAddress)}
            </code>
            {blockExplorerUrl && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={openBlockExplorer}
                className="h-8 w-8 p-0"
              >
                <Link className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            This contract handles secure CAMP token tips on the Camp Network
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractInfo;