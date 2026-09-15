"use client";

import React from "react";
import {
  Users,
  Video,
  Star,
  FileCheck2,
  Share2,
  Eye,
  CheckCircle2,
  Clock,
  Settings,
  ArrowRight,
  TrendingUp,
  Activity,
  Download,
} from "lucide-react";
import AdminStatsCard from "./AdminStatsCard";
import DashboardCharts from "@/components/DashboardCharts";
import { useRouter } from "next/navigation";

interface AdminOverviewTabProps {
  stats: {
    totalUsers: number;
    totalMeetings: number;
    avgRating: number;
    totalRatings: number;
  };
  followUpStats: {
    totalDisposed: number;
    completed: number;
    inProgress: number;
    viewed: number;
    notDisposed: number;
  };
  ratings: any[];
  setActiveTab: (tab: "overview" | "ratings" | "users" | "schedules") => void;
  onExportBackup?: () => void;
}

export default function AdminOverviewTab({
  stats,
  followUpStats,
  ratings,
  setActiveTab,
  onExportBackup,
}: AdminOverviewTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total Pengguna Terdaftar"
          value={stats.totalUsers}
          subtitle="Warga, Legislator, & Admin"
          icon={Users}
          colorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          accentVariant="blue"
        />
        <AdminStatsCard
          title="Total Sesi Pertemuan"
          value={stats.totalMeetings}
          subtitle="Aspirasi Masyarakat Jabar"
          icon={Video}
          colorClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          accentVariant="indigo"
        />
        <AdminStatsCard
          title="Rata-rata Kepuasan"
          value={`${stats.avgRating} / 5.0`}
          subtitle={`${stats.totalRatings} ulasan masyarakat`}
          icon={Star}
          colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          accentVariant="amber"
        />
        <AdminStatsCard
          title="Disposisi Resmi Aktif"
          value={followUpStats.totalDisposed}
          subtitle={`${followUpStats.completed} tuntas dilaksanakan`}
          icon={FileCheck2}
          colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          accentVariant="emerald"
        />
      </div>

      {/* Follow-Up Progress Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Activity size={17} />
              </div>
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                Progres 4 Tahap Tindak Lanjut &amp; Disposisi OPD
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 pl-10.5">
              Pemantauan realisasi telaahan dinas dan serah terima berita acara hasil aspirasi
            </p>
          </div>
          <button
            onClick={() => setActiveTab("schedules")}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0"
          >
            Lihat Tabel Lengkap <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            { label: "1. Surat Disposisi", value: followUpStats.totalDisposed, icon: Share2, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
            { label: "2. Dibaca OPD", value: followUpStats.viewed, icon: Eye, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "3. Telaahan Teknis", value: followUpStats.inProgress, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
            { label: "4. Laporan Tuntas", value: followUpStats.completed, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
          ].map((step, i) => (
            <div
              key={i}
              className="bg-muted/30 border border-border/80 rounded-2xl p-4 flex items-center gap-3.5 hover:bg-muted/60 transition-colors shadow-2xs"
            >
              <div className={`w-10 h-10 rounded-xl ${step.bg} ${step.color} flex items-center justify-center shrink-0`}>
                <step.icon size={18} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground leading-snug">{step.label}</p>
                <p className="text-xl font-bold text-foreground tabular-nums">{step.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts */}
      {ratings.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp size={17} />
            </div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Distribusi Evaluasi &amp; Kepuasan Layanan Dewan
            </h3>
          </div>
          <DashboardCharts />
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          id="admin-overview-schedules-btn"
          onClick={() => setActiveTab("schedules")}
          className="group p-5 bg-card hover:bg-muted/40 border border-border hover:border-primary/40 rounded-2xl text-left transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Video size={20} />
          </div>
          <p className="text-sm font-bold text-foreground">Kelola Jadwal Sesi</p>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            Monitoring rapat video call dan disposisi aspirasi
          </p>
        </button>

        <button
          id="admin-overview-streaming-btn"
          onClick={() => router.push("/admin/settings/streaming")}
          className="group p-5 bg-card hover:bg-muted/40 border border-border hover:border-purple-500/40 rounded-2xl text-left transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Settings size={20} />
          </div>
          <p className="text-sm font-bold text-foreground">Pengaturan Live Streaming</p>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            Kelola konfigurasi Egress RTMP dan server siaran
          </p>
        </button>

        <button
          id="admin-overview-export-btn"
          onClick={() => { if (onExportBackup) onExportBackup(); }}
          className="group p-5 bg-card hover:bg-muted/40 border border-border hover:border-emerald-500/40 rounded-2xl text-left transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Download size={20} />
          </div>
          <p className="text-sm font-bold text-foreground">Ekspor Cadangan Sistem</p>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            Unduh rekapitulasi data format JSON resmi
          </p>
        </button>
      </div>
    </div>
  );
}
