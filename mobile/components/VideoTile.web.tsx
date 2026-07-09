import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function VideoTileWeb() {
  return (
    <View style={styles.tile}>
      <Text style={styles.text}>VideoTile (Web Mock)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', margin: 5, borderRadius: 8 },
  text: { color: '#ccc', fontSize: 12 }
});
