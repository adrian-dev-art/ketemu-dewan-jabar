import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/services/api';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderColor: color + '30' }]}>
      <View style={styles.statCardHeader}>
        <MaterialIcons name={icon} size={20} color={color} />
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const TABS = [
  { id: 'overview', label: 'Ringkasan', icon: 'dashboard' as const },
  { id: 'ratings', label: 'Ulasan', icon: 'star' as const },
  { id: 'users', label: 'Pengguna', icon: 'people' as const },
  { id: 'schedules', label: 'Jadwal', icon: 'event' as const },
  { id: 'profile', label: 'Profil', icon: 'person' as const },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'ratings' | 'users' | 'schedules' | 'profile'>('overview');
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, schedulesRes, ratingsRes] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAllSchedules(),
        adminApi.getAllRatings(),
      ]);
      setUsers(usersRes.data || []);
      setSchedules(schedulesRes.data || []);
      setRatings(ratingsRes.data || []);
    } catch (e) {
      console.error(e);
      Alert.alert('Gagal memuat data', 'Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar dari akun admin?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  const dewanCount = useMemo(() => users.filter((u) => u.role === 'dewan').length, [users]);
  const masyarakatCount = useMemo(() => users.filter((u) => u.role === 'masyarakat').length, [users]);
  const confirmedCount = useMemo(() => schedules.filter((s) =>
    s.participants?.some((p: any) => p.status === 'confirmed')
  ).length, [schedules]);

  const activeSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const mainStatus = s.participants?.[0]?.status || 'pending';
      return mainStatus === 'confirmed';
    });
  }, [schedules]);

  const listData = useMemo(() => {
    if (activeTab === 'overview' || activeTab === 'profile') return [];
    if (activeTab === 'ratings') return ratings;
    if (activeTab === 'users') return users;
    if (activeTab === 'schedules') return schedules;
    return [];
  }, [activeTab, ratings, users, schedules]);

  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === 'users') {
      return (
        <View style={styles.userRow}>
          <View style={[styles.userAvatar, { backgroundColor: item.role === 'dewan' ? Colors.primaryLight : Colors.successLight }]}>
            <Text style={styles.userAvatarText}>
              {item.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email || '—'}</Text>
          </View>
          <View style={[
            styles.roleBadge,
            item.role === 'dewan' ? styles.roleDewan :
            item.role === 'admin' ? styles.roleAdmin : styles.roleMasyarakat,
          ]}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
        </View>
      );
    }

    if (activeTab === 'ratings') {
      const avgScore = ((item.speakingScore + item.contextScore + item.timeScore + item.responsivenessScore + item.solutionScore) / 5).toFixed(1);
      return (
        <View style={styles.ratingCard}>
          <View style={styles.ratingHeader}>
            <View style={styles.ratingUser}>
              <Text style={styles.ratingMasyarakat}>{item.masyarakatName}</Text>
              <Text style={styles.ratingDewan}>untuk {item.dewanName}</Text>
            </View>
            <View style={styles.avgBadge}>
              <MaterialIcons name="star" size={14} color="#d97706" />
              <Text style={styles.avgText}>{avgScore}</Text>
            </View>
          </View>
          
          <Text style={styles.ratingTopic}>Pertemuan: {item.meetingTitle}</Text>
          
          {item.comment ? (
            <Text style={styles.ratingComment}>"{item.comment}"</Text>
          ) : (
            <Text style={styles.ratingCommentEmpty}>Tidak ada komentar tertulis.</Text>
          )}

          <View style={styles.aspectsGrid}>
            <Text style={styles.aspectText}>Artikulasi: {item.speakingScore}</Text>
            <Text style={styles.aspectText}>Relevansi: {item.contextScore}</Text>
            <Text style={styles.aspectText}>Waktu: {item.timeScore}</Text>
            <Text style={styles.aspectText}>Responsif: {item.responsivenessScore}</Text>
            <Text style={styles.aspectText}>Solusi: {item.solutionScore}</Text>
          </View>
        </View>
      );
    }

    if (activeTab === 'schedules') {
      const scheduleDate = new Date(item.startTime).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      const mainStatus = item.participants?.[0]?.status || 'pending';

      return (
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>{item.title || 'Diskusi Aspirasi'}</Text>
              <Text style={styles.scheduleTime}>{scheduleDate}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              mainStatus === 'completed' ? styles.statusCompleted :
              mainStatus === 'confirmed' ? styles.statusConfirmed :
              mainStatus === 'cancelled' ? styles.statusCancelled : styles.statusPending
            ]}>
              <Text style={[
                styles.statusText,
                mainStatus === 'completed' ? styles.statusTextCompleted :
                mainStatus === 'confirmed' ? styles.statusTextConfirmed :
                mainStatus === 'cancelled' ? styles.statusTextCancelled : styles.statusTextPending
              ]}>
                {mainStatus.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.schedulePeople}>
            <Text style={styles.peopleLabel}>Warga: <Text style={styles.peopleValue}>{item.masyarakat?.name || 'User Demo'}</Text></Text>
            <Text style={styles.peopleLabel}>Dewan: <Text style={styles.peopleValue}>
              {item.participants?.map((p: any) => p.dewan?.name).join(', ') || '—'}
            </Text></Text>
          </View>

          {mainStatus === 'completed' && (
            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() => setSelectedSchedule(item)}
            >
              <MaterialIcons name="analytics" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.detailsBtnText}>Lihat Rekaman & Laporan AI</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Panel Administrator</Text>
          <Text style={styles.name}>{activeTab === 'profile' ? 'Profil Admin' : user?.name}</Text>
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
        <View style={{ flex: 1 }}>
          <FlatList
            data={listData}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); fetchData(); }}
                tintColor={Colors.primary}
              />
            }
            ListHeaderComponent={
              <View style={{ marginBottom: Spacing.md }}>
                {activeTab === 'overview' && (
                  <View style={{ marginTop: Spacing.sm }}>
                    <Text style={styles.sectionTitle}>Ringkasan Sistem</Text>
                    <View style={styles.statsGrid}>
                      <StatCard label="Total Jadwal" value={schedules.length} color={Colors.primary} icon="event-note" />
                      <StatCard label="Anggota Dewan" value={dewanCount} color={Colors.success} icon="people" />
                      <StatCard label="Masyarakat" value={masyarakatCount} color={Colors.warning} icon="person" />
                      <StatCard label="Sesi Aktif" value={confirmedCount} color={Colors.primary} icon="live-tv" />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Sesi Diskusi Aktif Saat Ini</Text>
                    {activeSchedules.length === 0 ? (
                      <View style={styles.emptyCard}>
                        <Text style={styles.emptyCardText}>Tidak ada sesi diskusi aktif saat ini.</Text>
                      </View>
                    ) : (
                      activeSchedules.map((item) => (
                        <View key={item.id} style={styles.scheduleCard}>
                          <View style={styles.scheduleHeader}>
                            <View style={styles.scheduleInfo}>
                              <Text style={styles.scheduleTitle}>{item.title || 'Diskusi Aspirasi'}</Text>
                              <Text style={styles.scheduleTime}>
                                {new Date(item.startTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                              </Text>
                            </View>
                            <View style={[styles.statusBadge, styles.statusConfirmed]}>
                              <Text style={[styles.statusText, styles.statusTextConfirmed]}>AKTIF</Text>
                            </View>
                          </View>
                          <View style={styles.schedulePeople}>
                            <Text style={styles.peopleLabel}>Warga: <Text style={styles.peopleValue}>{item.masyarakat?.name || 'User Demo'}</Text></Text>
                            <Text style={styles.peopleLabel}>Dewan: <Text style={styles.peopleValue}>
                              {item.participants?.map((p: any) => p.dewan?.name).join(', ') || '—'}
                            </Text></Text>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                )}

                {activeTab === 'profile' && (
                  <View style={styles.profileContainer}>
                    <View style={styles.profileHeader}>
                      <View style={styles.profileAvatar}>
                        <Text style={styles.profileAvatarText}>
                          {user?.name?.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.profileName}>{user?.name}</Text>
                      <Text style={styles.profileRoleBadge}>SUPER ADMINISTRATOR</Text>
                    </View>

                    <View style={styles.profileDetailsCard}>
                      <View style={styles.detailRowItem}>
                        <MaterialIcons name="email" size={20} color={Colors.primary} style={{ marginRight: 12 }} />
                        <View style={styles.detailRowContent}>
                          <Text style={styles.detailItemLabel}>EMAIL</Text>
                          <Text style={styles.detailItemValue}>{user?.email || 'admin@dewan.id'}</Text>
                        </View>
                      </View>

                      <View style={[styles.detailRowItem, { borderBottomWidth: 0 }]}>
                        <MaterialIcons name="verified-user" size={20} color={Colors.success} style={{ marginRight: 12 }} />
                        <View style={styles.detailRowContent}>
                          <Text style={styles.detailItemLabel}>STATUS PERAN</Text>
                          <Text style={styles.detailItemValue}>Admin (Akses Penuh)</Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.logoutLargeBtn} onPress={handleLogout}>
                      <MaterialIcons name="exit-to-app" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.logoutLargeBtnText}>Keluar dari Akun</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {activeTab !== 'overview' && activeTab !== 'profile' && (
                  <Text style={styles.sectionTitle}>
                    {activeTab === 'ratings' ? `Semua Penilaian (${ratings.length})` :
                     activeTab === 'users' ? `Daftar Pengguna (${users.length})` :
                     `Daftar Jadwal (${schedules.length})`}
                  </Text>
                )}
              </View>
            }
            ListEmptyComponent={
              activeTab !== 'overview' && activeTab !== 'profile' ? (
                <Text style={styles.emptyText}>Tidak ada data yang ditemukan.</Text>
              ) : null
            }
            renderItem={renderItem}
          />
        </View>
      )}

      {/* Floating Bottom Tab Bar */}
      {!isLoading && (
        <View style={styles.bottomTabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.bottomTabButton}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <MaterialIcons 
                name={tab.icon} 
                size={22} 
                color={activeTab === tab.id ? Colors.primary : Colors.mutedForeground} 
                style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}
              />
              <Text style={[styles.bottomTabLabel, activeTab === tab.id && styles.bottomTabLabelActive]}>
                {tab.label}
              </Text>
              {activeTab === tab.id && <View style={styles.activeDot} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Details Modal */}
      <Modal
        visible={!!selectedSchedule}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedSchedule(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hasil Analisis AI</Text>
              <TouchableOpacity onPress={() => setSelectedSchedule(null)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>Tutup</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalSectionTitle}>Detail Pertemuan</Text>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Topik:</Text>
                <Text style={styles.detailValue}>{selectedSchedule?.title}</Text>
                
                <Text style={styles.detailLabel}>Warga:</Text>
                <Text style={styles.detailValue}>{selectedSchedule?.masyarakat?.name || 'User Demo'}</Text>
                
                <Text style={styles.detailLabel}>Anggota Dewan:</Text>
                <Text style={styles.detailValue}>
                  {selectedSchedule?.participants?.map((p: any) => p.dewan?.name).join(', ')}
                </Text>

                <Text style={styles.detailLabel}>File Rekaman Video:</Text>
                <Text style={styles.detailValueLink}>{selectedSchedule?.recordingUrl || 'Tidak ada rekaman'}</Text>
              </View>

              <Text style={styles.modalSectionTitle}>Transkrip Percakapan</Text>
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptText}>
                  {selectedSchedule?.transcription || 'Transkrip tidak tersedia.'}
                </Text>
              </View>

              {selectedSchedule?.analysis && (
                <View>
                  <Text style={styles.modalSectionTitle}>Analisis AI & Sentimen</Text>
                  <View style={styles.analysisBox}>
                    <Text style={styles.analysisLabel}>Sentimen Utama: <Text style={styles.analysisValue}>{selectedSchedule.analysis.sentiment || 'Positif'}</Text></Text>
                    
                    <Text style={[styles.analysisLabel, { marginTop: 10 }]}>Topik Utama:</Text>
                    <View style={styles.tagsContainer}>
                      {selectedSchedule.analysis.topics?.map((topic: string, i: number) => (
                        <View key={i} style={styles.topicTag}>
                          <Text style={styles.tagText}>{topic}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.metricsContainer}>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricVal}>{selectedSchedule.analysis.citizenSatisfaction || 0}</Text>
                        <Text style={styles.metricLbl}>Kepuasan</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricVal}>{selectedSchedule.analysis.dewanResponsiveness || 0}</Text>
                        <Text style={styles.metricLbl}>Daya Tanggap</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricVal}>{selectedSchedule.analysis.discussionQuality || 0}</Text>
                        <Text style={styles.metricLbl}>Diskusi</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricVal}>{selectedSchedule.analysis.problemSolving || 0}</Text>
                        <Text style={styles.metricLbl}>Solusi</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.md, paddingBottom: 100 },
  sectionTitle: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: Colors.primary,
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  userInfo: { flex: 1 },
  userName: { color: Colors.foreground, fontSize: FontSize.sm, fontWeight: '600' },
  userEmail: { color: Colors.mutedForeground, fontSize: FontSize.xs, marginTop: 2 },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  roleDewan: { backgroundColor: Colors.primaryLight },
  roleAdmin: { backgroundColor: Colors.dangerLight },
  roleMasyarakat: { backgroundColor: Colors.successLight },
  roleText: { color: Colors.foreground, fontSize: FontSize.xs, fontWeight: '600' },
  emptyText: { color: Colors.mutedForeground, textAlign: 'center', marginTop: Spacing.xl },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  emptyCardText: { color: Colors.mutedForeground, fontSize: FontSize.sm },
  
  // Rating styles
  ratingCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingUser: { flex: 1 },
  ratingMasyarakat: { color: Colors.foreground, fontSize: FontSize.sm, fontWeight: '700' },
  ratingDewan: { color: Colors.mutedForeground, fontSize: FontSize.xs },
  avgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    gap: 4,
  },
  avgText: { color: '#b45309', fontSize: FontSize.xs, fontWeight: '700' },
  ratingTopic: { color: Colors.foreground, fontSize: FontSize.xs, fontWeight: '600', marginTop: Spacing.xs },
  ratingComment: { color: Colors.mutedForeground, fontSize: FontSize.xs, fontStyle: 'italic', marginTop: Spacing.xs },
  ratingCommentEmpty: { color: Colors.mutedForeground, fontSize: FontSize.xs, fontStyle: 'italic', marginTop: Spacing.xs, opacity: 0.5 },
  aspectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
  },
  aspectText: { color: Colors.mutedForeground, fontSize: 10, fontWeight: '500' },

  // Schedule styles
  scheduleCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scheduleInfo: { flex: 1 },
  scheduleTitle: { color: Colors.foreground, fontSize: FontSize.sm, fontWeight: '700' },
  scheduleTime: { color: Colors.mutedForeground, fontSize: FontSize.xs, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusPending: { backgroundColor: '#fef3c7' },
  statusConfirmed: { backgroundColor: '#dbeafe' },
  statusCompleted: { backgroundColor: '#d1fae5' },
  statusCancelled: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 9, fontWeight: '800' },
  statusTextPending: { color: '#d97706' },
  statusTextConfirmed: { color: '#2563eb' },
  statusTextCompleted: { color: '#059669' },
  statusTextCancelled: { color: '#dc2626' },
  schedulePeople: {
    marginTop: Spacing.sm,
    gap: 2,
  },
  peopleLabel: { color: Colors.mutedForeground, fontSize: FontSize.xs, fontWeight: '600' },
  peopleValue: { color: Colors.foreground, fontWeight: 'normal' },
  detailsBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  detailsBtnText: { color: Colors.background, fontSize: FontSize.xs, fontWeight: '700' },

  // Bottom Tab Bar styles
  bottomTabBar: {
    flexDirection: 'row',
    height: 75,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Shadow.md,
  },
  bottomTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    paddingTop: 8,
  },
  bottomTabLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.mutedForeground,
    marginTop: 4,
  },
  bottomTabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 3,
  },

  // Profile styles
  profileContainer: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  profileName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.foreground,
  },
  profileRoleBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    marginTop: 6,
  },
  profileDetailsCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  detailRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailRowContent: {
    flex: 1,
  },
  detailItemLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.mutedForeground,
    letterSpacing: 0.5,
  },
  detailItemValue: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.foreground,
    marginTop: 2,
  },
  logoutLargeBtn: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    backgroundColor: '#ef4444',
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  logoutLargeBtnText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '90%',
    padding: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalTitle: { color: Colors.foreground, fontSize: FontSize.base, fontWeight: '700' },
  modalCloseBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.border,
  },
  modalCloseText: { color: Colors.foreground, fontSize: FontSize.xs, fontWeight: '600' },
  modalScroll: { paddingBottom: 40 },
  modalSectionTitle: {
    color: Colors.foreground,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  detailBox: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 4,
  },
  detailLabel: { color: Colors.mutedForeground, fontSize: FontSize.xs, fontWeight: '700' },
  detailValue: { color: Colors.foreground, fontSize: FontSize.sm, marginBottom: Spacing.xs },
  detailValueLink: { color: Colors.primary, fontSize: FontSize.xs, marginBottom: Spacing.xs },
  transcriptBox: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  transcriptText: { color: Colors.foreground, fontSize: FontSize.xs, lineHeight: 18 },
  analysisBox: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  analysisLabel: { color: Colors.mutedForeground, fontSize: FontSize.xs, fontWeight: '700' },
  analysisValue: { color: Colors.primary, fontWeight: '700' },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  topicTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  tagText: { color: Colors.primary, fontSize: 10, fontWeight: '700' },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  metricItem: { alignItems: 'center', flex: 1 },
  metricVal: { color: Colors.primary, fontSize: FontSize.base, fontWeight: '800' },
  metricLbl: { color: Colors.mutedForeground, fontSize: 9, fontWeight: '600', marginTop: 2, textAlign: 'center' },
});
