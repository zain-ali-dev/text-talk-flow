
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
  const lastTappedElement = useRef<Element | null>(null);
  const speechSynthesis = window.speechSynthesis;

  const extractTextFromElement = (element: Element): string => {
    // Remove timestamps, status indicators, and other UI elements
    const clonedElement = element.cloneNode(true) as Element;
    
    // Remove common WhatsApp UI elements
    const elementsToRemove = [
      '.message-time',
      '.message-status',
      '.quoted-message',
      '[data-icon]',
      '.emoji-panel',
      'button',
      'svg'
    ];
    
    elementsToRemove.forEach(selector => {
      const elements = clonedElement.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    // Get clean text content
    let text = clonedElement.textContent?.trim() || '';
    
    // Clean up common WhatsApp artifacts
    text = text.replace(/\d{1,2}:\d{2}(\s?(AM|PM))?/g, ''); // Remove timestamps
    text = text.replace(/✓✓?/g, ''); // Remove checkmarks
    text = text.replace(/\s+/g, ' ').trim(); // Clean up whitespace
    
    return text;
  };

  const speakText = (text: string) => {
    if (!text || text.length < 2) return;
    
    console.log('Speaking text:', text);
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = voiceSpeed;
    utterance.pitch = voicePitch;
    
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
    toast.success('Reading message...');
  };

  const handleElementTap = (event: Event) => {
    if (!isListening || !isWhitelisted) return;
    
    const target = event.target as Element;
    if (!target) return;
    
    // Find the message container - look for common WhatsApp message selectors
    const messageSelectors = [
      '[data-id]', // WhatsApp message containers
      '.message-in',
      '.message-out',
      '._3-8er', // WhatsApp Web message bubble
      '._2cuy2', // Another WhatsApp selector
      '.copyable-text',
      '[role="row"]',
      '.selectable-text'
    ];
    
    let messageElement: Element | null = null;
    
    // Try to find the message container
    for (const selector of messageSelectors) {
      messageElement = target.closest(selector);
      if (messageElement) break;
    }
    
    // If no specific container found, try to find text content in parent elements
    if (!messageElement) {
      let currentElement = target;
      for (let i = 0; i < 5; i++) { // Check up to 5 parent levels
        if (currentElement.textContent && currentElement.textContent.trim().length > 10) {
          messageElement = currentElement;
          break;
        }
        currentElement = currentElement.parentElement as Element;
        if (!currentElement) break;
      }
    }
    
    if (!messageElement || messageElement === lastTappedElement.current) return;
    
    lastTappedElement.current = messageElement;
    
    const text = extractTextFromElement(messageElement);
    
    if (text && text.length > 2) {
      console.log('Found WhatsApp message:', text);
      speakText(text);
    } else {
      console.log('No readable text found in tapped element');
    }
  };

  useEffect(() => {
    if (!isListening || !isWhitelisted) {
      // Remove listeners when not listening
      document.removeEventListener('click', handleElementTap, true);
      document.removeEventListener('touchend', handleElementTap, true);
      return;
    }

    console.log('WhatsApp TTS listening started...');
    
    // Add event listeners for both click and touch events
    document.addEventListener('click', handleElementTap, true);
    document.addEventListener('touchend', handleElementTap, true);
    
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
    stopSpeaking,
    speakText
  };
};
