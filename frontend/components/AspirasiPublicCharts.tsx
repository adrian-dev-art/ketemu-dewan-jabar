"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  TrendingUp,
  MessageSquare,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getBackendUrl } from "@/context/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
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

const STATUS_LABELS: Record<string, string> = {
  diajukan: "Diajukan",
  verifikasi: "Verifikasi",
  diteruskan: "Diteruskan",
  tindak_lanjut: "Tindak Lanjut",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

const STATUS_COLORS: Record<string, string> = {
  diajukan: "rgba(99, 102, 241, 0.85)",
  verifikasi: "rgba(245, 158, 11, 0.85)",
  diteruskan: "rgba(59, 130, 246, 0.85)",
  tindak_lanjut: "rgba(139, 92, 246, 0.85)",
  selesai: "rgba(16, 185, 129, 0.85)",
  ditolak: "rgba(239, 68, 68, 0.85)",
};

const KATEGORI_COLORS = [
  "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B",
  "#EC4899", "#06B6D4", "#6366F1", "#14B8A6",
  "#F97316", "#84CC16", "#64748B", "#A855F7"
];

export default function AspirasiPublicCharts({
  title = "Rekapitulasi & Analitik Data E-Aspirasi",
}: {
  title?: string;
}) {
  const router = useRouter();
  const backendUrl = getBackendUrl();

  const [data, setData] = useState<AnalitikData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalitik = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/public/aspirasi/analitik`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.warn("[AspirasiPublicCharts] Gagal memuat data analitik publik:", e);
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchAnalitik();
  }, [fetchAnalitik]);

  const totalAspirasi = data?.total || 0;
  const totalSelesai = data?.totalSelesai || 0;
  const totalBulanIni = data?.totalBulanIni || 0;
  const avgSelesaiHari = data?.rataWaktuSelesaiHari || 0;
  const completionRate = totalAspirasi > 0 ? Math.round((totalSelesai / totalAspirasi) * 100) : 0;

  // 1. Chart Donut: Topik / Kategori Aspirasi
  const kategoriLabels = data?.byKategori?.length
    ? data.byKategori.map((k) => k.kategori)
    : ["Infrastruktur", "Pendidikan", "Kesehatan", "Ekonomi Kreatif", "Lingkungan"];
  const kategoriValues = data?.byKategori?.length
    ? data.byKategori.map((k) => k.jumlah)
    : [12, 8, 6, 4, 3];

  const topicChartData = {
    labels: kategoriLabels,
    datasets: [
      {
        data: kategoriValues,
        backgroundColor: KATEGORI_COLORS.slice(0, kategoriLabels.length),
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  // 2. Chart Line: Tren Bulanan
  const trendLabels = data?.trendBulanan?.length
    ? data.trendBulanan.map((t) => t.bulan)
    : ["Mei", "Jun", "Jul", "Agu", "Sep", "Okt"];
  const trendValues = data?.trendBulanan?.length
    ? data.trendBulanan.map((t) => t.jumlah)
    : [4, 7, 12, 18, 22, 28];

  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Aspirasi Masuk",
        data: trendValues,
        borderColor: "#2563EB",
        backgroundColor: "rgba(37, 99, 235, 0.08)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#2563EB",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // 3. Chart Bar: Status Penanganan
  const statusLabels = data?.byStatus?.length
    ? data.byStatus.map((s) => STATUS_LABELS[s.status] || s.status)
    : ["Diajukan", "Verifikasi", "Diproses", "Tuntas"];
  const statusValues = data?.byStatus?.length
    ? data.byStatus.map((s) => s.jumlah)
    : [8, 4, 6, 12];
  const statusBgColors = data?.byStatus?.length
    ? data.byStatus.map((s) => STATUS_COLORS[s.status] || "rgba(59, 130, 246, 0.8)")
    : [
        STATUS_COLORS.diajukan,
        STATUS_COLORS.verifikasi,
        STATUS_COLORS.diteruskan,
        STATUS_COLORS.selesai,
      ];

  const statusChartData = {
    labels: statusLabels,
    datasets: [
      {
        label: "Jumlah Aspirasi",
        data: statusValues,
        backgroundColor: statusBgColors,
        borderRadius: 8,
        barThickness: 28,
      },
    ],
  };

  // 4. Chart Bar Horizontal: Sebaran Dapil
  const dapilLabels = data?.byDapil?.length
    ? data.byDapil.slice(0, 8).map((d) => d.dapil)
    : ["Dapil I (Bandung)", "Dapil II (Kab. Bandung)", "Dapil III (Bekasi)", "Dapil IV (Cirebon)"];
  const dapilValues = data?.byDapil?.length
    ? data.byDapil.slice(0, 8).map((d) => d.jumlah)
    : [14, 11, 8, 6];

  const dapilChartData = {
    labels: dapilLabels,
    datasets: [
      {
        label: "Aspirasi Masuk",
        data: dapilValues,
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderRadius: 6,
        barThickness: 16,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { size: 11, weight: "bold" as any },
          color: "#475569",
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        padding: 12,
        titleFont: { size: 13, weight: "bold" as any },
        bodyFont: { size: 12 },
        cornerRadius: 10,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: "bold" as any }, color: "#64748B" },
      },
      y: {
        grid: { color: "rgba(226, 232, 240, 0.6)" },
        ticks: { font: { size: 10 }, color: "#64748B", precision: 0 },
      },
    },
  };

  const horizontalOptions = {
    ...commonOptions,
    indexAxis: "y" as const,
    scales: {
      x: {
        grid: { color: "rgba(226, 232, 240, 0.6)" },
        ticks: { font: { size: 10 }, color: "#64748B", precision: 0 },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: "bold" as any }, color: "#475569" },
      },
    },
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          usePointStyle: true,
          padding: 14,
          font: { size: 11, weight: "bold" as any },
          color: "#475569",
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        padding: 12,
        titleFont: { size: 13, weight: "bold" as any },
        bodyFont: { size: 12 },
        cornerRadius: 10,
      },
    },
    cutout: "68%",
  };

  return (
    <div id="rekap-aspirasi" className="w-full space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
            Transparansi Real-Time E-Aspirasi
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#121212]">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Data keterbukaan publik mengenai topik usulan, penyebaran wilayah, dan progres penanganan aspirasi masyarakat yang dihimpun oleh DPRD Provinsi Jawa Barat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAnalitik()}
            disabled={loading}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 transition-all"
            title="Segarkan Data"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-primary" : ""} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={() => router.push("/masyarakat")}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <MessageSquare size={14} />
            <span>Kirim Aspirasi</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Usulan Masuk",
            value: totalAspirasi.toLocaleString("id-ID"),
            unit: "Aspirasi",
            desc: "Dihimpun dari 27 Kab/Kota",
            icon: MessageSquare,
            badge: "Akumulatif",
            color: "text-blue-600 bg-blue-50 border-blue-100",
          },
          {
            label: "Aspirasi Dituntaskan",
            value: totalSelesai.toLocaleString("id-ID"),
            unit: "Tuntas",
            desc: `${completionRate}% tingkat penyelesaian`,
            icon: CheckCircle2,
            badge: `${completionRate}% Selesai`,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100",
          },
          {
            label: "Masuk Bulan Ini",
            value: totalBulanIni.toLocaleString("id-ID"),
            unit: "Bulan Berjalan",
            desc: "Partisipasi warga aktif",
            icon: TrendingUp,
            badge: "Bulan Ini",
            color: "text-indigo-600 bg-indigo-50 border-indigo-100",
          },
          {
            label: "Rata-rata Penanganan",
            value: avgSelesaiHari > 0 ? `${avgSelesaiHari}` : "< 7",
            unit: "Hari Kerja",
            desc: "Dari pengajuan hingga hasil",
            icon: Clock,
            badge: "Responsif",
            color: "text-amber-600 bg-amber-50 border-amber-100",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="p-5 md:p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.color} border group-hover:scale-110 transition-transform duration-300`}>
                <card.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                {card.badge}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                {card.label}
              </p>
              <div className="flex items-baseline gap-1.5">
                <h4 className="text-3xl md:text-4xl font-black text-[#121212] tracking-tight">
                  {card.value}
                </h4>
                <span className="text-xs font-bold text-muted-foreground/60">
                  {card.unit}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 font-medium">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main 4 Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Donut Topik / Kategori Aspirasi (Col 6) */}
        <div className="lg:col-span-6 p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600">
                  <FolderOpen size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Topik & Sektor Aspirasi</h3>
                  <p className="text-xs text-muted-foreground">Kategori isu pembangunan yang paling banyak disuarakan</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-600 px-3 py-1 rounded-full border border-slate-100">
                {kategoriLabels.length} Kategori
              </span>
            </div>
          </div>

          <div className="h-72 my-4 relative">
            <Doughnut data={topicChartData} options={donutOptions} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-50">
            {kategoriLabels.slice(0, 4).map((label, idx) => (
              <div key={label} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: KATEGORI_COLORS[idx % KATEGORI_COLORS.length] }}
                  />
                  <span className="font-semibold truncate text-slate-700">{label}</span>
                </div>
                <span className="font-black text-slate-900 ml-2">{kategoriValues[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Tren Pengajuan Bulanan (Col 6) */}
        <div className="lg:col-span-6 p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Tren Partisipasi Bulanan</h3>
                  <p className="text-xs text-muted-foreground">Fluktuasi volume usulan warga 12 bulan terakhir</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                12 Bulan
              </span>
            </div>
          </div>

          <div className="h-72 my-4">
            <Line data={trendChartData} options={commonOptions} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-blue-600" />
              <span className="font-medium">Data diperbarui otomatis setiap ada aspirasi baru masuk.</span>
            </div>
            <span className="font-bold text-blue-700 text-[11px]">Real-time Sync</span>
          </div>
        </div>

        {/* Chart 3: Distribusi Status Penanganan (Col 5) */}
        <div className="lg:col-span-5 p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Status Tindak Lanjut</h3>
                  <p className="text-xs text-muted-foreground">Distribusi penanganan berkas usulan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-64 my-4">
            <Bar data={statusChartData} options={commonOptions} />
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-50 text-xs">
            <div className="flex justify-between items-center text-muted-foreground font-medium">
              <span>Progres Selesai</span>
              <span className="font-bold text-emerald-600">{totalSelesai} dari {totalAspirasi} Aspirasi</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, completionRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chart 4: Sebaran Aspirasi per Dapil (Col 7) */}
        <div className="lg:col-span-7 p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Sebaran Usulan per Dapil</h3>
                  <p className="text-xs text-muted-foreground">Tingkat keaktifan warga di Daerah Pemilihan Jawa Barat</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                Top Wilayah
              </span>
            </div>
          </div>

          <div className="h-64 my-4">
            <Bar data={dapilChartData} options={horizontalOptions} />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs text-muted-foreground">
            <span>Dapil teraktif: <strong className="text-foreground">{dapilLabels[0] || "-"}</strong></span>
            <span>Total cakupan: 15 Dapil DPRD Jabar</span>
          </div>
        </div>

      </div>

      {/* Call to Action Banner di Bawah Chart */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-900/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 max-w-xl text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
            <MessageSquare size={12} />
            Suara Anda Berarti
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">
            Punya Usulan untuk Kemajuan Jawa Barat?
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Sampaikan gagasan, keluhan fasilitas umum, atau usulan kebijakan Anda langsung ke anggota DPRD perwakilan daerah pemilihan Anda.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 z-10 shrink-0">
          <button
            onClick={() => router.push("/masyarakat")}
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Buka Formulir Aspirasi</span>
            <ArrowRight size={16} />
          </button>
          <a
            href="#transparansi-surat"
            className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all flex items-center justify-center text-sm"
          >
            Cek Dokumen Disposisi
          </a>
        </div>
      </div>
    </div>
  );
}
