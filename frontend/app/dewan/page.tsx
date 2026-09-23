"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Clock,
  Video,
  X,
  FileCheck2,
  Search,
  Inbox,
  AlertCircle,
  Check,
  HelpCircle,
  FileText,
  Film,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import FollowUpTimelineModal, { FollowUpData } from "@/components/FollowUpTimelineModal";
import AspirasiTimelineModal, { AspirasiData } from "@/components/AspirasiTimelineModal";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSocketUpdates } from "@/hooks/useSocketUpdates";
import { getBackendUrl } from "@/context/utils";

type FilterTab = "all" | "pending" | "confirmed" | "followup" | "aspirasi";

export default function DewanDashboard() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [aspirasiList, setAspirasiList] = useState<AspirasiData[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [followUpScheduleId, setFollowUpScheduleId] = useState<number | null>(null);
  const [selectedAspirasiForModal, setSelectedAspirasiForModal] = useState<AspirasiData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>("all");

  const router = useRouter();
  const { user, token } = useAuth();
  const backendUrl = getBackendUrl();

  const followUpSchedule = useMemo(() => {
    return schedules.find((s) => s.id === followUpScheduleId) || null;
  }, [schedules, followUpScheduleId]);

  const handleFollowUpUpdate = (updatedFollowUp: FollowUpData) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === updatedFollowUp.scheduleId
          ? { ...s, followUp: updatedFollowUp }
          : s
      )
    );
  };

  const fetchSchedules = useCallback(() => {
    if (!token || !user) return;
    fetch(`${backendUrl}/api/schedules?role=dewan&userId=${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSchedules(data);
        } else {
          setSchedules([]);
        }
      })
      .catch((err) => console.error("Error fetching schedules:", err));
  }, [backendUrl, token, user]);

  const fetchAspirasi = useCallback(() => {
    if (!token || !user) return;
    fetch(`${backendUrl}/api/aspirasi`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAspirasiList(data);
        } else {
          setAspirasiList([]);
        }
      })
      .catch((err) => console.error("Error fetching dewan aspirasi:", err));
  }, [backendUrl, token, user]);

  useEffect(() => {
    fetchSchedules();
    fetchAspirasi();
  }, [fetchSchedules, fetchAspirasi]);

  useSocketUpdates({
    onScheduleUpdated: () => {
      fetchSchedules();
      fetchAspirasi();
    },
    onScheduleCreated: () => {
      fetchSchedules();
      fetchAspirasi();
    },
    onFollowUpUpdated: (data) => {
      if (data?.followUp) {
        setSchedules((prev) =>
          prev.map((s) =>
            s.id === data.scheduleId ? { ...s, followUp: data.followUp } : s
          )
        );
      } else {
        fetchSchedules();
      }
    },
  });

  const updateStatus = async (id: number, status: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${backendUrl}/api/schedules/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setSchedules((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status } : s))
        );
        setAnnouncement(
          `Permohonan audiensi #${id} telah ${status === "confirmed" ? "disetujui" : "ditolak"}.`
        );
      }
    } catch (e) {
      console.error("Error updating schedule status:", e);
    }
  };

  // KPI Metrics Calculation
  const stats = useMemo(() => {
    const total = schedules.length;
    const pending = schedules.filter((s) => s.status === "pending").length;
    const confirmed = schedules.filter((s) => s.status === "confirmed").length;
    const withFollowUp = schedules.filter(
      (s) => s.followUp && s.followUp.progressPercent > 0
    ).length;
    const totalAspirasi = aspirasiList.length;
    return { total, pending, confirmed, withFollowUp, totalAspirasi };
  }, [schedules, aspirasiList]);

  // Filtered schedules for Audiensi
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (selectedFilter === "pending") return s.status === "pending";
      if (selectedFilter === "confirmed") return s.status === "confirmed";
      if (selectedFilter === "followup")
        return s.followUp && s.followUp.progressPercent > 0;
      return true;
    }).filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const citizenName = s.masyarakat?.name?.toLowerCase() || "";
      const title = s.title?.toLowerCase() || "";
      const id = String(s.id);
      return citizenName.includes(q) || title.includes(q) || id.includes(q);
    });
  }, [schedules, selectedFilter, searchQuery]);

  // Filtered aspirasi list
  const filteredAspirasiList = useMemo(() => {
    if (!searchQuery.trim()) return aspirasiList;
    const q = searchQuery.toLowerCase();
    return aspirasiList.filter((a) => {
      return (
        a.judul.toLowerCase().includes(q) ||
        a.ticketNumber.toLowerCase().includes(q) ||
        a.dapil.toLowerCase().includes(q) ||
        (a.masyarakat?.name && a.masyarakat.name.toLowerCase().includes(q))
      );
    });
  }, [aspirasiList, searchQuery]);

  return (
    <ProtectedRoute allowedRoles={["dewan", "admin"]}>
      <div className="flex flex-col min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
          
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Panel Kerja Kedewanan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
                Dasbor Legislator Jawa Barat
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Kelola permohonan E-Audiensi tatap muka virtual dan tindak lanjuti E-Aspirasi warga di Dapil Anda.
              </p>
            </div>

            {user?.dapil && (
              <div className="px-3.5 py-2 bg-muted/40 border border-border rounded-xl text-xs flex items-center gap-2 self-start sm:self-center">
                <span className="font-bold text-muted-foreground">Wilayah:</span>
                <span className="font-black text-foreground">{user.dapil}</span>
              </div>
            )}
          </div>

          {/* 5 KPI Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-6">
            <button
              type="button"
              onClick={() => setSelectedFilter("all")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedFilter === "all"
                  ? "bg-card border-primary shadow-xs ring-2 ring-primary/20"
                  : "bg-card border-border hover:border-border/80 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground">Semua Audiensi</span>
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Calendar size={15} />
                </div>
              </div>
              <p className="text-2xl font-black text-foreground">{stats.total}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Agenda temu masuk</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter("pending")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedFilter === "pending"
                  ? "bg-amber-500/5 border-amber-500 shadow-xs ring-2 ring-amber-500/20"
                  : "bg-card border-border hover:border-border/80 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Butuh Respon</span>
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock size={15} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-black text-foreground">{stats.pending}</p>
                {stats.pending > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold animate-pulse">
                    Tindakan
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Konfirmasi audiensi</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter("confirmed")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedFilter === "confirmed"
                  ? "bg-blue-500/5 border-blue-500 shadow-xs ring-2 ring-blue-500/20"
                  : "bg-card border-border hover:border-border/80 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Dikonfirmasi</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <CheckCircle2 size={15} />
                </div>
              </div>
              <p className="text-2xl font-black text-foreground">{stats.confirmed}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Siap temu daring</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter("followup")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedFilter === "followup"
                  ? "bg-emerald-500/5 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20"
                  : "bg-card border-border hover:border-border/80 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Disposisi OPD</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileCheck2 size={15} />
                </div>
              </div>
              <p className="text-2xl font-black text-foreground">{stats.withFollowUp}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Progres 4 tahap</p>
            </button>

            {/* KARTU KE-5: E-ASPIRASI DAPIL */}
            <button
              type="button"
              onClick={() => setSelectedFilter("aspirasi")}
              className={`p-4 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
                selectedFilter === "aspirasi"
                  ? "bg-emerald-500/10 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20"
                  : "bg-card border-border hover:border-emerald-500/50 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">E-Aspirasi Dapil</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <FileText size={15} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-black text-foreground">{stats.totalAspirasi}</p>
                {stats.totalAspirasi > 0 && (
                  <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold">
                    Materi Masuk
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Video &amp; berkas konstituen</p>
            </button>
          </div>

          {/* Toast Notification */}
          {announcement && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{announcement}</span>
              </div>
              <button
                onClick={() => setAnnouncement("")}
                className="p-1.5 hover:bg-primary/20 rounded-lg text-primary transition-colors"
                title="Tutup Notifikasi"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Main Layout: 9 cols list + 3 cols sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Schedules or Aspirasi List */}
            <div className="lg:col-span-9 space-y-4">
              
              {/* Filter Tabs and Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                {/* Segmented Filter Pills */}
                <div className="inline-flex items-center gap-1 p-1 bg-muted/50 border border-border/80 rounded-xl shadow-2xs overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      selectedFilter === "all"
                        ? "bg-card text-foreground font-bold shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/40 font-medium"
                    }`}
                  >
                    <span>Semua Audiensi</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-muted text-muted-foreground">
                      {stats.total}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFilter("pending")}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      selectedFilter === "pending"
                        ? "bg-card text-amber-600 dark:text-amber-400 font-bold shadow-xs border border-amber-200 dark:border-amber-900/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/40 font-medium"
                    }`}
                  >
                    <span>Perlu Respon</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                      {stats.pending}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFilter("confirmed")}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      selectedFilter === "confirmed"
                        ? "bg-card text-blue-600 dark:text-blue-400 font-bold shadow-xs border border-blue-200 dark:border-blue-900/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/40 font-medium"
                    }`}
                  >
                    <span>Dikonfirmasi</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300">
                      {stats.confirmed}
                    </span>
                  </button>

                  {/* TAB E-ASPIRASI DAPIL */}
                  <button
                    type="button"
                    onClick={() => setSelectedFilter("aspirasi")}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      selectedFilter === "aspirasi"
                        ? "bg-emerald-600 text-white font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/40 font-medium"
                    }`}
                  >
                    <FileText size={13} />
                    <span>E-Aspirasi Dapil</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      selectedFilter === "aspirasi" ? "bg-white/20 text-white" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    }`}>
                      {stats.totalAspirasi}
                    </span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-60">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari aspirasi atau nama..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60 transition-all"
                  />
                </div>
              </div>

              {/* VIEW 1: JIKA MEMILIH TAB E-ASPIRASI DAPIL */}
              {selectedFilter === "aspirasi" ? (
                <div className="space-y-3">
                  {filteredAspirasiList.length === 0 ? (
                    <div className="py-12 text-center bg-card border border-dashed border-border rounded-2xl p-6">
                      <FileText size={32} className="mx-auto mb-2 text-muted-foreground opacity-30" />
                      <p className="text-sm font-bold text-foreground">Belum Ada E-Aspirasi Masuk dari Dapil Anda</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        Ketika masyarakat dari daerah pemilihan Anda mengirimkan usulan atau laporan berkas materi, daftarnya akan tampil di sini.
                      </p>
                    </div>
                  ) : (
                    filteredAspirasiList.map((a) => {
                      const hasVideo = a.materiType === "video";
                      const hasMateri = !!a.materiUrl;
                      const isCompleted = a.status === "selesai";

                      return (
                        <div
                          key={a.id}
                          className="bg-card border border-border hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs transition-all"
                        >
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-black text-primary">
                                {a.ticketNumber}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                {a.dapil.split("(")[0].trim()}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                isCompleted
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                                  : a.status === "tindak_lanjut"
                                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                              }`}>
                                {a.status === "selesai"
                                  ? "Tuntas Terjawab"
                                  : a.status === "tindak_lanjut"
                                  ? "Ditindaklanjuti"
                                  : a.status === "diteruskan"
                                  ? "Di Meja Dewan"
                                  : "Verifikasi"}
                              </span>

                              {a.aiRecommendation && (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                                  a.aiRecommendation.toLowerCase().includes('diteruskan')
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                                    : a.aiRecommendation.toLowerCase().includes('klarifikasi')
                                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                                }`}>
                                  <Sparkles size={11} />
                                  <span>Telaah AI: {a.aiRecommendation}</span>
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-foreground leading-snug">
                                {a.judul}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                {a.deskripsi}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                              <span className="font-semibold text-foreground">
                                Pemohon: {a.masyarakat?.name || "Warga Konstituen"}
                              </span>
                              <span>•</span>
                              <span>{a.kategori}</span>
                              {hasMateri && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                                    {hasVideo ? <Film size={12} /> : <FileCheck2 size={12} />}
                                    <span>{hasVideo ? "Materi Video MP4" : "Dokumen Materi"}</span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                            <button
                              type="button"
                              onClick={() => setSelectedAspirasiForModal(a)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                            >
                              <MessageSquare size={13} />
                              <span>Tinjau &amp; Tanggapi</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* VIEW 2: LIST AUDIENSI (JADWAL TEMU LIVEKIT) */
                <div className="space-y-3">
                  {filteredSchedules.length === 0 ? (
                    <div className="py-12 text-center bg-card border border-dashed border-border rounded-2xl p-6">
                      <Inbox size={32} className="mx-auto mb-2 text-muted-foreground opacity-30" />
                      <p className="text-sm font-bold text-foreground">Tidak Ada Permohonan Audiensi</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                        {searchQuery
                          ? `Tidak ditemukan hasil yang cocok dengan kata kunci "${searchQuery}".`
                          : "Belum ada permohonan temu virtual pada kategori filter ini."}
                      </p>
                    </div>
                  ) : (
                    filteredSchedules.map((s) => {
                      const isPending = s.status === "pending";
                      const isConfirmed = s.status === "confirmed";
                      const progress = s.followUp?.progressPercent || 0;

                      return (
                        <div
                          key={s.id}
                          className="bg-card border border-border hover:border-border/80 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs transition-all"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                              {s.masyarakat?.name ? s.masyarakat.name.charAt(0).toUpperCase() : "W"}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-xs font-bold text-foreground">
                                  {s.masyarakat?.name || "Warga Konstituen"}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">#{s.id}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                    isConfirmed
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                      : isPending
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                  }`}
                                >
                                  {isConfirmed ? "Disetujui" : isPending ? "Menunggu" : "Ditolak"}
                                </span>
                              </div>

                              <p className="text-xs text-foreground font-medium truncate mb-1">
                                {s.title || "Diskusi Audiensi"}
                              </p>

                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                                <span>{s.masyarakat?.kabupaten || "Jawa Barat"}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>
                                    {new Date(s.startTime).toLocaleString("id-ID", {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    })}{" "}
                                    WIB
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 justify-end">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => updateStatus(s.id, "rejected")}
                                  className="h-9 px-3 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5"
                                >
                                  <X size={13} />
                                  <span>Tolak</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateStatus(s.id, "confirmed")}
                                  className="h-9 px-3.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                                >
                                  <Check size={13} />
                                  <span>Setujui</span>
                                </button>
                              </>
                            )}

                            {isConfirmed && (
                              <button
                                type="button"
                                onClick={() => router.push(`/room/${s.id}`)}
                                className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                              >
                                <Video size={13} />
                                <span>Gabung</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setFollowUpScheduleId(s.id)}
                              className="h-9 px-3.5 rounded-xl font-semibold text-xs border border-border bg-card hover:bg-muted text-foreground transition-all flex items-center gap-1.5"
                            >
                              <FileCheck2 size={13} className="text-primary" />
                              <span>Disposisi</span>
                              {progress > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                                  {progress}%
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Informative Sidebar */}
            <div className="lg:col-span-3 space-y-4">
              {/* Important Info Card */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2.5 mb-3 text-primary">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <AlertCircle size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Dua Pintu Masuk Aspirasi</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>E-Audiensi:</strong> Dialog langsung via video call sesuai slot jadwal Anda.<br />
                  <strong>E-Aspirasi:</strong> Warga mengirimkan berkas/video usulan dari Dapil yang dapat ditanggapi langsung secara resmi di platform.
                </p>
              </div>

              {/* Workflow Guide Card */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-primary" />
                  Alur Penanganan Aspirasi
                </h4>
                <ol className="text-xs text-muted-foreground space-y-2.5 list-decimal list-inside leading-relaxed">
                  <li><strong className="text-foreground">Respon Cepat:</strong> Setujui atau tolak agenda audiensi dalam 1x24 jam.</li>
                  <li><strong className="text-foreground">Tinjau E-Aspirasi:</strong> Putar video materi atau baca dokumen usulan dari warga di Dapil Anda.</li>
                  <li><strong className="text-foreground">Beri Tanggapan:</strong> Tuliskan tanggapan resmi dan arahkan tindak lanjut rekomendasi dewan.</li>
                </ol>
              </div>
            </div>

          </div>
        </div>

        {/* Follow-Up Disposisi Timeline Modal (E-Audiensi) */}
        <FollowUpTimelineModal
          isOpen={!!followUpScheduleId}
          onClose={() => setFollowUpScheduleId(null)}
          schedule={followUpSchedule}
          onUpdate={handleFollowUpUpdate}
        />

        {/* E-Aspirasi Timeline & Tanggapan Modal */}
        <AspirasiTimelineModal
          isOpen={!!selectedAspirasiForModal}
          onClose={() => setSelectedAspirasiForModal(null)}
          aspirasi={selectedAspirasiForModal}
          userRole="dewan"
          token={token || ""}
          backendUrl={backendUrl}
          onUpdate={(updated) => {
            setAspirasiList((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a))
            );
            setSelectedAspirasiForModal(updated);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}