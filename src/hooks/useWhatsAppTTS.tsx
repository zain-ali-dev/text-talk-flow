
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseWhatsAppTTSProps {
  isListening: boolean;
  selectedLanguage: string;
  voiceSpeed: number;
  voicePitch: number;
  isWhitelisted: boolean;
}

export const useWhatsAppTTS = ({
  isListening,
  selectedLanguage,
  voiceSpeed,
  voicePitch,
  isWhitelisted
}: UseWhatsAppTTSProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(true);
  const lastClickTime = useRef<number>(0);
  const speechSynthesis = window.speechSynthesis;

  // Check if running in Android WebView (Capacitor)
  const isAndroidApp = () => {
    return window.location.href.includes('capacitor://') || 
           (window as any).Capacitor !== undefined ||
           navigator.userAgent.includes('wv');
  };

  // Simple and effective text extraction
  const extractMessageText = (element: Element): string => {
    // Get all text content and clean it up
    let text = element.textContent || element.innerText || '';
    
    // Remove common WhatsApp UI artifacts
    text = text.replace(/\d{1,2}:\d{2}(\s?(AM|PM))?/g, ''); // timestamps
    text = text.replace(/✓✓?/g, ''); // read receipts
    text = text.replace(/\s+/g, ' ').trim(); // multiple spaces
    
    return text;
  };

  const speakText = (text: string) => {
    if (!text || text.length < 2) return;
    
    console.log('🗣️ Speaking:', text);
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = voiceSpeed;
    utterance.pitch = voicePitch;
    utterance.volume = 1.0;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      console.log('🎵 Speech started');
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      console.log('🎵 Speech ended');
    };
    
    utterance.onerror = (event) => {
      setIsPlaying(false);
      console.error('❌ Speech error:', event);
    };
    
    speechSynthesis.speak(utterance);
    toast.success(`Speaking: ${text.substring(0, 30)}...`);
  };

  const handleClick = (event: MouseEvent | TouchEvent) => {
    if (!isListening || !isWhitelisted) return;
    
    // Prevent too frequent clicks
    const now = Date.now();
    if (now - lastClickTime.current < 500) return;
    lastClickTime.current = now;
    
    const target = event.target as Element;
    if (!target) return;
    
    console.log('👆 Element clicked:', target.tagName, target.className);
    
    // Look for text in the clicked element and its parents
    let currentElement: Element | null = target;
    let attempts = 0;
    
    while (currentElement && attempts < 8) {
      const text = extractMessageText(currentElement);
      
      if (text.length > 3 && text.length < 1000) {
        console.log('✅ Found text to speak:', text.substring(0, 50) + '...');
        
        // Visual feedback
        if (currentElement instanceof HTMLElement) {
          const originalBg = currentElement.style.backgroundColor;
          currentElement.style.backgroundColor = '#e3f2fd';
          currentElement.style.transition = 'background-color 0.3s';
          setTimeout(() => {
            currentElement.style.backgroundColor = originalBg;
          }, 1000);
        }
        
        speakText(text);
        return;
      }
      
      currentElement = currentElement.parentElement;
      attempts++;
    }
    
    // If no good text found in parents, try children
    const children = target.querySelectorAll('*');
    for (const child of children) {
      const text = extractMessageText(child);
      if (text.length > 3 && text.length < 500) {
        console.log('✅ Found text in child:', text.substring(0, 50) + '...');
        speakText(text);
        return;
      }
    }
    
    console.log('❌ No readable text found');
    toast.info('Tap on a message with text to hear it spoken');
  };

  // Check accessibility service status (for Android)
  const checkAccessibilityStatus = async () => {
    if (isAndroidApp() && (window as any).Capacitor) {
      try {
        const result = await (window as any).Capacitor.Plugins.VoiceAssist?.isAccessibilityEnabled() || false;
        setIsAccessibilityEnabled(result);
        console.log('📱 Accessibility status:', result);
        return result;
      } catch (error) {
        console.log('⚠️ Could not check accessibility status:', error);
        setIsAccessibilityEnabled(true);
        return true;
      }
    }
    // For web version, always return true
    setIsAccessibilityEnabled(true);
    return true;
  };

  // Setup accessibility service (for Android)
  const requestAccessibilityPermission = async () => {
    if (isAndroidApp() && (window as any).Capacitor) {
      try {
        await (window as any).Capacitor.Plugins.VoiceAssist?.requestAccessibilityPermission();
        toast.success('Please enable VoiceAssist in Accessibility Settings');
        return true;
      } catch (error) {
        console.error('❌ Failed to request accessibility permission:', error);
        toast.error('Failed to request accessibility permission');
        return false;
      }
    }
    
    // For web version, show instructions
    toast.success('Web version ready! Tap on any message text to hear it spoken!');
    return true;
  };

  useEffect(() => {
    if (!isListening || !isWhitelisted) {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchend', handleClick);
      console.log('🔇 TTS listening stopped');
      return;
    }

    console.log('🎧 TTS listening started - tap any text to hear it!');
    
    // Check accessibility status
    checkAccessibilityStatus();
    
    // Add event listeners - use simpler approach without capture
    document.addEventListener('click', handleClick, false);
    document.addEventListener('touchend', handleClick, false);
    
    // Show success message
    toast.success('🎯 Ready! Tap on any WhatsApp message to hear it spoken');
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchend', handleClick);
      speechSynthesis.cancel();
      console.log('🧹 TTS cleanup completed');
    };
  }, [isListening, isWhitelisted, selectedLanguage, voiceSpeed, voicePitch]);

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    console.log('⏹️ Speech manually stopped');
  };

  return {
    isPlaying,
    isAccessibilityEnabled,
    stopSpeaking,
    speakText,
    requestAccessibilityPermission,
    checkAccessibilityStatus
  };
};
