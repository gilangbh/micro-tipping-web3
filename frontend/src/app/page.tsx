'use client'; // Required for RainbowKit components

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, isAddress, isHex } from 'viem';
import React, { useState, useEffect } from 'react';
import contractAddressData from '@/generated/contract-address.json';
import tippingAbi from '@/abi/Tipping.json'; // Import the ABI

// A simple SVG spinner component
const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [txStatus, setTxStatus] = useState(''); // For displaying transaction status
  const [recipientError, setRecipientError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [ipId, setIpId] = useState(''); // State for IP ID
  const [ipIdError, setIpIdError] = useState(''); // State for IP ID error

  const contractReadAddress = contractAddressData.address as `0x${string}`;

  const { data: hash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const validateInputs = (): boolean => {
    let isValid = true;
    setRecipientError('');
    setAmountError('');
    setIpIdError(''); // Clear IP ID error

    if (!recipient) {
      setRecipientError('Recipient address is required.');
      isValid = false;
    } else if (!isAddress(recipient)) {
      setRecipientError('Invalid Ethereum address format.');
      isValid = false;
    }

    if (!amount) {
      setAmountError('Amount is required.');
      isValid = false;
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setAmountError('Amount must be a positive number.');
        isValid = false;
      }
    }

    // Validate IP ID (must be a 0x prefixed hex string, 66 chars long for bytes32)
    if (!ipId) {
      setIpIdError('IP ID is required.');
      isValid = false;
    } else if (!isHex(ipId) || ipId.length !== 66) {
      setIpIdError('IP ID must be a 0x prefixed 32-byte hex string (e.g., 0x...).');
      isValid = false;
    }

    return isValid;
  };

  const handleTipSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTxStatus(''); // Clear previous status
    if (!validateInputs()) {
      return;
    }

    if (!isConnected || !contractReadAddress) {
      setTxStatus('Please connect your wallet and ensure contract address is available.');
      return;
    }

    setTxStatus('Preparing transaction...');
    console.log('Submitting tip:', { recipient, amount, message, contractAddress: contractReadAddress });

    try {
      writeContract({
        address: contractReadAddress,
        abi: tippingAbi.abi, // Use the imported ABI
        functionName: 'tipNative',
        args: [recipient, message || '', ipId as `0x${string}`], // Add ipId to args
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
    // Clear errors on new action
    if (isWritePending || isConfirming) {
        setRecipientError('');
        setAmountError('');
        setIpIdError(''); // Clear IP ID error
    }
    if (writeError) {
      setTxStatus(`Transaction Error: ${writeError.message.split('\n')[0]}`); // Show only the first line of the error
      console.error('Transaction Write Error:', writeError);
    }
    if (hash && !isConfirming && !isConfirmed && !writeError) { // Added !writeError condition
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
      setIpId(''); // Clear IP ID field
      // Optionally, clear status after a few seconds
      setTimeout(() => setTxStatus(''), 7000);
    }
    if (receiptError) {
        setTxStatus(`Confirmation Error: ${receiptError.message.split('\n')[0]}`); // Show only the first line
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
                    disabled={isWritePending || isConfirming}
                  />
                  {recipientError && <p className="mt-1 text-xs text-red-500">{recipientError}</p>}
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
                    disabled={isWritePending || isConfirming}
                  />
                  {amountError && <p className="mt-1 text-xs text-red-500">{amountError}</p>}
                </div>
                <div>
                  <label htmlFor="ipId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">IP ID (bytes32 hex)</label>
                  <input 
                    type="text" 
                    name="ipId" 
                    id="ipId" 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 text-black dark:text-white"
                    placeholder="0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
                    value={ipId}
                    onChange={(e) => setIpId(e.target.value)}
                    required
                    disabled={isWritePending || isConfirming}
                  />
                  {ipIdError && <p className="mt-1 text-xs text-red-500">{ipIdError}</p>}
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
                    disabled={isWritePending || isConfirming}
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  disabled={isWritePending || isConfirming}
                >
                  {(isWritePending || isConfirming) && <Spinner />}
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
