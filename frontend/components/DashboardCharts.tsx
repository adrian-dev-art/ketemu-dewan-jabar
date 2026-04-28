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
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Users, MessageSquare, MapPin, Award } from 'lucide-react';

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

export default function DashboardCharts({ title = "Rekapitulasi Aktivitas" }: { title?: string }) {
  // Dummy Data
  const topicData = {
    labels: ['Pendidikan', 'Kesehatan', 'Infrastruktur', 'Ekonomi Kreatif', 'Lingkungan'],
    datasets: [{
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)', 
        'rgba(59, 130, 246, 0.8)', 
        'rgba(99, 102, 241, 0.8)', 
        'rgba(245, 158, 11, 0.8)', 
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: '#fff',
      borderWidth: 2,
    }]
  };

  const komisiData = {
    labels: ['Komisi I', 'Komisi II', 'Komisi III', 'Komisi IV', 'Komisi V'],
    datasets: [{
      label: 'Jumlah Sesi',
      data: [42, 38, 35, 29, 24],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 8,
    }]
  };

  const dapilData = {
    labels: ['Dapil 1', 'Dapil 2', 'Dapil 3', 'Dapil 4', 'Dapil 5'],
    datasets: [{
      label: 'Partisipasi Warga',
      data: [120, 95, 88, 76, 64],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderRadius: 8,
    }]
  };

  const anggotaData = {
    labels: ['Asep S.', 'Siti A.', 'Ridwan K.', 'Budi G.', 'Santi S.'],
    datasets: [{
      label: 'Sesi Selesai',
      data: [15, 12, 10, 8, 7],
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 8,
    }]
  };

  const activityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [{
      label: 'Total Sesi',
      data: [45, 52, 68, 85, 110, 145],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6',
    }]
  };

  const organisasiData = {
    labels: ['LSM Merdeka', 'Karang Taruna', 'Paguyuban Pasundan', 'KNPI Jabar', 'HMI Bandung'],
    datasets: [{
      label: 'Partisipasi Sesi',
      data: [85, 72, 65, 48, 36],
      backgroundColor: 'rgba(245, 158, 11, 0.8)',
      borderRadius: 8,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 11,
            weight: 'bold' as any,
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' as any },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: 'bold' as any } }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 10 } }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 10, weight: 'bold' as any }
        }
      }
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#121212]">{title}</h2>
          <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest">Analisis Data Real-time (Dummy)</p>
        </div>
        <div className="flex gap-2">
           <div className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             Live Data
           </div>
        </div>
      </div>

      {/* Analytic Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Aspirasi', value: '1,284', grow: '+12.5%', icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
          { label: 'Sesi Aktif', value: '42', grow: '+8.2%', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
          { label: 'Tingkat Kepuasan', value: '98.2%', grow: '+2.4%', icon: Award, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Warga Terlibat', value: '10.4k', grow: '+15.7%', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
        ].map((card, i) => (
          <div key={i} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
             <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                   <card.icon size={20} />
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full animate-pulse">
                      {card.grow}
                   </span>
                </div>
             </div>
             <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-1">{card.label}</p>
                <div className="flex items-baseline gap-1">
                   <h4 className="text-3xl font-black text-[#121212] tracking-tighter">{card.value}</h4>
                   <span className="text-[10px] font-bold text-muted-foreground/40 italic">Unit</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Keywords / Topics */}
        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <MessageSquare size={18} />
            </div>
            <h3 className="font-bold text-sm">Topik Populer</h3>
          </div>
          <div className="h-64 relative">
            <Doughnut data={topicData} options={pieOptions} />
          </div>
        </div>

        {/* Activity Trend */}
        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
              <TrendingUp size={18} />
            </div>
            <h3 className="font-bold text-sm">Tren Aktivitas</h3>
          </div>
          <div className="h-64">
            <Line data={activityData} options={options} />
          </div>
        </div>

        {/* Ranking Komisi */}
        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <Award size={18} />
            </div>
            <h3 className="font-bold text-sm">Ranking Komisi Aktif</h3>
          </div>
          <div className="h-64">
            <Bar data={komisiData} options={options} />
          </div>
        </div>

        {/* Ranking Dapil */}
        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <MapPin size={18} />
            </div>
            <h3 className="font-bold text-sm">Ranking Dapil Aktif</h3>
          </div>
          <div className="h-64">
            <Bar data={dapilData} options={options} />
          </div>
        </div>

        {/* Ranking Anggota */}
        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
              <Users size={18} />
            </div>
            <h3 className="font-bold text-sm">Ranking Anggota Teraktif</h3>
          </div>
          <div className="h-64">
            <Bar 
              data={anggotaData} 
              options={{
                ...options,
                indexAxis: 'y' as const,
              }} 
            />
          </div>
        </div>

        {/* Ranking Organisasi (User Teraktif) */}
        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                <Users size={18} />
              </div>
              <h3 className="font-bold text-sm">Organisasi Teraktif</h3>
            </div>
          </div>
          <div className="h-48 mb-4">
            <Bar 
              data={organisasiData} 
              options={{
                ...options,
                indexAxis: 'y' as const,
                plugins: { ...options.plugins, legend: { display: false } }
              }} 
            />
          </div>
          <div className="space-y-2 border-t border-slate-50 pt-4">
            {organisasiData.labels.map((label, i) => (
              <div key={label} className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-muted-foreground">{i + 1}. {label}</span>
                <span className="font-black text-primary">{organisasiData.datasets[0].data[i]} Sesi</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
