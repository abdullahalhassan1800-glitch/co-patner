"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnlineUser, getCountryFlag, getCountryName } from "@/lib/data/mockUsers";

interface HostProfileModalProps {
  user: OnlineUser;
  onClose: () => void;
  onConnect: () => void;
}

export default function HostProfileModal({ user, onClose, onConnect }: HostProfileModalProps) {
  const router = useRouter();
  const [showFull, setShowFull] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-primary/[0.06] rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-secondary/[0.04] rounded-full blur-[140px]" />
      </div>

      <div className="relative w-full max-w-[400px] mx-4 animate-scale-in">
        <div className="glass-strong rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          {/* Image Section */}
          <div className="relative h-[280px] overflow-hidden">
            <img
              src={user.avatar}
              alt={user.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                showFull ? "blur-none scale-100" : "blur-xl scale-110"
              }`}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#12121e] via-transparent to-transparent" />

            {/* Online indicator */}
            <div className="absolute top-4 left-4 z-10">
              {user.isOnline ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
                  <span className="w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Offline</span>
                </div>
              )}
            </div>

            {/* Blurred lock overlay */}
            {!showFull && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <button
                  onClick={() => setShowFull(true)}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <span className="text-xs text-white font-bold">Tap to reveal</span>
                </button>
              </div>
            )}

            {/* Pro badge */}
            {showFull && (
              <div className="absolute top-4 right-4 z-10">
                <div className="px-2.5 py-1 rounded-full gradient-warm text-[10px] text-white font-bold uppercase tracking-wider">
                  Pro
                </div>
              </div>
            )}

            {/* Name overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 z-10">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{user.name}</h2>
                <span className="text-lg">{getCountryFlag(user.country)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400 mt-0.5">
                <span>{user.age} years old</span>
                <span className="text-gray-600">·</span>
                <span>{getCountryName(user.country)}</span>
                <span className="text-gray-600">·</span>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  <span className="text-white font-semibold">{user.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content below */}
          <div className="px-5 py-5">

            {/* Limited info (always visible) */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">About</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {user.bio || `${user.name} is a ${user.age}-year-old from ${getCountryName(user.country)}. Loves ${user.interests.slice(0, 2).join(" and ").toLowerCase()}.`}
              </p>
            </div>

            {/* Interests */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Interests</h3>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((interest) => (
                  <span key={interest} className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.06] text-xs text-gray-400 font-medium">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Pro blur content */}
            {!showFull && (
              <div className="relative mb-4">
                <div className="blur-sm select-none pointer-events-none">
                  <div className="glass rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-white/10" />
                      <div className="space-y-1.5">
                        <div className="w-24 h-3 rounded bg-white/10" />
                        <div className="w-16 h-2.5 rounded bg-white/[0.06]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-3 rounded bg-white/[0.06]" />
                      <div className="w-3/4 h-3 rounded bg-white/[0.06]" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => router.push("/settings")}
                    className="px-5 py-2.5 rounded-xl gradient-warm text-xs font-bold text-white shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all duration-300 active:scale-95 flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {user.tags.map((tag) => (
                <span key={tag} className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  tag === "Top Rated" ? "gradient-warm text-white" :
                  tag === "New" ? "bg-primary/80 text-white" :
                  tag === "Popular" ? "bg-secondary/80 text-white" :
                  "bg-white/[0.08] text-gray-400"
                }`}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06] mb-5" />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onConnect}
                className="py-3.5 rounded-2xl gradient-main text-sm font-bold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98]"
              >
                Connect Now
              </button>
              <button
                onClick={onClose}
                className="py-3.5 rounded-2xl btn-ghost text-sm font-semibold text-gray-400 hover:text-white transition-all duration-300 active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
