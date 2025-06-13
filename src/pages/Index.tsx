import { useState, useEffect } from "react";
import { useWhatsAppWhitelist } from "@/hooks/useWhatsAppWhitelist";
import { useWhatsAppTTS } from "@/hooks/useWhatsAppTTS";
import PermissionsScreen from "@/components/PermissionsScreen";
import WhatsAppVerification from "@/components/WhatsAppVerification";
import TTSControls from "@/components/TTSControls";
import FloatingButton from "@/components/FloatingButton";
import AccessibilitySettings from "@/components/AccessibilitySettings";
import AccessibilitySetup from "@/components/AccessibilitySetup";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Volume2, Settings, MessageSquare, FileText } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [appStage, setAppStage] = useState<'permissions' | 'verification' | 'app'>('permissions');
  const [isWhatsAppMode, setIsWhatsAppMode] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [voiceSpeed, setVoiceSpeed] = useState([1]);
  const [voicePitch, setVoicePitch] = useState([1]);
  const [isListening, setIsListening] = useState(false);
  const { isWhitelisted } = useWhatsAppWhitelist();

  // Initialize WhatsApp TTS functionality
  const { 
    isPlaying, 
    isAccessibilityEnabled, 
    stopSpeaking, 
    speakText, 
    requestAccessibilityPermission,
    checkAccessibilityStatus 
  } = useWhatsAppTTS({
    isListening: isListening && isWhatsAppMode,
    selectedLanguage,
    voiceSpeed: voiceSpeed[0],
    voicePitch: voicePitch[0],
    isWhitelisted
  });

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
    console.log('App initializing...');
    
    // Check if user has already completed the flow
    const savedStage = localStorage.getItem('app_stage');
    const hasWhatsAppVerification = localStorage.getItem('whatsapp_verification_status') === 'true';
    
    console.log('Saved stage:', savedStage, 'Has verification:', hasWhatsAppVerification);
    
    if (savedStage === 'app' && hasWhatsAppVerification) {
      setAppStage('app');
    } else if (savedStage === 'verification') {
      setAppStage('verification');
    }

    // Check if Speech Synthesis is available
    if ('speechSynthesis' in window) {
      console.log('Text-to-Speech is available');
    } else {
      console.log('Text-to-Speech not supported in this browser');
      toast.error("Text-to-Speech not supported in this browser");
    }

    // Enable background mode with better error handling
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
          // Don't show error to user as it's not critical
        });
    } else {
      console.log('Service Worker not supported');
    }

    // Add error boundary for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.log('Unhandled promise rejection:', event.reason);
      event.preventDefault(); // Prevent the default browser behavior
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handlePermissionsGranted = () => {
    console.log('Permissions granted, moving to verification');
    setAppStage('verification');
    localStorage.setItem('app_stage', 'verification');
  };

  const handleVerificationComplete = (isVerified: boolean) => {
    console.log('Verification complete:', isVerified);
    if (isVerified) {
      setAppStage('app');
      localStorage.setItem('app_stage', 'app');
      toast.success('Welcome to VoiceAssist! App is now running in background.');
    }
  };

  const handleModeToggle = (checked: boolean) => {
    setIsWhatsAppMode(checked);
    setIsListening(false); // Stop listening when switching modes
    toast.success(checked ? "WhatsApp mode enabled" : "Document reading mode enabled");
  };

  const handleStartListening = () => {
    if (isWhatsAppMode && !isWhitelisted) {
      toast.error("Please verify your WhatsApp number first");
      return;
    }

    if (isWhatsAppMode && !isAccessibilityEnabled) {
      toast.error("Please enable accessibility service first");
      return;
    }

    setIsListening(true);
    if (isWhatsAppMode) {
      toast.success("Listening for WhatsApp messages... Tap any message to hear it!");
    } else {
      toast.success("Listening for document text...");
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
    stopSpeaking(); // Stop any ongoing speech
    toast.info("Stopped listening");
  };

  const handleTestSpeech = () => {
    const testMessage = isWhatsAppMode 
      ? "WhatsApp TTS is working! Tap any message in WhatsApp to hear it read aloud."
      : "Document reader is ready! Upload a document to get started.";
    speakText(testMessage);
  };

  if (appStage === 'permissions') {
    return <PermissionsScreen onPermissionsGranted={handlePermissionsGranted} />;
  }

  if (appStage === 'verification') {
    return (
      <WhatsAppVerification 
        onVerificationChange={handleVerificationComplete} 
        isFullScreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4">
      <div className="container max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-4 sm:pt-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VoiceAssist
            </h1>
          </div>
          <p className="text-sm sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Accessible text-to-speech reader for WhatsApp messages and documents
          </p>
        </div>

        {/* Mode Selection */}
        <Card className="border-2 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isWhatsAppMode ? (
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                ) : (
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                )}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">
                    {isWhatsAppMode ? "WhatsApp Mode" : "Document Mode"}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {isWhatsAppMode 
                      ? "Read WhatsApp messages aloud when tapped"
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

        {/* Accessibility Setup for WhatsApp Mode */}
        {isWhatsAppMode && (
          <AccessibilitySetup
            isAccessibilityEnabled={isAccessibilityEnabled}
            onRequestPermission={requestAccessibilityPermission}
            onCheckStatus={checkAccessibilityStatus}
          />
        )}

        {/* Main Controls */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <TTSControls
            isPlaying={isPlaying}
            isListening={isListening}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            voiceSpeed={voiceSpeed}
            voicePitch={voicePitch}
            onSpeedChange={setVoiceSpeed}
            onPitchChange={setVoicePitch}
            isDisabled={(isWhatsAppMode && !isWhitelisted) || (isWhatsAppMode && !isAccessibilityEnabled)}
            onTestSpeech={handleTestSpeech}
            onStopSpeech={stopSpeaking}
          />

          {/* Language Settings Card */}
          <Card className="border-2 shadow-lg">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold">Language Settings</h3>
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="h-10 sm:h-auto">
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
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-center space-x-3">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <p className="text-sm sm:text-lg font-medium text-center">
                {isListening 
                  ? isWhatsAppMode 
                    ? 'Ready! Tap any WhatsApp message to hear it'
                    : 'Listening for document text...'
                  : isWhatsAppMode && !isWhitelisted
                    ? 'Complete WhatsApp verification to start'
                    : isWhatsAppMode && !isAccessibilityEnabled
                      ? 'Enable accessibility service to start'
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
        isDisabled={(isWhatsAppMode && !isWhitelisted) || (isWhatsAppMode && !isAccessibilityEnabled)}
      />
    </div>
  );
};

export default Index;
