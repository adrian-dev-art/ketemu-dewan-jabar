"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Calendar,
  Clock,
  MapPin,
  Building2,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  Share2,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Film,
  Download,
  FileCheck2,
} from "lucide-react";
import { getBackendUrl } from "@/context/utils";
import FormattedAiAnalysis from "@/components/FormattedAiAnalysis";

interface TrackAspirasiData {
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
    name: string;
    kabupaten?: string | null;
    kecamatan?: string | null;
  } | null;
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

const TAHAPAN_DEFINITIF = [
  {
    step: 1,
    key: "diajukan",
    title: "Pengajuan Aspirasi",
    subtitle: "Aspirasi dan materi digital berhasil dikirim masyarakat",
    aktor: "Masyarakat",
  },
  {
    step: 2,
    key: "verifikasi",
    title: "Verifikasi Administrasi",
    subtitle: "Pemeriksaan kelengkapan berkas oleh Sekretariat DPRD",
    aktor: "Sekretariat DPRD",
  },
  {
    step: 3,
    key: "diteruskan",
    title: "Diteruskan ke Meja Dewan",
    subtitle: "Diserahkan ke Komisi/Anggota Dewan perwakilan Dapil",
    aktor: "Fraksi / Komisi",
  },
  {
    step: 4,
    key: "tindak_lanjut",
    title: "Tindak Lanjut & Pembahasan",
    subtitle: "Diagendakan dalam Rapat Kerja atau koordinasi instansi teknis",
    aktor: "Anggota Dewan / OPD",
  },
  {
    step: 5,
    key: "selesai",
    title: "Tuntas Terjawab",
    subtitle: "Pemberian jawaban resmi atau advokasi lapangan terealisasi",
    aktor: "DPRD Jawa Barat",
  },
];

export default function TrackAspirasiPublicPage() {
  const params = useParams();
  const router = useRouter();
  const ticketParam = params?.ticket as string;

  const [ticketInput, setTicketInput] = useState("");
  const [data, setData] = useState<TrackAspirasiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const backendUrl = getBackendUrl();

  const fetchAspirasiStatus = async (ticket: string) => {
    if (!ticket) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${backendUrl}/api/aspirasi/track/${encodeURIComponent(ticket)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else if (res.status === 404) {
        setError(`Data aspirasi dengan nomor tiket "${ticket}" tidak ditemukan. Pastikan nomor tiket sudah sesuai.`);
        setData(null);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.error || "Gagal memuat status aspirasi. Silakan coba lagi.");
        setData(null);
      }
    } catch (err: any) {
      console.error("Gagal tracking aspirasi:", err);
      setError("Terjadi gangguan koneksi ke server. Silakan coba beberapa saat lagi.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketParam) {
      setTicketInput(ticketParam);
      fetchAspirasiStatus(ticketParam);
    } else {
      setLoading(false);
    }
  }, [ticketParam, backendUrl]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;
    router.push(`/aspirasi/track/${encodeURIComponent(ticketInput.trim())}`);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Gagal copy link:", err);
    }
  };

  const handleShareWhatsapp = () => {
    if (!data) return;
    const text = `*PROGRES E-ASPIRASI DPRD JAWA BARAT*\n\n` +
      `Nomor Tiket: *${data.ticketNumber}*\n` +
      `Perihal: ${data.judul}\n` +
      `Kategori: ${data.kategori}\n` +
      `Dapil: ${data.dapil}\n` +
      `Status: ${data.status.toUpperCase()}\n\n` +
      `Cek progres terkini:\n${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Step mapping
  const stepMap: Record<string, number> = {
    diajukan: 0,
    verifikasi: 1,
    diteruskan: 2,
    tindak_lanjut: 3,
    selesai: 4,
    ditolak: -1,
  };
  const currentStep = data ? (stepMap[data.status] ?? 0) : 0;
  const isDitolak = data?.status === "ditolak";
  const isSelesai = data?.status === "selesai";

  const getStatusBadge = (status: string) => {
    if (status === "selesai") {
      return {
        label: "Tuntas Terjawab",
        class: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        dot: "bg-emerald-500",
      };
    }
    if (status === "tindak_lanjut") {
      return {
        label: "Sedang Ditindaklanjuti",
        class: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
        dot: "bg-blue-500",
      };
    }
    if (status === "diteruskan") {
      return {
        label: "Diteruskan ke Dewan",
        class: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
        dot: "bg-indigo-500",
      };
    }
    if (status === "ditolak") {
      return {
        label: "Ditolak / Tidak Memenuhi Syarat",
        class: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
        dot: "bg-rose-500",
      };
    }
    return {
      label: "Dalam Proses Verifikasi",
      class: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      dot: "bg-amber-500",
    };
  };

  const statusBadge = data ? getStatusBadge(data.status) : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* ── Top Official Navbar ── */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0">
              <Image
                src="/images/logo-1.png"
                alt="Logo Jawa Barat"
                fill
                className="object-contain"
                sizes="36px"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                  DPRD JAWA BARAT
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  HUDANG
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                Portal Informasi E-Aspirasi Publik
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/masyarakat"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Masuk ke Portal Warga</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        
        {/* ── Search Bar for Checking Ticket ── */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="Masukkan Nomor Tiket Aspirasi (contoh: ASP-202609-50911)..."
                className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
            >
              <Search size={14} />
              <span>Cek Status</span>
            </button>
          </form>
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div className="py-20 text-center space-y-3 bg-card border border-border rounded-2xl p-8">
            <RefreshCw size={28} className="animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-foreground">Memeriksa Basis Data E-Aspirasi...</p>
            <p className="text-xs text-muted-foreground">Mengambil riwayat rekam jejak dan progres tindak lanjut dari server</p>
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div className="py-12 bg-card border border-rose-500/20 rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-extrabold text-foreground">Tiket Tidak Ditemukan</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => {
                if (ticketParam) fetchAspirasiStatus(ticketParam);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-xl transition-all"
            >
              <RefreshCw size={13} />
              <span>Coba Lagi</span>
            </button>
          </div>
        )}

        {/* ── Loaded Ticket Details ── */}
        {!loading && data && statusBadge && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* ── Verification Banner Card ── */}
            <div className="bg-gradient-to-br from-emerald-600/10 via-card to-card border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                      <ShieldCheck size={12} />
                      Terverifikasi Digital
                    </span>
                    <span className="text-xs font-mono font-black text-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">
                      {data.ticketNumber}
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-2xl font-black text-foreground tracking-tight leading-snug">
                    {data.judul}
                  </h1>
                  <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} />
                      Diajukan: {new Date(data.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })} WIB
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {data.dapil}
                    </span>
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${statusBadge.class}`}>
                    <span className={`w-2 h-2 rounded-full ${statusBadge.dot} animate-pulse`} />
                    {statusBadge.label}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="p-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted transition-all"
                      title="Salin Tautan Publik"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={handleShareWhatsapp}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                      title="Bagikan ke WhatsApp"
                    >
                      <Share2 size={13} />
                      <span>Bagikan</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 5-Stage Stepper Tracker ── */}
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                    Alur Rekam Jejak Aspirasi
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Transparansi tahapan tindak lanjut dari masyarakat hingga persidangan dewan
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  Tahap {isDitolak ? "Dihentikan" : `${Math.min(currentStep + 1, 5)}/5`}
                </span>
              </div>

              {/* Responsive Progress Stepper */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {TAHAPAN_DEFINITIF.map((t, idx) => {
                  const isDone = !isDitolak && currentStep > idx;
                  const isCurrent = !isDitolak && currentStep === idx;
                  const isPending = !isDitolak && currentStep < idx;

                  return (
                    <div
                      key={t.step}
                      className={`relative flex flex-col p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? isSelesai
                            ? "bg-emerald-500/10 border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/30"
                            : "bg-primary/10 border-primary/40 shadow-xs ring-1 ring-primary/30"
                          : isDone
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : "bg-muted/30 border-border opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                            ? "bg-primary text-primary-foreground animate-pulse"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {isDone ? <Check size={12} strokeWidth={3} /> : t.step}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">
                          {t.aktor}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-foreground leading-tight mb-1">
                        {t.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {t.subtitle}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Grid: Detail Aspirasi & Tanggapan Dewan ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Isi Usulan Warga */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Deskripsi & Dokumen Pendukung */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-border">
                    <FileText size={17} className="text-primary" />
                    <h3 className="text-sm font-extrabold text-foreground">
                      Uraian Usulan / Aspirasi Warga
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                    {data.deskripsi}
                  </p>

                  {/* Metadata Attributes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">
                        Kategori Isu
                      </span>
                      <span className="inline-block font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {data.kategori}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">
                        Wilayah Administratif
                      </span>
                      <span className="font-semibold text-foreground">
                        {[data.kecamatan, data.kabupatenKota].filter(Boolean).join(", ") || data.dapil}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">
                        Pengusul
                      </span>
                      <span className="font-semibold text-foreground">
                        {data.masyarakat?.name || "Masyarakat Terverifikasi"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">
                        Daerah Pemilihan
                      </span>
                      <span className="font-semibold text-foreground">
                        {data.dapil}
                      </span>
                    </div>
                  </div>

                  {/* Lampiran Materi */}
                  {data.materiUrl && (
                    <div className="mt-4 p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          {data.materiType === "video" ? <Film size={18} /> : <FileCheck2 size={18} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {data.materiFileName || "Materi Bukti Terlampir"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {data.materiType === "video" ? "Rekaman Video Aspirasi" : "Dokumen Pendukung"}
                          </p>
                        </div>
                      </div>

                      <a
                        href={data.materiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-bold rounded-xl transition-all shadow-xs"
                      >
                        <ExternalLink size={12} />
                        <span>Buka Berkas</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* AI Triage / Telaah Otomatis (If available) */}
                {data.aiAnalysis && (
                  <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border/60">
                      <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                        <div className="p-1.5 rounded-lg bg-violet-500/10">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                            Telaah Cerdas Tenaga Ahli (AI HUDANG)
                          </h4>
                          <p className="text-[11px] text-muted-foreground">
                            Hasil telaah kelayakan administratif, substansi, dan rekomendasi awal
                          </p>
                        </div>
                      </div>
                      {data.aiRecommendation && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-bold border border-violet-500/20 self-start sm:self-auto">
                          <span>Rekomendasi:</span>
                          <strong className="underline decoration-violet-500/40">{data.aiRecommendation}</strong>
                        </div>
                      )}
                    </div>
                    <FormattedAiAnalysis content={data.aiAnalysis} />
                  </div>
                )}

              </div>

              {/* Right Col: Tanggapan Resmi Dewan & Status Penanganan */}
              <div className="space-y-6">
                
                {/* Tanggapan Resmi Box */}
                <div className={`border rounded-3xl p-6 shadow-xs space-y-4 ${
                  data.tanggapanDewan
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-card border-border"
                }`}>
                  <div className="flex items-center gap-2 pb-3 border-b border-border">
                    <MessageSquare size={17} className={data.tanggapanDewan ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"} />
                    <h3 className="text-sm font-extrabold text-foreground">
                      Tanggapan Resmi Dewan
                    </h3>
                  </div>

                  {data.tanggapanDewan ? (
                    <div className="space-y-3">
                      <div className="text-[11px] text-muted-foreground">
                        Dijawab oleh: <strong className="text-foreground">{data.tanggapanOleh || data.dewan?.name || "Sekretariat DPRD"}</strong>
                        {data.tanggapanAt && (
                          <span className="block text-[10px] mt-0.5">
                            Pada {new Date(data.tanggapanAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })} WIB
                          </span>
                        )}
                      </div>

                      <div className="p-3.5 bg-card border border-border rounded-2xl text-xs text-foreground leading-relaxed whitespace-pre-line shadow-xs">
                        {data.tanggapanDewan}
                      </div>

                      {data.suratTanggapanUrl && (
                        <a
                          href={data.suratTanggapanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                        >
                          <Download size={13} />
                          <span>Unduh Surat Tanggapan Resmi</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-muted-foreground space-y-2">
                      <Clock size={24} className="mx-auto text-amber-500 animate-pulse" />
                      <p className="font-semibold text-foreground">Sedang Dalam Penelaahan</p>
                      <p className="text-[11px]">
                        Aspirasi sedang dalam antrean verifikasi atau telaah komisi terkait. Jawaban resmi akan tampil otomatis di sini.
                      </p>
                    </div>
                  )}
                </div>

                {/* Anggota Dewan Penerima / Komisi */}
                {data.dewan && (
                  <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Perwakilan Dewan Penanggung Jawab
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {data.dewan.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-foreground leading-snug">
                          {data.dewan.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {data.dewan.fraksi || "Fraksi DPRD Jabar"} • {data.dewan.dapil || data.dapil}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* ── Timeline Events History Table ── */}
            {data.timelineEvents && data.timelineEvents.length > 0 && (
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
                  <Clock size={16} className="text-primary" />
                  <h3 className="text-sm font-extrabold text-foreground">
                    Riwayat Jejak Waktu & Disposisi
                  </h3>
                </div>

                <div className="space-y-4">
                  {data.timelineEvents.map((evt, idx) => (
                    <div key={evt.id || idx} className="flex items-start gap-3 relative">
                      {idx < (data.timelineEvents?.length || 0) - 1 && (
                        <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-border -translate-x-1/2" />
                      )}
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 z-10">
                        <CheckCircle2 size={13} />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-0.5">
                          <span className="font-bold text-foreground">
                            {evt.tahap}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(evt.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })} WIB
                          </span>
                        </div>
                        {evt.keterangan && (
                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            {evt.keterangan}
                          </p>
                        )}
                        {evt.aktor && (
                          <span className="inline-block text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-1">
                            Oleh: {evt.aktor}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Official Disclaimer Footer ── */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border text-center text-xs text-muted-foreground space-y-1">
              <p className="font-bold text-foreground">
                Sekretariat Dewan Perwakilan Rakyat Daerah Provinsi Jawa Barat
              </p>
              <p className="text-[11px]">
                Jl. Diponegoro No. 27, Kota Bandung • Layanan Hotline Informasi: (022) 4208000
              </p>
              <p className="text-[10px] text-muted-foreground/80">
                Data pada halaman ini bersifat publik untuk transparansi penanganan aspirasi masyarakat tanpa mempublikasikan identitas pribadi (NIK & Nomor Kontak).
              </p>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
