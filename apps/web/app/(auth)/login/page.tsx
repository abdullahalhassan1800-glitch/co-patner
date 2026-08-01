"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

function getAuthError(err: any): string {
  const code = err?.code || "";
  const map: Record<string, string> = {
    "auth/invalid-phone-number": "Invalid phone number",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/quota-exceeded": "SMS quota exceeded. Please try again later.",
    "auth/invalid-verification-code": "Invalid OTP. Please try again.",
    "auth/missing-verification-code": "Please enter the OTP.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/operation-not-allowed": "Phone sign-in is not enabled in Firebase.",
    "auth/captcha-check-failed": "reCAPTCHA verification failed. Try again.",
  };
  return map[code] || err?.message || "Something went wrong";
}

export default function LoginPage() {
  const router = useRouter();
  const { sendPhoneOTP, verifyPhoneOTP, loginWithPassword, user } = useAuth();
  const [mode, setMode] = useState<"password" | "phone">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [mounted, setMounted] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOTP = async () => {
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await sendPhoneOTP(`+91${cleaned}`);
      setStep("otp");
      setCooldown(60);
    } catch (err: any) {
      setError(getAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    const value = identifier.trim();
    if (!value) {
      setError("Enter your username or email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await loginWithPassword(value, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    if (loading) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (value && index === 5 && newOtp.join("").length === 6) {
      otpRefs.current[index]?.blur();
      handleVerify(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    if (loading) return;
    const finalCode = code ?? otp.join("");
    if (finalCode.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await verifyPhoneOTP(finalCode);
      router.push("/dashboard");
    } catch (err: any) {
      setError(getAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setLoading(true);
    try {
      await sendPhoneOTP(`+91${phone.replace(/[^0-9]/g, "")}`);
      setCooldown(60);
    } catch (err: any) {
      setError(getAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (p: string) => {
    const c = p.replace(/[^0-9]/g, "");
    if (c.length > 5) return `${c.slice(0, 5)} ${c.slice(5, 10)}`;
    return c;
  };

  const maskedPhone = `+91 ${formatPhone(phone)}`;

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

          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl mb-8">
            <button
              onClick={() => { setMode("password"); setStep("phone"); setError(""); }}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mode === "password" ? "gradient-main text-white shadow-lg shadow-primary/25" : "text-gray-500 hover:text-white"}`}
            >
              Password
            </button>
            <button
              onClick={() => { setMode("phone"); setStep("phone"); setError(""); }}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mode === "phone" ? "gradient-main text-white shadow-lg shadow-primary/25" : "text-gray-500 hover:text-white"}`}
            >
              Phone OTP
            </button>
          </div>

          <div id="recaptcha-container" className="h-0 w-0 overflow-hidden" />

          {mode === "password" ? (
            <>
              <p className="text-sm font-semibold italic text-gray-400 mb-2">Welcome back</p>
              <h1 className="text-2xl lg:text-3xl font-black text-white mb-2 leading-tight">
                Login with <span className="gradient-text">password</span>
              </h1>
              <p className="text-sm text-gray-500 mb-8">
                Use your username or email to log in.
              </p>

              <div className="max-w-[426px]">
                {error && (
                  <div className="bg-accent/10 border border-accent/25 rounded-xl p-3.5 mb-5 text-sm text-accent-light flex items-center gap-2 animate-scale-in">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 font-semibold mb-2 block">Username or Email</label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="yourname or you@example.com"
                      maxLength={100}
                      autoComplete="username"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-base text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-semibold mb-2 block">Password</label>
                    <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        maxLength={72}
                        autoComplete="current-password"
                        onKeyDown={(e) => { if (e.key === "Enter") handlePasswordLogin(); }}
                        className="flex-1 bg-transparent text-base text-white placeholder-gray-500 focus:outline-none"
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

                  <button
                    onClick={handlePasswordLogin}
                    disabled={loading}
                    className="w-full btn-glow py-3.5 rounded-full text-sm font-bold text-white shadow-xl shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Logging in...
                      </span>
                    ) : "Login"}
                  </button>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-primary-light transition-colors">
                      Forgot password?
                    </Link>
                    <button onClick={() => setMode("phone")} className="text-sm text-gray-500 hover:text-primary-light transition-colors">
                      No password? Use phone OTP
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : step === "phone" ? (
            <>
              <p className="text-sm font-semibold italic text-gray-400 mb-2">No email? No problem.</p>
              <h1 className="text-2xl lg:text-3xl font-black text-white mb-2 leading-tight">
                Login / Sign Up with Phone
              </h1>
              <p className="text-sm text-gray-500 mb-8">
                Enter your phone number to receive an SMS OTP. New numbers are automatically signed up.
              </p>

              <div className="max-w-[426px]">
                {error && (
                  <div className="bg-accent/10 border border-accent/25 rounded-xl p-3.5 mb-5 text-sm text-accent-light flex items-center gap-2 animate-scale-in">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 font-semibold mb-2 block">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-3 shrink-0">
                        <span className="text-sm text-white font-semibold">🇮🇳</span>
                        <span className="text-sm text-gray-400 font-medium">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        placeholder="98765 43210"
                        maxLength={12}
                        className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-base text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                        onKeyDown={(e) => { if (e.key === "Enter") handleSendOTP(); }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || phone.replace(/[^0-9]/g, "").length < 10}
                    className="w-full btn-glow py-3.5 rounded-full text-sm font-bold text-white shadow-xl shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending OTP...
                      </span>
                    ) : "Send OTP"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep("phone"); setError(""); }}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                <span className="text-sm font-medium">Back</span>
              </button>

              <p className="text-sm font-semibold italic text-gray-400 mb-2">Check your phone</p>
              <h1 className="text-2xl lg:text-3xl font-black text-white mb-2 leading-tight">
                Enter OTP
              </h1>
              <p className="text-sm text-gray-500 mb-8">
                We sent a 6-digit SMS code to{" "}
                <span className="text-white font-semibold">{maskedPhone}</span>
              </p>

              <div className="max-w-[426px]">
                {error && (
                  <div className="bg-accent/10 border border-accent/25 rounded-xl p-3.5 mb-5 text-sm text-accent-light flex items-center gap-2 animate-scale-in">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="flex gap-2.5 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        autoFocus={i === 0}
                        disabled={loading}
                        maxLength={1}
                        className="w-12 h-14 text-center text-lg font-bold text-white bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 disabled:opacity-40"
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleVerify()}
                    disabled={loading || otp.join("").length !== 6}
                    className="w-full btn-glow py-3.5 rounded-full text-sm font-bold text-white shadow-xl shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed mt-4"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </span>
                    ) : "Verify & Login"}
                  </button>

                  <button
                    onClick={handleResend}
                    disabled={cooldown > 0 || loading}
                    className="w-full text-center text-sm text-gray-500 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                  >
                    {cooldown > 0
                      ? `Resend OTP in ${cooldown}s`
                      : "Resend OTP"}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="mt-10 pt-6 border-t border-white/[0.06]">
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, label: "Verified Profiles" },
                { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>, label: "E2E Encrypted" },
                { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>, label: "Video & Text" },
                { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>, label: "Free to Start" },
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2 group cursor-default">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 group-hover:text-primary-light group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                    {f.icon}
                  </div>
                  <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors font-medium leading-tight">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-[42%] ml-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#06060A]/20 to-[#06060A] z-10" />
        <div className="relative w-full h-full">
          <img
            src="https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_3_n_compressed.webp"
            alt=""
            className="w-full h-full object-cover rounded-l-[35px]"
          />
          <div className="absolute bottom-8 left-8 z-30 animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="text-xs font-semibold text-emerald-400">Online now</span>
            </div>
            <h3 className="text-2xl font-black text-white">Start in seconds</h3>
            <p className="text-sm text-white/60">No email needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
