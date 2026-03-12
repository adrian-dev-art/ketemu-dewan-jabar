"use client";

import { useState, useEffect, Suspense } from "react";
import DewanCard from "@/components/DewanCard";
import RatingSystem from "@/components/RatingSystem";
import { Clock, Calendar, CheckCircle, X, ExternalLink, Award } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function MasyarakatDashboardContent() {
  const [dewanList, setDewanList] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDewan, setSelectedDewan] = useState<any | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const ratedMeetingId = searchParams.get("ratedMeetingId");
  const dewanIdForRating = searchParams.get("dewanId");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const masyarakatId = 101;

  useEffect(() => {
    fetch(`${backendUrl}/api/dewan`).then(res => res.json()).then(data => setDewanList(data));
    fetch(`${backendUrl}/api/schedules?role=masyarakat&userId=${masyarakatId}`).then(res => res.json()).then(data => setSchedules(data));
  }, [backendUrl]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDewan || !selectedSlot) return;

    const res = await fetch(`${backendUrl}/api/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dewan_id: selectedDewan.id,
        masyarakat_id: masyarakatId,
        start_time: selectedSlot
      })
    });

    if (res.ok) {
      const newSchedule = await res.json();
      setSchedules([newSchedule, ...schedules]);
      setSelectedDewan(null);
      setSelectedSlot(null);
      setAnnouncement("Permohonan pertemuan berhasil dikirim. Menunggu konfirmasi Anggota Dewan.");
    } else {
      const error = await res.json();
      setAnnouncement(`Gagal: ${error.error}`);
    }
  };

  const onRatingSubmit = async (scores: any, comment: string) => {
    const res = await fetch(`${backendUrl}/api/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schedule_id: Number(ratedMeetingId),
        dewan_id: Number(dewanIdForRating),
        speaking_score: scores.speaking_score,
        context_score: scores.context_score,
        time_score: scores.time_score,
        comment
      })
    });

    if (res.ok) {
      setAnnouncement("Terima kasih atas penilaian Anda!");
      setTimeout(() => router.replace("/masyarakat"), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-background min-h-screen">
      <div aria-live="polite" className="sr-only">{announcement}</div>
      
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-secondary"></div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Layanan Aspirasi Online</h2>
          <p className="text-gray-500 font-medium">Sampaikan aspirasi anda secara langsung melalui konferensi daring.</p>
        </div>
      </header>

      {announcement && (
        <div className="mb-8 p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={20} />
          <span className="font-bold text-sm">{announcement}</span>
        </div>
      )}

      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Award className="mr-3 text-primary" /> Pilih Anggota Dewan
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {dewanList.map(dewan => (
            <DewanCard key={dewan.id} dewan={dewan} onSelect={(d) => setSelectedDewan(d)} />
          ))}
        </div>
      </section>

      {selectedDewan && (
        <section className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-border animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Pilih Jadwal</h3>
                <p className="text-gray-500 text-sm mt-1">Ketersediaan untuk {selectedDewan.name}</p>
              </div>
              <button 
                onClick={() => { setSelectedDewan(null); setSelectedSlot(null); }}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              <div className="max-h-60 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {selectedDewan.availabilities?.map((slot: any) => (
                  <label 
                    key={slot.id} 
                    className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedSlot === slot.startTime 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="slot"
                      className="sr-only"
                      onChange={() => setSelectedSlot(slot.startTime)}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className={selectedSlot === slot.startTime ? 'text-primary' : 'text-gray-400'} />
                        <span className={`font-bold ${selectedSlot === slot.startTime ? 'text-primary' : 'text-gray-700'}`}>
                          {new Date(slot.startTime).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{new Date(slot.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </label>
                ))}
                {(!selectedDewan.availabilities || selectedDewan.availabilities.length === 0) && (
                  <p className="text-center text-gray-400 py-4 italic">Tidak ada slot tersedia.</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setSelectedDewan(null); setSelectedSlot(null); }}
                  className="flex-1 px-6 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedSlot}
                  className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all ${
                    !selectedSlot ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-primary shadow-lg shadow-primary/20'
                  }`}
                >
                  Konfirmasi Jadwal
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {ratedMeetingId && (
        <section className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-md h-full w-full">
          <div className="relative w-full max-w-lg">
            <button 
              onClick={() => router.replace("/masyarakat")}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>
            <RatingSystem onRatingSubmit={onRatingSubmit} />
          </div>
        </section>
      )}

      <section>
        <h3 className="text-xl font-bold mb-8 text-gray-800 flex items-center">
          <Calendar className="mr-3 text-primary" /> Pertemuan Saya
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.length === 0 ? (
            <div className="md:col-span-2 bg-white p-12 rounded-3xl text-center border-2 border-dashed border-border group hover:border-primary/30 transition-colors">
              <p className="text-gray-400 font-medium">Belum ada pertemuan yang dijadwalkan.</p>
            </div>
          ) : (
            schedules.map(s => (
              <div key={s.id} className="premium-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${s.status === 'confirmed' ? 'bg-primary' : 'bg-secondary'}`}></div>
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl ${s.status === 'confirmed' ? 'bg-primary/5 text-primary' : 'bg-secondary/5 text-secondary'}`}>
                    {s.status === 'confirmed' ? <CheckCircle size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">ID Konferensi: #{s.id}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1 font-medium">
                      <Calendar size={14} className="mr-1.5" />
                      {new Date(s.startTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-3">
                  <span className={`inline-block px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                    s.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {s.status === 'confirmed' ? 'Dikonfirmasi' : 'Menunggu'}
                  </span>
                  {s.status === 'confirmed' && (
                    <button 
                      onClick={() => router.push(`/room/${s.id}`)}
                      className="flex items-center justify-center gap-2 text-sm bg-primary text-white font-bold py-2 px-4 rounded-xl hover:bg-primary-hover transition-all shadow-md shadow-primary/20 active:scale-95"
                    >
                      <ExternalLink size={16} />
                      Gabung
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

export default function MasyarakatDashboard() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500 font-medium h-screen flex items-center justify-center">Memuat Dasbor Masyarakat...</div>}>
      <MasyarakatDashboardContent />
    </Suspense>
  );
}