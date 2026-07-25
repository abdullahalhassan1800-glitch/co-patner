"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { OnlineUser, getCountryFlag } from "@/lib/data/mockUsers";
import { deductCredits, RATE_AUDIO, RATE_VIDEO, getCredits } from "@/lib/credits";

interface CallOverlayProps {
  user: OnlineUser;
  mode: "audio" | "video";
  onEndCall: () => void;
}

export default function CallOverlay({ user, mode, onEndCall }: CallOverlayProps) {
  const [seconds, setSeconds] = useState(0);
  const [cost, setCost] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(getCredits());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rate = mode === "video" ? RATE_VIDEO : RATE_AUDIO;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        const newS = s + 1;
        const newCost = Math.floor(newS / 60) * rate;
        if (newCost > cost) {
          setCost(newCost);
          deductCredits(rate);
          setCurrentCredits(getCredits());
        }
        return newS;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [rate, cost]);

  const formatTime = useCallback((totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  const handleEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onEndCall();
  };

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-black">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[200px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-secondary/[0.03] rounded-full blur-[180px]" />
      </div>

      {/* Main video area */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Partner video (full screen placeholder) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {mode === "video" && !isVideoOff ? (
            <div className="w-full h-full bg-[#0a0a14] flex items-center justify-center">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-full bg-[#0a0a14] flex items-center justify-center">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/30"
              />
            </div>
          )}
        </div>

        {/* Self video (PiP) */}
        {mode === "video" && !isVideoOff && (
          <div className="absolute top-5 right-5 w-28 h-40 rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10 bg-[#0a0a14]">
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
        )}

        {/* Top bar - user info + timer */}
        <div className="absolute top-0 left-0 right-0 p-5 flex items-start justify-between z-20 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/30"
            />
            <div>
              <h3 className="text-white font-bold text-sm">{user.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span>{getCountryFlag(user.country)}</span>
                <span>{user.age}</span>
                <span className="text-gray-600">·</span>
                <span className="text-primary-light font-medium">{mode === "video" ? "Video" : "Audio"}</span>
              </div>
            </div>
          </div>

          {/* Timer + cost */}
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-white font-mono font-bold text-lg tabular-nums">{formatTime(seconds)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs justify-end">
              <svg className="w-3 h-3 text-primary-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              <span className="text-primary-light font-semibold">₹{cost}</span>
              <span className="text-gray-600">·</span>
              <span className="text-gray-500">Balance: ₹{currentCredits}</span>
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-center gap-5 z-20 bg-gradient-to-t from-black/60 to-transparent">
          {/* Mute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
              isMuted
                ? "bg-accent/20 border border-accent/30"
                : "bg-white/10 border border-white/10 hover:bg-white/15"
            }`}
          >
            {isMuted ? (
              <svg className="w-6 h-6 text-accent-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.49-.34 2.17" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>

          {/* Video toggle (only for video mode) */}
          {mode === "video" && (
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
                isVideoOff
                  ? "bg-accent/20 border border-accent/30"
                  : "bg-white/10 border border-white/10 hover:bg-white/15"
              }`}
            >
              {isVideoOff ? (
                <svg className="w-6 h-6 text-accent-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              )}
            </button>
          )}

          {/* Speaker */}
          <button className="w-14 h-14 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all duration-300 active:scale-90">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </button>

          {/* End call */}
          <button
            onClick={() => setShowEndConfirm(true)}
            className="w-16 h-16 rounded-full bg-accent flex items-center justify-center hover:bg-accent-light transition-all duration-300 active:scale-90 shadow-lg shadow-accent/30"
          >
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>
      </div>

      {/* End confirm dialog */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-3xl p-6 mx-4 max-w-sm w-full animate-scale-in shadow-2xl">
            <h3 className="text-lg font-bold text-white text-center mb-2">End Call?</h3>
            <p className="text-sm text-gray-400 text-center mb-5">
              Call duration: {formatTime(seconds)} · Cost: ₹{cost}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-3 rounded-2xl btn-ghost text-sm font-semibold text-gray-400 hover:text-white"
              >
                Continue
              </button>
              <button
                onClick={handleEnd}
                className="flex-1 py-3 rounded-2xl bg-accent text-white text-sm font-bold hover:bg-accent-light transition-all"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
