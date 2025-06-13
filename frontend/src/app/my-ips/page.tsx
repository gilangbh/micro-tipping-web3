'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConnect, useDisconnect, useBalance } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import contractAddressData from '@/generated/contract-address.json';
import creatorRegistryAbi from '@/generated/abi/CreatorRegistry.json';
import Header from '@/components/Header'; // Import Header component
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input'; // For Register New IP form, if added here
// import { Label } from '@/components/ui/label'; // For Register New IP form
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, ArrowLeft } from 'lucide-react';
import IpDisplayCard from '@/components/IpDisplayCard'; // Import the new component
import type { RegisteredIp } from '@/components/IpDisplayCard'; // Import the type if needed here, or define locally
import Link from 'next/link'; // Import Link for navigation
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"; // Re-added Dialog
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// TODO: Implement Update IP Modal and its state management
// interface UpdateModalState {
//   isOpen: boolean;
//   ipIdToUpdate: string | null;
//   currentMetadataUrl: string | null;
// }

export default function MyIpsPage() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isWagmiConnecting } = useConnect();
  const { disconnect, isPending: isDisconnecting } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { toast } = useToast();
  const { openConnectModal } = useConnectModal();
  const creatorRegistryAddress = contractAddressData.creatorRegistryAddress as `0x${string}`;

  // const [updateModal, setUpdateModal] = useState<UpdateModalState>({ isOpen: false, ipIdToUpdate: null, currentMetadataUrl: null });

  // State for Register IP Modal and Form
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newIpName, setNewIpName] = useState('');
  const [newIpMetadataUrl, setNewIpMetadataUrl] = useState('');
  const [registrationTxStatus, setRegistrationTxStatus] = useState('');

  // Wagmi hooks for CreatorRegistry registerIp
  const { 
    data: registerIpHash, 
    error: registerIpError, 
    isPending: isRegisterIpWritePending, 
    writeContract: registerIpWriteContract,
    reset: resetRegisterIpWriteContract // To reset mutation state
  } = useWriteContract();
  
  const { 
    isLoading: isRegisterIpConfirming, 
    isSuccess: isRegisterIpConfirmed, 
    error: registerIpReceiptError 
  } = useWaitForTransactionReceipt({ hash: registerIpHash });

  // --- Fetching User's IP List ---
  const { data: userIpIds, error: userIpIdsError, isLoading: isLoadingUserIpIds, refetch: refetchUserIpIds } = useReadContract({
    address: creatorRegistryAddress,
    abi: creatorRegistryAbi.abi,
    functionName: 'getCreatorIpList',
    args: [address!], // Non-null assertion, will only run if address is available
    query: {
      enabled: isConnected && !!address && !!creatorRegistryAddress,
      staleTime: 1 * 60 * 1000, // Cache for 1 minute
      refetchInterval: 30 * 1000, // Optionally refetch periodically
    }
  });

  useEffect(() => {
    if (isConnected && address) {
      refetchUserIpIds();
    }
  }, [isConnected, address, refetchUserIpIds]);

  // Wallet connection handlers
  const handleConnect = async () => {
    console.log("[MyIPs ConnectWallet] Attempting to open RainbowKit connect modal...");
    if (openConnectModal) {
      openConnectModal();
    } else {
      console.error("[MyIPs ConnectWallet] RainbowKit openConnectModal is not available.");
      toast({
        title: "Connection Unavailable",
        description: "Wallet connection modal could not be opened. Please try refreshing.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    console.log("[MyIPs DisconnectWallet] Attempting to disconnect...");
    try {
      disconnect();
      console.log("[MyIPs DisconnectWallet] Disconnect call successful.");
    } catch (error) {
      console.error("[MyIPs DisconnectWallet] Error during disconnect:", error);
      toast({
        title: "Disconnection Error",
        description: error instanceof Error ? error.message : "Failed to disconnect.",
        variant: "destructive",
      });
    }
  };

  // Effect for CreatorRegistry transaction status (Register IP)
  useEffect(() => {
    if (isRegisterIpWritePending) {
      setRegistrationTxStatus('Sending IP registration to wallet... Please confirm.');
    } else if (registerIpError) {
      const shortMessage = registerIpError.message.split('\n')[0];
      setRegistrationTxStatus(`Error: ${shortMessage}`);
      toast({ title: "IP Registration Error", description: shortMessage, variant: "destructive" });
    } else if (isRegisterIpConfirming) {
      setRegistrationTxStatus(`Registering IP... Hash: ${registerIpHash}`);
    } else if (isRegisterIpConfirmed) {
      setRegistrationTxStatus('IP Registered Successfully!');
      toast({ title: "IP Registered!", description: `Transaction ${registerIpHash} confirmed.`, variant: "default" });
      setNewIpName('');
      setNewIpMetadataUrl('');
      setIsRegisterModalOpen(false); // Close modal on success
      refetchUserIpIds(); // Refetch the list of IPs
      resetRegisterIpWriteContract(); // Reset the mutation state for next registration
      setTimeout(() => setRegistrationTxStatus(''), 7000); // Clear status message after a longer period
    } else if (registerIpReceiptError) {
      const shortMessage = registerIpReceiptError.message.split('\n')[0];
      setRegistrationTxStatus(`Confirmation Error: ${shortMessage}`);
      toast({ title: "IP Registration Confirmation Error", description: shortMessage, variant: "destructive" });
    } else if (!isRegisterIpWritePending && !isRegisterIpConfirming && registerIpHash) {
      // Initial transaction sent, waiting for confirmation (not pending in wallet anymore)
      setRegistrationTxStatus(`IP Registration sent! Hash: ${registerIpHash}. Waiting for confirmation...`);
    }
  }, [
    isRegisterIpWritePending, registerIpError, 
    isRegisterIpConfirming, isRegisterIpConfirmed, registerIpReceiptError, 
    registerIpHash, toast, refetchUserIpIds, resetRegisterIpWriteContract
  ]);

  const handleActualRegisterIp = async () => { // No longer takes event directly as it's called from button
    if (!isConnected || !creatorRegistryAddress) {
      toast({ title: "Cannot Register IP", description: "Please connect your wallet.", variant: "destructive" });
      return;
    }
    if (!newIpName.trim() || !newIpMetadataUrl.trim()) {
      toast({ title: "Missing Information", description: "Please provide both an IP Name and a Metadata URL.", variant: "destructive" });
      return;
    }
    setRegistrationTxStatus('Preparing registration...');
    try {
      registerIpWriteContract({
        address: creatorRegistryAddress,
        abi: creatorRegistryAbi.abi,
        functionName: 'registerIp',
        args: [newIpName, newIpMetadataUrl],
      });
    } catch (err) {
      console.error("Error calling registerIpWriteContract:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setRegistrationTxStatus(`Client-side Error: ${errorMsg}`);
      toast({ title: "Client-side Registration Error", description: errorMsg, variant: "destructive" });
    }
  };

  const handleOpenUpdateModal = (ipId: string, currentIp: RegisteredIp) => {
    console.log("Request to update IP:", ipId, "Current metadata:", currentIp.ipMetadataUrl);
    toast({
      title: "Update Feature Placeholder",
      description: `Clicked update for IP ID: ${ipId.substring(0,10)}... Implement modal next.`,
    });
  };

  // Reset form and status when modal is closed via cancel or X button
  useEffect(() => {
    if (!isRegisterModalOpen) {
      setNewIpName('');
      setNewIpMetadataUrl('');
      setRegistrationTxStatus('');
      if(registerIpHash || registerIpError || isRegisterIpWritePending) { // only reset if there was an active mutation
        resetRegisterIpWriteContract();
      }
    }
  }, [isRegisterModalOpen, resetRegisterIpWriteContract, registerIpHash, registerIpError, isRegisterIpWritePending]);

  return (
    <>
      <Header
        isConnected={isConnected}
        isConnecting={isWagmiConnecting}
        address={address}
        balance={balance?.formatted}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      <div className="w-full space-y-12 mt-8"> {/* Added mt-8 to give space below sticky header */}
        <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6 flex justify-between items-center">
            <Link href="/" passHref legacyBehavior>
                <Button variant="outline" className="text-purple-700 border-purple-300 hover:bg-purple-50">
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back to Tipping Page
                </Button>
            </Link>
            {/* Register New IP Button triggers Dialog */}
            <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
              <DialogTrigger asChild>
                <Button className="web3-gradient text-white">
                  <PlusCircle className="mr-2 h-5 w-5" /> Register New IP
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle className="gradient-text">Register New Intellectual Property</DialogTitle>
                  <DialogDescription>
                    Enter the details for your new IP. This will be recorded on the Camp Network.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="modalNewIpName" className="text-right col-span-1">
                      IP Name
                    </Label>
                    <Input
                      id="modalNewIpName"
                      value={newIpName}
                      onChange={(e) => setNewIpName(e.target.value)}
                      placeholder="My Awesome Creation"
                      className="col-span-3"
                      disabled={isRegisterIpWritePending || isRegisterIpConfirming}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="modalNewIpMetadataUrl" className="text-right col-span-1">
                      Metadata URL
                    </Label>
                    <Input
                      id="modalNewIpMetadataUrl"
                      value={newIpMetadataUrl}
                      onChange={(e) => setNewIpMetadataUrl(e.target.value)}
                      placeholder="https://example.com/metadata.json"
                      className="col-span-3"
                      disabled={isRegisterIpWritePending || isRegisterIpConfirming}
                    />
                  </div>
                </div>
                {registrationTxStatus && (
                  <p className="text-sm text-center text-gray-500 py-2 break-all min-h-[20px]">{registrationTxStatus}</p>
                )}
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsRegisterModalOpen(false)} // Simply closes the modal, state reset by useEffect
                    disabled={isRegisterIpWritePending || isRegisterIpConfirming}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleActualRegisterIp}
                    disabled={!newIpName.trim() || !newIpMetadataUrl.trim() || isRegisterIpWritePending || isRegisterIpConfirming || !isConnected}
                    className="web3-gradient text-white"
                  >
                    {isRegisterIpWritePending || isRegisterIpConfirming ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Register IP on Camp Network"
                    )}
                  </Button>
                </DialogFooter>
                 {!isConnected && <p className="text-xs text-center text-red-500 pt-2">Please connect your wallet to register.</p>}
              </DialogContent>
            </Dialog>
        </div>

        <section className="text-center pt-0 pb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">My Registered IP Portfolio</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            View, manage, and register your intellectual property on the Camp Network.
          </p>
        </section>

        <h2 className="text-3xl font-semibold gradient-text mb-6 text-center">Your IP Portfolio</h2>
        {isLoadingUserIpIds ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            <p className="ml-3 text-lg text-gray-500">Loading your IP portfolio...</p>
          </div>
        ) : !isConnected ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>Please connect your wallet to view your IP portfolio.</CardDescription>
            </CardHeader>
          </Card>
        ) : userIpIdsError ? (
          <Card className="mt-6 bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Error Loading IPs</CardTitle>
              <CardDescription className="text-red-600">
                Failed to fetch your IP list: {userIpIdsError.message.split('\n')[0]}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : !userIpIds || (userIpIds as string[]).length === 0 ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>No IPs Found</CardTitle>
              <CardDescription>You haven't registered any IPs yet. Click "Register New IP" above to get started!</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(userIpIds as string[]).map((ipId) => (
              <IpDisplayCard 
                key={ipId} 
                ipId={ipId} 
                creatorRegistryAddress={creatorRegistryAddress}
                onUpdateMetadata={handleOpenUpdateModal} 
              />
            ))}
          </div>
        )}

        {/* TODO: Modal for Updating IP Metadata */}
        {/* {updateModal.isOpen && <UpdateIpModal ipId={updateModal.ipIdToUpdate!} currentUrl={updateModal.currentMetadataUrl!} onClose={() => setUpdateModal({isOpen: false, ipIdToUpdate: null, currentMetadataUrl: null})} /> } */}
        </div>
      </div>
    </>
  );
} 