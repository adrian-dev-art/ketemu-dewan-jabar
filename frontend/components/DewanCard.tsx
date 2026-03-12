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
    <article className="premium-card overflow-hidden group">
      <div className="h-2 bg-primary"></div>
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{dewan.name}</h3>
          <div className="flex items-center bg-accent/10 px-3 py-1.5 rounded-xl text-accent border border-accent/20">
            <Star size={16} className="fill-current mr-1.5" />
            <span className="text-sm font-bold">{dewan.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <p className="text-gray-500 mb-8 text-sm leading-relaxed line-clamp-3 min-h-[4.5rem]">
          {dewan.bio || "Tidak ada biodata tersedia."}
        </p>

        <div className="flex items-center gap-2 mb-6 text-sm">
          <div className={`w-2 h-2 rounded-full ${hasAvailability ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className={hasAvailability ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {hasAvailability ? `${dewan.availabilities?.length} Slot Tersedia` : 'Belum Ada Jadwal'}
          </span>
        </div>
        
        <button
          onClick={() => onSelect(dewan)}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
            hasAvailability 
              ? 'btn-primary shadow-primary/20' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!hasAvailability}
        >
          <Calendar size={18} />
          {hasAvailability ? 'Lihat Jadwal' : 'Tidak Tersedia'}
        </button>
      </div>
    </article>
  );
}