"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async () => {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.auth.forgotPassword(value);
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060A] flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[160px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-secondary/[0.04] blur-[140px]" />
        </div>

        <div className={`w-full max-w-[420px] relative transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 rounded-xl gradient-glow flex items-center justify-center font-black text-white text-lg shadow-lg shadow-primary/25">C</div>
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-white">Co-</span>
              <span className="gradient-text">Patner</span>
            </span>
          </Link>

          <div className="glass-strong rounded-3xl p-8 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
              Reset <span className="gradient-text">password</span>
            </h1>

            {sent ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 text-sm text-emerald-400 flex items-start gap-2.5 animate-scale-in">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                  <div>
                    <p className="font-semibold mb-0.5">Check your inbox</p>
                    <p className="text-emerald-500/80">If that email is registered, we sent a reset link. It expires in 30 minutes.</p>
                  </div>
                </div>
                <Link href="/login" className="block w-full text-center btn-main py-3.5 rounded-full text-sm font-bold text-white shadow-lg shadow-primary/25">
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-7">
                  Enter the email on your account and we will send you a link to set a new password.
                </p>

                {error && (
                  <div className="bg-accent/10 border border-accent/25 rounded-xl p-3.5 mb-5 text-sm text-accent-light flex items-center gap-2 animate-scale-in">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      maxLength={100}
                      autoComplete="email"
                      onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                      className="input-main w-full rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 text-sm"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full btn-glow py-3.5 rounded-full text-sm font-bold text-white shadow-xl shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : "Send Reset Link"}
                  </button>

                  <Link href="/login" className="block w-full text-center text-sm text-gray-500 hover:text-white transition-colors">
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
