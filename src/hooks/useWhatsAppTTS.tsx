
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
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);
  const lastClickTime = useRef<number>(0);
  const speechSynthesis = window.speechSynthesis;

  // Check if running in Android WebView (Capacitor)
  const isAndroidApp = () => {
    return window.location.href.includes('capacitor://') || 
           (window as any).Capacitor !== undefined ||
           navigator.userAgent.includes('wv') ||
           navigator.userAgent.includes('Android');
  };

  // Enhanced text extraction for WhatsApp messages
  const extractMessageText = (element: Element): string => {
    // Cast to HTMLElement for access to innerText
    const htmlElement = element as HTMLElement;
    let text = htmlElement.innerText || htmlElement.textContent || '';
    
    // Clean up WhatsApp UI artifacts
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
    
    const target = event.target as HTMLElement;
    if (!target) return;
    
    console.log('👆 Element clicked:', target.tagName, target.className);
    
    // Look for WhatsApp message containers and text
    let currentElement: HTMLElement | null = target;
    let attempts = 0;
    
    while (currentElement && attempts < 10) {
      // Check for WhatsApp message selectors
      const isWhatsAppMessage = currentElement.querySelector('[data-pre-plain-text]') ||
                               currentElement.querySelector('span[dir="ltr"]') ||
                               currentElement.querySelector('div[data-tab]') ||
                               currentElement.classList.contains('copyable-text') ||
                               currentElement.getAttribute('data-testid')?.includes('conversation');
      
      const text = extractMessageText(currentElement);
      
      if (text.length > 3 && text.length < 1000) {
        console.log('✅ Found text to speak:', text.substring(0, 50) + '...');
        
        // Visual feedback
        const originalBg = currentElement.style.backgroundColor;
        currentElement.style.backgroundColor = '#e3f2fd';
        currentElement.style.transition = 'background-color 0.3s';
        setTimeout(() => {
          currentElement!.style.backgroundColor = originalBg;
        }, 1000);
        
        speakText(text);
        return;
      }
      
      currentElement = currentElement.parentElement;
      attempts++;
    }
    
    // Also try finding text in children
    const children = target.querySelectorAll('span, div, p') as NodeListOf<HTMLElement>;
    for (const child of children) {
      const text = extractMessageText(child);
      if (text.length > 3 && text.length < 500) {
        console.log('✅ Found text in child:', text.substring(0, 50) + '...');
        speakText(text);
        return;
      }
    }
    
    console.log('❌ No readable text found');
    toast.info('Tap on a WhatsApp message with text to hear it spoken');
  };

  // Enhanced accessibility service status check for Android
  const checkAccessibilityStatus = async () => {
    if (isAndroidApp()) {
      try {
        // Try to check if Capacitor accessibility plugin is available
        if ((window as any).Capacitor?.Plugins?.VoiceAssist) {
          const result = await (window as any).Capacitor.Plugins.VoiceAssist.isAccessibilityEnabled();
          setIsAccessibilityEnabled(result.enabled || false);
          console.log('📱 Accessibility status:', result);
          return result.enabled || false;
        } else {
          // Fallback: assume enabled if we can't check
          console.log('⚠️ Accessibility plugin not available, assuming enabled');
          setIsAccessibilityEnabled(true);
          return true;
        }
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

  // Request accessibility permission for Android
  const requestAccessibilityPermission = async () => {
    if (isAndroidApp()) {
      try {
        if ((window as any).Capacitor?.Plugins?.VoiceAssist) {
          await (window as any).Capacitor.Plugins.VoiceAssist.requestAccessibilityPermission();
          toast.success('Opening Android Settings - Please enable VoiceAssist in Accessibility');
          
          // Also request overlay permission for better functionality
          if ((window as any).Capacitor?.Plugins?.VoiceAssist.requestOverlayPermission) {
            await (window as any).Capacitor.Plugins.VoiceAssist.requestOverlayPermission();
          }
          
          return true;
        } else {
          toast.error('Accessibility plugin not available. Please install the Android app version.');
          return false;
        }
      } catch (error) {
        console.error('❌ Failed to request accessibility permission:', error);
        toast.error('Failed to open accessibility settings. Please go to Settings > Accessibility manually.');
        return false;
      }
    }
    
    // For web version
    toast.success('Web version ready! Open WhatsApp Web and tap on any message to hear it spoken!');
    return true;
  };

  useEffect(() => {
    if (!isListening || !isWhitelisted) {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('touchend', handleClick, true);
      console.log('🔇 TTS listening stopped');
      return;
    }

    console.log('🎧 TTS listening started - tap any WhatsApp message to hear it!');
    
    // Check accessibility status on start
    checkAccessibilityStatus();
    
    // Add event listeners with capture to catch events early
    document.addEventListener('click', handleClick, true);
    document.addEventListener('touchend', handleClick, true);
    
    // Show appropriate success message
    if (isAndroidApp()) {
      toast.success('🎯 Android App Ready! Open WhatsApp and tap any message');
    } else {
      toast.success('🎯 Ready! Go to WhatsApp Web and tap any message to hear it');
    }
    
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('touchend', handleClick, true);
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
