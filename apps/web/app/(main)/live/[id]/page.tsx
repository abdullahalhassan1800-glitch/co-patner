"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import LivePlayer from "@/components/live/LivePlayer";
import LiveHostInfo from "@/components/live/LiveHostInfo";
import LiveActionBar from "@/components/live/LiveActionBar";
import { generateMockUsers, OnlineUser } from "@/lib/data/mockUsers";
import { useAuth } from "@/lib/auth-context";
import { hasEnoughCredits, RATE_AUDIO, RATE_VIDEO } from "@/lib/credits";
import ScreenshotGuard from "@/components/privacy/ScreenshotGuard";

export default function LivePage() {
  const router = useRouter();
  const params = useParams();
  const { user: authUser, loading } = useAuth();
  const [host, setHost] = useState<OnlineUser | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [liveDuration, setLiveDuration] = useState("00:00");
  const [liveStart] = useState(Date.now());

  useEffect(() => {
    const users = generateMockUsers(6);
    const found = users.find((u) => u.id === params.id) || users[0];
    setHost(found);
    setViewerCount(Math.floor(Math.random() * 800) + 200);
  }, [params.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => {
        const delta = Math.floor(Math.random() * 20) - 10;
        return Math.max(50, prev + delta);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - liveStart) / 1000);
      const m = Math.floor(elapsed / 60).toString().padStart(2, "0");
      const s = (elapsed % 60).toString().padStart(2, "0");
      setLiveDuration(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [liveStart]);

  const handleBack = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const handleChatFree = useCallback(() => {
    setSelectedAction("chat");
  }, []);

  const handleAudioCall = useCallback(() => {
    if (!hasEnoughCredits(RATE_AUDIO)) {
      router.push("/wallet");
      return;
    }
    router.push("/chat?mode=audio");
  }, [router]);

  const handleVideoCall = useCallback(() => {
    if (!hasEnoughCredits(RATE_VIDEO)) {
      router.push("/wallet");
      return;
    }
    router.push("/chat?mode=video");
  }, [router]);

  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  if (!host) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading stream...</p>
        </div>
      </div>
    );
  }

  return (
    <ScreenshotGuard message="Live stream is privacy protected">
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="fixed inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[200px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-secondary/[0.03] rounded-full blur-[180px]" />
        </div>

        {/* Full-screen player */}
        <div className="absolute inset-0">
          <LivePlayer avatar={host.avatar} name={host.name} isLive={host.isOnline} />
        </div>

        {/* Host info overlay */}
        <LiveHostInfo user={host} viewerCount={viewerCount} liveDuration={liveDuration} />

        {/* Action bar */}
        <LiveActionBar
          onBack={handleBack}
          onChatFree={handleChatFree}
          onAudioCall={handleAudioCall}
          onVideoCall={handleVideoCall}
        />
      </div>
    </ScreenshotGuard>
  );
}
