"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from "react";
import {
  onAuthStateChanged,
  getRedirectResult,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  verifyPhoneOTP: (verificationId: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const syncedRef = useRef<string | null>(null);
  const serverAuthRef = useRef(false);

  useEffect(() => {
    // Restore session from localStorage before Firebase callback can override
    try {
      const stored = localStorage.getItem("co_patner_user");
      const token = localStorage.getItem("co_patner_token");
      if (stored && token) {
        const parsed = JSON.parse(stored);
        setUser({ uid: parsed.id || parsed._id, email: parsed.email, displayName: parsed.name } as any);
      }
    } catch {}

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (serverAuthRef.current) {
        setLoading(false);
        return;
      }
      if (firebaseUser) {
        setUser(firebaseUser);
        if (syncedRef.current !== firebaseUser.uid) {
          syncedRef.current = firebaseUser.uid;
          try {
            const data = await api.auth.google({
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              avatar: firebaseUser.photoURL || undefined,
            });
            localStorage.setItem("co_patner_token", data.token);
            localStorage.setItem("co_patner_user", JSON.stringify({ ...data.user, id: data.user._id || data.user.id }));
          } catch (err) {
            console.error("Server auth sync failed:", err);
          }
        }
      }
      setLoading(false);
    });
    if (auth) getRedirectResult(auth).catch(() => {});

    const timeout = setTimeout(() => setLoading(false), 5000);
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const verifyPhoneOTP = async (_verificationId: string, otp: string) => {
    serverAuthRef.current = true;
    const phone = _verificationId;

    const data = await api.auth.phoneVerifyOtp({ phone, otp, name: "User" });

    localStorage.setItem("co_patner_token", data.token);
    localStorage.setItem("co_patner_user", JSON.stringify({ ...data.user, id: data.user._id || data.user.id }));
    if (data.user.credits != null) {
      localStorage.setItem("co_patner_credits", String(data.user.credits));
    }

    setUser({ uid: data.user._id || data.user.id, phoneNumber: phone, displayName: data.user.name } as any);
    setLoading(false);
  };

  const signOut = async () => {
    try { await firebaseSignOut(auth); } catch {}
    serverAuthRef.current = false;
    localStorage.removeItem("co_patner_token");
    localStorage.removeItem("co_patner_user");
    syncedRef.current = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, verifyPhoneOTP, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
