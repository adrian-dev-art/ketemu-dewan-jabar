"use client";

import { Star, Calendar } from "lucide-react";

interface Availability {
  id: number;
  startTime: string;
  endTime: string;
}

interface Dewan {
  id: number;
  name: string;
  bio: string;
  rating: number;
  availabilities?: Availability[];
}

interface DewanCardProps {
  dewan: Dewan;
  onSelect: (dewan: Dewan) => void;
  isSelected?: boolean;
}

export default function DewanCard({ dewan, onSelect, isSelected }: DewanCardProps) {
  return (
    <article 
      onClick={() => onSelect(dewan)}
      className={`border rounded-2xl p-5 bg-card cursor-pointer transition-all duration-300 hover:shadow-premium-hover ${
        isSelected 
          ? 'border-primary ring-2 ring-primary/20 shadow-premium' 
          : 'border-border/60 hover:border-primary/40 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base shrink-0 shadow-inner">
          {dewan.name.charAt(0)}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-base font-bold font-outfit truncate">{dewan.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {dewan.bio || "Anggota DPRD Provinsi Jawa Barat."}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-full text-amber-600 shrink-0 border border-amber-100 dark:border-amber-900/30">
          <Star size={12} className="fill-current" />
          <span className="text-[10px] font-bold">{dewan.rating.toFixed(1)}</span>
        </div>
      </div>

      <button
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
          isSelected 
            ? 'bg-primary text-white shadow-lg shadow-primary/25' 
            : 'bg-muted text-muted-foreground hover:bg-primary/5 hover:text-primary'
        }`}
      >
        {isSelected ? '✓ Terpilih' : 'Pilih Dewan'}
      </button>
    </article>
  );
}