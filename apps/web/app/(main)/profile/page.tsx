"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", gender: "other", age: 18, country: "IN", interests: "" });

  useEffect(() => {
    const stored = localStorage.getItem("co_patner_user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setForm({ name: u.name || "", bio: u.bio || "", gender: u.gender || "other", age: u.age || 18, country: u.country || "IN", interests: (u.interests || []).join(", ") });
  }, [router]);

  const handleSave = async () => {
    try {
      const data = await api.user.updateProfile({ ...form, interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean) });
      setUser(data.user);
      localStorage.setItem("co_patner_user", JSON.stringify(data.user));
      setEditing(false);
    } catch {}
  };

  const getFlag = (code: string) => {
    const f: Record<string, string> = { IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", FR: "🇫🇷", JP: "🇯🇵", BR: "🇧🇷", AU: "🇦🇺", CA: "🇨🇦" };
    return f[code] || "🌍";
  };

  if (!user) return null;

  const InputField = ({ label, ...props }: any) => (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
      <input {...props} className="input-main w-full rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 text-sm" />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pt-24">
      <h1 className="text-2xl font-black mb-8 text-white">My Profile</h1>

      {editing ? (
        <div className="glass-strong rounded-3xl p-8 space-y-5 animate-scale-in">
          <InputField label="Name" type="text" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={200}
              placeholder="Tell others about yourself..."
              className="input-main w-full rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 text-sm resize-none h-24" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="input-main w-full rounded-2xl px-5 py-3.5 text-white appearance-none text-sm">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <InputField label="Age" type="number" min={18} max={99} value={form.age} onChange={(e: any) => setForm({ ...form, age: Number(e.target.value) })} />
          </div>
          <InputField label="Interests (comma separated)" value={form.interests} onChange={(e: any) => setForm({ ...form, interests: e.target.value })} placeholder="Music, Gaming, Travel..." />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setEditing(false)} className="flex-1 py-3.5 rounded-2xl glass text-gray-400 font-semibold hover:text-white transition-all duration-300 text-sm">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 btn-glow py-3.5 rounded-2xl font-bold text-white shadow-lg shadow-primary/25 text-sm">
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="glass-strong rounded-3xl overflow-hidden">
            {/* Cover */}
            <div className="h-28 relative" style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5, #06B6D4)" }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="w-24 h-24 rounded-[1.25rem] bg-[#0F0F19] border-4 border-[#0F0F19] flex items-center justify-center text-4xl font-black gradient-glow shadow-2xl shadow-primary/25">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="pt-16 pb-8 px-8 text-center">
              <h2 className="text-2xl font-black text-white">{user.name}</h2>
              <p className="text-gray-400 text-sm mt-1.5">{getFlag(user.country)} {user.country} &bull; {user.age} years</p>
              {user.bio && <p className="text-gray-300 text-sm mt-3 leading-relaxed">{user.bio}</p>}
              {user.interests?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {user.interests.map((interest: string) => (
                    <span key={interest} className="px-3 py-1 rounded-full glass text-primary-light text-xs font-medium">{interest}</span>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 mt-8">
                {[
                  { value: user.credits, label: "Credits", color: "text-primary-light" },
                  { value: user.friends?.length || 0, label: "Friends", color: "text-secondary-light" },
                  { value: user.isPremium ? "Yes" : "No", label: "Premium", color: user.isPremium ? "text-yellow-400" : "text-gray-500" },
                ].map((s) => (
                  <div key={s.label} className="glass rounded-2xl p-4">
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => setEditing(true)} className="w-full mt-5 btn-glow py-4 rounded-2xl font-bold text-white shadow-xl shadow-primary/25 text-sm">
            Edit Profile
          </button>
        </>
      )}
    </div>
  );
}
