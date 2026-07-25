"use client";

import { useState, useRef, useEffect } from "react";
import { OnlineUser, getCountryFlag } from "@/lib/data/mockUsers";

interface TextChatOverlayProps {
  user: OnlineUser;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
}

const AUTO_REPLIES = [
  "Hey! How are you? 😊",
  "Nice to meet you!",
  "What's your favorite thing to do?",
  "That's really cool!",
  "Haha, I totally agree with you.",
  "Tell me more about yourself!",
  "You seem really interesting.",
  "I love that! What else do you like?",
  "That's awesome! Where are you from?",
  "I've always wanted to try that!",
];

export default function TextChatOverlay({ user, onClose }: TextChatOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: `Hey! I'm ${user.name}. Nice to meet you! 👋`,
      fromMe: false,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { id: Date.now().toString(), text, fromMe: true, time: now }]);
    setInput("");

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: reply, fromMe: false, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
    }, 1200 + Math.random() * 1500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-primary/[0.06] rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-secondary/[0.04] rounded-full blur-[140px]" />
      </div>

      <div className="relative w-full max-w-[420px] mx-4 animate-scale-in">
        <div className="glass-strong rounded-3xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col" style={{ height: "min(600px, 85vh)" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] shrink-0">
            <div className="relative">
              <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/30" />
              <div className="absolute -bottom-0.5 -right-0.5">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 ring-2 ring-[#12121e]" />
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{user.name}, {user.age}</h3>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span>{getCountryFlag(user.country)}</span>
                <span>Online</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-300 shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${msg.fromMe ? "order-1" : ""}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.fromMe
                      ? "gradient-main text-white rounded-br-md"
                      : "bg-white/[0.06] text-gray-200 rounded-bl-md border border-white/[0.04]"
                  }`}>
                    {msg.text}
                  </div>
                  <p className={`text-[10px] text-gray-600 mt-1 ${msg.fromMe ? "text-right" : "text-left"}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.06] border border-white/[0.04]">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/[0.06] shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl gradient-main flex items-center justify-center text-white shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
