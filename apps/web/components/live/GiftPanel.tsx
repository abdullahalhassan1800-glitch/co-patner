"use client";

import { useState } from "react";

interface Gift {
  id: string;
  emoji: string;
  name: string;
  price: number;
}

const GIFTS: Gift[] = [
  { id: "rose", emoji: "🌹", name: "Rose", price: 10 },
  { id: "heart", emoji: "❤️", name: "Heart", price: 25 },
  { id: "fire", emoji: "🔥", name: "Fire", price: 50 },
  { id: "diamond", emoji: "💎", name: "Diamond", price: 100 },
  { id: "crown", emoji: "👑", name: "Crown", price: 250 },
  { id: "rocket", emoji: "🚀", name: "Rocket", price: 500 },
];

interface GiftPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSendGift: (gift: Gift) => void;
}

export default function GiftPanel({ isOpen, onClose, onSendGift }: GiftPanelProps) {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [sentAnim, setSentAnim] = useState(false);

  const handleSend = () => {
    if (!selectedGift) return;
    setSentAnim(true);
    onSendGift(selectedGift);
    setTimeout(() => {
      setSentAnim(false);
      setSelectedGift(null);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-20">
      <div className="glass-strong rounded-2xl p-4 shadow-2xl shadow-black/50 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Send a Gift</h3>
          <button onClick={onClose} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Gifts grid */}
        <div className="grid grid-cols-6 gap-2 mb-3">
          {GIFTS.map((gift) => (
            <button
              key={gift.id}
              onClick={() => setSelectedGift(gift)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 active:scale-90 ${
                selectedGift?.id === gift.id
                  ? "bg-primary/20 border border-primary/40 scale-110"
                  : "bg-white/[0.04] border border-transparent hover:bg-white/[0.08]"
              }`}
            >
              <span className="text-xl">{gift.emoji}</span>
              <span className="text-[9px] text-gray-500 font-medium">₹{gift.price}</span>
            </button>
          ))}
        </div>

        {/* Send button */}
        {selectedGift && (
          <button
            onClick={handleSend}
            className="w-full py-2.5 rounded-xl gradient-main text-xs font-bold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
          >
            {sentAnim ? (
              <span className="flex items-center justify-center gap-2">
                <span className="text-lg">{selectedGift.emoji}</span>
                Sent!
              </span>
            ) : (
              `Send ${selectedGift.emoji} ${selectedGift.name} — ₹${selectedGift.price}`
            )}
          </button>
        )}
      </div>
    </div>
  );
}
