"use client";

import { useState } from "react";
import { OnlineUser, getCountryFlag, getCountryName } from "@/lib/data/mockUsers";
import { RATE_AUDIO, RATE_VIDEO } from "@/lib/credits";

interface CallSummaryProps {
  user: OnlineUser;
  mode: "audio" | "video";
  duration: number;
  cost: number;
  onDone: () => void;
  onAddFriend: () => void;
  onReport: () => void;
}

export default function CallSummary({ user, mode, duration, cost, onDone, onAddFriend, onReport }: CallSummaryProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-primary/[0.06] rounded-full blur-[200px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] bg-secondary/[0.04] rounded-full blur-[180px]" />
      </div>

      <div className="relative w-full max-w-[380px] mx-4 animate-scale-in">
        <div className="glass-strong rounded-3xl p-7 shadow-2xl shadow-black/50 text-center">

          {/* Avatar */}
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4 ring-4 ring-primary/30"
          />

          <h2 className="text-xl font-black text-white mb-1">Call Ended</h2>
          <p className="text-sm text-gray-400 mb-6">with {user.name}, {user.age} {getCountryFlag(user.country)}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass rounded-2xl p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Duration</p>
              <p className="text-white font-bold text-sm">{formatTime(duration)}</p>
            </div>
            <div className="glass rounded-2xl p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Type</p>
              <p className="text-white font-bold text-sm capitalize">{mode}</p>
            </div>
            <div className="glass rounded-2xl p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Cost</p>
              <p className="text-primary-light font-bold text-sm">₹{cost}</p>
            </div>
          </div>

          {/* Rate */}
          <p className="text-xs text-gray-500 mb-3">Rate your experience</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                className="transition-transform duration-200 hover:scale-110 active:scale-95"
              >
                <svg
                  className={`w-8 h-8 ${(hoveredStar || rating) >= star ? "text-yellow-400" : "text-gray-700"} transition-colors`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            <button
              onClick={onAddFriend}
              className="w-full py-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary-light text-sm font-bold hover:bg-primary/20 hover:border-primary/40 transition-all duration-300 active:scale-[0.98]"
            >
              Add as Friend
            </button>
            <button
              onClick={onReport}
              className="w-full py-3 rounded-2xl glass text-gray-400 text-sm font-semibold hover:text-white hover:bg-white/[0.06] transition-all duration-300 active:scale-[0.98]"
            >
              Report User
            </button>
            <button
              onClick={onDone}
              className="w-full py-3 rounded-2xl btn-glow text-white text-sm font-bold shadow-xl shadow-primary/20 active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
