import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';

interface DewanUser {
  id: number;
  name: string;
  fraksi?: string;
  jabatan?: string;
  dapil?: string;
}

interface DewanCardProps {
  dewan: DewanUser;
  onPress?: () => void;
  isSelected?: boolean;
}

export default function DewanCard({ dewan, onPress, isSelected }: DewanCardProps) {
  const initials = dewan.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {dewan.name}
        </Text>
        {dewan.jabatan && (
          <Text style={styles.jabatan} numberOfLines={1}>
            {dewan.jabatan}
          </Text>
        )}
        <View style={styles.metaRow}>
          {dewan.fraksi && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{dewan.fraksi}</Text>
            </View>
          )}
          {dewan.dapil && (
            <View style={styles.tagMuted}>
              <Text style={styles.tagMutedText}>{dewan.dapil}</Text>
            </View>
          )}
        </View>
      </View>

      {isSelected ? (
        <Text style={styles.checkIcon}>✓</Text>
      ) : (
        <Text style={styles.plusIcon}>+</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  jabatan: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  tagMuted: {
    backgroundColor: Colors.muted,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagMutedText: {
    color: Colors.mutedForeground,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  cardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primaryLight,
  },
  checkIcon: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
  },
  plusIcon: {
    color: Colors.mutedForeground,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
