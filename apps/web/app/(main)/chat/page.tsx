"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMedia } from "@/hooks/useMedia";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useSocket } from "@/hooks/useSocket";
import LocalVideo from "@/components/video/LocalVideo";
import RemoteVideo from "@/components/video/RemoteVideo";
import VideoControls from "@/components/video/VideoControls";
import TextChat from "@/components/chat/TextChat";
import MatchOverlay from "@/components/matching/MatchOverlay";
import FilterPanel from "@/components/matching/FilterPanel";
import ReportDialog from "@/components/safety/ReportDialog";
import AgeGate from "@/components/safety/AgeGate";
import { User, MatchFilters } from "@/types";
import { api } from "@/lib/api";
import ScreenshotGuard from "@/components/privacy/ScreenshotGuard";

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ageVerified, setAgeVerified] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const { localStream, isMicOn, isCamOn, error: mediaError, startMedia, toggleMic, toggleCam } = useMedia();
  const {
    connectionState, partner, remoteStream, messages, isPartnerTyping,
    error, startChat, skipPartner, leaveChat, sendMessage, sendTyping, sendStopTyping,
  } = useWebRTC(user?.id);

  useSocket(user?.id);

  useEffect(() => {
    const stored = localStorage.getItem("co_patner_user");
    const token = localStorage.getItem("co_patner_token");
    if (!stored || !token) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
    setAgeVerified(localStorage.getItem("co_patner_age_verified") === "true");
  }, [router]);

  const handleAgeConfirm = () => {
    localStorage.setItem("co_patner_age_verified", "true");
    setAgeVerified(true);
  };

  const handleStart = useCallback(async (filters?: MatchFilters) => {
    const stream = await startMedia();
    if (stream) startChat(stream, filters);
  }, [startMedia, startChat]);

  const handleStop = useCallback(() => {
    leaveChat();
  }, [leaveChat]);

  const handleRetry = useCallback(() => {
    leaveChat();
    setTimeout(() => handleStart(), 300);
  }, [leaveChat, handleStart]);

  const handleFilterApply = useCallback((filters: MatchFilters) => {
    leaveChat();
    setTimeout(() => handleStart(filters), 300);
  }, [leaveChat, handleStart]);

  const handleReport = async (reason: string, description: string) => {
    if (partner) {
      try { await api.report.submit(partner.id, reason, description); skipPartner(); } catch {}
    }
  };

  if (!ageVerified) return <AgeGate onConfirm={handleAgeConfirm} />;
  if (!user) return null;

  const stateLabel = {
    connected: { text: "Connected", cls: "badge-connected" },
    searching: { text: "Searching", cls: "badge-searching animate-search-pulse" },
    connecting: { text: "Connecting", cls: "badge-connecting" },
    disconnected: { text: "Disconnected", cls: "badge-idle" },
    idle: { text: "Idle", cls: "badge-idle" },
  }[connectionState] || { text: "Idle", cls: "badge-idle" };

  return (
    <div className="min-h-screen bg-[#06060A] relative">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 py-4 h-[100dvh] flex flex-col pt-[76px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              title="Back to dashboard"
              className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all duration-300 active:scale-90"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <h1 className="text-base font-bold text-white">Video Chat</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${stateLabel.cls}`}>
              {connectionState === "connected" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              {stateLabel.text}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(true)} className="btn-ghost px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              Filters
            </button>
            {connectionState === "connected" && (
              <button onClick={() => setShowReport(true)} className="btn-ghost px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-accent flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
                Report
              </button>
            )}
          </div>
        </div>

        {mediaError && (
          <div className="bg-accent/10 border border-accent/25 rounded-2xl p-4 mb-3 text-sm text-accent-light animate-scale-in flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {mediaError}
          </div>
        )}

        {error && connectionState !== "idle" && connectionState !== "connected" && (
          <div className="bg-accent/10 border border-accent/25 rounded-2xl p-4 mb-3 text-sm text-accent-light animate-scale-in flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
            <button onClick={handleRetry} className="shrink-0 px-4 py-2 rounded-xl bg-accent/20 hover:bg-accent/30 text-accent-light text-xs font-bold transition-colors">
              Try Again
            </button>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* Video Section */}
          <ScreenshotGuard message="Video is privacy protected" className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="flex-1 relative min-h-0">
              {/* Remote */}
              <div className="video-box absolute inset-0 bg-surface rounded-2xl">
                <RemoteVideo stream={remoteStream} partner={partner} />
                {(connectionState === "searching" || connectionState === "connecting") && (
                  <MatchOverlay state={connectionState} partnerName={partner?.name} partnerAvatar={partner?.avatar} />
                )}
                {connectionState === "disconnected" && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface rounded-2xl">
                    <div className="text-center animate-slide-up px-6">
                      <div className="w-24 h-24 rounded-[2rem] bg-accent/15 border border-accent/25 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </div>
                      <h2 className="text-2xl font-black mb-2 text-white">Call Ended</h2>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">Your partner has left the call</p>
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={handleStart} className="btn-glow px-6 py-3.5 rounded-2xl text-sm font-bold text-white shadow-2xl shadow-primary/30">
                          Start New Chat
                        </button>
                        <button onClick={() => router.push("/dashboard")} className="btn-ghost px-5 py-3.5 rounded-2xl text-sm font-semibold text-gray-300">
                          Home
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {connectionState === "idle" && !localStream && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface rounded-2xl">
                    <div className="text-center animate-slide-up px-6">
                      <div className="w-28 h-28 rounded-[2rem] gradient-glow flex items-center justify-center mx-auto mb-6 animate-float shadow-2xl shadow-primary/30">
                        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                      </div>
                      <h2 className="text-2xl font-black mb-2 text-white">Ready to Chat?</h2>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
                        Click below to start random video chat with strangers worldwide
                      </p>
                      <button onClick={handleStart} className="btn-glow px-10 py-4 rounded-2xl text-base font-bold text-white shadow-2xl shadow-primary/30">
                        Start Video Chat
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Local PiP - corner overlay */}
              <div className="absolute bottom-4 right-4 z-30 w-28 h-40 sm:w-36 sm:h-52 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl shadow-black/50 bg-surface-dark">
                <LocalVideo stream={localStream} isCamOn={isCamOn} />
              </div>
            </div>

            {/* Controls */}
            {connectionState !== "idle" && (
            <div className="glass rounded-2xl shrink-0">
              <div className="flex items-center gap-1.5 pl-2">
                <div className="flex-1 min-w-0">
                  <VideoControls
                    isMicOn={isMicOn} isCamOn={isCamOn}
                    onToggleMic={toggleMic} onToggleCam={toggleCam}
                    onSkip={skipPartner} onStop={handleStop}
                    connectionState={connectionState}
                  />
                </div>
                <button
                  onClick={() => setChatOpen(true)}
                  title="Text Chat"
                  className="md:hidden w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all duration-300 active:scale-90"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </button>
              </div>
            </div>
            )}
          </ScreenshotGuard>

          {/* Text Chat - desktop */}
          <div className="w-[300px] xl:w-[340px] glass rounded-2xl overflow-hidden shrink-0 hidden md:flex flex-col">
            <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                Text Chat
              </span>
              {connectionState !== "connected" && (
                <span className="text-[10px] text-gray-600 font-medium">Connect to chat</span>
              )}
            </div>
            <div className="flex-1 min-h-0">
              <TextChat
                messages={messages} isPartnerTyping={isPartnerTyping}
                onSend={connectionState === "connected" ? sendMessage : () => {}}
                onTyping={sendTyping} onStopTyping={sendStopTyping}
              />
            </div>
          </div>
        </div>

        {/* Text Chat - mobile drawer */}
        <div className={`fixed inset-0 z-[100] md:hidden ${chatOpen ? "" : "pointer-events-none"}`}>
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${chatOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setChatOpen(false)}
          />
          <div className={`absolute top-0 right-0 h-full w-[85vw] max-w-[340px] glass-strong flex flex-col transition-transform duration-300 ${chatOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                Text Chat
              </span>
              <button
                onClick={() => setChatOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <TextChat
                messages={messages} isPartnerTyping={isPartnerTyping}
                onSend={connectionState === "connected" ? sendMessage : () => {}}
                onTyping={sendTyping} onStopTyping={sendStopTyping}
              />
            </div>
          </div>
        </div>

      </div>

      <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)} onApply={handleFilterApply} />
      <ReportDialog isOpen={showReport} onClose={() => setShowReport(false)} onSubmit={handleReport} />
    </div>
  );
}
