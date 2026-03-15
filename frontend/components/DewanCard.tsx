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
    <article className="glass rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-none">
      <div className="relative h-32 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center glass px-3 py-1.5 rounded-xl text-amber-600 border border-amber-200">
            <Star size={16} className="fill-current mr-1.5" />
            <span className="text-sm font-black">{dewan.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
      </div>
      
      <div className="p-8 pt-0 -mt-8 relative z-20">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border-4 border-background shadow-xl flex items-center justify-center text-primary font-black text-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
          {dewan.name.charAt(0)}
        </div>
        
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-2">{dewan.name}</h3>
        
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {dewan.bio || "Anggota DPRD Provinsi Jawa Barat yang berdedikasi untuk melayani masyarakat."}
        </p>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hasAvailability ? 'bg-secondary animate-pulse' : 'bg-slate-300'}`}></div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${hasAvailability ? 'text-secondary' : 'text-slate-400'}`}>
              {hasAvailability ? 'Tersedia' : 'Sibuk'}
            </span>
          </div>
          {hasAvailability && (
            <span className="text-xs font-bold text-slate-400">
              {dewan.availabilities?.length} Slot
            </span>
          )}
        </div>
        
        <button
          onClick={() => onSelect(dewan)}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black transition-all active:scale-95 ${
            hasAvailability 
              ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50'
          }`}
          disabled={!hasAvailability}
        >
          <Calendar size={20} />
          {hasAvailability ? 'Atur Pertemuan' : 'Tidak Ada Jadwal'}
        </button>
      </div>
    </article>
  );
}