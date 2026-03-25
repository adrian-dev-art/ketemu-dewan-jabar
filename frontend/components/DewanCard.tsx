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
}

export default function DewanCard({ dewan, onSelect }: DewanCardProps) {
  const hasAvailability = dewan.availabilities && dewan.availabilities.length > 0;

  return (
    <article className="border border-border rounded-lg p-4 bg-card hover:border-foreground/20 transition-colors">
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

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${hasAvailability ? 'bg-primary' : 'bg-muted-foreground/30'}`}></div>
          <span className={`text-xs font-medium ${hasAvailability ? 'text-primary' : 'text-muted-foreground'}`}>
            {hasAvailability ? 'Tersedia' : 'Sibuk'}
          </span>
        </div>
        {hasAvailability && (
          <span className="text-xs text-muted-foreground">
            {dewan.availabilities?.length} slot
          </span>
        )}
      </div>
      
      <button
        onClick={() => onSelect(dewan)}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-xs transition-colors ${
          hasAvailability 
            ? 'bg-primary text-white hover:bg-primary-hover' 
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
        disabled={!hasAvailability}
      >
        <Calendar size={14} />
        {hasAvailability ? 'Atur Pertemuan' : 'Tidak Ada Jadwal'}
      </button>
    </article>
  );
}