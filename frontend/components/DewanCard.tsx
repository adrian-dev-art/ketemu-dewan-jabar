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
    <article className={`border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
          {dewan.name.charAt(0)}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-sm font-semibold truncate">{dewan.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {dewan.bio || "Anggota DPRD Provinsi Jawa Barat."}
          </p>
        </div>
        <div className="flex items-center gap-1 text-amber-500 shrink-0">
          <Star size={12} className="fill-current" />
          <span className="text-xs font-medium">{dewan.rating.toFixed(1)}</span>
        </div>
      </div>

      <button
        onClick={() => onSelect(dewan)}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-xs transition-colors ${
          isSelected 
            ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' 
            : 'bg-muted text-muted-foreground hover:bg-border'
        }`}
      >
        {isSelected ? '✓ Terpilih' : '+ Pilih Dewan'}
      </button>
    </article>
  );
}