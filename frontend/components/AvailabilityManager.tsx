"use client";

import { useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";

interface AvailabilityManagerProps {
  dewanId: number;
  onAvailabilityUpdate: () => void;
}

export default function AvailabilityManager({ dewanId, onAvailabilityUpdate }: AvailabilityManagerProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${backendUrl}/api/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dewan_id: dewanId,
          start_time: startTime,
          end_time: endTime
        })
      });

      if (res.ok) {
        setStartTime("");
        setEndTime("");
        onAvailabilityUpdate();
      }
    } catch (error) {
      console.error("Failed to set availability", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden border-none">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full"></div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
          <Clock size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Atur Waktu</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tambah slot ketersediaan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase ml-1">Waktu Mulai</label>
            <input
              type="datetime-local"
              required
              className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase ml-1">Waktu Selesai</label>
            <input
              type="datetime-local"
              required
              className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-black transition-all shadow-xl active:scale-[0.98] ${
            isSubmitting 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
              : 'bg-primary text-white shadow-primary/30 hover:shadow-primary/50'
          }`}
        >
          <Plus size={20} />
          {isSubmitting ? 'PROSES...' : 'TAMBAH SLOT'}
        </button>
      </form>
    </div>
  );
}
