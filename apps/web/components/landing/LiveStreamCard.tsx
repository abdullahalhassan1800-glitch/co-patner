"use client";

import { useRouter } from "next/navigation";

interface LiveStreamCardProps {
  name: string;
  age: number;
  avatar: string;
  viewerCount: number;
  isLive: boolean;
  country: string;
  tag?: string;
}

export default function LiveStreamCard({
  name,
  age,
  avatar,
  viewerCount,
  isLive,
  country,
  tag,
}: LiveStreamCardProps) {
  const router = useRouter();

  return (
    <div
      className="live-card group"
      onClick={() => router.push("/dashboard")}
    >
      {/* Background Image */}
      <div className="relative h-[280px] sm:h-[320px] lg:h-[380px]">
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Top overlay */}
        <div className="absolute top-0 left-0 right-0 z-20 p-3 flex items-start justify-between">
          {isLive && (
            <div className="live-badge">
              LIVE
            </div>
          )}
          <div className="viewer-count ml-auto">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {viewerCount}
          </div>
        </div>

        {/* Tag badge */}
        {tag && (
          <div className="absolute top-12 left-3 z-20">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/90 text-white">
              {tag}
            </span>
          </div>
        )}

        {/* Bottom overlay info */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <div className="flex items-end justify-between">
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={avatar}
                  alt={name}
                  className="w-11 h-11 rounded-full border-2 border-primary/60 object-cover"
                />
                {isLive && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0a0a14] rounded-full" />
                )}
              </div>
              <div>
                <h3 className="text-white font-bold text-sm leading-tight">
                  {name}, <span className="text-gray-300 font-medium">{age}</span>
                </h3>
                <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                  <span>{country}</span>
                </p>
              </div>
            </div>

            {/* Action buttons (right side vertical) */}
            <div className="flex flex-col gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-pink-400 hover:bg-pink-500/20 transition-all duration-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); router.push("/dashboard"); }}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-yellow-400 hover:bg-yellow-500/20 transition-all duration-300"
                title="Send Gift"
              >
                <span className="text-base">🎁</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </div>

          {/* Watch Live button */}
          <button className="w-full mt-3 py-2.5 rounded-xl bg-primary/90 hover:bg-primary text-white text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-primary/30">
            Watch Live
          </button>
        </div>
      </div>
    </div>
  );
}
