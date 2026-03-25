"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Users, UserCog, Video, ShieldCheck } from "lucide-react";

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
    <div className="flex-grow flex flex-col px-4 sm:px-6 py-16 md:py-24">
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left: Hero */}
        <div className="space-y-6">
          <p className="text-xs font-medium text-primary tracking-wide uppercase">
            Platform Aspirasi Digital
          </p>
          
          <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            Suara Anda, <br />
            <span className="text-primary">Aksi Mereka.</span>
          </h2>
          
          <p className="text-base text-muted-foreground max-w-md leading-relaxed">
            Menghubungkan masyarakat Jawa Barat langsung dengan wakil rakyat melalui konferensi video yang aman dan transparan.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button 
              onClick={() => router.push('/masyarakat')}
              className="px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 text-sm"
            >
              <Users size={16} />
              Mulai Aspirasi
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => router.push('/dewan')}
              className="px-5 py-2.5 bg-background text-foreground font-medium rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-2 text-sm"
            >
              <UserCog size={16} />
              Portal Dewan
            </button>
          </div>
        </div>

        {/* Right: Join Room */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Video size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Gabung Pertemuan</h3>
                <p className="text-xs text-muted-foreground">Gunakan ID dari undangan Anda</p>
              </div>
            </div>
            <ShieldCheck className="text-muted-foreground" size={18} />
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="roomId" className="block text-xs font-medium text-muted-foreground">
                ID Ruangan
              </label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm placeholder:text-muted-foreground"
                placeholder="Contoh: CONF-12345"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2.5 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm"
            >
              Masuk Sekarang
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">Status Server</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span className="text-xs font-medium">Optimal</span>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">Enkripsi</p>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-primary" />
                <span className="text-xs font-medium">End-to-End</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}