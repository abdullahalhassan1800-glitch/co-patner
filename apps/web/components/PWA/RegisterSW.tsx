"use client";

import { useEffect, useRef, useState } from "react";

export default function RegisterSW() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const regRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && regRef.current) {
        regRef.current.update().catch(() => {});
      }
    };

    const onControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        regRef.current = reg;

        reg.addEventListener("updatefound", () => {
          const newSW = reg.installing;
          if (!newSW) return;
          newSW.addEventListener("statechange", () => {
            if (newSW.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });

        navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
        document.addEventListener("visibilitychange", handleVisibility);
      })
      .catch((err) => {
        console.error("Service worker registration failed:", err);
      });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const handleRefresh = () => {
    const reg = regRef.current;
    if (reg && reg.waiting) {
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
      <div className="glass-strong rounded-2xl px-5 py-3.5 flex items-center gap-4 shadow-2xl max-w-[92vw]">
        <span className="text-2xl">✨</span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">Naya update available</p>
          <p className="text-xs text-gray-400">Naya version ready hai — refresh karo</p>
        </div>
        <button
          onClick={handleRefresh}
          className="shrink-0 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
