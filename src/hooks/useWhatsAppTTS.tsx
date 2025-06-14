
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
  const lastTappedElement = useRef<Element | null>(null);
  const speechSynthesis = window.speechSynthesis;

  // Check if running in Android WebView (Capacitor)
  const isAndroidApp = () => {
    return window.location.href.includes('capacitor://') || 
           (window as any).Capacitor !== undefined ||
           navigator.userAgent.includes('wv');
  };

  // Enhanced text extraction for WhatsApp messages
  const extractTextFromElement = (element: Element): string => {
    const clonedElement = element.cloneNode(true) as Element;
    
    // Remove WhatsApp UI elements that shouldn't be read
    const elementsToRemove = [
      '[data-icon]', 'svg', 'button', 'img',
      '.message-time', '.message-status', '.quoted-message',
      '._1pJ9J', '._3-8er ._1pJ9J', // WhatsApp Web time stamps
      '._3fnab', // Status indicators
      '._2f-RV', // Voice note duration
      '._3DFk6' // Message reactions
    ];
    
    elementsToRemove.forEach(selector => {
      const elements = clonedElement.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    let text = clonedElement.textContent?.trim() || '';
    
    // Clean up WhatsApp-specific artifacts
    text = text.replace(/\d{1,2}:\d{2}(\s?(AM|PM))?/g, ''); // Timestamps
    text = text.replace(/✓✓?/g, ''); // Read receipts
    text = text.replace(/\u00a0/g, ' '); // Non-breaking spaces
    text = text.replace(/\s+/g, ' ').trim(); // Multiple spaces
    
    return text;
  };

  const speakText = (text: string) => {
    if (!text || text.length < 3) return;
    
    console.log('Speaking text:', text);
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = voiceSpeed;
    utterance.pitch = voicePitch;
    utterance.volume = 1.0;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      console.log('Started speaking');
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      console.log('Finished speaking');
    };
    
    utterance.onerror = (event) => {
      setIsPlaying(false);
      console.error('Speech error:', event);
      toast.error('Failed to speak text');
    };
    
    speechSynthesis.speak(utterance);
  };

  // Enhanced message detection for any webpage (works globally)
  const findMessageText = (target: Element): string | null => {
    console.log('Analyzing clicked element:', target);
    
    // First check if the element itself has readable text
    const directText = target.textContent?.trim();
    if (directText && directText.length > 10) {
      console.log('Found direct text:', directText);
      return directText;
    }
    
    // Look for text in parent elements (traverse up the DOM)
    let currentElement = target;
    for (let i = 0; i < 5; i++) {
      const parent = currentElement.parentElement;
      if (!parent) break;
      
      const parentText = parent.textContent?.trim();
      if (parentText && parentText.length > 10 && parentText.length < 1000) {
        // Avoid very long text blocks that might be entire pages
        console.log('Found parent text:', parentText);
        return parentText;
      }
      
      currentElement = parent;
    }
    
    // Look for text in child elements
    const childElements = target.querySelectorAll('*');
    for (const child of childElements) {
      const childText = child.textContent?.trim();
      if (childText && childText.length > 10 && childText.length < 500) {
        console.log('Found child text:', childText);
        return childText;
      }
    }
    
    return null;
  };

  const handleElementTap = (event: Event) => {
    if (!isListening || !isWhitelisted) {
      console.log('Not listening or not whitelisted');
      return;
    }
    
    const target = event.target as Element;
    if (!target) return;
    
    console.log('Element tapped, analyzing...');
    console.log('Target element:', target.tagName, target.className);
    
    // Prevent handling the same element multiple times quickly
    if (target === lastTappedElement.current) {
      console.log('Same element tapped recently, ignoring');
      return;
    }
    
    lastTappedElement.current = target;
    
    // Find readable text from the tapped element
    const text = findMessageText(target);
    
    if (text && text.length > 3) {
      console.log('Found readable text, will speak:', text.substring(0, 100) + '...');
      
      // Clean the text before speaking
      const cleanText = extractTextFromElement(target);
      speakText(cleanText || text);
      
      // Visual feedback
      const htmlElement = target as HTMLElement;
      if (htmlElement.style) {
        const originalBg = htmlElement.style.backgroundColor;
        htmlElement.style.backgroundColor = '#e3f2fd';
        setTimeout(() => {
          htmlElement.style.backgroundColor = originalBg;
        }, 1000);
      }
      
      toast.success(`Speaking: ${text.substring(0, 50)}...`);
    } else {
      console.log('No readable text found in tapped element');
      toast.info('Tap on text content to hear it spoken aloud');
    }
    
    // Reset after a short delay to allow new taps
    setTimeout(() => {
      lastTappedElement.current = null;
    }, 1000);
  };

  // Check accessibility service status (for Android)
  const checkAccessibilityStatus = async () => {
    if (isAndroidApp() && (window as any).Capacitor) {
      try {
        const result = await (window as any).Capacitor.Plugins.VoiceAssist?.isAccessibilityEnabled() || false;
        setIsAccessibilityEnabled(result);
        console.log('Accessibility status:', result);
        return result;
      } catch (error) {
        console.log('Could not check accessibility status:', error);
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
        console.error('Failed to request accessibility permission:', error);
        toast.error('Failed to request accessibility permission');
        return false;
      }
    }
    
    // For web version, show instructions
    toast.info('Web version ready! Just tap on any text to hear it spoken!');
    return true;
  };

  useEffect(() => {
    if (!isListening || !isWhitelisted) {
      document.removeEventListener('click', handleElementTap, true);
      document.removeEventListener('touchend', handleElementTap, true);
      console.log('TTS listening stopped');
      return;
    }

    console.log('TTS listening started - tap any text to hear it spoken!');
    
    // Check accessibility status
    checkAccessibilityStatus();
    
    // Add event listeners with high priority to capture all clicks
    document.addEventListener('click', handleElementTap, { capture: true, passive: false });
    document.addEventListener('touchend', handleElementTap, { capture: true, passive: false });
    
    // Show instructions to user
    toast.success('Listening for taps! Click on any text to hear it spoken aloud.');
    
    return () => {
      document.removeEventListener('click', handleElementTap, true);
      document.removeEventListener('touchend', handleElementTap, true);
      speechSynthesis.cancel();
      console.log('TTS cleanup completed');
    };
  }, [isListening, isWhitelisted, selectedLanguage, voiceSpeed, voicePitch]);

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    console.log('Speech manually stopped');
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
