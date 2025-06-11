
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
      const response = await fetch('https://devzea.com/api/whatsapp-numbers.json');
      if (!response.ok) {
        throw new Error('Failed to fetch whitelist');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 3,
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
    
    return isListed;
  };

  return {
    whitelist: whitelistData?.whitelist || [],
    isWhitelisted,
    currentNumber,
    isLoading,
    error,
    checkWhitelistStatus,
  };
};
