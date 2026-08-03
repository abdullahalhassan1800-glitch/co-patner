"use client";

import { useState } from "react";
import VideoWatermark from "@/components/privacy/VideoWatermark";

interface LivePlayerProps {
  avatar: string;
  name: string;
  isLive: boolean;
}

export default function LivePlayer({ avatar, name, isLive }: LivePlayerProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="absolute inset-0 bg-black">
      <img
        src={avatar}
        alt={name}
        className={`w-full h-full object-cover transition-all duration-700 ${
          revealed ? "blur-none scale-100" : "blur-2xl scale-110"
        }`}
      />

      <VideoWatermark />
      {!revealed && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
          <button
            onClick={() => setRevealed(true)}
            className="flex flex-col items-center gap-4 group"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
              <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="text-center">
              <span className="text-sm text-white font-bold block">Tap to reveal</span>
              <span className="text-[11px] text-gray-400 mt-0.5 block">Preview available</span>
            </div>
          </button>
        </div>
      )}

      {revealed && (
        <div className="absolute top-4 right-4 z-10">
          <div className="px-2.5 py-1 rounded-full gradient-warm text-[10px] text-white font-bold uppercase tracking-wider">
            Pro View
          </div>
        </div>
      )}

      {isLive && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="text-[11px] text-accent-light font-bold uppercase tracking-wider">LIVE</span>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
    </div>
  );
}
