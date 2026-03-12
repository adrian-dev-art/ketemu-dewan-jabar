"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import VideoPlayer from "../../../components/VideoPlayer";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function RoomPage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const router = useRouter();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [meetingDetails, setMeetingDetails] = useState<any>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000");
    const socket = socketRef.current;

    const initMedia = async () => {
      try {
        console.log("Memulai inisialisasi media...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);

        const detailsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/schedules`);
        const allSchedules = await detailsRes.json();

        peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);
        const pc = peerConnectionRef.current;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event: RTCTrackEvent) => {
          setRemoteStream(event.streams[0]);
          setAnnouncement("Video pengguna lain telah terhubung.");
        };

        pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
          if (event.candidate) {
            socket.emit("ice-candidate", { target: roomId, candidate: event.candidate });
          }
        };

        socket.emit("join-room", roomId, socket.id);
        setAnnouncement(`Berhasil masuk ke ruangan ${roomId}`);

        socket.on("user-connected", async (userId: string, targetSocketId: string) => {
          setAnnouncement("Pengguna baru telah bergabung.");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { target: targetSocketId, caller: socket.id, sdp: offer });
        });

        socket.on("offer", async (payload: any) => {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { target: payload.caller, sdp: answer });
        });

        socket.on("answer", async (payload: any) => {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        });

        socket.on("ice-candidate", async (payload: any) => {
          try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch (e) { }
        });

        socket.on("user-disconnected", () => {
          setAnnouncement("Pengguna lain telah meninggalkan ruangan.");
          setRemoteStream(null);
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
      peerConnectionRef.current?.close();
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
    <div className="flex flex-col flex-grow bg-slate-950 p-4">
      <div aria-live="polite" className="sr-only">{announcement}</div>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr items-center max-w-6xl w-full mx-auto">
        <VideoPlayer stream={localStream} muted={true} label="Anda" />
        {remoteStream ? (
          <VideoPlayer stream={remoteStream} label="Pengguna Lain" />
        ) : (
          <div className="flex flex-col items-center justify-center bg-slate-800 rounded-lg aspect-video shadow-md border border-slate-700">
            <div className="animate-pulse w-12 h-12 bg-slate-600 rounded-full mb-4"></div>
            <p className="text-slate-300 font-medium">Menunggu orang lain bergabung...</p>
          </div>
        )}
      </div>

      <div className="mt-8 mb-4 flex justify-center gap-6">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-100'} transition-colors focus:ring-4 focus:ring-blue-500 focus:outline-none shadow-lg`}
          aria-label={isMuted ? "Aktifkan Mikrofon" : "Matikan Mikrofon"}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-100'} transition-colors focus:ring-4 focus:ring-blue-500 focus:outline-none shadow-lg`}
          aria-label={isVideoOff ? "Aktifkan Kamera" : "Matikan Kamera"}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>
        <button
          onClick={leaveRoom}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors focus:ring-4 focus:ring-red-400 focus:outline-none shadow-lg"
          aria-label="Tinggalkan Pertemuan"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
}