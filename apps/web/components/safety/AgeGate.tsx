"use client";

import { useState } from "react";

interface AgeGateProps {
  onConfirm: () => void;
}

export default function AgeGate({ onConfirm }: AgeGateProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06060A]">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-primary/[0.08] rounded-full blur-[160px] animate-orb" />
        <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-accent/[0.06] rounded-full blur-[140px] animate-orb" style={{ animationDelay: "3s" }} />
      </div>

      <div className="max-w-md w-full mx-4 text-center relative animate-scale-in">
        <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-accent/25">
          <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </div>

        <h1 className="text-3xl font-black mb-4 text-white">Age Verification</h1>
        <p className="text-gray-400 mb-8 leading-relaxed text-sm">
          This platform is for adults only. By entering, you confirm that you are at least{" "}
          <span className="text-white font-bold">18 years old</span>.
        </p>

        <div className="glass-strong rounded-2xl p-5 mb-8">
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox" checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-0.5 w-5 h-5 accent-primary rounded-lg"
            />
            <span className="text-sm text-gray-300 leading-relaxed">
              I confirm that I am 18 years of age or older, and I accept the{" "}
              <span className="text-primary-light cursor-pointer hover:underline font-medium">Terms of Service</span> and{" "}
              <span className="text-primary-light cursor-pointer hover:underline font-medium">Privacy Policy</span>.
            </span>
          </label>
        </div>

        <button
          onClick={onConfirm} disabled={!isConfirmed}
          className="w-full btn-glow py-4 rounded-2xl text-base font-bold text-white shadow-xl shadow-primary/25 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-300"
        >
          Enter Velio
        </button>

        <p className="mt-6 text-[11px] text-gray-600">
          We do not store video chats or screenshots. Your privacy comes first.
        </p>
      </div>
    </div>
  );
}
