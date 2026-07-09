import { registerGlobals } from '@livekit/react-native';

// Daftarkan polyfill WebRTC global yang dibutuhkan LiveKit sebelum app dimuat
registerGlobals();

import 'expo-router/entry';
