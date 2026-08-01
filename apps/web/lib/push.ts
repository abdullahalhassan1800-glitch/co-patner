import { api } from "@/lib/api";

const ENABLED_KEY = "co_patner_push_enabled";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushEnabled(): boolean {
  return localStorage.getItem(ENABLED_KEY) === "1";
}

export function setPushEnabled(value: boolean): void {
  if (value) localStorage.setItem(ENABLED_KEY, "1");
  else localStorage.removeItem(ENABLED_KEY);
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const data = await api.push.getVapidKey();
    return data.enabled ? data.publicKey : null;
  } catch {
    return null;
  }
}

export async function subscribeToPush(): Promise<boolean> {
  if (!pushSupported()) return false;

  const publicKey = await getVapidPublicKey();
  if (!publicKey) return false;

  if (Notification.permission === "denied") {
    setPushEnabled(false);
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    setPushEnabled(false);
    return false;
  }

  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();

  if (!existing) {
    await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });
  }

  const subscription = existing || (await reg.pushManager.getSubscription());
  if (!subscription) return false;

  const json = subscription.toJSON();
  await api.push.subscribe({
    subscription: {
      endpoint: json.endpoint,
      keys: json.keys,
    },
    userAgent: navigator.userAgent,
  });

  setPushEnabled(true);
  return true;
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!pushSupported()) return false;

  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      const json = subscription.toJSON();
      await api.push.unsubscribe({ endpoint: json.endpoint }).catch(() => {});
      await subscription.unsubscribe();
    }
  } catch {}

  setPushEnabled(false);
  return true;
}

export async function syncPushState(): Promise<void> {
  if (!pushSupported()) return;

  const enabled = isPushEnabled();
  if (enabled) {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        await subscribeToPush();
      } else {
        const json = sub.toJSON();
        await api.push
          .subscribe({
            subscription: { endpoint: json.endpoint, keys: json.keys },
            userAgent: navigator.userAgent,
          })
          .catch(() => {});
      }
    } catch {}
  }
}
