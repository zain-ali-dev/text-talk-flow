import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface WhitelistResponse {
  status: string;
  whitelist: string[];
}

export const useWhatsAppWhitelist = () => {
  const [currentNumber, setCurrentNumber] = useState<string>('');
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);

  // Fallback data for when API is not accessible
  const fallbackWhitelist = [
    "+923001234567",
    "+4915123456789", 
    "+12025550123",
    "+447911123456"
  ];

  const { data: whitelistData, isLoading, error } = useQuery({
    queryKey: ['whatsapp-whitelist'],
    queryFn: async (): Promise<WhitelistResponse> => {
      console.log('Fetching whitelist from API...');
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('https://devzea.com/api/whatsapp-numbers.json', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Whitelist fetched successfully:', data);
        return data;
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        // Return fallback data instead of throwing
        console.log('Using fallback whitelist data');
        return {
          status: 'fallback',
          whitelist: fallbackWhitelist
        };
      }
    },
    retry: 3,
    retryDelay: 2000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });

  const whitelist = whitelistData?.whitelist || fallbackWhitelist;

  const checkWhitelistStatus = (phoneNumber: string): boolean => {
    const cleanNumber = phoneNumber.trim();
    const isInWhitelist = whitelist.includes(cleanNumber);
    
    setCurrentNumber(cleanNumber);
    setIsWhitelisted(isInWhitelist);
    
    // Store verification status
    if (isInWhitelist) {
      localStorage.setItem('whatsapp_verification_status', 'true');
      localStorage.setItem('whatsapp_verified_number', cleanNumber);
    } else {
      localStorage.removeItem('whatsapp_verification_status');
      localStorage.removeItem('whatsapp_verified_number');
    }
    
    console.log(`Number ${cleanNumber} whitelist status:`, isInWhitelist);
    return isInWhitelist;
  };

  // Check stored verification on component mount
  useEffect(() => {
    const storedStatus = localStorage.getItem('whatsapp_verification_status');
    const storedNumber = localStorage.getItem('whatsapp_verified_number');
    
    if (storedStatus === 'true' && storedNumber) {
      setCurrentNumber(storedNumber);
      setIsWhitelisted(true);
    }
  }, []);

  return {
    whitelist,
    isWhitelisted,
    currentNumber,
    isLoading,
    error: error && whitelistData?.status !== 'fallback' ? error : null,
    checkWhitelistStatus,
  };
};
