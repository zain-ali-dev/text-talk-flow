
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
                       navigator.userAgent.includes('wv');
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
      }, 2000);
    } finally {
      setIsChecking(false);
    }
  };

  const handleOpenWhatsApp = () => {
    toast.info("Opening WhatsApp...");
    window.open('https://web.whatsapp.com', '_blank');
  };

  const handleTestInstructions = () => {
    toast.success("Ready to test! Go to WhatsApp and tap any message to hear it spoken aloud.");
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center space-x-2">
          {isAndroidApp ? (
            <Shield className="w-5 h-5 text-primary" />
          ) : (
            <Globe className="w-5 h-5 text-primary" />
          )}
          <h3 className="text-lg font-semibold">
            {isAndroidApp ? "Accessibility Service Setup" : "WhatsApp Web Setup"}
          </h3>
        </div>

        <Alert className={isAccessibilityEnabled ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
          <div className="flex items-center space-x-2">
            {isAccessibilityEnabled ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
            <AlertDescription className={isAccessibilityEnabled ? "text-green-800" : "text-amber-800"}>
              {isAndroidApp ? (
                isAccessibilityEnabled 
                  ? "✅ Accessibility service is enabled! WhatsApp messages will be read aloud when tapped."
                  : "⚠️ Accessibility service is required for WhatsApp integration. Please enable it in Android Settings."
              ) : (
                "🌐 Web version ready! Open WhatsApp Web and tap any message to hear it spoken aloud."
              )}
            </AlertDescription>
          </div>
        </Alert>

        {isAndroidApp ? (
          // Android App Instructions
          !isAccessibilityEnabled && (
            <div className="space-y-4">
              <div className="grid gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <p className="font-medium text-blue-900">Request Permission</p>
                      <p className="text-sm text-blue-700">Allow VoiceAssist to access your device</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <p className="font-medium text-green-900">Enable in Settings</p>
                      <p className="text-sm text-green-700">Go to Accessibility → VoiceAssist → Turn On</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <p className="font-medium text-purple-900">Start Using</p>
                      <p className="text-sm text-purple-700">Open WhatsApp and tap any message</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  onClick={handleRequestPermission}
                  disabled={isChecking}
                  className="h-12"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {isChecking ? 'Requesting...' : 'Request Permission'}
                </Button>

                <Button 
                  onClick={() => toast.info("Opening Android Settings...")}
                  variant="outline"
                  className="h-12"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Open Settings
                </Button>
              </div>
            </div>
          )
        ) : (
          // Web Version Instructions
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <p className="font-medium text-green-900">Open WhatsApp Web</p>
                    <p className="text-sm text-green-700">Click the button below to open WhatsApp Web</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <p className="font-medium text-blue-900">Start Listening</p>
                    <p className="text-sm text-blue-700">Click "Start Listening" in this app</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <p className="font-medium text-purple-900">Tap Messages</p>
                    <p className="text-sm text-purple-700">Tap any message in WhatsApp to hear it</p>
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
                Ready to Test
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>How it works:</strong></p>
          {isAndroidApp ? (
            <>
              <p>• Accessibility service detects taps on WhatsApp messages</p>
              <p>• Works in the background with WhatsApp and WhatsApp Business</p>
              <p>• Only accesses WhatsApp apps for message reading</p>
              <p>• No personal data is collected or stored</p>
            </>
          ) : (
            <>
              <p>• Web version works with WhatsApp Web in your browser</p>
              <p>• Simply tap any message to hear it read aloud</p>
              <p>• Works with both individual and group chats</p>
              <p>• No additional permissions required</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilitySetup;
