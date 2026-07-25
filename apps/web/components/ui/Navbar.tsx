"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const isActive = (p: string) => pathname === p;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "glass-strong shadow-2xl shadow-black/30" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-glow flex items-center justify-center font-black text-white text-sm shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow duration-300">
              V
            </div>
            <span className="text-lg font-extrabold tracking-tight hidden sm:block">
              <span className="text-white">Vel</span>
              <span className="gradient-text">io</span>
            </span>
          </Link>

          {/* Nav */}
          <div className="flex items-center gap-1.5">
            {user ? (
              <>
                {[
                  { href: "/dashboard", label: "Discover", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
                  { href: "/chat", label: "Chat", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg> },
                  { href: "/friends", label: "Friends", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
                  { href: "/wallet", label: "Credits", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
                ].map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive(n.href)
                        ? "gradient-main text-white shadow-lg shadow-primary/25"
                        : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {n.icon}
                    <span className="hidden sm:inline">{n.label}</span>
                  </Link>
                ))}

                <div className="w-px h-6 bg-white/[0.06] mx-1.5" />

                <button
                  onClick={() => router.push("/profile")}
                  className="w-9 h-9 rounded-full gradient-glow flex items-center justify-center text-white font-bold text-sm ring-2 ring-transparent hover:ring-primary-light/40 transition-all duration-300"
                >
                  {user.email?.charAt(0).toUpperCase()}
                </button>

                <button
                  onClick={handleLogout}
                  className="ml-1 w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-accent hover:bg-accent/10 transition-all duration-300"
                  title="Logout"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-all duration-300">
                  Login
                </Link>
                <Link href="/register" className="btn-main px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/25">
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
