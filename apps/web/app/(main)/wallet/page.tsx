"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Transaction } from "@/types";

const PACKAGES = [
  { amount: 49, coins: 100, badge: null, popular: false },
  { amount: 149, coins: 500, badge: "+20%", popular: false },
  { amount: 299, coins: 1000, badge: "+50%", popular: true },
  { amount: 499, coins: 2000, badge: "+100%", popular: false },
];

export default function WalletPage() {
  const router = useRouter();
  const [credits, setCredits] = useState(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("velio_user");
    if (!stored) { router.push("/login"); return; }
    setCredits(JSON.parse(stored).credits || 0);
    loadHistory();
  }, [router]);

  const loadHistory = async () => {
    try { const data = await api.wallet.getHistory(); setHistory(data.transactions); } catch {}
  };

  const handleRecharge = async (amount: number) => {
    setLoading(true);
    try {
      const data = await api.wallet.recharge(amount);
      setCredits(data.credits);
      const stored = JSON.parse(localStorage.getItem("velio_user") || "{}");
      stored.credits = data.credits;
      localStorage.setItem("velio_user", JSON.stringify(stored));
      loadHistory();
    } catch {}
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pt-24">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[160px] animate-orb" />
      </div>

      <h1 className="text-2xl font-black mb-8 text-white">Wallet</h1>

      {/* Balance Card */}
      <div className="rounded-3xl p-8 text-center mb-10 relative overflow-hidden shadow-2xl shadow-primary/20" style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5, #06B6D4)" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <p className="text-white/60 text-xs font-semibold mb-2 relative uppercase tracking-wider">Available Balance</p>
        <p className="text-5xl font-black text-white relative">{credits}</p>
        <p className="text-white/40 text-xs mt-1 relative font-medium">credits</p>
      </div>

      {/* Buy Coins */}
      <h2 className="text-lg font-bold mb-5 text-white">Buy Coins</h2>
      <div className="grid grid-cols-2 gap-4 mb-10">
        {PACKAGES.map((pkg) => (
          <button key={pkg.amount} onClick={() => handleRecharge(pkg.amount)} disabled={loading}
            className={`glass rounded-2xl p-5 text-center hover-lift transition-all duration-300 disabled:opacity-40 relative ${
              pkg.popular ? "border-primary/30 ring-1 ring-primary/20" : ""
            }`}>
            {pkg.popular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full gradient-warm text-[10px] font-bold text-white shadow-lg shadow-accent/20">
                POPULAR
              </span>
            )}
            {pkg.badge && (
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                {pkg.badge}
              </span>
            )}
            <p className="text-3xl font-black gradient-text mt-1">{pkg.coins}</p>
            <p className="text-sm text-gray-400 mt-2 font-medium">{pkg.amount}</p>
          </button>
        ))}
      </div>

      {/* Transaction History */}
      <h2 className="text-lg font-bold mb-5 text-white">Transaction History</h2>
      <div className="space-y-2.5">
        {history.length === 0 && (
          <div className="text-center py-12 glass rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">No transactions yet</p>
          </div>
        )}
        {history.map((tx) => (
          <div key={tx._id} className="glass rounded-2xl p-4 flex items-center justify-between hover-lift">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                tx.type === "recharge" ? "bg-emerald-500/10 text-emerald-400" : "bg-accent/10 text-accent"
              }`}>
                {tx.type === "recharge" ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{tx.description}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <span className={`font-black text-base ${tx.type === "recharge" ? "text-emerald-400" : "text-accent"}`}>
              {tx.type === "recharge" ? "+" : "-"}{tx.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
