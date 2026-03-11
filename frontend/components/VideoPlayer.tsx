"use client";

import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  stream: MediaStream | null;
  muted?: boolean;
  label: string;
}

export default function VideoPlayer({ stream, muted = false, label }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-md border border-gray-800">
      {/* Accessibility Strategy: aria-label for screen readers to identify whose video stream it is */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
        aria-label={`Video stream for ${label}`}
      />
      <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm font-medium">
        {label}
      </div>
    </div>
  );
}