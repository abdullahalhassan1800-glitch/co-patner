"use client";

import { useEffect } from "react";
import { syncPushState } from "@/lib/push";
import { flushQueueLocally } from "@/lib/offline-queue";

async function registerPeriodicSync() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const periodicSync = (reg as any).periodicSync;
    if (periodicSync && "requestPermission" in periodicSync) {
      await periodicSync.requestPermission().catch(() => {});
    }
    if (periodicSync) {
      const tags = await periodicSync.getTags().catch(() => []);
      if (!tags.includes("refresh-dashboard")) {
        await periodicSync.register("refresh-dashboard", { minInterval: 24 * 60 * 60 * 1000 }).catch(() => {});
      }
    }
  } catch {}
}

export default function PushManager() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    syncPushState();
    registerPeriodicSync();

    const handler = () => syncPushState();
    navigator.serviceWorker.addEventListener("pushsubscriptionchange", handler);

    const onOnline = () => flushQueueLocally();
    window.addEventListener("online", onOnline);

    return () => {
      navigator.serviceWorker.removeEventListener("pushsubscriptionchange", handler);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return null;
}
