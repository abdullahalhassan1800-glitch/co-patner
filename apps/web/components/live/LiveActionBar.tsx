"use client";

import { useState } from "react";
import GiftPanel from "./GiftPanel";
import { getCredits } from "@/lib/credits";

interface LiveActionBarProps {
  onChatFree: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  onBack: () => void;
}

export default function LiveActionBar({ onChatFree, onAudioCall, onVideoCall, onBack }: LiveActionBarProps) {
  const [showGifts, setShowGifts] = useState(false);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4">
      {/* Gift panel */}
      <GiftPanel
        isOpen={showGifts}
        onClose={() => setShowGifts(false)}
        onSendGift={() => {}}
      />

      {/* Action bar */}
      <div className="glass-strong rounded-2xl px-4 py-3 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-2.5">
          {/* Back button */}
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all duration-300 active:scale-90 shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          {/* Chat Free */}
          <button
            onClick={onChatFree}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 active:scale-95"
          >
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <span className="text-[10px] text-emerald-400 font-bold">Chat Free</span>
          </button>

          {/* Audio Call */}
          <button
            onClick={onAudioCall}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all duration-300 active:scale-95"
          >
            <svg className="w-4 h-4 text-primary-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            <span className="text-[10px] text-primary-light font-bold">₹49/min</span>
          </button>

          {/* Video Call */}
          <button
            onClick={onVideoCall}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 hover:border-secondary/40 transition-all duration-300 active:scale-95"
          >
            <svg className="w-4 h-4 text-secondary-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
            <span className="text-[10px] text-secondary-light font-bold">₹69/min</span>
          </button>

          {/* Gift */}
          <button
            onClick={() => setShowGifts(!showGifts)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90 shrink-0 ${
              showGifts ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400" : "bg-white/[0.06] border border-white/[0.08] text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>
          </button>

          {/* Credits */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] shrink-0">
            <svg className="w-3 h-3 text-primary-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            <span className="text-[10px] text-white font-bold">{getCredits()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
