"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Users, UserCog, Video, ShieldCheck, MessageSquare, Heart, Lightbulb } from "lucide-react";

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
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Aplikasi Resmi Sekretariat DPRD Jawa Barat
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                Platform Aspirasi Digital
              </span>
            </div>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight font-outfit text-foreground">
            Suara Anda, <br />
            <span className="text-primary italic">Aksi Mereka.</span>
          </h2>
          
          <p className="text-base text-muted-foreground max-w-md leading-relaxed">
            Menghubungkan masyarakat Jawa Barat langsung dengan wakil rakyat melalui konferensi video yang aman dan transparan.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => router.push('/masyarakat')}
              className="px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover transition-all duration-300 flex items-center gap-2 text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              <Users size={18} />
              Mulai Aspirasi
              <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => router.push('/dewan')}
              className="px-8 py-3 bg-background text-foreground font-semibold rounded-full border-2 border-border hover:bg-muted transition-all duration-300 flex items-center gap-2 text-sm hover:border-primary/30"
            >
              <UserCog size={18} />
              Portal Dewan
            </button>
          </div>
        </div>

        {/* Right: Join Room */}
        <div className="border border-border/50 rounded-3xl p-8 bg-card shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <Video size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base font-outfit">Gabung Pertemuan</h3>
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
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm placeholder:text-muted-foreground font-medium"
                placeholder="Contoh: CONF-12345"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3.5 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg shadow-foreground/10 hover:shadow-foreground/20"
            >
              Masuk Sekarang
              <ArrowRight size={18} />
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

      {/* HUDANG Acronym Section */}
      <div className="mt-24 md:mt-32 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold font-outfit mb-4 text-foreground">Mengenal <span className="text-primary">HUDANG</span></h3>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Filosofi kami dalam membangun jembatan antara rakyat dan pemimpin untuk Jawa Barat yang lebih baik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* H-U */}
          <div className="group p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-premium transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-8xl font-black text-primary/5 select-none font-outfit group-hover:text-primary/10 transition-colors">H</div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <MessageSquare size={28} />
            </div>
            <h4 className="text-xl font-bold font-outfit mb-3 group-hover:text-primary transition-colors">Hirupkeun Usulan</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Membangkitkan semangat partisipasi masyarakat dalam menyampaikan ide-ide inovatif untuk pembangunan daerah.
            </p>
          </div>

          {/* D-A */}
          <div className="group p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-premium transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-8xl font-black text-primary/5 select-none font-outfit group-hover:text-primary/10 transition-colors">D</div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Heart size={28} />
            </div>
            <h4 className="text-xl font-bold font-outfit mb-3 group-hover:text-primary transition-colors">Dangukeun Aspirasi</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Memastikan setiap keluhan, harapan, dan masukan masyarakat didengar dengan tulus oleh para wakil rakyat.
            </p>
          </div>

          {/* N-G */}
          <div className="group p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-premium transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-8xl font-black text-primary/5 select-none font-outfit group-hover:text-primary/10 transition-colors">G</div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Lightbulb size={28} />
            </div>
            <h4 className="text-xl font-bold font-outfit mb-3 group-hover:text-primary transition-colors">Nyatakeun Gagasan</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mewujudkan gagasan-gagasan cemerlang menjadi kebijakan nyata yang berdampak langsung bagi kemajuan Jawa Barat.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Footer Section */}
      <div className="mt-32 pt-16 border-t border-border/50 text-center">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8">Didukung Oleh</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="text-xl font-bold font-outfit">DPRD JAWA BARAT</div>
           <div className="text-xl font-bold font-outfit">PEMPROV JABAR</div>
           <div className="text-xl font-bold font-outfit">DISKOMINFO</div>
        </div>
      </div>
    </div>
  );
}