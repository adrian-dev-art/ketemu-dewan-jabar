import { Platform } from 'react-native';

// Daftarkan polyfill WebRTC global yang dibutuhkan LiveKit sebelum app dimuat
if (Platform.OS !== 'web') {
  const { registerGlobals } = require('@livekit/react-native');
  registerGlobals();
}

import 'expo-router/entry';
