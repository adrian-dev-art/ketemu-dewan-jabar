import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VideoTrack } from '@livekit/react-native';
import type { Participant } from 'livekit-client';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, Radius } from '@/constants/theme';

interface VideoTileProps {
  participant: Participant;
  trackRef?: any;
  isSpeaking?: boolean;
  isLocal?: boolean;
  /** When true, renders in compact PiP mode (smaller avatar, no name badge) */
  compact?: boolean;
  /** Custom bottom spacing to float the name badge above control bars or chat panels */
  bottomOffset?: number;
}

export default function VideoTile({
  participant,
  trackRef,
  isSpeaking,
  isLocal,
  compact = false,
  bottomOffset,
}: VideoTileProps) {
  const displayName = participant.name || participant.identity;
  const isMuted = !participant.isMicrophoneEnabled;
  const isCameraOff = !participant.isCameraEnabled;
  const track = trackRef?.publication?.track;
  const hasVideo = !!track && !isCameraOff;

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={[styles.tile, isSpeaking && styles.tileSpeaking]}>
      {/* Video feed */}
      {hasVideo ? (
        <VideoTrack
          key={track?.mediaStream?.id || track?.sid || 'video'}
          style={StyleSheet.absoluteFill}
          trackRef={trackRef}
          objectFit="cover"
          mirror={isLocal}
        />
      ) : (
        /* Camera-off avatar */
        <View style={styles.avatarBg}>
          <View style={[styles.avatarCircle, compact && styles.avatarCircleCompact]}>
            <Text style={[styles.avatarText, compact && styles.avatarTextCompact]}>
              {initial}
            </Text>
          </View>
          {!compact && (
            <Text style={styles.avatarName} numberOfLines={1}>
              {isLocal ? 'Kamera Mati' : displayName}
            </Text>
          )}
        </View>
      )}

      {/* Bottom overlay: name pill + mute badge */}
      {!compact && (
        <View style={[styles.bottomBar, { bottom: bottomOffset ?? 10 }]}>
          {isMuted && (
            <View style={styles.muteBadge}>
              <MaterialIcons name="mic-off" size={11} color="#fff" />
            </View>
          )}
          <View style={styles.namePill}>
            <Text style={styles.nameText} numberOfLines={1}>
              {isLocal ? `${displayName} (Anda)` : displayName}
            </Text>
          </View>
        </View>
      )}

      {/* Speaking ring — rendered as absolute border overlay */}
      {isSpeaking && <View style={styles.speakingRing} />}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: '#111118',
    overflow: 'hidden',
    position: 'relative',
  },
  tileSpeaking: {
    // Speaking ring handles the visual; tile itself stays the same
  },

  // Avatar (camera off)
  avatarBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d0d18',
    gap: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(61,109,186,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(61,109,186,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircleCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  avatarTextCompact: {
    fontSize: FontSize.base,
  },
  avatarName: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FontSize.xs,
    fontWeight: '500',
  },

  // Bottom info bar
  bottomBar: {
    position: 'absolute',
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  muteBadge: {
    backgroundColor: Colors.danger,
    borderRadius: Radius.full,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  namePill: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  nameText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },

  // Speaking ring
  speakingRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    borderRadius: 0,
  },
});
