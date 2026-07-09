import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';

interface Participant {
  dewanId: number;
  status: string;
  dewan: { name: string };
}

interface Schedule {
  id: number;
  title: string;
  startTime: string;
  participants?: Participant[];
}

interface ScheduleCardProps {
  schedule: Schedule;
  showActions?: boolean;
  onConfirm?: () => void;
  onReject?: () => void;
  onJoin?: () => void;
}

const STATUS_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
  pending: { color: Colors.warning, label: 'Menunggu', bg: 'rgba(245,158,11,0.12)' },
  confirmed: { color: Colors.success, label: 'Terkonfirmasi', bg: Colors.successLight },
  rejected: { color: Colors.danger, label: 'Ditolak', bg: Colors.dangerLight },
};

export default function ScheduleCard({ schedule, showActions, onConfirm, onReject, onJoin }: ScheduleCardProps) {
  const date = new Date(schedule.startTime);
  const formattedDate = date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const overallStatus = schedule.participants?.[0]?.status || 'pending';
  const statusCfg = STATUS_CONFIG[overallStatus] || STATUS_CONFIG.pending;

  const dewanNames = schedule.participants?.map((p) => p.dewan?.name).filter(Boolean).join(', ') || '-';

  return (
    <View style={styles.card}>
      {/* Title + Status */}
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>
          {schedule.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>

      {/* Time */}
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Waktu</Text>
        <Text style={styles.metaValue}>{formattedDate} - {formattedTime} WIB</Text>
      </View>

      {/* Dewan */}
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Bersama</Text>
        <Text style={styles.metaValue} numberOfLines={2}>{dewanNames}</Text>
      </View>

      {/* Actions */}
      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={onReject}
            activeOpacity={0.8}
          >
            <Text style={styles.rejectText}>Tolak</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.confirmBtn]}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmText}>Konfirmasi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Join Call Button — tampil jika status confirmed dan onJoin ada */}
      {!showActions && onJoin && overallStatus === 'confirmed' && (
        <TouchableOpacity
          style={styles.joinBtn}
          onPress={onJoin}
          activeOpacity={0.85}
        >
          <Text style={styles.joinBtnText}>Bergabung ke Pertemuan</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 8,
    ...Shadow.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaLabel: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    fontWeight: '600',
    width: 56,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    flex: 1,
    color: Colors.foreground,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  rejectText: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    ...Shadow.primary,
  },
  confirmText: {
    color: Colors.black,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  joinBtn: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    marginTop: 4,
  },
  joinBtnText: {
    color: Colors.success,
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
