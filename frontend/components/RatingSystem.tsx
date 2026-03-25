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
    <div className="border border-border rounded-xl p-6 bg-card w-full max-w-md">
      <h3 className="text-lg font-bold mb-1">Penilaian Sesi</h3>
      <p className="text-sm text-muted-foreground mb-6">Aspirasi Anda sangat berharga.</p>
      
      <div className="space-y-5">
        {aspects.map((aspect) => (
          <div key={aspect.key}>
            <p className="text-xs font-medium text-muted-foreground mb-2">{aspect.label}</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRating(aspect.key, star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={24}
                    className={`transition-colors ${
                      (scores as any)[aspect.key] >= star 
                        ? 'text-amber-500 fill-amber-500' 
                        : 'text-border hover:text-amber-300'
                    }`}
                  />
                  <span className="sr-only">{star} Bintang</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 mb-4 space-y-1.5">
        <label htmlFor="comment" className="block text-xs font-medium text-muted-foreground">
          Umpan Balik (Opsional)
        </label>
        <textarea
          id="comment"
          rows={3}
          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-colors placeholder:text-muted-foreground resize-none"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Berikan masukan singkat Anda..."
        />
      </div>

      <button
        onClick={() => onRatingSubmit(scores, comment)}
        disabled={!isFormValid}
        className={`w-full font-medium py-2.5 rounded-lg transition-colors text-sm ${
          !isFormValid 
            ? 'bg-muted cursor-not-allowed text-muted-foreground' 
            : 'bg-primary text-white hover:bg-primary-hover'
        }`}
      >
        Kirim Penilaian
      </button>
    </div>
  );
}