"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Clock, Video } from "lucide-react";

export default function RoomPage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const router = useRouter();
  
  const [token, setToken] = useState("");
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  
  // Hardcoded server URL from env fallback
  const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://localhost:7880";

  useEffect(() => {
    const initRoom = async () => {
      try {
        // Find existing schedule locally to get meeting details (simulated since user ID isn't directly passed here easily)
        const detailsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/schedules`);
        const allSchedules = await detailsRes.json();
        // Just grab the first one for the demo/fallback if needed, or if an ID matched
        if (allSchedules && allSchedules.length > 0) {
            setMeetingDetails(allSchedules[0]);
        }

        // We use a mock participant name for now since we don't haveauth context in this component
        // Typically you'd get this from your user session
        const participantName = `User_${Math.floor(Math.random() * 1000)}`;

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/livekit/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                roomName: roomId,
                participantName: participantName
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch token: ${response.statusText}`);
        }

        const data = await response.json();
        setToken(data.token);

      } catch (e) {
        console.error("Failed to initialize LiveKit room", e);
      }
    };

    initRoom();
  }, [roomId]);

  if (token === "") {
    return (
        <div className="flex flex-col flex-grow bg-slate-950 p-6 min-h-screen items-center justify-center relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center bg-white/5 backdrop-blur-3xl rounded-3xl p-12 shadow-2xl border border-white/10">
                <div className="relative mb-4">
                <div className="animate-ping absolute inset-0 w-16 h-16 bg-primary/20 rounded-full"></div>
                <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center transition-colors">
                    <Clock className="text-primary" size={32} />
                </div>
                </div>
                <p className="text-white font-black mt-4">Menyiapkan Ruangan...</p>
                <p className="text-slate-400 text-xs mt-2">Menghubungkan ke server media</p>
            </div>
        </div>
    );
  }

  const handleDisconnected = () => {
    if (meetingDetails) {
      router.push(`/masyarakat?ratedMeetingId=${roomId}&dewanId=${meetingDetails.dewanId || meetingDetails.dewan_id}`);
    } else {
      router.push("/masyarakat");
    }
  };

  return (
    <div className="flex flex-col bg-slate-950 text-white min-h-screen relative overflow-hidden">
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
          <span className="text-xs font-black tracking-widest uppercase">LiveKit Sesi Aktif</span>
        </div>
      </header>

      <main className="relative z-10 flex-grow px-6 md:px-10 flex flex-col items-center justify-center mb-10">
        <div className="w-full max-w-7xl h-[70vh] rounded-[3rem] overflow-hidden bg-slate-900/50 backdrop-blur-sm border border-white/5 shadow-2xl relative">
          <LiveKitRoom
              video={true}
              audio={true}
              token={token}
              serverUrl={liveKitUrl}
              onDisconnected={handleDisconnected}
              data-lk-theme="default"
              style={{ height: '100%', width: '100%' }}
          >
              <VideoConference />
              <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      </main>
    </div>
  );
}