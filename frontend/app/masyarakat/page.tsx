"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import DewanCard from "@/components/DewanCard";
import RatingSystem from "@/components/RatingSystem";
import {
  Clock,
  Calendar,
  CheckCircle,
  X,
  ExternalLink,
  Award,
  Video,
  FileCheck2,
  PlusCircle,
  Search,
  ArrowLeft,
  Sparkles,
  Inbox,
  AlertCircle,
  ChevronRight,
  Send,
  UserCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import FollowUpTimelineModal, { FollowUpData } from "@/components/FollowUpTimelineModal";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

type TabType = 'active' | 'upcoming' | 'history' | 'all' | 'create';

function MasyarakatDashboardContent() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [dewanList, setDewanList] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDewans, setSelectedDewans] = useState<number[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [announcement, setAnnouncement] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [groupBy, setGroupBy] = useState<'none' | 'komisi' | 'dapil'>('komisi');
  const [dewanSearch, setDewanSearch] = useState("");
  const [followUpScheduleId, setFollowUpScheduleId] = useState<number | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  
  const followUpSchedule = schedules.find(s => s.id === followUpScheduleId) || null;
  
  const ratedMeetingId = searchParams.get("ratedMeetingId");
  const dewanIdForRating = searchParams.get("dewanId");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (!token || !user) return;

    fetch(`${backendUrl}/api/dewan`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => setDewanList(data));

    fetch(`${backendUrl}/api/schedules?role=masyarakat&userId=${user?.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSchedules(data);
        } else {
          console.error("Fetched schedules is not an array:", data);
          setSchedules([]);
        }
      });
  }, [backendUrl, token, user]);

  const activeSchedules = useMemo(() => {
    return schedules
      .filter(s => {
        if (s.status !== 'confirmed') return false;
        const startTime = new Date(s.startTime).getTime();
        const now = new Date().getTime();
        const buffer = 30 * 60 * 1000;
        return now >= startTime && now <= startTime + buffer;
      })
      .sort((a, b) => b.id - a.id);
  }, [schedules]);

  const incomingSchedules = useMemo(() => {
    return schedules
      .filter(s => {
        if (s.status !== 'confirmed') return false;
        const startTime = new Date(s.startTime).getTime();
        const now = new Date().getTime();
        return startTime > now;
      })
      .sort((a, b) => b.id - a.id);
  }, [schedules]);

  const otherSchedules = useMemo(() => {
    return schedules
      .filter(s => 
        s.status !== 'confirmed' || (new Date(s.startTime).getTime() + 30 * 60 * 1000 < new Date().getTime())
      )
      .sort((a, b) => b.id - a.id);
  }, [schedules]);

  useEffect(() => {
    if (schedules.length > 0) {
      if (activeSchedules.length > 0) {
        setActiveTab('active');
      } else if (incomingSchedules.length > 0) {
        setActiveTab('upcoming');
      } else if (otherSchedules.length > 0) {
        setActiveTab('history');
      }
    }
  }, [schedules.length, activeSchedules.length, incomingSchedules.length, otherSchedules.length]);

  const filteredDewanList = useMemo(() => {
    if (!dewanSearch.trim()) return dewanList;
    const q = dewanSearch.toLowerCase().trim();
    return dewanList.filter(d => 
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.fraksi && d.fraksi.toLowerCase().includes(q)) ||
      (d.komisi && d.komisi.toLowerCase().includes(q)) ||
      (d.dapil && d.dapil.toLowerCase().includes(q))
    );
  }, [dewanList, dewanSearch]);

  const groupedDewan = useMemo(() => {
    if (groupBy === 'none') return { 'Semua Anggota': filteredDewanList };
    
    const grouped = filteredDewanList.reduce((acc, dewan) => {
      const key = dewan[groupBy] || "Lainnya";
      if (!acc[key]) acc[key] = [];
      acc[key].push(dewan);
      return acc;
    }, {} as Record<string, any[]>);
    
    const sortedKeys = Object.keys(grouped).sort();
    const sortedGrouped: Record<string, any[]> = {};
    sortedKeys.forEach(k => {
      sortedGrouped[k] = grouped[k];
    });
    
    return sortedGrouped;
  }, [filteredDewanList, groupBy]);

  const toggleDewanSelection = (id: number) => {
    setSelectedDewans(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDewans.length === 0) {
      setAnnouncement("Mohon pilih setidaknya satu Anggota Dewan.");
      return;
    }
    if (!selectedSlot) {
      setAnnouncement("Mohon pilih tanggal dan waktu terlebih dahulu.");
      return;
    }
    if (!token) return;

    const res = await fetch(`${backendUrl}/api/schedules`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        dewan_ids: selectedDewans,
        start_time: new Date(selectedSlot).toISOString(),
        title: meetingTitle || "Diskusi Aspirasi"
      })
    });

    if (res.ok) {
      const newSchedule = await res.json();
      setSchedules([newSchedule, ...schedules]);
      setSelectedDewans([]);
      setSelectedSlot("");
      setMeetingTitle("");
      setActiveTab('history'); // Auto switch to history view!
      setAnnouncement("Permohonan aspirasi berhasil dikirim. Menunggu konfirmasi Anggota Dewan.");
    } else {
      const error = await res.json();
      setAnnouncement(`Gagal: ${error.error}`);
    }
  };

  const onRatingSubmit = async (scores: any, comment: string) => {
    if (!token) return;
    const res = await fetch(`${backendUrl}/api/ratings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        schedule_id: Number(ratedMeetingId),
        dewan_id: Number(dewanIdForRating),
        speaking_score: scores.speaking_score,
        context_score: scores.context_score,
        time_score: scores.time_score,
        responsiveness_score: scores.responsiveness_score,
        solution_score: scores.solution_score,
        comment
      })
    });

    if (res.ok) {
      setAnnouncement("Terima kasih atas penilaian Anda!");
      setTimeout(() => router.replace("/masyarakat"), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div aria-live="polite" className="sr-only">{announcement}</div>
        
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-primary tracking-wide uppercase mb-1">Layanan Aspirasi Publik Digital</p>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Portal Aspirasi Warga
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                Suarakan pengaduan dan aspirasi Anda langsung kepada 120 Anggota DPRD Provinsi Jawa Barat.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-card border border-border rounded-xl text-center shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Aspirasi</p>
                <p className="text-lg font-extrabold text-foreground">{schedules.length}</p>
              </div>
              <div className="px-4 py-2 bg-card border border-border rounded-xl text-center shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Aktif / Terjadwal</p>
                <p className="text-lg font-extrabold text-primary">{schedules.filter(s => s.status === 'confirmed').length}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Announcement Banner */}
        {announcement && (
          <div className="mb-6 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex-grow">{announcement}</span>
            <button onClick={() => setAnnouncement("")} className="p-1 hover:bg-emerald-500/20 rounded text-emerald-700 dark:text-emerald-300">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Rating Modal */}
        {ratedMeetingId && (
          <section className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md">
              <button 
                onClick={() => router.replace("/masyarakat")}
                className="absolute -top-10 right-0 p-1.5 bg-muted hover:bg-border rounded-lg text-muted-foreground transition-colors"
              >
                <X size={18} />
              </button>
              <RatingSystem onRatingSubmit={onRatingSubmit} />
            </div>
          </section>
        )}

        {/* ── Modern Tabs Navigation: Bebas scroll panjang, akses instan ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 border-b border-border pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* 1. Sesi Aktif */}
            <button
              onClick={() => setActiveTab('active')}
              className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'active'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {activeSchedules.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
              <Video size={15} />
              <span>Sesi Aktif</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'active' 
                  ? 'bg-white/20 text-white' 
                  : activeSchedules.length > 0 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {activeSchedules.length}
              </span>
            </button>

            {/* 2. Jadwal Mendatang */}
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'upcoming'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Calendar size={15} />
              <span>Jadwal Mendatang</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {incomingSchedules.length}
              </span>
            </button>

            {/* 3. Riwayat & Status */}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'history'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Clock size={15} />
              <span>Riwayat &amp; Status</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {otherSchedules.length}
              </span>
            </button>

            {/* 4. Semua */}
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Inbox size={15} />
              <span>Semua</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {schedules.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab !== 'create' ? (
              <button
                onClick={() => setActiveTab('create')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-xs active:scale-95"
              >
                <PlusCircle size={15} />
                <span>+ Ajukan Aspirasi Baru</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('active')}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-bold hover:bg-muted transition-all shadow-xs active:scale-95"
              >
                <ArrowLeft size={14} />
                <span>Kembali ke Jadwal</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Persistent Live Conference Banner (muncul jika ada sesi aktif tapi user di tab lain) ── */}
        {activeSchedules.length > 0 && activeTab !== 'active' && activeTab !== 'create' && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500 text-white shrink-0 animate-pulse">
                <Video size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500 text-white">
                    Live Now
                  </span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    Sesi pertemuan dewan sedang berlangsung
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {activeSchedules[0].title || "Pertemuan Aspirasi Dewan"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('active')}
                className="px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 transition-colors"
              >
                Lihat Semua Sesi Aktif
              </button>
              <button
                onClick={() => router.push(`/room/${activeSchedules[0].id}`)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <ExternalLink size={14} />
                <span>Masuk Ruang Temu</span>
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            TAB 1: SESI AKTIF (SESI PERTEMUAN YANG SEDANG BERLANGSUNG)
           ═════════════════════════════════════════════════════════ */}
        {activeTab === 'active' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Video size={17} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Sesi Aktif</h3>
                  <p className="text-xs text-muted-foreground">Sesi pertemuan yang sedang berlangsung</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {activeSchedules.length} Sesi
              </span>
            </div>

            {activeSchedules.length === 0 ? (
              <div className="py-12 text-center bg-card border border-border border-dashed rounded-2xl p-8">
                <Video size={32} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm font-bold text-foreground mb-1">Belum Ada Konferensi yang Sedang Aktif</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Sesi temu dewan virtual akan aktif secara otomatis pada jam yang telah dikonfirmasi.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSchedules.map(s => {
                  const participantsText = s.participants?.map((p: any) => p.dewan?.name).filter(Boolean).join(", ") || "Anggota Dewan Jabar";
                  return (
                    <div key={s.id} className="bg-card border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-amber-500/20 text-amber-500 shrink-0">
                          <Video size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500 text-white">
                              Live Now
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">#{s.id}</span>
                          </div>
                          <p className="text-sm font-bold text-foreground leading-snug">{s.title || "Pertemuan Aspirasi"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{participantsText}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => router.push(`/room/${s.id}`)}
                        className="flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-amber-600 transition-all text-xs shadow-sm active:scale-95"
                      >
                        <ExternalLink size={14} />
                        <span>Masuk Ruang Temu</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            TAB 2: JADWAL MENDATANG (SESI YANG TELAH DIKONFIRMASI)
           ═════════════════════════════════════════════════════════ */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Calendar size={17} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Jadwal Mendatang</h3>
                  <p className="text-xs text-muted-foreground">Sesi yang telah dikonfirmasi</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {incomingSchedules.length} Jadwal
              </span>
            </div>

            {incomingSchedules.length === 0 ? (
              <div className="py-12 text-center bg-card border border-border border-dashed rounded-2xl p-8">
                <Calendar size={32} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm font-bold text-foreground mb-1">Tidak Ada Jadwal dalam Antrian</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Sesi temu dewan yang telah disetujui akan muncul di sini menjelang waktu pelaksanaan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incomingSchedules.map(s => {
                  const participantsText = s.participants?.map((p: any) => p.dewan?.name).filter(Boolean).join(", ") || "Anggota Dewan Jabar";
                  return (
                    <div key={s.id} className="bg-card border border-border hover:border-primary/40 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10 text-primary shrink-0">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-snug">{s.title || "Pertemuan Aspirasi"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{participantsText}</p>
                          <div className="flex items-center text-xs text-primary font-medium mt-1">
                            <Clock size={12} className="mr-1" />
                            {new Date(s.startTime).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB
                          </div>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0 self-start sm:self-center">
                        <CheckCircle size={13} />
                        <span>Terkonfirmasi</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            TAB 3: RIWAYAT & STATUS (PANTAU PERKEMBANGAN ASPIRASI)
           ═════════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                  <Clock size={17} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Riwayat &amp; Status</h3>
                  <p className="text-xs text-muted-foreground">Pantau perkembangan aspirasi Anda</p>
                </div>
              </div>

              {otherSchedules.length > 0 && (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={scheduleSearch}
                    onChange={(e) => setScheduleSearch(e.target.value)}
                    placeholder="Cari topik atau legislator..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground w-full sm:w-64"
                  />
                </div>
              )}
            </div>

            {otherSchedules.length === 0 ? (
              <div className="py-12 text-center bg-card border border-border border-dashed rounded-2xl p-8">
                <Inbox size={32} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm font-bold text-foreground mb-1">Belum Ada Riwayat Aspirasi</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  Anda belum memiliki riwayat aspirasi. Klik tombol di bawah untuk mulai menyampaikan aspirasi kepada legislator.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-xs"
                >
                  <PlusCircle size={14} />
                  <span>Mulai Ajukan Aspirasi</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherSchedules
                  .filter(s => {
                    if (!scheduleSearch.trim()) return true;
                    const q = scheduleSearch.toLowerCase().trim();
                    return (
                      (s.title && s.title.toLowerCase().includes(q)) ||
                      (s.id && String(s.id).includes(q)) ||
                      (s.participants && s.participants.some((p: any) => p.dewan?.name?.toLowerCase().includes(q)))
                    );
                  })
                  .map(s => {
                    const isCompleted = s.status === 'confirmed';
                    const isRejected = s.status === 'rejected';
                    const progressPercent = s.followUp?.progressPercent;
                    const participantsText = s.participants?.map((p: any) => p.dewan?.name).filter(Boolean).join(", ") || "Anggota Dewan Jabar";

                    return (
                      <div key={s.id} className="bg-card border border-border hover:border-border/80 rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-xs transition-all">
                        <div className="flex items-start gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isRejected 
                              ? 'bg-red-500/10 text-red-500' 
                              : isCompleted 
                              ? 'bg-muted text-muted-foreground' 
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {isCompleted ? <CheckCircle size={18} /> : isRejected ? <AlertCircle size={18} /> : <Clock size={18} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground truncate mb-0.5">{s.title || "Pertemuan Aspirasi"}</p>
                            <p className="text-sm font-bold text-foreground leading-snug truncate">{participantsText}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Calendar size={12} className="shrink-0" />
                              <span>
                                {new Date(s.startTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(s.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border/60 gap-2 flex-wrap">
                          <button
                            onClick={() => setFollowUpScheduleId(s.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs border ${
                              progressPercent === 100
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                : progressPercent && progressPercent > 0
                                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
                                : 'bg-primary/10 text-primary border-primary/25 hover:bg-primary/20'
                            }`}
                            title="Lihat status dan realisasi tindak lanjut aspirasi Anda"
                          >
                            <FileCheck2 size={13} />
                            <span>
                              {progressPercent !== undefined && progressPercent > 0
                                ? `Progres: ${progressPercent}%`
                                : "Pantau Realisasi"}
                            </span>
                            {progressPercent === 100 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            )}
                          </button>

                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            isCompleted 
                              ? 'bg-muted text-muted-foreground' 
                              : isRejected
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            {isCompleted ? 'Selesai' : isRejected ? 'Ditolak' : 'Menunggu'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            TAB 4: SEMUA ASPIRASI & JADWAL
           ═════════════════════════════════════════════════════════ */}
        {activeTab === 'all' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Inbox size={17} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Semua Aspirasi &amp; Jadwal</h3>
                  <p className="text-xs text-muted-foreground">Seluruh permohonan aspirasi, jadwal temu, dan riwayat status</p>
                </div>
              </div>

              {schedules.length > 0 && (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={scheduleSearch}
                    onChange={(e) => setScheduleSearch(e.target.value)}
                    placeholder="Cari topik atau legislator..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground w-full sm:w-64"
                  />
                </div>
              )}
            </div>

            {schedules.length === 0 ? (
              <div className="py-12 text-center bg-card border border-border border-dashed rounded-2xl p-8">
                <Inbox size={32} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm font-bold text-foreground mb-1">Belum Ada Data Aspirasi</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  Anda belum pernah mengajukan aspirasi. Silakan buat pengajuan jadwal temu pertama Anda.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-xs"
                >
                  <PlusCircle size={14} />
                  <span>Mulai Ajukan Aspirasi</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedules
                  .filter(s => {
                    if (!scheduleSearch.trim()) return true;
                    const q = scheduleSearch.toLowerCase().trim();
                    return (
                      (s.title && s.title.toLowerCase().includes(q)) ||
                      (s.id && String(s.id).includes(q)) ||
                      (s.participants && s.participants.some((p: any) => p.dewan?.name?.toLowerCase().includes(q)))
                    );
                  })
                  .map(s => {
                    const isCompleted = s.status === 'confirmed';
                    const isRejected = s.status === 'rejected';
                    const progressPercent = s.followUp?.progressPercent;
                    const participantsText = s.participants?.map((p: any) => p.dewan?.name).filter(Boolean).join(", ") || "Anggota Dewan Jabar";

                    return (
                      <div key={s.id} className="bg-card border border-border hover:border-border/80 rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-xs transition-all">
                        <div className="flex items-start gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isRejected 
                              ? 'bg-red-500/10 text-red-500' 
                              : isCompleted 
                              ? 'bg-muted text-muted-foreground' 
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {isCompleted ? <CheckCircle size={18} /> : isRejected ? <AlertCircle size={18} /> : <Clock size={18} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground truncate mb-0.5">{s.title || "Pertemuan Aspirasi"}</p>
                            <p className="text-sm font-bold text-foreground leading-snug truncate">{participantsText}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Calendar size={12} className="shrink-0" />
                              <span>
                                {new Date(s.startTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(s.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border/60 gap-2 flex-wrap">
                          <button
                            onClick={() => setFollowUpScheduleId(s.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs border ${
                              progressPercent === 100
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                : progressPercent && progressPercent > 0
                                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
                                : 'bg-primary/10 text-primary border-primary/25 hover:bg-primary/20'
                            }`}
                            title="Lihat status dan realisasi tindak lanjut aspirasi Anda"
                          >
                            <FileCheck2 size={13} />
                            <span>
                              {progressPercent !== undefined && progressPercent > 0
                                ? `Progres: ${progressPercent}%`
                                : "Pantau Realisasi"}
                            </span>
                            {progressPercent === 100 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            )}
                          </button>

                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            isCompleted 
                              ? 'bg-muted text-muted-foreground' 
                              : isRejected
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            {isCompleted ? 'Selesai' : isRejected ? 'Ditolak' : 'Menunggu'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            TAB 5: AJUKAN ASPIRASI BARU (FORM + PILIH DEWAN)
           ═════════════════════════════════════════════════════════ */}
        {activeTab === 'create' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Form Section */}
            <section className="p-6 bg-card border border-border rounded-2xl shadow-xs">
              <form onSubmit={handleScheduleSubmit}>
                <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Formulir Pengajuan Jadwal Aspirasi</h3>
                    <p className="text-xs text-muted-foreground">Isi rincian permohonan audiensi Anda dengan wakil rakyat</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('active')}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Judul / Topik Aspirasi
                    </label>
                    <input
                      type="text"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                      placeholder="Cth: Usulan Perbaikan Ruas Jalan &amp; Penerangan di Cibiru"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Pilih Tanggal &amp; Waktu Sesi
                    </label>
                    <input
                      type="datetime-local"
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                      required
                    />
                  </div>
                </div>
                
                {/* Submit Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/50 border border-border rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-foreground">
                    <UserCheck size={16} className="text-primary" />
                    <span>
                      Wakil Rakyat Dipilih: <strong className="text-primary font-bold">{selectedDewans.length}</strong> orang
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={selectedDewans.length === 0 || !selectedSlot}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
                      selectedDewans.length === 0 || !selectedSlot 
                        ? 'bg-muted-foreground/30 text-muted-foreground cursor-not-allowed' 
                        : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
                    }`}
                  >
                    <Send size={14} />
                    <span>Kirim Permohonan Aspirasi</span>
                  </button>
                </div>
              </form>
            </section>

            {/* Dewan Picker Section */}
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Award size={17} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Pilih Anggota Dewan ({dewanList.length})</h3>
                    <p className="text-xs text-muted-foreground">Pilih satu atau beberapa legislator untuk diundang dalam sesi</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Dewan Search */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={dewanSearch}
                      onChange={(e) => setDewanSearch(e.target.value)}
                      placeholder="Cari legislator, fraksi..."
                      className="pl-8 pr-3 py-1.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground w-48 sm:w-56"
                    />
                  </div>

                  {/* Group By Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">Grup:</span>
                    <select 
                      value={groupBy}
                      onChange={(e) => setGroupBy(e.target.value as any)}
                      className="bg-card border border-border rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-primary/20 outline-none text-xs font-medium text-foreground"
                    >
                      <option value="komisi">Komisi</option>
                      <option value="dapil">Dapil</option>
                      <option value="none">Semua</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {dewanList.length === 0 ? (
                <div className="py-12 text-center bg-card border border-dashed border-border rounded-2xl">
                  <p className="text-xs text-muted-foreground">Mengambil data Legislator...</p>
                </div>
              ) : Object.keys(groupedDewan).length === 0 ? (
                <div className="py-12 text-center bg-card border border-dashed border-border rounded-2xl">
                  <p className="text-xs text-muted-foreground">Tidak ada legislator yang cocok dengan pencarian &quot;{dewanSearch}&quot;.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedDewan).map(([groupName, groupList]) => (
                    <div key={groupName}>
                      {groupBy !== 'none' && (
                        <div className="flex items-center gap-3 mb-4">
                          <h4 className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
                            {groupName} ({groupList.length})
                          </h4>
                          <div className="h-px bg-border flex-grow"></div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupList.map(dewan => (
                          <DewanCard 
                            key={dewan.id} 
                            dewan={dewan} 
                            isSelected={selectedDewans.includes(dewan.id)}
                            onSelect={(d) => toggleDewanSelection(d.id)} 
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Follow-Up Timeline Modal */}
        <FollowUpTimelineModal
          isOpen={!!followUpScheduleId}
          onClose={() => setFollowUpScheduleId(null)}
          schedule={followUpSchedule}
          onUpdate={(updated) => {
            setSchedules(prev => prev.map(s => s.id === updated.scheduleId ? { ...s, followUp: updated } : s));
          }}
        />
      </div>
    </div>
  );
}

export default function MasyarakatDashboard() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted-foreground h-screen flex items-center justify-center text-sm">Memuat Portal Aspirasi...</div>}>
      <ProtectedRoute allowedRoles={['masyarakat', 'admin']}>
        <MasyarakatDashboardContent />
      </ProtectedRoute>
    </Suspense>
  );
}