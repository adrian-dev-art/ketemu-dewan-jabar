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
    <div className="flex-grow flex flex-col relative overflow-hidden bg-[#fafafa]">
      {/* Hyper-Modern Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-100/40 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/30 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-[0.02]"></div>
      </div>

      <div className="relative z-10">


        {/* Hero Section - Big Refinement */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
                <Globe size={14} className="animate-spin-slow shrink-0" />
                <span className="truncate">Jawa Barat Digital Transformation</span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.02] sm:leading-[0.9] tracking-tighter text-[#121212] break-words">
                Demokrasi <br />
                <span className="bg-gradient-to-r from-primary via-emerald-500 to-primary bg-[length:200%_auto] animate-gradient text-transparent bg-clip-text">
                  Tanpa Jarak.
                </span>
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground max-w-lg leading-relaxed font-medium">
                Hubungkan aspirasi Anda langsung ke meja perwakilan rakyat melalui platform video konferensi terenkripsi dan pantau surat tindak lanjut secara transparan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
              <button 
                onClick={() => router.push('/masyarakat')}
                className="group w-full sm:w-auto px-6 sm:px-7 py-3.5 bg-primary text-white font-black rounded-2xl shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2.5 text-sm"
              >
                <Users size={18} />
                Sampaikan Aspirasi
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <a 
                href="#transparansi-surat"
                className="w-full sm:w-auto px-5 py-3.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white font-bold rounded-2xl border border-emerald-500/30 hover:border-emerald-400 transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <FileText size={17} className="text-emerald-400" />
                Tindak Lanjut Audiensi
              </a>

              <a 
                href="#rekap-aspirasi"
                className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 hover:text-primary font-bold rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                <BarChart3 size={17} className="text-primary" />
                Analitik E-Aspirasi
              </a>
            </div>
              
            <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-white/70 backdrop-blur-md rounded-2xl border border-white inline-flex w-full sm:w-auto">
              <div className="flex -space-x-3 shrink-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i + 50}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="text-left min-w-0">
                <p className="text-[11px] font-black text-foreground uppercase truncate">10,000+ Warga</p>
                <p className="text-[10px] text-muted-foreground font-bold truncate">Telah Berpartisipasi</p>
              </div>
            </div>
          </div>

          {/* Right Side: High-End Interface Mockup */}
          <div className="lg:col-span-6 relative animate-in fade-in slide-in-from-right zoom-in duration-1000 delay-200">
            <div className="absolute -inset-10 bg-gradient-to-tr from-primary/10 to-emerald-500/10 blur-[100px] rounded-full opacity-60"></div>
            
            {/* The Mockup Window */}
            <div className="relative bg-white rounded-3xl sm:rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-white overflow-hidden group">
               {/* Browser UI Bar */}
               <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex gap-2">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-rose-400"></div>
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="px-3 sm:px-4 py-1 bg-white rounded-lg border border-slate-100 text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 sm:gap-2 truncate max-w-[200px] sm:max-w-none">
                    <Lock size={10} className="shrink-0" /> <span className="truncate">meet.dprd.jabar.go.id</span>
                  </div>
               </div>

                {/* Focused Single Image Mockup */}
                <div className="p-3 sm:p-4 h-[260px] sm:h-[400px] bg-slate-50 relative">
                   <div className="relative w-full h-full rounded-xl sm:rounded-2xl bg-slate-900 overflow-hidden shadow-lg group-hover:scale-[1.01] transition-transform duration-500">
                      <img src="/images/dprd-building.png" className="w-full h-full object-cover opacity-95" alt="Gedung DPRD Jabar" />
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-rose-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 sm:gap-2 shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                        Live Conference
                      </div>
                      <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 p-3 sm:p-4 bg-black/40 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 text-white max-w-[85%]">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5 sm:mb-1">Lokasi Utama</p>
                        <h3 className="text-sm sm:text-lg font-bold truncate">Gedung DPRD Jawa Barat</h3>
                      </div>
                   </div>
                   
                   {/* Floating Controls Overlay */}
                   <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 px-3.5 sm:px-6 py-2 sm:py-3 bg-white shadow-2xl rounded-xl sm:rounded-2xl border border-slate-100 animate-in slide-in-from-bottom duration-1000 delay-700 max-w-[90%]">
                      <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg sm:rounded-xl shrink-0"><Monitor size={15} className="text-slate-600 sm:w-[18px] sm:h-[18px]" /></div>
                      <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg sm:rounded-xl shrink-0"><Video size={15} className="text-slate-600 sm:w-[18px] sm:h-[18px]" /></div>
                      <div className="p-1.5 sm:p-2 bg-rose-500 rounded-lg sm:rounded-xl text-white flex items-center justify-center shrink-0">
                         <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                      </div>
                      <div className="w-px h-5 sm:h-6 bg-slate-200 mx-0.5 sm:mx-1"></div>
                      <div className="text-[11px] sm:text-xs font-bold text-slate-800 whitespace-nowrap">Sesi Berlangsung</div>
                   </div>
                </div>
             </div>

             {/* Decorative Floating Badges (Contained, hidden on small screens to prevent overflow) */}
             <div className="hidden sm:block absolute -top-6 -right-6 p-5 bg-white shadow-2xl rounded-[2rem] border border-slate-100 animate-bounce duration-[4000ms]">
                <CheckCircle2 className="text-emerald-500" size={32} />
             </div>
             <div className="hidden sm:block absolute top-1/2 -left-8 p-5 bg-white shadow-2xl rounded-[2rem] border border-slate-100 animate-bounce duration-[5000ms] delay-1000">
                <Zap className="text-primary" size={32} />
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
       <section className="bg-slate-50 py-16 sm:py-28">
         <div className="max-w-7xl mx-auto px-4 sm:px-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
             <div className="space-y-4 sm:space-y-6">
               <h2 className="text-3xl sm:text-4xl font-black tracking-tighter">Filosofi <span className="text-primary">HUDANG</span></h2>
               <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Semangat membangun Jawa Barat melalui partisipasi digital yang inklusif.</p>
               <div className="w-12 h-1.5 bg-primary rounded-full"></div>
             </div>
             <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
               {[
                 { char: "H-U", title: "Hadirkeun Usulan", desc: "Membangkitkan ide inovatif dari warga." },
                 { char: "D-A", title: "Dangukeun Aspirasi", desc: "Suara didengar langsung oleh dewan." },
                 { char: "N-G", title: "Nyatakeun Gagasan", desc: "Mewujudkan kebijakan yang nyata." },
               ].map((h, i) => (
                 <div key={i} className="p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
                   <div className="text-[10px] font-black text-primary/40 mb-3 sm:mb-4 tracking-widest">{h.char}</div>
                   <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">{h.title}</h3>
                   <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
                 </div>
               ))}
             </div>
           </div>
         </div>
       </section>

       {/* Footer */}
       <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 border-t border-slate-100">
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