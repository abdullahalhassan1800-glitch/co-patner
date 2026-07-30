"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LiveStreamCard from "@/components/landing/LiveStreamCard";

const LIVE_STREAMS = [
  { id: 1, name: "Sophia", age: 22, country: "US", viewerCount: 234, isLive: true, avatar: "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_3_n_compressed.webp", tag: "Popular" },
  { id: 2, name: "Emma", age: 24, country: "GB", viewerCount: 189, isLive: true, avatar: "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_4_n_compressed.webp", tag: "New" },
  { id: 3, name: "Olivia", age: 21, country: "CA", viewerCount: 312, isLive: true, avatar: "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_5_n_compressed.webp", tag: "Top Rated" },
  { id: 4, name: "Mia", age: 23, country: "AU", viewerCount: 156, isLive: true, avatar: "https://flirtbate-profile-media.ams3.cdn.digitaloceanspaces.com/qu902z6w8gq_1745733478812_compressed.webp", tag: "" },
  { id: 5, name: "Luna", age: 20, country: "FR", viewerCount: 278, isLive: true, avatar: "https://flirtbate-profile-media.ams3.cdn.digitaloceanspaces.com/9e4pg47j6g9_1761790088898.webp", tag: "Popular" },
  { id: 6, name: "Zoe", age: 25, country: "DE", viewerCount: 145, isLive: true, avatar: "https://flirtbate-profile-media.ams3.cdn.digitaloceanspaces.com/no8q0r1sfsg_1784449793329.1784449792495431", tag: "" },
  { id: 7, name: "Chloe", age: 22, country: "JP", viewerCount: 198, isLive: true, avatar: "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_3_n_compressed.webp", tag: "New" },
  { id: 8, name: "Aria", age: 24, country: "BR", viewerCount: 267, isLive: true, avatar: "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_4_n_compressed.webp", tag: "" },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [viewerCount, setViewerCount] = useState(12847);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
    const s = localStorage.getItem("co_patner_user");
    if (s) setUser(JSON.parse(s));

    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 11) - 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-primary/[0.08] blur-[160px] animate-orb" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-primary/[0.05] blur-[140px] animate-orb" style={{ animationDelay: "4s" }} />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] rounded-full bg-accent/[0.04] blur-[180px] animate-orb" style={{ animationDelay: "8s" }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,0,105,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center px-6 sm:px-8">
        {/* Hero background - blurred profile images */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#06060A] via-[#06060A]/80 to-[#06060A]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.07]">
            <img
              src="https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_3_n_compressed.webp"
              alt=""
              className="w-full h-full object-cover rounded-full blur-[80px]"
            />
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Live badge */}
          <div className={`transition-all duration-1000 ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass mb-10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-sm text-gray-300 font-medium">
                <span className="text-white font-bold">{viewerCount.toLocaleString()}</span> viewers online
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className={`text-5xl sm:text-6xl lg:text-[5.5rem] font-black leading-[0.92] tracking-tight mb-8 transition-all duration-1000 delay-150 ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="gradient-text block">Co-Patner</span>
            <span className="text-white block mt-1 text-4xl sm:text-5xl lg:text-6xl">
              Live Random <span className="gradient-text-warm">Video Chat</span>
            </span>
          </h1>

          {/* Sub */}
          <p className={`text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed transition-all duration-1000 delay-300 ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            Meet real people from 100+ countries through instant video chat.
            <span className="text-white font-semibold"> No signup required</span> &mdash;{" "}
            just click and connect.
          </p>

          {/* CTA */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-[450ms] ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <button
              onClick={() => router.push(user ? "/dashboard" : "/register")}
              className="btn-glow px-10 py-4.5 rounded-2xl text-lg font-bold text-white shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 h-14"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              Start Video Chat Free
              <span className="text-xl ml-1">&rarr;</span>
            </button>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/login")}
                  className="btn-ghost px-8 py-4.5 rounded-2xl text-lg font-semibold text-gray-300 hover:text-white h-14 flex items-center justify-center gap-2"
                >
                  Already a member? <span className="text-primary-light font-bold">Login</span>
                </button>
                <button
                  onClick={() => router.push("/phone-login")}
                  className="btn-ghost px-5 py-4.5 rounded-2xl text-base font-semibold text-gray-400 hover:text-white h-14 flex items-center justify-center gap-2 border border-white/[0.06] hover:border-white/20"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>
                  Login with Phone
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-3 gap-6 max-w-lg mx-auto mt-20 transition-all duration-1000 delay-[600ms] ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {[
              { val: "12K+", label: "Online Now" },
              { val: "180+", label: "Countries" },
              { val: "2M+", label: "Chats Made" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black gradient-text">{s.val}</div>
                <div className="text-[11px] sm:text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ===== LIVE STREAMS SECTION ===== */}
      <section className="relative py-24 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <h2 className="text-3xl sm:text-4xl font-black">
                  <span className="text-white">Live </span>
                  <span className="gradient-text">Now</span>
                </h2>
              </div>
              <p className="text-gray-500 text-sm">Watch live streams or connect directly</p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-main px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2"
            >
              View All
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Live stream grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {LIVE_STREAMS.map((stream, i) => (
              <div
                key={stream.id}
                className="animate-slide-up-fast"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
              >
                <LiveStreamCard
                  name={stream.name}
                  age={stream.age}
                  avatar={stream.avatar}
                  viewerCount={stream.viewerCount}
                  isLive={stream.isLive}
                  country={stream.country}
                  tag={stream.tag}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GIFTS SECTION ===== */}
      <section className="relative py-24 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black">
              <span className="text-white">Send </span>
              <span className="gradient-text">Gifts</span>
              <span className="text-white"> &amp; Tips</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">Show appreciation with virtual gifts during live streams</p>
          </div>

          <div className="glass rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.03]" />
            <div className="relative z-10">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {[
                  { emoji: "🌹", name: "Rose", price: 10, color: "from-pink-500/20 to-rose-500/10" },
                  { emoji: "❤️", name: "Heart", price: 25, color: "from-red-500/20 to-pink-500/10" },
                  { emoji: "🔥", name: "Fire", price: 50, color: "from-orange-500/20 to-red-500/10" },
                  { emoji: "💎", name: "Diamond", price: 100, color: "from-cyan-500/20 to-blue-500/10" },
                  { emoji: "👑", name: "Crown", price: 250, color: "from-yellow-500/20 to-amber-500/10" },
                  { emoji: "🚀", name: "Rocket", price: 500, color: "from-purple-500/20 to-indigo-500/10" },
                ].map((gift, i) => (
                  <button
                    key={gift.name}
                    className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 hover:bg-primary/[0.06] transition-all duration-300 hover:scale-105"
                  >
                    <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">{gift.emoji}</span>
                    <div className="text-center">
                      <div className="text-white font-bold text-sm">{gift.name}</div>
                      <div className="text-primary-light font-bold text-xs mt-0.5">₹{gift.price}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={() => router.push(user ? "/wallet" : "/register")}
                  className="btn-glow px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/25"
                >
                  Get Coins — Free to Start
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative py-24 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black">
              <span className="text-white">Why </span>
              <span className="gradient-text">Co-Patner</span>
              <span className="text-white">?</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">The best way to meet new people face to face</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                ),
                title: "Safe & Private",
                desc: "No recordings stored. Stay anonymous, stay safe. Community guidelines protect everyone.",
                color: "from-emerald-500/20 to-emerald-500/5",
              },
              {
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                ),
                title: "Instant Matching",
                desc: "One click and you're connected. Zero delays, real conversations with real people.",
                color: "from-primary/20 to-primary/5",
              },
              {
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                ),
                title: "Global Connections",
                desc: "Meet people from 180+ countries. New faces every day, endless conversations across cultures.",
                color: "from-secondary/20 to-secondary/5",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="glass rounded-3xl p-8 hover-lift group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 text-primary-light group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-24 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-16">
            <span className="text-white">How It </span>
            <span className="gradient-text">Works</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: "01", text: "Click Start", sub: "no signup needed" },
              { step: "02", text: "Allow Camera", sub: "for video chat" },
              { step: "03", text: "Get Matched", sub: "instantly connected" },
              { step: "04", text: "Meet People", sub: "chat or skip" },
            ].map((s, i) => (
              <div key={i} className="text-center group relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center text-2xl font-black gradient-text transition-all duration-300 group-hover:scale-110 group-hover:glow-pink">
                    {s.step}
                  </div>
                </div>
                <h4 className="font-bold text-base mb-1 text-white">{s.text}</h4>
                <p className="text-gray-500 text-xs">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative py-24 px-6 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-[2rem] p-12 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-accent/[0.05]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black mb-5 text-white">
                Join <span className="gradient-text">12,000+</span> Live Users Now
              </h2>
              <p className="text-gray-400 mb-10 text-lg">
                Meet someone new in seconds. Free to start, no credit card needed.
              </p>
              <button
                onClick={() => router.push(user ? "/dashboard" : "/register")}
                className="btn-glow px-14 py-5 rounded-2xl text-xl font-bold text-white shadow-2xl shadow-primary/40"
              >
                Start Now &mdash; Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative border-t border-white/[0.04] py-10 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-glow flex items-center justify-center text-xs font-black text-white">C</div>
            <span className="font-extrabold text-sm tracking-tight text-white">Co-Patner</span>
          </div>
          <p className="text-gray-600 text-xs">18+ only. Community guidelines apply. No videos stored.</p>
          <div className="flex gap-6 text-xs text-gray-500">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Support", href: "#" },
            ].map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-primary-light transition-colors duration-200">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
