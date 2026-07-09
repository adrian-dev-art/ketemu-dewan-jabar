import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestCameraWeb() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📸 Fitur Kamera WebRTC dinonaktifkan di Web Preview.</Text>
      <Text style={styles.subtext}>Silakan gunakan perangkat Android atau iOS untuk mengetes fitur ini.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  text: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtext: { fontSize: 14, color: '#666', textAlign: 'center' }
});
