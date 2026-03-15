"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Calendar, User, Clock, LayoutDashboard, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import AvailabilityManager from "@/components/AvailabilityManager";

export default function DewanDashboard() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const router = useRouter();
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const dewanId = 1;

  const fetchSchedules = () => {
    fetch(`${backendUrl}/api/schedules?role=dewan&userId=${dewanId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSchedules(data);
        } else {
          console.error("Fetched schedules is not an array:", data);
          setSchedules([]);
        }
      });
  };

  useEffect(() => {
    fetchSchedules();
  }, [backendUrl]);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch(`${backendUrl}/api/schedules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      setSchedules(schedules.map(s => s.id === id ? { ...s, status } : s));
      setAnnouncement(`Permohonan telah ${status === 'confirmed' ? 'disetujui' : 'ditolak'}.`);
    }
  };

  return (
    <div className="flex flex-col bg-background text-foreground min-h-screen relative overflow-hidden transition-colors duration-500">
      <div aria-live="polite" className="sr-only">{announcement}</div>
      
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 w-full">
        <header className="mb-16 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
                Portal Legislator
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                Panel <span className="text-gradient">Dewan</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl text-lg opacity-80">
                Kelola aspirasi masyarakat dan jadwalkan pertemuan video dengan konstituen Anda secara efisien dalam platform yang modern.
              </p>
            </div>
            <div className="flex items-center gap-5 px-8 py-5 glass rounded-[2.5rem] animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-[1.2rem] flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                <LayoutDashboard size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Sesi Aktif</p>
                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Panel Kontrol</p>
              </div>
            </div>
          </div>
        </header>

        {announcement && (
          <div className="mb-12 p-8 glass border-l-4 border-secondary text-slate-900 dark:text-white rounded-[2.5rem] flex items-center gap-6 animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="p-3 bg-secondary/10 text-secondary rounded-2xl">
              <CheckCircle size={28} />
            </div>
            <span className="font-black text-lg tracking-tight">{announcement}</span>
            <button onClick={() => setAnnouncement("")} className="ml-auto p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-all">
              <XCircle size={24} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center border border-primary/10">
                  <Calendar size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight text-opacity-90">Permohonan Baru</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Aspirasi yang butuh respon cepat Anda</p>
                </div>
              </div>
              
              <div className="space-y-8">
                {schedules.length === 0 ? (
                  <div className="glass p-24 rounded-[4rem] text-center border-2 border-dashed border-slate-200 dark:border-white/5 group hover:border-primary/20 transition-all duration-700">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all border border-slate-100 dark:border-white/5">
                      <Calendar size={40} className="text-slate-300 dark:text-slate-700" />
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 font-black text-xl mb-3 tracking-widest uppercase">Kosong</p>
                    <p className="text-slate-400 dark:text-slate-600 font-bold max-w-xs mx-auto text-sm">Semua aspirasi masyarakat telah diproses. Santai sejenak!</p>
                  </div>
                ) : (
                  schedules.map(s => (
                    <div key={s.id} className="glass-card p-10 flex flex-col md:flex-row md:items-center justify-between gap-10 relative overflow-hidden group">
                      <div className="flex items-center gap-8 relative z-10">
                        <div className="relative">
                          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-[2rem] flex items-center justify-center border-4 border-white dark:border-slate-950 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                            <User size={36} />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-xl border-4 border-white dark:border-slate-950 flex items-center justify-center shadow-lg ${
                            s.status === 'confirmed' ? 'bg-secondary' : s.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'
                          }`}>
                            {s.status === 'confirmed' ? <CheckCircle className="text-white" size={14} /> : <Clock className="text-white" size={14} />}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{s.title || `Agenda Aspirasi #${s.id}`}</h4>
                          <div className="flex items-center text-sm font-bold text-slate-500 mt-2">
                            <Clock size={16} className="mr-2 text-primary" />
                            {new Date(s.startTime).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} WIB
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-5 relative z-10">
                        {s.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => updateStatus(s.id, 'rejected')}
                              className="flex-1 md:flex-none px-10 py-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black rounded-[1.8rem] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all active:scale-95 border border-transparent hover:border-red-100 dark:hover:border-red-900/40 text-xs uppercase tracking-widest"
                            >
                              Tolak
                            </button>
                            <button
                              onClick={() => updateStatus(s.id, 'confirmed')}
                              className="flex-1 md:flex-none px-10 py-5 bg-primary text-white font-black rounded-[1.8rem] shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 text-xs uppercase tracking-widest hover:-translate-y-1"
                            >
                              Setujui
                            </button>
                          </>
                        ) : (
                          <div className={`px-7 py-4 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 border shadow-sm ${
                            s.status === 'confirmed' ? 'bg-secondary/10 text-secondary border-secondary/10' : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-500 border-red-100 dark:border-red-900/20'
                          }`}>
                            {s.status === 'confirmed' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            {s.status === 'confirmed' ? 'Dikonfirmasi' : 'Ditolak'}
                          </div>
                        )}
                        
                        {s.status === 'confirmed' && (
                          <button 
                            onClick={() => router.push(`/room/${s.id}`)}
                            className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-[1.8rem] transition-all shadow-2xl active:scale-95 flex items-center gap-3 hover:-translate-y-1 text-xs uppercase tracking-widest"
                          >
                            <Video size={20} />
                            Gabung Sesi
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-1000">
            <AvailabilityManager dewanId={dewanId} onAvailabilityUpdate={fetchSchedules} />
          </div>
        </div>
      </div>
    </div>
  );
}