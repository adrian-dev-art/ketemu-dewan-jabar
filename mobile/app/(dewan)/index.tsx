import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { router } from 'expo-router';
import { schedulesApi } from '@/services/api';
import ScheduleCard from '@/components/ScheduleCard';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

export default function DewanDashboard() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await schedulesApi.getMySchedules();
      setSchedules(res.data);
    } catch {
      showToast({ message: 'Gagal memuat jadwal. Periksa koneksi internet Anda.', type: 'error' });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleStatusUpdate = async (scheduleId: number, status: 'confirmed' | 'rejected') => {
    if (!user) return;
    try {
      await schedulesApi.updateStatus(scheduleId, user.id, status);
      showToast({ 
        message: `Jadwal telah ${status === 'confirmed' ? 'dikonfirmasi' : 'ditolak'}.`, 
        type: 'success' 
      });
      fetchSchedules();
    } catch {
      showToast({ message: 'Terjadi kesalahan saat memperbarui status.', type: 'error' });
    }
  };

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  const pendingSchedules = schedules.filter((s) =>
    s.participants?.some((p: any) => p.dewanId === user?.id && p.status === 'pending')
  );

  const confirmedSchedules = schedules.filter((s) =>
    s.participants?.some((p: any) => p.dewanId === user?.id && p.status === 'confirmed')
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Portal Anggota Dewan</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={[
            { key: 'pending', data: pendingSchedules, label: 'Menunggu Konfirmasi' },
            { key: 'confirmed', data: confirmedSchedules, label: 'Jadwal Terkonfirmasi' },
          ]}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchSchedules(); }}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item: section }) => (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.label}</Text>
                <View style={[
                  styles.badge,
                  section.key === 'pending' ? styles.badgePending : styles.badgeConfirmed,
                ]}>
                  <Text style={styles.badgeText}>{section.data.length}</Text>
                </View>
              </View>

              {section.data.length === 0 ? (
                <Text style={styles.emptyText}>Tidak ada jadwal.</Text>
              ) : (
                section.data.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    showActions={section.key === 'pending'}
                    onConfirm={() => handleStatusUpdate(schedule.id, 'confirmed')}
                    onReject={() => handleStatusUpdate(schedule.id, 'rejected')}
                    onJoin={section.key === 'confirmed' ? () => router.push(`/room/${schedule.id}`) : undefined}
                  />
                ))
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingTop: 60,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: { color: Colors.mutedForeground, fontSize: FontSize.sm },
  name: { color: Colors.foreground, fontSize: FontSize.lg, fontWeight: '700' },
  logoutBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: { color: Colors.mutedForeground, fontSize: FontSize.sm, fontWeight: '600' },
  list: { padding: Spacing.md },
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgePending: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  badgeConfirmed: { backgroundColor: Colors.successLight },
  badgeText: { color: Colors.foreground, fontSize: FontSize.xs, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Colors.mutedForeground, fontSize: FontSize.sm, marginTop: Spacing.sm },
});
