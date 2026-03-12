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
    <div className="premium-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Clock size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Atur Ketersediaan Waktu</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Waktu Mulai</label>
            <input
              type="datetime-local"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Waktu Selesai</label>
            <input
              type="datetime-local"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-sm ${
            isSubmitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-primary'
          }`}
        >
          <Plus size={18} />
          {isSubmitting ? 'Menyimpan...' : 'Tambah Slot Waktu'}
        </button>
      </form>
    </div>
  );
}
