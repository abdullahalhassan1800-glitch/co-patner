"use client";

import { useRouter } from "next/navigation";
import { OnlineUser, getCountryFlag } from "@/lib/data/mockUsers";

interface UserCardProps {
  user: OnlineUser;
  onCardClick: (user: OnlineUser) => void;
  onVideoChat: (user: OnlineUser) => void;
  onTextChat: (user: OnlineUser) => void;
}

export default function UserCard({ user, onCardClick, onVideoChat, onTextChat }: UserCardProps) {
  const router = useRouter();
  return (
    <div className="group relative glass rounded-3xl overflow-hidden hover-lift">
      {/* Image - clickable */}
      <div
        className="relative aspect-[3/4] overflow-hidden cursor-pointer"
        onClick={() => onCardClick(user)}
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Online indicator */}
        {user.isOnline && (
          <div className="absolute top-3 right-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 ring-2 ring-black/30" />
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {user.isLive && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/90 text-white shadow-lg flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              LIVE
            </span>
          )}
          {user.tags.includes("Top Rated") && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider gradient-warm text-white shadow-lg">
              Top
            </span>
          )}
          {user.tags.includes("New") && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/80 text-white shadow-lg">
              New
            </span>
          )}
          {user.tags.includes("Verified") && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 text-white shadow-lg flex items-center gap-1">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
              Verified
            </span>
          )}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white">{user.name}</h3>
            <span className="text-sm">{getCountryFlag(user.country)}</span>
            <span className="text-xs text-white/60 font-medium">{user.age}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-3 h-3 ${star <= Math.round(user.rating) ? "text-yellow-400" : "text-white/20"}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-[11px] text-white/50 font-medium">{user.rating.toFixed(1)}</span>
          </div>

          {/* Interests */}
          <div className="flex flex-wrap gap-1 mb-3">
            {user.interests.slice(0, 3).map((interest) => (
              <span key={interest} className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-white/70 font-medium">
                {interest}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {user.isLive ? (
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/live/${user.id}`); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-accent/20 border border-accent/30 text-accent-light text-xs font-bold shadow-lg shadow-accent/15 transition-all duration-300 hover:bg-accent/30 hover:border-accent/50 active:scale-95"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                </span>
                Watch Live
              </button>
            ) : (
              <button
                onClick={() => onVideoChat(user)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl gradient-main text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 active:scale-95"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                Connect Now
              </button>
            )}
            <button
              onClick={() => onTextChat(user)}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all duration-300 active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
