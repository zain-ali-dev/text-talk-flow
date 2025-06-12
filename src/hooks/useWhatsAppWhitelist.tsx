
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface WhitelistResponse {
  status: string;
  whitelist: string[];
}

export const useWhatsAppWhitelist = () => {
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<string | null>(null);

  const { data: whitelistData, isLoading, error } = useQuery({
    queryKey: ['whatsapp-whitelist'],
    queryFn: async (): Promise<WhitelistResponse> => {
      console.log('Fetching whitelist from API...');
      
      try {
        const response = await fetch('https://devzea.com/api/whatsapp-numbers.json', {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error('Response not OK:', response.status, response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Whitelist data received:', data);
        return data;
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        // Fallback for development/testing
        return {
          status: 'success',
          whitelist: ['+923001234567', '+4915123456789', '+12025550123', '+447911123456']
        };
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 3,
    retryDelay: 1000,
  });

  const checkWhitelistStatus = (phoneNumber: string) => {
    console.log('Checking whitelist status for:', phoneNumber);
    
    if (!whitelistData?.whitelist) {
      console.log('Whitelist not loaded yet');
      return false;
    }

    const normalizedNumber = phoneNumber.replace(/\s+/g, '').trim();
    const isListed = whitelistData.whitelist.includes(normalizedNumber);
    
    console.log('Whitelist check result:', isListed);
    console.log('Available whitelist:', whitelistData.whitelist);
    
    setCurrentNumber(normalizedNumber);
    setIsWhitelisted(isListed);
    
    // Store verification status in localStorage
    if (isListed) {
      localStorage.setItem('whatsapp_verified_number', normalizedNumber);
      localStorage.setItem('whatsapp_verification_status', 'true');
    }
    
    return isListed;
  };

  // Check if user was previously verified
  useEffect(() => {
    const savedNumber = localStorage.getItem('whatsapp_verified_number');
    const savedStatus = localStorage.getItem('whatsapp_verification_status');
    
    if (savedNumber && savedStatus === 'true' && whitelistData?.whitelist) {
      const isStillWhitelisted = whitelistData.whitelist.includes(savedNumber);
      if (isStillWhitelisted) {
        setCurrentNumber(savedNumber);
        setIsWhitelisted(true);
      } else {
        // Remove from storage if no longer whitelisted
        localStorage.removeItem('whatsapp_verified_number');
        localStorage.removeItem('whatsapp_verification_status');
      }
    }
  }, [whitelistData]);

  return {
    whitelist: whitelistData?.whitelist || [],
    isWhitelisted,
    currentNumber,
    isLoading,
    error,
    checkWhitelistStatus,
  };
};
