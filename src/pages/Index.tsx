import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Volume2, Settings, MessageSquare, FileText, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import TTSControls from "@/components/TTSControls";
import FloatingButton from "@/components/FloatingButton";
import AccessibilitySettings from "@/components/AccessibilitySettings";
import WhatsAppVerification from "@/components/WhatsAppVerification";

const Index = () => {
  const [isWhatsAppMode, setIsWhatsAppMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [voiceSpeed, setVoiceSpeed] = useState([1]);
  const [voicePitch, setVoicePitch] = useState([1]);
  const [isListening, setIsListening] = useState(false);
  const [isWhatsAppVerified, setIsWhatsAppVerified] = useState(false);

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "it-IT", name: "Italian" },
    { code: "pt-PT", name: "Portuguese" },
    { code: "zh-CN", name: "Chinese" },
    { code: "ja-JP", name: "Japanese" },
    { code: "ko-KR", name: "Korean" }
  ];

  useEffect(() => {
    // Check if Speech Synthesis is available
    if ('speechSynthesis' in window) {
      console.log('Text-to-Speech is available');
    } else {
      toast.error("Text-to-Speech not supported in this browser");
    }
  }, []);

  const handleModeToggle = (checked: boolean) => {
    setIsWhatsAppMode(checked);
    toast.success(checked ? "WhatsApp mode enabled" : "Document reading mode enabled");
    
    // Reset verification status when switching modes
    if (checked) {
      setIsWhatsAppVerified(false);
    }
  };

  const handleStartListening = () => {
    // Check WhatsApp verification for WhatsApp mode
    if (isWhatsAppMode && !isWhatsAppVerified) {
      toast.error("Please verify your WhatsApp number first");
      return;
    }

    setIsListening(true);
    toast.success(isWhatsAppMode ? "Listening for WhatsApp messages..." : "Listening for document text...");
  };

  const handleStopListening = () => {
    setIsListening(false);
    setIsPlaying(false);
    toast.info("Stopped listening");
  };

  const handleVerificationChange = (isVerified: boolean) => {
    setIsWhatsAppVerified(isVerified);
    console.log('WhatsApp verification status changed:', isVerified);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="container max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Volume2 className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VoiceAssist
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Accessible text-to-speech reader for WhatsApp messages and documents
          </p>
        </div>

        {/* Mode Selection */}
        <Card className="border-2 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isWhatsAppMode ? (
                  <MessageSquare className="w-6 h-6 text-green-600" />
                ) : (
                  <FileText className="w-6 h-6 text-blue-600" />
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {isWhatsAppMode ? "WhatsApp Mode" : "Document Mode"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isWhatsAppMode 
                      ? "Read WhatsApp messages aloud when tapped (requires verification)"
                      : "Read PDF and Word documents aloud"
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={isWhatsAppMode}
                onCheckedChange={handleModeToggle}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Verification - Only show in WhatsApp mode */}
        {isWhatsAppMode && (
          <WhatsAppVerification onVerificationChange={handleVerificationChange} />
        )}

        {/* Main Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          <TTSControls
            isPlaying={isPlaying}
            isListening={isListening}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            voiceSpeed={voiceSpeed}
            voicePitch={voicePitch}
            onSpeedChange={setVoiceSpeed}
            onPitchChange={setVoicePitch}
            isDisabled={isWhatsAppMode && !isWhatsAppVerified}
          />

          <Card className="border-2 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Language Settings</h3>
                <Settings className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Voice Speed: {voiceSpeed[0]}x
                  </label>
                  <Slider
                    value={voiceSpeed}
                    onValueChange={setVoiceSpeed}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Voice Pitch: {voicePitch[0]}x
                  </label>
                  <Slider
                    value={voicePitch}
                    onValueChange={setVoicePitch}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accessibility Settings */}
        <AccessibilitySettings 
          isWhatsAppMode={isWhatsAppMode}
          selectedLanguage={selectedLanguage}
        />

        {/* Status Indicator */}
        <Card className={`border-2 shadow-lg transition-all duration-300 ${
          isListening ? 'border-green-500 bg-green-50' : 'border-gray-200'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <p className="text-lg font-medium">
                {isListening 
                  ? `Listening for ${isWhatsAppMode ? 'WhatsApp messages' : 'document text'}...`
                  : isWhatsAppMode && !isWhatsAppVerified
                    ? 'Please verify WhatsApp number to start'
                    : 'Ready to start'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <FloatingButton 
        isListening={isListening}
        onToggle={isListening ? handleStopListening : handleStartListening}
        isDisabled={isWhatsAppMode && !isWhatsAppVerified}
      />
    </div>
  );
};

export default Index;
