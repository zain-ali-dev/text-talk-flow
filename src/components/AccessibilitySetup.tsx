
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Settings, Smartphone, CheckCircle, AlertCircle } from "lucide-react";
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

  const handleOpenSettings = () => {
    toast.info("Opening Android Settings...");
    // This would open Android settings in a real app
    if ((window as any).Capacitor) {
      (window as any).Capacitor.Plugins.App?.openUrl({
        url: 'android.settings.ACCESSIBILITY_SETTINGS'
      });
    }
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Accessibility Service Setup</h3>
        </div>

        <Alert className={isAccessibilityEnabled ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
          <div className="flex items-center space-x-2">
            {isAccessibilityEnabled ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
            <AlertDescription className={isAccessibilityEnabled ? "text-green-800" : "text-amber-800"}>
              {isAccessibilityEnabled 
                ? "✅ Accessibility service is enabled! WhatsApp messages will be read aloud when tapped."
                : "⚠️ Accessibility service is required for WhatsApp integration. Please enable it in Android Settings."
              }
            </AlertDescription>
          </div>
        </Alert>

        {!isAccessibilityEnabled && (
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
                onClick={handleOpenSettings}
                variant="outline"
                className="h-12"
              >
                <Settings className="w-4 h-4 mr-2" />
                Open Settings
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Why accessibility service?</strong></p>
          <p>• Required to detect taps on WhatsApp messages</p>
          <p>• Allows the app to work in the background</p>
          <p>• Only accesses WhatsApp and WhatsApp Business</p>
          <p>• No personal data is collected or stored</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilitySetup;
