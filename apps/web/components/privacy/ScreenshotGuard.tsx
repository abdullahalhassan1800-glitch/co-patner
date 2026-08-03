"use client";

import { useEffect, useState, useCallback, useRef, ReactNode } from "react";

interface ScreenshotGuardProps {
  children: ReactNode;
  message?: string;
  className?: string;
}

export default function ScreenshotGuard({ children, message = "Privacy Protected", className = "" }: ScreenshotGuardProps) {
  const [hidden, setHidden] = useState(false);
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onVisibilityChange = () => setHidden(document.visibilityState === "hidden");
    const onBlur = () => setHidden(true);
    const onFocus = () => setHidden(false);
    const onPageHide = () => setHidden(true);
    const onFreeze = () => setHidden(true);
    const onBeforePrint = () => setHidden(true);
    const onAfterPrint = () => setHidden(false);

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("pagehide", onPageHide);
    document.addEventListener("freeze", onFreeze);
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("freeze", onFreeze);
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, []);

  const triggerFlash = useCallback(() => {
    setFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(false), 1400);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      const isScreenshot =
        e.key === "PrintScreen" ||
        (ctrl && e.shiftKey && ["s", "3", "4", "5"].includes(key)) ||
        (e.altKey && e.key === "PrintScreen") ||
        (e.metaKey && e.shiftKey && e.altKey && ["3", "4"].includes(key)) ||
        (ctrl && ["p", "s", "u", "i", "j", "c"].includes(key)) ||
        e.key === "F12" ||
        e.key === "F11";
      if (isScreenshot) {
        e.preventDefault();
        e.stopPropagation();
        triggerFlash();
      }
    };

    const prevent = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("contextmenu", prevent, true);
    document.addEventListener("copy", prevent, true);
    document.addEventListener("cut", prevent, true);
    document.addEventListener("paste", prevent, true);
    document.addEventListener("selectstart", prevent, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("contextmenu", prevent, true);
      document.removeEventListener("copy", prevent, true);
      document.removeEventListener("cut", prevent, true);
      document.removeEventListener("paste", prevent, true);
      document.removeEventListener("selectstart", prevent, true);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, [triggerFlash]);

  return (
    <div className={`screenshot-guard relative ${className}`}>
      {children}

      {hidden && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
          <div className="text-center px-8">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="text-gray-400 font-semibold">{message}</p>
            <p className="text-gray-600 text-xs mt-1">Content is hidden while you leave this screen</p>
          </div>
        </div>
      )}

      {flash && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl glass border border-accent/30 shadow-2xl animate-scale-in">
          <p className="text-accent-light text-sm font-semibold flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              <line x1="7" y1="1" x2="7" y2="4" />
              <line x1="11" y1="1" x2="11" y2="4" />
              <line x1="15" y1="1" x2="15" y2="4" />
            </svg>
            Screenshots are disabled during this call
          </p>
        </div>
      )}
    </div>
  );
}
