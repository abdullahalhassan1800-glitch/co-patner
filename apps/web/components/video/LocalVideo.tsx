"use client";

import { useEffect, useRef } from "react";

interface LocalVideoProps {
  stream: MediaStream | null;
  isCamOn: boolean;
}

export default function LocalVideo({ stream, isCamOn }: LocalVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-surface-dark">
      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
      {!isCamOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-dark">
          <div className="w-16 h-16 rounded-2xl gradient-glow flex items-center justify-center shadow-lg shadow-primary/20">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <span className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl glass text-[11px] font-semibold text-white/80">You</span>
        </div>
      )}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl glass text-[11px] font-semibold text-white/80">
        You
      </div>
    </div>
  );
}
