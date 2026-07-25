"use client";

import { OnlineUser, getCountryFlag, getCountryName } from "@/lib/data/mockUsers";

interface LiveHostInfoProps {
  user: OnlineUser;
  viewerCount: number;
  liveDuration: string;
}

export default function LiveHostInfo({ user, viewerCount, liveDuration }: LiveHostInfoProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-5">
      <div className="glass-strong rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Host info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/40"
              />
              {user.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 ring-2 ring-[#12121e]" />
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">{user.name}, {user.age}</h3>
                <span className="text-sm">{getCountryFlag(user.country)}</span>
                <div className="flex items-center gap-0.5">
                  <svg className="w-3 h-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  <span className="text-[11px] text-white font-semibold">{user.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {user.interests.slice(0, 3).map((interest) => (
                  <span key={interest} className="px-2 py-0.5 rounded-full bg-white/[0.08] text-[10px] text-gray-400 font-medium">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Live stats */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/25">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              <span className="text-[10px] text-accent-light font-bold">LIVE {liveDuration}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              <span className="text-white font-semibold">{viewerCount}</span>
              <span>watching</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
