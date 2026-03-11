"use client";

import { Star } from "lucide-react";

interface Dewan {
  id: number;
  name: string;
  bio: string;
  rating: number;
}

interface DewanCardProps {
  dewan: Dewan;
  onSelect: (id: number) => void;
}

export default function DewanCard({ dewan, onSelect }: DewanCardProps) {
  return (
    <article className="bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-gray-100 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{dewan.name}</h3>
          <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-blue-600 dark:text-blue-400">
            <Star size={16} className="fill-current mr-1" />
            <span className="text-sm font-semibold">{dewan.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
          {dewan.bio}
        </p>
        
        <button
          onClick={() => onSelect(dewan.id)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 focus:outline-none"
          aria-label={`Buat jadwal pertemuan dengan ${dewan.name}`}
        >
          Buat Jadwal
        </button>
      </div>
    </article>
  );
}