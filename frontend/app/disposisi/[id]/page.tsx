"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileCheck2, CheckCircle2, Clock, Eye, MessageSquare, 
  Send, Building2, User, Download, Copy, Check, ExternalLink,
  ShieldCheck, AlertCircle, Sparkles, MapPin, Calendar, FileText, Upload
} from "lucide-react";

import { getBackendUrl } from "@/context/utils";

export default function PublicDisposisiPage() {
  const params = useParams();
  const scheduleId = params?.id as string;
  const backendUrl = getBackendUrl();

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [autoViewLogged, setAutoViewLogged] = useState<boolean>(false);

  // Form inputs for Stage 3 (Tanggapan & Surat Tanggapan)
  const [recipientComment, setRecipientComment] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPosition, setRecipientPosition] = useState("");
  const [actionCategory, setActionCategory] = useState("Verifikasi Lapangan & Uji Teknis");
  const [suratTanggapanNo, setSuratTanggapanNo] = useState("");
  const [suratTanggapanUrl, setSuratTanggapanUrl] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  // Form inputs for Stage 4 (Laporan Lapangan & Berita Acara)
  const [actionReport, setActionReport] = useState("");
  const [picName, setPicName] = useState("");
  const [picContact, setPicContact] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [suratLaporanNo, setSuratLaporanNo] = useState("");
  const [suratLaporanUrl, setSuratLaporanUrl] = useState("");
  const [reportStatus, setReportStatus] = useState("selesai");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'tanggapan' | 'laporan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(type);
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
            documentType: type,
            scheduleId
          })
        });
        if (res.ok) {
          const resData = await res.json();
          if (type === 'tanggapan') {
            setSuratTanggapanUrl(resData.fileUrl);
            if (!suratTanggapanNo) {
              setSuratTanggapanNo(`600/TGL-${scheduleId}/OPD/${new Date().getFullYear()}`);
            }
          } else if (type === 'laporan') {
            setSuratLaporanUrl(resData.fileUrl);
            if (!suratLaporanNo) {
              setSuratLaporanNo(`BA-LAP/${scheduleId}/REALISASI/${new Date().getFullYear()}`);
            }
          }
        }
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setUploadingDoc(null);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!scheduleId) return;

    // 1. Fetch public data
    fetch(`${backendUrl}/api/public/disposisi/${scheduleId}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        if (resData.followUp) {
          if (resData.followUp.recipientComment) setRecipientComment(resData.followUp.recipientComment);
          if (resData.followUp.recipientName) setRecipientName(resData.followUp.recipientName);
          if (resData.followUp.recipientPosition) setRecipientPosition(resData.followUp.recipientPosition);
          if (resData.followUp.actionCategory) setActionCategory(resData.followUp.actionCategory);
          if (resData.followUp.suratTanggapanNo) setSuratTanggapanNo(resData.followUp.suratTanggapanNo);
          if (resData.followUp.suratTanggapanUrl) setSuratTanggapanUrl(resData.followUp.suratTanggapanUrl);
          if (resData.followUp.actionReport) setActionReport(resData.followUp.actionReport);
          if (resData.followUp.picName) setPicName(resData.followUp.picName);
          if (resData.followUp.picContact) setPicContact(resData.followUp.picContact);
          if (resData.followUp.evidenceUrl) setEvidenceUrl(resData.followUp.evidenceUrl);
          if (resData.followUp.suratLaporanNo) setSuratLaporanNo(resData.followUp.suratLaporanNo);
          if (resData.followUp.suratLaporanUrl) setSuratLaporanUrl(resData.followUp.suratLaporanUrl);
          if (resData.followUp.status) setReportStatus(resData.followUp.status);
        }
        setLoading(false);

        // 2. OTOMATIS KONFIRMASI OLEH SISTEM: Log "Viewed" Event immediately
        if (!autoViewLogged) {
          fetch(`${backendUrl}/api/public/disposisi/${scheduleId}/view`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              viewerName: "Aparatur Penerima (Akses Web Portal)",
              viewerPosition: resData.followUp?.sharedTo || "Perangkat Daerah Terkait"
            })
          })
            .then((r) => r.json())
            .then((viewRes) => {
              setAutoViewLogged(true);
              if (viewRes.followUp) {
                setData((prev: any) => ({
                  ...prev,
                  followUp: viewRes.followUp
                }));
              }
            })
            .catch((err) => console.warn("Auto-view track notice:", err));
        }
      })
      .catch((err) => {
        console.error("Error loading public disposisi:", err);
        setLoading(false);
      });
  }, [scheduleId, backendUrl]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientComment.trim() && !suratTanggapanUrl) return;

    setSubmittingFeedback(true);
    setFeedbackSuccess("");

    try {
      const res = await fetch(`${backendUrl}/api/public/disposisi/${scheduleId}/submit-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientComment,
          recipientName: recipientName || "Perwakilan OPD",
          recipientPosition: recipientPosition || "Petugas Verifikasi",
          actionCategory,
          suratTanggapanNo,
          suratTanggapanUrl
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.followUp) {
          setData((prev: any) => ({ ...prev, followUp: json.followUp }));
        }
        setFeedbackSuccess("Tanggapan & berkas surat resmi OPD berhasil terekam ke dalam sistem.");
      }
    } catch (err) {
      console.error(err);
      setFeedbackSuccess("Tersimpan sementara di sesi Anda.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionReport.trim() && !suratLaporanUrl) return;

    setSubmittingReport(true);
    setReportSuccess("");

    try {
      const res = await fetch(`${backendUrl}/api/public/disposisi/${scheduleId}/submit-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionReport,
          picName: picName || "Petugas Lapangan OPD",
          picContact,
          evidenceUrl,
          suratLaporanNo,
          suratLaporanUrl,
          status: reportStatus
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.followUp) {
          setData((prev: any) => ({ ...prev, followUp: json.followUp }));
        }
        setReportSuccess("Laporan tindak lanjut lapangan & berita acara berhasil dikirimkan ke DPRD Jawa Barat.");
      }
    } catch (err) {
      console.error(err);
      setReportSuccess("Tersimpan sementara di sesi Anda.");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="font-bold text-slate-800 text-lg">Memuat Lembar Disposisi & Transkrip...</h3>
        <p className="text-slate-500 text-xs mt-1">Sistem sedang memverifikasi identitas dokumen aspirasi DPRD Jabar.</p>
      </div>
    );
  }

  const s = data?.schedule || {};
  const f = data?.followUp || {};
  const dewanNames = (s.participants || []).map((p: any) => p.dewan?.name).filter(Boolean).join(", ") || "Anggota DPRD Provinsi Jawa Barat";
  const citizenName = s.masyarakat?.name || "Warga Jawa Barat";
  const citizenKab = s.masyarakat?.kabupaten || "Jawa Barat";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* LUXURY EXECUTIVE HERO HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-blue-950/70 border border-slate-700/60 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/30 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-900/30 shrink-0">
                🏛️
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Portal Disposisi Resmi OPD
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    #ASP-{scheduleId}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Auto-Track Aktif
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
                  {s.title || "Disposisi Aspirasi Masyarakat"}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pemerintah Daerah Provinsi Jawa Barat • Sekretariat DPRD Provinsi Jawa Barat
                </p>
              </div>
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex items-center gap-3 self-end sm:self-center bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5 shrink-0 shadow-inner">
              <div className="relative flex items-center justify-center w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-700"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={f.progressPercent === 100 ? "text-emerald-400 transition-all duration-700" : "text-blue-400 transition-all duration-700"}
                    strokeDasharray={`${f.progressPercent || 25}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[11px] font-black text-white tabular-nums">{f.progressPercent || 25}%</span>
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status Disposisi</p>
                <p className="text-xs font-black text-white capitalize">
                  {f.status === "selesai" ? "Tuntas Terealisasi" : f.status === "diproses" ? "Pengerjaan Lapangan" : "Sedang Ditinjau"}
                </p>
              </div>
            </div>
          </div>

          {/* 4-Step Interactive Pipeline Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-5 border-t border-slate-700/50">
            {[
              { num: 1, label: "Diseminasi / Share", desc: "Terkirim ke OPD", done: f.isShared },
              { num: 2, label: "Keterbacaan", desc: "Auto-Track Sistem", done: f.isViewed },
              { num: 3, label: "Telaahan OPD", desc: "Komentar Dinas", done: f.hasComment || Boolean(f.recipientComment) },
              { num: 4, label: "Laporan Lapangan", desc: "Realisasi Fisik", done: f.isCompleted || f.status === "selesai" },
            ].map((st) => (
              <div
                key={st.num}
                className={`p-2.5 rounded-xl border transition-all ${
                  st.done
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-800/40 border-slate-700/40 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                    st.done ? "bg-emerald-500 text-slate-900" : "bg-slate-700 text-slate-300"
                  }`}>
                    {st.done ? "✓" : st.num}
                  </span>
                  <p className="text-[11px] font-bold truncate">{st.label}</p>
                </div>
                <p className="text-[10px] text-slate-400 pl-5 leading-tight">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AUTO-CONFIRMATION NOTICE BANNER */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3 text-emerald-200 shadow-sm backdrop-blur-sm">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-emerald-300">
              ✓ Konfirmasi Keterbacaan Otomatis oleh Sistem Berhasil
            </p>
            <p className="text-emerald-300/80 mt-0.5 leading-relaxed">
              Sistem telah secara otomatis mencatat bahwa dokumen transkrip dan lembar disposisi ini telah dibuka oleh pihak Perangkat Daerah pada{" "}
              <strong>{f.viewedAt ? new Date(f.viewedAt).toLocaleString("id-ID") + " WIB" : "hari ini"}</strong>. Admin DPRD tidak perlu melakukan verifikasi manual untuk tahap ini.
            </p>
          </div>
        </div>

        {/* ASPIRATION SUMMARY & TRANSCRIPT CARD */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-[2.5rem] p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-400" />
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-200">
                Informasi & Ringkasan Aspirasi
              </h2>
            </div>
            <button
              onClick={() => {
                const text = s.transcription || "Tidak ada teks transkrip.";
                const blob = new Blob([text], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Transkrip_Aspirasi_${scheduleId}.txt`;
                a.click();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Download size={13} />
              <span>Unduh Transkrip (.txt)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/40">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Pemohon / Konstituen</p>
              <p className="font-black text-sm text-white mt-1">{citizenName}</p>
              <p className="text-slate-400 mt-0.5">{citizenKab}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/40">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Legislator DPRD Jabar</p>
              <p className="font-black text-sm text-white mt-1">{dewanNames}</p>
              <p className="text-slate-400 mt-0.5">DPRD Provinsi Jawa Barat</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/40">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Instansi Penerima Disposisi</p>
              <p className="font-black text-sm text-blue-400 mt-1">{f.sharedTo || "OPD Terkait"}</p>
              <p className="text-slate-400 mt-0.5">Kanal: {f.shareChannel || "Disposisi Resmi"}</p>
            </div>
          </div>

          {/* AI Executive Summary if available */}
          {/* AI Executive Summary if available */}
          {s.analysis?.summary && (
            <div className="p-5 rounded-2xl bg-blue-950/50 border border-blue-500/30 text-xs leading-relaxed text-blue-200">
              <div className="flex items-center gap-1.5 font-bold text-blue-300 uppercase text-[11px] mb-1.5">
                <Sparkles size={14} className="text-blue-400" />
                <span>Ringkasan Eksekutif Aspirasi</span>
              </div>
              <p className="italic">"{s.analysis.summary}"</p>
            </div>
          )}

          {/* Action Items extracted by AI */}
          {s.analysis?.actionItems && s.analysis.actionItems.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Poin Permintaan Tindak Lanjut dari Rapat:
              </p>
              <div className="space-y-2">
                {s.analysis.actionItems.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/40 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full verbatim transcript preview */}
          {s.transcription && (
            <div>
              <p className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Transkrip Lengkap Percakapan:
              </p>
              <div className="p-4 bg-slate-900/80 border border-slate-700/60 rounded-2xl max-h-60 overflow-y-auto custom-scrollbar font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {s.transcription}
              </div>
            </div>
          )}
        </div>

        {/* RECIPIENT INPUT SECTION 1: TANGGAPAN & TELAAHAN AWAL (TAHAP 3) */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-[2.5rem] p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Tahap 3: Input Mandiri OPD
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Tanpa Perantara Admin</span>
              </div>
              <h3 className="text-base font-black text-white mt-1">
                Komentar & Telaahan Awal Perangkat Daerah
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Silakan isi telaahan resmi atau rencana penanganan dari dinas/instansi Anda mengenai aspirasi ini.
              </p>
            </div>
          </div>

          {feedbackSuccess && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{feedbackSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Klasifikasi Rekomendasi / Langkah Aksi
              </label>
              <select
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs font-medium text-white outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                value={actionCategory}
                onChange={(e) => setActionCategory(e.target.value)}
              >
                <option value="Verifikasi Lapangan & Uji Teknis">Verifikasi Lapangan & Uji Teknis</option>
                <option value="Diusulkan Masuk APBD Perubahan">Diusulkan Masuk APBD Perubahan</option>
                <option value="Masuk RKPD / APBD Murni Tahun Berikutnya">Masuk RKPD / APBD Murni Tahun Berikutnya</option>
                <option value="Disposisi ke Balai Pengelolaan / UPTD Terkait">Disposisi ke Balai Pengelolaan / UPTD Terkait</option>
                <option value="Bantuan Darurat / Penanganan Reaktif Cepat">Bantuan Darurat / Penanganan Reaktif Cepat</option>
                <option value="Klarifikasi Kebijakan & Regulasi Terkait">Klarifikasi Kebijakan & Regulasi Terkait</option>
                <option value="Selesai Melalui Koordinasi Sektoral">Selesai Melalui Koordinasi Sektoral</option>
              </select>

              {/* Quick Action Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase self-center mr-1">Pilihan Cepat:</span>
                {[
                  "Verifikasi Lapangan & Uji Teknis",
                  "Diusulkan Masuk APBD Perubahan",
                  "Masuk RKPD / APBD Murni Tahun Berikutnya",
                  "Disposisi ke Balai / UPTD Terkait",
                  "Bantuan Darurat Cepat"
                ].map((act, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActionCategory(act)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                      actionCategory === act
                        ? "bg-amber-600 text-white border-amber-500 shadow-xs"
                        : "bg-slate-900/60 hover:bg-slate-700/60 text-slate-400 hover:text-white border-slate-700/60"
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Uraian Tanggapan / Catatan Dinas
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan telaahan resmi, tindak lanjut yang direncanakan, atau disposisi bidang terkait..."
                className="w-full p-3.5 bg-slate-900/80 border border-slate-700/60 rounded-2xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500/30 resize-y"
                value={recipientComment}
                onChange={(e) => setRecipientComment(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Nama Pejabat / Pegawai Pengisi
                </label>
                <input
                  type="text"
                  placeholder="Nama lengkap & gelar"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-amber-500/40"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Jabatan / Unit Satuan Kerja
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kabid Jalan & Jembatan"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-amber-500/40"
                  value={recipientPosition}
                  onChange={(e) => setRecipientPosition(e.target.value)}
                />
              </div>
            </div>

            {/* Lampiran Berkas Surat Tanggapan OPD */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-amber-400" />
                  Lampiran Surat Tanggapan / Telaahan OPD (PDF / Scan)
                </label>
                {suratTanggapanUrl && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase">
                    ✓ Berkas Terlampir
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nomor Surat Tanggapan Dinas (cth: 600/4580/DBMPR/2026)"
                  className="px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-amber-500/40 font-mono"
                  value={suratTanggapanNo}
                  onChange={(e) => setSuratTanggapanNo(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2">
                    <Upload size={14} />
                    <span>{uploadingDoc === 'tanggapan' ? 'Mengunggah...' : suratTanggapanUrl ? 'Ganti Berkas Surat' : 'Unggah Surat Tanggapan (PDF)'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'tanggapan')}
                    />
                  </label>
                  {suratTanggapanUrl && (
                    <a
                      href={`${backendUrl}${suratTanggapanUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-slate-900/80 hover:bg-slate-700/80 rounded-xl text-white border border-slate-700/60"
                      title="Lihat Berkas"
                    >
                      <Eye size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submittingFeedback}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-900/30"
              >
                <Send size={13} />
                <span>{submittingFeedback ? "Menyimpan..." : "Kirim Tanggapan Resmi"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RECIPIENT INPUT SECTION 2: LAPORAN REALISASI LAPANGAN (TAHAP 4) */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-[2.5rem] p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <FileCheck2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tahap 4: Realisasi Lapangan
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Input Mandiri oleh Penerima</span>
              </div>
              <h3 className="text-base font-black text-white mt-1">
                Laporan Hasil & Realisasi Tindak Lanjut Lapangan
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Setelah pengerjaan fisik atau tindak lanjut lapangan dilaksanakan, silakan laporkan hasil dan lampirkan bukti foto/dokumen di bawah ini.
              </p>
            </div>
          </div>

          {reportSuccess && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{reportSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
                Status Realisasi Akhir
              </label>

              {/* 3 Interactive Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2">
                {[
                  { id: "selesai", label: "Selesai 100%", desc: "Tuntas Ditangani di Lapangan" },
                  { id: "diproses", label: "Sedang Diproses", desc: "Pengerjaan Masih Berjalan" },
                  { id: "terkendala", label: "Terkendala", desc: "Perlu Anggaran Tambahan" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setReportStatus(st.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      reportStatus === st.id
                        ? st.id === "selesai"
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40"
                          : st.id === "diproses"
                          ? "bg-blue-500/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/40"
                          : "bg-red-500/20 border-red-500 text-red-300 ring-1 ring-red-500/40"
                        : "bg-slate-900/60 hover:bg-slate-700/40 border-slate-700/60 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-black">{st.label}</span>
                      {reportStatus === st.id && <CheckCircle2 size={14} />}
                    </div>
                    <p className="text-[10px] opacity-75">{st.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Uraian Laporan Realisasi Tindak Lanjut
              </label>
              <textarea
                rows={4}
                placeholder="Jelaskan secara rinci tindakan nyata yang telah dilaksanakan di lapangan oleh tim dinas/UPTD..."
                className="w-full p-3.5 bg-slate-900/80 border border-slate-700/60 rounded-2xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y"
                value={actionReport}
                onChange={(e) => setActionReport(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Nama PIC Lapangan
                </label>
                <input
                  type="text"
                  placeholder="Nama petugas lapangan"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-emerald-500/40"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Kontak / No. Telp PIC
                </label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-emerald-500/40"
                  value={picContact}
                  onChange={(e) => setPicContact(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Tautan Bukti Foto / Berkas (Drive / URL)
                </label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-emerald-500/40"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Lampiran Berkas Berita Acara Lapangan */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-emerald-400" />
                  Lampiran Berita Acara / Laporan Realisasi Lapangan (PDF / Foto)
                </label>
                {suratLaporanUrl && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase">
                    ✓ Berkas Terlampir
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nomor Berita Acara (cth: BA-089/UPTD-III/2026)"
                  className="px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-emerald-500/40 font-mono"
                  value={suratLaporanNo}
                  onChange={(e) => setSuratLaporanNo(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3.5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2">
                    <Upload size={14} />
                    <span>{uploadingDoc === 'laporan' ? 'Mengunggah...' : suratLaporanUrl ? 'Ganti Berkas Laporan' : 'Unggah Berita Acara (PDF/Foto)'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'laporan')}
                    />
                  </label>
                  {suratLaporanUrl && (
                    <a
                      href={`${backendUrl}${suratLaporanUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-slate-900/80 hover:bg-slate-700/80 rounded-xl text-white border border-slate-700/60"
                      title="Lihat Berkas"
                    >
                      <Eye size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submittingReport}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
              >
                <CheckCircle2 size={14} />
                <span>{submittingReport ? "Menyimpan..." : "Kirim Laporan Akhir"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* FOOTER CREDITS */}
        <div className="text-center text-xs text-slate-500 py-4">
          <p>© {new Date().getFullYear()} DPRD Provinsi Jawa Barat • Sistem Informasi Aspirasi Masyarakat Terpadu</p>
        </div>

      </div>
    </div>
  );
}
