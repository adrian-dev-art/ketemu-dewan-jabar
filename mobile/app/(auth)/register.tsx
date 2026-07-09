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
import { authApi } from '@/services/api';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    instansi: '',
    noKtp: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      Alert.alert('Perhatian', 'Nama, email, dan password harus diisi.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: 'masyarakat',
        instansi: form.instansi.trim() || undefined,
        noKtp: form.noKtp.trim() || undefined,
      });
      Alert.alert(
        'Registrasi Berhasil',
        'Akun Anda telah dibuat. Silakan masuk menggunakan kredensial Anda.',
        [{ text: 'Masuk', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registrasi gagal. Silakan coba kembali.';
      Alert.alert('Registrasi Gagal', msg);
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Buat Akun Masyarakat</Text>
          <Text style={styles.subtitle}>
            Daftarkan diri sebagai warga Jawa Barat untuk menyampaikan aspirasi kepada wakil rakyat.
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {[
            { label: 'Nama Lengkap', field: 'name', placeholder: 'Sesuai KTP', keyboard: 'default' },
            { label: 'Alamat Email', field: 'email', placeholder: 'contoh@email.com', keyboard: 'email-address' },
            { label: 'Password', field: 'password', placeholder: 'Minimal 8 karakter', keyboard: 'default', secure: true },
            { label: 'Instansi / Organisasi', field: 'instansi', placeholder: 'Opsional', keyboard: 'default' },
            { label: 'Nomor KTP', field: 'noKtp', placeholder: '16 digit (opsional)', keyboard: 'numeric' },
          ].map(({ label, field, placeholder, keyboard, secure }) => (
            <View key={field} style={styles.fieldGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={form[field as keyof typeof form]}
                onChangeText={(v) => handleChange(field as keyof typeof form, v)}
                placeholder={placeholder}
                placeholderTextColor={Colors.mutedForeground}
                keyboardType={keyboard as any}
                secureTextEntry={secure}
                autoCapitalize={field === 'email' ? 'none' : 'words'}
                autoCorrect={false}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={styles.buttonText}>Daftar Sekarang</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Sudah punya akun?{' '}
          <Text style={styles.footerAccent} onPress={() => router.replace('/(auth)/login')}>
            Masuk di sini
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing['2xl'],
  },
  header: { marginBottom: Spacing.xl },
  backButton: {
    marginBottom: Spacing.md,
  },
  backText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  title: {
    color: Colors.foreground,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.mutedForeground,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  fieldGroup: { marginBottom: Spacing.md },
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
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: Colors.black,
    fontSize: FontSize.base,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    color: Colors.mutedForeground,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  footerAccent: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
