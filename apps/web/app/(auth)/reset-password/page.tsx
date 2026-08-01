"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  const handleSubmit = async () => {
    if (!token) {
      setError("This reset link is invalid or missing a token.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || "Could not reset password. Try again.");
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
              Choose a new <span className="gradient-text">password</span>
            </h1>

            {done ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 text-sm text-emerald-400 flex items-start gap-2.5 animate-scale-in">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  <div>
                    <p className="font-semibold mb-0.5">Password updated</p>
                    <p className="text-emerald-500/80">You can now log in with your new password.</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/login")}
                  className="block w-full text-center btn-main py-3.5 rounded-full text-sm font-bold text-white shadow-lg shadow-primary/25"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-7">
                  Enter a new password for your account.
                </p>

                {error && (
                  <div className="bg-accent/10 border border-accent/25 rounded-xl p-3.5 mb-5 text-sm text-accent-light flex items-center gap-2 animate-scale-in">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">New password</label>
                    <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-3.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        maxLength={72}
                        autoComplete="new-password"
                        className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-gray-500 hover:text-white transition-colors"
                        tabIndex={-1}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Confirm new password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      maxLength={72}
                      autoComplete="new-password"
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
                        Updating...
                      </span>
                    ) : "Update Password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
