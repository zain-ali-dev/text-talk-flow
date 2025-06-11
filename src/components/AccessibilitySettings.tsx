
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Smartphone, FileText, Settings2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AccessibilitySettingsProps {
  isWhatsAppMode: boolean;
  selectedLanguage: string;
}

const AccessibilitySettings = ({ isWhatsAppMode, selectedLanguage }: AccessibilitySettingsProps) => {
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(false);
  const [continuousReading, setContinuousReading] = useState(true);
  const [backgroundMode, setBackgroundMode] = useState(true);

  const handleInstallInstructions = () => {
    toast.info("To use with WhatsApp: Enable accessibility services in Android Settings > Accessibility > VoiceAssist");
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Settings2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Advanced Settings</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Reading Preferences</span>
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Auto-detect Language</label>
                  <p className="text-xs text-muted-foreground">Automatically detect text language</p>
                </div>
                <Switch
                  checked={autoDetectLanguage}
                  onCheckedChange={setAutoDetectLanguage}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Continuous Reading</label>
                  <p className="text-xs text-muted-foreground">Keep reading multiple messages</p>
                </div>
                <Switch
                  checked={continuousReading}
                  onCheckedChange={setContinuousReading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Background Mode</label>
                  <p className="text-xs text-muted-foreground">Work with other apps</p>
                </div>
                <Switch
                  checked={backgroundMode}
                  onCheckedChange={setBackgroundMode}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>Setup Guide</span>
            </h4>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <div>
                    <p className="font-medium">Enable Accessibility</p>
                    <p className="text-xs text-blue-700">Go to Settings &gt; Accessibility &gt; VoiceAssist</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <div>
                    <p className="font-medium">Grant Permissions</p>
                    <p className="text-xs text-green-700">Allow overlay and accessibility permissions</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <div>
                    <p className="font-medium">Start Using</p>
                    <p className="text-xs text-purple-700">Tap any text in supported apps</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleInstallInstructions}
                variant="outline" 
                className="w-full mt-3"
                size="sm"
              >
                View Setup Instructions
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Current Mode: {isWhatsAppMode ? 'WhatsApp' : 'Document Reading'}</h4>
              <p className="text-sm text-amber-700 mt-1">
                {isWhatsAppMode 
                  ? 'Only works within WhatsApp. Tap any message to hear it read aloud.'
                  : 'Works with PDF and Word documents. Tap any text to start reading.'
                }
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Language: {selectedLanguage} • Background: {backgroundMode ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilitySettings;
