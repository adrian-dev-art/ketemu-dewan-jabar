import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
  PermissionsAndroid,
  TextInput,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  ConnectionState,
} from 'livekit-client';
import {
  useTracks,
  AudioSession,
  registerGlobals,
} from '@livekit/react-native';
import { useAuth } from '@/context/AuthContext';
import { livekitApi, schedulesApi } from '@/services/api';
import CallControls from '@/components/CallControls';
import VideoTile from '@/components/VideoTile';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

registerGlobals();

const { width: SW, height: SH } = Dimensions.get('window');
const LIVEKIT_URL = process.env.EXPO_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';
const CHAT_H = Math.round(SH * 0.48);
const CONTROLS_H = 110;
const PIP_W = 100;
const PIP_H = 148;

// ─── String encoding helpers (no TextEncoder polyfill needed) ─────────────────
const encStr = (s: string): Uint8Array => {
  const a = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return a;
};
const decStr = (a: Uint8Array): string => {
  let s = '';
  for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
  return s;
};

// ─── Pre-Join Screen ──────────────────────────────────────────────────────────
function PreJoinScreen({ scheduleId, onJoin }: { scheduleId: string; onJoin: (t: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [micTest, setMicTest] = useState(true);
  const [camTest, setCamTest] = useState(true);

  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await livekitApi.getToken(scheduleId, Number(scheduleId));
      onJoin(res.data.token);
    } catch (e: any) {
      Alert.alert('Gagal Bergabung', e.response?.data?.error || 'Tidak dapat mendapatkan akses ruangan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={pj.root}>
      <StatusBar barStyle="light-content" />

      {/* Decorative radial glows */}
      <View style={pj.glow1} />
      <View style={pj.glow2} />

      <View style={pj.card}>
        {/* Header Title */}
        <Text style={pj.headerLabel}>MEET DEWAN PORTAL</Text>
        <Text style={pj.title}>Siap Bergabung?</Text>
        <Text style={pj.subtitle}>Ruang Aspirasi #{scheduleId}</Text>

        {/* Premium Camera Preview Placeholder */}
        <View style={pj.previewFrame}>
          {camTest ? (
            <View style={pj.previewCamOn}>
              <MaterialIcons name="face" size={60} color="rgba(61,109,186,0.3)" />
              <View style={pj.scannerLine} />
              <Text style={pj.previewLabel}>Kamera Anda Aktif</Text>
            </View>
          ) : (
            <View style={pj.previewCamOff}>
              <MaterialIcons name="videocam-off" size={48} color="rgba(255,255,255,0.2)" />
              <Text style={pj.previewLabelOff}>Kamera Dinonaktifkan</Text>
            </View>
          )}

          {/* Quick test control overlay */}
          <View style={pj.previewOverlay}>
            <TouchableOpacity 
              style={[pj.testBtn, !micTest && pj.testBtnOff]}
              onPress={() => setMicTest(!micTest)}
            >
              <MaterialIcons name={micTest ? 'mic' : 'mic-off'} size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[pj.testBtn, !camTest && pj.testBtnOff]}
              onPress={() => setCamTest(!camTest)}
            >
              <MaterialIcons name={camTest ? 'videocam' : 'videocam-off'} size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Checklist */}
        <View style={pj.checklist}>
          <View style={pj.checkRow}>
            <MaterialIcons name="network-wifi" size={16} color={Colors.primary} />
            <Text style={pj.checkText}>Koneksi jaringan stabil</Text>
          </View>
          <View style={pj.checkRow}>
            <MaterialIcons name="hearing" size={16} color={Colors.primary} />
            <Text style={pj.checkText}>Gunakan headset untuk audio maksimal</Text>
          </View>
        </View>

        {/* Join button */}
        <TouchableOpacity
          style={[pj.joinBtn, loading && { opacity: 0.6 }]}
          onPress={handleJoin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={pj.joinBtnText}>Masuk Sekarang</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={pj.backBtn} onPress={() => router.back()}>
          <Text style={pj.backText}>Kembali ke Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const pj = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A10',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glow1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(61,109,186,0.15)',
    filter: 'blur(80px)' as any,
  },
  glow2: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(16,185,129,0.08)',
    filter: 'blur(70px)' as any,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(20, 20, 32, 0.75)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 24,
    alignItems: 'center',
  },
  headerLabel: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: FontSize.xs,
    marginBottom: 20,
  },
  previewFrame: {
    width: '100%',
    height: 150,
    backgroundColor: '#0F0F1A',
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    position: 'relative',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCamOn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCamOff: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 10,
  },
  previewLabelOff: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 10,
  },
  scannerLine: {
    position: 'absolute',
    top: 15,
    width: 120,
    height: 1,
    backgroundColor: Colors.primary,
    opacity: 0.7,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    gap: 8,
  },
  testBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  testBtnOff: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  checklist: {
    width: '100%',
    gap: 8,
    marginBottom: 24,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSize.xs,
  },
  joinBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    marginBottom: 12,
  },
  joinBtnText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  backBtn: {
    paddingVertical: 8,
  },
  backText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});

// ─── Active Room ──────────────────────────────────────────────────────────────
function ActiveRoom({ token, scheduleId, onLeave }: { token: string; scheduleId: string; onLeave: () => void }) {
  const roomRef = useRef<Room>(new Room());
  const room = roomRef.current;

  const trackSources = useMemo(() => [
    { source: Track.Source.Camera, withPlaceholder: true }
  ], []);

  const tracks = useTracks(trackSources, { onlySubscribed: false, room });

  const [connState, setConnState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [updateTick, setUpdateTick] = useState(0);
  const { user } = useAuth();
  const showChatRef = useRef(false);
  const chatScrollRef = useRef<ScrollView>(null);

  // Dynamic Meeting Active Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [connStatusLog, setConnStatusLog] = useState('Mengamankan enkripsi...');

  useEffect(() => {
    if (connState !== ConnectionState.Connected) return;
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [connState]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => { showChatRef.current = showChat; }, [showChat]);

  useEffect(() => {
    const bump = () => setUpdateTick(n => n + 1);

    const onData = (payload: Uint8Array, _p: RemoteParticipant | undefined) => {
      try {
        const msg = JSON.parse(decStr(payload));
        setMessages(prev => [...prev, { ...msg, isMe: false }]);
        if (!showChatRef.current) setUnread(c => c + 1);
        setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 50);
      } catch { /* ignore */ }
    };

    const connect = async () => {
      try {
        setConnStatusLog('Menghubungkan live stream audio/video...');
        await AudioSession.startAudioSession();
        await room.connect(LIVEKIT_URL, token);
        setConnStatusLog('Mengaktifkan kamera & mikrofon...');
        await room.localParticipant.enableCameraAndMicrophone();
        setConnState(ConnectionState.Connected);
        bump();
      } catch (err) {
        Alert.alert('Koneksi Gagal', 'Tidak dapat terhubung ke ruangan konferensi.');
        onLeave();
      }
    };

    room.on(RoomEvent.ConnectionStateChanged, setConnState);
    room.on(RoomEvent.Disconnected, onLeave);
    room.on(RoomEvent.LocalTrackPublished, bump);
    room.on(RoomEvent.LocalTrackUnpublished, bump);
    room.on(RoomEvent.TrackPublished, bump);
    room.on(RoomEvent.TrackUnpublished, bump);
    room.on(RoomEvent.TrackSubscribed, bump);
    room.on(RoomEvent.TrackUnsubscribed, bump);
    room.on(RoomEvent.DataReceived, onData);

    connect();

    return () => {
      room.off(RoomEvent.ConnectionStateChanged, setConnState);
      room.off(RoomEvent.Disconnected, onLeave);
      room.off(RoomEvent.LocalTrackPublished, bump);
      room.off(RoomEvent.LocalTrackUnpublished, bump);
      room.off(RoomEvent.TrackPublished, bump);
      room.off(RoomEvent.TrackUnpublished, bump);
      room.off(RoomEvent.TrackSubscribed, bump);
      room.off(RoomEvent.TrackUnsubscribed, bump);
      room.off(RoomEvent.DataReceived, onData);
      room.disconnect();
      AudioSession.stopAudioSession();
    };
  }, []);

  const toggleMic = useCallback(async () => {
    const next = !micOn;
    await room.localParticipant.setMicrophoneEnabled(next);
    setMicOn(next);
  }, [micOn, room]);

  const toggleCam = useCallback(async () => {
    const next = !camOn;
    await room.localParticipant.setCameraEnabled(next);
    setCamOn(next);
  }, [camOn, room]);

  const flipCam = useCallback(async () => {
    const t = room.localParticipant.getTrackPublication(Track.Source.Camera)?.track;
    if (t && 'switchActiveDevice' in t) (t as any).switchActiveDevice('videoinput');
  }, [room]);

  const sendMsg = useCallback(() => {
    if (!chatInput.trim()) return;
    const msg = {
      id: Math.random().toString(36),
      sender: user?.name || user?.email?.split('@')[0] || 'Masyarakat',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, { ...msg, isMe: true }]);
    setChatInput('');
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 50);
    try { room.localParticipant.publishData(encStr(JSON.stringify(msg)), { reliable: true }); } catch { /* ignore */ }
  }, [chatInput, room, user]);

  const leaveRoom = useCallback(() => {
    Alert.alert('Keluar Ruangan', 'Anda yakin ingin meninggalkan pertemuan?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: async () => { await room.disconnect(); onLeave(); } },
    ]);
  }, [room, onLeave]);

  const toggleChat = useCallback(() => {
    setShowChat(v => {
      if (!v) setUnread(0);
      return !v;
    });
  }, []);

  // ── Derived layout values ─────────────────────────────────────────────────
  const localTrack = tracks.find(t => t.participant.identity === room.localParticipant.identity);
  const remoteTrack = tracks.find(t => t.participant.identity !== room.localParticipant.identity);
  const hasRemote = !!remoteTrack;

  // pip bottom: when controls visible, sit just above the control bar
  const pipBottom = CONTROLS_H + 12;
  const mainTileBottomOffset = showChat ? CHAT_H + 16 : CONTROLS_H + 16;

  // ── Connection splash ─────────────────────────────────────────────────────
  if (connState !== ConnectionState.Connected) {
    return (
      <View style={s.splash}>
        <StatusBar barStyle="light-content" />
        <View style={s.radarRing}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
        <Text style={s.splashText}>Menghubungkan Ruangan Konferensi</Text>
        <Text style={s.splashLog}>{connStatusLog}</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* ── MAIN VIDEO AREA ─────────────────────────────────────── */}
      <View style={s.videoArea}>
        {hasRemote ? (
          /* Remote participant fills the screen */
          <VideoTile
            participant={remoteTrack!.participant}
            trackRef={remoteTrack}
            isSpeaking={remoteTrack!.participant.isSpeaking}
            isLocal={false}
            bottomOffset={mainTileBottomOffset}
          />
        ) : (
          /* Waiting state: local video fills screen */
          <>
            {localTrack ? (
              <VideoTile
                participant={localTrack.participant}
                trackRef={localTrack}
                isSpeaking={localTrack.participant.isSpeaking}
                isLocal={true}
                bottomOffset={mainTileBottomOffset}
              />
            ) : (
              <View style={s.emptyVideo} />
            )}
            {/* Waiting badge */}
            <View style={s.waitBadge} pointerEvents="none">
              <ActivityIndicator size="small" color={Colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={s.waitTitle}>Menunggu Anggota Dewan</Text>
                <Text style={s.waitSub}>Tautan ruang konferensi aktif. Menanti legislator bergabung...</Text>
              </View>
            </View>
          </>
        )}

        {/* PiP: local user, only shown when remote is present & chat is closed */}
        {hasRemote && !showChat && localTrack && (
          <View style={[s.pip, { bottom: pipBottom }]}>
            <VideoTile
              participant={localTrack.participant}
              trackRef={localTrack}
              isSpeaking={localTrack.participant.isSpeaking}
              isLocal={true}
              compact
            />
          </View>
        )}
      </View>

      {/* ── HEADER (overlays video) ──────────────────────────────── */}
      <View style={s.header} pointerEvents="box-none">
        <View style={s.headerLeft}>
          <View style={s.livePulse} />
          <Text style={s.liveLabel}>LIVE</Text>
        </View>
        <Text style={s.headerTitle}>{formatTimer(secondsElapsed)}</Text>
        <View style={s.headerRight}>
          <MaterialIcons name="lock-outline" size={12} color="#10b981" />
          <Text style={s.secureLabel}>TERENKRIPSI</Text>
        </View>
      </View>

      {/* ── CHAT PANEL ──────────────────────────────────────────── */}
      {showChat && (
        <KeyboardAvoidingView
          style={s.chatPanel}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Chat header */}
          <View style={s.chatHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialIcons name="forum" size={18} color={Colors.primary} />
              <Text style={s.chatTitle}>Obrolan Pertemuan</Text>
            </View>
            <TouchableOpacity style={s.chatClose} onPress={toggleChat}>
              <MaterialIcons name="keyboard-arrow-down" size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={chatScrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={s.chatMsgs}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 ? (
              <View style={s.chatEmpty}>
                <MaterialIcons name="chat-bubble-outline" size={32} color="rgba(255,255,255,0.15)" />
                <Text style={s.chatEmptyText}>Saluran chat aman diaktifkan. Aspirasi Anda tercatat di sini.</Text>
              </View>
            ) : (
              messages.map(msg => (
                <View
                  key={msg.id}
                  style={[s.msgRow, msg.isMe ? s.msgRowMe : s.msgRowOther]}
                >
                  {!msg.isMe && (
                    <View style={s.msgAvatar}>
                      <Text style={s.msgAvatarText}>{msg.sender.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={[s.msgBubble, msg.isMe ? s.msgBubbleMe : s.msgBubbleOther]}>
                    {!msg.isMe && <Text style={s.msgSender}>{msg.sender}</Text>}
                    <Text style={s.msgText}>{msg.text}</Text>
                    <Text style={[s.msgTime, msg.isMe && { color: 'rgba(255,255,255,0.5)' }]}>{msg.time}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Input row */}
          <View style={s.chatInputRow}>
            <TextInput
              style={s.chatInput}
              placeholder="Tulis pesan ke Dewan..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={sendMsg}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[s.sendBtn, !chatInput.trim() && { opacity: 0.4 }]}
              onPress={sendMsg}
              disabled={!chatInput.trim()}
            >
              <MaterialIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ── CALL CONTROLS (always visible) ──────────────────────── */}
      <CallControls
        isMicEnabled={micOn}
        isCameraEnabled={camOn}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCam}
        onFlipCamera={flipCam}
        onLeave={leaveRoom}
        showChat={showChat}
        unreadCount={unread}
        onToggleChat={toggleChat}
      />
    </View>
  );
}

// ─── Root Room Screen ─────────────────────────────────────────────────────────
export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token: authToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [dewanId, setDewanId] = useState<number | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!authToken) return;
    schedulesApi.getMySchedules().then(res => {
      const s = res.data.find((x: any) => x.id === Number(id) || x.id.toString() === id);
      if (s?.participants?.[0]?.dewanId) setDewanId(s.participants[0].dewanId);
    }).catch(() => {});
  }, [id, authToken]);

  const handleLeave = useCallback(() => {
    setToken(null);
    if (dewanId) {
      router.replace({ pathname: '/(masyarakat)', params: { ratedMeetingId: id, dewanId: String(dewanId) } });
    } else {
      router.replace('/(masyarakat)');
    }
  }, [id, dewanId]);

  if (!token) return <PreJoinScreen scheduleId={id} onJoin={setToken} />;
  return <ActiveRoom token={token} scheduleId={id} onLeave={handleLeave} />;
}

// ─── Styles for ActiveRoom ────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07070e',
  },
  splash: {
    flex: 1,
    backgroundColor: '#07070e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(61, 109, 186, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(61, 109, 186, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  splashText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 8,
  },
  splashLog: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: FontSize.xs,
  },
  videoArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#07070e',
  },
  emptyVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#07070e',
  },
  waitBadge: {
    position: 'absolute',
    bottom: CONTROLS_H + 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 27, 0.9)',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  waitTitle: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  waitSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  pip: {
    position: 'absolute',
    right: 14,
    width: PIP_W,
    height: PIP_H,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 44 : 56,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 15, 27, 0.85)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: '#ef4444',
  },
  liveLabel: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FontSize.xs,
    fontWeight: '700',
    backgroundColor: 'rgba(15, 15, 27, 0.85)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 15, 27, 0.85)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  secureLabel: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chatPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CHAT_H,
    backgroundColor: '#11111A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    elevation: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  chatTitle: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  chatClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatMsgs: {
    padding: 12,
    gap: 10,
  },
  chatEmpty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  chatEmptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: FontSize.xs,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '100%',
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(61,109,186,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  msgAvatarText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  msgBubble: {
    maxWidth: SW * 0.68,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 16,
    gap: 2,
  },
  msgBubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  msgBubbleOther: {
    backgroundColor: '#1E1E28',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  msgSender: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  msgText: {
    color: '#fff',
    fontSize: FontSize.sm,
    lineHeight: 19,
  },
  msgTime: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#0A0A12',
  },
  chatInput: {
    flex: 1,
    height: 42,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 21,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: FontSize.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});
