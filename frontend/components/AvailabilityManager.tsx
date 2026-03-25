"use client";

import { useState } from "react";
import { Clock, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AvailabilityManagerProps {
  dewanId: number;
  onAvailabilityUpdate: () => void;
}

export default function AvailabilityManager({ dewanId, onAvailabilityUpdate }: AvailabilityManagerProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime || !token) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${backendUrl}/api/availability`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2.5 mb-4">
        <Clock size={16} className="text-primary" />
        <div>
          <h3 className="text-sm font-semibold">Atur Waktu</h3>
          <p className="text-xs text-muted-foreground">Tambah slot ketersediaan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Waktu Mulai</label>
          <input
            type="datetime-local"
            required
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Waktu Selesai</label>
          <input
            type="datetime-local"
            required
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            isSubmitting 
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Proses...
            </>
          ) : (
            <>
              <Plus size={14} />
              Tambah Slot
            </>
          )}
        </button>
      </form>
    </div>
  );
}
