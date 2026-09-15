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
  Sparkles,
  Inbox,
  AlertCircle,
  Check,
  HelpCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import FollowUpTimelineModal, { FollowUpData } from "@/components/FollowUpTimelineModal";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSocketUpdates } from "@/hooks/useSocketUpdates";
import { getBackendUrl } from "@/context/utils";

type FilterTab = "all" | "pending" | "confirmed" | "followup";

export default function DewanDashboard() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [followUpScheduleId, setFollowUpScheduleId] = useState<number | null>(null);
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
          console.error("Fetched schedules is not an array:", data);
          setSchedules([]);
        }
      })
      .catch((err) => console.error("Error fetching schedules:", err));
  }, [backendUrl, token, user]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useSocketUpdates({
    onScheduleUpdated: () => fetchSchedules(),
    onScheduleCreated: () => fetchSchedules(),
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
          `Permohonan aspirasi #${id} telah ${status === "confirmed" ? "disetujui" : "ditolak"}.`
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
    return { total, pending, confirmed, withFollowUp };
  }, [schedules]);

  // Filtered schedules with clean sorting
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      // Status filter
      if (selectedFilter === "pending" && s.status !== "pending") return false;
      if (selectedFilter === "confirmed" && s.status !== "confirmed") return false;
      if (
        selectedFilter === "followup" &&
        (!s.followUp || !s.followUp.progressPercent || s.followUp.progressPercent === 0)
      )
        return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = (s.title || "").toLowerCase().includes(query);
        const nameMatch = (s.masyarakat?.name || "").toLowerCase().includes(query);
        const kabupatenMatch = (s.masyarakat?.kabupaten || "").toLowerCase().includes(query);
        if (!titleMatch && !nameMatch && !kabupatenMatch) return false;
      }

      return true;
    }).sort((a, b) => b.id - a.id);
  }, [schedules, selectedFilter, searchQuery]);

  return (
    <ProtectedRoute allowedRoles={["dewan", "admin"]}>
      <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-background">
        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    <Sparkles size={13} />
                    Portal Legislator DPRD Jabar
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Panel Dewan
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Kelola aspirasi masyarakat, persetujuan jadwal audiensi, dan pemantauan tindak lanjut konstituen secara transparan.
                </p>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 bg-card border border-border rounded-xl text-xs font-medium text-muted-foreground shadow-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Masuk sebagai: <strong className="text-foreground font-semibold">{user?.name || "Anggota Dewan"}</strong></span>
              </div>
            </div>
          </header>

          {/* Quick Metrics KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                <span className="text-xs font-semibold text-muted-foreground">Total Aspirasi</span>
                <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                  <Inbox size={15} />
                </div>
              </div>
              <p className="text-2xl font-black text-foreground">{stats.total}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Semua agenda yang masuk</p>
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
              <p className="text-[11px] text-muted-foreground mt-0.5">Menunggu konfirmasi Anda</p>
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
              <p className="text-[11px] text-muted-foreground mt-0.5">Siap temu daring/tatap muka</p>
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
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Ditindaklanjuti</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileCheck2 size={15} />
                </div>
              </div>
              <p className="text-2xl font-black text-foreground">{stats.withFollowUp}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Progres disposisi berjalan</p>
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
            
            {/* Left Column: Schedules List (More spacious) */}
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
                    <span>Semua</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                        selectedFilter === "all"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
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
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                        selectedFilter === "pending"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
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
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                        selectedFilter === "confirmed"
                          ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {stats.confirmed}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFilter("followup")}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      selectedFilter === "followup"
                        ? "bg-card text-emerald-600 dark:text-emerald-400 font-bold shadow-xs border border-emerald-200 dark:border-emerald-900/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/40 font-medium"
                    }`}
                  >
                    <span>Ditindaklanjuti</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                        selectedFilter === "followup"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {stats.withFollowUp}
                    </span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[200px] sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari aspirasi / nama warga..."
                    className="w-full pl-8 pr-7 py-2 bg-card border border-border/80 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {filteredSchedules.length === 0 ? (
                  <div className="py-16 text-center bg-card border border-dashed border-border rounded-2xl p-6">
                    <Calendar size={32} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="text-sm font-bold text-foreground mb-1">
                      Tidak Ada Permohonan Aspirasi
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      {searchQuery
                        ? `Tidak ditemukan hasil pencarian untuk "${searchQuery}".`
                        : "Belum ada agenda aspirasi pada kategori filter yang dipilih."}
                    </p>
                  </div>
                ) : (
                  filteredSchedules.map((s) => {
                    const progress = s.followUp?.progressPercent ?? 0;
                    const isPending = s.status === "pending";
                    const isConfirmed = s.status === "confirmed";
                    const isRejected = s.status === "rejected";

                    return (
                      <div
                        key={s.id}
                        className="bg-card hover:border-primary/40 border border-border/80 rounded-2xl p-4 sm:px-5 sm:py-4 transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4"
                      >
                        {/* Left Side: Avatar + Info */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {/* Avatar with Status Indicator Dot */}
                          <div className="relative shrink-0">
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm border ${
                                isConfirmed
                                  ? "bg-blue-50 text-blue-600 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50"
                                  : isPending
                                  ? "bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50"
                                  : "bg-rose-50 text-rose-600 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50"
                              }`}
                            >
                              <User size={19} />
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-card text-white text-[9px] shadow-2xs ${
                                isConfirmed
                                  ? "bg-blue-600"
                                  : isPending
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                            >
                              {isConfirmed ? (
                                <Check size={10} strokeWidth={3} />
                              ) : isPending ? (
                                <Clock size={10} strokeWidth={2.5} />
                              ) : (
                                <X size={10} strokeWidth={3} />
                              )}
                            </div>
                          </div>

                          {/* 2-Row Uniform Content */}
                          <div className="min-w-0 flex-1">
                            {/* Row 1: Title + Inline Badge immediately adjacent */}
                            <div className="flex items-center gap-2 min-w-0">
                              <h4
                                className="text-sm font-bold text-foreground truncate max-w-[240px] sm:max-w-sm md:max-w-md lg:max-w-lg shrink-0"
                                title={s.title || `Agenda Aspirasi #${s.id}`}
                              >
                                {s.title || `Agenda Aspirasi #${s.id}`}
                              </h4>

                              {/* Status Badge sits naturally next to the title text */}
                              <div className="shrink-0">
                                {isConfirmed ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                                    <CheckCircle2 size={11} />
                                    Dikonfirmasi
                                  </span>
                                ) : isPending ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                                    <Clock size={11} />
                                    Menunggu Respon
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                                    <XCircle size={11} />
                                    Ditolak
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Row 2: Metadata (Single-line, strictly uniform height) */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 min-w-0 truncate">
                              <span className="truncate shrink-0">
                                Pemohon: <strong className="text-primary font-semibold">{s.masyarakat?.name || "Masyarakat"}</strong>
                              </span>
                              <span className="text-muted-foreground/40 shrink-0">•</span>
                              <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                                <Clock size={12} className="text-muted-foreground/70" />
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

                        {/* Right Side: Uniform Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 justify-end">
                          {/* Pending Actions */}
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateStatus(s.id, "rejected")}
                                className="h-9 px-3 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/70 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              >
                                <X size={13} strokeWidth={2.5} />
                                <span>Tolak</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStatus(s.id, "confirmed")}
                                className="h-9 px-3.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Check size={13} strokeWidth={2.5} />
                                <span>Setujui</span>
                              </button>
                            </>
                          )}

                          {/* Confirmed Action */}
                          {isConfirmed && (
                            <button
                              type="button"
                              onClick={() => router.push(`/room/${s.id}`)}
                              className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
                            >
                              <Video size={13} />
                              <span>Gabung</span>
                            </button>
                          )}

                          {/* Follow Up Button (Always Uniform across all statuses) */}
                          <button
                            type="button"
                            onClick={() => setFollowUpScheduleId(s.id)}
                            className="h-9 px-3.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 text-xs border border-border/80 bg-card hover:bg-muted/60 text-foreground shadow-2xs cursor-pointer"
                            title="Timeline & Progres Tindak Lanjut Aspirasi"
                          >
                            <FileCheck2 size={13} className="text-primary" />
                            <span>Tindak Lanjut</span>
                            {progress > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary">
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
            </div>

            {/* Right Column: Informative Sidebar */}
            <div className="lg:col-span-3 space-y-4">
              {/* Important Info Card */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2.5 mb-3 text-primary">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <AlertCircle size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Pengaturan Ketersediaan</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Modul pengaturan jadwal ketersediaan kini dikelola secara terpusat oleh Admin Sekretariat DPRD.
                  Untuk menambah atau mengubah slot ketersediaan waktu temu Anda, silakan hubungi administrator sistem.
                </p>
              </div>

              {/* Workflow Guide Card */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-primary" />
                  Alur Penanganan Aspirasi
                </h4>
                <ol className="text-xs text-muted-foreground space-y-2.5 list-decimal list-inside leading-relaxed">
                  <li><strong className="text-foreground">Respon Cepat:</strong> Setujui atau tolak agenda aspirasi yang masuk dalam 1x24 jam.</li>
                  <li><strong className="text-foreground">Sesi Video:</strong> Klik tombol <em>Gabung</em> pada jadwal yang terkonfirmasi untuk dialog video.</li>
                  <li><strong className="text-foreground">Disposisi & Checklist:</strong> Perbarui progres tindak lanjut agar masyarakat dapat memantau transparansi penanganan.</li>
                </ol>
              </div>
            </div>

          </div>
        </div>

        {/* Follow-Up Timeline Modal */}
        <FollowUpTimelineModal
          isOpen={!!followUpScheduleId}
          onClose={() => setFollowUpScheduleId(null)}
          schedule={followUpSchedule}
          onUpdate={handleFollowUpUpdate}
        />
      </div>
    </ProtectedRoute>
  );
}