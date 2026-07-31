import { getServerUrl } from "@/lib/url";

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
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchApi("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
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
      fetchApi("/wallet/recharge", { method: "POST", body: JSON.stringify({ amount }) }),
    spend: (amount: number, description: string) =>
      fetchApi("/wallet/spend", { method: "POST", body: JSON.stringify({ amount, description }) }),
    getHistory: () => fetchApi("/wallet/history"),
  },
  report: {
    submit: (reportedId: string, reason: string, description?: string) =>
      fetchApi("/report", { method: "POST", body: JSON.stringify({ reportedId, reason, description }) }),
  },
};
