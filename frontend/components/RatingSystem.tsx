"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface RatingSystemProps {
  onRatingSubmit: (scores: { speaking_score: number, context_score: number, time_score: number }, comment: string) => void;
}

export default function RatingSystem({ onRatingSubmit }: RatingSystemProps) {
  const [scores, setScores] = useState({ speaking_score: 0, context_score: 0, time_score: 0 });
  const [comment, setComment] = useState("");

  const aspects = [
    { key: 'speaking_score', label: 'Artikulasi & Penyampaian' },
    { key: 'context_score', label: 'Kesesuaian Konteks' },
    { key: 'time_score', label: 'Ketepatan Waktu' }
  ];

  const handleRating = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = scores.speaking_score > 0 && scores.context_score > 0 && scores.time_score > 0;

  return (
    <div className="glass p-10 w-full max-w-lg rounded-[2.5rem] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full"></div>
      
      <h3 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">Penilaian Sesi</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm font-bold">Aspirasi Anda sangat berharga bagi kami.</p>
      
      <div className="space-y-10">
        {aspects.map((aspect) => (
          <div key={aspect.key} className="space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-primary/60">{aspect.label}</p>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRating(aspect.key, star)}
                  className="focus:outline-none transition-all hover:scale-125"
                >
                  <Star
                    size={32}
                    className={`transition-all duration-300 ${
                      (scores as any)[aspect.key] >= star 
                        ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                        : 'text-slate-200 dark:text-slate-800 hover:text-amber-200'
                    }`}
                  />
                  <span className="sr-only">{star} Bintang</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 mb-8 space-y-3">
        <label htmlFor="comment" className="block text-xs font-black uppercase tracking-widest text-primary/60">
          Umpan Balik (Opsional)
        </label>
        <textarea
          id="comment"
          rows={3}
          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-400 resize-none"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Berikan masukan singkat Anda..."
        />
      </div>

      <button
        onClick={() => onRatingSubmit(scores, comment)}
        disabled={!isFormValid}
        className={`w-full font-black py-5 rounded-2xl transition-all active:scale-[0.98] ${
          !isFormValid 
            ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-400' 
            : 'bg-primary text-white shadow-xl shadow-primary/30 hover:shadow-primary/50'
        }`}
      >
        Kirim Respon
      </button>
    </div>
  );
}