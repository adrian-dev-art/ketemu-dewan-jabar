"use client";

import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { X, FileText, CheckCircle, List, BarChart3, MessageSquare, AlertCircle } from 'lucide-react';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface AnalysisData {
  summary?: string;
  sentiment?: string;
  topics?: string[];
  actionItems?: string[];
  citizenSatisfaction?: number;
  dewanResponsiveness?: number;
  discussionQuality?: number;
  problemSolving?: number;
  pending?: boolean;
}

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AnalysisData | null;
  transcription?: string | null;
  title: string;
}

export default function AnalysisModal({ isOpen, onClose, data, transcription, title }: AnalysisModalProps) {
  if (!isOpen || !data) return null;

  if (data.pending) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="font-black text-xl text-[#121212] mb-2">Sedang Diproses</h3>
          <p className="text-sm text-slate-500 mb-6">Video sedang dianalisis oleh AI. Ini mungkin memakan waktu beberapa menit tergantung panjang video. Silakan kembali lagi nanti.</p>
          <button onClick={onClose} className="w-full py-3 bg-[#121212] text-white rounded-xl font-bold text-sm">Tutup</button>
        </div>
      </div>
    );
  }

  const radarData = {
    labels: ['Kepuasan Warga', 'Responsivitas Dewan', 'Kualitas Diskusi', 'Penyelesaian Masalah'],
    datasets: [
      {
        label: 'Skor Analisis (1-10)',
        data: [
          data.citizenSatisfaction || 0,
          data.dewanResponsiveness || 0,
          data.discussionQuality || 0,
          data.problemSolving || 0,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { display: false },
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: { stepSize: 2 }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  const sentimentColor = 
    data.sentiment?.toLowerCase().includes('positif') ? 'text-emerald-600 bg-emerald-50' :
    data.sentiment?.toLowerCase().includes('negatif') ? 'text-red-600 bg-red-50' :
    'text-blue-600 bg-blue-50';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white border border-border w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-black text-xl text-[#121212]">Analisis AI: {title}</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Laporan Otomatis Didukung oleh Gemini AI</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full shadow-sm transition-all border border-transparent hover:border-border">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Summary & Stats */}
            <div className="lg:col-span-7 space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText size={16} /></div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">Ringkasan Eksekutif</h4>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 bg-slate-50 p-6 rounded-3xl border border-slate-100 italic">
                  "{data.summary}"
                </p>
              </section>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Sentimen Umum</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${sentimentColor}`}>
                    {data.sentiment}
                  </span>
                </div>
                <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Skor Kepuasan</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#121212]">{data.citizenSatisfaction}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">/ 10</span>
                  </div>
                </div>
              </div>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><List size={16} /></div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">Topik Utama</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.topics?.map((topic, i) => (
                    <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 shadow-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </section>

              {/* Input Perbaikan */}
              <section className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><MessageSquare size={16} /></div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">Input Perbaikan (Koreksi)</h4>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">Jika AI melakukan kesalahan analisis, berikan catatan perbaikan di bawah ini untuk penyempurnaan data.</p>
                  <textarea 
                    placeholder="Contoh: Skor responsivitas seharusnya 8, karena..."
                    className="w-full min-h-[100px] p-4 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-y custom-scrollbar"
                  />
                  <div className="flex justify-end">
                    <button className="px-5 py-2 bg-[#121212] text-white rounded-xl text-xs font-bold hover:bg-[#222] transition-colors">
                      Simpan Perbaikan
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Visualization & Action Items */}
            <div className="lg:col-span-5 space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><BarChart3 size={16} /></div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">Metrik Performa</h4>
                </div>
                <div className="h-64 bg-slate-50 rounded-3xl p-4 border border-slate-100">
                  <Radar data={radarData} options={radarOptions} />
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle size={16} /></div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">Rencana Tindak Lanjut</h4>
                </div>
                <ul className="space-y-3">
                  {data.actionItems?.map((item, i) => (
                    <li key={i} className="flex gap-3 text-xs text-slate-600 bg-emerald-50/30 p-3 rounded-2xl border border-emerald-100/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Full Width Row: Transcription */}
            {transcription && (
              <div className="lg:col-span-12 mt-4 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText size={16} /></div>
                    <h4 className="font-bold text-sm uppercase tracking-wider">Transkrip Lengkap (Verbatim)</h4>
                  </div>
                  <button 
                    onClick={() => {
                      const blob = new Blob([transcription], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `transkripsi.txt`;
                      a.click();
                    }}
                    className="px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    Unduh (.txt)
                  </button>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl overflow-y-auto max-h-[400px] custom-scrollbar text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-mono">
                  {transcription}
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="px-8 py-6 border-t border-border bg-slate-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-[#121212] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-black/10"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
