
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface TTSOptions {
  text: string;
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState('speechSynthesis' in window);

  const speak = useCallback(async (options: TTSOptions) => {
    try {
      if (!isSupported) {
        toast.error('Text-to-Speech not supported');
        return;
      }

      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(options.text);
      
      // Set voice properties
      utterance.lang = options.language || 'en-US';
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('Speech started');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('Speech ended');
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        console.error('Speech error:', event.error);
        toast.error(`Speech error: ${event.error}`);
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('TTS Error:', error);
      toast.error('Failed to start text-to-speech');
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported
  };
};
