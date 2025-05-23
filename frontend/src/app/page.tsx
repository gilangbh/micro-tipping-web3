'use client'; // Required for RainbowKit components

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import React, { useState, useEffect } from 'react';
import contractAddressData from '@/generated/contract-address.json';
import tippingAbi from '@/abi/Tipping.json'; // Import the ABI

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [txStatus, setTxStatus] = useState(''); // For displaying transaction status

  const contractReadAddress = contractAddressData.address as `0x${string}`;

  const { data: hash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleTipSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isConnected || !contractReadAddress) {
      setTxStatus('Please connect your wallet and ensure contract address is available.');
      return;
    }
    if (!recipient || !amount) {
      setTxStatus('Please enter recipient and amount.');
      return;
    }

    setTxStatus('Preparing transaction...');
    console.log('Submitting tip:', { recipient, amount, message, contractAddress: contractReadAddress });

    try {
      writeContract({
        address: contractReadAddress,
        abi: tippingAbi.abi, // Use the imported ABI
        functionName: 'tipNative',
        args: [recipient, message || ''], // Ensure message is a string
        value: parseEther(amount), // Convert amount to wei
      });
      console.log('writeContract called');
    } catch (e) {
      console.error("Error preparing/sending transaction:", e);
      setTxStatus(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  useEffect(() => {
    if (isWritePending) {
      setTxStatus('Sending transaction to wallet... Please confirm.');
      console.log('Transaction is pending wallet confirmation...');
    }
    if (writeError) {
      setTxStatus(`Transaction Error: ${writeError.message}`);
      console.error('Transaction Write Error:', writeError);
    }
    if (hash && !isConfirming && !isConfirmed) {
        setTxStatus(`Transaction sent! Hash: ${hash}. Waiting for confirmation...`);
        console.log(`Transaction hash: ${hash}, waiting for confirmation.`);
    }
    if (isConfirming) {
      setTxStatus(`Transaction confirming... Hash: ${hash}`);
      console.log(`Transaction is confirming... Hash: ${hash}`);
    }
    if (isConfirmed) {
      setTxStatus(`Tip sent successfully! Transaction Hash: ${hash}`);
      console.log(`Transaction confirmed! Hash: ${hash}`);
      setRecipient('');
      setAmount('');
      setMessage('');
      // Optionally, clear status after a few seconds
      setTimeout(() => setTxStatus(''), 7000);
    }
    if (receiptError) {
        setTxStatus(`Confirmation Error: ${receiptError.message}`);
        console.error('Transaction Confirmation Error:', receiptError);
    }
  }, [hash, isWritePending, writeError, isConfirming, isConfirmed, receiptError]);

  if (!isMounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div>Loading DApp...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-16">
      <header className="w-full max-w-5xl flex justify-between items-center py-4 mb-10">
        <h1 className="text-2xl font-semibold">Micro-Tipping DApp</h1>
        <ConnectButton />
      </header>

      <div className="flex flex-col items-center justify-center flex-grow">
        {isConnected ? (
          <div className="w-full max-w-2xl space-y-8">
            <div className="p-6 rounded-lg shadow-md bg-white dark:bg-neutral-800/30">
              <h2 className="text-xl font-semibold mb-2">Wallet Information</h2>
              <p className="text-sm opacity-80 break-all">Connected: {address}</p>
              <p className="text-sm opacity-80 break-all mt-1">Contract: {contractReadAddress}</p>
            </div>

            <div className="p-6 rounded-lg shadow-md bg-white dark:bg-neutral-800/30">
              <h2 className="text-xl font-semibold mb-2">Send a Tip (Native CAMP)</h2>
              <form onSubmit={handleTipSubmit} className="space-y-4">
                <div>
                  <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recipient Address</label>
                  <input 
                    type="text" 
                    name="recipient" 
                    id="recipient" 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 text-black dark:text-white"
                    placeholder="0x..." 
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (CAMP)</label>
                  <input 
                    type="text" 
                    name="amount" 
                    id="amount" 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 text-black dark:text-white" 
                    placeholder="0.1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message (Optional)</label>
                  <textarea 
                    name="message" 
                    id="message" 
                    rows={3} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 text-black dark:text-white" 
                    placeholder="Great content!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  disabled={isWritePending || isConfirming}
                >
                  {isWritePending ? 'Waiting for Wallet...' : isConfirming ? 'Processing Tip...' : 'Send Tip'}
                </button>
              </form>
              {txStatus && (
                <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400 break-all">{txStatus}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-lg">Please connect your wallet to use the Tipping DApp.</p>
        )}
      </div>

      <footer className="w-full max-w-5xl text-center py-4 mt-10">
        <p className="text-sm opacity-60">
          Micro-Tipping Platform on Camp Network
        </p>
      </footer>
    </main>
  );
}
