"use client";

import { useState, useEffect } from "react";
import { Users, Video, Star, Settings, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, meetings: 0, avgRating: 0 });
  
  useEffect(() => {
    setStats({ users: 125, meetings: 48, avgRating: 4.6 });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-background min-h-screen">
      <header className="mb-16 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              Sistem Inti
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Control <span className="text-gradient">Center</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl">
              Pantau seluruh aktivitas platform Ketemu Dewan secara real-time. Kelola parameter sistem dan keamanan.
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 glass rounded-3xl border border-primary/10">
            <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Administrator</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full"></div>
          <div className="flex items-center gap-6">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Pengguna</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.users}</h3>
            </div>
          </div>
        </div>
        
        <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 blur-2xl rounded-full"></div>
          <div className="flex items-center gap-6">
            <div className="p-4 bg-secondary/10 text-secondary rounded-2xl group-hover:scale-110 transition-transform">
              <Video size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Konferensi</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.meetings}</h3>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full"></div>
          <div className="flex items-center gap-6">
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
              <Star size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Rating Platform</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.avgRating}</h3>
            </div>
          </div>
        </div>
      </div>

      <section className="glass rounded-[3rem] overflow-hidden border-none animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Log Aktivitas Platform</h3>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black rounded-2xl hover:opacity-90 transition-all active:scale-95">
            <Settings size={18} />
            Konfigurasi Global
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th scope="col" className="px-10 py-6">Entitas</th>
                <th scope="col" className="px-10 py-6">Aksi & Deskripsi</th>
                <th scope="col" className="px-10 py-6">Stamp Waktu</th>
                <th scope="col" className="px-10 py-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
              <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors group">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-black text-primary">Masyarakat</span>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <p className="text-slate-900 dark:text-white font-bold">Diskusi Jalan Rusak</p>
                  <p className="text-xs text-slate-400 mt-0.5">Meminta pertemuan dengan Bp. Ahmad Syarif</p>
                </td>
                <td className="px-10 py-8 text-slate-500 font-bold text-sm">2 Menit Lalu</td>
                <td className="px-10 py-8">
                  <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100">Pending</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors group">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    <span className="font-black text-secondary">Dewan</span>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <p className="text-slate-900 dark:text-white font-bold">Pemerataan Fasilitas Sekolah</p>
                  <p className="text-xs text-slate-400 mt-0.5">Sesi #402 telah dikonfirmasi dan siap live</p>
                </td>
                <td className="px-10 py-8 text-slate-500 font-bold text-sm">15 Menit Lalu</td>
                <td className="px-10 py-8">
                  <span className="px-4 py-1.5 bg-secondary/5 text-secondary rounded-xl text-[10px] font-black uppercase tracking-widest border border-secondary/10">Active</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}