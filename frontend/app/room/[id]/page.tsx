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
    <div className="flex flex-col flex-grow bg-slate-50 p-6 min-h-screen">
      <div aria-live="polite" className="sr-only">{announcement}</div>

      <header className="mb-8 flex justify-between items-center max-w-7xl w-full mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <div className="w-2 h-6 bg-primary rounded-full"></div>
          Ruang Pertemuan Online #{roomId}
        </h2>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-border shadow-sm">
          <Clock size={16} className="text-primary" />
          <span>Sesi Aktif</span>
        </div>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr items-center max-w-7xl w-full mx-auto">
        <div className="premium-card overflow-hidden aspect-video relative group">
          <VideoPlayer stream={localStream} muted={true} label="Anda (Lokal)" />
          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg font-bold">
            Anda
          </div>
        </div>
        
        {Array.from(remoteStreams.entries()).map(([id, stream]) => (
          <div key={id} className="premium-card overflow-hidden aspect-video relative group border-2 border-primary/10">
            <VideoPlayer stream={stream} label={`Peserta ${id.slice(0, 4)}`} />
            <div className="absolute bottom-4 left-4 bg-primary/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg font-bold">
              Anggota Dewan
            </div>
          </div>
        ))}

        {remoteStreams.size === 0 && (
          <div className="flex flex-col items-center justify-center bg-white rounded-3xl aspect-video shadow-sm border border-border group">
            <div className="relative">
              <div className="animate-ping absolute inset-0 w-16 h-16 bg-primary/20 rounded-full"></div>
              <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Clock className="text-primary" size={32} />
              </div>
            </div>
            <p className="text-gray-500 font-bold mt-4">Menunggu Anggota Dewan bergabung...</p>
            <p className="text-gray-400 text-xs mt-2">Pastikan koneksi internet Anda stabil</p>
          </div>
        )}
      </div>

      <div className="mt-12 flex justify-center items-center gap-8 pb-4">
        <button
          onClick={toggleMute}
          className={`p-5 rounded-2xl transition-all shadow-lg active:scale-95 ${
            isMuted ? 'bg-red-500 text-white shadow-red-200' : 'bg-white text-gray-700 border border-border hover:bg-gray-50'
          }`}
          aria-label={isMuted ? "Aktifkan Mikrofon" : "Matikan Mikrofon"}
        >
          {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
        </button>
        
        <button
          onClick={leaveRoom}
          className="p-6 rounded-3xl bg-red-600 text-white transition-all shadow-xl shadow-red-200 hover:bg-red-700 active:scale-90 flex items-center gap-3"
          aria-label="Tinggalkan Pertemuan"
        >
          <PhoneOff size={32} />
          <span className="font-bold text-lg pr-2">Selesai</span>
        </button>

        <button
          onClick={toggleVideo}
          className={`p-5 rounded-2xl transition-all shadow-lg active:scale-95 ${
            isVideoOff ? 'bg-red-500 text-white shadow-red-200' : 'bg-white text-gray-700 border border-border hover:bg-gray-50'
          }`}
          aria-label={isVideoOff ? "Aktifkan Kamera" : "Matikan Kamera"}
        >
          {isVideoOff ? <VideoOff size={28} /> : <Video size={28} />}
        </button>
      </div>
    </div>
  );
}