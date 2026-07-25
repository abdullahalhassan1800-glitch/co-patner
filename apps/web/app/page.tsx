"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
    const s = localStorage.getItem("velio_user");
    if (s) setUser(JSON.parse(s));
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-primary/[0.07] blur-[160px] animate-orb" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-secondary/[0.05] blur-[140px] animate-orb" style={{ animationDelay: "4s" }} />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] rounded-full bg-accent/[0.03] blur-[180px] animate-orb" style={{ animationDelay: "8s" }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className={`transition-all duration-1000 ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass mb-10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="text-sm text-gray-300 font-medium">50,000+ people online now</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className={`text-5xl sm:text-6xl lg:text-[5.5rem] font-black leading-[0.92] tracking-tight mb-8 transition-all duration-1000 delay-150 ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-white block">Meet New People</span>
            <span className="gradient-text block mt-1">Face to Face</span>
            <span className="text-white block mt-1">From </span>
            <span className="gradient-text-warm block mt-1">Around the World</span>
          </h1>

          {/* Sub */}
          <p className={`text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed transition-all duration-1000 delay-300 ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            Connect with people from 100+ countries through instant video chat.
            Make new friends, have real conversations &mdash;{" "}
            <span className="text-white font-semibold">completely free</span>.
          </p>

          {/* CTA */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-[450ms] ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <button
              onClick={() => router.push(user ? "/dashboard" : "/register")}
              className="btn-glow px-10 py-4.5 rounded-2xl text-lg font-bold text-white shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 h-14"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
              Start Video Chat
              <span className="text-xl ml-1">&rarr;</span>
            </button>
            {!user && (
              <button
                onClick={() => router.push("/login")}
                className="btn-ghost px-8 py-4.5 rounded-2xl text-lg font-semibold text-gray-300 hover:text-white h-14 flex items-center justify-center gap-2"
              >
                Already a member? <span className="text-primary-light font-bold">Login</span>
              </button>
            )}
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-3 gap-6 max-w-md mx-auto mt-20 transition-all duration-1000 delay-[600ms] ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {[
              { val: "50K+", label: "Active Users" },
              { val: "100+", label: "Countries" },
              { val: "1M+", label: "Chats Made" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black gradient-text">{s.val}</div>
                <div className="text-[11px] sm:text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black">
              <span className="text-white">Why </span>
              <span className="gradient-text">Velio</span>
              <span className="text-white">?</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                ),
                title: "Global Connections",
                desc: "Meet people from 100+ countries. New faces every day, endless conversations across cultures.",
                color: "from-primary/20 to-secondary/10",
              },
              {
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                ),
                title: "Safe & Private",
                desc: "No recordings stored. Stay anonymous, stay safe. Community guidelines protect everyone.",
                color: "from-secondary/20 to-emerald-500/10",
              },
              {
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                ),
                title: "Instant Matching",
                desc: "One click and you're connected. Zero delays, real conversations with real people.",
                color: "from-accent/20 to-primary/10",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="glass rounded-3xl p-8 hover-lift group"
                style={{ animationDelay: `${i * 100}ms` }}
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

      {/* How It Works */}
      <section className="relative py-24 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-16">
            <span className="text-white">How It </span>
            <span className="gradient-text">Works</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: "01", icon: "1", text: "Create Account", sub: "or join as guest" },
              { step: "02", icon: "2", text: "Set Filters", sub: "gender, age, country" },
              { step: "03", icon: "3", text: "Start Chat", sub: "talk to a stranger" },
              { step: "04", icon: "4", text: "Hit Next", sub: "meet someone new" },
            ].map((s, i) => (
              <div key={i} className="text-center group relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center text-2xl font-black gradient-text transition-all duration-300 group-hover:scale-110 group-hover:glow-violet">
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

      {/* CTA */}
      <section className="relative py-24 px-6 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-[2rem] p-12 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-secondary/[0.05]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black mb-5 text-white">
                Ready to meet someone <span className="gradient-text">new</span>?
              </h2>
              <p className="text-gray-400 mb-10 text-lg">
                Join thousands having real conversations right now.
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

      {/* Footer */}
      <footer className="relative border-t border-white/[0.04] py-10 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-glow flex items-center justify-center text-xs font-black text-white">V</div>
            <span className="font-extrabold text-sm tracking-tight text-white">Velio</span>
          </div>
          <p className="text-gray-600 text-xs">18+ only. Community guidelines apply. No videos stored.</p>
          <div className="flex gap-6 text-xs text-gray-500">
            {["Privacy", "Terms", "Support"].map((l) => (
              <a key={l} href="#" className="hover:text-white transition-colors duration-200">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
