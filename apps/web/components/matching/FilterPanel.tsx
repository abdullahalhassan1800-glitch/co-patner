"use client";

import { useState } from "react";
import { MatchFilters } from "@/types";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: MatchFilters) => void;
}

export default function FilterPanel({ isOpen, onClose, onApply }: FilterPanelProps) {
  const [filters, setFilters] = useState<MatchFilters>({ gender: "all", country: "all", minAge: 18, maxAge: 99 });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-strong rounded-3xl p-8 max-w-sm w-full mx-4 animate-scale-in">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-white">Filters</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all duration-200">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Gender</label>
            <div className="flex gap-2">
              {["all", "male", "female"].map((g) => (
                <button key={g} onClick={() => setFilters({ ...filters, gender: g })}
                  className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    filters.gender === g ? "gradient-main text-white shadow-lg shadow-primary/25" : "glass text-gray-400 hover:text-white"
                  }`}>
                  {g === "all" ? "All" : g === "male" ? "Male" : "Female"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              Age Range: <span className="text-white normal-case">{filters.minAge} - {filters.maxAge}</span>
            </label>
            <div className="flex gap-3 items-center">
              <input type="range" min={18} max={99} value={filters.minAge}
                onChange={(e) => setFilters({ ...filters, minAge: Number(e.target.value) })}
                className="flex-1 accent-primary h-1.5 rounded-full" />
              <span className="text-[11px] text-gray-600 font-medium">to</span>
              <input type="range" min={18} max={99} value={filters.maxAge}
                onChange={(e) => setFilters({ ...filters, maxAge: Number(e.target.value) })}
                className="flex-1 accent-primary h-1.5 rounded-full" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Country</label>
            <select value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              className="input-main w-full rounded-2xl px-5 py-3.5 text-white appearance-none text-sm">
              <option value="all">All Countries</option>
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="JP">Japan</option>
              <option value="BR">Brazil</option>
              <option value="AU">Australia</option>
              <option value="CA">Canada</option>
            </select>
          </div>
        </div>

        <button onClick={() => { onApply(filters); onClose(); }}
          className="w-full mt-8 btn-glow py-4 rounded-2xl text-sm font-bold text-white shadow-xl shadow-primary/25">
          Apply Filters
        </button>
      </div>
    </div>
  );
}
