"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Video,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Calendar,
  MapPin,
  Building2,
  ShieldCheck,
  User,
  AlertCircle,
  ExternalLink,
  Loader2,
  MessageSquare,
  Sparkles,
  Bot,
  FileSearch,
} from "lucide-react";

export interface AspirasiData {
  id: number;
  ticketNumber: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  dapil: string;
  kabupatenKota?: string | null;
  kecamatan?: string | null;
  alamat?: string | null;
  materiUrl?: string | null;
  materiType?: string | null;
  materiFileName?: string | null;
  materiSize?: number | null;
  status: string;
  tanggapanDewan?: string | null;
  tanggapanOleh?: string | null;
  tanggapanAt?: string | null;
  suratTanggapanUrl?: string | null;
  aiAnalysis?: string | null;
  aiRecommendation?: string | null;
  aiAnalysedAt?: string | null;
  createdAt: string;
  masyarakat?: {
    id: number;
    name: string;
    email: string;
    noWhatsapp?: string | null;
    kabupaten?: string | null;
    kecamatan?: string | null;
  };
  dewan?: {
    id: number;
    name: string;
    fraksi?: string | null;
    dapil?: string | null;
    jabatan?: string | null;
  } | null;
  timelineEvents?: Array<{
    id: number;
    tahap: string;
    status: string;
    keterangan?: string | null;
    aktor?: string | null;
    createdAt: string;
  }>;
}

interface AspirasiTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspirasi: AspirasiData | null;
  userRole?: string; // 'masyarakat' | 'dewan' | 'admin'
  token?: string;
  backendUrl?: string;
  onUpdate?: (updated: AspirasiData) => void;
}

const TAHAPAN_DEFINITIF = [
  {
    step: 1,
    title: "Pengajuan Aspirasi",
    subtitle: "Aspirasi dan materi digital berhasil dikirim oleh masyarakat",
    targetStatus: "diajukan",
    aktor: "Masyarakat",
  },
  {
    step: 2,
    title: "Verifikasi Administrasi",
    subtitle: "Pemeriksaan kelengkapan berkas materi oleh Sekretariat DPRD",
    targetStatus: "verifikasi",
    aktor: "Sekretariat DPRD",
  },
  {
    step: 3,
    title: "Diteruskan ke Meja Dewan",
    subtitle: "Aspirasi diteruskan ke Anggota Dewan di Dapil bersangkutan",
    targetStatus: "diteruskan",
    aktor: "Sekretariat DPRD",
  },
  {
    step: 4,
    title: "Penelaahan & Tindak Lanjut",
    subtitle: "Penelaahan materi dan koordinasi rekomendasi kedewanan",
    targetStatus: "tindak_lanjut",
    aktor: "Anggota Dewan",
  },
  {
    step: 5,
    title: "Tuntas & Tanggapan Resmi",
    subtitle: "Pemberian jawaban atau tanggapan resmi kedewanan",
    targetStatus: "selesai",
    aktor: "Anggota Dewan",
  },
];

export default function AspirasiTimelineModal({
  isOpen,
  onClose,
  aspirasi,
  userRole = "masyarakat",
  token,
  backendUrl,
  onUpdate,
}: AspirasiTimelineModalProps) {
  const [tanggapanText, setTanggapanText] = useState("");
  const [isSubmittingTanggapan, setIsSubmittingTanggapan] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiActionError, setAiActionError] = useState("");

  if (!isOpen || !aspirasi) return null;

  // Tentukan indeks tahap aktif (0 s.d. 4)
  const getActiveStepIndex = (status: string): number => {
    switch (status) {
      case "diajukan":
        return 0;
      case "verifikasi":
        return 1;
      case "diteruskan":
        return 2;
      case "tindak_lanjut":
        return 3;
      case "selesai":
        return 4;
      case "ditolak":
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIndex = getActiveStepIndex(aspirasi.status);

  // Status badge pill
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "selesai":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            Tuntas Terjawab
          </span>
        );
      case "tindak_lanjut":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
            Sedang Ditindaklanjuti
          </span>
        );
      case "diteruskan":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
            Diteruskan ke Dewan
          </span>
        );
      case "verifikasi":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            Verifikasi Administrasi
          </span>
        );
      case "ditolak":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/30">
            Ditolak
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            Menunggu Penelaahan
          </span>
        );
    }
  };

  // Badge rekomendasi AI
  const getRecommendationBadge = (rec?: string | null) => {
    if (!rec) return null;
    const lower = rec.toLowerCase();
    if (lower.includes("diteruskan")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
          <ShieldCheck size={13} />
          <span>{rec}</span>
        </span>
      );
    }
    if (lower.includes("klarifikasi") || lower.includes("tambahan")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
          <AlertCircle size={13} />
          <span>{rec}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30">
        <X size={13} />
        <span>{rec}</span>
      </span>
    );
  };

  // Handler jalankan telaah AI
  const handleTriggerAiAnalysis = async () => {
    if (!aspirasi || !token || !backendUrl) return;
    setIsAnalyzingAi(true);
    setAiActionError("");
    try {
      const res = await fetch(`${backendUrl}/api/aspirasi/${aspirasi.id}/analisis-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal memproses telaah AI.");
      }

      const data = await res.json();
      if (data.aspirasi && onUpdate) {
        onUpdate(data.aspirasi);
      }
    } catch (err: any) {
      setAiActionError(err.message || "Gagal menjalankan analisis AI.");
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Handler kirim tanggapan oleh Dewan / Admin
  const handleKirimTanggapan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggapanText.trim() || !token || !backendUrl) return;

    setIsSubmittingTanggapan(true);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch(`${backendUrl}/api/aspirasi/${aspirasi.id}/tanggapan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tanggapanDewan: tanggapanText.trim(),
          status: "selesai",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengirim tanggapan.");
      }

      const updated = await res.json();
      setActionSuccess("Tanggapan resmi berhasil disimpan dan status diperbarui menjadi Selesai.");
      setTanggapanText("");
      if (onUpdate) onUpdate(updated);
    } catch (err: any) {
      setActionError(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmittingTanggapan(false);
    }
  };

  // Handler update status cepat oleh Dewan / Admin
  const handleUpdateStatus = async (newStatus: string) => {
    if (!token || !backendUrl) return;
    try {
      const res = await fetch(`${backendUrl}/api/aspirasi/${aspirasi.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal memperbarui status.");
      }

      const updated = await res.json();
      if (onUpdate) onUpdate(updated);
    } catch (err: any) {
      setActionError(err.message || "Terjadi kesalahan memperbarui status.");
    }
  };

  const resolvedMateriUrl = aspirasi.materiUrl
    ? aspirasi.materiUrl.startsWith("http")
      ? aspirasi.materiUrl
      : `${backendUrl || ""}${aspirasi.materiUrl}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header Modal — gradient accent */}
        <div className="relative px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-card to-card shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                  {aspirasi.ticketNumber}
                </span>
                {getStatusBadge(aspirasi.status)}
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-foreground leading-snug mt-0.5 line-clamp-1">
                {aspirasi.judul}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors shrink-0"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Info Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Daerah Pemilihan', value: aspirasi.dapil },
              { label: 'Kategori Sektor', value: aspirasi.kategori },
              { label: 'Tanggal Pengajuan', value: new Date(aspirasi.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) },
              { label: 'Pemohon Warga', value: aspirasi.masyarakat?.name || 'Warga Jabar' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-muted/40 border border-border rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
                <p className="font-bold text-foreground text-xs leading-snug">{value}</p>
              </div>
            ))}
          </div>

          {/* Deskripsi Usulan */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileSearch size={13} />
              Uraian Usulan / Kondisi Lapangan
            </h4>
            <div className="p-4 bg-muted/20 border border-border rounded-xl text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
              {aspirasi.deskripsi}
            </div>
          </div>

          {/* Materi Digital Terlampir (Video / PDF / Foto) */}
          {resolvedMateriUrl && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Berkas Materi Aspirasi Terlampir</span>
                <span className="text-[11px] font-normal lowercase">{aspirasi.materiType || "berkas"}</span>
              </h4>

              {aspirasi.materiType === "video" ? (
                <div className="rounded-xl overflow-hidden border border-border bg-black">
                  <video
                    src={resolvedMateriUrl}
                    controls
                    className="w-full max-h-72 object-contain"
                  >
                    Peramban Anda tidak mendukung pemutar video HTML5.
                  </video>
                  <div className="p-2.5 bg-card border-t border-border flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground truncate max-w-sm">
                      {aspirasi.materiFileName || "Video Aspirasi"}
                    </span>
                    <a
                      href={resolvedMateriUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-bold flex items-center gap-1 shrink-0"
                    >
                      <Download size={13} />
                      <span>Unduh Video</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-muted/40 border border-border rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {aspirasi.materiFileName || "Dokumen Materi Pendukung"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {aspirasi.materiSize
                          ? `${(aspirasi.materiSize / (1024 * 1024)).toFixed(2)} MB • `
                          : ""}
                        Format berkas resmi
                      </p>
                    </div>
                  </div>
                  <a
                    href={resolvedMateriUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold flex items-center gap-1.5 hover:bg-primary/90 transition-all shrink-0"
                  >
                    <ExternalLink size={13} />
                    <span>Lihat Berkas</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TELAAH TENAGA AHLI AI (DPRD PROVINSI JAWA BARAT) */}
          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/8 via-primary/5 to-card p-4 sm:p-5 space-y-3.5 relative overflow-hidden">
            {/* subtle glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
            {/* Header Telaah AI */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-violet-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-primary/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
                  <Sparkles size={17} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-foreground">
                      Telaah Tenaga Ahli AI
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                      Sekretariat DPRD Jabar
                    </span>
                  </div>
                  {aspirasi.aiAnalysedAt && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Dianalisis: {new Date(aspirasi.aiAnalysedAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Rekomendasi & Tombol Aksi */}
              <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                {getRecommendationBadge(aspirasi.aiRecommendation)}

                <button
                  type="button"
                  onClick={handleTriggerAiAnalysis}
                  disabled={isAnalyzingAi}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-card hover:bg-muted border border-border text-foreground flex items-center gap-1.5 transition-all disabled:opacity-50"
                  title={aspirasi.aiAnalysis ? "Perbarui Telaah AI" : "Jalankan Telaah AI"}
                >
                  {isAnalyzingAi ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-violet-500" />
                      <span>Menganalisis...</span>
                    </>
                  ) : (
                    <>
                      <Bot size={13} className="text-violet-500" />
                      <span>{aspirasi.aiAnalysis ? "Perbarui Telaah" : "Jalankan Telaah AI"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {aiActionError && (
              <p className="text-xs text-red-500 font-semibold">{aiActionError}</p>
            )}

            {/* Konten Telaah AI — better rendering */}
            {aspirasi.aiAnalysis ? (
              <div className="space-y-2.5">
                <div className="text-xs text-foreground/90 leading-[1.85] font-normal bg-card/80 rounded-xl p-4 border border-border/60 max-h-80 overflow-y-auto">
                  {aspirasi.aiAnalysis.split('\n').map((paragraph, idx) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return <div key={idx} className="h-2" />;
                    // Bold headers like "1. Identifikasi:" or "**Header**"
                    const isBoldHeader = /^\*\*.*\*\*$/.test(trimmed) || /^\d+\.\s/.test(trimmed);
                    const cleanText = trimmed.replace(/\*\*/g, '');
                    return (
                      <p key={idx} className={`${ isBoldHeader ? 'font-black text-foreground mt-2 first:mt-0' : 'text-foreground/80' }`}>
                        {cleanText}
                      </p>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-card/50 border border-dashed border-violet-500/30 flex flex-col items-center justify-center text-center space-y-2">
                <FileSearch size={28} className="text-muted-foreground" />
                <p className="text-xs text-muted-foreground max-w-md font-medium">
                  Proposal ini belum ditelaah oleh model Tenaga Ahli AI. Klik tombol di atas untuk menjalankan telaah kelayakan administratif, substansi, dan rekomendasi kedewanan secara otomatis.
                </p>
              </div>
            )}
          </div>

          {/* VISUALISASI 5 TAHAP TIMELINE TINDAK LANJUT */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar size={13} />
                Timeline Tindak Lanjut Aspirasi
              </h4>
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                Tahap {currentStepIndex >= 0 ? currentStepIndex + 1 : 0} dari 5
              </span>
            </div>

            <div className="flex items-start gap-0 relative">
              {TAHAPAN_DEFINITIF.map((tahap, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={tahap.step} className="flex-1 flex flex-col items-center relative">
                    {/* Connector line (left side) */}
                    {idx > 0 && (
                      <div className={`absolute left-0 top-[18px] w-1/2 h-0.5 ${
                        isPassed ? 'bg-emerald-500' : 'bg-border'
                      }`} />
                    )}
                    {/* Connector line (right side) */}
                    {idx < 4 && (
                      <div className={`absolute right-0 top-[18px] w-1/2 h-0.5 ${
                        currentStepIndex > idx ? 'bg-emerald-500' : 'bg-border'
                      }`} />
                    )}

                    {/* Step circle */}
                    <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      isPassed && !isCurrent
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30'
                        : isCurrent
                        ? 'bg-card border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-500/20'
                        : 'bg-card border-border text-muted-foreground/40'
                    }`}>
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 size={16} />
                      ) : isCurrent ? (
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      ) : (
                        <span className="text-[10px] font-black">{tahap.step}</span>
                      )}
                    </div>

                    {/* Label below */}
                    <div className="mt-2 px-1 text-center">
                      <p className={`text-[10px] font-black leading-tight ${
                        isCurrent
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isPassed
                          ? 'text-foreground'
                          : 'text-muted-foreground/50'
                      }`}>
                        {tahap.title}
                      </p>
                      <p className="text-[9px] text-muted-foreground/60 mt-0.5 hidden sm:block leading-tight">
                        {tahap.aktor}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timeline event log (from DB) */}
            {aspirasi.timelineEvents && aspirasi.timelineEvents.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Log Aktivitas:</p>
                {aspirasi.timelineEvents.slice().reverse().map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2.5 p-2.5 bg-muted/30 rounded-xl border border-border/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-foreground">{ev.tahap}</span>
                        <span className="text-[9px] text-muted-foreground shrink-0">
                          {new Date(ev.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      {ev.keterangan && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{ev.keterangan}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KOTAK TANGGAPAN RESMI DEWAN */}
          {aspirasi.tanggapanDewan && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Tanggapan Resmi Anggota DPRD / Sekretariat
                  </span>
                </div>
                {aspirasi.tanggapanAt && (
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(aspirasi.tanggapanAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                {aspirasi.tanggapanDewan}
              </p>
              {aspirasi.tanggapanOleh && (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1 border-t border-emerald-500/20">
                  Diverifikasi oleh: {aspirasi.tanggapanOleh}
                </p>
              )}
            </div>
          )}

          {/* FORM TANGGAPAN UNTUK DEWAN / ADMIN */}
          {(userRole === "dewan" || userRole === "admin") && (
            <div className="p-5 bg-card border border-primary/30 rounded-2xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-primary" />
                  <span className="text-xs font-black uppercase tracking-wider text-foreground">
                    Formulir Tindak Lanjut &amp; Tanggapan Kedewanan
                  </span>
                </div>
                <span className="text-[11px] font-bold text-primary">Akses Kedewanan</span>
              </div>

              {actionError && (
                <p className="text-xs text-red-500 font-semibold">{actionError}</p>
              )}
              {actionSuccess && (
                <p className="text-xs text-emerald-600 font-semibold">{actionSuccess}</p>
              )}

              {/* Tombol aksi pembaruan status bertahap */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Perbarui Tahapan Alur Aspirasi:
                </label>
                <div className="flex flex-wrap gap-2">
                  {aspirasi.status !== "verifikasi" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("verifikasi")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border hover:bg-muted transition-colors"
                    >
                      Tandai Verifikasi
                    </button>
                  )}
                  {aspirasi.status !== "diteruskan" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("diteruskan")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border hover:bg-muted transition-colors"
                    >
                      Teruskan ke Dewan
                    </button>
                  )}
                  {aspirasi.status !== "tindak_lanjut" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("tindak_lanjut")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-500/40 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                    >
                      Proses Tindak Lanjut
                    </button>
                  )}
                </div>
              </div>

              {/* Kotak Teks Tanggapan Resmi */}
              <form onSubmit={handleKirimTanggapan} className="space-y-3 pt-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Tulis Tanggapan Resmi untuk Konstituen:
                </label>
                <textarea
                  rows={3}
                  value={tanggapanText}
                  onChange={(e) => setTanggapanText(e.target.value)}
                  placeholder="Tuliskan komitmen tindak lanjut, koordinasi dengan OPD Pemprov Jabar, atau arahan kebijakan terkait aspirasi ini..."
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 outline-none text-foreground leading-relaxed"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingTanggapan || !tanggapanText.trim()}
                    className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSubmittingTanggapan || !tanggapanText.trim()
                        ? "bg-muted-foreground/30 text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    {isSubmittingTanggapan ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Kirim Tanggapan Resmi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-muted-foreground">
            Platform HUDANG • Sekretariat DPRD Provinsi Jawa Barat
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-foreground text-xs font-bold hover:bg-muted transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
