import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.marco.explorer',
  appName: 'MARCO Explorer',
  webDir: 'dist',
  android: {
    // Mantener la pantalla encendida (ideal para tótem)
    allowMixedContent: true,
  },
  plugins: {
    CapacitorSQLite: {
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false,
      },
    },
  },
};

export default config;
