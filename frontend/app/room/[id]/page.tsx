"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  Chat,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
  useParticipants,
  useRoomInfo,
  TrackToggle,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import {
  MessageSquare,
  ArrowLeft,
  Loader2,
  X,
  Users,
  Radio,
  Shield,
  Video,
  Mic,
  MonitorUp,
  LogOut,
  VideoOff,
  MicOff,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PreJoinComponent from "@/components/PreJoinComponent";
import CustomChat from "@/components/CustomChat";

// ─── Meeting Timer ───────────────────────────────────────────
function MeetingTimer() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <span className="font-mono text-xs tabular-nums text-white/70">
      {hrs > 0 ? `${pad(hrs)}:` : ""}{pad(mins)}:{pad(secs)}
    </span>
  );
}

// ─── Participant Count Badge ─────────────────────────────────
function ParticipantCount() {
  const participants = useParticipants();
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.06]">
      <Users size={13} className="text-white/60" />
      <span className="text-xs font-medium text-white/80">{participants.length}</span>
    </div>
  );
}

// ─── Video Stage ─────────────────────────────────────────────
function VideoStage() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  return (
    <GridLayout tracks={tracks} className="room-video-grid">
      <ParticipantTile />
    </GridLayout>
  );
}

// ─── Active Room UI ──────────────────────────────────────────
function ActiveRoom({ roomId, meetingId, meetingDetails, onLeave }: { roomId: string; meetingId: string; meetingDetails: any; onLeave: () => void }) {
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div className="room-container">
      {/* ── Top Bar ── */}
      <div className="room-top-bar">
        <div className="flex items-center gap-3">
          {meetingDetails?.isStreaming ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
              <Radio size={12} className="text-red-400 animate-pulse" />
              <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">Live Streaming</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.06]">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Internal Meeting</span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.06]">
            <span className="text-xs text-white/50">Ruang</span>
            <span className="text-xs font-medium text-white/80">#{roomId}</span>
          </div>
          <MeetingTimer />
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            meetingDetails?.isStreaming ? (
              <button
                onClick={async () => {
                  if (confirm("Hentikan live streaming?")) {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/livekit/egress/stop`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                      },
                      body: JSON.stringify({ scheduleId: meetingId })
                    });
                    if (res.ok) {
                      alert("Streaming dihentikan.");
                      window.location.reload();
                    }
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 transition-colors border border-red-500/30"
              >
                <LogOut size={12} className="rotate-180" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Stop Stream</span>
              </button>
            ) : (
              <button
                onClick={async () => {
                  if (confirm("Mulai live streaming manual?")) {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/livekit/egress/start`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                      },
                      body: JSON.stringify({ scheduleId: meetingId, roomName: roomId })
                    });
                    if (res.ok) {
                      alert("Streaming dimulai.");
                      window.location.reload();
                    } else {
                      const data = await res.json();
                      alert("Gagal memulai stream: " + data.error);
                    }
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors border border-blue-500/30"
              >
                <Radio size={12} />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Start Stream</span>
              </button>
            )
          )}
          <ParticipantCount />
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20">
            <Shield size={12} className="text-emerald-400" />
            <span className="text-[10px] font-medium text-emerald-300">Terenkripsi</span>
          </div>
        </div>
      </div>

      {/* ── Main Content: Video + Chat side by side ── */}
      <div className="room-main">
        {/* Video Stage */}
        <div className="room-video-area">
          <VideoStage />
        </div>

        {/* Chat Sidebar */}
        {chatOpen && (
          <div className="room-chat-sidebar">
            <div className="room-chat-header">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-emerald-400" />
                <span className="text-sm font-semibold text-white">Diskusi</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300">
                  Live
                </span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={14} />
              </button>
            </div>
            <div className="room-chat-body">
              <CustomChat />
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Control Bar ── */}
      <div className="room-controls">
        <div className="room-controls-inner">
          <ControlBar
            variation="minimal"
            controls={{
              microphone: true,
              camera: true,
              screenShare: true,
              leave: true,
              chat: false,
              settings: false,
            }}
          />
          {/* Chat toggle */}
          <button
            onClick={() => setChatOpen((p) => !p)}
            className={`room-control-btn ${chatOpen ? "room-control-btn--active" : ""}`}
            title="Toggle Chat"
          >
            <MessageSquare size={18} />
            {chatOpen && <span className="room-control-indicator" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function RoomPage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const router = useRouter();
  const { user, token: authToken } = useAuth();

  const [token, setToken] = useState("");
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://localhost:7880";

  useEffect(() => {
    const initRoom = async () => {
      if (!authToken || !user) return;
      try {
        const detailsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/schedules`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (detailsRes.ok) {
          const allSchedules = await detailsRes.json();
          const currentSchedule = allSchedules.find(
            (s: any) => s.id === Number(roomId) || s.id.toString() === roomId
          );
          if (currentSchedule) setMeetingDetails(currentSchedule);
          else if (allSchedules.length > 0) setMeetingDetails(allSchedules[0]);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/livekit/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ roomName: roomId, scheduleId: roomId }),
          }
        );
        if (!response.ok) throw new Error(`Failed to fetch token: ${response.statusText}`);
        const data = await response.json();
        setToken(data.token);
      } catch (e) {
        console.error("Failed to initialize LiveKit room", e);
      }
    };
    initRoom();
  }, [roomId, authToken, user]);

// ── Loading State ──
  if (!user || !authToken) {
    return (
      <ProtectedRoute>
        <div className="room-loading-screen">
          <Loader2 size={28} className="text-emerald-400 animate-spin mb-4" />
          <p className="font-semibold text-sm text-white">Memverifikasi Sesi...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (token === "") {
    return (
      <ProtectedRoute>
        <div className="room-loading-screen">
          <div className="room-loading-card">
            <div className="room-loading-pulse" />
            <Loader2 size={28} className="text-emerald-400 animate-spin mb-4" />
            <p className="font-semibold text-sm text-white">Ketemu Dewan</p>
            <p className="text-white/40 text-xs mt-1">Menyiapkan koneksi aman...</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-emerald-400/60 animate-pulse [animation-delay:150ms]" />
              <div className="w-2 h-2 rounded-full bg-emerald-400/30 animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const handleDisconnected = () => {
    if (meetingDetails) {
      router.push(
        `/masyarakat?ratedMeetingId=${roomId}&dewanId=${meetingDetails.dewanId || meetingDetails.dewan_id}`
      );
    } else {
      router.push("/masyarakat");
    }
  };

  // ── Pre-Join Screen ──
  if (!isJoined) {
    return (
      <ProtectedRoute>
        <PreJoinComponent
          onJoin={(v, a) => {
            setVideoEnabled(v);
            setAudioEnabled(a);
            setIsJoined(true);
          }}
          onBack={() => router.back()}
        />
      </ProtectedRoute>
    );
  }

  // ── Connected Room ──
  return (
    <ProtectedRoute>
      <LiveKitRoom
        video={videoEnabled}
        audio={audioEnabled}
        token={token}
        serverUrl={liveKitUrl}
        onDisconnected={handleDisconnected}
        className="room-livekit-root"
      >
        <ActiveRoom roomId={roomId} meetingId={roomId} meetingDetails={meetingDetails} onLeave={handleDisconnected} />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </ProtectedRoute>
  );
}