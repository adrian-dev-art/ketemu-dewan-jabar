"use client";

import { useState } from "react";
import { Star, CheckCircle2, MessageSquare } from "lucide-react";

interface RatingSystemProps {
  onRatingSubmit: (
    scores: {
      speaking_score: number;
      context_score: number;
      time_score: number;
      responsiveness_score: number;
      solution_score: number;
    },
    comment: string
  ) => void;
}

const STAR_LABELS = ["", "Sangat Buruk", "Kurang Baik", "Cukup", "Baik", "Sangat Baik"];

const aspects = [
  {
    key: "speaking_score",
    label: "Artikulasi & Penyampaian",
    desc: "Seberapa jelas dan komunikatif dalam menyampaikan pendapat",
    icon: "🎙️",
  },
  {
    key: "context_score",
    label: "Kesesuaian & Relevansi Topik",
    desc: "Apakah diskusi fokus dan relevan dengan permasalahan yang diajukan",
    icon: "🎯",
  },
  {
    key: "time_score",
    label: "Ketepatan & Efisiensi Waktu",
    desc: "Apakah sesi berjalan tepat waktu dan efisien",
    icon: "⏱️",
  },
  {
    key: "responsiveness_score",
    label: "Daya Tanggap & Empati",
    desc: "Seberapa responsif dan empatik anggota dewan terhadap aspirasi Anda",
    icon: "🤝",
  },
  {
    key: "solution_score",
    label: "Orientasi Solusi",
    desc: "Apakah anggota dewan menawarkan solusi nyata dan tindak lanjut konkret",
    icon: "💡",
  },
];

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
          title={STAR_LABELS[star]}
        >
          <Star
            size={26}
            className={`transition-colors ${
              (hovered || value) >= star
                ? "text-amber-400 fill-amber-400"
                : "text-slate-200 dark:text-slate-700"
            }`}
          />
          <span className="sr-only">{STAR_LABELS[star]}</span>
        </button>
      ))}
      {(hovered || value) > 0 && (
        <span className="ml-2 text-xs font-medium text-amber-500">
          {STAR_LABELS[hovered || value]}
        </span>
      )}
    </div>
  );
}

export default function RatingSystem({ onRatingSubmit }: RatingSystemProps) {
  const [scores, setScores] = useState({
    speaking_score: 0,
    context_score: 0,
    time_score: 0,
    responsiveness_score: 0,
    solution_score: 0,
  });
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (key: string, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = Object.values(scores).every((v) => v > 0);

  const avgScore =
    Object.values(scores).reduce((a, b) => a + b, 0) / aspects.length;

  const handleSubmit = () => {
    setSubmitted(true);
    onRatingSubmit(scores, comment);
  };

  if (submitted) {
    return (
      <div className="border border-border rounded-xl p-8 bg-card w-full max-w-md text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 mx-auto mb-4">
          <CheckCircle2 size={28} className="text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold mb-1">Terima Kasih!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Penilaian Anda telah berhasil dikirimkan.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full">
          <Star size={14} className="text-amber-500 fill-amber-500" />
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            {avgScore.toFixed(1)} / 5.0
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Mengarahkan kembali ke portal...
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl p-6 bg-card w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-1">Penilaian Sesi</h3>
        <p className="text-sm text-muted-foreground">
          Berikan penilaian jujur Anda. Masukan ini membantu meningkatkan kualitas layanan Anggota Dewan.
        </p>
      </div>

      <div className="space-y-6">
        {aspects.map((aspect) => (
          <div key={aspect.key} className="p-4 rounded-lg bg-muted/40 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{aspect.icon}</span>
              <p className="text-sm font-semibold">{aspect.label}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{aspect.desc}</p>
            <StarRating
              value={(scores as any)[aspect.key]}
              onChange={(v) => handleRating(aspect.key, v)}
            />
          </div>
        ))}
      </div>

      <div className="mt-5 mb-5">
        <label
          htmlFor="comment"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2"
        >
          <MessageSquare size={12} />
          Umpan Balik Tambahan (Opsional)
        </label>
        <textarea
          id="comment"
          rows={3}
          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-colors placeholder:text-muted-foreground resize-none"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Berikan masukan singkat Anda untuk Anggota Dewan..."
        />
      </div>

      {isFormValid && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            Rata-rata penilaian Anda
          </span>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {avgScore.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isFormValid}
        className={`w-full font-semibold py-2.5 rounded-lg transition-all text-sm ${
          !isFormValid
            ? "bg-muted cursor-not-allowed text-muted-foreground"
            : "bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md"
        }`}
      >
        {isFormValid ? "Kirim Penilaian" : `Isi ${Object.values(scores).filter(v => v === 0).length} penilaian lagi`}
      </button>
    </div>
  );
}