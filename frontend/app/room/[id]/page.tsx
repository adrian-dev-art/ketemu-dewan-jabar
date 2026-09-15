"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  Chat,
  GridLayout,
  ParticipantTile,
  useTracks,
  useParticipants,
  useRoomInfo,
  useLocalParticipant,
  useRoomContext,
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
  LayoutGrid,
  UserSquare2,
  Circle,
  StopCircle,
  PhoneOff,
  Info,
  Calendar,
  Clock,
  User,
  Building2,
  FileText,
  BadgeCheck,
  CheckCircle2,
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
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-inner">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span className="font-mono text-xs font-semibold tabular-nums text-zinc-200">
        {hrs > 0 ? `${pad(hrs)}:` : ""}{pad(mins)}:{pad(secs)}
      </span>
    </div>
  );
}

// ─── Participant Count Badge ─────────────────────────────────
function ParticipantCount() {
  const participants = useParticipants();
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.08] text-zinc-200">
      <Users size={13} className="text-zinc-400" />
      <span className="text-xs font-semibold">{participants.length}</span>
    </div>
  );
}

// ─── Video Stage ─────────────────────────────────────────────
function VideoStage({ layout }: { layout: 'grid' | 'speaker' }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  if (layout === 'speaker') {
    // Find active speaker or fallback to first participant
    const activeTracks = tracks.filter(t => t.participant.isSpeaking);
    const mainTrack = activeTracks.length > 0 ? activeTracks[0] : tracks[0];
    const otherTracks = tracks.filter(t => t !== mainTrack);

    return (
      <div className="room-speaker-view">
        <div className="room-speaker-main">
          {mainTrack ? (
             <ParticipantTile trackRef={mainTrack} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
              <Users size={48} className="opacity-40" />
              <p className="text-xs font-medium">Menunggu peserta berbicara...</p>
            </div>
          )}
        </div>
        {otherTracks.length > 0 && (
          <div className="room-speaker-strip">
            {otherTracks.map(t => (
              <ParticipantTile key={`${t.participant.identity}-${t.source}`} trackRef={t} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <GridLayout tracks={tracks} className="room-video-grid">
      <ParticipantTile />
    </GridLayout>
  );
}

// ─── Custom Control Dock ──────────────────────────────────────
function RoomControlsDock({
  chatOpen,
  setChatOpen,
  activeTab,
  setActiveTab,
  onLeave,
}: {
  chatOpen: boolean;
  setChatOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  activeTab: 'chat' | 'info';
  setActiveTab: (t: 'chat' | 'info') => void;
  onLeave: () => void;
}) {
  const {
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
    localParticipant,
  } = useLocalParticipant();
  const room = useRoomContext();

  const toggleMic = async () => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  const toggleCamera = async () => {
    if (localParticipant) {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    }
  };

  const toggleScreenShare = async () => {
    if (localParticipant) {
      try {
        await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
      } catch (err) {
        console.error("Screen share error:", err);
      }
    }
  };

  const handleLeave = () => {
    if (confirm("Apakah Anda yakin ingin meninggalkan sesi pertemuan ini?")) {
      try {
        room?.disconnect();
      } catch (e) {
        console.error(e);
      }
      onLeave();
    }
  };

  return (
    <div className="room-controls">
      <div className="room-controls-inner">
        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          className={`custom-control-btn ${
            isMicrophoneEnabled
              ? "custom-control-btn--normal"
              : "custom-control-btn--muted"
          }`}
          title={isMicrophoneEnabled ? "Matikan Mikrofon" : "Nyalakan Mikrofon"}
        >
          {isMicrophoneEnabled ? <Mic size={19} /> : <MicOff size={19} />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          className={`custom-control-btn ${
            isCameraEnabled
              ? "custom-control-btn--normal"
              : "custom-control-btn--muted"
          }`}
          title={isCameraEnabled ? "Matikan Kamera" : "Nyalakan Kamera"}
        >
          {isCameraEnabled ? <Video size={19} /> : <VideoOff size={19} />}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`custom-control-btn ${
            isScreenShareEnabled
              ? "custom-control-btn--active-blue"
              : "custom-control-btn--normal"
          }`}
          title={isScreenShareEnabled ? "Hentikan Berbagi Layar" : "Bagikan Layar"}
        >
          <MonitorUp size={19} />
        </button>

        {/* Vertical Divider */}
        <div className="w-[1px] h-6 bg-white/10 mx-0.5" />

        {/* Chat Toggle */}
        <button
          onClick={() => {
            if (!chatOpen) {
              setChatOpen(true);
              setActiveTab('chat');
            } else if (activeTab === 'chat') {
              setChatOpen(false);
            } else {
              setActiveTab('chat');
            }
          }}
          className={`custom-control-btn ${
            chatOpen && activeTab === 'chat'
              ? "custom-control-btn--active-emerald"
              : "custom-control-btn--normal"
          }`}
          title="Buka Chat Diskusi"
        >
          <MessageSquare size={19} />
          {chatOpen && activeTab === 'chat' && <span className="room-control-indicator" />}
        </button>

        {/* Agenda Info Toggle */}
        <button
          onClick={() => {
            if (!chatOpen) {
              setChatOpen(true);
              setActiveTab('info');
            } else if (activeTab === 'info') {
              setChatOpen(false);
            } else {
              setActiveTab('info');
            }
          }}
          className={`custom-control-btn ${
            chatOpen && activeTab === 'info'
              ? "custom-control-btn--active-amber"
              : "custom-control-btn--normal"
          }`}
          title="Detail Agenda Aspirasi"
        >
          <Info size={19} />
          {chatOpen && activeTab === 'info' && <span className="room-control-indicator bg-amber-400 shadow-[0_0_6px_#f59e0b]" />}
        </button>

        {/* Vertical Divider */}
        <div className="w-[1px] h-6 bg-white/10 mx-0.5" />

        {/* Leave Call */}
        <button
          onClick={handleLeave}
          className="leave-call-btn"
          title="Keluar Pertemuan"
        >
          <PhoneOff size={16} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </div>
  );
}

// ─── Agenda & Sesi Aspirasi Panel ─────────────────────────────
function AgendaInfoPanel({ meetingDetails, roomId }: { meetingDetails: any; roomId: string }) {
  const dewanList = meetingDetails?.participants?.map((p: any) => p.dewan).filter(Boolean) || [];

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full text-zinc-300 text-xs">
      {/* Title & Badge */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/30 to-zinc-900/60 border border-emerald-500/20">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] mb-1 uppercase tracking-wider">
          <BadgeCheck size={14} />
          <span>Sesi Aspirasi Resmi</span>
        </div>
        <h4 className="text-sm font-bold text-white leading-snug">
          {meetingDetails?.title || "Konsultasi Aspirasi Warga Jawa Barat"}
        </h4>
        <div className="mt-2 flex items-center gap-2 text-zinc-400 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-zinc-200">
            Ruang #{roomId}
          </span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">Sesi Terverifikasi</span>
        </div>
      </div>

      {/* Citizen / Pemohon */}
      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
        <div className="flex items-center gap-2 text-zinc-400 font-medium">
          <User size={14} className="text-blue-400" />
          <span>Pemohon Aspirasi (Masyarakat)</span>
        </div>
        <p className="text-sm font-semibold text-white">
          {meetingDetails?.masyarakat?.name || meetingDetails?.name || "Masyarakat Jawa Barat"}
        </p>
        <p className="text-[11px] text-zinc-400">
          Wilayah: <span className="text-zinc-200">{meetingDetails?.dapil || "Provinsi Jawa Barat"}</span>
        </p>
      </div>

      {/* Dewan Ditugaskan */}
      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
        <div className="flex items-center gap-2 text-zinc-400 font-medium">
          <Building2 size={14} className="text-amber-400" />
          <span>Wakil Rakyat Ditugaskan</span>
        </div>
        {dewanList.length > 0 ? (
          <div className="space-y-2 pt-1">
            {dewanList.map((d: any, idx: number) => (
              <div key={d.id || idx} className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <p className="text-xs font-semibold text-zinc-100">{d.name}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{d.fraksi || "DPRD Jawa Barat"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 italic">Anggota Dewan Terjadwal</p>
        )}
      </div>

      {/* Jadwal Pelaksanaan */}
      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
        <div className="flex items-center gap-2 text-zinc-400 font-medium">
          <Calendar size={14} className="text-purple-400" />
          <span>Jadwal Pelaksanaan</span>
        </div>
        <p className="text-xs font-medium text-zinc-200">
          {meetingDetails?.startTime
            ? new Date(meetingDetails.startTime).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Sesuai Jadwal"}
        </p>
        <p className="text-[11px] text-zinc-400">
          Waktu:{" "}
          <span className="text-zinc-200 font-medium">
            {meetingDetails?.startTime
              ? new Date(meetingDetails.startTime).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) + " WIB"
              : "-"}
          </span>
        </p>
      </div>

      {/* Official Guidelines */}
      <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 space-y-1.5 text-[11px] text-zinc-400 leading-relaxed">
        <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span>Protokol Audiensi</span>
        </div>
        <p>
          Diskusi berlangsung secara langsung dan terdokumentasi. Poin-poin aspirasi akan dirangkum untuk telaahan telaah teknis dan disposisi resmi OPD terkait.
        </p>
      </div>
    </div>
  );
}

// ─── Active Room UI ──────────────────────────────────────────
function ActiveRoom({ roomId, meetingId, meetingDetails, onLeave }: { roomId: string; meetingId: string; meetingDetails: any; onLeave: () => void }) {
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'info'>('chat');
  const [layout, setLayout] = useState<'grid' | 'speaker'>('grid');
  const [isRecording, setIsRecording] = useState(meetingDetails?.isRecording || false);

  return (
    <div className="room-container">
      {/* ── Top Bar ── */}
      <div className="room-top-bar">
        {/* Left section: Identity & Room Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          {meetingDetails?.isStreaming ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/35 flex-shrink-0">
              <Radio size={12} className="text-red-400 animate-pulse" />
              <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider">Live Streaming</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Sesi Audiensi</span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.08] flex-shrink-0">
            <span className="text-[11px] text-zinc-400 font-medium">Ruang</span>
            <span className="text-[11px] font-bold text-zinc-100 font-mono">#{roomId}</span>
          </div>

          {meetingDetails?.title && (
            <div className="hidden md:flex items-center max-w-[260px] lg:max-w-[380px] truncate text-xs text-zinc-300 font-medium px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
              <span className="truncate">{meetingDetails.title}</span>
            </div>
          )}
        </div>

        {/* Center section: Meeting Clock */}
        <div className="flex items-center justify-center">
          <MeetingTimer />
        </div>

        {/* Right section: Controls & Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 transition-colors border border-red-500/30 text-white"
              >
                <LogOut size={12} className="rotate-180" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Stop Stream</span>
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors border border-blue-500/30 text-white"
              >
                <Radio size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Start Stream</span>
              </button>
            )
          )}

          {/* Grid vs Speaker Layout Toggle */}
          <div className="flex items-center bg-white/[0.06] rounded-full p-1 border border-white/[0.1]">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded-full transition-all ${layout === 'grid' ? 'bg-emerald-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
              title="Tampilan Grid (Semua Peserta)"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setLayout('speaker')}
              className={`p-1.5 rounded-full transition-all ${layout === 'speaker' ? 'bg-emerald-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
              title="Tampilan Pembicara Utama"
            >
              <UserSquare2 size={14} />
            </button>
          </div>

          <ParticipantCount />
          
          {user?.role === 'admin' && (
             <button
                onClick={async () => {
                  try {
                    const endpoint = isRecording ? 'stop' : 'start';
                    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/livekit/record/${endpoint}`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                      },
                      body: JSON.stringify({ scheduleId: meetingId, roomName: roomId })
                    });
                    
                    if (res.ok) {
                      setIsRecording(!isRecording);
                    } else {
                      const data = await res.json();
                      alert("Gagal mengelola rekaman: " + data.error);
                    }
                  } catch (err) {
                    console.error("Recording error:", err);
                    alert("Terjadi kesalahan koneksi saat mencoba merekam.");
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border ${
                  isRecording 
                  ? "bg-red-500/20 border-red-500/40 text-red-400" 
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                }`}
             >
                {isRecording ? <StopCircle size={12} className="animate-pulse" /> : <Circle size={12} />}
                <span className="text-[10px] font-bold uppercase tracking-wider">{isRecording ? "Stop Rec" : "Record"}</span>
             </button>
          )}

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
            <Shield size={12} className="text-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-300">256-bit Terenkripsi</span>
          </div>
        </div>
      </div>

      {/* ── Main Content: Video + Chat side by side ── */}
      <div className="room-main">
        {/* Video Stage */}
        <div className="room-video-area">
          <VideoStage layout={layout} />
        </div>

        {/* Chat & Agenda Sidebar */}
        {chatOpen && (
          <div className="room-chat-sidebar">
            <div className="room-chat-header flex items-center justify-between px-3 py-2.5 border-b border-white/[0.08] bg-zinc-950/70">
              <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-xl border border-white/[0.08]">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'chat'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>Diskusi</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'chat' ? 'bg-white' : 'bg-emerald-400'} animate-pulse`} />
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'info'
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Info size={13} />
                  <span>Agenda</span>
                </button>
              </div>

              <button
                onClick={() => setChatOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                title="Tutup Panel"
              >
                <X size={15} />
              </button>
            </div>

            <div className="room-chat-body">
              {activeTab === 'chat' ? (
                <CustomChat />
              ) : (
                <AgendaInfoPanel meetingDetails={meetingDetails} roomId={roomId} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Custom Bottom Control Dock ── */}
      <RoomControlsDock
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLeave={onLeave}
      />
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

  // ─── Failsafe to track & stop all media streams on page unmount ───
  useEffect(() => {
    const activeStreams = new Set<MediaStream>();
    const originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
    const originalGetDisplayMedia = navigator.mediaDevices?.getDisplayMedia;

    if (originalGetUserMedia) {
      navigator.mediaDevices.getUserMedia = async function (constraints) {
        const stream = await originalGetUserMedia.call(navigator.mediaDevices, constraints);
        activeStreams.add(stream);
        return stream;
      };
    }

    if (originalGetDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = async function (constraints) {
        const stream = await originalGetDisplayMedia.call(navigator.mediaDevices, constraints);
        activeStreams.add(stream);
        return stream;
      };
    }

    return () => {
      // Restore originals
      if (originalGetUserMedia) {
        navigator.mediaDevices.getUserMedia = originalGetUserMedia;
      }
      if (originalGetDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
      // Forcefully stop all active tracks from streams captured on this page
      activeStreams.forEach((stream) => {
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (err) {
            console.error("Failsafe failed to stop track:", err);
          }
        });
      });
      activeStreams.clear();
    };
  }, []);

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
    if (user?.role === 'admin') {
      router.push("/admin");
      return;
    }
    if (user?.role === 'dewan') {
      router.push("/dewan");
      return;
    }

    if (meetingDetails) {
      // Find the first dewan participant to rate
      const dewanId = meetingDetails.participants?.[0]?.dewanId;
      router.push(
        `/masyarakat?ratedMeetingId=${roomId}&dewanId=${dewanId || ""}`
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
        options={{
          publishDefaults: {
            simulcast: true,
            videoCodec: 'vp8',
          },
          videoCaptureDefaults: {
            resolution: { width: 1280, height: 720, frameRate: 30 }
          }
        }}
      >
        <ActiveRoom roomId={roomId} meetingId={roomId} meetingDetails={meetingDetails} onLeave={handleDisconnected} />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </ProtectedRoute>
  );
}