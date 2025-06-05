'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Zap } from 'lucide-react';

interface TippingFormProps {
  isConnected: boolean;
  onSubmit: (recipient: string, amount: string, ipId: string, message?: string) => Promise<void>;
  isSending: boolean;
}

const TippingForm: React.FC<TippingFormProps> = ({ isConnected, onSubmit, isSending }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [ipId, setIpId] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const validateForm = () => {
    if (!recipient.trim() || !recipient.startsWith('0x') || recipient.length !== 42) {
      toast({
        title: "Invalid Recipient",
        description: "Please enter a valid Ethereum address (0x...).",
        variant: "destructive",
      });
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid tip amount",
        variant: "destructive",
      });
      return false;
    }
    if (!ipId.trim()) {
      toast({
        title: "Invalid IP ID",
        description: "Please enter a valid IP ID.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
    if (!validateForm()) return;
    try {
      await onSubmit(recipient, amount, ipId, message);
      setRecipient('');
      setAmount('');
      setIpId('');
      setMessage('');
    } catch (error) {
      console.error('Error submitting tip from TippingForm:', error);
      toast({
        title: "Tipping Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md glass-effect border-purple-200 animate-float">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="gradient-text">Send a Tip</span>
        </CardTitle>
        <CardDescription>
          Support with native currency (CAMP)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address *</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="font-mono text-sm"
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ipId">IP ID *</Label>
            <Input
              id="ipId"
              placeholder="Content identifier (e.g., doc_xyz)"
              value={ipId}
              onChange={(e) => setIpId(e.target.value)}
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Thanks for the great content!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={isSending}
            />
          </div>

          <Button
            type="submit"
            className="w-full web3-gradient text-white hover:opacity-90 transition-opacity"
            disabled={!isConnected || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Tip...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Tip
              </>
            )}
          </Button>

          {!isConnected && (
            <p className="text-sm text-center text-muted-foreground">
              Connect your wallet to send tips
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default TippingForm;