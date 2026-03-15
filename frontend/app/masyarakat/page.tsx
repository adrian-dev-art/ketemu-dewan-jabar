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
    <div className="flex flex-col bg-background text-foreground min-h-screen relative overflow-hidden transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute top-[30%] right-[10%] w-[20%] h-[20%] bg-accent/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 w-full">
        <div aria-live="polite" className="sr-only">{announcement}</div>
        
        <header className="mb-20 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6 animate-in fade-in slide-in-from-left-6 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20">
                Layanan Publik Digital
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Portal <span className="text-gradient">Aspirasi</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl text-lg leading-relaxed">
                Suarakan pendapat Anda secara langsung. Kami menghubungkan Anda dengan wakil rakyat Jawa Barat pilihan Anda dalam platform yang premium dan aman.
              </p>
            </div>
            <div className="flex gap-4 p-3 glass rounded-[2.5rem] animate-in fade-in slide-in-from-right-6 duration-700">
              <div className="px-8 py-5 bg-white/5 dark:bg-white/5 backdrop-blur-md rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Total Dewan</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{dewanList.length}</p>
              </div>
              <div className="px-8 py-5 bg-white/5 dark:bg-white/5 backdrop-blur-md rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Sesi Aktif</p>
                <p className="text-3xl font-black text-gradient-secondary tracking-tighter">{schedules.filter(s => s.status === 'confirmed').length}</p>
              </div>
            </div>
          </div>
        </header>

        {announcement && (
          <div className="mb-16 p-8 glass border-l-4 border-primary text-white rounded-[2.5rem] flex items-center gap-6 animate-in slide-in-from-top-4 duration-500 shadow-2xl shadow-primary/10">
            <div className="p-3 bg-primary/20 text-primary rounded-2xl shadow-inner">
              <CheckCircle size={28} />
            </div>
            <span className="font-black text-lg tracking-tight">{announcement}</span>
            <button onClick={() => setAnnouncement("")} className="ml-auto p-2 hover:bg-white/5 rounded-full text-slate-500 transition-all">
              <X size={24} />
            </button>
          </div>
        )}

        <section className="mb-24 px-2">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
              <Award size={30} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Daftar Anggota Dewan</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mt-1">Pilih perwakilan Anda untuk berdiskusi</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {dewanList.map(dewan => (
              <DewanCard key={dewan.id} dewan={dewan} onSelect={(d) => setSelectedDewan(d)} />
            ))}
            {dewanList.length === 0 && (
              <div className="col-span-full py-32 text-center glass rounded-[3rem] border-2 border-dashed border-white/5 animate-pulse">
                <p className="text-slate-500 font-black text-xl tracking-widest uppercase">Mengambil data Legislator...</p>
              </div>
            )}
          </div>
        </section>

        {selectedDewan && (
          <section className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-6 backdrop-blur-2xl animate-in fade-in duration-500">
            <div className="bg-slate-900/90 p-12 rounded-[4rem] shadow-2xl max-w-xl w-full border border-white/10 animate-in zoom-in-95 duration-500 relative overflow-hidden">
              {/* Modal decorative blob */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none"></div>

              <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="space-y-3">
                  <div className="inline-flex px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">Konfigurasi Pertemuan</div>
                  <h3 className="text-4xl font-black text-white tracking-tighter">{selectedDewan.name}</h3>
                  <p className="text-slate-400 font-bold text-base">Tentukan waktu terbaik untuk menyampaikan aspirasi Anda.</p>
                </div>
                <button 
                  onClick={() => { setSelectedDewan(null); setSelectedSlot(null); }}
                  className="p-4 hover:bg-white/5 rounded-[1.5rem] text-slate-500 transition-all active:scale-90 border border-transparent hover:border-white/5"
                >
                  <X size={28} />
                </button>
              </div>
              
              <form onSubmit={handleScheduleSubmit} className="space-y-10 relative z-10">
                <div className="space-y-4">
                  <label htmlFor="meetingTitle" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    Subyek / Judul Pertemuan
                  </label>
                  <input
                    id="meetingTitle"
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full px-7 py-5 bg-white/5 border border-white/10 rounded-[2rem] focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-600 text-white font-bold text-lg"
                    placeholder="Contoh: Diskusi Drainase Wilayah"
                    required
                  />
                </div>

                <div className="max-h-80 overflow-y-auto pr-3 space-y-5 custom-scrollbar">
                  {selectedDewan.availabilities?.map((slot: any) => (
                    <label 
                      key={slot.id} 
                      className={`block p-7 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 group relative overflow-hidden ${
                        selectedSlot === slot.startTime 
                          ? 'border-primary bg-primary/10 shadow-[inner_0_0_20px_rgba(16,185,129,0.1)]' 
                          : 'border-white/5 hover:border-white/10 bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="slot"
                        className="sr-only"
                        onChange={() => setSelectedSlot(slot.startTime)}
                      />
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${selectedSlot === slot.startTime ? 'bg-primary text-white scale-110 shadow-primary/20' : 'bg-slate-950 text-slate-400 group-hover:scale-105'}`}>
                            <Calendar size={24} />
                          </div>
                          <div>
                            <p className={`text-xl font-black tracking-tight ${selectedSlot === slot.startTime ? 'text-white' : 'text-slate-300'}`}>
                              {new Date(slot.startTime).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${selectedSlot === slot.startTime ? 'text-primary' : 'text-slate-500'}`}>
                              Pukul {new Date(slot.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </p>
                          </div>
                        </div>
                        {selectedSlot === slot.startTime && (
                          <div className="bg-primary/20 p-2 rounded-full animate-in zoom-in-50 duration-300">
                            <CheckCircle size={24} className="text-primary" />
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                  {(!selectedDewan.availabilities || selectedDewan.availabilities.length === 0) && (
                    <div className="py-16 text-center opacity-30 grayscale space-y-6">
                      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                        <Calendar size={40} />
                      </div>
                      <p className="font-black uppercase tracking-widest text-sm">Tidak ada slot terbuka</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-6 pt-4">
                  <button
                    type="button"
                    onClick={() => { setSelectedDewan(null); setSelectedSlot(null); }}
                    className="flex-1 px-8 py-6 bg-white/5 text-slate-400 font-black rounded-[2rem] hover:bg-white/10 hover:text-white transition-all active:scale-95 border border-white/5 uppercase tracking-widest text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedSlot}
                    className={`flex-1 px-8 py-6 font-black rounded-[2rem] transition-all active:scale-95 shadow-2xl uppercase tracking-widest text-xs ${
                      !selectedSlot 
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none' 
                        : 'bg-primary text-white shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1'
                    }`}
                  >
                    Kirim Sekarang
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {ratedMeetingId && (
          <section className="fixed inset-0 bg-slate-950/90 z-[60] flex items-center justify-center p-6 backdrop-blur-3xl animate-in fade-in duration-700">
            <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-700">
              <button 
                onClick={() => router.replace("/masyarakat")}
                className="absolute -top-20 right-0 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all hover:rotate-90 active:scale-90 border border-white/5"
              >
                <X size={28} />
              </button>
              <RatingSystem onRatingSubmit={onRatingSubmit} />
            </div>
          </section>
        )}

        <section className="mb-24 px-2">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-[1.5rem] flex items-center justify-center border border-secondary/20 shadow-lg shadow-secondary/5">
              <Video size={30} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Sesi Aktif</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mt-1">Sesi pertemuan yang sedang berlangsung</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {activeSchedules.length === 0 ? (
              <div className="md:col-span-2 glass p-20 rounded-[3rem] text-center border-2 border-dashed border-white/5 group">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Video size={36} className="text-slate-700" />
                </div>
                <p className="text-slate-500 font-black text-lg tracking-widest uppercase mb-2">Ops!</p>
                <p className="text-slate-600 font-bold max-w-xs mx-auto text-sm">Belum ada konferensi video yang sedang aktif untuk Anda.</p>
              </div>
            ) : (
              activeSchedules.map(s => (
                <div key={s.id} className="glass-card p-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10 relative overflow-hidden group hover:ring-2 hover:ring-secondary/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                  <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all group-hover:scale-110 duration-700 bg-secondary/10 text-secondary shadow-secondary/20 border border-secondary/20">
                      <Video size={36} className="animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-secondary text-white text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-secondary/40">Live</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{s.title || "PERTEMUAN ASPIRASI"}</p>
                      </div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Anggota Dewan Jabar</p>
                      <div className="flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
                        <Clock size={16} className="mr-2 text-secondary" />
                        Sedang Berjalan Sekarang
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/room/${s.id}`)}
                    className="flex items-center justify-center gap-4 text-xs bg-secondary text-white font-black py-5 px-10 rounded-2xl hover:opacity-95 transition-all shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)] hover:-translate-y-1 active:scale-95 uppercase tracking-[0.2em] relative z-10"
                  >
                    <ExternalLink size={20} />
                    Gabung Sekarang
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mb-24 px-2">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
              <Calendar size={30} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Jadwal Mendatang</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mt-1">Sesi yang telah mendapatkan konfirmasi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {incomingSchedules.length === 0 ? (
              <div className="md:col-span-2 glass p-20 rounded-[3rem] text-center border-2 border-dashed border-white/5 opacity-50 underline-offset-8">
                <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Tidak ada jadwal dalam antrian</p>
              </div>
            ) : (
              incomingSchedules.map(s => (
                <div key={s.id} className="glass-card p-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10 relative overflow-hidden group">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-xl transition-all group-hover:scale-110 group-hover:-rotate-3 duration-500 bg-primary/10 text-primary border border-primary/10">
                      <Calendar size={36} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{s.title || "PERTEMUAN ASPIRASI"}</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Anggota Dewan Jabar</p>
                      <div className="flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
                        <Clock size={16} className="mr-2 text-primary" />
                        {new Date(s.startTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-2.5 rounded-2xl bg-white/5 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle size={14} />
                    Dikonfirmasi
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mb-20 px-2 opacity-90">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-14 h-14 bg-slate-900 text-slate-600 rounded-[1.5rem] flex items-center justify-center border border-white/5">
              <Clock size={30} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight text-opacity-80">Riwayat & Status</h3>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] mt-1">Pantau perkembangan aspirasi Anda</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {otherSchedules.length === 0 ? (
              <div className="md:col-span-2 glass p-24 rounded-[4rem] text-center border-2 border-dashed border-white/5 group hover:border-white/10 transition-all duration-1000">
                <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all border border-white/5 shadow-2xl">
                  <Calendar size={40} className="text-slate-800" />
                </div>
                <h4 className="text-2xl font-black text-slate-800 tracking-widest uppercase mb-4">Kosong</h4>
                <p className="text-slate-600 font-bold max-w-sm mx-auto">Mulai perjalanan aspirasi Anda dengan memilih wakil rakyat di atas.</p>
              </div>
            ) : (
              otherSchedules.map(s => (
                <div key={s.id} className="glass-card p-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10 relative overflow-hidden group opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-700">
                  <div className="flex items-center gap-8">
                    <div className={`w-20 h-20 rounded-[2.2rem] flex items-center justify-center shadow-2xl transition-all duration-700 ${
                      s.status === 'rejected' ? 'bg-red-900/10 text-red-500 border border-red-500/20' : 
                      s.status === 'confirmed' ? 'bg-slate-800/10 text-slate-500 border border-slate-500/20' : 'bg-amber-900/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {s.status === 'confirmed' ? <CheckCircle size={36} /> : <Clock size={36} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">{s.title || "PERTEMUAN ASPIRASI"}</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Anggota Dewan Jabar</p>
                      <div className="flex items-center text-sm font-bold text-slate-600 dark:text-slate-500 mt-2">
                        <Calendar size={16} className="mr-2" />
                        {new Date(s.startTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl ${
                    s.status === 'confirmed' 
                      ? 'bg-slate-800 text-slate-500 border-white/5' 
                      : s.status === 'rejected'
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {s.status === 'confirmed' ? 'Selesai' : s.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
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