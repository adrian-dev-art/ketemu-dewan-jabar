import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { authApi, setEnvironment } from '@/services/api';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [environment, setEnvState] = useState<'local' | 'production'>('production');

  const handleToggleEnv = (env: 'local' | 'production') => {
    setEnvState(env);
    setEnvironment(env);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Perhatian', 'Email dan password harus diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login(email.trim(), password);
      const { token, user } = response.data;
      await login(token, user);
    } catch (error: any) {
      console.error('🔥 Login Error Detail:', error);
      const msg = error.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
      if (Platform.OS === 'web') {
        window.alert('Login Gagal: ' + msg);
      } else {
        Alert.alert('Login Gagal', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>D</Text>
          </View>
          <Text style={styles.appName}>
            DPRD<Text style={styles.appNameAccent}>HUDANG</Text>
          </Text>
          <Text style={styles.appSubtitle}>Sekretariat DPRD Jawa Barat</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Masuk ke Akun</Text>
          <Text style={styles.cardSubtitle}>
            Gunakan kredensial yang telah diberikan oleh Sekretariat.
          </Text>

          {/* Environment Toggle */}
          <View style={styles.envToggleContainer}>
            <TouchableOpacity
              style={[styles.envToggleButton, environment === 'local' && styles.envToggleActive]}
              onPress={() => handleToggleEnv('local')}
            >
              <Text style={[styles.envToggleText, environment === 'local' && styles.envToggleTextActive]}>Local</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.envToggleButton, environment === 'production' && styles.envToggleActive]}
              onPress={() => handleToggleEnv('production')}
            >
              <Text style={[styles.envToggleText, environment === 'production' && styles.envToggleTextActive]}>Production</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Alamat Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="contoh@dprd.go.id"
              placeholderTextColor={Colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Masukkan password"
              placeholderTextColor={Colors.mutedForeground}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={styles.buttonText}>Masuk</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.registerLinkText}>
              Belum punya akun?{' '}
              <Text style={styles.registerLinkAccent}>Daftar di sini</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 16, alignItems: 'center' }}
            onPress={() => router.push('/test-camera')}
          >
            <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: FontSize.sm }}>
              🛠️ Test Kamera Mandiri
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Aplikasi Resmi Sekretariat DPRD Jawa Barat
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing['2xl'],
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 56,
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadow.primary,
  },
  logoText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  appName: {
    color: Colors.foreground,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  appNameAccent: {
    color: Colors.primary,
  },
  appSubtitle: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  cardTitle: {
    color: Colors.foreground,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardSubtitle: {
    color: Colors.mutedForeground,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.muted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    color: Colors.foreground,
    fontSize: FontSize.base,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadow.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.black,
    fontSize: FontSize.base,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  registerLink: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  registerLinkText: {
    color: Colors.mutedForeground,
    fontSize: FontSize.sm,
  },
  registerLinkAccent: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.xl,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  envToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.muted,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  envToggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  envToggleActive: {
    backgroundColor: Colors.primary,
    ...Shadow.sm,
  },
  envToggleText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.mutedForeground,
  },
  envToggleTextActive: {
    color: Colors.black,
  },
});
