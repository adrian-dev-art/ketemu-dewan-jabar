"use client";

import { useEffect, useRef, useState } from "react";
import { Video, VideoOff, Mic, MicOff, Shield, Radio, ArrowLeft } from "lucide-react";

interface PreJoinProps {
  onJoin: (videoEnabled: boolean, audioEnabled: boolean) => void;
  onBack: () => void;
}

export default function PreJoinComponent({ onJoin, onBack }: PreJoinProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function setupMedia() {
      if (!videoEnabled) {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
        return;
      }

      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setStream(newStream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setVideoEnabled(false);
      }
    }

    setupMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoEnabled]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  return (
    <div className="room-loading-screen">
      <div className="w-full max-w-lg px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-5 shadow-sm">
            <Video size={16} className="text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.1em]">
              Konfigurasi Media
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight font-outfit">Siap untuk Bergabung?</h2>
          <p className="text-sm text-white/50 mt-2 font-medium">Pastikan kamera dan mikrofon Anda berfungsi dengan baik.</p>
        </div>

        {/* Card */}
        <div className="room-prejoin-card rounded-3xl p-8 bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl">
          {/* Preview Area */}
          <div className="aspect-video rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-8 overflow-hidden relative shadow-inner">
            {videoEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror-mode"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-white/20">
                <VideoOff size={40} />
                <span className="text-xs font-medium">Kamera Dimatikan</span>
              </div>
            )}

            {/* Floating Quick Toggles over video */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                  audioEnabled ? "bg-white/10 text-white" : "bg-red-500/80 text-white"
                }`}
              >
                {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                  videoEnabled ? "bg-white/10 text-white" : "bg-red-500/80 text-white"
                }`}
              >
                {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
            </div>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <div
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all duration-300 ${
                audioEnabled
                  ? "bg-primary/20 border-primary/30 text-primary shadow-sm shadow-primary/10"
                  : "bg-white/[0.05] border-white/[0.06] text-white/30"
              }`}
            >
              {audioEnabled ? <Mic size={14} /> : <MicOff size={14} />}
              <span className="text-[11px] font-bold tracking-tight">{audioEnabled ? "Mikrofon Aktif" : "Mikrofon Bisukan"}</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all duration-300 ${
                videoEnabled
                  ? "bg-primary/20 border-primary/30 text-primary shadow-sm shadow-primary/10"
                  : "bg-white/[0.05] border-white/[0.06] text-white/30"
              }`}
            >
              {videoEnabled ? <Video size={14} /> : <VideoOff size={14} />}
              <span className="text-[11px] font-bold tracking-tight">{videoEnabled ? "Kamera Aktif" : "Kamera Mati"}</span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.06] text-white/40">
              <Shield size={14} className="text-primary" />
              <span className="text-[11px] font-bold tracking-tight">Koneksi Aman</span>
            </div>
          </div>

          {/* Join Button */}
          <button onClick={() => onJoin(videoEnabled, audioEnabled)} className="room-join-btn">
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Radio size={16} />
              Masuk ke Ruang Pertemuan
            </span>
          </button>
        </div>

        {/* Back link */}
        <button
          onClick={onBack}
          className="mt-6 mx-auto flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-xs font-medium"
        >
          <ArrowLeft size={14} />
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}
