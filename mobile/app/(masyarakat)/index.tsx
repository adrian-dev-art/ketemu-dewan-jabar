import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { usersApi, schedulesApi, ratingsApi } from '@/services/api';
import DewanCard from '@/components/DewanCard';
import ScheduleCard from '@/components/ScheduleCard';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';

type GroupBy = 'none' | 'komisi' | 'dapil';

interface DewanUser {
  id: number;
  name: string;
  fraksi?: string;
  jabatan?: string;
  dapil?: string;
  komisi?: string;
  bio?: string;
  rating: number;
  availabilities?: { id: number; startTime: string; endTime: string; dewanId: number }[];
}

interface Schedule {
  id: number;
  title: string;
  startTime: string;
  status: string;
  recordingUrl?: string;
  transcription?: string;
  analysis?: any;
  participants: { dewanId: number; status: string; dewan: { id: number; name: string; fraksi?: string } }[];
}

const CITIZEN_TABS = [
  { id: 'home', label: 'Aspirasi', icon: 'chat' as const },
  { id: 'schedules', label: 'Jadwal', icon: 'event' as const },
  { id: 'profile', label: 'Profil', icon: 'person' as const },
];



export default function MasyarakatDashboard() {
  const { user, logout, token } = useAuth();
  const searchParams = useLocalSearchParams<{ ratedMeetingId?: string; dewanId?: string }>();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'schedules' | 'profile'>('home');

  // Data states
  const [dewanList, setDewanList] = useState<DewanUser[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [selectedDewans, setSelectedDewans] = useState<number[]>([]);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(''); // YYYY-MM-DD
  const [meetingTime, setMeetingTime] = useState(''); // HH:MM
  const [groupBy, setGroupBy] = useState<GroupBy>('komisi');
  const [showCustomTime, setShowCustomTime] = useState(false);

  // Selected schedule for detail modal
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Calendar state
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  // Time wheel state
  const HOURS_DATA = useMemo(() => Array.from({ length: 15 }, (_, i) => String(i + 7).padStart(2, '0')), []); // 07-21
  const MINUTES_DATA = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')), []); // 00, 05, 10... 55
  const [selHour, setSelHour] = useState('09');
  const [selMinute, setSelMinute] = useState('00');

  // Rating Modal states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratedMeetingId, setRatedMeetingId] = useState<string | null>(null);
  const [ratingDewanId, setRatingDewanId] = useState<string | null>(null);
  const [ratingScores, setRatingScores] = useState({
    speaking_score: 0,
    context_score: 0,
    time_score: 0,
    responsiveness_score: 0,
    solution_score: 0,
  });
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Sync search parameters to Rating Modal state
  useEffect(() => {
    if (searchParams?.ratedMeetingId && searchParams?.dewanId) {
      setRatedMeetingId(searchParams.ratedMeetingId);
      setRatingDewanId(searchParams.dewanId);
      setShowRatingModal(true);
      setRatingScores({
        speaking_score: 0,
        context_score: 0,
        time_score: 0,
        responsiveness_score: 0,
        solution_score: 0,
      });
      setRatingComment('');
    }
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const dewanRes = await usersApi.getDewan();
      setDewanList(dewanRes.data || []);

      const schedulesRes = await schedulesApi.getMySchedules();
      setSchedules(schedulesRes.data || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal memuat data', 'Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  // Extract available slots from currently selected Dewan(s)
  const availableSlots = useMemo(() => {
    if (selectedDewans.length === 0) return [];
    const slots: any[] = [];
    selectedDewans.forEach(dewanId => {
      const dewan = dewanList.find(d => d.id === dewanId);
      if (dewan && dewan.availabilities) {
        slots.push(...dewan.availabilities);
      }
    });
    return slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [selectedDewans, dewanList]);

  // Handle slot selection to auto-fill form inputs
  const selectSlot = (slot: any) => {
    const d = new Date(slot.startTime);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    setMeetingDate(`${year}-${month}-${date}`);
    setMeetingTime(`${hours}:${minutes}`);
  };

  // Grouping dewan logic matching web app
  const groupedDewan = useMemo(() => {
    if (groupBy === 'none') return { 'Semua Anggota': dewanList };

    const grouped = dewanList.reduce((acc, dewan) => {
      const key = dewan[groupBy] || 'Lainnya';
      if (!acc[key]) acc[key] = [];
      acc[key].push(dewan);
      return acc;
    }, {} as Record<string, DewanUser[]>);

    const sortedKeys = Object.keys(grouped).sort();
    const sortedGrouped: Record<string, DewanUser[]> = {};
    sortedKeys.forEach((key) => {
      sortedGrouped[key] = grouped[key];
    });

    return sortedGrouped;
  }, [dewanList, groupBy]);

  const toggleDewanSelection = (id: number) => {
    setSelectedDewans((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  // Create meeting request
  const handleScheduleSubmit = async () => {
    if (selectedDewans.length === 0) {
      Alert.alert('Peringatan', 'Mohon pilih setidaknya satu Anggota Dewan.');
      return;
    }
    if (!meetingTitle.trim()) {
      Alert.alert('Peringatan', 'Mohon isi judul / topik pertemuan.');
      return;
    }
    if (!meetingDate || !meetingTime) {
      Alert.alert('Peringatan', 'Mohon isi tanggal dan waktu pertemuan.');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(meetingDate)) {
      Alert.alert('Format Salah', 'Gunakan format tanggal YYYY-MM-DD (Cth: 2026-07-04).');
      return;
    }

    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(meetingTime)) {
      Alert.alert('Format Salah', 'Gunakan format waktu HH:MM (Cth: 14:30).');
      return;
    }

    try {
      const isoDateTimeString = `${meetingDate}T${meetingTime}:00`;
      const parsedDate = new Date(isoDateTimeString);
      if (isNaN(parsedDate.getTime())) {
        Alert.alert('Gagal', 'Tanggal atau waktu tidak valid.');
        return;
      }

      setIsLoading(true);
      const res = await schedulesApi.create({
        dewan_ids: selectedDewans,
        start_time: parsedDate.toISOString(),
        title: meetingTitle,
      });

      if (res.status === 201) {
        Alert.alert('Berhasil', 'Permohonan pertemuan berhasil dikirim. Menunggu konfirmasi dari dewan.');
        setMeetingTitle('');
        setMeetingDate('');
        setMeetingTime('');
        setSelectedDewans([]);
        setShowCustomTime(false);
        fetchData();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Terjadi kesalahan.';
      Alert.alert('Gagal membuat jadwal', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Schedule filtering matching web app
  const activeSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const mainStatus = s.participants?.[0]?.status || 'pending';
      if (mainStatus !== 'confirmed') return false;
      const startTime = new Date(s.startTime).getTime();
      const now = new Date().getTime();
      const buffer = 30 * 60 * 1000;
      return now >= startTime && now <= startTime + buffer;
    });
  }, [schedules]);

  const incomingSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const mainStatus = s.participants?.[0]?.status || 'pending';
      if (mainStatus !== 'confirmed') return false;
      const startTime = new Date(s.startTime).getTime();
      const now = new Date().getTime();
      return startTime > now;
    });
  }, [schedules]);

  const otherSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const mainStatus = s.participants?.[0]?.status || 'pending';
      return (
        mainStatus !== 'confirmed' ||
        new Date(s.startTime).getTime() + 30 * 60 * 1000 < new Date().getTime()
      );
    });
  }, [schedules]);

  // Aspect rating submission
  const handleRatingSubmit = async () => {
    const isFormValid = Object.values(ratingScores).every((v) => v > 0);
    if (!isFormValid) {
      Alert.alert('Belum Lengkap', 'Mohon isi semua aspek penilaian bintang.');
      return;
    }
    if (!ratedMeetingId || !ratingDewanId) return;

    setIsSubmittingRating(true);
    try {
      await ratingsApi.submit({
        scheduleId: Number(ratedMeetingId),
        dewanId: Number(ratingDewanId),
        speakingScore: ratingScores.speaking_score,
        contextScore: ratingScores.context_score,
        timeScore: ratingScores.time_score,
        responsivenessScore: ratingScores.responsiveness_score,
        solutionScore: ratingScores.solution_score,
        comment: ratingComment,
      });

      Alert.alert('Terima Kasih', 'Penilaian Anda telah berhasil dikirimkan.', [
        {
          text: 'OK',
          onPress: () => {
            setShowRatingModal(false);
            router.setParams({ ratedMeetingId: undefined, dewanId: undefined });
            fetchData();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Gagal', 'Gagal mengirimkan penilaian.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const renderRatingStarRow = (aspectKey: keyof typeof ratingScores, label: string, desc: string, iconName: string) => {
    const value = ratingScores[aspectKey];
    return (
      <View style={styles.ratingAspectCard}>
        <View style={styles.ratingAspectHeader}>
          <MaterialIcons name={iconName as any} size={18} color={Colors.primary} style={{ marginRight: Spacing.xs }} />
          <Text style={styles.ratingAspectLabel}>{label}</Text>
        </View>
        <Text style={styles.ratingAspectDesc}>{desc}</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRatingScores((prev) => ({ ...prev, [aspectKey]: star }))}
              style={styles.starTouch}
            >
              <MaterialIcons
                name={value >= star ? "star" : "star-border"}
                size={28}
                color={value >= star ? "#F59E0B" : Colors.mutedForeground}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderMetricBar = (label: string, score: number, color: string) => {
    return (
      <View style={styles.chartBarContainer}>
        <View style={styles.chartBarHeader}>
          <Text style={styles.chartBarLabel}>{label}</Text>
          <Text style={[styles.chartBarValue, { color }]}>{score} / 5</Text>
        </View>
        <View style={styles.chartBarTrack}>
          <View style={[styles.chartBarFill, { width: `${(score / 5) * 100}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  };

  // ── Calendar helpers ──────────────────────────────────────────
  const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const WEEKDAYS = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = (() => { const d = new Date(calendarYear, calendarMonth, 1).getDay(); return d === 0 ? 6 : d - 1; })();
  const calendarDays: (number | null)[] = [
    ...Array(firstDayIndex).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const changeMonth = (dir: 'prev' | 'next') => {
    if (dir === 'prev') {
      if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
      else setCalendarMonth(m => m - 1);
    } else {
      if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
      else setCalendarMonth(m => m + 1);
    }
  };

  const selectDay = (day: number) => {
    const m = String(calendarMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    setMeetingDate(`${calendarYear}-${m}-${d}`);
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerUserInfo}>
          <View style={styles.avatarHeader}>
            <MaterialIcons name="person" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.greeting}>Layanan Aspirasi Publik</Text>
            <Text style={styles.name}>{activeTab === 'profile' ? 'Profil Saya' : user?.name}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat Portal Aspirasi...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        >
          {/* TAB 1: ASPIRASI / HOME */}
          {activeTab === 'home' && (
            <View style={{ gap: Spacing.lg }}>
              {/* Sesi Aktif */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <MaterialIcons name="live-tv" size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Sesi Aktif</Text>
                </View>
                <Text style={styles.sectionSubtitle}>Konferensi video yang sedang berjalan sekarang</Text>
                {activeSchedules.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyCardText}>Belum ada konferensi aktif saat ini.</Text>
                  </View>
                ) : (
                  activeSchedules.map((item) => (
                    <ScheduleCard
                      key={item.id}
                      schedule={item}
                      onJoin={() => router.push(`/room/${item.id}`)}
                    />
                  ))
                )}
              </View>

              {/* Form Schedule Baru */}
              <View style={styles.formCard}>
                <View style={styles.sectionHeaderRow}>
                  <MaterialIcons name="event-note" size={22} color={Colors.primary} />
                  <Text style={styles.formTitle}>Buat Permohonan Jadwal Baru</Text>
                </View>
                <Text style={styles.formSubtitle}>Pilih perwakilan rakyat di bawah dan jadwalkan rapat</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Judul / Topik Pertemuan (Cth: Diskusi Jalan Rusak)"
                  placeholderTextColor={Colors.mutedForeground}
                  value={meetingTitle}
                  onChangeText={setMeetingTitle}
                />

                {/* Availability Slots selector if dewan selected */}
                {selectedDewans.length > 0 && (
                  <View style={styles.slotsContainer}>
                    <Text style={styles.slotsTitle}>Pilih Ketersediaan Waktu Dewan:</Text>
                    {availableSlots.length === 0 ? (
                      <Text style={styles.noSlotsText}>
                        Dewan terpilih belum menentukan jadwal ketersediaan. Silakan isi waktu kustom Anda.
                      </Text>
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotsScroll}>
                        {availableSlots.map((slot) => {
                          const slotDate = new Date(slot.startTime);
                          const formattedDate = slotDate.toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          });
                          const formattedTime = slotDate.toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });

                          const parsedSlotDate = `${slotDate.getFullYear()}-${String(slotDate.getMonth() + 1).padStart(2, '0')}-${String(slotDate.getDate()).padStart(2, '0')}`;
                          const parsedSlotTime = `${String(slotDate.getHours()).padStart(2, '0')}:${String(slotDate.getMinutes()).padStart(2, '0')}`;
                          const isSlotActive = meetingDate === parsedSlotDate && meetingTime === parsedSlotTime;

                          return (
                            <TouchableOpacity
                              key={slot.id}
                              style={[styles.slotPill, isSlotActive && styles.slotPillActive]}
                              onPress={() => selectSlot(slot)}
                            >
                              <Text style={[styles.slotPillText, isSlotActive && styles.slotPillTextActive]}>
                                {formattedDate} - {formattedTime}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>
                )}

                {/* Custom Time Selector option toggler */}
                <TouchableOpacity 
                  style={styles.customTimeToggle} 
                  onPress={() => setShowCustomTime(prev => !prev)}
                >
                  <MaterialIcons name={showCustomTime ? "check-box" : "check-box-outline-blank"} size={18} color={Colors.primary} />
                  <Text style={styles.customTimeToggleText}>Atur Tanggal & Waktu Kustom</Text>
                </TouchableOpacity>

                {/* Date & Time fields visible only if custom selected or no slots available */}
                {(showCustomTime || availableSlots.length === 0) && (
                  <View style={styles.formRow}>
                    <TouchableOpacity 
                      style={styles.pickerField} 
                      onPress={() => setShowDatePicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.inputLabel}>TANGGAL PERTEMUAN</Text>
                      <View style={styles.pickerFieldContent}>
                        <MaterialIcons name="calendar-today" size={16} color={Colors.primary} />
                        <Text style={[styles.pickerFieldText, !meetingDate && styles.pickerFieldPlaceholder]}>
                          {meetingDate ? new Date(meetingDate).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'Pilih Tanggal'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.pickerField} 
                      onPress={() => setShowTimePicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.inputLabel}>JAM PERTEMUAN</Text>
                      <View style={styles.pickerFieldContent}>
                        <MaterialIcons name="access-time" size={16} color={Colors.primary} />
                        <Text style={[styles.pickerFieldText, !meetingTime && styles.pickerFieldPlaceholder]}>
                          {meetingTime ? meetingTime : 'Pilih Jam'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Auto filled info indicator */}
                {!showCustomTime && meetingDate && meetingTime && (
                  <View style={styles.timeIndicatorCard}>
                    <MaterialIcons name="access-time" size={16} color={Colors.success} />
                    <Text style={styles.timeIndicatorText}>
                      Waktu terpilih: <Text style={{ fontWeight: '700' }}>{meetingDate} pkl {meetingTime}</Text>
                    </Text>
                  </View>
                )}

                <View style={styles.selectionInfo}>
                  <Text style={styles.selectionInfoText}>
                    Mengundang: <Text style={{ color: Colors.primary, fontWeight: '700' }}>{selectedDewans.length}</Text> Anggota Dewan
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.submitFormBtn,
                      (selectedDewans.length === 0 || !meetingTitle.trim() || !meetingDate || !meetingTime) && styles.submitFormBtnDisabled
                    ]}
                    onPress={handleScheduleSubmit}
                    disabled={selectedDewans.length === 0 || !meetingTitle.trim() || !meetingDate || !meetingTime}
                  >
                    <Text style={styles.submitFormBtnText}>Kirim Permohonan</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Grouping Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Grup Legislator:</Text>
                <View style={styles.filterTabs}>
                  {(['komisi', 'dapil', 'none'] as GroupBy[]).map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.filterTab, groupBy === tab && styles.filterTabActive]}
                      onPress={() => setGroupBy(tab)}
                    >
                      <Text style={[styles.filterTabText, groupBy === tab && styles.filterTabTextActive]}>
                        {tab === 'komisi' ? 'Komisi' : tab === 'dapil' ? 'Dapil' : 'Semua'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Dewan List */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <MaterialIcons name="people" size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Anggota Dewan Jabar</Text>
                </View>
                <Text style={styles.sectionSubtitle}>Pilih satu atau beberapa dewan untuk diundang</Text>

                {Object.entries(groupedDewan).map(([groupName, groupList]) => (
                  <View key={groupName} style={styles.groupContainer}>
                    {groupBy !== 'none' && (
                      <View style={styles.groupHeaderRow}>
                        <Text style={styles.groupBadge}>{groupName}</Text>
                        <View style={styles.groupLine} />
                      </View>
                    )}
                    {groupList.map((dewan) => (
                      <DewanCard
                        key={dewan.id}
                        dewan={dewan}
                        isSelected={selectedDewans.includes(dewan.id)}
                        onPress={() => toggleDewanSelection(dewan.id)}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 2: JADWAL (MENDATANG & RIWAYAT) */}
          {activeTab === 'schedules' && (
            <View style={{ gap: Spacing.lg }}>
              {/* Jadwal Mendatang */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <MaterialIcons name="upcoming" size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Jadwal Mendatang</Text>
                </View>
                <Text style={styles.sectionSubtitle}>Pertemuan terkonfirmasi yang akan segera berlangsung</Text>
                {incomingSchedules.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyCardText}>Belum ada jadwal mendatang.</Text>
                  </View>
                ) : (
                  incomingSchedules.map((item) => (
                    <ScheduleCard 
                      key={item.id} 
                      schedule={item} 
                      onJoin={() => router.push(`/room/${item.id}`)}
                    />
                  ))
                )}
              </View>

              {/* Riwayat & Status */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <MaterialIcons name="history" size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Riwayat & Status</Text>
                </View>
                <Text style={styles.sectionSubtitle}>Pantau status pertemuan dewan sebelumnya</Text>
                {otherSchedules.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyCardText}>Riwayat pertemuan kosong.</Text>
                  </View>
                ) : (
                  otherSchedules.map((item) => {
                    const mainStatus = item.participants?.[0]?.status || 'pending';
                    return (
                      <View key={item.id} style={styles.historyCardContainer}>
                        <ScheduleCard schedule={item} />
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
                  })
                )}
              </View>
            </View>
          )}

          {/* TAB 3: PROFIL SAYA */}
          {activeTab === 'profile' && (
            <View style={styles.profileContainer}>
              <View style={styles.profileHeader}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileRoleBadge}>MASYARAKAT JAWA BARAT</Text>
              </View>

              <View style={styles.profileDetailsCard}>
                <View style={styles.detailRowItem}>
                  <MaterialIcons name="email" size={20} color={Colors.primary} style={{ marginRight: 12 }} />
                  <View style={styles.detailRowContent}>
                    <Text style={styles.detailItemLabel}>EMAIL PORTAL</Text>
                    <Text style={styles.detailItemValue}>{user?.email || 'masyarakat@dewan.id'}</Text>
                  </View>
                </View>

                <View style={[styles.detailRowItem, { borderBottomWidth: 0 }]}>
                  <MaterialIcons name="verified-user" size={20} color={Colors.success} style={{ marginRight: 12 }} />
                  <View style={styles.detailRowContent}>
                    <Text style={styles.detailItemLabel}>STATUS KEASETAN</Text>
                    <Text style={styles.detailItemValue}>Warga (Hak Aspirasi Publik)</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.logoutLargeBtn} onPress={handleLogout}>
                <MaterialIcons name="exit-to-app" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.logoutLargeBtnText}>Keluar dari Akun</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating Bottom Tab Bar */}
      {!isLoading && (
        <View style={styles.bottomTabBar}>
          {CITIZEN_TABS.map((tab) => (
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

      {/* ── Date Picker Modal (Grid Calendar) ── */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.pickerOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Pilih Tanggal Pertemuan</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.sheetCloseBtn}>
                <MaterialIcons name="close" size={20} color={Colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Calendar Controls */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.calendarNavBtn}>
                <MaterialIcons name="chevron-left" size={22} color={Colors.foreground} />
              </TouchableOpacity>
              <Text style={styles.calendarMonthYear}>
                {MONTHS[calendarMonth]} {calendarYear}
              </Text>
              <TouchableOpacity onPress={() => changeMonth('next')} style={styles.calendarNavBtn}>
                <MaterialIcons name="chevron-right" size={22} color={Colors.foreground} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
              {WEEKDAYS.map(w => <Text key={w} style={styles.weekDayHeader}>{w}</Text>)}
            </View>

            <View style={styles.daysGrid}>
              {calendarDays.map((day, idx) => {
                const dateStr = day ? `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                const isSelected = meetingDate === dateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                return (
                  <View key={idx} style={styles.dayCell}>
                    {day ? (
                      <TouchableOpacity
                        style={[
                          styles.dayButton, 
                          isSelected && styles.dayButtonSelected,
                          isToday && !isSelected && styles.dayButtonToday
                        ]}
                        onPress={() => selectDay(day)}
                      >
                        <Text style={[
                          styles.dayText, 
                          isSelected && styles.dayTextSelected,
                          isToday && !isSelected && styles.dayTextToday
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ) : <Text style={styles.dayTextEmpty}> </Text>}
                  </View>
                );
              })}
            </View>

            <View style={styles.dialogFooter}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.dialogCancelBtn}>
                <Text style={styles.dialogCancelBtnText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Time Picker Modal (Digital Scroll Wheel) ── */}
      <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.pickerOverlay}>
          <View style={styles.timePickerCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Pilih Waktu Pertemuan</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)} style={styles.sheetCloseBtn}>
                <MaterialIcons name="close" size={20} color={Colors.foreground} />
              </TouchableOpacity>
            </View>

            <View style={styles.wheelContainerOuter}>
              <View style={styles.wheelWrapper}>
                {/* Highlight Bar overlay in center */}
                <View style={styles.selectionHighlight} />
                
                {/* Hour Column */}
                <View style={styles.wheelColumn}>
                  <Text style={styles.wheelColumnLabel}>JAM</Text>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    snapToInterval={44}
                    decelerationRate="fast"
                    contentContainerStyle={styles.wheelScrollContent}
                    onMomentumScrollEnd={(e) => {
                      const y = e.nativeEvent.contentOffset.y;
                      const idx = Math.round(y / 44);
                      if (idx >= 0 && idx < HOURS_DATA.length) {
                        setSelHour(HOURS_DATA[idx]);
                      }
                    }}
                  >
                    <View style={styles.wheelPlaceholder} />
                    {HOURS_DATA.map(h => {
                      const isActive = selHour === h;
                      return (
                        <TouchableOpacity 
                          key={h} 
                          style={styles.wheelItem} 
                          onPress={() => setSelHour(h)}
                        >
                          <Text style={[styles.wheelItemText, isActive && styles.wheelItemTextActive]}>{h}</Text>
                        </TouchableOpacity>
                      );
                    })}
                    <View style={styles.wheelPlaceholder} />
                  </ScrollView>
                </View>

                {/* Colon Separator */}
                <Text style={styles.wheelSeparator}>:</Text>

                {/* Minute Column */}
                <View style={styles.wheelColumn}>
                  <Text style={styles.wheelColumnLabel}>MENIT</Text>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    snapToInterval={44}
                    decelerationRate="fast"
                    contentContainerStyle={styles.wheelScrollContent}
                    onMomentumScrollEnd={(e) => {
                      const y = e.nativeEvent.contentOffset.y;
                      const idx = Math.round(y / 44);
                      if (idx >= 0 && idx < MINUTES_DATA.length) {
                        setSelMinute(MINUTES_DATA[idx]);
                      }
                    }}
                  >
                    <View style={styles.wheelPlaceholder} />
                    {MINUTES_DATA.map(m => {
                      const isActive = selMinute === m;
                      return (
                        <TouchableOpacity 
                          key={m} 
                          style={styles.wheelItem} 
                          onPress={() => setSelMinute(m)}
                        >
                          <Text style={[styles.wheelItemText, isActive && styles.wheelItemTextActive]}>{m}</Text>
                        </TouchableOpacity>
                      );
                    })}
                    <View style={styles.wheelPlaceholder} />
                  </ScrollView>
                </View>

                <Text style={styles.wheelTimezone}>WIB</Text>

                {/* Gradient Faders */}
                <View style={styles.wheelFaderTop} pointerEvents="none" />
                <View style={styles.wheelFaderBottom} pointerEvents="none" />
              </View>
            </View>

            <View style={styles.timePreviewBox}>
              <Text style={styles.timePreviewValue}>{selHour}:{selMinute} WIB</Text>
            </View>

            <View style={styles.dialogFooterRow}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)} style={[styles.dialogCancelBtn, { flex: 1, alignItems: 'center' }]}>
                <Text style={styles.dialogCancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setMeetingTime(`${selHour}:${selMinute}`);
                  setShowTimePicker(false);
                }} 
                style={styles.dialogConfirmBtn}
              >
                <Text style={styles.dialogConfirmBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* Schedule Laporan Details Modal (with visual charts) */}
      <Modal
        visible={!!selectedSchedule}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedSchedule(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Laporan AI & Transkrip</Text>
              <TouchableOpacity onPress={() => setSelectedSchedule(null)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>Tutup</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalSectionTitle}>Detail Diskusi</Text>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Topik Rapat:</Text>
                <Text style={styles.detailValue}>{selectedSchedule?.title}</Text>
                
                <Text style={styles.detailLabel}>Anggota Dewan:</Text>
                <Text style={styles.detailValue}>
                  {selectedSchedule?.participants?.map((p: any) => p.dewan?.name).join(', ') || '—'}
                </Text>

                <Text style={styles.detailLabel}>Link Rekaman Video:</Text>
                <Text style={styles.detailValueLink}>{selectedSchedule?.recordingUrl || 'Rekaman tidak tersedia'}</Text>
              </View>

              <Text style={styles.modalSectionTitle}>Transkrip Pembicaraan</Text>
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptText}>
                  {selectedSchedule?.transcription || 'Transkrip belum diproses.'}
                </Text>
              </View>

              {selectedSchedule?.analysis && (
                <View>
                  <Text style={styles.modalSectionTitle}>Analitik Kinerja AI</Text>
                  <View style={styles.analysisBox}>
                    <Text style={styles.analysisLabel}>Sentimen Rapat: <Text style={styles.analysisValue}>{selectedSchedule.analysis.sentiment || 'Netral'}</Text></Text>
                    
                    <Text style={[styles.analysisLabel, { marginTop: 10, marginBottom: 8 }]}>Hasil Nilai Aspek (Visual Chart):</Text>
                    
                    {renderMetricBar('Kepuasan Masyarakat', selectedSchedule.analysis.citizenSatisfaction || 0, Colors.primary)}
                    {renderMetricBar('Daya Tanggap Dewan', selectedSchedule.analysis.dewanResponsiveness || 0, Colors.success)}
                    {renderMetricBar('Kualitas Keterbukaan Diskusi', selectedSchedule.analysis.discussionQuality || 0, '#3b82f6')}
                    {renderMetricBar('Orientasi Pemecahan Masalah', selectedSchedule.analysis.problemSolving || 0, Colors.warning)}
                    
                    <Text style={[styles.analysisLabel, { marginTop: 14 }]}>Topik Utama Percakapan:</Text>
                    <View style={styles.tagsContainer}>
                      {selectedSchedule.analysis.topics?.map((topic: string, i: number) => (
                        <View key={i} style={styles.topicTag}>
                          <Text style={styles.tagText}>{topic}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Aspect Rating Modal overlay */}
      <Modal visible={showRatingModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Penilaian Sesi Pertemuan</Text>
                <Text style={styles.modalSubtitle}>Masukan Anda meningkatkan kinerja Legislator</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowRatingModal(false);
                  router.setParams({ ratedMeetingId: undefined, dewanId: undefined });
                }}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {renderRatingStarRow(
                'speaking_score',
                'Artikulasi & Penyampaian',
                'Kejelasan penyampaian pendapat dan kemudahan dipahami.',
                'mic'
              )}
              {renderRatingStarRow(
                'context_score',
                'Relevansi Topik',
                'Fokus pembicaraan dan relevansi terhadap aspirasi daerah.',
                'track-changes'
              )}
              {renderRatingStarRow(
                'time_score',
                'Efisiensi Waktu',
                'Ketepatan waktu dan efisiensi durasi video call.',
                'access-time'
              )}
              {renderRatingStarRow(
                'responsiveness_score',
                'Daya Tanggap & Empati',
                'Tingkat empati serta ketanggapan atas masalah Anda.',
                'record-voice-over'
              )}
              {renderRatingStarRow(
                'solution_score',
                'Orientasi Solusi',
                'Kejelasan rencana tindak lanjut atau tawaran solusi.',
                'lightbulb-outline'
              )}

              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackLabel}>Masukan Tambahan (Opsional)</Text>
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Ketik ulasan atau masukan singkat..."
                  placeholderTextColor={Colors.mutedForeground}
                  value={ratingComment}
                  onChangeText={setRatingComment}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitRatingBtn,
                  !Object.values(ratingScores).every((v) => v > 0) && styles.submitRatingBtnDisabled
                ]}
                onPress={handleRatingSubmit}
                disabled={isSubmittingRating || !Object.values(ratingScores).every((v) => v > 0)}
              >
                {isSubmittingRating ? (
                  <ActivityIndicator color={Colors.black} />
                ) : (
                  <Text style={styles.submitRatingBtnText}>Kirim Penilaian</Text>
                )}
              </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarHeader: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  greeting: {
    color: Colors.mutedForeground,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: '700',
    marginTop: 1,
  },
  logoutBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: {
    color: Colors.mutedForeground,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.mutedForeground,
    fontSize: FontSize.sm,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: 110 },

  // Sections
  section: { gap: 10 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    marginTop: -4,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  emptyCardText: {
    color: Colors.mutedForeground,
    fontSize: FontSize.sm,
  },

  // Form Card
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    ...Shadow.sm,
  },
  formTitle: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  formSubtitle: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    marginTop: -6,
  },
  input: {
    backgroundColor: Colors.muted,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    color: Colors.foreground,
    fontSize: FontSize.sm,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.mutedForeground,
    marginBottom: 4,
    marginLeft: 2,
    letterSpacing: 0.5,
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  slotsContainer: {
    marginTop: 4,
    gap: 8,
  },
  slotsTitle: {
    color: Colors.foreground,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  slotsScroll: {
    flexDirection: 'row',
  },
  slotPill: {
    backgroundColor: Colors.muted,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    marginRight: Spacing.xs,
  },
  slotPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotPillText: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  slotPillTextActive: {
    color: Colors.black,
    fontWeight: '700',
  },
  noSlotsText: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  customTimeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  customTimeToggleText: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  timeIndicatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    gap: 8,
    marginTop: 4,
  },
  timeIndicatorText: {
    color: '#047857',
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  selectionInfoText: {
    color: Colors.foreground,
    fontSize: FontSize.sm,
  },
  submitFormBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  submitFormBtnDisabled: {
    backgroundColor: Colors.muted,
    opacity: 0.6,
  },
  submitFormBtnText: {
    color: Colors.black,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },

  // Filters
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterLabel: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 4,
  },
  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.muted,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryLight,
  },
  filterTabText: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: Colors.primary,
  },

  // Groups
  groupContainer: { gap: Spacing.sm },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  groupBadge: {
    backgroundColor: Colors.primaryLight,
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  groupLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },

  // Picker details
  pickerField: {
    flex: 1,
    backgroundColor: Colors.muted,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    justifyContent: 'center',
    height: 52,
  },
  pickerFieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  pickerFieldText: {
    color: Colors.foreground,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  pickerFieldPlaceholder: {
    color: Colors.mutedForeground,
    fontWeight: 'normal',
  },

  // History styles
  historyCardContainer: {
    marginBottom: Spacing.sm,
  },
  detailsBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    ...Shadow.sm,
  },
  detailsBtnText: {
    color: Colors.background,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },

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
    width: '100%',
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
  modalSubtitle: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    marginTop: 2,
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

  // Visual Chart Styles
  chartBarContainer: {
    marginBottom: 12,
  },
  chartBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.foreground,
  },
  chartBarValue: {
    fontSize: 10,
    fontWeight: '700',
  },
  chartBarTrack: {
    height: 8,
    backgroundColor: Colors.muted,
    borderRadius: Radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },

  // Rating Modal
  ratingAspectCard: {
    backgroundColor: Colors.muted,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
  },
  ratingAspectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  ratingAspectLabel: {
    color: Colors.foreground,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  ratingAspectDesc: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 8,
  },
  starTouch: {
    padding: 4,
  },
  starIcon: {
    fontSize: 28,
    color: '#3A3A45',
  },
  starIconActive: {
    color: Colors.primary,
  },
  feedbackCard: {
    gap: 8,
  },
  feedbackLabel: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  feedbackInput: {
    backgroundColor: Colors.muted,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    color: Colors.foreground,
    fontSize: FontSize.sm,
    textAlignVertical: 'top',
  },
  submitRatingBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadow.primary,
  },
  submitRatingBtnDisabled: {
    backgroundColor: Colors.muted,
    opacity: 0.6,
  },
  submitRatingBtnText: {
    color: Colors.black,
    fontSize: FontSize.base,
    fontWeight: '700',
  },



  // ── Month Calendar Styles ──────────────────────────────────────
  calendarCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    width: '90%',
    maxWidth: 360,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  calendarMonthYear: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.foreground,
  },
  calendarNavBtn: {
    padding: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.muted,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
  },
  weekDayHeader: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
  },
  dayButtonToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: FontSize.sm,
    color: Colors.foreground,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#000',
    fontWeight: '700',
  },
  dayTextToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dayTextEmpty: {
    color: 'transparent',
  },
  calendarFooter: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    alignItems: 'flex-end',
  },
  calendarCancelBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: Colors.muted,
  },
  calendarCancelBtnText: {
    color: Colors.foreground,
    fontWeight: '600',
    fontSize: FontSize.sm,
  },

  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  timePickerCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    width: '90%',
    maxWidth: 340,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.foreground,
  },
  sheetCloseBtn: {
    padding: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.muted,
  },
  dialogFooter: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    alignItems: 'flex-end',
    width: '100%',
  },
  dialogFooterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    width: '100%',
  },
  dialogCancelBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.muted,
  },
  dialogCancelBtnText: {
    color: Colors.foreground,
    fontWeight: '600',
    fontSize: FontSize.sm,
  },
  dialogConfirmBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  dialogConfirmBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  wheelContainerOuter: {
    alignItems: 'center',
    width: '100%',
  },
  wheelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    position: 'relative',
    marginVertical: Spacing.md,
    backgroundColor: Colors.muted, // Light themed background
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 320,
  },
  selectionHighlight: {
    position: 'absolute',
    height: 40,
    left: 8,
    right: 8,
    top: 50, // Centered vertically: (140 - 40)/2 = 50
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  wheelColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
  },
  wheelColumnLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.mutedForeground,
    letterSpacing: 1.5,
    marginTop: 6,
    position: 'absolute',
    top: 4,
    zIndex: 10,
  },
  wheelScrollContent: {
    paddingVertical: 0,
  },
  wheelPlaceholder: {
    height: 48,
  },
  wheelItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  wheelItemText: {
    fontSize: FontSize.md,
    color: Colors.mutedForeground,
    fontWeight: '500',
  },
  wheelItemTextActive: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  wheelSeparator: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.foreground,
    marginHorizontal: Spacing.xs,
    paddingBottom: 4,
  },
  wheelTimezone: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.mutedForeground,
    marginRight: Spacing.md,
  },
  wheelFaderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(248, 249, 250, 0.85)', // Matches Colors.muted
  },
  wheelFaderBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(248, 249, 250, 0.85)', // Matches Colors.muted
  },
  timePreviewBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  timePreviewValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
  },
});
