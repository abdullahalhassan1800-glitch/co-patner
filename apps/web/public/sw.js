const CACHE_NAME = "co-patner-v2";
const APP_SHELL = [
  "/",
  "/login",
  "/register",
  "/phone-login",
  "/dashboard",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
    return;
  }
});

self.addEventListener("push", (event) => {
  if (!(self.Notification && self.Notification.permission === "granted")) return;
  let data = { title: "Co-Patner", body: "", url: "/dashboard", icon: "/icons/icon-192.png", tag: "co-patner" };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: "/icons/icon-192.png",
      data: { url: data.url },
      tag: data.tag,
      renotify: true,
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "send-messages") {
    event.waitUntil(flushOfflineQueue());
  }
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "refresh-dashboard") {
    event.waitUntil(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const res = await fetch("/dashboard");
          if (res.ok) cache.put("/dashboard", res.clone());
        } catch {}
      })
    );
  }
});

async function flushOfflineQueue() {
  const queue = await getQueue();
  if (!queue.length) return;
  const remaining = [];
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
  await setQueue(remaining);
}

async function getQueue() {
  try {
    const db = await openQueueDb();
    return await db.transaction("queue").objectStore("queue").getAll();
  } catch {
    return [];
  }
}

async function setQueue(items) {
  try {
    const db = await openQueueDb();
    const tx = db.transaction("queue", "readwrite");
    const store = tx.objectStore("queue");
    store.clear();
    items.forEach((item) => store.put(item));
    await txComplete(tx);
  } catch {}
}

function openQueueDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("co-patner-offline", 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("queue")) {
        req.result.createObjectStore("queue", { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txComplete(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
