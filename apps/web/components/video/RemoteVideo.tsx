"use client";

import { useEffect, useRef } from "react";
import { Partner } from "@/types";

interface RemoteVideoProps {
  stream: MediaStream | null;
  partner: Partner | null;
}

export default function RemoteVideo({ stream, partner }: RemoteVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  const getFlag = (code: string) => {
    const f: Record<string, string> = { IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", FR: "🇫🇷", JP: "🇯🇵", BR: "🇧🇷", AU: "🇦🇺", CA: "🇨🇦" };
    return f[code] || "🌍";
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-surface-dark">
      {stream ? (
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-dark">
          <div className="text-center">
            {partner?.avatar && partner.avatar !== "/default-avatar.png" ? (
              <img
                src={partner.avatar}
                alt={partner.name || "partner"}
                className="w-28 h-28 rounded-3xl object-cover ring-2 ring-primary/30 shadow-2xl shadow-primary/20 mx-auto mb-5"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl gradient-glow flex items-center justify-center text-4xl font-black text-white mx-auto mb-5 shadow-2xl shadow-primary/15">
                {partner?.name?.charAt(0) || "?"}
              </div>
            )}
            <div className="flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <p className="text-gray-400 text-xs font-medium">Connecting...</p>
            </div>
          </div>
        </div>
      )}
      {partner && (
        <div className="absolute bottom-3 left-3 px-4 py-2 rounded-xl glass">
          <span className="text-sm font-bold text-white">{partner.name}, {partner.age}</span>
          <span className="ml-2 text-sm">{getFlag(partner.country)}</span>
        </div>
      )}
    </div>
  );
}
