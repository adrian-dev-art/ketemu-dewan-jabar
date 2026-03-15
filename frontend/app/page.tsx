"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Users, UserCog, ShieldCheck, Video } from "lucide-react";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  };

  return (
    <div className="flex-grow flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950 px-6 py-12 md:py-24">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full"></div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold tracking-wide uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Platform Aspirasi Masa Depan
          </div>
          
          <h2 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white">
            Suara Anda, <br />
            <span className="text-gradient">Aksi Mereka.</span>
          </h2>
          
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
            Menghubungkan masyarakat Jawa Barat langsung dengan wakil rakyat melalui konferensi video yang aman, transparan, dan inklusif.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => router.push('/masyarakat')}
              className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95"
            >
              <Users size={20} />
              Mulai Aspirasi
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => router.push('/dewan')}
              className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 flex items-center gap-3 active:scale-95"
            >
              <UserCog size={20} />
              Portal Dewan
            </button>
          </div>

          <div className="flex items-center gap-6 pt-8 border-t border-slate-100 dark:border-slate-800">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600"></div>
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-slate-400 italic">
              Dipercaya oleh puluhan anggota DPRD & ribuan warga.
            </p>
          </div>
        </div>

        <div className="animate-in slide-in-from-right-8 duration-700 delay-100">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative glass p-8 rounded-[2rem] shadow-2xl space-y-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
                    <Video size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Gabung Pertemuan</h3>
                    <p className="text-xs text-slate-500">Gunakan ID dari undangan Anda</p>
                  </div>
                </div>
                <ShieldCheck className="text-primary/40" size={24} />
              </div>

              <form onSubmit={handleJoin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="roomId" className="block text-sm font-bold text-slate-700 dark:text-slate-200 ml-1">
                    ID Ruangan
                  </label>
                  <input
                    id="roomId"
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-5 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
                    placeholder="Contoh: CONF-12345"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  Masuk Sekarang
                  <ArrowRight size={20} />
                </button>
              </form>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status Server</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Optimal</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Enkripsi</p>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-primary" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">End-to-End</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}