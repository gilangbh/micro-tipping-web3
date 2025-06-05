'use client'; // Required for RainbowKit components

import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConnect, useDisconnect, useBalance, useSendTransaction } from 'wagmi'; // Added useBalance, useSendTransaction
import { parseEther } from 'viem';
import { useConnectModal } from '@rainbow-me/rainbowkit'; // Import useConnectModal
// import { ConnectButton } from '@rainbow-me/rainbowkit'; // Header now handles connect/disconnect UI

import contractAddressData from '@/generated/contract-address.json';
import tippingAbi from '@/abi/Tipping.json';
import creatorRegistryAbi from '@/abi/CreatorRegistry.json'; // Import CreatorRegistry ABI

// Import new components
import Header from '@/components/Header'; // Import Header
import TippingForm from '@/components/TippingForm';
import ContractInfo from '@/components/ContractInfo';
// import RecentTips from '@/components/RecentTips'; // Placeholder
// import NetworkStatus from '@/components/NetworkStatus'; // Placeholder, might be in layout footer
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

// Stats Icons (example, replace with actual icons if available or use lucide-react)
const TotalTipsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><path d="M12 12V6"/></svg>; // Example Zap/Heart mix
const CampVolumeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; // Example Dollar Sign / Trending Up
const ActiveCreatorsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; // Example Users
const AvgTipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>; // Example Layers / Stack

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  bgColor?: string;
  textColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, bgColor = 'bg-purple-100', textColor = 'text-purple-700' }) => (
  <div className={`p-6 rounded-xl shadow-lg glass-effect flex flex-col items-center justify-center text-center ${bgColor}`}>
    <div className={`mb-3 text-3xl ${textColor}`}>{icon}</div>
    <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
    <p className={`text-sm text-gray-600`}>{label}</p>
  </div>
);

export default function Page() {
  const { address, isConnected, status: accountStatus } = useAccount();
  const { connectors, connect, isPending: isWagmiConnecting } = useConnect();
  const { disconnect, isPending: isDisconnecting } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { toast } = useToast();
  const { openConnectModal } = useConnectModal(); // RainbowKit's connect modal hook

  const [txStatus, setTxStatus] = useState('');
  
  // Contract Addresses from generated file
  const tippingContractReadAddress = contractAddressData.tippingContractAddress as `0x${string}`;
  const creatorRegistryContractReadAddress = contractAddressData.creatorRegistryAddress as `0x${string}`; // Corrected type assertion

  const { data: hash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    console.log("[Page Load/Connectors Change] Connectors:", connectors);
    console.log("[Page Load/Account Change] Address:", address, "IsConnected:", isConnected, "Status:", accountStatus);
  }, [connectors, address, isConnected, accountStatus]);

  const handleConnect = async () => {
    console.log("[ConnectWallet] Attempting to open RainbowKit connect modal...");
    if (openConnectModal) {
      openConnectModal();
    } else {
      // Fallback or error if RainbowKit's modal hook isn't available
      // This shouldn't happen if RainbowKitProvider is set up correctly
      console.error("[ConnectWallet] RainbowKit openConnectModal is not available.");
      toast({
        title: "Connection Unavailable",
        description: "Wallet connection modal could not be opened. Please try refreshing.",
        variant: "destructive",
      });
      // As a last resort, could try wagmi's connect with the first connector, but modal is preferred
      // if (connectors.length > 0) {
      //   connect({ connector: connectors[0] });
      // }
    }
  };

  useEffect(() => {
    if (writeError) {
      console.error("Connection Error:", writeError);
      // Optionally, set a user-facing error message using toast or txStatus
      // toast({ title: "Connection Failed", description: writeError.message, variant: "destructive" });
    }
  }, [writeError]);

  const handleDisconnect = () => {
    console.log("[DisconnectWallet] Attempting to disconnect...");
    try {
      disconnect();
      console.log("[DisconnectWallet] Disconnect call successful.");
    } catch (error) {
      console.error("[DisconnectWallet] Error during disconnect:", error);
      toast({
        title: "Disconnection Error",
        description: error instanceof Error ? error.message : "Failed to disconnect.",
        variant: "destructive",
      });
    }
  };

  const handleSendTip = async (recipient: string, amount: string, message: string, ipId: string) => {
    setTxStatus('');
    if (!isConnected || !tippingContractReadAddress) {
      setTxStatus('Please connect your wallet and ensure contract address is available.');
      // Consider using toast for this kind of feedback as in TippingForm
      return;
    }
    // Validation is now handled within TippingForm, but can be re-checked here if needed
    setTxStatus('Preparing transaction...');
    try {
      writeContract({
        address: tippingContractReadAddress,
        abi: tippingAbi.abi,
        functionName: 'tipNative',
        args: [recipient, message || '', (ipId || `0x${ '0'.repeat(64)}`) as `0x${string}`], // Ensure ipId is bytes32 if empty
        value: parseEther(amount),
      });
    } catch (e) {
      console.error("Error preparing/sending transaction:", e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      setTxStatus(`Error: ${errorMsg}`);
      // Consider toast for errors too
    }
  };

  useEffect(() => {
    if (isWritePending) {
      setTxStatus('Sending transaction to wallet... Please confirm.');
    }
    if (writeError) {
      setTxStatus(`Transaction Error: ${writeError.message.split('\n')[0]}`);
    }
    if (hash && !isConfirming && !isConfirmed && !writeError) {
      setTxStatus(`Transaction sent! Hash: ${hash}. Waiting for confirmation...`);
    }
    if (isConfirming) {
      setTxStatus(`Transaction confirming... Hash: ${hash}`);
    }
    if (isConfirmed) {
      setTxStatus(`Tip sent successfully! Transaction Hash: ${hash}`);
      // Form reset is handled in TippingForm
      setTimeout(() => setTxStatus(''), 7000);
    }
    if (receiptError) {
      setTxStatus(`Confirmation Error: ${receiptError.message.split('\n')[0]}`);
    }
  }, [hash, isWritePending, writeError, isConfirming, isConfirmed, receiptError]);

  // Tipping Logic (simplified, assuming TippingForm handles its own state for amount/ipId)
  const [tipTxHash, setTipTxHash] = useState<`0x${string}` | undefined>();
  const { data: tipData, sendTransaction, isPending: isSendingTip, error: tipError } = useSendTransaction();
  const { isLoading: isConfirmingTip, isSuccess: isTipConfirmed } = useWaitForTransactionReceipt({
    hash: tipTxHash,
  });

  const handleTipSubmit = async (recipient: string, amount: string, ipId: string, message?: string) => {
    if (!isConnected || !address) {
      toast({ title: "Wallet Not Connected", description: "Please connect your wallet to send a tip.", variant: "default" });
      return;
    }
    // Validations for recipient, amount, ipId are now primarily in TippingForm
    // but can be re-validated here if desired.
    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
       toast({ title: "Invalid Recipient", description: "Recipient address is not valid.", variant: "destructive" });
       return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid tip amount.", variant: "default" });
      return;
    }
    if (!ipId.trim()) {
        toast({ title: "Invalid IP ID", description: "Please enter a valid IP ID.", variant: "default" });
        return;
    }

    console.log(`Attempting to tip ${amount} to ${recipient} for IP ID: ${ipId}. Message: ${message || 'N/A'} from ${address}`);
    try {
      const parsedAmount = parseEther(amount as `${number}`);
      sendTransaction({ 
        to: recipient as `0x${string}`, // Use dynamic recipient
        value: parsedAmount,
        // For contract interaction, you would use `data` field with abi encoded function call
        // e.g., data: encodeFunctionData({ abi: tippingAbi.abi, functionName: 'tipNative', args: [recipient, message || '', ipId] })
        // and `to` would be the contract address.
      });
    } catch (e) {
      console.error("Tip submission error:", e);
      toast({ title: "Tipping Error", description: e instanceof Error ? e.message : "Could not initiate tip.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (tipData) {
      setTipTxHash(tipData);
      toast({ title: "Transaction Sent", description: `Hash: ${tipData}` });
    }
  }, [tipData, toast]);

  useEffect(() => {
    if (isTipConfirmed) {
      toast({ title: "Tip Confirmed!", description: `Transaction ${tipTxHash} confirmed.`, variant: "default" });
      // Potentially refresh balance or recent tips here
    }
    if (tipError) {
        toast({ title: "Tipping Error", description: tipError.message, variant: "destructive" });
    }
  }, [isTipConfirmed, tipError, tipTxHash, toast]);

  // --- Creator Registry State & Interactions ---
  const [ipName, setIpName] = useState('');
  const [ipMetadataUrl, setIpMetadataUrl] = useState('');
  const [registrationTxStatus, setRegistrationTxStatus] = useState('');

  // Wagmi hooks for CreatorRegistry (example: registerIp)
  const { data: registerIpHash, error: registerIpError, isPending: isRegisterIpPending, writeContract: registerIpWriteContract } = useWriteContract();
  const { isLoading: isRegisterIpConfirming, isSuccess: isRegisterIpConfirmed, error: registerIpReceiptError } = useWaitForTransactionReceipt({ hash: registerIpHash });

  // Effect for CreatorRegistry transaction status
  useEffect(() => {
    if (isRegisterIpPending) {
      setRegistrationTxStatus('Sending IP registration to wallet... Please confirm.');
    }
    if (registerIpError) {
      const shortMessage = registerIpError.message.split('\n')[0];
      setRegistrationTxStatus(`IP Registration Error: ${shortMessage}`);
      toast({ title: "IP Registration Error", description: shortMessage, variant: "destructive" });
    }
    if (registerIpHash && !isRegisterIpConfirming && !isRegisterIpConfirmed && !registerIpError) {
        setRegistrationTxStatus(`IP Registration sent! Hash: ${registerIpHash}. Waiting for confirmation...`);
        toast({ title: "IP Registration Sent", description: `Hash: ${registerIpHash}` });
    }
    if (isRegisterIpConfirming) {
      setRegistrationTxStatus(`IP Registration confirming... Hash: ${registerIpHash}`);
    }
    if (isRegisterIpConfirmed) {
      setRegistrationTxStatus(`IP Registered successfully! Transaction Hash: ${registerIpHash}`);
      toast({ title: "IP Registered!", description: `Transaction ${registerIpHash} confirmed.`, variant: "default" });
      setIpName(''); // Clear form
      setIpMetadataUrl(''); // Clear form
      setTimeout(() => setRegistrationTxStatus(''), 7000);
    }
    if (registerIpReceiptError) {
      const shortMessage = registerIpReceiptError.message.split('\n')[0];
      setRegistrationTxStatus(`IP Registration Confirmation Error: ${shortMessage}`);
      toast({ title: "IP Registration Confirmation Error", description: shortMessage, variant: "destructive" });
    }
  }, [registerIpHash, isRegisterIpPending, registerIpError, isRegisterIpConfirming, isRegisterIpConfirmed, registerIpReceiptError, toast]);


  const handleRegisterIp = async () => {
    if (!isConnected || !creatorRegistryContractReadAddress) {
      toast({ title: "Cannot Register IP", description: "Please connect your wallet and ensure the Creator Registry is available.", variant: "destructive" });
      return;
    }
    if (!ipName.trim() || !ipMetadataUrl.trim()) {
      toast({ title: "Missing Information", description: "Please provide both an IP Name and a Metadata URL.", variant: "destructive" });
      return;
    }
    console.log(`Attempting to register IP: Name='${ipName}', MetadataURL='${ipMetadataUrl}' to contract: ${creatorRegistryContractReadAddress}`);
    try {
      registerIpWriteContract({
        address: creatorRegistryContractReadAddress,
        abi: creatorRegistryAbi.abi, // Use imported ABI
        functionName: 'registerIp',
        args: [ipName, ipMetadataUrl],
      });
    } catch (e) {
      console.error("Error preparing/sending IP registration transaction:", e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      setRegistrationTxStatus(`Error: ${errorMsg}`);
      toast({ title: "Registration Error", description: errorMsg, variant: "destructive" });
    }
  };
  // --- End Creator Registry ---

  // Dummy data for stats and recent tips
  const stats = [
    { icon: <TotalTipsIcon />, value: 157, label: 'Total Tips', bgColor: 'bg-pink-100', textColor: 'text-pink-700' },
    { icon: <CampVolumeIcon />, value: '12.45', label: 'CAMP Volume', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
    { icon: <ActiveCreatorsIcon />, value: 23, label: 'Active Creators', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    { icon: <AvgTipIcon />, value: '0.079', label: 'Avg Tip (CAMP)', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  ];

  const dummyRecentTips = [
    { id: 1, amount: '0.05 CAMP', from: '0x1234...7890', to: '0x0987...4321', message: 'Great content!', ipId: '#0xabcd...ef12', time: '5 minutes ago' },
    { id: 2, amount: '0.1 CAMP', from: '0x2345...8901', to: '0x1987...3210', message: 'Keep up the awesome work!', ipId: '#0xbcde...f012', time: '15 minutes ago' },
  ];

  // Placeholder for How It Works data
  const howItWorksSteps = [
    'Connect your Web3 wallet',
    'Enter creator\'s address & tip amount',
    'Add optional message & content ID',
    'Send instant CAMP token tip!',
  ];

  // Dummy data for RecentTips (replace with actual data fetching later)
  const recentTipsData = [
    { id: 1, from: '0x123...', to: '0x456...', amount: '0.1 ETH', ipId: 'doc_id_1' },
    { id: 2, from: '0x789...', to: '0xabc...', amount: '0.05 ETH', ipId: 'image_id_2' },
  ];

  return (
    <>
      <Header 
        isConnected={isConnected}
        isConnecting={isWagmiConnecting} // Use wagmi's isPending for connect
        address={address}
        onConnect={handleConnect} // This will now call openConnectModal
        onDisconnect={handleDisconnect}
        balance={balance?.formatted}
      />
      <div className="w-full space-y-12 mt-8"> {/* Added mt-8 to give space below sticky header */}
        {/* Title Section */}
        <section className="text-center py-8">
          <h1 className="text-5xl font-bold gradient-text mb-4 animate-float">
            Micro-Tipping Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Support your favorite content creators with instant CAMP token tips on the Camp Network.
          </p>
        </section>

        {/* Stats Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </section>

        {/* Main Content Area - 3 columns on larger screens */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Tipping Form */}
          <div className="lg:col-span-1 flex justify-center">
            <TippingForm 
              onSubmit={handleTipSubmit} 
              isSending={isSendingTip || isConfirmingTip}
              isConnected={isConnected}
            />
          </div>

          {/* Middle Column: Recent Tips / Creator IP Registration */}
          <div className="lg:col-span-1 bg-white/70 backdrop-blur-md shadow-lg rounded-xl border border-white/30 p-6 glass-effect space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-center gradient-text">Recent Tips</h2>
              {recentTipsData.length > 0 ? (
                <ul className="space-y-4">
                  {recentTipsData.map((tip) => (
                    <li key={tip.id} className="p-4 rounded-lg bg-slate-50/50 border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-purple-600">{tip.amount}</span>
                        {tip.ipId && <p className="text-xs mt-1 text-indigo-600 font-mono">{tip.ipId}</p>}
                      </div>
                      <p className="text-xs text-gray-500 truncate">From: {tip.from} To: {tip.to}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">No recent tips yet.</p>
              )}
            </div>

            {/* New Creator IP Registration Form */}
            <div className="pt-6 border-t border-purple-200/50">
              <h2 className="text-2xl font-semibold mb-6 text-center gradient-text">Register Your IP</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleRegisterIp(); }} className="space-y-4">
                <div>
                  <Label htmlFor="ipName" className="text-sm font-medium text-gray-700">IP Name *</Label>
                  <Input
                    id="ipName"
                    placeholder="My Awesome Creation"
                    value={ipName}
                    onChange={(e) => setIpName(e.target.value)}
                    disabled={isRegisterIpPending || isRegisterIpConfirming}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ipMetadataUrl" className="text-sm font-medium text-gray-700">Metadata URL *</Label>
                  <Input
                    id="ipMetadataUrl"
                    placeholder="https://example.com/my-ip-metadata.json"
                    value={ipMetadataUrl}
                    onChange={(e) => setIpMetadataUrl(e.target.value)}
                    disabled={isRegisterIpPending || isRegisterIpConfirming}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full web3-gradient text-white hover:opacity-90 transition-opacity"
                  disabled={!isConnected || isRegisterIpPending || isRegisterIpConfirming}
                >
                  {(isRegisterIpPending || isRegisterIpConfirming) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering IP...
                    </>
                  ) : (
                    "Register IP"
                  )}
                </Button>
                {registrationTxStatus && (
                  <p className="text-sm text-center text-gray-500 pt-2 break-all">{registrationTxStatus}</p>
                )}
              </form>
            </div>
          </div>

          {/* Right Column: Contract Info & How It Works */}
          <div className="lg:col-span-1 space-y-8 flex flex-col items-center">
            <ContractInfo 
              contractAddress={tippingContractReadAddress || '0x...'} 
              networkName="Camp Testnet" 
              // blockExplorerUrl="https://testnet.campscan.io" // Example
            />
            <div className="w-full max-w-md p-6 bg-white/70 backdrop-blur-md shadow-lg rounded-xl border border-white/30 glass-effect">
              <h3 className="text-lg font-semibold mb-4 text-center gradient-text">How It Works</h3>
              <ul className="space-y-2">
                {howItWorksSteps.map((step, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-3 flex-shrink-0 h-6 w-6 rounded-full web3-gradient flex items-center justify-center text-xs font-bold text-white">{index + 1}</span>
                    <span className="text-sm text-gray-700">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Transaction Status Display */}
        {txStatus && (
          <div className="fixed bottom-4 right-4 max-w-sm w-full bg-gray-800 text-white p-4 rounded-lg shadow-xl glass-effect border-purple-400">
            <p className="text-sm break-all">{txStatus}</p>
          </div>
        )}
      </div>
    </>
  );
}
