import { getServerUrl } from "@/lib/url";
import { queueOfflineRequest, registerBackgroundSync } from "@/lib/offline-queue";

const API_URL = getServerUrl();

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("co_patner_token") : null;

  const res = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }).catch(async (err) => {
    if (typeof window !== "undefined" && !navigator.onLine) {
      const method = (options.method || "GET").toUpperCase();
      if (["POST", "PUT", "PATCH"].includes(method) && options.body) {
        await queueOfflineRequest(`${API_URL}/api${endpoint}`, options);
        await registerBackgroundSync();
      }
    }
    throw err;
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export const api = {
  auth: {
    login: (identifier: string, password: string) =>
      fetchApi("/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) }),
    completeAccount: (data: { username: string; password: string; email?: string }) =>
      fetchApi("/auth/complete-account", { method: "POST", body: JSON.stringify(data) }),
    forgotPassword: (email: string) =>
      fetchApi("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
    resetPassword: (token: string, password: string) =>
      fetchApi("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }),
    register: (data: { email: string; password: string; name: string; gender?: string; age?: number }) =>
      fetchApi("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    google: (data: { email: string; name: string; avatar?: string }) =>
      fetchApi("/auth/google", { method: "POST", body: JSON.stringify(data) }),
    me: () => fetchApi("/auth/me"),
    phoneCheck: (phone: string) =>
      fetchApi("/auth/phone/check", { method: "POST", body: JSON.stringify({ phone }) }),
    phoneSendOtp: (phone: string) =>
      fetchApi("/auth/phone/send-otp", { method: "POST", body: JSON.stringify({ phone }) }),
    phoneVerifyOtp: (data: { phone: string; otp: string; name?: string }) =>
      fetchApi("/auth/phone/verify-otp", { method: "POST", body: JSON.stringify(data) }),
    phoneSignIn: (data: { phone: string; name?: string }) =>
      fetchApi("/auth/phone/signin", { method: "POST", body: JSON.stringify(data) }),
  },
  user: {
    getProfile: (id: string) => fetchApi(`/user/profile/${id}`),
    updateProfile: (data: any) =>
      fetchApi("/user/profile", { method: "PUT", body: JSON.stringify(data) }),
    getFriends: () => fetchApi("/user/friends"),
    addFriend: (friendId: string) =>
      fetchApi(`/user/friends/add/${friendId}`, { method: "POST" }),
    removeFriend: (friendId: string) =>
      fetchApi(`/user/friends/remove/${friendId}`, { method: "POST" }),
  },
  wallet: {
    getBalance: () => fetchApi("/wallet/balance"),
    recharge: (amount: number) =>
      fetchApi("/wallet/recharge", { method: "POST", body: JSON.stringify({ amount }) }),    spend: (amount: number, description: string) =>
      fetchApi("/wallet/spend", { method: "POST", body: JSON.stringify({ amount, description }) }),
    getHistory: () => fetchApi("/wallet/history"),
  },
  report: {
    submit: (reportedId: string, reason: string, description?: string) =>
      fetchApi("/report", { method: "POST", body: JSON.stringify({ reportedId, reason, description }) }),
  },
  push: {
    getVapidKey: () => fetchApi("/push/vapid-key"),
    subscribe: (data: { subscription: { endpoint?: string; keys?: any }; userAgent: string }) =>
      fetchApi("/push/subscribe", { method: "POST", body: JSON.stringify(data) }),
    unsubscribe: (data: { endpoint?: string }) =>
      fetchApi("/push/unsubscribe", { method: "POST", body: JSON.stringify(data) }),
  },
  turn: {
    getCredentials: (): Promise<{ iceServers: RTCIceServer[]; turnConfigured: boolean }> =>
      fetchApi("/turn/credentials"),
  },
};
