"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPhoneOTP: (phoneNumber: string) => Promise<string>;
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (serverAuthRef.current) {
        setLoading(false);
        return;
      }
      setUser(firebaseUser);
      if (firebaseUser && syncedRef.current !== firebaseUser.uid) {
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
      setLoading(false);
    });
    getRedirectResult(auth).catch(() => {});

    const timeout = setTimeout(() => setLoading(false), 5000);
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    serverAuthRef.current = true;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      // Firebase may not have this user; fall through to server-only login
    }

    const data = await api.auth.login(email, password);
    localStorage.setItem("co_patner_token", data.token);
    localStorage.setItem("co_patner_user", JSON.stringify({ ...data.user, id: data.user._id || data.user.id }));
    if (data.user.credits != null) {
      localStorage.setItem("co_patner_credits", String(data.user.credits));
    }

    setUser({ uid: data.user._id || data.user.id, email: data.user.email, displayName: data.user.name } as any);
    setLoading(false);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    serverAuthRef.current = true;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch {
      // Firebase may be unavailable; fall through to server-only register
    }

    const data = await api.auth.register({ email, password, name: email.split("@")[0] });
    localStorage.setItem("co_patner_token", data.token);
    localStorage.setItem("co_patner_user", JSON.stringify({ ...data.user, id: data.user._id || data.user.id }));

    setUser({ uid: data.user._id || data.user.id, email: data.user.email, displayName: data.user.name } as any);
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      await signInWithRedirect(auth, googleProvider);
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  };

  const sendPhoneOTP = async (phoneNumber: string): Promise<string> => {
    await api.auth.phoneSendOtp(phoneNumber);
    return phoneNumber;
  };

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
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, sendPhoneOTP, verifyPhoneOTP, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
