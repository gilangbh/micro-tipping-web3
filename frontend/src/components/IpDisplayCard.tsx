'use client';

import React from 'react';
import { useReadContract } from 'wagmi';
import creatorRegistryAbi from '@/abi/CreatorRegistry.json';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface RegisteredIp {
  creatorAddress: string;
  ipName: string;
  ipMetadataUrl: string;
  isVerified: boolean;
  creationTimestamp: bigint;
}

interface IpDisplayCardProps {
  ipId: string; // bytes32
  creatorRegistryAddress: `0x${string}`;
  onUpdateMetadata: (ipId: string, currentMetadata: RegisteredIp) => void; // Callback to handle update action
}

const IpDisplayCard: React.FC<IpDisplayCardProps> = ({ ipId, creatorRegistryAddress, onUpdateMetadata }) => {
  const { toast } = useToast();

  const { data: ipDetails, error: ipDetailsError, isLoading: isLoadingIpDetails } = useReadContract({
    address: creatorRegistryAddress,
    abi: creatorRegistryAbi.abi,
    functionName: 'getIpDetails',
    args: [ipId as `0x${string}`], // Cast ipId to bytes32 hex string type
    query: {
      enabled: !!ipId && !!creatorRegistryAddress,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  });

  if (isLoadingIpDetails) {
    return (
      <Card className="glass-effect overflow-hidden animate-pulse">
        <CardHeader>
          <CardTitle className="h-6 bg-gray-200 rounded w-3/4"></CardTitle>
          <CardDescription className="h-4 bg-gray-200 rounded w-1/2 mt-1"></CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mt-1"></div>
          <div className="h-10 bg-gray-200 rounded w-full mt-3"></div>
        </CardContent>
      </Card>
    );
  }

  if (ipDetailsError) {
    console.error(`Error fetching IP details for ${ipId}:`, ipDetailsError);
    toast({ title: "Error Fetching IP", description: `Could not load details for IP ID ${ipId.substring(0,10)}...`, variant: "destructive" });
    return (
      <Card className="border-red-500 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" /> Error Loading IP
          </CardTitle>
          <CardDescription className="text-xs text-red-600 font-mono break-all">ID: {ipId}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Failed to load details. {ipDetailsError.shortMessage || ipDetailsError.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!ipDetails) {
    return (
        <Card className="border-yellow-500 bg-yellow-50/50">
            <CardHeader>
            <CardTitle className="text-yellow-700 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" /> IP Data Not Found
            </CardTitle>
            <CardDescription className="text-xs text-yellow-600 font-mono break-all">ID: {ipId}</CardDescription>
            </CardHeader>
            <CardContent>
            <p className="text-yellow-600 text-sm">No details returned for this IP.</p>
            </CardContent>
        </Card>
    );
  }

  const ip = ipDetails as RegisteredIp;

  return (
    <Card className="glass-effect overflow-hidden flex flex-col h-full">
      <CardHeader>
        <CardTitle className="truncate gradient-text">{ip.ipName || 'Unnamed IP'}</CardTitle>
        <CardDescription className="text-xs text-gray-500 font-mono break-all">ID: {ipId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <p className="text-sm text-gray-700">
          <strong className="font-medium">Metadata:</strong> 
          <a href={ip.ipMetadataUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline truncate block break-all">{ip.ipMetadataUrl}</a>
        </p>
        <p className="text-sm text-gray-700">
          <strong className="font-medium">Registered:</strong> {new Date(Number(ip.creationTimestamp) * 1000).toLocaleDateString()}
        </p>
        <div className={`text-xs font-semibold px-2 py-1 inline-block rounded-full ${ip.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {ip.isVerified ? 'Verified' : 'Unverified'}
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button variant="outline" size="sm" className="w-full" onClick={() => onUpdateMetadata(ipId, ip)}>
            <Edit3 className="mr-2 h-4 w-4" /> Update Metadata
        </Button>
      </div>
    </Card>
  );
};

export default IpDisplayCard; 