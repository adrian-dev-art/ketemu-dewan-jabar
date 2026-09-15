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
    <div className="flex flex-col h-full bg-[#0d0e14] border-l border-white/[0.08]">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 custom-scrollbar scroll-smooth"
      >
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 shadow-inner">
              <MessageSquare size={26} className="text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight">Ruang Diskusi Aspirasi</h4>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-[220px] leading-relaxed">
              Sampaikan catatan, pertanyaan, atau tanggapan tertulis selama audiensi berlangsung.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-medium text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Obrolan langsung aktif
            </div>
          </div>
        ) : (
          chatMessages.map((msg, idx) => {
            const isSelf = msg.from?.identity === localParticipant.identity;
            const senderName = msg.from?.name || msg.from?.identity || "Peserta";
            const isDewan = senderName.toLowerCase().includes("dewan") || senderName.toLowerCase().includes("h.");
            
            return (
              <div 
                key={`${msg.timestamp}-${idx}`}
                className={`flex flex-col ${isSelf ? "items-end" : "items-start"} group animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={`text-[11px] font-bold ${
                    isSelf 
                      ? "text-emerald-400" 
                      : isDewan 
                      ? "text-blue-400" 
                      : "text-zinc-300"
                  }`}>
                    {senderName}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                
                <div 
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md transition-all border ${
                    isSelf 
                      ? "bg-emerald-600 text-white border-emerald-500/40 rounded-tr-none" 
                      : "bg-zinc-800/90 border-white/10 text-zinc-100 rounded-tl-none hover:bg-zinc-800"
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
      <div className="p-3.5 bg-black/60 border-t border-white/[0.08] backdrop-blur-xl">
        <form 
          onSubmit={handleSend}
          className="relative group transition-all"
        >
          <div className="relative flex items-center bg-zinc-900/90 border border-white/15 rounded-xl p-1.5 pl-3.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik aspirasi atau tanggapan..."
              className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder:text-zinc-400 py-1.5"
              disabled={isSending}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer ${
                input.trim() && !isSending
                  ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-400 active:scale-95"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
              title="Kirim Pesan"
            >
              {isSending ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={14} className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
              )}
            </button>
          </div>
          
          <div className="mt-2 flex items-center justify-between px-1">
            <p className="text-[10px] text-zinc-400 font-medium">
              Tekan <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-white/10 text-zinc-300 font-mono text-[9px]">Enter</kbd> untuk mengirim
            </p>
            {isSending && (
              <span className="text-[10px] text-emerald-400 animate-pulse font-medium">
                Mengirim...
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
