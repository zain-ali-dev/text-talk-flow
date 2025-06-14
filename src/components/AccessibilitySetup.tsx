
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Settings, Smartphone, CheckCircle, AlertCircle, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface AccessibilitySetupProps {
  isAccessibilityEnabled: boolean;
  onRequestPermission: () => Promise<boolean>;
  onCheckStatus: () => Promise<boolean>;
}

const AccessibilitySetup = ({ 
  isAccessibilityEnabled, 
  onRequestPermission, 
  onCheckStatus 
}: AccessibilitySetupProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAndroidApp, setIsAndroidApp] = useState(false);

  useEffect(() => {
    // Check if running in Android app
    const checkEnvironment = () => {
      const isAndroid = window.location.href.includes('capacitor://') || 
                       (window as any).Capacitor !== undefined ||
                       navigator.userAgent.includes('wv') ||
                       navigator.userAgent.includes('Android');
      setIsAndroidApp(isAndroid);
    };
    checkEnvironment();
  }, []);

  const handleRequestPermission = async () => {
    setIsChecking(true);
    try {
      await onRequestPermission();
      setTimeout(() => {
        onCheckStatus();
      }, 3000);
    } finally {
      setIsChecking(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (isAndroidApp) {
      toast.info("Opening WhatsApp app...");
      // Try to open WhatsApp app on Android
      window.open('intent://send?text=Test#Intent;scheme=whatsapp;package=com.whatsapp;end', '_blank');
    } else {
      toast.info("Opening WhatsApp Web...");
      window.open('https://web.whatsapp.com', '_blank');
    }
  };

  const handleManualSettings = () => {
    toast.info("Go to Android Settings > Accessibility > Downloaded Apps > VoiceAssist > Turn On");
  };

  const handleTestInstructions = () => {
    toast.success("How to use: Click 'Start' to enable listening, then go to any webpage and tap on any text content to hear it read aloud!");
  };

  if (isAndroidApp) {
    return (
      <Card className="border-2 shadow-lg">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Android App Setup</h3>
          </div>

          {!isAccessibilityEnabled ? (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                ⚠️ Accessibility service required for WhatsApp message reading
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Accessibility service is enabled! Ready to use with WhatsApp.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <p className="font-medium text-blue-900">Enable Accessibility Service</p>
                    <p className="text-sm text-blue-700">Android Settings → Accessibility → Downloaded Apps → VoiceAssist → Turn On</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <p className="font-medium text-green-900">Allow Overlay Permission</p>
                    <p className="text-sm text-green-700">Allow app to display over other apps (if prompted)</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <p className="font-medium text-purple-900">Use with WhatsApp</p>
                    <p className="text-sm text-purple-700">Open WhatsApp and tap any message to hear it</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={handleRequestPermission}
                disabled={isChecking}
                className="h-12"
              >
                <Settings className="w-4 h-4 mr-2" />
                {isChecking ? 'Opening Settings...' : 'Open Accessibility Settings'}
              </Button>

              <Button 
                onClick={handleManualSettings}
                variant="outline"
                className="h-12"
              >
                <Shield className="w-4 h-4 mr-2" />
                Manual Setup Instructions
              </Button>

              <Button 
                onClick={handleOpenWhatsApp}
                variant="outline"
                className="h-12"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Open WhatsApp
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>For Android WhatsApp:</strong></p>
            <p>• Enable accessibility service in Android Settings</p>
            <p>• Allow overlay permission when prompted</p>
            <p>• Works in background with WhatsApp app</p>
            <p>• Tap any message in WhatsApp chats to hear it</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Web version (existing code)
  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Universal Text Reader</h3>
        </div>

        <Alert className="border-green-200 bg-green-50">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Ready to use! This app works on any webpage - just tap any text to hear it spoken aloud.
            </AlertDescription>
          </div>
        </Alert>

        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p className="font-medium text-blue-900">Start Listening</p>
                  <p className="text-sm text-blue-700">Click "Start" to enable text-to-speech</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p className="font-medium text-green-900">Open Any Website</p>
                  <p className="text-sm text-green-700">Go to WhatsApp Web, news sites, or any webpage</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p className="font-medium text-purple-900">Tap Any Text</p>
                  <p className="text-sm text-purple-700">Click on any text content to hear it read aloud</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={handleOpenWhatsApp}
              className="h-12"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Open WhatsApp Web
            </Button>

            <Button 
              onClick={handleTestInstructions}
              variant="outline"
              className="h-12"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              How to Use
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>How it works:</strong></p>
          <p>• Works on any webpage - WhatsApp, news, social media, etc.</p>
          <p>• Simply tap any text content to hear it read aloud</p>
          <p>• Automatically cleans up timestamps and UI elements</p>
          <p>• No special permissions or setup required</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilitySetup;
