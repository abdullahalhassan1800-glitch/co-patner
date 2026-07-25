"use client";

import { useState, useEffect } from "react";
import { OnlineUser, getCountryFlag, getCountryName } from "@/lib/data/mockUsers";
import { getCredits, RATE_AUDIO, RATE_VIDEO, hasEnoughCredits } from "@/lib/credits";

interface ConnectModalProps {
  user: OnlineUser;
  onClose: () => void;
  onAction: (mode: "text" | "audio" | "video") => void;
}

const GUIDELINES = [
  { allowed: true, text: "You are connecting for a topic-based conversation." },
  { allowed: true, text: "Conversations must remain within the platform." },
  { allowed: false, text: "Sharing contact details or social media is not allowed." },
  { allowed: false, text: "Offline meetings are strictly prohibited." },
  { allowed: false, text: "Inappropriate or explicit behaviour is not permitted." },
  { allowed: true, text: "This session may be monitored for safety." },
];

export default function ConnectModal({ user, onClose, onAction }: ConnectModalProps) {
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    setCredits(getCredits());
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-primary/[0.06] rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-secondary/[0.04] rounded-full blur-[140px]" />
      </div>

      <div className="relative w-full max-w-[400px] mx-4 animate-scale-in">
        <div className="glass-strong rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          {/* Profile Section */}
          <div className="relative px-6 pt-8 pb-6 text-center">
            {/* Avatar */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/30 shadow-xl shadow-primary/20"
              />
              {user.isOnline && (
                <div className="absolute bottom-1 right-1">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 ring-2 ring-[#12121e]" />
                  </span>
                </div>
              )}
            </div>

            {/* Name + Info */}
            <h2 className="text-xl font-black text-white mb-1">{user.name}, {user.age}</h2>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span>{getCountryFlag(user.country)}</span>
              <span>{getCountryName(user.country)}</span>
              <span className="text-gray-600">·</span>
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                <span className="text-white font-semibold">{user.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Interests */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {user.interests.slice(0, 3).map((interest) => (
                <span key={interest} className="px-2.5 py-1 rounded-full bg-white/[0.06] text-[11px] text-gray-400 font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 h-px bg-white/[0.06]" />

          {/* Guidelines */}
          <div className="px-6 py-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Guidelines</h3>
            <div className="space-y-2.5">
              {GUIDELINES.map((g, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    g.allowed ? "bg-emerald-500/20" : "bg-accent/20"
                  }`}>
                    {g.allowed ? (
                      <svg className="w-2.5 h-2.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg className="w-2.5 h-2.5 text-accent-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    )}
                  </div>
                  <span className="text-[13px] text-gray-400 leading-snug">{g.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 h-px bg-white/[0.06]" />

          {/* Action Buttons */}
          <div className="px-6 py-5">
            <div className="grid grid-cols-3 gap-3">
              {/* Chat - Free */}
              <button
                onClick={() => onAction("text")}
                className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 group active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Chat</p>
                  <p className="text-[10px] text-emerald-400 font-medium">Free</p>
                </div>
              </button>

              {/* Audio Call */}
              <button
                onClick={() => onAction("audio")}
                className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all duration-300 group active:scale-95 ${
                  hasEnoughCredits(RATE_AUDIO)
                    ? "bg-primary/10 border-primary/20 hover:bg-primary/20 hover:border-primary/40"
                    : "bg-white/[0.03] border-white/[0.06] opacity-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  hasEnoughCredits(RATE_AUDIO) ? "bg-primary/20 group-hover:bg-primary/30" : "bg-white/[0.06]"
                }`}>
                  <svg className="w-5 h-5 text-primary-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Audio Call</p>
                  <p className="text-[10px] text-primary-light font-medium">₹{RATE_AUDIO}/min</p>
                </div>
              </button>

              {/* Video Call */}
              <button
                onClick={() => onAction("video")}
                className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all duration-300 group active:scale-95 ${
                  hasEnoughCredits(RATE_VIDEO)
                    ? "bg-secondary/10 border-secondary/20 hover:bg-secondary/20 hover:border-secondary/40"
                    : "bg-white/[0.03] border-white/[0.06] opacity-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  hasEnoughCredits(RATE_VIDEO) ? "bg-secondary/20 group-hover:bg-secondary/30" : "bg-white/[0.06]"
                }`}>
                  <svg className="w-5 h-5 text-secondary-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Video Call</p>
                  <p className="text-[10px] text-secondary-light font-medium">₹{RATE_VIDEO}/min</p>
                </div>
              </button>
            </div>

            {/* Credits */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              <span>Your Credits: <span className="text-white font-bold">{credits}</span></span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
