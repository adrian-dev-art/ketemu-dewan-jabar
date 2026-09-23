"use client";

import React from "react";
import { Video, FileText, ArrowRight, CheckCircle2, Clock, ShieldCheck, Users, HelpCircle, UploadCloud } from "lucide-react";

interface ServiceChoiceCardsProps {
  onSelectAudiensi: () => void;
  onSelectAspirasi: () => void;
  activeService?: "audiensi" | "aspirasi" | null;
}

export default function ServiceChoiceCards({
  onSelectAudiensi,
  onSelectAspirasi,
  activeService,
}: ServiceChoiceCardsProps) {
  return (
    <div className="space-y-6">
      {/* Header Pengantar Layanan */}
      <div className="text-center max-w-2xl mx-auto mb-2">
        <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded-full inline-block mb-2">
          Pilihan Saluran Layanan Masyarakat
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Pilih Bentuk Partisipasi Aspirasi Anda
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Sekretariat DPRD Provinsi Jawa Barat menyediakan dua jalur resmi bagi masyarakat untuk menyampaikan suara pembangunan daerah.
        </p>
      </div>

      {/* 2 Opsi Button Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CARD 1: E-AUDIENSI */}
        <div
          className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 bg-card ${
            activeService === "audiensi"
              ? "border-primary ring-2 ring-primary/20 shadow-md"
              : "border-border hover:border-primary/50 shadow-xs hover:shadow-md"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Video size={24} />
              </div>
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                Tatap Muka Virtual
              </span>
            </div>

            <div>
              <h4 className="text-lg font-black text-foreground tracking-tight">
                E-Audiensi Dewan
              </h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Musyawarah resmi daring (tatap muka virtual langsung) bersama Anggota DPRD Provinsi Jawa Barat melalui video konferensi interaktif terenkripsi.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Dialog langsung dua arah (Live video call)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                <Clock size={14} className="text-blue-500 shrink-0" />
                <span>Memilih slot jadwal ketersediaan dewan (45–60 menit)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                <ShieldCheck size={14} className="text-primary shrink-0" />
                <span>Notulensi risalah otomatis kecerdasan buatan (Gemini AI)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                <Users size={14} className="text-indigo-500 shrink-0" />
                <span>Pengawalan disposisi 4 tahap Perangkat Daerah (OPD)</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-border">
            <button
              type="button"
              onClick={onSelectAudiensi}
              className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs ${
                activeService === "audiensi"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-muted hover:bg-primary hover:text-white text-foreground"
              }`}
            >
              <span>Jadwalkan E-Audiensi</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD 2: E-ASPIRASI */}
        <div
          className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 bg-card ${
            activeService === "aspirasi"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
              : "border-border hover:border-emerald-500/50 shadow-xs hover:shadow-md"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileText size={24} />
              </div>
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                Penyampaian Mandiri
              </span>
            </div>

            <div>
              <h4 className="text-lg font-black text-foreground tracking-tight">
                E-Aspirasi Warga
              </h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Penyampaian usulan, laporan keluhan lapangan, atau aspirasi pembangunan daerah secara mandiri tanpa tatap muka langsung, dapat diajukan kapan saja.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Bebas diajukan kapan saja tanpa menunggu slot jam</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                <Users size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Pilih Daerah Pemilihan (15 Dapil Jawa Barat)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                <UploadCloud size={14} className="text-teal-500 shrink-0" />
                <span>Unggah materi berkas lengkap (Video MP4, Dokumen PDF, Foto)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                <Clock size={14} className="text-emerald-500 shrink-0" />
                <span>Pelacakan Timeline Tindak Lanjut hingga tanggapan dewan</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-border">
            <button
              type="button"
              onClick={onSelectAspirasi}
              className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs ${
                activeService === "aspirasi"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-muted hover:bg-emerald-600 hover:text-white text-foreground"
              }`}
            >
              <span>Ajukan E-Aspirasi</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Komparasi Edukatif Panduan Pemilihan */}
      <div className="p-4 bg-muted/40 border border-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <HelpCircle size={16} />
          </div>
          <div>
            <p className="font-bold text-foreground">Panduan Pemilihan Jalur Layanan</p>
            <p className="text-muted-foreground mt-0.5 leading-relaxed">
              Gunakan <strong>E-Audiensi</strong> bila Anda ingin berdiskusi interaktif secara langsung dengan legislator. Gunakan <strong>E-Aspirasi</strong> bila Anda ingin menyampaikan usulan pembangunan atau laporan kerusakan fisik dengan melampirkan video atau berkas dokumen yang dapat langsung ditelaah oleh legislator di daerah pemilihan Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
