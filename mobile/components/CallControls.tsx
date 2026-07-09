import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';

interface CallControlsProps {
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onFlipCamera: () => void;
  onLeave: () => void;
  showChat?: boolean;
  unreadCount?: number;
  onToggleChat?: () => void;
}

function CtrlBtn({
  icon,
  label,
  onPress,
  active = true,
  danger = false,
  badge,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
  badge?: number;
}) {
  const bg = danger
    ? Colors.danger
    : active
    ? 'rgba(255,255,255,0.13)'
    : 'rgba(239,68,68,0.18)';

  const iconColor = danger ? '#fff' : active ? '#fff' : Colors.danger;

  return (
    <View style={styles.btnWrapper}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: bg }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <MaterialIcons name={icon as any} size={22} color={iconColor} />
      </TouchableOpacity>

      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}

      <Text style={[styles.label, danger && styles.labelDanger, !active && !danger && styles.labelMuted]}>
        {label}
      </Text>
    </View>
  );
}

export default function CallControls({
  isMicEnabled,
  isCameraEnabled,
  onToggleMic,
  onToggleCamera,
  onFlipCamera,
  onLeave,
  showChat = false,
  unreadCount = 0,
  onToggleChat,
}: CallControlsProps) {
  return (
    <View style={styles.bar}>
      <CtrlBtn
        icon={isMicEnabled ? 'mic' : 'mic-off'}
        label={isMicEnabled ? 'Mic' : 'Bisu'}
        active={isMicEnabled}
        onPress={onToggleMic}
      />
      <CtrlBtn
        icon={isCameraEnabled ? 'videocam' : 'videocam-off'}
        label={isCameraEnabled ? 'Kamera' : 'Mati'}
        active={isCameraEnabled}
        onPress={onToggleCamera}
      />
      <CtrlBtn
        icon="flip-camera-ios"
        label="Balik"
        onPress={onFlipCamera}
      />
      {onToggleChat && (
        <CtrlBtn
          icon="chat-bubble-outline"
          label="Chat"
          active={showChat}
          onPress={onToggleChat}
          badge={unreadCount}
        />
      )}
      <CtrlBtn
        icon="call-end"
        label="Keluar"
        danger
        onPress={onLeave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: 40,
    paddingTop: 16,
    paddingHorizontal: 12,
    gap: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  btnWrapper: {
    alignItems: 'center',
    gap: 5,
    position: 'relative',
  },

  btn: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },

  label: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '500',
  },
  labelDanger: {
    color: '#ff6b6b',
  },
  labelMuted: {
    color: Colors.danger,
  },

  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.danger,
    borderRadius: Radius.full,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.6)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
});
