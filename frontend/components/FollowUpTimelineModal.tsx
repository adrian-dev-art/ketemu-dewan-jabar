"use client";

import React, { useState, useEffect } from "react";
import {
  X, CheckCircle2, Upload, FileText, Download, Printer, 
  Copy, Check, ExternalLink, Building2, User, Calendar, 
  ShieldCheck, AlertCircle, Sparkles, Eye, Trash2, Clock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface FollowUpData {
  id?: number;
  scheduleId: number;
  isShared: boolean;
  sharedTo?: string | null;
  sharedToEmail?: string | null;
  sharedBy?: string | null;
  sharedAt?: string | null;
  shareChannel?: string | null;
  shareNotes?: string | null;
  suratDisposisiNo?: string | null;
  suratDisposisiUrl?: string | null;
  suratDisposisiTgl?: string | null;
  isViewed: boolean;
  viewedBy?: string | null;
  viewedPosition?: string | null;
  viewedAt?: string | null;
  hasComment: boolean;
  recipientComment?: string | null;
  recipientName?: string | null;
  recipientPosition?: string | null;
  recipientCommentAt?: string | null;
  actionCategory?: string | null;
  suratTanggapanNo?: string | null;
  suratTanggapanUrl?: string | null;
  suratTanggapanTgl?: string | null;
  status: string; // pending, diproses, selesai, terkendala
  isCompleted: boolean;
  actionReport?: string | null;
  actionReportAt?: string | null;
  picName?: string | null;
  picContact?: string | null;
  evidenceUrl?: string | null;
  suratLaporanNo?: string | null;
  suratLaporanUrl?: string | null;
  suratLaporanTgl?: string | null;
  progressPercent: number;
  createdAt?: string;
  updatedAt?: string;
}

interface FollowUpTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: {
    id: number;
    title?: string;
    startTime?: string;
    masyarakat?: { 
      name?: string; 
      kabupaten?: string; 
      kecamatan?: string;
      instansi?: string;
      kategoriInstansi?: string;
      noWhatsapp?: string;
      daftarPeserta?: string;
    };
    participants?: Array<{ dewan?: { name?: string; fraksi?: string } }>;
    transcription?: string | null;
    analysis?: any;
    followUp?: FollowUpData | null;
  } | null;
  onUpdate?: (updated: FollowUpData) => void;
}

const JABAR_OPD_PRESETS = [
  "Dinas Bina Marga & Penataan Ruang (DBMPR) Prov. Jabar",
  "Dinas Perumahan & Permukiman (Disperkim) Prov. Jabar",
  "Dinas Pendidikan (Disdik) Prov. Jabar",
  "Dinas Kesehatan (Dinkes) Prov. Jabar",
  "Dinas Perhubungan (Dishub) Prov. Jabar",
  "Dinas Sosial (Dinsos) Prov. Jabar",
  "Dinas Lingkungan Hidup (DLH) Prov. Jabar",
  "Dinas ESDM Prov. Jabar",
  "Dinas Koperasi & Usaha Kecil (Diskuk) Prov. Jabar",
  "Bappeda Provinsi Jawa Barat",
  "Sekretariat DPRD Provinsi Jawa Barat",
  "Komisi I DPRD Jabar (Pemerintahan & Hukum)",
  "Komisi II DPRD Jabar (Perekonomian & Keuangan)",
  "Komisi III DPRD Jabar (Keuangan & Aset Daerah)",
  "Komisi IV DPRD Jabar (Pembangunan & Infrastruktur)",
  "Komisi V DPRD Jabar (Kesejahteraan Rakyat)",
  "Pemerintah Kabupaten / Kota Terkait",
  "Lainnya / Mitra Sektoral"
];

export default function FollowUpTimelineModal({
  isOpen,
  onClose,
  schedule,
  onUpdate
}: FollowUpTimelineModalProps) {
  const { token, user } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string>("");
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const [formData, setFormData] = useState<FollowUpData>({
    scheduleId: schedule?.id || 0,
    isShared: false,
    sharedTo: JABAR_OPD_PRESETS[0],
    sharedToEmail: "",
    sharedBy: "",
    sharedAt: null,
    shareChannel: "Disposisi Resmi",
    shareNotes: "",
    suratDisposisiNo: "",
    suratDisposisiUrl: "",
    suratDisposisiTgl: null,
    isViewed: false,
    viewedBy: "",
    viewedPosition: "",
    viewedAt: null,
    hasComment: false,
    recipientComment: "",
    recipientName: "",
    recipientPosition: "",
    recipientCommentAt: null,
    actionCategory: "Verifikasi Lapangan & Uji Teknis",
    suratTanggapanNo: "",
    suratTanggapanUrl: "",
    suratTanggapanTgl: null,
    status: "diproses",
    isCompleted: false,
    actionReport: "",
    actionReportAt: null,
    picName: "",
    picContact: "",
    evidenceUrl: "",
    suratLaporanNo: "",
    suratLaporanUrl: "",
    suratLaporanTgl: null,
    progressPercent: 50
  });

  const calculateProgress = (d: FollowUpData) => {
    let p = 0;
    if (d.suratDisposisiUrl || d.suratDisposisiNo || d.isShared) p += 35;
    if (d.suratTanggapanUrl || d.suratTanggapanNo || d.hasComment || d.recipientComment) p += 35;
    if (d.suratLaporanUrl || d.suratLaporanNo || d.isCompleted || d.status === "selesai") p += 30;
    return Math.min(100, Math.max(p, d.status === 'selesai' ? 100 : 25));
  };

  useEffect(() => {
    if (!isOpen || !schedule) return;

    const baseData: FollowUpData = schedule.followUp || {
      scheduleId: schedule.id,
      isShared: true,
      sharedTo: JABAR_OPD_PRESETS[0],
      sharedToEmail: "",
      sharedBy: user?.name || "Sekretariat DPRD Jawa Barat",
      sharedAt: new Date().toISOString(),
      shareChannel: "Disposisi Resmi",
      shareNotes: schedule.analysis?.summary ? `Catatan: ${schedule.analysis.summary}` : "",
      suratDisposisiNo: `045.2/${1000 + schedule.id}/DISP-DPRD/${new Date().getFullYear()}`,
      suratDisposisiUrl: "",
      suratDisposisiTgl: new Date().toISOString(),
      isViewed: true,
      viewedBy: "",
      viewedPosition: "",
      viewedAt: null,
      hasComment: false,
      recipientComment: "",
      recipientName: "",
      recipientPosition: "",
      recipientCommentAt: null,
      actionCategory: "Verifikasi Lapangan & Uji Teknis",
      suratTanggapanNo: "",
      suratTanggapanUrl: "",
      suratTanggapanTgl: null,
      status: "diproses",
      isCompleted: false,
      actionReport: "",
      actionReportAt: null,
      picName: "",
      picContact: "",
      evidenceUrl: "",
      suratLaporanNo: "",
      suratLaporanUrl: "",
      suratLaporanTgl: null,
      progressPercent: 50
    };

    baseData.progressPercent = calculateProgress(baseData);
    setFormData(baseData);

    if (token) {
      fetch(`${backendUrl}/api/schedules/${schedule.id}/follow-up`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((serverData) => {
          if (serverData) {
            serverData.progressPercent = calculateProgress(serverData);
            setFormData(serverData);
          }
        })
        .catch((err) => console.warn("Backend follow-up fetch notice:", err));
    }
  }, [isOpen, schedule, token, backendUrl, user]);

  if (!isOpen || !schedule) return null;

  const dewanNames = (schedule.participants || [])
    .map((p) => p.dewan?.name)
    .filter(Boolean)
    .join(", ") || "Pimpinan Komisi DPRD Jabar";

  const ormasName = schedule.masyarakat?.instansi || schedule.masyarakat?.name || "Ormas / Komunitas";
  const citizenKab = schedule.masyarakat?.kabupaten || "Jawa Barat";

  const handleSave = async (updatedFields?: Partial<FollowUpData>) => {
    setSaving(true);
    setSaveSuccess("");

    const mergedData: FollowUpData = {
      ...formData,
      ...(updatedFields || {}),
      scheduleId: schedule.id
    };

    mergedData.progressPercent = calculateProgress(mergedData);
    if (mergedData.status === 'selesai') {
      mergedData.isCompleted = true;
      mergedData.progressPercent = 100;
    }
    setFormData(mergedData);

    try {
      if (token) {
        const res = await fetch(`${backendUrl}/api/schedules/${schedule.id}/follow-up`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(mergedData)
        });
        if (res.ok) {
            const respData = await res.json();
            if (respData.followUp) {
                setFormData(respData.followUp);
                onUpdate?.(respData.followUp);
            }
        } else {
          onUpdate?.(mergedData);
        }
      } else {
        onUpdate?.(mergedData);
      }
      setSaveSuccess("Dokumen & status tindak lanjut berhasil diperbarui.");
      setTimeout(() => setSaveSuccess(""), 3500);
    } catch (err) {
      console.error("Save follow-up error:", err);
      onUpdate?.(mergedData);
      setSaveSuccess("Perubahan tersimpan.");
      setTimeout(() => setSaveSuccess(""), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, docType: 'disposisi' | 'tanggapan' | 'laporan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingType(docType);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileBase64 = reader.result as string;
        const res = await fetch(`${backendUrl}/api/public/upload-document`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileBase64,
            documentType: docType,
            scheduleId: schedule.id
          })
        });

        if (res.ok) {
          const resJson = await res.json();
          const now = new Date().toISOString();

          if (docType === 'disposisi') {
            await handleSave({
              suratDisposisiUrl: resJson.fileUrl,
              suratDisposisiNo: formData.suratDisposisiNo || `045.2/${1000 + schedule.id}/DISP-DPRD/${new Date().getFullYear()}`,
              suratDisposisiTgl: now,
              isShared: true
            });
          } else if (docType === 'tanggapan') {
            await handleSave({
              suratTanggapanUrl: resJson.fileUrl,
              suratTanggapanNo: formData.suratTanggapanNo || `600.${schedule.id}/TGL-OPD/${new Date().getFullYear()}`,
              suratTanggapanTgl: now,
              hasComment: true
            });
          } else if (docType === 'laporan') {
            await handleSave({
              suratLaporanUrl: resJson.fileUrl,
              suratLaporanNo: formData.suratLaporanNo || `BA-LAP/${schedule.id}/REALISASI/${new Date().getFullYear()}`,
              suratLaporanTgl: now,
              isCompleted: true,
              status: "selesai"
            });
          }
        }
      } catch (err) {
        console.error("File upload error:", err);
      } finally {
        setUploadingType(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const currentPercent = calculateProgress(formData);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[110] flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        <div className="px-6 sm:px-8 py-5 border-b border-border bg-gradient-to-r from-card via-card to-primary/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black shrink-0">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                  Tindak Lanjut Aspirasi
                </span>
                <span className="text-xs text-muted-foreground font-mono font-semibold">
                  #ASP-{schedule.id}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  formData.status === 'selesai' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-blue-500/15 text-blue-600'
                }`}>
                  {formData.status === 'selesai' ? 'Tuntas 100%' : 'Sedang Diproses'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground line-clamp-1 mt-0.5">
                {schedule.title || "Audiensi Aspirasi"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-3 bg-muted/20 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div>
              <span className="font-bold text-foreground">Pengusul:</span> {ormasName} ({citizenKab})
            </div>
            <div>
              <span className="font-bold text-foreground">Dewan:</span> {dewanNames}
            </div>
            <div>
              <span className="font-bold text-foreground">OPD Tujuan:</span> {formData.sharedTo || "Dinas Terkait"}
            </div>
          </div>

          <div className="flex items-center gap-2 font-bold text-foreground">
            <span>Progres:</span>
            <span className="text-primary font-black">{currentPercent}%</span>
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${currentPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {saveSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {/* SECTION 1: DOKUMEN DISPOSISI RESMI DPRD */}
          <div className="p-5 rounded-3xl bg-card border border-border space-y-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-black text-sm text-foreground">1. Surat Disposisi Resmi DPRD Jabar</h4>
                  <p className="text-xs text-muted-foreground">Diterbitkan oleh pimpinan/komisi DPRD untuk meneruskan aspirasi ke dinas terkait.</p>
                </div>
              </div>

              {formData.suratDisposisiUrl ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-black uppercase flex items-center gap-1">
                  <CheckCircle2 size={12} /> Berkas Terlampir
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-black uppercase">
                  Belum Ada Berkas
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Nomor Surat Disposisi DPRD
                </label>
                <input
                  type="text"
                  placeholder="045.2/xxxx/DISP-DPRD/2026"
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-mono font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                  value={formData.suratDisposisiNo || ""}
                  onChange={(e) => setFormData({ ...formData, suratDisposisiNo: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Perangkat Daerah (OPD) Penerima Disposisi
                </label>
                <select
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                  value={formData.sharedTo || JABAR_OPD_PRESETS[0]}
                  onChange={(e) => setFormData({ ...formData, sharedTo: e.target.value })}
                >
                  {JABAR_OPD_PRESETS.map((opd) => (
                    <option key={opd} value={opd}>{opd}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Catatan / Instruksi Disposisi
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan pengantar disposisi untuk penanganan teknis..."
                  className="w-full p-3 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  value={formData.shareNotes || ""}
                  onChange={(e) => setFormData({ ...formData, shareNotes: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs">
                    <Upload size={14} />
                    <span>{uploadingType === 'disposisi' ? 'Mengunggah...' : formData.suratDisposisiUrl ? 'Ganti File Surat Disposisi (.pdf)' : 'Unggah File Surat Disposisi (PDF)'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => handleUploadFile(e, 'disposisi')}
                    />
                  </label>

                  {formData.suratDisposisiUrl && (
                    <a
                      href={`${backendUrl}${formData.suratDisposisiUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold text-foreground flex items-center gap-1.5 border border-border"
                    >
                      <Eye size={14} />
                      <span>Lihat Berkas PDF</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                >
                  {saving ? "Menyimpan..." : "Simpan Disposisi"}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: DOKUMEN TANGGAPAN & TELAAHAN OPD */}
          <div className="p-5 rounded-3xl bg-card border border-border space-y-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-black text-sm text-foreground">2. Surat Tanggapan & Telaahan Teknis OPD</h4>
                  <p className="text-xs text-muted-foreground">Diterbitkan oleh dinas/instansi terkait sebagai respon resmi telaahan aspirasi.</p>
                </div>
              </div>

              {formData.suratTanggapanUrl ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-black uppercase flex items-center gap-1">
                  <CheckCircle2 size={12} /> Berkas Terlampir
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                  Opsional / Menunggu
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Nomor Surat Tanggapan OPD
                </label>
                <input
                  type="text"
                  placeholder="600/xxxx/DBMPR/2026"
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-mono font-medium text-foreground focus:ring-2 focus:ring-amber-500/20 outline-none"
                  value={formData.suratTanggapanNo || ""}
                  onChange={(e) => setFormData({ ...formData, suratTanggapanNo: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Pejabat / Penelaah Teknis
                </label>
                <input
                  type="text"
                  placeholder="Nama pejabat / Kabid OPD"
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-medium text-foreground focus:ring-2 focus:ring-amber-500/20 outline-none"
                  value={formData.recipientName || ""}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Ringkasan Tanggapan / Rencana Aksi Dinas
                </label>
                <textarea
                  rows={2}
                  placeholder="Uraian respon teknis, rencana survei lapangan, atau pengalokasian anggaran..."
                  className="w-full p-3 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-amber-500/20 outline-none resize-none"
                  value={formData.recipientComment || ""}
                  onChange={(e) => setFormData({ ...formData, recipientComment: e.target.value, hasComment: true })}
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs">
                    <Upload size={14} />
                    <span>{uploadingType === 'tanggapan' ? 'Mengunggah...' : formData.suratTanggapanUrl ? 'Ganti File Tanggapan' : 'Unggah Surat Tanggapan (PDF)'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => handleUploadFile(e, 'tanggapan')}
                    />
                  </label>

                  {formData.suratTanggapanUrl && (
                    <a
                      href={`${backendUrl}${formData.suratTanggapanUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold text-foreground flex items-center gap-1.5 border border-border"
                    >
                      <Eye size={14} />
                      <span>Lihat Berkas</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all"
                >
                  {saving ? "Menyimpan..." : "Simpan Tanggapan"}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: BERITA ACARA / LAPORAN REALISASI LAPANGAN */}
          <div className="p-5 rounded-3xl bg-card border border-border space-y-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-black text-sm text-foreground">3. Berita Acara & Laporan Realisasi Lapangan</h4>
                  <p className="text-xs text-muted-foreground">Bukti dokumen penyelesaian pengerjaan fisik atau realisasi bantuan di lapangan.</p>
                </div>
              </div>

              {formData.suratLaporanUrl ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-black uppercase flex items-center gap-1">
                  <CheckCircle2 size={12} /> Tuntas & Terlampir
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                  Opsional / Menunggu
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Nomor Berita Acara Realisasi
                </label>
                <input
                  type="text"
                  placeholder="BA-LAP/xxxx/REALISASI/2026"
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-mono font-medium text-foreground focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  value={formData.suratLaporanNo || ""}
                  onChange={(e) => setFormData({ ...formData, suratLaporanNo: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Status Penyelesaian Akhir
                </label>
                <select
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  value={formData.status}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    status: e.target.value,
                    isCompleted: e.target.value === 'selesai'
                  })}
                >
                  <option value="selesai">Selesai 100% (Tuntas Terealisasi)</option>
                  <option value="diproses">Sedang Diproses Lapangan</option>
                  <option value="pending">Menunggu Antrian OPD</option>
                  <option value="terkendala">Terkendala (Butuh Regulasi/APBD)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Uraian Realisasi Tindakan Lapangan
                </label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan pengerjaan yang telah dilakukan oleh tim teknis UPTD/Dinas..."
                  className="w-full p-3 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
                  value={formData.actionReport || ""}
                  onChange={(e) => setFormData({ ...formData, actionReport: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs">
                    <Upload size={14} />
                    <span>{uploadingType === 'laporan' ? 'Mengunggah...' : formData.suratLaporanUrl ? 'Ganti File Berita Acara' : 'Unggah Berita Acara (PDF/Foto)'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => handleUploadFile(e, 'laporan')}
                    />
                  </label>

                  {formData.suratLaporanUrl && (
                    <a
                      href={`${backendUrl}${formData.suratLaporanUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold text-foreground flex items-center gap-1.5 border border-border"
                    >
                      <Eye size={14} />
                      <span>Lihat Berkas</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                >
                  {saving ? "Menyimpan..." : "Simpan Berita Acara"}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 sm:px-8 py-4 bg-muted/30 border-t border-border flex items-center justify-between shrink-0">
          <p className="text-[11px] text-muted-foreground">
            Dokumen yang diunggah akan langsung dapat diakses publik di Landing Page secara transparan.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="px-4 py-2.5 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-xl text-xs font-bold transition-all"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90 transition-all"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
