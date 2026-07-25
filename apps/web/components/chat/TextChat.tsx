"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types";

interface TextChatProps {
  messages: ChatMessage[];
  isPartnerTyping: boolean;
  onSend: (message: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
}

export default function TextChat({ messages, isPartnerTyping, onSend, onTyping, onStopTyping }: TextChatProps) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
    onStopTyping();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    onTyping();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onStopTyping(), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <p className="text-gray-500 text-xs font-medium">Say hello!</p>
            <p className="text-gray-600 text-[10px] mt-1">Messages disappear after disconnect</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed ${
              msg.from === "me"
                ? "gradient-main text-white rounded-2xl rounded-br-md shadow-lg shadow-primary/15"
                : "glass text-white/90 rounded-2xl rounded-bl-md"
            }`}>
              {msg.message}
            </div>
          </div>
        ))}
        {isPartnerTyping && (
          <div className="flex justify-start">
            <div className="glass px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="dots flex gap-1">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-white/[0.04]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 input-main rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-gray-600"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl gradient-main flex items-center justify-center text-white disabled:opacity-20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-90"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
