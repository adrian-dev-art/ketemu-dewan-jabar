"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import VideoPlayer from "../../../components/VideoPlayer";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

// Define interface for socket payloads
interface PeerPayload {
  target: string;
  caller: string;
  sdp: RTCSessionDescriptionInit;
}

interface IceCandidatePayload {
  target: string;
  candidate: RTCIceCandidateInit;
}

export default function RoomPage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const router = useRouter();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [meetingDetails, setMeetingDetails] = useState<any>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  const getIceServers = (): RTCConfiguration => {
    const stunServersStrings = process.env.NEXT_PUBLIC_STUN_SERVERS || "stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302";
    const stunServers = stunServersStrings.split(',').map(url => ({ urls: url.trim() }));
    
    const turnUrls = process.env.NEXT_PUBLIC_TURN_SERVERS || "turn:31.97.71.134:3478";
    const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME || "meetdewan";
    const turnPassword = process.env.NEXT_PUBLIC_TURN_PASSWORD || "meetdewan_secret";

    const turnServers = turnUrls.split(',').map(url => ({
      urls: url.trim(),
      username: turnUsername,
      credential: turnPassword,
    }));

    return {
      iceServers: [...stunServers, ...turnServers],
    };
  };

  const createPeerConnection = (targetSocketId: string, socket: Socket, stream: MediaStream) => {
    const pc = new RTCPeerConnection(getIceServers());

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { target: targetSocketId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.set(targetSocketId, event.streams[0]);
        return next;
      });
      setAnnouncement("Seorang peserta telah terhubung.");
    };

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    peerConnections.current.set(targetSocketId, pc);
    return pc;
  };

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000");
    const socket = socketRef.current;

    const initMedia = async () => {
      try {
        console.log("Memulai inisialisasi media...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);

        try {
          const detailsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/schedules`);
          const allSchedules = await detailsRes.json();
          // Filter or find specific schedule if needed
        } catch (e) {
          console.error("Failed to fetch schedule details", e);
        }

        socket.emit("join-room", roomId, socket.id);
        setAnnouncement(`Berhasil masuk ke ruangan ${roomId}`);

        socket.on("user-connected", async (userId: string, targetSocketId: string) => {
          setAnnouncement("Pengguna baru telah bergabung.");
          const pc = createPeerConnection(targetSocketId, socket, stream);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { target: targetSocketId, caller: socket.id, sdp: offer });
        });

        socket.on("offer", async (payload: any) => {
          const senderId = payload.senderId || payload.caller;
          const pc = createPeerConnection(senderId, socket, stream);
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { target: senderId, sdp: answer });
        });

        socket.on("answer", async (payload: any) => {
          const senderId = payload.senderId || payload.caller;
          const pc = peerConnections.current.get(senderId);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          }
        });

        socket.on("ice-candidate", async (payload: any) => {
          const senderId = payload.senderId;
          const pc = peerConnections.current.get(senderId);
          if (pc && payload.candidate) {
            try { 
              await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); 
            } catch (e) {
              console.error("Error adding ICE candidate", e);
            }
          }
        });

        socket.on("user-disconnected", (socketId: string) => {
          setAnnouncement("Seorang peserta telah meninggalkan ruangan.");
          const pc = peerConnections.current.get(socketId);
          if (pc) {
            pc.close();
            peerConnections.current.delete(socketId);
          }
          setRemoteStreams((prev) => {
            const next = new Map(prev);
            next.delete(socketId);
            return next;
          });
        });

      } catch (err: any) {
        console.error("Error in initMedia:", err);
        setAnnouncement(`Error: ${err.message || "Gagal mengakses kamera atau mikrofon"}. Mohon periksa izin perangkat Anda.`);
      }
    };

    initMedia();

    return () => {
      localStream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      socket.disconnect();
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t: MediaStreamTrack) => t.enabled = !t.enabled);
      setIsMuted(!isMuted);
      setAnnouncement(isMuted ? "Mikrofon diaktifkan." : "Mikrofon dimatikan.");
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t: MediaStreamTrack) => t.enabled = !t.enabled);
      setIsVideoOff(!isVideoOff);
      setAnnouncement(isVideoOff ? "Kamera diaktifkan." : "Kamera dimatikan.");
    }
  };

  const leaveRoom = () => {
    localStream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    socketRef.current?.disconnect();
    if (meetingDetails) {
      router.push(`/masyarakat?ratedMeetingId=${roomId}&dewanId=${meetingDetails.dewan_id}`);
    } else {
      router.push("/masyarakat");
    }
  };

  return (
    <div className="flex flex-col bg-slate-950 text-white min-h-screen relative overflow-hidden">
      <div aria-live="polite" className="sr-only">{announcement}</div>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse"></div>
      </div>

      <header className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-primary/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-primary/20">
            <Video size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
              Live <span className="text-gradient">Session</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ruang Aspirasi #{roomId}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-3xl px-6 py-3 rounded-2xl border border-white/10">
          <Clock size={16} className="text-secondary" />
          <span className="text-xs font-black tracking-widest uppercase">00:15:30</span>
        </div>
      </header>

      <main className="relative z-10 flex-grow px-6 md:px-10 flex flex-col items-center justify-center mb-32">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Main Video View (Remote or Waiting) */}
          <div className="relative group rounded-[3rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl transition-all aspect-video">
            {Array.from(remoteStreams.entries()).length > 0 ? (
              Array.from(remoteStreams.entries()).map(([id, stream]) => (
                <div key={id} className="w-full h-full relative">
                  <VideoPlayer stream={stream} label="Anggota Dewan" />
                  <div className="absolute bottom-10 left-10 bg-black/60 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                    <span className="text-sm font-black tracking-tight">Anggota Dewan Jabar</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                  <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center border border-primary/20 relative z-10">
                    <Clock size={40} className="text-primary" />
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-3">Menunggu Peserta Lain…</h3>
                <p className="text-slate-400 font-bold max-w-sm mx-auto text-sm md:text-base">Aspirasi Anda segera didengar. Mohon tidak meninggalkan ruangan ini.</p>
              </div>
            )}
            
            {/* Status Overlays */}
            <div className={`absolute top-10 right-10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md ${
              remoteStreams.size > 0 ? 'bg-secondary/20 text-secondary' : 'bg-amber-500/20 text-amber-500'
            }`}>
              {remoteStreams.size > 0 ? 'Tersambung' : 'Menunggu Panggilan'}
            </div>
          </div>

          {/* Local Video View */}
          <div className="relative group rounded-[3rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl transition-all aspect-video">
            <VideoPlayer stream={localStream} muted={true} label="Anda" />
            <div className="absolute bottom-10 left-10 bg-black/60 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-black tracking-tight">Kamera Anda</span>
            </div>
            {isVideoOff && (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <div className="p-8 bg-white/5 rounded-full border border-white/10">
                  <VideoOff size={48} className="text-slate-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Control Bar */}
      <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-1000">
        <div className="bg-slate-900/60 backdrop-blur-3xl px-10 py-6 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-10">
          <button
            onClick={toggleMute}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95 group relative ${
              isMuted ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </button>

          <button
            onClick={toggleVideo}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95 group relative ${
              isVideoOff ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              {isVideoOff ? 'Kamera ON' : 'Kamera OFF'}
            </span>
          </button>

          <div className="w-[1px] h-12 bg-white/10"></div>

          <button
            onClick={leaveRoom}
            className="px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-3xl transition-all shadow-xl shadow-red-600/20 active:scale-90 flex items-center gap-3 group"
          >
            <PhoneOff size={24} />
            <span className="text-lg tracking-tight">Selesai Sesi</span>
          </button>
        </div>
      </footer>
    </div>
  );
}