"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  BarChart3,
  PieChart,
  AlertCircle,
  Inbox,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { getBackendUrl } from "@/context/utils";
import { useAuth } from "@/context/AuthContext";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

interface AnalitikData {
  total: number;
  totalSelesai: number;
  totalBulanIni: number;
  rataWaktuSelesaiHari: number;
  byKategori: { kategori: string; jumlah: number }[];
  byStatus: { status: string; jumlah: number }[];
  byDapil: { dapil: string; jumlah: number }[];
  byKabupaten: { kabupaten: string; jumlah: number }[];
  trendBulanan: { bulan: string; jumlah: number }[];
}

interface AspirasiRow {
  id: number;
  ticketNumber: string;
  judul: string;
  kategori: string;
  dapil: string;
  kabupatenKota?: string;
  status: string;
  createdAt: string;
  submittedAt: string;
  completedAt?: string;
  masyarakat?: { name: string; email: string; noWhatsapp?: string };
  dewan?: { name: string; fraksi: string; dapil: string };
}

const STATUS_LABELS: Record<string, string> = {
  diajukan: "Diajukan",
  verifikasi: "Verifikasi",
  diteruskan: "Diteruskan",
  tindak_lanjut: "Tindak Lanjut",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

const STATUS_COLORS: Record<string, string> = {
  diajukan: "#6366F1",
  verifikasi: "#F59E0B",
  diteruskan: "#3B82F6",
  tindak_lanjut: "#8B5CF6",
  selesai: "#10B981",
  ditolak: "#EF4444",
};

const KATEGORI_PALETTE = [
  "#7C3AED","#6D28D9","#5B21B6","#4C1D95",
  "#8B5CF6","#A78BFA","#C4B5FD","#DDD6FE",
  "#EC4899","#F472B6","#FB7185","#FDA4AF",
];

const PAGE_SIZE = 15;

function KPICard({ title, value, subtitle, icon: Icon, colorClass, bg }: {
  title: string; value: string | number; subtitle: string;
  icon: React.ElementType; colorClass: string; bg: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-2xl ${bg} ${colorClass} flex items-center justify-center shrink-0`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide leading-none mb-1 truncate">{title}</p>
        <p className="text-2xl font-black text-foreground tabular-nums leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-1 truncate">{subtitle}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children, className = "" }: {
  title: string; icon: React.ElementType; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-5 shadow-sm ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <Icon size={16} />
        </div>
        <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    diajukan: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    verifikasi: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    diteruskan: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    tindak_lanjut: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    selesai: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    ditolak: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full ${colors[status] || "bg-muted text-muted-foreground"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
};

export default function AdminAspirasiTab() {
  const { token } = useAuth();
  const backendUrl = getBackendUrl();

  const [analitik, setAnalitik] = useState<AnalitikData | null>(null);
  const [loadingAnalitik, setLoadingAnalitik] = useState(true);
  const [analitikError, setAnalitikError] = useState(false);

  const [aspirasiList, setAspirasiList] = useState<AspirasiRow[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterKategori, setFilterKategori] = useState("all");
  const [filterDapil, setFilterDapil] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const fetchAnalitik = useCallback(async () => {
    if (!token) return;
    setLoadingAnalitik(true);
    setAnalitikError(false);
    try {
      const res = await fetch(`${backendUrl}/api/aspirasi/analitik`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAnalitik(await res.json());
      else setAnalitikError(true);
    } catch {
      setAnalitikError(true);
    } finally {
      setLoadingAnalitik(false);
    }
  }, [token, backendUrl]);

  const fetchTable = useCallback(async () => {
    if (!token) return;
    setLoadingTable(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterDapil !== "all") params.set("dapil", filterDapil);
      const res = await fetch(`${backendUrl}/api/aspirasi?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAspirasiList(await res.json());
    } catch { /* skip */ }
    finally { setLoadingTable(false); }
  }, [token, backendUrl, filterStatus, filterDapil]);

  useEffect(() => { fetchAnalitik(); }, [fetchAnalitik]);
  useEffect(() => { fetchTable(); }, [fetchTable]);

  const filteredList = useMemo(() => {
    let list = aspirasiList;
    if (filterKategori !== "all") list = list.filter(a => a.kategori === filterKategori);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.judul.toLowerCase().includes(q) ||
        a.ticketNumber.toLowerCase().includes(q) ||
        a.dapil.toLowerCase().includes(q) ||
        (a.masyarakat?.name?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [aspirasiList, filterKategori, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const paginatedList = useMemo(() => filteredList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredList, currentPage]);
  useEffect(() => { setCurrentPage(1); }, [filterStatus, filterKategori, filterDapil, searchQuery]);

  const dapilOptions = useMemo(() => {
    const set = new Set(aspirasiList.map(a => a.dapil?.split("(")[0]?.trim() || "").filter(Boolean));
    return Array.from(set).sort();
  }, [aspirasiList]);

  const kategoriOptions = useMemo(() => {
    const set = new Set(aspirasiList.map(a => a.kategori).filter(Boolean));
    return Array.from(set).sort();
  }, [aspirasiList]);

  const handleExport = async () => {
    if (!token || exporting) return;
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterKategori !== "all") params.set("kategori", filterKategori);
      if (filterDapil !== "all") params.set("dapil", filterDapil);
      const res = await fetch(`${backendUrl}/api/aspirasi/export-excel?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Rekap_EAspirasi_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert("Gagal mengekspor data Excel.");
      }
    } catch {
      alert("Terjadi kesalahan saat mengekspor.");
    } finally {
      setExporting(false);
    }
  };

  const donutData = useMemo(() => {
    if (!analitik?.byKategori?.length) return null;
    return {
      labels: analitik.byKategori.map(k => k.kategori),
      datasets: [{ data: analitik.byKategori.map(k => k.jumlah), backgroundColor: KATEGORI_PALETTE.slice(0, analitik.byKategori.length), borderWidth: 0, hoverOffset: 8 }],
    };
  }, [analitik]);

  const barStatusData = useMemo(() => {
    if (!analitik?.byStatus?.length) return null;
    return {
      labels: analitik.byStatus.map(s => STATUS_LABELS[s.status] || s.status),
      datasets: [{ label: "Jumlah", data: analitik.byStatus.map(s => s.jumlah), backgroundColor: analitik.byStatus.map(s => STATUS_COLORS[s.status] || "#8B5CF6"), borderRadius: 8, borderWidth: 0 }],
    };
  }, [analitik]);

  const barDapilData = useMemo(() => {
    if (!analitik?.byDapil?.length) return null;
    return {
      labels: analitik.byDapil.map(d => d.dapil),
      datasets: [{ label: "Jumlah", data: analitik.byDapil.map(d => d.jumlah), backgroundColor: "rgba(109,40,217,0.82)", borderRadius: 6, borderWidth: 0, hoverBackgroundColor: "rgba(109,40,217,1)" }],
    };
  }, [analitik]);

  const lineData = useMemo(() => {
    if (!analitik?.trendBulanan?.length) return null;
    return {
      labels: analitik.trendBulanan.map(t => t.bulan),
      datasets: [{ label: "Aspirasi Masuk", data: analitik.trendBulanan.map(t => t.jumlah), borderColor: "#7C3AED", backgroundColor: "rgba(124,58,237,0.12)", tension: 0.4, fill: true, pointBackgroundColor: "#7C3AED", pointRadius: 4, pointHoverRadius: 6, borderWidth: 2.5 }],
    };
  }, [analitik]);

  const baseOpts = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "rgba(15,10,30,0.92)", titleFont: { size: 12, weight: "bold" as const }, bodyFont: { size: 12 }, padding: 10, cornerRadius: 8 } },
  };
  const scaleOpts = {
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#9CA3AF" } },
    y: { grid: { color: "rgba(156,163,175,0.1)" }, ticks: { font: { size: 11 }, color: "#9CA3AF", stepSize: 1 }, beginAtZero: true },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight">Analitik & Rekap E-Aspirasi</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Rekap topik, kategori, dan distribusi aspirasi masyarakat Jawa Barat</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { fetchAnalitik(); fetchTable(); }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border bg-card/90 hover:bg-muted text-muted-foreground flex items-center gap-1.5 transition-all shadow-xs active:scale-95">
            <RefreshCw size={13} className={loadingAnalitik ? "animate-spin" : ""} />
            <span>Segarkan</span>
          </button>
          <button onClick={handleExport} disabled={exporting || loadingTable} id="btn-export-aspirasi-excel"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-60">
            <Download size={13} />
            {exporting ? "Mengunduh..." : "Download Excel"}
          </button>
        </div>
      </div>

      {/* KPI */}
      {loadingAnalitik ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-card border border-border rounded-2xl p-5 h-24 animate-pulse" />)}
        </div>
      ) : analitikError ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={16} /> Gagal memuat data analitik.
        </div>
      ) : analitik ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Aspirasi Masuk" value={analitik.total.toLocaleString("id-ID")} subtitle="Semua status" icon={MessageSquare} colorClass="text-purple-600 dark:text-purple-400" bg="bg-purple-500/10" />
          <KPICard title="Aspirasi Selesai" value={`${analitik.totalSelesai} (${analitik.total > 0 ? Math.round((analitik.totalSelesai / analitik.total) * 100) : 0}%)`} subtitle="Telah ditindaklanjuti" icon={CheckCircle2} colorClass="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-500/10" />
          <KPICard title="Aspirasi Bulan Ini" value={analitik.totalBulanIni.toLocaleString("id-ID")} subtitle={new Date().toLocaleString("id-ID", { month: "long", year: "numeric" })} icon={Calendar} colorClass="text-blue-600 dark:text-blue-400" bg="bg-blue-500/10" />
          <KPICard title="Rata-rata Penyelesaian" value={`${analitik.rataWaktuSelesaiHari} Hari`} subtitle="Dari pengajuan hingga selesai" icon={Clock} colorClass="text-amber-600 dark:text-amber-400" bg="bg-amber-500/10" />
        </div>
      ) : null}

      {/* Row 1 Charts */}
      {analitik && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Distribusi per Kategori / Topik" icon={PieChart}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-44 h-44 shrink-0 mx-auto md:mx-0">
                {donutData && <Doughnut data={donutData} options={{ ...baseOpts, cutout: "68%", plugins: { ...baseOpts.plugins, legend: { display: false } } }} />}
              </div>
              <div className="flex-1 space-y-2 w-full">
                {analitik.byKategori.map((item, i) => (
                  <div key={item.kategori} className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: KATEGORI_PALETTE[i % KATEGORI_PALETTE.length] }} />
                    <span className="text-xs text-muted-foreground flex-1 truncate">{item.kategori}</span>
                    <span className="text-xs font-bold text-foreground tabular-nums">{item.jumlah}</span>
                    <span className="text-[10px] text-muted-foreground w-10 text-right">
                      {analitik.total > 0 ? `${Math.round((item.jumlah / analitik.total) * 100)}%` : "0%"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Distribusi per Status Aspirasi" icon={BarChart3}>
            {barStatusData && <Bar data={barStatusData} options={{ ...baseOpts, aspectRatio: 1.8, plugins: { ...baseOpts.plugins, legend: { display: false } }, scales: scaleOpts }} />}
            <div className="flex flex-wrap gap-2 mt-3">
              {analitik.byStatus.map(s => (
                <span key={s.status} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS[s.status] || "#8B5CF6" }} />
                  {STATUS_LABELS[s.status] || s.status}: <b className="text-foreground">{s.jumlah}</b>
                </span>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* Row 2 Charts */}
      {analitik && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <ChartCard title="Tren Aspirasi Masuk (12 Bulan Terakhir)" icon={TrendingUp} className="lg:col-span-3">
            {lineData && (
              <Line data={lineData} options={{ ...baseOpts, aspectRatio: 2.2, plugins: { ...baseOpts.plugins, legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#9CA3AF", maxRotation: 45 } }, y: { grid: { color: "rgba(156,163,175,0.1)" }, ticks: { font: { size: 10 }, color: "#9CA3AF", stepSize: 1 }, beginAtZero: true } } }} />
            )}
          </ChartCard>

          <ChartCard title="Top Daerah Pemilihan" icon={BarChart3} className="lg:col-span-2">
            {barDapilData && (
              <Bar data={barDapilData} options={{ ...baseOpts, indexAxis: "y" as const, aspectRatio: 1.1, plugins: { ...baseOpts.plugins, legend: { display: false } }, scales: { x: { grid: { color: "rgba(156,163,175,0.1)" }, ticks: { font: { size: 10 }, color: "#9CA3AF" }, beginAtZero: true }, y: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#9CA3AF" } } } }} />
            )}
          </ChartCard>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">Data Detail Aspirasi</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{filteredList.length} aspirasi ditemukan</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Cari judul, tiket, nama..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 w-48" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40">
              <option value="all">Semua Status</option>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40">
              <option value="all">Semua Kategori</option>
              {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <select value={filterDapil} onChange={e => setFilterDapil(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40">
              <option value="all">Semua Dapil</option>
              {dapilOptions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button onClick={handleExport} disabled={exporting}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 transition-all disabled:opacity-50">
              <Download size={12} />{exporting ? "..." : "Excel"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingTable ? (
            <div className="p-12 flex flex-col items-center gap-3 text-muted-foreground">
              <RefreshCw size={22} className="animate-spin" />
              <p className="text-sm">Memuat data aspirasi...</p>
            </div>
          ) : paginatedList.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-3 text-muted-foreground">
              <Inbox size={32} strokeWidth={1.2} />
              <p className="text-sm">Tidak ada data aspirasi ditemukan</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  {["#","No. Tiket","Judul Aspirasi","Kategori","Dapil","Status","Pemohon","Tanggal"].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedList.map((a, i) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-purple-600 dark:text-purple-400 font-bold whitespace-nowrap">{a.ticketNumber}</td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-[260px]"><span className="line-clamp-2">{a.judul}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-medium">{a.kategori || "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[140px] truncate">{a.dapil?.split("(")[0]?.trim() || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{a.masyarakat?.name || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap tabular-nums">
                      {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Halaman {currentPage} dari {totalPages} ({filteredList.length} total)</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                let page = idx + 1;
                if (totalPages > 5 && currentPage > 3) page = currentPage - 2 + idx;
                if (page > totalPages || page < 1) return null;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${currentPage === page ? "bg-purple-600 text-white" : "border border-border hover:bg-muted text-muted-foreground"}`}>
                    {page}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
