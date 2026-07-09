import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RoomWeb() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📹 Fitur Video Conference WebRTC dinonaktifkan di Web Preview.</Text>
      <Text style={styles.subtext}>Silakan gunakan perangkat Android atau iOS untuk bergabung ke ruangan.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111', padding: 20 },
  text: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#fff' },
  subtext: { fontSize: 14, color: '#aaa', textAlign: 'center' }
});
