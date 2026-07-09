import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';
import { VideoTrack } from '@livekit/react-native';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { router } from 'expo-router';

export default function TestCameraScreen() {
  const [track, setTrack] = useState<LocalVideoTrack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Kamera mati');

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        console.log('Permissions:', granted);
        return (
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
          PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startCamera = async () => {
    setIsLoading(true);
    setStatus('Meminta izin & mengaktifkan kamera...');
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setStatus('Izin kamera ditolak oleh sistem.');
        setIsLoading(false);
        return;
      }

      // Stop existing track if any
      if (track) {
        track.stop();
      }

      console.log('Creating local video track...');
      const localVideoTrack = await createLocalVideoTrack({
        facingMode: 'user',
      });
      console.log('Local video track created successfully:', localVideoTrack);
      
      setTrack(localVideoTrack);
      setStatus('Kamera AKTIF & Berjalan');
    } catch (err: any) {
      console.error('Gagal membuka kamera:', err);
      setStatus(`Gagal: ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (track) {
      track.stop();
      setTrack(null);
    }
    setStatus('Kamera dimatikan');
  };

  useEffect(() => {
    return () => {
      if (track) {
        track.stop();
      }
    };
  }, [track]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📷 Uji Coba Kamera Mandiri</Text>
      <Text style={styles.subtitle}>
        Mengisolasi pengetesan kamera WebRTC dari koneksi LiveKit Server.
      </Text>

      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>Status Hardware:</Text>
        <Text style={[styles.statusValue, track && styles.statusActive]}>
          {status}
        </Text>
      </View>

      <View style={styles.previewContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : track ? (
          <VideoTrack
            style={styles.previewVideo}
            trackRef={{
              participant: {} as any,
              publication: { track: track } as any,
              source: 'camera' as any,
            }}
            objectFit="cover"
            mirror={true}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Preview Video Mati</Text>
          </View>
        )}
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, styles.startBtn]}
          onPress={startCamera}
          disabled={isLoading}
        >
          <Text style={styles.btnText}>Nyalakan Kamera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.stopBtn]}
          onPress={stopCamera}
          disabled={!track}
        >
          <Text style={styles.btnText}>Matikan</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
      >
        <Text style={styles.backBtnText}>Kembali ke Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F12',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  title: {
    color: Colors.foreground,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  statusBox: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  statusLabel: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusValue: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: 4,
  },
  statusActive: {
    color: Colors.success,
  },
  previewContainer: {
    width: 280,
    height: 380,
    backgroundColor: '#07070a',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  previewVideo: {
    flex: 1,
    width: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.mutedForeground,
    fontSize: FontSize.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 320,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    backgroundColor: Colors.primary,
  },
  stopBtn: {
    backgroundColor: Colors.muted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnText: {
    color: Colors.black,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  backBtn: {
    marginTop: Spacing.xl,
    padding: 10,
  },
  backBtnText: {
    color: Colors.mutedForeground,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
