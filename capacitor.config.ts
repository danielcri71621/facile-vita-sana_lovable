import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.facilevitasana',
  appName: 'facile vita sana',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  }
};

export default config;
