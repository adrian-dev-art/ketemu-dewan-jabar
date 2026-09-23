"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
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
  Inbox,
  AlertCircle,
  ChevronRight,
  Send,
  UserCheck,
  FileText,
  UploadCloud,
  Film,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import FollowUpTimelineModal, { FollowUpData } from "@/components/FollowUpTimelineModal";
import ServiceChoiceCards from "@/components/ServiceChoiceCards";
import AspirasiForm from "@/components/AspirasiForm";
import AspirasiTimelineModal, { AspirasiData } from "@/components/AspirasiTimelineModal";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSocketUpdates } from "@/hooks/useSocketUpdates";
import { getBackendUrl } from "@/context/utils";

type TabType = 'aspirasi' | 'active' | 'upcoming' | 'history' | 'all' | 'create';

function MasyarakatDashboardContent() {
  const [activeTab, setActiveTab] = useState<TabType>('aspirasi');
  const [createServiceType, setCreateServiceType] = useState<'audiensi' | 'aspirasi' | null>(null);

  // Audiensi State
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

  // E-Aspirasi State
  const [aspirasiList, setAspirasiList] = useState<AspirasiData[]>([]);
  const [selectedAspirasiForTimeline, setSelectedAspirasiForTimeline] = useState<AspirasiData | null>(null);
  const [aspirasiSearch, setAspirasiSearch] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();

  const followUpSchedule = schedules.find(s => s.id === followUpScheduleId) || null;

  const ratedMeetingId = searchParams.get("ratedMeetingId");
  const dewanIdForRating = searchParams.get("dewanId");

  const backendUrl = getBackendUrl();

  // Fetch data audiensi dan aspirasi
  const fetchSchedules = useCallback(() => {
    if (!token || !user) return;
    fetch(`${backendUrl}/api/schedules?role=masyarakat&userId=${user?.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (Array.isArray(data)) {
          setSchedules(data);
        } else {
          setSchedules([]);
        }
      })
      .catch(err => console.error("Error fetching schedules:", err));
  }, [backendUrl, token, user]);

  const fetchAspirasi = useCallback(() => {
    if (!token || !user) return;
    fetch(`${backendUrl}/api/aspirasi`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (Array.isArray(data)) {
          setAspirasiList(data);
        } else {
          setAspirasiList([]);
        }
      })
      .catch(err => console.error("Error fetching aspirasi:", err));
  }, [backendUrl, token, user]);

  useEffect(() => {
    if (!token || !user) return;

    fetch(`${backendUrl}/api/dewan`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (Array.isArray(data)) setDewanList(data);
      })
      .catch(err => console.error("Error fetching dewan:", err));

    fetchSchedules();
    fetchAspirasi();
  }, [backendUrl, token, user, fetchSchedules, fetchAspirasi]);

  // Real-time socket updates
  useSocketUpdates({
    onScheduleUpdated: () => fetchSchedules(),
    onScheduleCreated: () => fetchSchedules(),
  });

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

  // Filter list Anggota Dewan
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

  // Submit E-Audiensi (Jadwal tatap muka dewan)
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
        title: meetingTitle || "Diskusi Audiensi Dewan"
      })
    });

    if (res.ok) {
      const newSchedule = await res.json();
      setSchedules([newSchedule, ...schedules]);
      setSelectedDewans([]);
      setSelectedSlot("");
      setMeetingTitle("");
      setCreateServiceType(null);
      setActiveTab('history');
      setAnnouncement("Permohonan E-Audiensi berhasil dikirim. Menunggu konfirmasi ketersediaan Anggota Dewan.");
    } else {
      const error = await res.json();
      setAnnouncement(`Gagal: ${error.error}`);
    }
  };

  // Callback sukses pengajuan E-Aspirasi baru
  const handleAspirasiSuccess = (newAspirasi: AspirasiData) => {
    setAspirasiList([newAspirasi, ...aspirasiList]);
    setCreateServiceType(null);
    setActiveTab('aspirasi');
    setSelectedAspirasiForTimeline(newAspirasi);
    setAnnouncement(`E-Aspirasi berhasil dikirim dengan Nomor Tiket ${newAspirasi.ticketNumber}. Anda dapat memantau timeline tindak lanjut di bawah ini.`);
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

  // Filter E-Aspirasi list
  const filteredAspirasiList = useMemo(() => {
    if (!aspirasiSearch.trim()) return aspirasiList;
    const q = aspirasiSearch.toLowerCase().trim();
    return aspirasiList.filter(a => 
      a.judul.toLowerCase().includes(q) ||
      a.ticketNumber.toLowerCase().includes(q) ||
      a.dapil.toLowerCase().includes(q) ||
      a.kategori.toLowerCase().includes(q)
    );
  }, [aspirasiList, aspirasiSearch]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div aria-live="polite" className="sr-only">{announcement}</div>
        
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-primary tracking-wide uppercase mb-1">
                Layanan Partisipasi Publik Digital
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Portal E-Aspirasi &amp; E-Audiensi Warga
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Suarakan usulan pembangunan, keluhan fasilitas publik, dan permohonan dialog langsung bersama 120 Anggota DPRD Provinsi Jawa Barat.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-card border border-border rounded-xl text-center shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">E-Aspirasi Mandiri</p>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{aspirasiList.length}</p>
              </div>
              <div className="px-4 py-2 bg-card border border-border rounded-xl text-center shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">E-Audiensi Dewan</p>
                <p className="text-lg font-extrabold text-primary">{schedules.length}</p>
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

        {/* ── Modern Tabs Navigation ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 border-b border-border pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* TAB 1: E-ASPIRASI MANDIRI */}
            <button
              onClick={() => {
                setActiveTab('aspirasi');
                setCreateServiceType(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'aspirasi'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <FileText size={15} />
              <span>E-Aspirasi Mandiri</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'aspirasi' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {aspirasiList.length}
              </span>
            </button>

            {/* TAB 2: SESI AKTIF (E-AUDIENSI) */}
            <button
              onClick={() => {
                setActiveTab('active');
                setCreateServiceType(null);
              }}
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
              <span>Sesi Audiensi Aktif</span>
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

            {/* TAB 3: JADWAL MENDATANG */}
            <button
              onClick={() => {
                setActiveTab('upcoming');
                setCreateServiceType(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'upcoming'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Calendar size={15} />
              <span>Audiensi Terjadwal</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {incomingSchedules.length}
              </span>
            </button>

            {/* TAB 4: RIWAYAT AUDIENSI */}
            <button
              onClick={() => {
                setActiveTab('history');
                setCreateServiceType(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'history'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Clock size={15} />
              <span>Riwayat Audiensi</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {otherSchedules.length}
              </span>
            </button>
          </div>

          {/* Action Button: Ajukan Layanan Baru */}
          <div className="flex items-center gap-2 shrink-0">
            {activeTab !== 'create' ? (
              <button
                onClick={() => {
                  setActiveTab('create');
                  setCreateServiceType(null);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-xs active:scale-95"
              >
                <PlusCircle size={15} />
                <span>+ Ajukan Layanan Baru</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('aspirasi');
                  setCreateServiceType(null);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-bold hover:bg-muted transition-all shadow-xs active:scale-95"
              >
                <ArrowLeft size={14} />
                <span>Kembali ke Daftar</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Persistent Live Conference Banner ── */}
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
                    Sesi audiensi dewan sedang berlangsung
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {activeSchedules[0].title || "Pertemuan Audiensi Dewan"}
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
            TAB 1: E-ASPIRASI MANDIRI (DAFTAR & TIMELINE TINDAK LANJUT)
           ═════════════════════════════════════════════════════════ */}
        {activeTab === 'aspirasi' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileText size={17} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Daftar E-Aspirasi Mandiri</h3>
                  <p className="text-xs text-muted-foreground">
                    Aspirasi dan materi digital yang telah Anda sampaikan ke Daerah Pemilihan (Dapil)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {aspirasiList.length > 0 && (
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={aspirasiSearch}
                      onChange={(e) => setAspirasiSearch(e.target.value)}
                      placeholder="Cari nomor tiket, judul, dapil..."
                      className="pl-8 pr-3 py-1.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-foreground w-full sm:w-64"
                    />
                  </div>
                )}
                <button
                  onClick={() => {
                    setActiveTab('create');
                    setCreateServiceType('aspirasi');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
                >
                  <PlusCircle size={14} />
                  <span>+ Tulis Aspirasi</span>
                </button>
              </div>
            </div>

            {aspirasiList.length === 0 ? (
              <div className="py-12 text-center bg-card border border-border border-dashed rounded-2xl p-8">
                <FileText size={32} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm font-bold text-foreground mb-1">Belum Ada E-Aspirasi yang Diajukan</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4 leading-relaxed">
                  Anda belum pernah mengirimkan usulan aspirasi mandiri. Silakan pilih Dapil Anda dan unggah berkas materi pendukung untuk memulai.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('create');
                    setCreateServiceType('aspirasi');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-xs"
                >
                  <PlusCircle size={14} />
                  <span>Kirim E-Aspirasi Pertama Anda</span>
                </button>
              </div>
            ) : filteredAspirasiList.length === 0 ? (
              <div className="py-12 text-center bg-card border border-border border-dashed rounded-2xl p-8">
                <p className="text-xs text-muted-foreground">Tidak ditemukan aspirasi yang cocok dengan kata kunci &quot;{aspirasiSearch}&quot;.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredAspirasiList.map((a) => {
                  const hasVideo = a.materiType === 'video';
                  const hasMateri = !!a.materiUrl;
                  const isCompleted = a.status === 'selesai';
                  const isTindakLanjut = a.status === 'tindak_lanjut';
                  const isDiteruskan = a.status === 'diteruskan';
                  const isVerifikasi = a.status === 'verifikasi';
                  const isDitolak = a.status === 'ditolak';

                  // Progress steps (0-4)
                  const stepMap: Record<string, number> = {
                    diajukan: 0, verifikasi: 1, diteruskan: 2, tindak_lanjut: 3, selesai: 4
                  };
                  const currentStep = stepMap[a.status] ?? 0;

                  const statusConfig = isCompleted
                    ? { label: 'Tuntas Terjawab', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500', glow: 'shadow-emerald-500/20' }
                    : isTindakLanjut
                    ? { label: 'Ditindaklanjuti', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30', dot: 'bg-blue-500', glow: 'shadow-blue-500/20' }
                    : isDiteruskan
                    ? { label: 'Di Meja Dewan', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30', dot: 'bg-indigo-500', glow: 'shadow-indigo-500/20' }
                    : isDitolak
                    ? { label: 'Ditolak', color: 'bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30', dot: 'bg-red-500', glow: 'shadow-red-500/20' }
                    : { label: 'Verifikasi', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30', dot: 'bg-amber-500', glow: 'shadow-amber-500/20' };

                  return (
                    <div
                      key={a.id}
                      className={`group relative bg-card border rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${
                        isCompleted ? 'border-emerald-500/30 hover:border-emerald-500/60'
                        : isTindakLanjut ? 'border-blue-500/25 hover:border-blue-500/50'
                        : isDiteruskan ? 'border-indigo-500/25 hover:border-indigo-500/50'
                        : 'border-border hover:border-amber-500/40'
                      }`}
                    >
                      {/* Card top accent bar */}
                      <div className={`h-1 w-full ${
                        isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : isTindakLanjut ? 'bg-gradient-to-r from-blue-500 to-indigo-400'
                        : isDiteruskan ? 'bg-gradient-to-r from-indigo-500 to-purple-400'
                        : isDitolak ? 'bg-gradient-to-r from-red-500 to-rose-400'
                        : 'bg-gradient-to-r from-amber-400 to-orange-300'
                      }`} />

                      <div className="p-5 flex flex-col gap-4 flex-1">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-black text-primary/80 bg-primary/8 px-2 py-0.5 rounded-md border border-primary/15">
                                {a.ticketNumber}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${statusConfig.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
                            {statusConfig.label}
                          </span>
                        </div>

                        {/* Title + Description */}
                        <div>
                          <h4 className="text-sm font-extrabold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {a.judul}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                            {a.deskripsi}
                          </p>
                        </div>

                        {/* Tags row */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-muted text-foreground px-2 py-0.5 rounded-md">
                            <MapPin size={9} />
                            {a.dapil.split('(')[0].trim()}
                          </span>
                          <span className="inline-flex text-[10px] font-semibold bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md">
                            {a.kategori}
                          </span>
                          {hasMateri && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 px-2 py-0.5 rounded-md border border-emerald-500/15">
                              {hasVideo ? <Film size={9} /> : <FileCheck2 size={9} />}
                              {hasVideo ? 'Video' : 'PDF/Dok'}
                            </span>
                          )}
                          {a.aiAnalysis && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/8 px-2 py-0.5 rounded-md border border-violet-500/15">
                              <Sparkles size={9} />
                              AI Ditelaah
                            </span>
                          )}
                        </div>

                        {/* AI Recommendation pill */}
                        {a.aiRecommendation && (
                          <div className={`flex items-center gap-2 p-2.5 rounded-xl text-[11px] font-bold border ${
                            a.aiRecommendation.toLowerCase().includes('diteruskan')
                              ? 'bg-emerald-500/8 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                              : a.aiRecommendation.toLowerCase().includes('klarifikasi')
                              ? 'bg-amber-500/8 text-amber-700 dark:text-amber-300 border-amber-500/20'
                              : 'bg-rose-500/8 text-rose-700 dark:text-rose-300 border-rose-500/20'
                          }`}>
                            <Sparkles size={11} className="shrink-0" />
                            <span>Rekomendasi AI: <strong>{a.aiRecommendation}</strong></span>
                          </div>
                        )}

                        {/* 5-step mini progress track */}
                        <div className="pt-1">
                          <div className="flex items-center gap-0">
                            {['Diajukan','Verifikasi','Diteruskan','Tindak Lanjut','Selesai'].map((label, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className={`w-full h-1.5 ${
                                  i === 0 ? 'rounded-l-full' : i === 4 ? 'rounded-r-full' : ''
                                } ${
                                  i < currentStep ? (isCompleted ? 'bg-emerald-500' : isTindakLanjut ? 'bg-blue-500' : 'bg-primary')
                                  : i === currentStep ? (isCompleted ? 'bg-emerald-400' : isTindakLanjut ? 'bg-blue-400' : 'bg-amber-400')
                                  : 'bg-muted'
                                }`} />
                                <span className={`text-[8px] font-semibold text-center leading-none ${
                                  i <= currentStep ? 'text-foreground' : 'text-muted-foreground/50'
                                }`}>{label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer action */}
                      <div className="px-5 py-3 bg-muted/30 border-t border-border flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          {a.dewan ? (
                            <><UserCheck size={11} className="text-primary" /><span className="font-medium truncate max-w-[120px]">Dewan: {a.dewan.name?.split(' ').slice(0,2).join(' ')}</span></>
                          ) : (
                            <span className="italic">Belum ditugaskan</span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedAspirasiForTimeline(a)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs border ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-primary/10 text-primary border-primary/25 hover:bg-primary/20'
                          }`}
                        >
                          <FileCheck2 size={12} />
                          <span>Timeline & Detail</span>
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            TAB 2: SESI AKTIF (E-AUDIENSI LIVEKIT)
           ═════════════════════════════════════════════════════════ */}
        {activeTab === 'active' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Video size={17} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Sesi E-Audiensi Aktif</h3>
                  <p className="text-xs text-muted-foreground">Sesi tatap muka virtual dewan yang sedang berlangsung</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {activeSchedules.length} Sesi
              </span>
            </div>

            {activeSchedules.length === 0 ? (
              <div className="py-12 text-center bg-card border border-border border-dashed rounded-2xl p-8">
                <Video size={32} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm font-bold text-foreground mb-1">Belum Ada Audiensi yang Sedang Aktif</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Sesi temu dewan virtual akan aktif secara otomatis pada jam ketersediaan yang telah disetujui.
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
                          <p className="text-sm font-bold text-foreground leading-snug">{s.title || "Pertemuan Audiensi"}</p>
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
            TAB 3: JADWAL MENDATANG (E-AUDIENSI TERKONFIRMASI)
           ═════════════════════════════════════════════════════════ */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Calendar size={17} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Jadwal E-Audiensi Mendatang</h3>
                  <p className="text-xs text-muted-foreground">Sesi musyawarah daring yang telah dikonfirmasi oleh Anggota Dewan</p>
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
                          <p className="text-sm font-bold text-foreground leading-snug">{s.title || "Pertemuan Audiensi"}</p>
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
            TAB 4: RIWAYAT E-AUDIENSI (SESI SELESAI & DISPOSISI)
           ═════════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                  <Clock size={17} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Riwayat E-Audiensi</h3>
                  <p className="text-xs text-muted-foreground">Pantau status konfirmasi dan pengawalan disposisi 4 tahap OPD</p>
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
                <p className="text-sm font-bold text-foreground mb-1">Belum Ada Riwayat Audiensi</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  Anda belum memiliki riwayat audiensi tatap muka daring.
                </p>
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
                            <p className="text-xs text-muted-foreground truncate mb-0.5">{s.title || "Pertemuan Audiensi"}</p>
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
                            title="Lihat status dan realisasi tindak lanjut audiensi Anda"
                          >
                            <FileCheck2 size={13} />
                            <span>
                              {progressPercent !== undefined && progressPercent > 0
                                ? `Progres: ${progressPercent}%`
                                : "Pantau Disposisi"}
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
            TAB 5: AJUKAN LAYANAN BARU (PILIHAN: AUDIENSI VS ASPIRASI)
           ═════════════════════════════════════════════════════════ */}
        {activeTab === 'create' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* JIKA BELUM MEMILIH SALURAN: TAMPILKAN 2 BUTTON CARDS */}
            {createServiceType === null && (
              <ServiceChoiceCards
                onSelectAudiensi={() => setCreateServiceType('audiensi')}
                onSelectAspirasi={() => setCreateServiceType('aspirasi')}
                activeService={createServiceType}
              />
            )}

            {/* JIKA MEMILIH E-ASPIRASI: TAMPILKAN FORM ASPIRASI */}
            {createServiceType === 'aspirasi' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <button
                    type="button"
                    onClick={() => setCreateServiceType(null)}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
                  >
                    <ArrowLeft size={14} />
                    <span>Ganti Pilihan Layanan (Kembali ke Pilihan E-Audiensi vs E-Aspirasi)</span>
                  </button>
                </div>
                <AspirasiForm
                  dewanList={dewanList}
                  token={token || ""}
                  backendUrl={backendUrl}
                  user={user}
                  onSuccess={handleAspirasiSuccess}
                  onCancel={() => setCreateServiceType(null)}
                />
              </div>
            )}

            {/* JIKA MEMILIH E-AUDIENSI: TAMPILKAN FORM PERTEMUAN TATAP MUKA */}
            {createServiceType === 'audiensi' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-2">
                  <button
                    type="button"
                    onClick={() => setCreateServiceType(null)}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
                  >
                    <ArrowLeft size={14} />
                    <span>Ganti Pilihan Layanan (Kembali ke Pilihan E-Audiensi vs E-Aspirasi)</span>
                  </button>
                </div>

                {/* Form Section E-Audiensi */}
                <section className="p-6 bg-card border border-border rounded-2xl shadow-xs">
                  <form onSubmit={handleScheduleSubmit}>
                    <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                      <div>
                        <h3 className="text-base font-bold text-foreground">Formulir Pengajuan Jadwal E-Audiensi</h3>
                        <p className="text-xs text-muted-foreground">Tentukan topik pembahasan dan slot ketersediaan tatap muka virtual dewan</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCreateServiceType(null)}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        Batal
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                          Judul / Topik Audiensi
                        </label>
                        <input
                          type="text"
                          value={meetingTitle}
                          onChange={(e) => setMeetingTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                          placeholder="Cth: Dengar Pendapat Regulasi Pengelolaan Lingkungan"
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
                          Legislator Dipilih: <strong className="text-primary font-bold">{selectedDewans.length}</strong> orang
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
                        <span>Kirim Permohonan Audiensi</span>
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
                        <p className="text-xs text-muted-foreground">Pilih satu atau beberapa legislator untuk diundang dalam sesi tatap muka</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
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
          </div>
        )}

        {/* Follow-Up Disposisi Timeline Modal (E-Audiensi) */}
        <FollowUpTimelineModal
          isOpen={!!followUpScheduleId}
          onClose={() => setFollowUpScheduleId(null)}
          schedule={followUpSchedule}
          onUpdate={(updated) => {
            setSchedules(prev => prev.map(s => s.id === updated.scheduleId ? { ...s, followUp: updated } : s));
          }}
        />

        {/* E-Aspirasi Timeline Modal (Materi & 5 Tahap Progres) */}
        <AspirasiTimelineModal
          isOpen={!!selectedAspirasiForTimeline}
          onClose={() => setSelectedAspirasiForTimeline(null)}
          aspirasi={selectedAspirasiForTimeline}
          userRole="masyarakat"
          token={token || ""}
          backendUrl={backendUrl}
          onUpdate={(updated) => {
            setAspirasiList(prev => prev.map(a => a.id === updated.id ? updated : a));
            setSelectedAspirasiForTimeline(updated);
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