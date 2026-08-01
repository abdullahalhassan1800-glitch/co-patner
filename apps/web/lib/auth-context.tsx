"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from "react";
import {
  onAuthStateChanged,
  getRedirectResult,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  User,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sendPhoneOTP: (phoneNumber: string) => Promise<void>;
  verifyPhoneOTP: (otp: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const syncedRef = useRef<string | null>(null);
  const serverAuthRef = useRef(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

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
            const data = firebaseUser.phoneNumber
              ? await api.auth.phoneSignIn({ phone: firebaseUser.phoneNumber })
              : await api.auth.google({
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

  const sendPhoneOTP = async (phoneNumber: string) => {
    if (!auth) throw new Error("Firebase not available");
    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }
    recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {},
      "expired-callback": () => {},
    });
    const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaRef.current);
    confirmationRef.current = result;
  };

  const verifyPhoneOTP = async (otp: string) => {
    const result = confirmationRef.current;
    if (!result) throw new Error("Send OTP first");
    serverAuthRef.current = true;

    const cred = await result.confirm(otp);
    const phone = cred.user.phoneNumber || "";

    const data = await api.auth.phoneSignIn({ phone, name: "User" });

    localStorage.setItem("co_patner_token", data.token);
    localStorage.setItem("co_patner_user", JSON.stringify({ ...data.user, id: data.user._id || data.user.id }));
    if (data.user.credits != null) {
      localStorage.setItem("co_patner_credits", String(data.user.credits));
    }

    setUser({ uid: data.user._id || data.user.id, phoneNumber: phone, displayName: data.user.name } as any);
    setLoading(false);

    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }
  };

  const signOut = async () => {
    try { await firebaseSignOut(auth); } catch {}
    serverAuthRef.current = false;
    localStorage.removeItem("co_patner_token");
    localStorage.removeItem("co_patner_user");
    syncedRef.current = null;
    confirmationRef.current = null;
    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, sendPhoneOTP, verifyPhoneOTP, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
