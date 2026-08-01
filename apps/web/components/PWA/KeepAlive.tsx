"use client";

import { useEffect } from "react";
import { getServerUrl } from "@/lib/url";

const PING_INTERVAL = 4 * 60 * 1000;

export default function KeepAlive() {
  useEffect(() => {
    let stopped = false;
    const ping = () => {
      if (stopped) return;
      if (typeof document !== "undefined" && document.visibilityState !== "hidden" && navigator.onLine) {
        fetch(`${getServerUrl()}/api/health`, { cache: "no-store" }).catch(() => {});
      }
    };
    const onVisible = () => {
      if (!document.hidden) ping();
    };
    ping();
    const id = setInterval(ping, PING_INTERVAL);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);
    return () => {
      stopped = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
    };
  }, []);
  return null;
}
