"use client";

import { useEffect, useState } from "react";
import { pushSupported, isPushEnabled, setPushEnabled, subscribeToPush, unsubscribeFromPush } from "@/lib/push";

export default function PushToggle() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ok = pushSupported();
    setSupported(ok);
    if (ok) setEnabled(isPushEnabled());
  }, []);

  const toggle = async () => {
    if (!pushSupported()) return;
    setBusy(true);
    try {
      if (enabled) {
        await unsubscribeFromPush();
        setEnabled(false);
      } else {
        const ok = await subscribeToPush();
        setEnabled(ok);
        if (!ok) setPushEnabled(false);
      }
    } catch {
      setPushEnabled(false);
      setEnabled(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-white/[0.03] flex items-center justify-center text-gray-400">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sm text-white">Push Notifications</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {supported ? "Get notified about calls & friend requests while offline" : "Not supported on this browser"}
          </p>
        </div>
      </div>
      {supported && (
        <button
          onClick={toggle}
          disabled={busy}
          aria-pressed={enabled}
          className={`relative w-12 h-7 rounded-full transition-colors duration-300 shrink-0 ${
            enabled ? "bg-primary" : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      )}
    </div>
  );
}
