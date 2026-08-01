const DB_NAME = "co-patner-offline";
const STORE = "queue";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
}

export async function getQueuedRequests(): Promise<QueuedRequest[]> {
  if (typeof indexedDB === "undefined") return [];
  try {
    const db = await openDb();
    const req = db.transaction(STORE).objectStore(STORE).getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => resolve((req.result as QueuedRequest[]) || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function queueRequest(request: Omit<QueuedRequest, "id">): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openDb();
    const item: QueuedRequest = {
      ...request,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    };
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    await txComplete(tx);
  } catch {}
}

export async function clearQueue(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    await txComplete(tx);
  } catch {}
}

export async function flushQueueLocally(): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.onLine) return;
  const queue = await getQueuedRequests();
  if (!queue.length) return;

  const remaining: QueuedRequest[] = [];
  for (const item of queue) {
    try {
      const res = await fetch(item.url, {
        method: item.method || "POST",
        headers: item.headers || { "Content-Type": "application/json" },
        body: item.body ? JSON.stringify(item.body) : undefined,
      });
      if (!res.ok) remaining.push(item);
    } catch {
      remaining.push(item);
    }
  }

  if (typeof indexedDB !== "undefined") {
    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.clear();
    remaining.forEach((item) => store.put(item));
    await txComplete(tx);
  }
}

export async function registerBackgroundSync(): Promise<void> {
  if (typeof navigator === "undefined") return;
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  const sync = (reg as any)?.sync;
  if (sync && navigator.onLine) {
    try {
      const queue = await getQueuedRequests();
      if (queue.length) await sync.register("send-messages");
    } catch {}
  }
}

export async function queueOfflineRequest(endpoint: string, options: RequestInit): Promise<void> {
  const token = localStorage.getItem("co_patner_token");
  await queueRequest({
    url: endpoint,
    method: options.method || "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...((options.headers as Record<string, string>) || {}),
    },
    body: options.body ? JSON.parse(String(options.body)) : undefined,
  });
  await registerBackgroundSync();
}
