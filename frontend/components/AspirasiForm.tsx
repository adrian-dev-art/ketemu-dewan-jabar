"use client";

import React, { useState, useMemo } from "react";
import {
  MapPin,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Send,
  X,
  Film,
  Loader2,
} from "lucide-react";

export const DAPIL_JABAR_LIST = [
  { id: "DAPIL I", name: "DAPIL I (Kota Bandung & Kota Cimahi)", kabKota: "Kota Bandung, Kota Cimahi" },
  { id: "DAPIL II", name: "DAPIL II (Kabupaten Bandung)", kabKota: "Kabupaten Bandung" },
  { id: "DAPIL III", name: "DAPIL III (Kabupaten Bandung Barat)", kabKota: "Kabupaten Bandung Barat" },
  { id: "DAPIL IV", name: "DAPIL IV (Kabupaten Cianjur)", kabKota: "Kabupaten Cianjur" },
  { id: "DAPIL V", name: "DAPIL V (Kabupaten & Kota Sukabumi)", kabKota: "Kabupaten Sukabumi, Kota Sukabumi" },
  { id: "DAPIL VI", name: "DAPIL VI (Kabupaten Bogor)", kabKota: "Kabupaten Bogor" },
  { id: "DAPIL VII", name: "DAPIL VII (Kota Bogor)", kabKota: "Kota Bogor" },
  { id: "DAPIL VIII", name: "DAPIL VIII (Kota Depok & Kota Bekasi)", kabKota: "Kota Depok, Kota Bekasi" },
  { id: "DAPIL IX", name: "DAPIL IX (Kabupaten Bekasi)", kabKota: "Kabupaten Bekasi" },
  { id: "DAPIL X", name: "DAPIL X (Kab Karawang & Purwakarta)", kabKota: "Kabupaten Karawang, Kabupaten Purwakarta" },
  { id: "DAPIL XI", name: "DAPIL XI (Kab Subang, Sumedang & Majalengka)", kabKota: "Kabupaten Subang, Kabupaten Sumedang, Kabupaten Majalengka" },
  { id: "DAPIL XII", name: "DAPIL XII (Kab & Kota Cirebon, Kab Indramayu)", kabKota: "Kabupaten Cirebon, Kota Cirebon, Kabupaten Indramayu" },
  { id: "DAPIL XIII", name: "DAPIL XIII (Kab Kuningan, Ciamis, Pangandaran & Kota Banjar)", kabKota: "Kabupaten Kuningan, Kabupaten Ciamis, Kabupaten Pangandaran, Kota Banjar" },
  { id: "DAPIL XIV", name: "DAPIL XIV (Kab Garut)", kabKota: "Kabupaten Garut" },
  { id: "DAPIL XV", name: "DAPIL XV (Kab & Kota Tasikmalaya)", kabKota: "Kabupaten Tasikmalaya, Kota Tasikmalaya" },
];

export const KATEGORI_ASPIRASI = [
  "Infrastruktur Jalan & Jembatan",
  "Pendidikan & Sarana Sekolah",
  "Pelayanan Kesehatan & Rumah Sakit",
  "Lingkungan Hidup & Pengelolaan Sampah",
  "Pertanian, Irigasi & Ketahanan Pangan",
  "Ekonomi, Koperasi & UMKM",
  "Sosial, Ketenagakerjaan & Kemiskinan",
  "Tata Kelola Pemerintahan & Pelayanan Publik",
  "Lainnya",
];

interface AspirasiFormProps {
  dewanList?: any[];
  token: string;
  backendUrl: string;
  user?: { kabupaten?: string | null; kecamatan?: string | null } | null;
  onSuccess: (newAspirasi: any) => void;
  onCancel: () => void;
}

export default function AspirasiForm({
  dewanList = [],
  token,
  backendUrl,
  user,
  onSuccess,
  onCancel,
}: AspirasiFormProps) {
  const [selectedDapil, setSelectedDapil] = useState("");
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState(KATEGORI_ASPIRASI[0]);
  const [deskripsi, setDeskripsi] = useState("");
  const [alamat, setAlamat] = useState("");
  const [selectedDewanId, setSelectedDewanId] = useState<number | null>(null);

  // File State
  const [materiFile, setMateriFile] = useState<File | null>(null);
  const [materiPreviewUrl, setMateriPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [uploadedMateriMeta, setUploadedMateriMeta] = useState<{
    fileUrl: string;
    fileName: string;
    originalName: string;
    materiType: string;
    sizeBytes: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Anggota dewan yang sesuai dengan Dapil terpilih
  const filteredDewans = useMemo(() => {
    if (!selectedDapil) return [];
    const dapilCode = selectedDapil.split(" ")[1] || selectedDapil; // e.g. "X" or "DAPIL X"
    return dewanList.filter((d) => {
      if (!d.dapil) return false;
      return d.dapil.toLowerCase().includes(selectedDapil.toLowerCase()) ||
        d.dapil.toLowerCase().includes(dapilCode.toLowerCase());
    });
  }, [selectedDapil, dewanList]);

  // Handle Berkas Input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("Ukuran berkas melebihi batas maksimum 50MB.");
      return;
    }

    setErrorMessage("");
    setMateriFile(file);
    setUploadedMateriMeta(null);

    // Pratinjau lokal
    const preview = URL.createObjectURL(file);
    setMateriPreviewUrl(preview);
  };

  const removeSelectedFile = () => {
    setMateriFile(null);
    setMateriPreviewUrl(null);
    setUploadedMateriMeta(null);
  };

  const uploadFileToBackend = async (file: File): Promise<{
    fileUrl: string;
    fileName: string;
    originalName: string;
    materiType: string;
    sizeBytes: number;
  }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const fileBase64 = reader.result as string;
          setUploadProgress("Mengunggah berkas materi ke server...");

          const res = await fetch(`${backendUrl}/api/aspirasi/upload-materi`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fileName: file.name,
              fileBase64,
            }),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Gagal mengunggah berkas materi.");
          }

          const data = await res.json();
          resolve(data);
        } catch (err: any) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Gagal membaca berkas materi."));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDapil) {
      setErrorMessage("Silakan pilih Daerah Pemilihan (Dapil).");
      return;
    }
    if (!judul.trim()) {
      setErrorMessage("Silakan isi judul aspirasi.");
      return;
    }
    if (!deskripsi.trim()) {
      setErrorMessage("Silakan isi uraian deskripsi aspirasi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let materiData = uploadedMateriMeta;

      if (materiFile && !materiData) {
        materiData = await uploadFileToBackend(materiFile);
        setUploadedMateriMeta(materiData);
      }

      setUploadProgress("Menyimpan permohonan aspirasi resmi...");

      const payload = {
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        kategori,
        dapil: selectedDapil,
        kabupatenKota: user?.kabupaten || undefined,
        kecamatan: user?.kecamatan || undefined,
        alamat: alamat.trim() || undefined,
        dewanId: selectedDewanId || undefined,
        materiUrl: materiData?.fileUrl,
        materiType: materiData?.materiType,
        materiFileName: materiData?.fileName || materiFile?.name,
        materiSize: materiData?.sizeBytes || materiFile?.size,
      };

      const res = await fetch(`${backendUrl}/api/aspirasi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Gagal menyimpan aspirasi.");
      }

      const created = await res.json();
      onSuccess(created);
    } catch (err: any) {
      console.error("Error submitting aspirasi:", err);
      setErrorMessage(err.message || "Terjadi kesalahan saat mengirim aspirasi.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground tracking-tight">
              Formulir E-Aspirasi Warga
            </h3>
            <p className="text-xs text-muted-foreground">
              Sampaikan usulan pembangunan, keluhan, dan laporan masyarakat disertai bukti berkas
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted-foreground hover:text-foreground font-semibold px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          Batalkan
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-300 text-xs font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAHAP 1: PILIH DAPIL */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
              1
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Pilih Daerah Pemilihan (Dapil) Jawa Barat <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 border border-border rounded-xl bg-muted/20">
            {DAPIL_JABAR_LIST.map((dapil) => {
              const isSelected = selectedDapil === dapil.id;
              return (
                <button
                  key={dapil.id}
                  type="button"
                  onClick={() => {
                    setSelectedDapil(dapil.id);
                    setSelectedDewanId(null);
                  }}
                  className={`p-3 rounded-xl text-left transition-all border ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500"
                      : "bg-card border-border hover:border-emerald-500/40 text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">{dapil.id}</span>
                    {isSelected && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    {dapil.kabKota}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedDapil && (
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              <span>Dapil Terpilih: {DAPIL_JABAR_LIST.find((d) => d.id === selectedDapil)?.name}</span>
            </p>
          )}

          {/* Opsi Opsional: Pilih Dewan Spesifik dari Dapil */}
          {selectedDapil && filteredDewans.length > 0 && (
            <div className="p-3 bg-muted/40 border border-border rounded-xl mt-3 space-y-2">
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Tujukan ke Anggota Dewan Tertentu (Opsional)
              </label>
              <select
                value={selectedDewanId || ""}
                onChange={(e) => setSelectedDewanId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/30 outline-none text-foreground"
              >
                <option value="">Semua Anggota Dewan di {selectedDapil}</option>
                {filteredDewans.map((dewan) => (
                  <option key={dewan.id} value={dewan.id}>
                    {dewan.name} ({dewan.fraksi || "DPRD Jabar"})
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        {/* TAHAP 2: RINCIAN ASPIRASI */}
        <section className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
              2
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Rincian Usulan &amp; Permasalahan Aspirasi <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Judul Aspirasi / Pokok Usulan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Cth: Usulan Perbaikan Ruas Jalan Provinsi di Cidaun"
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Kategori Sektor
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none text-foreground"
              >
                {KATEGORI_ASPIRASI.map((kat) => (
                  <option key={kat} value={kat}>
                    {kat}
                  </option>
                ))}
              </select>
            </div>
          </div>


          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Deskripsi Lengkap Aspirasi / Kronologi Permasalahan <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Uraikan kondisi riil di lapangan, dampak bagi masyarakat luas, serta harapan tindakan konkret dari DPRD Provinsi Jawa Barat..."
              className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none text-foreground leading-relaxed"
              required
            />
          </div>
        </section>

        {/* TAHAP 3: UPLOAD MATERI ASPIRASI (VIDEO, PDF, DOKUMEN, FOTO) */}
        <section className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Unggah Berkas Materi Aspirasi (Video, Dokumen PDF, atau Foto)
              </label>
            </div>
            <span className="text-[11px] text-muted-foreground">Maksimum 50MB</span>
          </div>

          {!materiFile ? (
            <div className="border-2 border-dashed border-border hover:border-emerald-500/50 rounded-2xl p-6 text-center transition-colors bg-muted/20">
              <input
                type="file"
                id="materi-file-input"
                accept=".pdf,.doc,.docx,.mp4,.webm,.mov,.mkv,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="materi-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-foreground">
                    Klik untuk memilih berkas atau seret berkas ke sini
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Mendukung: Video (MP4, WEBM, MOV), Dokumen PDF/Word, dan Foto Lapangan (JPG, PNG)
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="p-4 bg-muted/50 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  {materiFile.type.includes("video") ? (
                    <Film size={20} />
                  ) : materiFile.type.includes("pdf") ? (
                    <FileText size={20} />
                  ) : (
                    <FileCheck size={20} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">{materiFile.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {(materiFile.size / (1024 * 1024)).toFixed(2)} MB • {materiFile.type || "Berkas Materi"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {materiFile.type.includes("video") && materiPreviewUrl && (
                  <span className="px-2.5 py-1 rounded text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Video Siap Unggah
                  </span>
                )}
                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Hapus berkas"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Pratinjau Video jika berkas adalah video */}
          {materiFile && materiFile.type.includes("video") && materiPreviewUrl && (
            <div className="mt-2 rounded-xl overflow-hidden border border-border bg-black max-w-md">
              <video
                src={materiPreviewUrl}
                controls
                className="w-full max-h-56 object-contain"
              />
            </div>
          )}
        </section>

        {/* SUBMIT ACTION BAR */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {uploadProgress ? (
              <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Loader2 size={14} className="animate-spin" />
                {uploadProgress}
              </span>
            ) : (
              <span>Nomor Registrasi Tiket Aspirasi akan diterbitkan secara otomatis.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-border text-foreground text-xs font-bold hover:bg-muted transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedDapil || !judul.trim() || !deskripsi.trim()}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
                isSubmitting || !selectedDapil || !judul.trim() || !deskripsi.trim()
                  ? "bg-muted-foreground/30 text-muted-foreground cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-sm"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Kirim E-Aspirasi Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
