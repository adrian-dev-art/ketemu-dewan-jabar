"use client";

import React, { useState } from 'react';
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
import {
  X,
  FileText,
  CheckCircle2,
  BarChart3,
  MessageSquare,
  FileCheck2,
  Sparkles,
  Download,
  Copy,
  Check,
  TrendingUp,
  Quote,
  Tags,
  AlertCircle
} from 'lucide-react';

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
  onOpenFollowUp?: () => void;
}

export default function AnalysisModal({
  isOpen,
  onClose,
  data,
  transcription,
  title,
  onOpenFollowUp,
}: AnalysisModalProps) {
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [correctionText, setCorrectionText] = useState("");
  const [correctionSaved, setCorrectionSaved] = useState(false);

  if (!isOpen || !data) return null;

  if (data.pending) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="font-bold text-xl text-foreground mb-2">Analisis Sedang Diproses</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Video dan transkrip sedang dianalisis oleh AI. Proses ini membutuhkan waktu beberapa saat tergantung durasi sesi pertemuan.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const radarData = {
    labels: ['Kepuasan Warga', 'Responsivitas', 'Kualitas Diskusi', 'Solusi Masalah'],
    datasets: [
      {
        label: 'Skor Analisis (1-10)',
        data: [
          data.citizenSatisfaction || 0,
          data.dewanResponsiveness || 0,
          data.discussionQuality || 0,
          data.problemSolving || 0,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.25)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2.5,
        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(37, 99, 235, 1)',
        pointRadius: 4,
      },
    ],
  };

  const radarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 12,
        bottom: 12,
        left: 20,
        right: 20,
      },
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(148, 163, 184, 0.3)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.25)',
        },
        pointLabels: {
          font: {
            size: 11,
            weight: '600',
            family: 'inherit',
          },
          color: '#475569',
          padding: 8,
        },
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: {
          stepSize: 2,
          display: false,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `Skor: ${context.raw} / 10`,
        },
      },
    },
  };

  const sentiment = data.sentiment || "Netral";
  const isPositive = sentiment.toLowerCase().includes('positif');
  const isNegative = sentiment.toLowerCase().includes('negatif');

  const sentimentBadgeStyle = isPositive
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
    : isNegative
    ? 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
    : 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';

  const handleCopyTranscript = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const handleDownloadTranscript = () => {
    if (!transcription) return;
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transkrip_${title.replace(/\s+/g, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveCorrection = () => {
    if (!correctionText.trim()) return;
    setCorrectionSaved(true);
    setTimeout(() => {
      setCorrectionText("");
      setCorrectionSaved(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-border flex items-center justify-between shrink-0 bg-muted/30">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles size={12} />
                Gemini AI Analysis
              </span>
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-foreground mt-1 line-clamp-1">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Laporan ringkasan dan evaluasi performa dialog aspirasi otomatis
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors border border-transparent hover:border-border shrink-0 text-muted-foreground hover:text-foreground"
            title="Tutup Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Executive Summary */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                    <FileText size={16} />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Ringkasan Eksekutif
                  </h4>
                </div>
                <div className="relative p-5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                  <Quote className="absolute top-4 right-4 text-blue-300 dark:text-blue-800 pointer-events-none" size={24} />
                  <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                    {data.summary && data.summary.trim() ? (
                      data.summary
                    ) : (
                      <span className="text-muted-foreground italic font-normal">
                        Belum ada ringkasan naratif otomatis yang dihasilkan untuk sesi dialog ini.
                      </span>
                    )}
                  </p>
                </div>
              </section>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-border bg-card shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Sentimen Dialog
                    </p>
                    <TrendingUp size={14} className="text-muted-foreground" />
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${sentimentBadgeStyle}`}>
                    {sentiment}
                  </span>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-card shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Skor Kepuasan
                    </p>
                    <Sparkles size={14} className="text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-extrabold text-foreground tracking-tight">
                      {data.citizenSatisfaction ?? "-"}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">/ 10</span>
                  </div>
                </div>
              </div>

              {/* Main Topics */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                    <Tags size={16} />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Topik Pembahasan
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.topics && data.topics.length > 0 ? (
                    data.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3.5 py-1.5 bg-muted/60 hover:bg-muted border border-border rounded-xl text-xs font-medium text-foreground transition-colors"
                      >
                        #{topic}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Tidak ada topik spesifik terdeteksi.
                    </span>
                  )}
                </div>
              </section>

              {/* Correction Input */}
              <section className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-muted rounded-lg text-muted-foreground">
                    <MessageSquare size={16} />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Catatan Koreksi (Feedback Admin)
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Bila AI melakukan kesalahan interpretasi atau skor, berikan masukan perbaikan di sini.
                </p>
                <div className="space-y-3">
                  <textarea
                    value={correctionText}
                    onChange={(e) => setCorrectionText(e.target.value)}
                    placeholder="Contoh: Skor responsivitas seharusnya bernilai 9 karena dewan memberikan solusi langsung..."
                    className="w-full min-h-[90px] p-3.5 text-xs sm:text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y custom-scrollbar"
                  />
                  <div className="flex items-center justify-between">
                    {correctionSaved ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium animate-in fade-in">
                        <CheckCircle2 size={14} />
                        Catatan perbaikan berhasil disimpan.
                      </span>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={handleSaveCorrection}
                      disabled={!correctionText.trim()}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Simpan Koreksi
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Visualization & Follow Up */}
            <div className="lg:col-span-5 space-y-6">
              {/* Radar Chart */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                    <BarChart3 size={16} />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Metrik Performa Diskusi
                  </h4>
                </div>
                <div className="bg-muted/20 border border-border rounded-2xl p-4">
                  <div className="h-60 w-full relative">
                    <Radar data={radarData} options={radarOptions} />
                  </div>
                  {/* Score Breakdown Pills */}
                  <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-border/60">
                    <div className="text-center p-2 rounded-lg bg-background border border-border/80">
                      <p className="text-[10px] text-muted-foreground font-medium">Kepuasan</p>
                      <p className="text-xs font-bold text-foreground">{data.citizenSatisfaction ?? 0}/10</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background border border-border/80">
                      <p className="text-[10px] text-muted-foreground font-medium">Responsivitas</p>
                      <p className="text-xs font-bold text-foreground">{data.dewanResponsiveness ?? 0}/10</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background border border-border/80">
                      <p className="text-[10px] text-muted-foreground font-medium">Kualitas Diskusi</p>
                      <p className="text-xs font-bold text-foreground">{data.discussionQuality ?? 0}/10</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background border border-border/80">
                      <p className="text-[10px] text-muted-foreground font-medium">Solusi Masalah</p>
                      <p className="text-xs font-bold text-foreground">{data.problemSolving ?? 0}/10</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Action Items / Tindak Lanjut */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={16} />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Rencana Tindak Lanjut Terdeteksi
                  </h4>
                </div>
                {data.actionItems && data.actionItems.length > 0 ? (
                  <ul className="space-y-2.5">
                    {data.actionItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2.5 text-xs text-foreground bg-emerald-50/40 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50 leading-relaxed font-medium"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-border text-center bg-muted/10">
                    <p className="text-xs text-muted-foreground">
                      Belum ada butir tindak lanjut spesifik yang diidentifikasi dari sesi ini.
                    </p>
                  </div>
                )}

                {onOpenFollowUp && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFollowUp();
                    }}
                    className="mt-3 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <FileCheck2 size={15} />
                    <span>Buka Timeline & Progres Disposisi</span>
                  </button>
                )}
              </section>
            </div>

            {/* Full Width Row: Transcription */}
            {transcription && (
              <div className="lg:col-span-12 pt-6 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Transkrip Lengkap Percakapan (Verbatim)
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Hasil transkripsi otomatis audio rekaman ruang sidang/pertemuan
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyTranscript}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedTranscript ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      <span>{copiedTranscript ? "Tersalin" : "Salin"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadTranscript}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Download size={13} />
                      <span>Unduh (.txt)</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-muted/30 border border-border rounded-2xl overflow-y-auto max-h-72 custom-scrollbar text-xs leading-relaxed text-foreground whitespace-pre-wrap font-mono select-text">
                  {transcription}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-3 shrink-0">
          {onOpenFollowUp ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFollowUp();
              }}
              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              <FileCheck2 size={15} />
              <span>Timeline Tindak Lanjut</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-foreground text-background font-bold rounded-xl text-xs hover:opacity-90 transition-opacity shadow-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
