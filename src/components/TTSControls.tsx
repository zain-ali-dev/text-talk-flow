
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, RotateCcw } from "lucide-react";

interface TTSControlsProps {
  isPlaying: boolean;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  voiceSpeed: number[];
  voicePitch: number[];
  onSpeedChange: (value: number[]) => void;
  onPitchChange: (value: number[]) => void;
}

const TTSControls = ({
  isPlaying,
  isListening,
  onStartListening,
  onStopListening,
}: TTSControlsProps) => {
  const handleTestSpeech = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Hello! VoiceAssist is ready to help you read text aloud.");
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Play className="w-5 h-5" />
          <span>Voice Controls</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={isListening ? onStopListening : onStartListening}
            className={`h-12 text-sm font-medium transition-all duration-200 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isListening ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>

          <Button
            onClick={handleTestSpeech}
            variant="outline"
            className="h-12 text-sm font-medium"
          >
            <Play className="w-4 h-4 mr-2" />
            Test Voice
          </Button>
        </div>

        <Button
          onClick={handleStopSpeech}
          variant="outline"
          className="w-full h-12 text-sm font-medium"
        >
          <Pause className="w-4 h-4 mr-2" />
          Stop Speech
        </Button>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Tap Start to begin listening for text to read aloud
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TTSControls;
