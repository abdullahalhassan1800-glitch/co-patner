"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const COUNTRIES: Record<string, string> = {
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
  BR: "Brazil",
  IT: "Italy",
  ES: "Spain",
  AE: "UAE",
  PK: "Pakistan",
  BD: "Bangladesh",
  NP: "Nepal",
  LK: "Sri Lanka",
};

function getFlag(code: string) {
  const f: Record<string, string> = { IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", FR: "🇫🇷", JP: "🇯🇵", BR: "🇧🇷", AU: "🇦🇺", CA: "🇨🇦", IT: "🇮🇹", ES: "🇪🇸", AE: "🇦🇪", PK: "🇵🇰", BD: "🇧🇩", NP: "🇳🇵", LK: "🇱🇰" };
  return f[code] || "🌍";
}

function resizeImage(file: File, maxSize = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = () => reject(new Error("Invalid image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function SetupProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [form, setForm] = useState({
    name: "",
    bio: "",
    gender: "other",
    age: 18,
    country: "IN",
    interests: "",
  });

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("co_patner_user");
      const token = localStorage.getItem("co_patner_token");
      if (!stored || !token) {
        router.replace("/login");
        return;
      }
      if (localStorage.getItem("co_patner_onboarded") === "1") {
        router.replace("/dashboard");
        return;
      }
      const u = JSON.parse(stored);
      setForm({
        name: u.name && u.name !== "User" ? u.name : "",
        bio: u.bio || "",
        gender: u.gender || "other",
        age: u.age || 18,
        country: u.country || "IN",
        interests: (u.interests || []).join(", "),
      });
      setAvatar(u.avatar && u.avatar !== "/default-avatar.png" ? u.avatar : "");
    } catch {}
    setLoading(false);
  }, [router]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setError("");
      const dataUrl = await resizeImage(file);
      setAvatar(dataUrl);
    } catch {
      setError("Could not upload this image. Try another one.");
    }
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (name.length < 2 || name === "User") {
      setError("Please enter your name");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const data = await api.user.updateProfile({
        ...form,
        name,
        avatar: avatar || undefined,
        interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
      });
      localStorage.setItem("co_patner_user", JSON.stringify({ ...data.user, id: data.user._id || data.user.id }));
      localStorage.setItem("co_patner_onboarded", "1");
      if (data.user.credits != null) {
        localStorage.setItem("co_patner_credits", String(data.user.credits));
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Could not save profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

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
              Set up your <span className="gradient-text">profile</span>
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              Add a photo and a few details so people know who you are.
            </p>

            {error && (
              <div className="bg-accent/10 border border-accent/25 rounded-xl p-3.5 mb-5 text-sm text-accent-light flex items-center gap-2 animate-scale-in">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Photo */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="group relative w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-white/20 hover:border-primary/60 transition-all duration-300 flex items-center justify-center bg-white/[0.03]"
                >
                  {avatar ? (
                    <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-primary-light transition-colors">
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" ry="3" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>
                      <span className="text-[10px] font-semibold">Add Photo</span>
                    </div>
                  )}
                  {avatar && (
                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-bold text-white">Change</span>
                    </span>
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                <p className="text-[11px] text-gray-600 mt-2">Photo is optional but recommended</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  maxLength={40}
                  className="input-main w-full rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 text-sm"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  maxLength={200}
                  placeholder="Tell others about yourself..."
                  className="input-main w-full rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 text-sm resize-none h-24"
                />
              </div>

              {/* Gender + Age */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="input-main w-full rounded-2xl px-5 py-3.5 text-white appearance-none text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    min={18}
                    max={99}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                    className="input-main w-full rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 text-sm"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Country</label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="input-main w-full rounded-2xl px-5 py-3.5 text-white appearance-none text-sm"
                >
                  {Object.entries(COUNTRIES).map(([code, label]) => (
                    <option key={code} value={code}>{getFlag(code)} {label}</option>
                  ))}
                </select>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Interests (comma separated)</label>
                <input
                  type="text"
                  value={form.interests}
                  onChange={(e) => setForm({ ...form, interests: e.target.value })}
                  placeholder="Music, Gaming, Travel..."
                  className="input-main w-full rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 text-sm"
                />
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
                  "Save & Continue"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
