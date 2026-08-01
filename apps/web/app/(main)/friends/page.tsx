"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("co_patner_token");
    if (!token) { router.push("/login"); return; }
    loadFriends();
  }, [router]);

  useEffect(() => {
    const onFocus = () => loadFriends();
    const onVisible = () => { if (!document.hidden) loadFriends(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const loadFriends = async () => {
    try { const data = await api.user.getFriends(); setFriends(data.friends); } catch {}
  };

  const filtered = friends.filter((f) => f.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pt-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-white">Friends</h1>
        <button className="btn-main px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-primary/25">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Invite
          </span>
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </div>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search friends..."
          className="input-main w-full rounded-2xl pl-11 pr-5 py-3.5 text-white placeholder-gray-600 text-sm" />
      </div>

      <div className="space-y-2.5">
        {filtered.length === 0 && (
          <div className="text-center py-16 glass rounded-3xl">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <p className="text-gray-400 font-medium text-sm">No friends yet</p>
            <p className="text-gray-600 text-xs mt-1">Meet people in video chat and add them!</p>
          </div>
        )}
        {filtered.map((friend) => (
          <div key={friend._id} className="glass rounded-2xl p-4 flex items-center justify-between hover-lift">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl gradient-glow flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-primary/15">
                {friend.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm text-white">{friend.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{friend.country === "IN" ? "🇮🇳" : "🌍"} {friend.gender}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/[0.06] transition-all duration-200 text-gray-400 hover:text-white">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </button>
              <button className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/[0.06] transition-all duration-200 text-gray-400 hover:text-white">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
