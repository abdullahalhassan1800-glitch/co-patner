"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function SetupAccountPage() {
  const router = useRouter();
  const { completeAccount } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirm: "",
    email: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("co_patner_user");
      const token = localStorage.getItem("co_patner_token");
      if (!stored || !token) {
        router.replace("/login");
        return;
      }
      const u = JSON.parse(stored);
      if (u.username) {
        router.replace(localStorage.getItem("co_patner_onboarded") === "1" ? "/dashboard" : "/setup-profile");
      }
    } catch {}
    setLoading(false);
  }, [router]);

  const handleSave = async () => {
    const username = form.username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError("Username must be 3-20 characters (letters, numbers, underscore)");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await completeAccount({
        username,
        password: form.password,
        email: form.email.trim() || undefined,
      });
      router.push(localStorage.getItem("co_patner_onboarded") === "1" ? "/dashboard" : "/setup-profile");
    } catch (err: any) {
      setError(err?.message || "Could not save account. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06060A] flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060A] flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[160px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-secondary/[0.04] blur-[140px]" />
        </div>

        <div className={`w-full max-w-[480px] relative transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Link href="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-glow flex items-center justify-center font-black text-white text-lg shadow-lg shadow-primary/25">C</div>
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-white">Co-</span>
              <span className="gradient-text">Patner</span>
            </span>
          </Link>

          <div className="glass-strong rounded-3xl p-8 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
              Create your <span className="gradient-text">account</span>
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              Pick a username and a password so you can log in on any device.
            </p>

            {error && (
              <div className="bg-accent/10 border border-accent/25 rounded-xl p-3.5 mb-5 text-sm text-accent-light flex items-center gap-2 animate-scale-in">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Username *</label>
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-3.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
                  <span className="text-sm text-gray-500 font-semibold">@</span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="yourname"
                    maxLength={20}
                    autoComplete="username"
                    className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-gray-600 mt-1.5">Letters, numbers and underscore. This is how friends find you.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Password *</label>
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-3.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Confirm password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat your password"
                  maxLength={72}
                  autoComplete="new-password"
                  className="input-main w-full rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Email (optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  maxLength={100}
                  autoComplete="email"
                  className="input-main w-full rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 text-sm"
                />
                <p className="text-[11px] text-gray-600 mt-1.5">Needed to reset your password if you forget it.</p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full btn-glow py-4 rounded-full text-sm font-bold text-white shadow-xl shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
