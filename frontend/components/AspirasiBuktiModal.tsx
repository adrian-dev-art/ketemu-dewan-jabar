"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  X,
  Printer,
  Share2,
  Copy,
  ExternalLink,
  Check,
  ShieldCheck,
  Calendar,
  MapPin,
  User,
  FileText,
  Clock,
  Download,
  Building2,
  Sparkles,
} from "lucide-react";
import { AspirasiData } from "./AspirasiTimelineModal";

interface AspirasiBuktiModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspirasi: AspirasiData | null;
}

export default function AspirasiBuktiModal({
  isOpen,
  onClose,
  aspirasi,
}: AspirasiBuktiModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [trackingUrl, setTrackingUrl] = useState<string>("");
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aspirasi || !isOpen) return;

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/aspirasi/track/${encodeURIComponent(aspirasi.ticketNumber)}`;
    setTrackingUrl(url);

    // Generate high-resolution QR Code with high error correction
    QRCode.toDataURL(url, {
      width: 320,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.error("Gagal generate QR Code:", err));
  }, [aspirasi, isOpen]);

  if (!isOpen || !aspirasi) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Gagal copy link:", err);
    }
  };

  const handleShareWhatsapp = () => {
    const text = `*TANDA BUKTI PENERIMAAN E-ASPIRASI DPRD JAWA BARAT*\n\n` +
      `Nomor Tiket: *${aspirasi.ticketNumber}*\n` +
      `Perihal: ${aspirasi.judul}\n` +
      `Kategori: ${aspirasi.kategori}\n` +
      `Wilayah/Dapil: ${aspirasi.dapil}\n` +
      `Status: ${aspirasi.status.toUpperCase()}\n\n` +
      `Pantau progres tindak lanjut resmi melalui tautan publik berikut:\n${trackingUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR-Bukti-Aspirasi-${aspirasi.ticketNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formattedDate = new Date(aspirasi.createdAt).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const statusLabel =
    aspirasi.status === "selesai"
      ? "TUNTAS TERJAWAB"
      : aspirasi.status === "tindak_lanjut"
      ? "SEDANG DITINDAKLANJUTI"
      : aspirasi.status === "diteruskan"
      ? "DITERUSKAN KE KOMISI/DEWAN"
      : aspirasi.status === "ditolak"
      ? "DITOLAK / TIDAK VALID"
      : "TERVERIFIKASI & TERCATAT";

  return (
    <>
      {/* ── Print Specific Styles ── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #aspirasi-printable-document,
          #aspirasi-printable-document * {
            visibility: visible;
          }
          #aspirasi-printable-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: white !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Modal Overlay ── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
        <div className="relative w-full max-w-3xl my-auto bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
          
          {/* ── Modal Header / Action Toolbar (Hidden in Print) ── */}
          <div className="no-print px-5 sm:px-6 py-4 border-b border-border/80 bg-muted/40 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                  Tanda Bukti & QR E-Aspirasi
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Dokumen registrasi resmi Sekretariat DPRD Provinsi Jawa Barat
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:opacity-90 active:scale-95 transition-all"
                title="Cetak atau Simpan PDF"
              >
                <Printer size={13} />
                <span>Cetak / PDF</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── Scrollable Document Container ── */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-muted/20">
            
            {/* ═══════════════════════════════════════════════════════════
                OFFICIAL PRINTABLE DOCUMENT (PAPER LOOK)
               ═══════════════════════════════════════════════════════════ */}
            <div
              id="aspirasi-printable-document"
              ref={printAreaRef}
              className="bg-white text-slate-900 border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden"
            >
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                <Building2 size={360} className="text-slate-900" />
              </div>

              {/* ── Official Letterhead (KOP SURAT) ── */}
              <div className="border-b-2 border-slate-900 pb-4 mb-5 text-center relative">
                <div className="flex items-center justify-center gap-4 sm:gap-6 mb-2">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                    <Image
                      src="/images/logo-1.png"
                      alt="Logo Provinsi Jawa Barat"
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xs sm:text-sm font-bold tracking-widest text-slate-700 uppercase">
                      Pemerintah Daerah Provinsi Jawa Barat
                    </h2>
                    <h1 className="text-sm sm:text-lg font-black tracking-tight text-slate-950 uppercase leading-snug">
                      DEWAN PERWAKILAN RAKYAT DAERAH
                    </h1>
                    <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                      Jl. Diponegoro No. 27, Citarum, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40115
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono">
                      Layanan Aspirasi Online Warga: hudang.dprd.jabarprov.go.id | Telp: (022) 4208000
                    </p>
                  </div>
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 hidden sm:block">
                    <Image
                      src="/images/dprd-logo.png"
                      alt="Logo DPRD Jawa Barat"
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>
                </div>
                {/* Double rule under letterhead */}
                <div className="border-t border-slate-900 mt-1" />
              </div>

              {/* ── Document Title & Official Badge ── */}
              <div className="text-center mb-6">
                <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5">
                  Tanda Bukti Registrasi Resmi
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                  SURAT BUKTI PENERIMAAN E-ASPIRASI MASYARAKAT
                </h3>
                <p className="text-xs text-slate-600 font-mono mt-0.5">
                  Nomor Registrasi: <span className="font-extrabold text-slate-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">{aspirasi.ticketNumber}</span>
                </p>
              </div>

              {/* ── Main Information Grid ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                
                {/* Left 2 Cols: Details Table */}
                <div className="md:col-span-2 space-y-3.5 text-xs text-slate-800">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Status Dokumen
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span className="font-black text-slate-900 text-xs sm:text-sm">
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 pb-1.5 border-b border-slate-200">
                      <span className="w-36 text-slate-500 font-semibold shrink-0">Waktu Pengajuan:</span>
                      <span className="font-bold text-slate-900">{formattedDate}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 pb-1.5 border-b border-slate-200">
                      <span className="w-36 text-slate-500 font-semibold shrink-0">Nama Pemohon:</span>
                      <span className="font-bold text-slate-900">
                        {aspirasi.masyarakat?.name || "Masyarakat Jawa Barat"}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 pb-1.5 border-b border-slate-200">
                      <span className="w-36 text-slate-500 font-semibold shrink-0">Daerah Pemilihan (Dapil):</span>
                      <span className="font-bold text-slate-900">{aspirasi.dapil}</span>
                    </div>

                    {(aspirasi.kabupatenKota || aspirasi.kecamatan) && (
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 pb-1.5 border-b border-slate-200">
                        <span className="w-36 text-slate-500 font-semibold shrink-0">Wilayah Administratif:</span>
                        <span className="font-bold text-slate-900">
                          {[aspirasi.kecamatan, aspirasi.kabupatenKota].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 pb-1.5 border-b border-slate-200">
                      <span className="w-36 text-slate-500 font-semibold shrink-0">Kategori Aspirasi:</span>
                      <span className="inline-block font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                        {aspirasi.kategori}
                      </span>
                    </div>

                    {aspirasi.dewan && (
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 pb-1.5 border-b border-slate-200">
                        <span className="w-36 text-slate-500 font-semibold shrink-0">Tujuan Komisi/Dewan:</span>
                        <span className="font-bold text-slate-900">
                          {aspirasi.dewan.name} {aspirasi.dewan.fraksi ? `(${aspirasi.dewan.fraksi})` : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Col: QR Code Box */}
                <div className="flex flex-col items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider mb-2">
                    QR Verifikasi Publik
                  </span>
                  
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`QR Code Tiket ${aspirasi.ticketNumber}`}
                        className="w-36 h-36 sm:w-40 sm:h-40 object-contain mx-auto"
                      />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                        Menyiapkan QR...
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-600 font-semibold mt-2 leading-tight">
                    Pindai dengan kamera ponsel untuk memantau progres aspirasi
                  </p>

                  <button
                    onClick={handleDownloadQr}
                    className="no-print mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 hover:text-slate-950 underline"
                  >
                    <Download size={11} />
                    <span>Unduh Gambar QR</span>
                  </button>
                </div>
              </div>

              {/* ── Content & Summary Box ── */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 mb-6 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Perihal / Judul Aspirasi
                </span>
                <p className="font-extrabold text-slate-950 text-sm mb-2 leading-snug">
                  {aspirasi.judul}
                </p>

                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Uraian Pokok Masalah
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs">
                  {aspirasi.deskripsi}
                </p>

                {aspirasi.materiUrl && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
                    <FileText size={13} className="text-emerald-600" />
                    <span>Lampiran Tersimpan: <strong>{aspirasi.materiFileName || "Materi Bukti Terunggah"}</strong></span>
                  </div>
                )}
              </div>

              {/* ── Verification Stamp & Security Note ── */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="max-w-md text-[10px] text-slate-500 leading-normal">
                  <p className="font-bold text-slate-700 mb-0.5">
                    Ketentuan & Bukti Otentik:
                  </p>
                  <p>
                    Surat ini merupakan bukti sah bahwa aspirasi masyarakat telah masuk ke dalam basis data Sekretariat DPRD Provinsi Jawa Barat dan akan ditelaah sesuai tata tertib serta masa persidangan dewan.
                  </p>
                </div>

                <div className="text-center shrink-0">
                  <div className="text-[10px] text-slate-500 mb-1">
                    Diterbitkan Secara Elektronik oleh:
                  </div>
                  <div className="font-extrabold text-xs text-slate-900 uppercase">
                    SEKRETARIAT DPRD PROV. JABAR
                  </div>
                  <div className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                    <ShieldCheck size={11} />
                    <span>TERVERIFIKASI SISTEM HUDANG</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Bottom Action Footer (Hidden in Print) ── */}
          <div className="no-print p-4 sm:p-5 border-t border-border/80 bg-card flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              Bagikan bukti atau tautan untuk transparansi publik dan pemantauan bersama warga
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
              {/* Copy Public Link */}
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-border bg-muted/60 hover:bg-muted text-foreground transition-all"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? "Tautan Tersalin!" : "Salin Link"}</span>
              </button>

              {/* Share WhatsApp */}
              <button
                onClick={handleShareWhatsapp}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95"
              >
                <Share2 size={14} />
                <span>Kirim WhatsApp</span>
              </button>

              {/* Open Public Tracking Page */}
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-all"
              >
                <ExternalLink size={14} />
                <span>Lihat Status Publik</span>
              </a>

              {/* Mobile Print Button */}
              <button
                onClick={handlePrint}
                className="sm:hidden flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white"
              >
                <Printer size={14} />
                <span>Cetak</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
