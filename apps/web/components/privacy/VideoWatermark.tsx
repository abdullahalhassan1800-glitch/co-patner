"use client";

import { useState, useEffect } from "react";

interface VideoWatermarkProps {
  userId?: string;
  className?: string;
}

function maskPhone(phone?: string, username?: string, id?: string): string {
  const value = phone || username || id || "guest";
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length > 4) {
      return `${digits.slice(0, 1)}${"•".repeat(Math.max(4, digits.length - 2))}${digits.slice(-2)}`;
    }
  }
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)}…`;
}

export default function VideoWatermark({ userId, className = "" }: VideoWatermarkProps) {
  const [now, setNow] = useState(() => new Date());
  const [identity, setIdentity] = useState("guest");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("co_patner_user");
      if (stored) {
        const u = JSON.parse(stored);
        setIdentity(maskPhone(u.phone, u.username, userId || u.id || u._id));
      }
    } catch {
      setIdentity(maskPhone(undefined, undefined, userId));
    }
  }, [userId]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toTimeString().slice(0, 8);
  const date = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden>
      <div className="video-watermark">
        <svg className="w-3.5 h-3.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>{identity}</span>
        <span className="opacity-60">·</span>
        <span className="tabular-nums opacity-80">{time}</span>
        <span className="opacity-50 hidden sm:inline">{date}</span>
      </div>
    </div>
  );
}
