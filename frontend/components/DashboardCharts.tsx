"use client";

import React from 'react';
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
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Users, MessageSquare, MapPin, Award, Activity } from 'lucide-react';

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

export default function DashboardCharts({ title = "Rekapitulasi Aktivitas & Kinerja" }: { title?: string }) {
  const topicData = {
    labels: ['Pendidikan', 'Kesehatan', 'Infrastruktur', 'Ekonomi Kreatif', 'Lingkungan Hidup'],
    datasets: [{
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        'rgba(16, 185, 129, 0.85)', 
        'rgba(59, 130, 246, 0.85)', 
        'rgba(239, 68, 68, 0.85)', 
        'rgba(245, 158, 11, 0.85)', 
        'rgba(139, 92, 246, 0.85)'
      ],
      borderColor: 'transparent',
      borderWidth: 0,
    }]
  };

  const komisiData = {
    labels: ['Komisi I', 'Komisi II', 'Komisi III', 'Komisi IV', 'Komisi V'],
    datasets: [{
      label: 'Jumlah Sesi',
      data: [42, 38, 35, 29, 24],
      backgroundColor: 'rgba(59, 130, 246, 0.85)',
      borderRadius: 10,
    }]
  };

  const dapilData = {
    labels: ['Dapil 1 (Bandung-Cimahi)', 'Dapil 2 (Kab. Bandung)', 'Dapil 3 (Bogor)', 'Dapil 4 (Sukabumi)', 'Dapil 5 (Garut)'],
    datasets: [{
      label: 'Partisipasi Warga',
      data: [120, 95, 88, 76, 64],
      backgroundColor: 'rgba(16, 185, 129, 0.85)',
      borderRadius: 10,
    }]
  };

  const anggotaData = {
    labels: ['Dr. H. Ineu Purwadewi', 'H. Ono Surono, S.T.', 'H. Achmad Ru\'yat', 'H. Haru Suandharu', 'H. Bedi Budiman'],
    datasets: [{
      label: 'Sesi Terfasilitasi',
      data: [15, 12, 10, 8, 7],
      backgroundColor: 'rgba(244, 63, 94, 0.85)',
      borderRadius: 8,
    }]
  };

  const activityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [{
      label: 'Total Sesi Audiensi',
      data: [45, 52, 68, 85, 110, 145],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: '#3b82f6',
    }]
  };

  const organisasiData = {
    labels: ['Paguyuban Pasundan', 'Karang Taruna Jabar', 'LSM Lingkungan Jabar', 'KNPI Jawa Barat', 'HMI Bandung Raya'],
    datasets: [{
      label: 'Partisipasi Sesi',
      data: [85, 72, 65, 48, 36],
      backgroundColor: 'rgba(245, 158, 11, 0.85)',
      borderRadius: 8,
    }]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 11 },
        cornerRadius: 12,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: 'bold' as const }, color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { font: { size: 10 }, color: '#94a3b8' }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 14,
          font: { size: 10, weight: 'bold' as const },
          color: '#94a3b8'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 12,
      }
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* ── Section Title Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-outfit">{title}</h2>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Data
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Data analitik konsolidasi audiensi, e-aspirasi, dan tingkat responsivitas 120 Anggota DPRD Jabar
          </p>
        </div>
      </div>

      {/* ── 4 Metrik Utama Modern Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[
          { 
            label: 'Total Aspirasi Warga', 
            value: '1.284', 
            grow: '+12.5%', 
            icon: MessageSquare, 
            gradient: 'from-blue-500/15 via-blue-500/5 to-transparent',
            iconColor: 'text-blue-500 bg-blue-500/15 border-blue-500/25'
          },
          { 
            label: 'Sesi Selesai', 
            value: '42', 
            grow: '+8.2%', 
            icon: TrendingUp, 
            gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
            iconColor: 'text-emerald-500 bg-emerald-500/15 border-emerald-500/25'
          },
          { 
            label: 'Indeks Kepuasan', 
            value: '98.2%', 
            grow: '+2.4%', 
            icon: Award, 
            gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
            iconColor: 'text-amber-500 bg-amber-500/15 border-amber-500/25'
          },
          { 
            label: 'Masyarakat Terlibat', 
            value: '10.4k', 
            grow: '+15.7%', 
            icon: Users, 
            gradient: 'from-purple-500/15 via-purple-500/5 to-transparent',
            iconColor: 'text-purple-500 bg-purple-500/15 border-purple-500/25'
          },
        ].map((card, i) => (
          <div 
            key={i} 
            className={`relative p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden bg-gradient-to-br ${card.gradient}`}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border ${card.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-xs`}>
                <card.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 sm:px-2 py-0.5 rounded-full">
                {card.grow}
              </span>
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-0.5 truncate">{card.label}</p>
              <div className="flex items-baseline gap-1.5">
                <h4 className="text-xl sm:text-3xl font-black text-foreground tracking-tight font-outfit">{card.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Grid Visual Chart Modern Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Topik Populer */}
        <div className="p-4 sm:p-6 bg-card rounded-2xl sm:rounded-3xl border border-border/80 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 border-b border-border/50 pb-3">
            <div className="p-1.5 sm:p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-foreground">Topik Populer</h3>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Kategori isu paling sering diusulkan</p>
            </div>
          </div>
          <div className="h-52 sm:h-60 relative">
            <Doughnut data={topicData} options={pieOptions} />
          </div>
        </div>

        {/* Tren Aktivitas Bulanan */}
        <div className="p-4 sm:p-6 bg-card rounded-2xl sm:rounded-3xl border border-border/80 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 sm:mb-5 border-b border-border/50 pb-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/20">
                <Activity size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-foreground">Tren Pertemuan &amp; Audiensi</h3>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">Volume sesi aspirasi digital 6 bulan terakhir</p>
              </div>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              Meningkat 28%
            </span>
          </div>
          <div className="h-52 sm:h-60">
            <Line data={activityData} options={commonOptions} />
          </div>
        </div>

        {/* Ranking Komisi */}
        <div className="p-4 sm:p-6 bg-card rounded-2xl sm:rounded-3xl border border-border/80 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 border-b border-border/50 pb-3">
            <div className="p-1.5 sm:p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20">
              <Award size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-foreground">Aktivitas Komisi</h3>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Distribusi sesi menurut komisi</p>
            </div>
          </div>
          <div className="h-48 sm:h-56">
            <Bar data={komisiData} options={commonOptions} />
          </div>
        </div>

        {/* Ranking Dapil */}
        <div className="p-4 sm:p-6 bg-card rounded-2xl sm:rounded-3xl border border-border/80 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 border-b border-border/50 pb-3">
            <div className="p-1.5 sm:p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl border border-teal-500/20">
              <MapPin size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-foreground">Dapil Teraktif</h3>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Tingkat partisipasi warga per dapil</p>
            </div>
          </div>
          <div className="h-48 sm:h-56">
            <Bar data={dapilData} options={commonOptions} />
          </div>
        </div>

        {/* Ranking Anggota */}
        <div className="p-4 sm:p-6 bg-card rounded-2xl sm:rounded-3xl border border-border/80 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 border-b border-border/50 pb-3">
            <div className="p-1.5 sm:p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
              <Users size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-foreground">Legislator Teraktif</h3>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Anggota dengan responsivitas tertinggi</p>
            </div>
          </div>
          <div className="h-48 sm:h-56">
            <Bar 
              data={anggotaData} 
              options={{
                ...commonOptions,
                indexAxis: 'y' as const,
              }} 
            />
          </div>
        </div>

        {/* Ranking Organisasi Warga */}
        <div className="p-4 sm:p-6 bg-card rounded-2xl sm:rounded-3xl border border-border/80 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 lg:col-span-3">
          <div className="flex items-center justify-between mb-4 sm:mb-5 border-b border-border/50 pb-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20">
                <Users size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-foreground">Partisipasi Organisasi &amp; Komunitas Warga</h3>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">Kelompok masyarakat dan lembaga konstituen terdaftar</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
            <div className="h-52">
              <Bar 
                data={organisasiData} 
                options={{
                  ...commonOptions,
                  indexAxis: 'y' as const,
                }} 
              />
            </div>
            <div className="space-y-2.5 bg-muted/30 p-4 rounded-2xl border border-border/50">
              {organisasiData.labels.map((label, i) => (
                <div key={label} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
                  <span className="font-semibold text-foreground/90">{i + 1}. {label}</span>
                  <span className="font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                    {organisasiData.datasets[0].data[i]} Sesi
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
