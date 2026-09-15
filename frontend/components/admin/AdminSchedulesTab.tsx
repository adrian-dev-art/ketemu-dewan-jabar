"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Calendar,
  MapPin,
  FileCheck2,
  FileSpreadsheet,
  Trash2,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  CalendarDays,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ArrowUpDown,
} from "lucide-react";

interface ScheduleItem {
  id: number;
  title: string;
  startTime: string;
  status: string;
  masyarakat?: {
    id: number;
    name: string;
    email: string;
    kabupaten?: string;
    kecamatan?: string;
  };
  participants?: Array<{
    dewanId: number;
    status: string;
    dewan?: {
      id: number;
      name: string;
      fraksi?: string;
    };
  }>;
  recordingUrl?: string | null;
  transcription?: string | null;
  isTranscribing?: boolean;
  transcriptionProgress?: number;
  transcriptionStatus?: string | null;
  analysis?: any;
  isAnalyzing?: boolean;
  followUp?: any;
}

interface AdminSchedulesTabProps {
  schedules: ScheduleItem[];
  token: string | null;
  backendUrl: string;
  onRefreshSchedules: () => void;
  onOpenAnalysis: (scheduleId: number, title: string) => void;
  onOpenFollowUp: (scheduleId: number) => void;
}

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending: { label: "Menunggu", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
  confirmed: { label: "Dikonfirmasi", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  rejected: { label: "Ditolak", bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/20" },
  completed: { label: "Selesai", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
};

export default function AdminSchedulesTab({
  schedules,
  token,
  backendUrl,
  onRefreshSchedules,
  onOpenAnalysis,
  onOpenFollowUp,
}: AdminSchedulesTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [followUpFilter, setFollowUpFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"id" | "startTime" | "title" | "status">("id");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const [transcribingId, setTranscribingId] = useState<number | null>(null);

  const filteredSchedules = useMemo(() => {
    return schedules
      .filter((s) => {
        const q = search.toLowerCase();
        const dewanNames = s.participants?.map((p) => p.dewan?.name || "").join(" ").toLowerCase() || "";
        const matchSearch =
          !search ||
          s.title.toLowerCase().includes(q) ||
          (s.masyarakat?.name && s.masyarakat.name.toLowerCase().includes(q)) ||
          dewanNames.includes(q);

        const matchStatus = statusFilter === "all" || s.status === statusFilter;

        let matchFollowUp = true;
        if (followUpFilter !== "all") {
          const f = s.followUp;
          if (followUpFilter === "disposed") matchFollowUp = Boolean(f && f.isShared);
          else if (followUpFilter === "viewed") matchFollowUp = Boolean(f && f.isViewed);
          else if (followUpFilter === "in_progress") matchFollowUp = Boolean(f && f.status === "diproses");
          else if (followUpFilter === "completed") matchFollowUp = Boolean(f && (f.status === "selesai" || f.progressPercent === 100));
          else if (followUpFilter === "not_disposed") matchFollowUp = !f || !f.isShared;
        }

        let matchDate = true;
        if (startDate) matchDate = matchDate && new Date(s.startTime) >= new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchDate = matchDate && new Date(s.startTime) <= end;
        }

        return matchSearch && matchStatus && matchFollowUp && matchDate;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === "id") diff = a.id - b.id;
        else if (sortBy === "startTime") diff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        else if (sortBy === "title") diff = a.title.localeCompare(b.title);
        else if (sortBy === "status") diff = a.status.localeCompare(b.status);
        return sortDir === "desc" ? -diff : diff;
      });
  }, [schedules, search, statusFilter, followUpFilter, startDate, endDate, sortBy, sortDir]);

  const totalPages = Math.ceil(filteredSchedules.length / PAGE_SIZE) || 1;
  const paginatedSchedules = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSchedules.slice(start, start + PAGE_SIZE);
  }, [filteredSchedules, page]);

  const handleExportCSV = () => {
    const BOM = "\uFEFF";
    const headers = [
      "ID Sesi", "Judul Aspirasi", "Waktu Sesi", "Status",
      "Nama Pengusul", "Kabupaten", "Dewan Partisipan",
      "Status Disposisi", "Progres Disposisi (%)",
    ];
    const rows = filteredSchedules.map((s) => [
      s.id, s.title,
      new Date(s.startTime).toLocaleString("id-ID"),
      s.status.toUpperCase(),
      s.masyarakat?.name || "N/A",
      s.masyarakat?.kabupaten || "-",
      s.participants?.map((p) => p.dewan?.name).filter(Boolean).join(", ") || "-",
      s.followUp?.status || "Belum Disposisi",
      s.followUp?.progressPercent || 0,
    ]);
    const csvContent =
      BOM +
      [
        headers.map((h) => `"${h}"`).join(","),
        ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
      ].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rekap_jadwal_aspirasi_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleTriggerTranscribe = async (scheduleId: number) => {
    setTranscribingId(scheduleId);
    try {
      const res = await fetch(`${backendUrl}/api/admin/schedules/${scheduleId}/transcribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onRefreshSchedules();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memproses transkripsi rekaman");
      }
    } catch {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setTranscribingId(null);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm("Hapus jadwal pertemuan ini secara permanen?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/admin/schedules/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onRefreshSchedules();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus jadwal");
      }
    } catch {
      alert("Terjadi kesalahan jaringan");
    }
  };

  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    return range;
  }, [page, totalPages]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Filters card */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              id="schedules-search"
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari berdasarkan judul aspirasi, nama warga, atau anggota dewan..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl font-bold transition-all shrink-0 active:scale-95 shadow-xs"
          >
            <FileSpreadsheet size={15} />
            Ekspor Excel
          </button>
        </div>

        {/* Filter Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Status Sesi</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground font-medium transition-all"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="rejected">Ditolak</option>
              <option value="completed">Selesai</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Status Disposisi</label>
            <select
              value={followUpFilter}
              onChange={(e) => { setFollowUpFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground font-medium transition-all"
            >
              <option value="all">Semua Disposisi</option>
              <option value="disposed">1. Surat Terbit</option>
              <option value="viewed">2. Dibaca OPD</option>
              <option value="in_progress">3. Ditindaklanjuti</option>
              <option value="completed">4. Tuntas 100%</option>
              <option value="not_disposed">Belum Disposisi</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Urutan Data</label>
            <div className="flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground font-semibold transition-all"
              >
                <option value="id">Terbaru (Latest)</option>
                <option value="startTime">Waktu Sesi</option>
                <option value="title">Judul Aspirasi</option>
                <option value="status">Status</option>
              </select>
              <button
                type="button"
                onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                className="p-2 bg-muted/40 border border-border rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0"
                title={sortDir === "desc" ? "Urutan: Terbaru ke Terlama (Desc)" : "Urutan: Terlama ke Terbaru (Asc)"}
              >
                {sortDir === "desc" ? <ArrowDownWideNarrow size={15} /> : <ArrowUpNarrowWide size={15} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result summary text */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Menampilkan <strong className="text-foreground">{filteredSchedules.length}</strong> dari{" "}
          <strong className="text-foreground">{schedules.length}</strong> sesi pertemuan (Urut: <span className="text-foreground font-semibold">{sortBy === "id" ? "Terbaru Dibuat" : sortBy === "startTime" ? "Waktu Sesi" : sortBy}</span>)
        </span>
        <span className="text-[11px] font-medium">Halaman {page} dari {totalPages}</span>
      </div>

      {/* Modern Responsive Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-muted/60 dark:bg-muted/40 border-b border-border text-muted-foreground">
              <tr>
                <th
                  onClick={() => {
                    if (sortBy === "id") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    else { setSortBy("id"); setSortDir("desc"); }
                  }}
                  className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                  style={{ minWidth: 220 }}
                  title="Klik untuk mengurutkan berdasarkan ID/Terbaru"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Sesi Aspirasi (ID)</span>
                    {sortBy === "id" ? (
                      <span className="text-primary font-bold text-xs">{sortDir === "desc" ? "↓" : "↑"}</span>
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>
                <th className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider" style={{ minWidth: 160 }}>Pemohon &amp; Wilayah</th>
                <th className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider" style={{ minWidth: 150 }}>Anggota Dewan</th>
                <th
                  onClick={() => {
                    if (sortBy === "status") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    else { setSortBy("status"); setSortDir("desc"); }
                  }}
                  className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                  style={{ minWidth: 120 }}
                  title="Klik untuk mengurutkan berdasarkan status"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortBy === "status" ? (
                      <span className="text-primary font-bold text-xs">{sortDir === "desc" ? "↓" : "↑"}</span>
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>
                <th className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider" style={{ minWidth: 130 }}>Disposisi OPD</th>
                <th className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider" style={{ minWidth: 140 }}>AI &amp; Rekaman</th>
                <th className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider text-right" style={{ minWidth: 90 }}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedSchedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                      <div className="w-16 h-16 rounded-3xl bg-muted/60 flex items-center justify-center mb-3">
                        <CalendarDays size={32} className="opacity-40 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-bold text-foreground mb-1">Tidak Ada Jadwal Ditemukan</p>
                      <p className="text-xs text-muted-foreground">Coba ubah kata kunci pencarian atau sesuaikan filter Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSchedules.map((s) => {
                  const fu = s.followUp;
                  const progress = fu?.progressPercent || 0;
                  const isDone = progress === 100 || fu?.status === "selesai";
                  const badge = STATUS_BADGE[s.status] || { label: s.status, bg: "bg-muted", text: "text-foreground", border: "border-border" };

                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground leading-snug">{s.title}</div>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                          <Calendar size={12} className="text-primary shrink-0" />
                          {new Date(s.startTime).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">{s.masyarakat?.name || "Masyarakat"}</div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <MapPin size={11} className="text-muted-foreground shrink-0" />
                          {s.masyarakat?.kabupaten || "Jawa Barat"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          {s.participants?.map((p) => (
                            <div key={p.dewanId}>
                              <span className="font-semibold text-foreground">{p.dewan?.name || `Dewan #${p.dewanId}`}</span>
                              {p.dewan?.fraksi && (
                                <span className="text-[10px] text-muted-foreground ml-1 font-medium">({p.dewan.fraksi})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border tracking-wide uppercase ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => onOpenFollowUp(s.id)}
                          className="flex items-center gap-2.5 group text-left"
                        >
                          <div className="w-16 bg-muted/70 rounded-full h-2 overflow-hidden border border-border">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isDone ? "bg-emerald-500" : progress >= 50 ? "bg-indigo-500" : "bg-amber-500"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors tabular-nums">
                            {progress}%
                          </span>
                        </button>
                        {fu?.sharedTo && (
                          <p className="text-[10px] text-muted-foreground truncate max-w-[140px] mt-1 font-medium">
                            {fu.sharedTo}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {s.transcription || s.analysis ? (
                          <button
                            onClick={() => onOpenAnalysis(s.id, s.title)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-all shadow-2xs"
                          >
                            <Sparkles size={13} />
                            Notulensi AI
                          </button>
                        ) : s.recordingUrl ? (
                          <button
                            onClick={() => handleTriggerTranscribe(s.id)}
                            disabled={transcribingId === s.id || s.isTranscribing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 shadow-2xs"
                          >
                            {transcribingId === s.id || s.isTranscribing ? (
                              <><Loader2 size={12} className="animate-spin" /> Memproses...</>
                            ) : (
                              <><FileText size={12} /> Transkrip AI</>
                            )}
                          </button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">Belum ada rekaman</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenFollowUp(s.id)}
                            className="p-2 text-muted-foreground hover:text-purple-600 hover:bg-purple-500/10 rounded-xl transition-all"
                            title="Buka Timeline Disposisi"
                          >
                            <FileCheck2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(s.id)}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Hapus Jadwal"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground bg-card">
            <span className="text-xs font-medium">
              Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredSchedules.length)} dari{" "}
              <strong className="text-foreground">{filteredSchedules.length}</strong> jadwal
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center border border-border rounded-xl hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center border border-border rounded-xl hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                    n === page
                      ? "bg-purple-600 text-white shadow-xs"
                      : "border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-border rounded-xl hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-border rounded-xl hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
