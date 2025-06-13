
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

  // Enhanced message detection for WhatsApp
  const findWhatsAppMessage = (target: Element): Element | null => {
    // WhatsApp Web and Mobile app selectors
    const messageSelectors = [
      '[data-id*="message"]', // WhatsApp Web message containers
      '.message-in', '.message-out', // Generic message classes
      '._2wP_Y', // WhatsApp Web message bubble
      '.copyable-text', // Text containers
      '._22Msk', // New WhatsApp Web selector
      '[role="row"]', // Chat rows
      '.selectable-text', // Selectable text elements
      '._11JPr', // Message content
      '._3-8er' // Message wrapper
    ];
    
    // First try to find exact message container
    for (const selector of messageSelectors) {
      const messageElement = target.closest(selector);
      if (messageElement && messageElement.textContent && messageElement.textContent.trim().length > 5) {
        return messageElement;
      }
    }
    
    // If no specific container found, traverse up to find text content
    let currentElement = target;
    for (let i = 0; i < 8; i++) {
      if (currentElement.textContent && currentElement.textContent.trim().length > 10) {
        // Check if this looks like a message (has reasonable text content)
        const text = currentElement.textContent.trim();
        if (text.length > 5 && !text.match(/^[\d:]+$/)) { // Not just timestamps
          return currentElement;
        }
      }
      
      const parent = currentElement.parentElement;
      if (!parent) break;
      currentElement = parent;
    }
    
    return null;
  };

  const handleElementTap = (event: Event) => {
    if (!isListening || !isWhitelisted) return;
    
    const target = event.target as Element;
    if (!target) return;
    
    console.log('Element tapped:', target);
    
    const messageElement = findWhatsAppMessage(target);
    
    if (!messageElement || messageElement === lastTappedElement.current) {
      console.log('No new message element found or same element tapped');
      return;
    }
    
    lastTappedElement.current = messageElement;
    
    const text = extractTextFromElement(messageElement);
    
    if (text && text.length > 3) {
      console.log('Found WhatsApp message text:', text);
      speakText(text);
      
      // Visual feedback for successful detection
      if (isAndroidApp()) {
        messageElement.style.backgroundColor = '#e3f2fd';
        setTimeout(() => {
          messageElement.style.backgroundColor = '';
        }, 1000);
      }
    } else {
      console.log('No readable text found in tapped element, text length:', text?.length);
    }
  };

  // Check accessibility service status (for Android)
  const checkAccessibilityStatus = async () => {
    if (isAndroidApp() && (window as any).Capacitor) {
      try {
        // This would be implemented in the native Android code
        const result = await (window as any).Capacitor.Plugins.VoiceAssist?.isAccessibilityEnabled() || false;
        setIsAccessibilityEnabled(result);
        return result;
      } catch (error) {
        console.log('Could not check accessibility status:', error);
        return false;
      }
    }
    return true; // Assume enabled for web version
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
    return true;
  };

  useEffect(() => {
    if (!isListening || !isWhitelisted) {
      document.removeEventListener('click', handleElementTap, true);
      document.removeEventListener('touchend', handleElementTap, true);
      return;
    }

    console.log('WhatsApp TTS listening started...');
    
    // Check accessibility status
    checkAccessibilityStatus();
    
    // Add event listeners with high priority
    document.addEventListener('click', handleElementTap, { capture: true, passive: false });
    document.addEventListener('touchend', handleElementTap, { capture: true, passive: false });
    
    // For Android app, also listen to custom events from accessibility service
    if (isAndroidApp()) {
      const handleAccessibilityEvent = (event: CustomEvent) => {
        console.log('Accessibility event received:', event.detail);
        if (event.detail?.text) {
          speakText(event.detail.text);
        }
      };
      
      window.addEventListener('whatsapp-message-tapped', handleAccessibilityEvent as EventListener);
      
      return () => {
        document.removeEventListener('click', handleElementTap, true);
        document.removeEventListener('touchend', handleElementTap, true);
        window.removeEventListener('whatsapp-message-tapped', handleAccessibilityEvent as EventListener);
        speechSynthesis.cancel();
      };
    }
    
    return () => {
      document.removeEventListener('click', handleElementTap, true);
      document.removeEventListener('touchend', handleElementTap, true);
      speechSynthesis.cancel();
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
