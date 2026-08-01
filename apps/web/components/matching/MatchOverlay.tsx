"use client";

import { useEffect, useState } from "react";

interface MatchOverlayProps {
  state: "searching" | "connecting";
  partnerName?: string;
  partnerAvatar?: string;
}

export default function MatchOverlay({ state, partnerName, partnerAvatar }: MatchOverlayProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((p) => (p.length >= 3 ? "" : p + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (state === "connecting") {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-dark/90 backdrop-blur-sm animate-fade-in rounded-2xl">
        <div className="text-center animate-scale-in">
          {partnerAvatar && partnerAvatar !== "/default-avatar.png" ? (
            <div className="relative w-24 h-24 mx-auto mb-5">
              <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 animate-pulse-ring" />
              <img
                src={partnerAvatar}
                alt={partnerName || "partner"}
                className="relative w-24 h-24 rounded-3xl object-cover ring-2 ring-primary/30 shadow-2xl shadow-primary/30"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-3xl gradient-glow flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-primary/30 animate-float">
              <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
          )}
          <p className="text-2xl font-black text-white mb-2">Connected!</p>
          <p className="text-gray-400 text-sm">Chatting with {partnerName || "someone"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-dark/90 backdrop-blur-sm rounded-2xl">
      <div className="text-center">
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 animate-pulse-ring" />
          <div className="absolute inset-3 rounded-3xl border-2 border-secondary/15 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
          <div className="absolute inset-0 rounded-3xl gradient-glow flex items-center justify-center animate-search-pulse shadow-2xl shadow-primary/30">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
        </div>
        <h3 className="text-2xl font-black text-white mb-2">Searching{dots}</h3>
        <p className="text-gray-400 text-sm">Finding someone for you...</p>
        <div className="mt-6 flex items-center justify-center gap-1.5 dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
