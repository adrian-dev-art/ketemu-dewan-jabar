"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowRight, Users, UserCog, Video, ShieldCheck, 
  MessageSquare, Heart, Lightbulb, CheckCircle2, 
  Monitor, CalendarCheck, Zap, Globe, Lock, FileText, Shield, BarChart3
} from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";
import PublicTransparencyPortal from "@/components/PublicTransparencyPortal";
import AspirasiPublicCharts from "@/components/AspirasiPublicCharts";


export default function Home() {
  const router = useRouter();

  return (
    <div className="flex-grow flex flex-col relative overflow-hidden bg-background text-foreground">
      {/* Clean Subtle Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="relative z-10">

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                <Globe size={14} className="text-emerald-600 shrink-0" />
                <span className="truncate">Jawa Barat Digital Transformation</span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight sm:leading-[1.08] tracking-tight text-foreground break-words font-outfit">
                Demokrasi <br />
                <span className="bg-gradient-to-r from-primary via-emerald-600 to-primary bg-clip-text text-transparent">
                  Tanpa Jarak.
                </span>
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-lg leading-relaxed font-normal">
                Hubungkan aspirasi Anda langsung ke meja perwakilan rakyat melalui platform video konferensi terenkripsi dan pantau surat tindak lanjut secara transparan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button 
                onClick={() => router.push('/masyarakat')}
                className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Users size={18} />
                <span>Sampaikan Aspirasi</span>
                <ArrowRight size={16} />
              </button>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
                <a 
                  href="#transparansi-surat"
                  className="px-3 sm:px-5 py-3 sm:py-3.5 bg-card hover:bg-muted text-foreground font-bold rounded-xl border border-border shadow-xs hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-center"
                >
                  <FileText size={16} className="text-emerald-600 shrink-0" />
                  <span className="truncate">Tindak Lanjut</span>
                </a>

                <a 
                  href="#rekap-aspirasi"
                  className="px-3 sm:px-5 py-3 sm:py-3.5 bg-card hover:bg-muted text-foreground font-bold rounded-xl border border-border shadow-xs hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-center"
                >
                  <BarChart3 size={16} className="text-primary shrink-0" />
                  <span className="truncate">Analitik Data</span>
                </a>
              </div>
            </div>
              
            <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl border border-border shadow-xs inline-flex w-full sm:w-auto">
              <div className="flex -space-x-2.5 shrink-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-border bg-muted overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i + 50}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="text-left min-w-0">
                <p className="text-[11px] font-bold text-foreground uppercase tracking-wider truncate">10,000+ Warga</p>
                <p className="text-[10px] text-muted-foreground font-medium truncate">Telah Berpartisipasi Aktif</p>
              </div>
            </div>
          </div>

          {/* Right Side: Interface Mockup */}
          <div className="lg:col-span-6 relative animate-in fade-in slide-in-from-right duration-700">
            {/* The Mockup Window */}
            <div className="relative bg-card rounded-2xl sm:rounded-3xl shadow-xl border border-border overflow-hidden">
               {/* Browser UI Bar */}
               <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/60">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="px-3 py-1 bg-card rounded-lg border border-border text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-none">
                    <Lock size={10} className="shrink-0 text-muted-foreground" /> <span className="truncate font-mono">meet.dprd.jabar.go.id</span>
                  </div>
               </div>

                {/* Single Image Mockup */}
                <div className="p-3 sm:p-4 h-[280px] sm:h-[380px] bg-muted/40 relative">
                   <div className="relative w-full h-full rounded-xl bg-slate-900 overflow-hidden shadow-md">
                      <img src="/images/dprd-building.png" className="w-full h-full object-cover opacity-95" alt="Gedung DPRD Jabar" />
                      
                      {/* Top-left location badge */}
                      <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[11px] sm:text-xs font-bold truncate">Gedung DPRD Jabar</span>
                      </div>

                      {/* Top-right live badge */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-md">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                        <span>Live</span>
                      </div>
                   </div>
                   
                   {/* Floating Controls Overlay — Clean Centered Bottom */}
                   <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 bg-card shadow-2xl rounded-xl border border-border max-w-[90%]">
                      <div className="p-1.5 bg-muted rounded-lg shrink-0"><Monitor size={15} className="text-muted-foreground" /></div>
                      <div className="p-1.5 bg-muted rounded-lg shrink-0"><Video size={15} className="text-muted-foreground" /></div>
                      <div className="p-1.5 bg-rose-500 rounded-lg text-white flex items-center justify-center shrink-0">
                         <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
                      </div>
                      <div className="w-px h-5 bg-border mx-0.5"></div>
                      <div className="text-[11px] sm:text-xs font-bold text-foreground whitespace-nowrap">Sesi Berlangsung</div>
                   </div>
                </div>
             </div>
           </div>
         </section>

         {/* Re-implementing simplified Stats/Trust below */}
         <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 border-y border-slate-100 py-8 sm:py-12">
             {[
               { label: "Dewan Aktif", value: "120+", icon: ShieldCheck },
               { label: "Sesi Diskusi", value: "5.4k+", icon: Video },
               { label: "Umpan Balik", value: "98%", icon: Heart },
               { label: "Warga Jabar", value: "10k+", icon: Users },
             ].map((stat, i) => (
               <div key={i} className="text-center space-y-1.5 sm:space-y-2">
                 <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-primary">
                   <stat.icon size={18} />
                   <span className="text-2xl sm:text-3xl font-black tracking-tight">{stat.value}</span>
                 </div>
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
               </div>
             ))}
           </div>
          </section>

          {/* Public Transparency Hub (Dokumen Surat & Realisasi Tindak Lanjut - Terbuka Tanpa Login) */}
          <PublicTransparencyPortal />

          {/* Data Summary Section - Statistik Partisipasi Publik */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 border-t border-slate-100">
             <DashboardCharts title="Statistik Partisipasi Publik" />
          </section>

          {/* Rekapitulasi & Analitik Data E-Aspirasi Publik (Live Data Real-time) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 border-t border-slate-100">
             <AspirasiPublicCharts />
          </section>
       </div>

       {/* Philosophy Section */}
       <section className="bg-muted/30 py-14 sm:py-24 border-t border-border">
         <div className="max-w-7xl mx-auto px-4 sm:px-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
             <div className="space-y-3 sm:space-y-4">
               <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground font-outfit">
                 Filosofi <span className="text-primary">HUDANG</span>
               </h2>
               <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
                 Semangat membangun Jawa Barat melalui partisipasi digital yang inklusif.
               </p>
               <div className="w-12 h-1.5 bg-primary rounded-full"></div>
             </div>
             <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
               {[
                 { char: "H-U", title: "Hadirkeun Usulan", desc: "Membangkitkan ide inovatif dari warga." },
                 { char: "D-A", title: "Dangukeun Aspirasi", desc: "Suara didengar langsung oleh dewan." },
                 { char: "N-G", title: "Nyatakeun Gagasan", desc: "Mewujudkan kebijakan yang nyata." },
               ].map((h, i) => (
                 <div key={i} className="p-5 sm:p-7 bg-card rounded-2xl sm:rounded-3xl shadow-xs border border-border hover:shadow-md transition-shadow">
                   <div className="text-[11px] font-black text-primary mb-2 sm:mb-3 tracking-widest">{h.char}</div>
                   <h3 className="font-extrabold text-base sm:text-lg text-foreground mb-1.5 font-outfit">{h.title}</h3>
                   <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
                 </div>
               ))}
             </div>
           </div>
         </div>
       </section>

       {/* Footer */}
       <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 border-t border-border">
         <div className="flex items-center gap-2">
           <Image src="/images/dprd-logo.png" alt="Sekretariat DPRD Jabar Logo" width={200} height={60} className="h-10 sm:h-12 w-auto object-contain" />
         </div>
        <p className="text-[11px] text-muted-foreground font-medium italic text-center md:text-left">© 2026 Sekretariat DPRD Provinsi Jawa Barat.</p>
        <div className="flex gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
}