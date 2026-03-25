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
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Clock, Video, Users, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RoomPage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const router = useRouter();
  
  const { user, token: authToken } = useAuth();
  const [token, setToken] = useState("");
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  
  const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://localhost:7880";

  useEffect(() => {
    const initRoom = async () => {
      if (!authToken || !user) return;
      
      try {
        const detailsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/schedules`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        
        if (detailsRes.ok) {
            const allSchedules = await detailsRes.json();
            const currentSchedule = allSchedules.find((s: any) => s.id === Number(roomId) || s.id.toString() === roomId);
            if (currentSchedule) {
                setMeetingDetails(currentSchedule);
            } else if (allSchedules.length > 0) {
                setMeetingDetails(allSchedules[0]);
            }
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/livekit/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                roomName: roomId,
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
  }, [roomId, authToken, user]);

  if (token === "") {
    return (
      <div className="flex flex-col flex-grow p-6 min-h-screen items-center justify-center">
        <div className="flex flex-col items-center border border-border rounded-xl p-10 bg-card">
          <Loader2 size={28} className="text-primary animate-spin mb-4" />
          <p className="font-semibold text-sm">Ketemu Dewan</p>
          <p className="text-muted-foreground text-xs mt-1">Menyiapkan koneksi...</p>
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
      <ProtectedRoute>
        <div className="flex flex-col flex-grow min-h-screen items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            <header className="mb-6 text-center">
              <p className="text-xs font-medium text-primary tracking-wide uppercase mb-1">Konfigurasi Media</p>
              <h2 className="text-2xl font-bold tracking-tight">
                Siap untuk Bergabung?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Pastikan kamera dan mikrofon Anda berfungsi.</p>
            </header>

            <div className="border border-border rounded-xl p-6 bg-card">
              <button 
                onClick={() => setIsJoined(true)}
                className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors text-sm"
              >
                Masuk ke Ruang Pertemuan
              </button>
            </div>

            <button 
              onClick={() => router.back()}
              className="mt-4 mx-auto flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
            >
              <ArrowLeft size={14} />
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        {/* Room Header */}
        <header className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border">
          <div className="flex items-center gap-3">
            <Video size={18} className="text-primary" />
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                Live Session
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <p className="text-xs text-muted-foreground">Ruang #{roomId}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-xs font-medium text-muted-foreground">
            <Clock size={14} />
            Pertemuan Sedang Berjalan
          </div>
        </header>

        {/* Video Area */}
        <main className="flex-grow px-4 sm:px-6 py-4 flex overflow-hidden">
          <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4 h-full">
            <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl={liveKitUrl}
                onDisconnected={handleDisconnected}
                className="flex flex-col lg:flex-row w-full gap-4"
            >
                <div className="flex-grow flex flex-col min-h-[50vh]">
                  <div className="flex-grow rounded-lg overflow-hidden border border-border bg-muted">
                    <VideoConference />
                  </div>
                </div>

                <div className="w-full lg:w-[360px] flex flex-col gap-3 h-full">
                  <div className="flex-grow flex flex-col rounded-lg overflow-hidden border border-border bg-card">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-primary" />
                        <span className="font-medium text-xs">Diskusi Live</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                        Aktif
                      </span>
                    </div>
                    <div className="flex-grow overflow-hidden p-2">
                      <Chat />
                    </div>
                  </div>

                  <div className="rounded-lg p-3 border border-border bg-card flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                      <Users size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium">Peserta</p>
                      <p className="text-xs font-medium">Terhubung Secara Aman</p>
                    </div>
                  </div>
                </div>

                <RoomAudioRenderer />
            </LiveKitRoom>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}