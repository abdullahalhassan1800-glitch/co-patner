"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const SLIDES = [
  {
    image: "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_5_n_compressed.webp",
    name: "Mia",
    age: 20,
    country: "AU",
  },
  {
    image: "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_3_n_compressed.webp",
    name: "Zoe",
    age: 22,
    country: "CA",
  },
  {
    image: "https://flirtbate-profile-media.ams3.cdn.digitaloceanspaces.com/qu902z6w8gq_1745733478812_compressed.webp",
    name: "Lily",
    age: 21,
    country: "DE",
  },
  {
    image: "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_4_n_compressed.webp",
    name: "Iris",
    age: 23,
    country: "BR",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const code = err.code;
      if (code === "auth/email-already-in-use") setError("An account with this email already exists");
      else if (code === "auth/invalid-email") setError("Invalid email address");
      else if (code === "auth/weak-password") setError("Password must be at least 6 characters");
      else setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign-up failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060A] flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[160px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/[0.04] blur-[140px]" />
        </div>

        <div className={`w-full max-w-[420px] relative transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 rounded-xl gradient-glow flex items-center justify-center font-black text-white text-lg shadow-lg shadow-primary/25">C</div>
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-white">Co-</span>
              <span className="gradient-text">Patner</span>
            </span>
          </Link>

          {/* Tagline */}
          <p className="text-sm font-semibold italic text-gray-400 mb-2">Start chatting in seconds</p>

          {/* Heading */}
          <h1 className="text-2xl lg:text-3xl font-black text-white mb-8 leading-tight max-w-md">
            Create Your Free Account & Meet People
          </h1>

          {/* Form */}
          <div className="max-w-[426px]">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white/[0.06] border border-white/[0.08] text-white font-semibold py-3 rounded-full hover:bg-white/[0.1] transition-all duration-300 active:scale-[0.98] disabled:opacity-40"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>

            {/* Phone */}
            <button
              type="button"
              onClick={() => router.push("/phone-login")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white/[0.06] border border-white/[0.08] text-white font-semibold py-3 rounded-full hover:bg-white/[0.1] transition-all duration-300 active:scale-[0.98] disabled:opacity-40"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>
              Sign up with Phone
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Or</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            {error && (
              <div className="bg-accent/10 border border-accent/25 rounded-xl p-3.5 mb-5 text-sm text-accent-light flex items-center gap-2 animate-scale-in">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3">
              {/* Email */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300"
              />

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 characters)"
                  required
                  minLength={6}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-glow py-3.5 rounded-full text-sm font-bold text-white shadow-xl shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : "Sign up"}
              </button>
            </form>

            <p className="text-center text-[11px] text-gray-600 mt-5">
              By signing up, you agree to our{" "}
              <a href="#" className="text-gray-400 hover:text-white transition-colors underline">Terms of Use</a>
            </p>

            <p className="text-center text-xs text-gray-500 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-white font-bold underline hover:text-primary-light transition-colors">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right: Image Carousel */}
      <div className="hidden lg:flex w-[42%] ml-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#06060A]/20 to-[#06060A] z-10" />

        <div className="relative w-full h-full">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                i === currentSlide
                  ? "opacity-100 scale-100 z-20"
                  : i === (currentSlide + 1) % SLIDES.length
                    ? "opacity-40 scale-95 blur-sm z-10"
                    : "opacity-0 scale-90 z-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.name}
                className="w-full h-full object-cover rounded-l-[35px]"
                loading={i === 0 ? "eager" : "lazy"}
              />
              {i === currentSlide && (
                <div className="absolute bottom-8 left-8 z-30 animate-slide-up">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">Online now</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{slide.name}, {slide.age}</h3>
                  <p className="text-sm text-white/60">{slide.country}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-8 right-8 z-30 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? "bg-white w-8" : "bg-white/30 hover:bg-white/50 w-2.5"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Feature bar */}
      <div className="hidden lg:flex absolute bottom-0 left-0 w-[58%] z-20 px-10 pb-10">
        <div className="w-full max-w-[580px]">
          <div className="flex items-start justify-between gap-3">
            {[
              { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, label: "Verified Profiles" },
              { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>, label: "End-to-End Encrypted" },
              { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>, label: "Video & Text Chat" },
              { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>, label: "Free to Start" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center group cursor-default flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-gray-400 group-hover:text-primary-light group-hover:bg-primary/10 transition-all duration-300 mb-2 shrink-0">
                  {f.icon}
                </div>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors font-medium leading-tight">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
