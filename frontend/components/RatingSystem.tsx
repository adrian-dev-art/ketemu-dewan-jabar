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
    <div className="premium-card p-8 w-full max-w-lg">
      <h3 className="text-2xl font-bold mb-2 text-primary">Penilaian Pertemuan</h3>
      <p className="text-gray-500 mb-8 text-sm">Berikan apresiasi atau masukan Anda terhadap kinerja Anggota Dewan.</p>
      
      <div className="space-y-8">
        {aspects.map((aspect) => (
          <div key={aspect.key}>
            <p className="text-sm font-semibold text-gray-700 mb-3">{aspect.label}</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRating(aspect.key, star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      (scores as any)[aspect.key] >= star 
                        ? 'text-secondary fill-current' 
                        : 'text-gray-200'
                    }`}
                  />
                  <span className="sr-only">{star} Bintang</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-6">
        <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-3">
          Catatan Tambahan (Opsional)
        </label>
        <textarea
          id="comment"
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-gray-900 transition-shadow"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tuliskan kesan atau pesan Anda..."
        />
      </div>

      <button
        onClick={() => onRatingSubmit(scores, comment)}
        disabled={!isFormValid}
        className={`w-full font-bold py-4 rounded-xl transition-all shadow-md active:scale-95 ${
          !isFormValid 
            ? 'bg-gray-200 cursor-not-allowed text-gray-400' 
            : 'btn-primary shadow-primary/20'
        }`}
      >
        Kirim Penilaian Lengkap
      </button>
    </div>
  );
}