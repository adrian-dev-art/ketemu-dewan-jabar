"use client";

import { useState, useEffect } from "react";
import { Users, Video, Star, Settings, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, meetings: 0, avgRating: 0 });
  
  useEffect(() => {
    setStats({ users: 125, meetings: 48, avgRating: 4.6 });
  }, []);

  return (
    <div className="flex flex-col bg-background text-foreground min-h-screen relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 w-full">
        <header className="mb-16 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
                Sistem Inti Manajemen
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                Control <span className="text-gradient">Center</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl text-lg opacity-80">
                Pantau seluruh aktivitas platform Ketemu Dewan secara real-time. Kelola parameter sistem dan monitor statistik vital.
              </p>
            </div>
            <div className="flex items-center gap-4 px-7 py-4 glass rounded-[2rem] border border-primary/10 animate-in fade-in slide-in-from-right-4 duration-500 shadow-xl">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-[1rem] flex items-center justify-center border border-secondary/20">
                <ShieldCheck size={24} />
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-widest">Administrator</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20 animate-in zoom-in-95 duration-700">
          <div className="glass-card p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex items-center gap-8 relative z-10">
              <div className="p-5 bg-primary/10 text-primary rounded-[1.8rem] group-hover:scale-110 transition-all duration-500 shadow-xl shadow-primary/5 border border-primary/10">
                <Users size={36} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] mb-2">Total Pengguna</p>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.users}</h3>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex items-center gap-8 relative z-10">
              <div className="p-5 bg-secondary/10 text-secondary rounded-[1.8rem] group-hover:scale-110 transition-all duration-500 shadow-xl shadow-secondary/5 border border-secondary/10">
                <Video size={36} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] mb-2">Konferensi Live</p>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.meetings}</h3>
              </div>
            </div>
          </div>

          <div className="glass-card p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex items-center gap-8 relative z-10">
              <div className="p-5 bg-amber-500/10 text-amber-500 rounded-[1.8rem] group-hover:scale-110 transition-all duration-500 shadow-xl shadow-amber-500/5 border border-amber-500/10">
                <Star size={36} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] mb-2">Rating Platform</p>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.avgRating}</h3>
              </div>
            </div>
          </div>
        </div>

        <section className="glass rounded-[4rem] overflow-hidden border-none animate-in fade-in slide-in-from-bottom-8 duration-1000 shadow-2xl">
          <div className="p-12 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-[1.2rem] flex items-center justify-center border border-white/10">
                <Settings size={22} className="text-slate-500" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight opacity-90">Log Aktivitas Platform</h3>
            </div>
            <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-xl uppercase tracking-widest">
              <Settings size={20} />
              Konfigurasi Global
            </button>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-white/5 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-black tracking-[0.25em]">
                <tr>
                  <th scope="col" className="px-12 py-8">Entitas</th>
                  <th scope="col" className="px-12 py-8">Aksi & Deskripsi</th>
                  <th scope="col" className="px-12 py-8">Stamp Waktu</th>
                  <th scope="col" className="px-12 py-8">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                      <span className="font-black text-primary uppercase tracking-widest text-xs">Masyarakat</span>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <p className="text-slate-900 dark:text-white font-black text-lg tracking-tight mb-0.5">Diskusi Pembangunan Jabar</p>
                    <p className="text-sm text-slate-400 font-bold opacity-80 uppercase tracking-widest text-[9px]">Meminta pertemuan dengan Bp. Ahmad Syarif</p>
                  </td>
                  <td className="px-12 py-10 text-slate-500 font-black text-xs uppercase tracking-widest">Baru Saja</td>
                  <td className="px-12 py-10">
                    <span className="px-6 py-2 bg-amber-500/10 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-amber-500/20 shadow-lg shadow-amber-500/5">Proses</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                      <span className="font-black text-secondary uppercase tracking-widest text-xs">Legislator</span>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <p className="text-slate-900 dark:text-white font-black text-lg tracking-tight mb-0.5">Pemerataan Pendidikan</p>
                    <p className="text-sm text-slate-400 font-bold opacity-80 uppercase tracking-widest text-[9px]">Sesi #402 telah dikonfirmasi dan siap live</p>
                  </td>
                  <td className="px-12 py-10 text-slate-500 font-black text-xs uppercase tracking-widest">15 Menit Lalu</td>
                  <td className="px-12 py-10">
                    <span className="px-6 py-2 bg-secondary/10 text-secondary rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-secondary/20 shadow-lg shadow-secondary/5">Aktif</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
    </div>
  );
}