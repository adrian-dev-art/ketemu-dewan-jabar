"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  GridLayout,
  ParticipantTile
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { Clock } from "lucide-react";

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
        <div className="flex flex-col flex-grow bg-slate-50 p-6 min-h-screen items-center justify-center">
            <div className="flex flex-col items-center justify-center bg-white rounded-3xl p-12 shadow-sm border border-border">
                <div className="relative mb-4">
                <div className="animate-ping absolute inset-0 w-16 h-16 bg-primary/20 rounded-full"></div>
                <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center transition-colors">
                    <Clock className="text-primary" size={32} />
                </div>
                </div>
                <p className="text-gray-500 font-bold mt-4">Menyiapkan Ruangan...</p>
                <p className="text-gray-400 text-xs mt-2">Menghubungkan ke server media</p>
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
    <div className="flex flex-col flex-grow bg-slate-50 p-6 min-h-screen w-full">
      <header className="mb-4 flex justify-between items-center max-w-7xl w-full mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <div className="w-2 h-6 bg-primary rounded-full"></div>
          Ruang Pertemuan Online #{roomId}
        </h2>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-border shadow-sm">
          <Clock size={16} className="text-primary" />
          <span>LiveKit Sesi Aktif</span>
        </div>
      </header>

      <div className="flex-grow flex flex-col items-center bg-black rounded-xl overflow-hidden shadow-2xl relative w-full h-[80vh] max-h-[80vh] max-w-7xl mx-auto">
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={liveKitUrl}
            onDisconnected={handleDisconnected}
            // Use the default LiveKit styles
            data-lk-theme="default"
            style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}
        >
            {/* The VideoConference component handles grid layouts and active speaker */}
            <VideoConference />
            
            {/* Plays audio for other participants */}
            <RoomAudioRenderer />
            
            {/* Provide custom controls mapping to our leave handler if needed, but VideoConference includes them */}
        </LiveKitRoom>
      </div>
    </div>
  );
}