
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.693cc4a5ed2a4c648928be66871319b7',
  appName: 'VoiceAssist',
  webDir: 'dist',
  server: {
    url: 'https://693cc4a5-ed2a-4c64-8928-be66871319b7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    TextToSpeech: {
      language: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: 'ambient'
    }
  }
};

export default config;
