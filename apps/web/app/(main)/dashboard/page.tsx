"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UserCard from "@/components/dashboard/UserCard";
import ConnectModal from "@/components/dashboard/ConnectModal";
import HostProfileModal from "@/components/dashboard/HostProfileModal";
import RingingOverlay from "@/components/call/RingingOverlay";
import CallOverlay from "@/components/call/CallOverlay";
import CallSummary from "@/components/call/CallSummary";
import TextChatOverlay from "@/components/chat/TextChatOverlay";
import { generateMockUsers, OnlineUser } from "@/lib/data/mockUsers";
import { useAuth } from "@/lib/auth-context";
import { deductCredits, RATE_AUDIO, RATE_VIDEO, hasEnoughCredits } from "@/lib/credits";
import { useSocket } from "@/hooks/useSocket";
import { useCallSocket } from "@/hooks/useCallSocket";
import { getServerUrl } from "@/lib/url";

type CallState = "idle" | "connect-modal" | "text-chat" | "ringing" | "incoming" | "active" | "summary";

function serverUserToOnlineUser(u: any): OnlineUser {
  return {
    id: u._id,
    name: u.name || "Unknown",
    age: u.age || 18,
    country: u.country || "IN",
    gender: u.gender || "other",
    avatar: u.avatar || "/default-avatar.png",
    isOnline: true,
    isLive: false,
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    tags: ["New"],
    bio: u.bio || "",
    interests: u.interests || [],
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "rating" | "age" | "newest">("default");

  const [callState, setCallState] = useState<CallState>("idle");
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);
  const [callMode, setCallMode] = useState<"audio" | "video">("video");
  const [callDuration, setCallDuration] = useState(0);
  const [callCost, setCallCost] = useState(0);
  const [viewProfile, setViewProfile] = useState<OnlineUser | null>(null);
  const [serverUserId, setServerUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("co_patner_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setServerUserId(parsed._id || parsed.id);
      }
    } catch {}
  }, [user]);

  const { socket } = useSocket(serverUserId);
  const { incomingCall, callAccepted, callRejected, callEnded, callError, remoteStream, localStream, initiateCall, acceptCall, rejectCall, endCall, resetCallState } = useCallSocket(serverUserId);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (user) {
      fetch(`${getServerUrl()}/api/user/all`, { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          const realUsers = (data.users || []).map(serverUserToOnlineUser);
          setUsers(realUsers);
          const myId = serverUserId;
          if (myId && !realUsers.find((u: OnlineUser) => u.id === myId)) {
            localStorage.removeItem("co_patner_user");
            localStorage.removeItem("co_patner_token");
            window.location.reload();
          }
        })
        .catch(() => setUsers(generateMockUsers(6)));
    }
  }, [user, loading, router, serverUserId]);

  useEffect(() => {
    console.log("🔔 Dashboard incomingCall effect:", { incomingCall: !!incomingCall, callState, usersCount: users.length });
    if (incomingCall && callState === "idle") {
      const caller = users.find((u) => u.id === incomingCall.fromUserId);
      console.log("🔔 Found caller:", !!caller, "fromUserId:", incomingCall.fromUserId);
      if (caller) {
        setSelectedUser(caller);
        setCallMode(incomingCall.mode);
        setCallState("incoming");
      } else {
        setSelectedUser({
          id: incomingCall.fromUserId,
          name: "Someone",
          age: 0,
          country: "IN",
          gender: "other",
          avatar: "/default-avatar.png",
          isOnline: true,
          isLive: false,
          rating: 4.5,
          tags: [],
          bio: "",
          interests: [],
        });
        setCallMode(incomingCall.mode);
        setCallState("incoming");
      }
    }
  }, [incomingCall, callState, users]);

  useEffect(() => {
    if (callAccepted && callState === "ringing") {
      setCallState("active");
    }
  }, [callAccepted, callState]);

  useEffect(() => {
    if (callRejected && callState === "ringing") {
      setCallState("idle");
      setSelectedUser(null);
      resetCallState();
    }
  }, [callRejected, callState, resetCallState]);

  useEffect(() => {
    if (callEnded && callState === "active") {
      setCallState("summary");
    }
  }, [callEnded, callState]);

  const filteredUsers = useMemo(() => {
    let result = users.filter((u) => u.isOnline);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.country.toLowerCase().includes(q) || u.interests.some((i) => i.toLowerCase().includes(q)));
    }

    switch (activeTab) {
      case "top":
        result = result.filter((u) => u.rating >= 4.0);
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "new":
        result = result.filter((u) => u.tags.includes("New"));
        break;
      case "live":
        result = result.filter((u) => u.isLive);
        break;
    }

    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "age") result.sort((a, b) => a.age - b.age);
    else if (sortBy === "newest") result.sort((a, b) => (b.tags.includes("New") ? 1 : 0) - (a.tags.includes("New") ? 1 : 0));

    return result;
  }, [users, activeTab, searchQuery, sortBy]);

  const onlineCount = users.filter((u) => u.isOnline).length;

  const handleConnect = useCallback((u: OnlineUser) => {
    setSelectedUser(u);
    setCallState("connect-modal");
  }, []);

  const handleCardClick = useCallback((u: OnlineUser) => {
    setViewProfile(u);
  }, []);

  const handleProfileConnect = useCallback((u: OnlineUser) => {
    setViewProfile(null);
    setSelectedUser(u);
    setCallState("connect-modal");
  }, []);

  const handleTextChat = useCallback((u: OnlineUser) => {
    setSelectedUser(u);
    setCallState("text-chat");
  }, []);

  const handleConnectModalAction = useCallback((mode: "text" | "audio" | "video") => {
    if (!selectedUser) return;
    if (mode === "text") {
      setCallState("text-chat");
      return;
    }
    setCallMode(mode);
    const rate = mode === "audio" ? RATE_AUDIO : RATE_VIDEO;
    if (!hasEnoughCredits(rate)) {
      router.push("/wallet");
      return;
    }
    setCallState("ringing");
    initiateCall(selectedUser.id, mode);
  }, [selectedUser, router, initiateCall]);

  const handleIncomingAccept = useCallback(() => {
    acceptCall(callMode);
    setCallState("active");
  }, [acceptCall, callMode]);

  const handleIncomingReject = useCallback(() => {
    rejectCall();
    setCallState("idle");
    setSelectedUser(null);
    resetCallState();
  }, [rejectCall, resetCallState]);

  const handleRingingReject = useCallback(() => {
    setCallState("idle");
    setSelectedUser(null);
    resetCallState();
  }, [resetCallState]);

  const handleEndCall = useCallback(() => {
    if (callState === "active") {
      endCall(callDuration, callCost);
      setCallState("summary");
    } else if (callState === "ringing") {
      handleRingingReject();
    }
  }, [callState, callDuration, callCost, endCall, handleRingingReject]);

  const handleSummaryDone = useCallback(() => {
    setCallState("idle");
    setSelectedUser(null);
    setCallDuration(0);
    setCallCost(0);
    resetCallState();
  }, [resetCallState]);

  return (
    <div className="min-h-screen bg-[#06060A] relative">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/[0.05] blur-[160px] animate-orb" />
        <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full bg-secondary/[0.03] blur-[140px] animate-orb" style={{ animationDelay: "6s" }} />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-6 pt-24">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, country, or interest..."
              className="input-main w-full rounded-2xl pl-11 pr-5 py-3.5 text-sm text-white placeholder-gray-600"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input-main rounded-2xl px-5 py-3.5 text-sm text-white appearance-none shrink-0 w-full sm:w-44"
          >
            <option value="default">Default</option>
            <option value="rating">Top Rated</option>
            <option value="age">Age: Young First</option>
            <option value="newest">Newest Users</option>
          </select>
        </div>

        <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} userCount={users.length} onlineCount={onlineCount} />

        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500 font-medium">
            Showing <span className="text-white">{filteredUsers.length}</span> people
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span><span className="text-emerald-400 font-bold">{onlineCount}</span> online</span>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
            <p className="text-gray-400 font-medium mb-1">No one found</p>
            <p className="text-gray-600 text-xs">Try changing your filters or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredUsers.map((u) => (
              <UserCard key={u.id} user={u} onCardClick={handleCardClick} onVideoChat={handleConnect} onTextChat={handleTextChat} />
            ))}
          </div>
        )}

        {filteredUsers.length >= 20 && (
          <div className="text-center mt-10 mb-6">
            <button className="btn-ghost px-8 py-3 rounded-2xl text-sm font-semibold text-gray-400 hover:text-white">Load More People</button>
          </div>
        )}
      </div>

      {viewProfile && (
        <HostProfileModal user={viewProfile} onClose={() => setViewProfile(null)} onConnect={() => handleProfileConnect(viewProfile)} />
      )}

      {callState === "text-chat" && selectedUser && (
        <TextChatOverlay user={selectedUser} onClose={() => { setCallState("idle"); setSelectedUser(null); }} />
      )}

      {callState === "connect-modal" && selectedUser && (
        <ConnectModal user={selectedUser} onClose={() => { setCallState("idle"); setSelectedUser(null); }} onAction={handleConnectModalAction} />
      )}

      {callError && (callState === "ringing" || callState === "active") && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[120] glass px-5 py-3 rounded-2xl border border-accent/20 shadow-lg">
          <p className="text-accent-light text-sm font-medium">{callError}</p>
        </div>
      )}

      {callState === "incoming" && selectedUser && (
        <RingingOverlay user={selectedUser} mode={callMode} onAccept={handleIncomingAccept} onReject={handleIncomingReject} />
      )}

      {callState === "ringing" && selectedUser && (
        <RingingOverlay user={selectedUser} mode={callMode} onAccept={() => {}} onReject={handleRingingReject} />
      )}

      {callState === "active" && selectedUser && (
        <CallOverlay user={selectedUser} mode={callMode} onEndCall={handleEndCall} remoteStream={remoteStream} localStream={localStream} />
      )}

      {callState === "summary" && selectedUser && (
        <CallSummary user={selectedUser} mode={callMode} duration={callDuration} cost={callCost} onDone={handleSummaryDone} onAddFriend={handleSummaryDone} onReport={handleSummaryDone} />
      )}
    </div>
  );
}
