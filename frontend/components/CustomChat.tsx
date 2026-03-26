"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat, useLocalParticipant } from "@livekit/components-react";
import { Send, MessageSquare, Clock, User } from "lucide-react";

export default function CustomChat() {
  const { chatMessages, send, isSending } = useChat();
  const { localParticipant } = useLocalParticipant();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isSending) {
      try {
        await send(input);
        setInput("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] border-l border-white/[0.05]">
      {/* Header handled by parent or keep simple here */}
      
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar scroll-smooth"
      >
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none text-center">
            <MessageSquare size={40} className="mb-4 text-emerald-500/50" />
            <p className="text-sm font-semibold text-zinc-400">Diskusi Masih Kosong</p>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Aspirasi Dimulai Di Sini</p>
          </div>
        ) : (
          chatMessages.map((msg, idx) => {
            const isSelf = msg.from?.identity === localParticipant.identity;
            
            return (
              <div 
                key={`${msg.timestamp}-${idx}`}
                className={`flex flex-col ${isSelf ? "items-end" : "items-start"} group animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelf ? "text-emerald-400" : "text-zinc-500"}`}>
                    {msg.from?.name || msg.from?.identity || "Anonim"}
                  </span>
                  <span className="text-[9px] text-zinc-600 font-medium">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                
                <div 
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-lg transition-all border ${
                    isSelf 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-50 rounded-tr-none" 
                      : "bg-white/[0.03] border-white/[0.06] text-zinc-200 rounded-tl-none group-hover:bg-white/[0.05]"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/40 border-t border-white/[0.05] backdrop-blur-xl">
        <form 
          onSubmit={handleSend}
          className="relative group transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex items-center bg-[#121216] border border-white/[0.08] rounded-2xl p-1.5 pl-4 focus-within:border-emerald-500/30 transition-all shadow-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik aspirasi Anda..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-100 placeholder:text-zinc-600 py-2"
              disabled={isSending}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                input.trim() && !isSending
                  ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={16} className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
              )}
            </button>
          </div>
          
          <div className="mt-2 flex items-center justify-between px-2">
            <p className="text-[9px] text-zinc-600 font-medium tracking-tight">
              Tekan <kbd className="bg-zinc-900 px-1 rounded border border-white/10">Enter</kbd> untuk mengirim
            </p>
            {isSending && (
              <span className="text-[9px] text-emerald-500/70 animate-pulse font-medium">
                Mengirim...
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
