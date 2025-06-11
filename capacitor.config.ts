
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.devzea.texttalkflow',
  appName: 'TextTalkFlow', 
  webDir: 'dist',
  server: {
    url: 'https://693cc4a5-ed2a-4c64-8928-be66871319b7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};


export default config;
