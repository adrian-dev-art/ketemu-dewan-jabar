"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  Chat,
  ControlBar,
  LayoutContextProvider,
  ParticipantLoop,
  ParticipantTile,
  GridLayout,
  PreJoin,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Clock, Video, Users, MessageSquare, ArrowRight } from "lucide-react";

export default function RoomPage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const router = useRouter();
  
  const [token, setToken] = useState("");
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  
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
        <div className="flex flex-col flex-grow bg-background p-6 min-h-screen items-center justify-center relative overflow-hidden transition-colors duration-500">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center glass rounded-[3rem] p-16 shadow-2xl border border-border">
                <div className="relative mb-6">
                  <div className="animate-ping absolute inset-0 w-20 h-20 bg-primary/20 rounded-full"></div>
                  <div className="relative w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center border border-primary/20">
                      <Video size={40} className="animate-pulse" />
                  </div>
                </div>
                <p className="text-slate-900 dark:text-white font-black text-2xl tracking-tighter">Ketemu Dewan</p>
                <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 text-sm">Menyiapkan enkripsi media...</p>
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

  if (!isJoined) {
    return (
      <div className="flex flex-col flex-grow bg-background text-foreground transition-colors duration-500 min-h-screen items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-30">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl animate-in zoom-in-95 duration-700">
          <header className="mb-12 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20">
              Konfigurasi Media
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Siap untuk <span className="text-gradient">Bergabung?</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold">Pastikan kamera dan mikrofon Anda berfungsi dengan baik.</p>
          </header>

          <div className="glass rounded-[3rem] overflow-hidden border border-border bg-white/5 dark:bg-black/20 backdrop-blur-3xl shadow-2xl p-8 md:p-12">
            <PreJoin
              onJoin={() => setIsJoined(true)}
              defaults={{
                videoEnabled: true,
                audioEnabled: true,
              }}
              className="text-slate-900 dark:text-white"
            />
          </div>

          <button 
            onClick={() => router.back()}
            className="mt-12 mx-auto flex items-center gap-3 text-slate-500 hover:text-primary transition-all font-black text-xs uppercase tracking-widest"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background text-foreground min-h-screen relative overflow-hidden transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse"></div>
      </div>

      <header className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-primary/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
            <Video size={28} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
              Live <span className="text-gradient">Session</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
              <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.25em]">Ruang Aspirasi Digital #{roomId}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 glass px-8 py-4 rounded-2xl border border-border shadow-xl">
          <Clock size={20} className="text-secondary" />
          <span className="text-xs font-black tracking-[0.2em] uppercase text-slate-600 dark:text-slate-300">Pertemuan Sedang Berjalan</span>
        </div>
      </header>

      <main className="relative z-10 flex-grow px-6 md:px-10 flex mb-10 overflow-hidden">
        <div className="w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8 h-full">
          <LiveKitRoom
              video={true}
              audio={true}
              token={token}
              serverUrl={liveKitUrl}
              onDisconnected={handleDisconnected}
              className="flex flex-col lg:flex-row w-full gap-8"
          >
              {/* Left Side: Video Grid */}
              <div className="flex-grow flex flex-col gap-6 h-full min-h-[50vh]">
                <div className="flex-grow glass rounded-[3rem] overflow-hidden border border-border shadow-2xl relative bg-slate-900/40 dark:bg-black/40">
                  <VideoConference 
                    chatMessageFormatter={(msg) => msg} // Basic formatter
                    SettingsMenu={null} // We'll use our own or style it later
                  />
                </div>
              </div>

              {/* Right Side: Chat & Participants Panel (Premium Sidebar) */}
              <div className="w-full lg:w-[400px] flex flex-col gap-8 h-full">
                <div className="flex-grow flex flex-col glass rounded-[3rem] overflow-hidden border border-border shadow-2xl bg-white/5 dark:bg-black/20 backdrop-blur-3xl">
                  {/* Sidebar Header */}
                  <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare size={18} className="text-primary" />
                      <span className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">Diskusi Live</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                      Aktif
                    </div>
                  </div>
                  
                  {/* Chat Component */}
                  <div className="flex-grow overflow-hidden p-2">
                    <Chat />
                  </div>
                </div>

                {/* Participant Mini-Panel */}
                <div className="glass rounded-[2rem] p-6 border border-border flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center border border-secondary/20">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Peserta</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">Terhubung Secara Aman</p>
                    </div>
                  </div>
                </div>
              </div>

              <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      </main>
    </div>
  );
}