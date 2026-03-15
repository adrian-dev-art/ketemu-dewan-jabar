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
    <div className="max-w-7xl mx-auto px-6 py-12 bg-background min-h-screen">
      <div aria-live="polite" className="sr-only">{announcement}</div>
      
      <header className="mb-16 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              Portal Legislator
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Portal <span className="text-gradient">Dewan</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl">
              Kelola aspirasi masyarakat dan jadwalkan pertemuan video dengan konstituen Anda secara efisien.
            </p>
          </div>
          <div className="flex items-center gap-4 px-8 py-4 glass rounded-3xl border border-primary/10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Sesi Aktif</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">Panel Kontrol</p>
            </div>
          </div>
        </div>
      </header>

      {announcement && (
        <div className="mb-12 p-6 glass border-l-4 border-secondary text-slate-900 dark:text-white rounded-2xl flex items-center gap-4 animate-in zoom-in-95 duration-300">
          <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
            <CheckCircle size={24} />
          </div>
          <span className="font-bold">{announcement}</span>
          <button onClick={() => setAnnouncement("")} className="ml-auto text-slate-400 hover:text-slate-600">
            <XCircle size={20} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Permohonan Baru</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aspirasi yang butuh respon Anda</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {schedules.length === 0 ? (
                <div className="glass p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-800 group hover:border-primary/20 transition-all duration-700">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all border border-slate-100 dark:border-slate-800">
                    <Calendar size={32} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold text-lg mb-2">Belum ada permohonan baru.</p>
                  <p className="text-slate-300 dark:text-slate-600 text-sm max-w-xs mx-auto">Semua aspirasi masyarakat telah diproses. Santai sejenak!</p>
                </div>
              ) : (
                schedules.map(s => (
                  <div key={s.id} className="glass p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-[1.5rem] flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg group-hover:scale-110 transition-transform duration-500">
                          <User size={32} />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-4 border-white dark:border-slate-900 flex items-center justify-center ${
                          s.status === 'confirmed' ? 'bg-secondary' : s.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'
                        }`}>
                          {s.status === 'confirmed' ? <CheckCircle className="text-white" size={10} /> : <Clock className="text-white" size={10} />}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{s.title || `Pertemuan #${s.id}`}</h4>
                        <div className="flex items-center text-sm font-bold text-slate-500 mt-1">
                          <Clock size={14} className="mr-2 text-primary" />
                          {new Date(s.startTime).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} WIB
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {s.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => updateStatus(s.id, 'rejected')}
                            className="flex-1 md:flex-none px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-2xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all active:scale-95"
                          >
                            Tolak
                          </button>
                          <button
                            onClick={() => updateStatus(s.id, 'confirmed')}
                            className="flex-1 md:flex-none px-8 py-3.5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
                          >
                            Setujui
                          </button>
                        </>
                      ) : (
                        <div className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border shadow-sm ${
                          s.status === 'confirmed' ? 'bg-secondary/5 text-secondary border-secondary/10' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {s.status === 'confirmed' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {s.status === 'confirmed' ? 'DISETUJUI' : 'DITOLAK'}
                        </div>
                      )}
                      
                      {s.status === 'confirmed' && (
                        <button 
                          onClick={() => router.push(`/room/${s.id}`)}
                          className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl transition-all shadow-xl active:scale-95 flex items-center gap-2"
                        >
                          <Video size={18} />
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

        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
          <AvailabilityManager dewanId={dewanId} onAvailabilityUpdate={fetchSchedules} />
        </div>
      </div>
    </div>
  );
}