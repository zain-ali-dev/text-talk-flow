
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, CheckCircle, XCircle, Phone } from "lucide-react";
import { useWhatsAppWhitelist } from "@/hooks/useWhatsAppWhitelist";
import { toast } from "sonner";

interface WhatsAppVerificationProps {
  onVerificationChange: (isVerified: boolean) => void;
  isFullScreen?: boolean;
}

const WhatsAppVerification = ({ onVerificationChange, isFullScreen = false }: WhatsAppVerificationProps) => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerifyNumber();
    }
  };

  if (error) {
    console.error('Whitelist fetch error:', error);
  }

  const CardWrapper = isFullScreen ? 'div' : Card;
  const ContentWrapper = isFullScreen ? 'div' : CardContent;

  return (
    <div className={isFullScreen ? "min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4" : ""}>
      <div className={isFullScreen ? "w-full max-w-md" : ""}>
        <CardWrapper className={isFullScreen ? "" : "border-2 shadow-lg"}>
          <ContentWrapper className={isFullScreen ? "space-y-6" : "p-6 space-y-4"}>
            {isFullScreen && (
              <div className="text-center space-y-2 mb-6">
                <Shield className="w-12 h-12 text-primary mx-auto" />
                <h1 className="text-2xl font-bold">WhatsApp Verification</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your WhatsApp number to access TTS features
                </p>
              </div>
            )}

            {!isFullScreen && (
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">WhatsApp Number Verification</h3>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">WhatsApp Number</label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      type="tel"
                      placeholder="+923001234567"
                      value={inputNumber}
                      onChange={(e) => setInputNumber(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="text-base h-12"
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    onClick={handleVerifyNumber}
                    disabled={isLoading || !inputNumber.trim()}
                    className="px-6 h-12"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {isLoading ? 'Loading...' : 'Verify'}
                  </Button>
                </div>
              </div>

              {currentNumber && (
                <div className={`flex items-center space-x-3 p-4 rounded-lg border ${
                  isWhitelisted 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {isWhitelisted ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-base">
                      {isWhitelisted ? 'Verified Successfully' : 'Not Whitelisted'}
                    </p>
                    <p className="text-sm break-all">
                      Number: {currentNumber}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Unable to load whitelist. Using fallback data for testing.
                  </p>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Enter your WhatsApp number with country code</p>
                <p>• Only whitelisted numbers can use TTS functionality</p>
                <p>• The app will run in background after verification</p>
              </div>
            </div>
          </ContentWrapper>
        </CardWrapper>
      </div>
    </div>
  );
};

export default WhatsAppVerification;
