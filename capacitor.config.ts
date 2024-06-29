import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.albertec.opkas',
  appName: 'opkas',
  webDir: 'dist',
  plugins: {
    "SplashScreen": {
      "launchShowDuration": 0
    },
    "Filesystem": {
      "androidScoped": true
    }
  },
};

export default config;
