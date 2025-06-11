
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, CheckCircle, XCircle, Phone } from "lucide-react";
import { useWhatsAppWhitelist } from "@/hooks/useWhatsAppWhitelist";
import { toast } from "sonner";

interface WhatsAppVerificationProps {
  onVerificationChange: (isVerified: boolean) => void;
}

const WhatsAppVerification = ({ onVerificationChange }: WhatsAppVerificationProps) => {
  const [inputNumber, setInputNumber] = useState('');
  const { 
    whitelist, 
    isWhitelisted, 
    currentNumber, 
    isLoading, 
    error, 
    checkWhitelistStatus 
  } = useWhatsAppWhitelist();

  const handleVerifyNumber = () => {
    if (!inputNumber.trim()) {
      toast.error('Please enter a WhatsApp number');
      return;
    }

    const isVerified = checkWhitelistStatus(inputNumber);
    onVerificationChange(isVerified);
    
    if (isVerified) {
      toast.success('WhatsApp number verified! TTS enabled.');
    } else {
      toast.error('WhatsApp number not whitelisted. TTS disabled.');
    }
  };

  if (error) {
    console.error('Whitelist fetch error:', error);
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">WhatsApp Number Verification</h3>
        </div>

        <div className="space-y-3">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="tel"
                placeholder="+923001234567"
                value={inputNumber}
                onChange={(e) => setInputNumber(e.target.value)}
                className="text-sm"
              />
            </div>
            <Button 
              onClick={handleVerifyNumber}
              disabled={isLoading}
              className="px-4"
            >
              <Phone className="w-4 h-4 mr-2" />
              {isLoading ? 'Loading...' : 'Verify'}
            </Button>
          </div>

          {currentNumber && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
              isWhitelisted 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {isWhitelisted ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">
                  {isWhitelisted ? 'Verified' : 'Not Whitelisted'}
                </p>
                <p className="text-sm">
                  Number: {currentNumber}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Unable to load whitelist. Please check your internet connection.
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>Enter your WhatsApp number to verify access.</p>
            <p>Only whitelisted numbers can use TTS functionality.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppVerification;
