"use client";

import { useState, useEffect, Suspense } from "react";
import DewanCard from "@/components/DewanCard";
import RatingSystem from "@/components/RatingSystem";
import { Clock, Calendar, CheckCircle, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function MasyarakatDashboardContent() {
  const [dewanList, setDewanList] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDewan, setSelectedDewan] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("");
  const [announcement, setAnnouncement] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const ratedMeetingId = searchParams.get("ratedMeetingId");
  const dewanIdForRating = searchParams.get("dewanId");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${backendUrl}/api/dewan`).then(res => res.json()).then(data => setDewanList(data));
    fetch(`${backendUrl}/api/schedules?role=masyarakat&userId=101`).then(res => res.json()).then(data => setSchedules(data));
  }, [backendUrl]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDewan || !startTime) return;

    const res = await fetch(`${backendUrl}/api/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dewan_id: selectedDewan,
        masyarakat_id: 101,
        start_time: startTime
      })
    });

    if (res.ok) {
      const newSchedule = await res.json();
      setSchedules([...schedules, newSchedule]);
      setSelectedDewan(null);
      setStartTime("");
      setAnnouncement("Permintaan pertemuan berhasil dikirim. Menunggu konfirmasi Anggota Dewan.");
    }
  };

  const onRatingSubmit = async (rating: number, comment: string) => {
    const res = await fetch(`${backendUrl}/api/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schedule_id: Number(ratedMeetingId),
        dewan_id: Number(dewanIdForRating),
        rating,
        comment
      })
    });

    if (res.ok) {
      setAnnouncement("Terima kasih atas penilaian Anda!");
      router.replace("/masyarakat");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div aria-live="polite" className="sr-only">{announcement}</div>
      
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dasbor Masyarakat</h2>
        <p className="text-gray-600 dark:text-gray-400">Sampaikan aspirasi Anda kepada wakil rakyat</p>
      </header>

      <section className="mb-12">
        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white border-l-4 border-blue-600 pl-3">Pilih Anggota Dewan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dewanList.map(dewan => (
            <DewanCard key={dewan.id} dewan={dewan} onSelect={(id) => setSelectedDewan(id)} />
          ))}
        </div>
      </section>

      {selectedDewan && (
        <section className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-zinc-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Atur Jadwal</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              <div>
                <label htmlFor="start_time" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tanggal & Waktu Konferensi
                </label>
                <input
                  id="start_time"
                  type="datetime-local"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-xl focus:ring-4 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedDewan(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-300"
                >
                  Konfirmasi Jadwal
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {ratedMeetingId && (
        <section 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rating-heading"
        >
          <div className="max-w-md w-full relative">
            <button 
              onClick={() => router.replace("/masyarakat")}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Tutup modal penilaian"
            >
              <X size={32} />
            </button>
            <div id="rating-heading" className="sr-only">Beri penilaian pengalaman pertemuan Anda</div>
            <RatingSystem onRatingSubmit={onRatingSubmit} />
          </div>
        </section>
      )}

      <section>
        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white border-l-4 border-blue-600 pl-3">Pertemuan Saya</h3>
        <div className="space-y-4">
          {schedules.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada pertemuan yang dijadwalkan.</p>
          ) : (
            schedules.map(s => (
              <div key={s.id} className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-gray-100 dark:border-zinc-700 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${s.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {s.status === 'confirmed' ? <CheckCircle size={24} /> : <ClockIcon size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">ID Konferensi: #{s.id}</p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar size={14} className="mr-1" />
                      {new Date(s.start_time).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    s.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {s.status === 'confirmed' ? 'Dikonfirmasi' : 'Menunggu'}
                  </span>
                  {s.status === 'confirmed' && (
                    <button 
                      onClick={() => router.push(`/room/${s.id}`)}
                      className="mt-2 block w-full text-xs bg-blue-600 text-white font-bold py-1 px-2 rounded hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      aria-label={`Gabung pertemuan ID ${s.id}`}
                    >
                      Gabung Sekarang
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function ClockIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
}

export default function MasyarakatDashboard() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Memuat Dasbor...</div>}>
      <MasyarakatDashboardContent />
    </Suspense>
  );
}