
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.facilevitasana',
  appName: 'facile-vita-sana',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://34756234-96f3-41d3-8f04-2f06aeaa2f38.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
