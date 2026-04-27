"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowRight, Users, UserCog, Video, ShieldCheck, 
  MessageSquare, Heart, Lightbulb, CheckCircle2, 
  Monitor, CalendarCheck, Zap, Globe, Lock
} from "lucide-react";

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
        {/* Navigation - Minimalist */}
        <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/logo-1.png" alt="DPRD HUDANG Logo" width={200} height={50} className="h-12 w-auto object-contain dark:hidden" />
            <Image src="/images/logo-2.png" alt="DPRD HUDANG Logo" width={200} height={50} className="h-12 w-auto object-contain hidden dark:block" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Filosofi</a>
            <a href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Statistik</a>
            <a href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Bantuan</a>
            <button 
              onClick={() => router.push('/dewan')}
              className="px-6 py-2.5 bg-foreground text-background text-sm font-bold rounded-xl hover:opacity-90 transition-all"
            >
              Portal Dewan
            </button>
          </div>
        </nav>

        {/* Hero Section - Big Refinement */}
        <section className="max-w-7xl mx-auto px-6 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 space-y-12 animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-black uppercase tracking-widest">
                <Globe size={14} className="animate-spin-slow" />
                Jawa Barat Digital Transformation
              </div>
              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-[#121212]">
                Demokrasi <br />
                <span className="bg-gradient-to-r from-primary via-emerald-500 to-primary bg-[length:200%_auto] animate-gradient text-transparent bg-clip-text">
                  Tanpa Jarak.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-medium">
                Hubungkan aspirasi Anda langsung ke meja perwakilan rakyat melalui platform video konferensi terenkripsi dan transparan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <button 
                onClick={() => router.push('/masyarakat')}
                className="group px-10 py-5 bg-primary text-white font-black rounded-2xl shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.6)] hover:-translate-y-1.5 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
              >
                <Users size={24} />
                Sampaikan Aspirasi
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
              </button>
              
              <div className="flex items-center gap-4 px-6 py-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i + 50}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black text-foreground uppercase">10,000+ Warga</p>
                  <p className="text-[10px] text-muted-foreground font-bold">Telah Berpartisipasi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: High-End Interface Mockup */}
          <div className="lg:col-span-6 relative animate-in fade-in slide-in-from-right zoom-in duration-1000 delay-200">
            <div className="absolute -inset-10 bg-gradient-to-tr from-primary/10 to-emerald-500/10 blur-[100px] rounded-full opacity-60"></div>
            
            {/* The Mockup Window */}
            <div className="relative bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-white overflow-hidden group">
               {/* Browser UI Bar */}
               <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="px-4 py-1 bg-white rounded-lg border border-slate-100 text-[10px] font-bold text-muted-foreground flex items-center gap-2">
                    <Lock size={10} /> meet.dprd.jabar.go.id
                  </div>
               </div>

               {/* Video Call Grid Mockup */}
               <div className="p-4 grid grid-cols-2 gap-4 h-[400px] bg-slate-50">
                  <div className="relative rounded-2xl bg-slate-900 overflow-hidden shadow-lg group-hover:scale-[1.02] transition-transform duration-500">
                     <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-80" alt="Dewan" />
                     <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] text-white font-bold flex items-center gap-2 border border-white/10">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                        Anggota Dewan
                     </div>
                  </div>
                  <div className="relative rounded-2xl bg-slate-800 overflow-hidden shadow-lg group-hover:scale-[1.02] transition-transform duration-500 delay-75">
                     <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-80" alt="Masyarakat" />
                     <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] text-white font-bold border border-white/10">
                        Anda (Masyarakat)
                     </div>
                  </div>
                  
                  {/* Floating Controls Overlay */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-white shadow-2xl rounded-2xl border border-slate-100 animate-in slide-in-from-bottom duration-1000 delay-700">
                     <div className="p-2 bg-slate-100 rounded-xl"><Monitor size={18} className="text-slate-600" /></div>
                     <div className="p-2 bg-slate-100 rounded-xl"><Video size={18} className="text-slate-600" /></div>
                     <div className="p-2 bg-rose-500 rounded-xl text-white flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                     </div>
                     <div className="w-px h-6 bg-slate-200 mx-1"></div>
                     <div className="text-xs font-bold text-slate-800">Sesi Berlangsung</div>
                  </div>
               </div>
            </div>

            {/* Decorative Floating Badges */}
            <div className="absolute -top-6 -right-6 p-5 bg-white shadow-2xl rounded-[2rem] border border-slate-100 animate-bounce duration-[4000ms]">
               <CheckCircle2 className="text-emerald-500" size={32} />
            </div>
            <div className="absolute top-1/2 -left-12 p-5 bg-white shadow-2xl rounded-[2rem] border border-slate-100 animate-bounce duration-[5000ms] delay-1000">
               <Zap className="text-primary" size={32} />
            </div>
          </div>
        </section>

        {/* Re-implementing simplified Stats/Trust below */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-y border-slate-100 py-12">
            {[
              { label: "Dewan Aktif", value: "120+", icon: ShieldCheck },
              { label: "Sesi Diskusi", value: "5.4k+", icon: Video },
              { label: "Umpan Balik", value: "98%", icon: Heart },
              { label: "Warga Jabar", value: "10k+", icon: Users },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <stat.icon size={18} />
                  <span className="text-3xl font-black tracking-tight">{stat.value}</span>
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Philosophy Section */}
      <section className="bg-slate-50 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="space-y-6">
              <h2 className="text-4xl font-black tracking-tighter">Filosofi <span className="text-primary">HUDANG</span></h2>
              <p className="text-muted-foreground leading-relaxed">Semangat membangun Jawa Barat melalui partisipasi digital yang inklusif.</p>
              <div className="w-12 h-1.5 bg-primary rounded-full"></div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { char: "H-U", title: "Hadirkeun Usulan", desc: "Membangkitkan ide inovatif dari warga." },
                { char: "D-A", title: "Dangukeun Aspirasi", desc: "Suara didengar langsung oleh dewan." },
                { char: "N-G", title: "Nyatakeun Gagasan", desc: "Mewujudkan kebijakan yang nyata." },
              ].map((h, i) => (
                <div key={i} className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
                  <div className="text-[10px] font-black text-primary/40 mb-4 tracking-widest">{h.char}</div>
                  <h3 className="font-bold text-lg mb-2">{h.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Image src="/images/logo-1.png" alt="DPRD HUDANG Logo" width={150} height={38} className="h-8 w-auto object-contain dark:hidden" />
          <Image src="/images/logo-2.png" alt="DPRD HUDANG Logo" width={150} height={38} className="h-8 w-auto object-contain hidden dark:block" />
        </div>
        <p className="text-[11px] text-muted-foreground font-medium italic">© 2026 Sekretariat DPRD Provinsi Jawa Barat.</p>
        <div className="flex gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
}