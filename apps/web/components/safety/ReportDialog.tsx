"use client";

import { useState } from "react";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => void;
}

const REASONS = [
  { value: "inappropriate_content", label: "Inappropriate Content", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg> },
  { value: "harassment", label: "Harassment", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg> },
  { value: "fake_profile", label: "Fake Profile", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  { value: "spam", label: "Spam", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14H7L5 6" /></svg> },
  { value: "underage", label: "Underage User", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
  { value: "other", label: "Other", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
];

export default function ReportDialog({ isOpen, onClose, onSubmit }: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit(selectedReason, description);
    setSelectedReason("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-strong rounded-3xl p-8 max-w-md w-full mx-4 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
            </div>
            Report User
          </h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all duration-200">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-5">Why are you reporting this user?</p>

        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {REASONS.map((r) => (
            <button key={r.value} onClick={() => setSelectedReason(r.value)}
              className={`p-4 rounded-2xl text-left text-[13px] font-medium transition-all duration-300 flex items-center gap-2.5 ${
                selectedReason === r.value
                  ? "bg-primary/15 border border-primary/40 text-white shadow-lg shadow-primary/10"
                  : "glass text-gray-400 hover:text-white hover:border-white/[0.08]"
              }`}>
              {r.icon}
              {r.label}
            </button>
          ))}
        </div>

        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details (optional)..."
          className="input-main w-full rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-600 resize-none h-24 mb-5" />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl glass text-gray-400 font-semibold hover:text-white transition-all duration-300 text-sm">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!selectedReason}
            className="flex-1 py-3.5 rounded-2xl bg-accent text-white font-bold disabled:opacity-25 hover:bg-accent-dark transition-all duration-300 shadow-lg shadow-accent/15 text-sm">
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
