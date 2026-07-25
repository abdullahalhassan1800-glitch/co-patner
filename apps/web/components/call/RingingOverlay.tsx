"use client";

import { OnlineUser, getCountryFlag, getCountryName } from "@/lib/data/mockUsers";

interface RingingOverlayProps {
  user: OnlineUser;
  mode: "audio" | "video";
  onAccept: () => void;
  onReject: () => void;
}

export default function RingingOverlay({ user, mode, onAccept, onReject }: RingingOverlayProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/[0.08] rounded-full blur-[200px] animate-orb" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-secondary/[0.06] rounded-full blur-[180px] animate-orb" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative text-center animate-scale-in">
        {/* Pulsing rings behind avatar */}
        <div className="relative mx-auto w-36 h-36 mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse-ring" style={{ animationDelay: "0.6s" }} />
          <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-pulse-ring" style={{ animationDelay: "1.2s" }} />

          <img
            src={user.avatar}
            alt={user.name}
            className="relative w-36 h-36 rounded-full object-cover ring-4 ring-primary/40 shadow-2xl shadow-primary/30"
          />
        </div>

        {/* Name */}
        <h2 className="text-2xl font-black text-white mb-1">{user.name}, {user.age}</h2>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-2">
          <span>{getCountryFlag(user.country)}</span>
          <span>{getCountryName(user.country)}</span>
        </div>

        {/* Ringing text */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="text-primary-light font-semibold text-sm uppercase tracking-wider">
            {mode === "video" ? "Video" : "Audio"} Calling
          </span>
          <div className="dots">
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-6">
          {/* Reject */}
          <button
            onClick={onReject}
            className="w-16 h-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center hover:bg-accent/30 hover:border-accent/50 transition-all duration-300 active:scale-90 shadow-lg shadow-accent/20"
          >
            <svg className="w-7 h-7 text-accent-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>

          {/* Accept */}
          <button
            onClick={onAccept}
            className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 active:scale-90 shadow-lg shadow-emerald-500/20 animate-pulse-ring"
          >
            {mode === "video" ? (
              <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
