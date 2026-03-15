"use client";

import { useState, useEffect, Suspense } from "react";
import DewanCard from "@/components/DewanCard";
import RatingSystem from "@/components/RatingSystem";
import { Clock, Calendar, CheckCircle, X, ExternalLink, Award, Video } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function MasyarakatDashboardContent() {
  const [dewanList, setDewanList] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDewan, setSelectedDewan] = useState<any | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const ratedMeetingId = searchParams.get("ratedMeetingId");
  const dewanIdForRating = searchParams.get("dewanId");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const masyarakatId = 101;

  useEffect(() => {
    fetch(`${backendUrl}/api/dewan`).then(res => res.json()).then(data => setDewanList(data));
    fetch(`${backendUrl}/api/schedules?role=masyarakat&userId=${masyarakatId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSchedules(data);
        } else {
          console.error("Fetched schedules is not an array:", data);
          setSchedules([]);
        }
      });
  }, [backendUrl]);

  const activeSchedules = schedules.filter(s => {
    if (s.status !== 'confirmed') return false;
    const startTime = new Date(s.startTime).getTime();
    const now = new Date().getTime();
    const buffer = 30 * 60 * 1000; // 30 minutes buffer
    return now >= startTime && now <= startTime + buffer;
  });

  const incomingSchedules = schedules.filter(s => {
    if (s.status !== 'confirmed') return false;
    const startTime = new Date(s.startTime).getTime();
    const now = new Date().getTime();
    return startTime > now;
  });

  const otherSchedules = schedules.filter(s => 
    s.status !== 'confirmed' || (new Date(s.startTime).getTime() + 30 * 60 * 1000 < new Date().getTime())
  );

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDewan || !selectedSlot) return;

    const res = await fetch(`${backendUrl}/api/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dewan_id: selectedDewan.id,
        masyarakat_id: masyarakatId,
        start_time: selectedSlot,
        title: meetingTitle || "Diskusi Aspirasi"
      })
    });

    if (res.ok) {
      const newSchedule = await res.json();
      setSchedules([newSchedule, ...schedules]);
      setSelectedDewan(null);
      setSelectedSlot(null);
      setMeetingTitle("");
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
    <div className="max-w-7xl mx-auto px-6 py-12 bg-background min-h-screen">
      <div aria-live="polite" className="sr-only">{announcement}</div>
      
      <header className="mb-16 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              Layanan Publik
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Portal <span className="text-gradient">Aspirasi</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl">
              Suarakan pendapat Anda secara langsung. Kami menghubungkan Anda dengan wakil rakyat Jawa Barat pilihan Anda.
            </p>
          </div>
          <div className="flex gap-4 p-2 glass rounded-2xl animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="px-6 py-3 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Dewan</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{dewanList.length}</p>
            </div>
            <div className="px-6 py-3 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Sesi Aktif</p>
              <p className="text-2xl font-black text-secondary">{schedules.filter(s => s.status === 'confirmed').length}</p>
            </div>
          </div>
        </div>
      </header>

      {announcement && (
        <div className="mb-12 p-6 glass border-l-4 border-primary text-slate-900 dark:text-white rounded-2xl flex items-center gap-4 animate-in zoom-in-95 duration-300">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <CheckCircle size={24} />
          </div>
          <span className="font-bold">{announcement}</span>
          <button onClick={() => setAnnouncement("")} className="ml-auto text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
      )}

      <section className="mb-20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Daftar Anggota Dewan</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pilih perwakilan Anda</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {dewanList.map(dewan => (
            <DewanCard key={dewan.id} dewan={dewan} onSelect={(d) => setSelectedDewan(d)} />
          ))}
          {dewanList.length === 0 && (
            <div className="col-span-full py-20 text-center glass rounded-4xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 font-bold">Mengambil data Anggota Dewan...</p>
            </div>
          )}
        </div>
      </section>

      {selectedDewan && (
        <section className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl max-w-xl w-full border border-white/20 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-2">
                <div className="inline-flex px-3 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">Pilih Jadwal</div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{selectedDewan.name}</h3>
                <p className="text-slate-500 font-bold text-sm">Silahkan pilih ketersediaan waktu untuk sesi video.</p>
              </div>
              <button 
                onClick={() => { setSelectedDewan(null); setSelectedSlot(null); }}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label htmlFor="meetingTitle" className="block text-sm font-bold text-slate-700 dark:text-slate-200 ml-1">
                  Judul Pertemuan
                </label>
                <input
                  id="meetingTitle"
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full px-5 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
                  placeholder="Contoh: Diskusi Drainase Wilayah"
                  required
                />
              </div>

              <div className="max-h-72 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {selectedDewan.availabilities?.map((slot: any) => (
                  <label 
                    key={slot.id} 
                    className={`block p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedSlot === slot.startTime 
                        ? 'border-primary bg-primary/5 shadow-inner' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-primary/20 bg-slate-50/50 dark:bg-slate-950/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="slot"
                      className="sr-only"
                      onChange={() => setSelectedSlot(slot.startTime)}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${selectedSlot === slot.startTime ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900 text-slate-400 shadow-sm'}`}>
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className={`font-black tracking-tight ${selectedSlot === slot.startTime ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                            {new Date(slot.startTime).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                            {new Date(slot.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </p>
                        </div>
                      </div>
                      {selectedSlot === slot.startTime && (
                        <CheckCircle size={24} className="text-primary animate-in zoom-in" />
                      )}
                    </div>
                  </label>
                ))}
                {(!selectedDewan.availabilities || selectedDewan.availabilities.length === 0) && (
                  <div className="py-12 text-center opacity-40 grayscale space-y-3">
                    <Calendar size={48} className="mx-auto" />
                    <p className="font-bold">Saat ini tidak ada slot yang tersedia.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { setSelectedDewan(null); setSelectedSlot(null); }}
                  className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-3xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={!selectedSlot}
                  className={`flex-1 px-8 py-5 font-black rounded-3xl transition-all active:scale-95 shadow-xl ${
                    !selectedSlot 
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-primary text-white shadow-primary/30 hover:shadow-primary/50'
                  }`}
                >
                  Kirim Permintaan
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {ratedMeetingId && (
        <section className="fixed inset-0 bg-slate-950/60 z-[60] flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => router.replace("/masyarakat")}
              className="absolute -top-16 right-0 p-3 text-white/50 hover:text-white transition-all hover:rotate-90 active:scale-90"
            >
              <X size={32} />
            </button>
            <RatingSystem onRatingSubmit={onRatingSubmit} />
          </div>
        </section>
      )}

      <section className="mb-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
            <Video size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Sesi Aktif</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sesi yang sedang berlangsung</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeSchedules.length === 0 ? (
            <div className="md:col-span-2 glass p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 font-bold">Tidak ada sesi aktif saat ini.</p>
            </div>
          ) : (
            activeSchedules.map(s => (
              <div key={s.id} className="glass p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none ring-2 ring-secondary/20">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary"></div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500 bg-secondary/10 text-secondary shadow-secondary/10">
                    <Video size={28} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{s.title || `Pertemuan #${s.id}`}</p>
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-white text-[8px] font-black uppercase animate-pulse">Live</span>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Anggota Dewan Jabar</p>
                    <div className="flex items-center text-sm font-bold text-slate-500 mt-1">
                      <Clock size={14} className="mr-2 text-secondary" />
                      Sedang Berlangsung
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => router.push(`/room/${s.id}`)}
                  className="flex items-center justify-center gap-3 text-sm bg-secondary text-white font-black py-4 px-8 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-secondary/20 active:scale-95"
                >
                  <ExternalLink size={18} />
                  Gabung Sekarang
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mb-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Jadwal Mendatang</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sesi yang telah dikonfirmasi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {incomingSchedules.length === 0 ? (
            <div className="md:col-span-2 glass p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 font-bold">Belum ada jadwal mendatang.</p>
            </div>
          ) : (
            incomingSchedules.map(s => (
              <div key={s.id} className="glass p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/50"></div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500 bg-primary/10 text-primary shadow-primary/10">
                    <Calendar size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{s.title || `Pertemuan #${s.id}`}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Anggota Dewan Jabar</p>
                    <div className="flex items-center text-sm font-bold text-slate-500 mt-1">
                      <Clock size={14} className="mr-2 text-primary" />
                      {new Date(s.startTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-primary/5 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-[0.1em]">
                  Dikonfirmasi
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Riwayat & Status</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pantau status aspirasi lainnya</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {otherSchedules.length === 0 ? (
            <div className="md:col-span-2 glass p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-800 group hover:border-primary/20 transition-all duration-700">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all border border-slate-100 dark:border-slate-800">
                <Calendar size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold text-lg mb-2">Belum ada aktivitas pertemuan.</p>
              <p className="text-slate-300 dark:text-slate-600 text-sm max-w-xs mx-auto">Mulai dengan memilih salah satu Anggota Dewan di atas untuk menyampaikan aspirasi.</p>
            </div>
          ) : (
            otherSchedules.map(s => (
              <div key={s.id} className="glass p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none opacity-80 hover:opacity-100">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  s.status === 'rejected' ? 'bg-red-500' : 
                  s.status === 'confirmed' ? 'bg-slate-300' : 'bg-amber-500'
                }`}></div>
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500 ${
                    s.status === 'rejected' ? 'bg-red-50 text-red-500' : 
                    s.status === 'confirmed' ? 'bg-slate-100 text-slate-400' : 'bg-amber-50 text-amber-500'
                  }`}>
                    {s.status === 'confirmed' ? <CheckCircle size={28} /> : <Clock size={28} />}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{s.title || `Pertemuan #${s.id}`}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Anggota Dewan Jabar</p>
                    <div className="flex items-center text-sm font-bold text-slate-500 mt-1">
                      <Calendar size={14} className="mr-2 text-slate-400" />
                      {new Date(s.startTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-5">
                  <div className={`inline-flex px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${
                    s.status === 'confirmed' 
                      ? 'bg-slate-50 text-slate-400 border-slate-200' 
                      : s.status === 'rejected'
                      ? 'bg-red-50 text-red-600 border-red-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {s.status === 'confirmed' ? 'Selesai' : s.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                  </div>
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
    <Suspense fallback={<div className="p-10 text-center text-gray-500 font-medium h-screen flex items-center justify-center">Memuat Portal Aspirasi...</div>}>
      <MasyarakatDashboardContent />
    </Suspense>
  );
}