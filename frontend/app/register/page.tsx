"use client";

import React, { useState } from 'react';
import { 
  Building2, Users, Mail, Lock, User, AlertCircle, 
  Loader2, CheckCircle, MapPin, Globe, Compass, 
  Phone, Plus, Trash2, ShieldCheck, Sparkles 
} from 'lucide-react';
import Link from 'next/link';
import { getBackendUrl } from '@/context/utils';

const KATEGORI_ORGANISASI = [
  "Organisasi Kemasyarakatan (Ormas)",
  "Lembaga Swadaya Masyarakat (LSM)",
  "Asosiasi / Paguyuban Profesi",
  "Kelompok Tani & Nelayan",
  "Lembaga Pendidikan / Kampus / BEM",
  "Organisasi Kepemudaan / Karang Taruna",
  "Komunitas Warga / Paguyuban Adat",
  "Koperasi / BUMDes / Pelaku UMKM",
  "Instansi / Lembaga Lainnya"
];

const JABAR_REGENCY_OPTIONS = [
  "Kota Bandung", "Kab. Bandung", "Kab. Bandung Barat", "Kota Cimahi",
  "Kota Bogor", "Kab. Bogor", "Kota Depok", "Kota Bekasi", "Kab. Bekasi",
  "Kota Sukabumi", "Kab. Sukabumi", "Kab. Cianjur", "Kab. Karawang",
  "Kab. Purwakarta", "Kab. Subang", "Kota Cirebon", "Kab. Cirebon",
  "Kab. Indramayu", "Kab. Majalengka", "Kab. Kuningan", "Kab. Sumedang",
  "Kota Tasikmalaya", "Kab. Tasikmalaya", "Kab. Garut", "Kab. Ciamis",
  "Kota Banjar", "Kab. Pangandaran"
];

export default function RegisterPage() {
  // Form States
  const [instansi, setInstansi] = useState('');
  const [kategoriInstansi, setKategoriInstansi] = useState(KATEGORI_ORGANISASI[0]);
  const [name, setName] = useState(''); // Nama PIC
  const [noWhatsapp, setNoWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [noKtp, setNoKtp] = useState('');
  const [kabupaten, setKabupaten] = useState(JABAR_REGENCY_OPTIONS[0]);
  const [kecamatan, setKecamatan] = useState('');
  const [alamat, setAlamat] = useState('');
  const [provinsi, setProvinsi] = useState('Jawa Barat');

  // Dynamic Attendees List
  const [pesertaList, setPesertaList] = useState<string[]>([
    "Ketua Delegasi",
    "Sekretaris / Notulen"
  ]);
  const [newPeserta, setNewPeserta] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPeserta = () => {
    if (!newPeserta.trim()) return;
    setPesertaList([...pesertaList, newPeserta.trim()]);
    setNewPeserta('');
  };

  const handleRemovePeserta = (index: number) => {
    setPesertaList(pesertaList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!instansi.trim()) {
      setError('Mohon cantumkan nama lembaga / ormas / instansi Anda.');
      setIsSubmitting(false);
      return;
    }

    if (!noWhatsapp.trim()) {
      setError('Nomor WhatsApp aktif penanggung jawab wajib diisi.');
      setIsSubmitting(false);
      return;
    }

    const compiledPeserta = pesertaList.filter(Boolean).join('\n');

    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, // Nama PIC
          email,
          password,
          noKtp,
          instansi,
          kategoriInstansi,
          noWhatsapp,
          daftarPeserta: compiledPeserta,
          kabupaten,
          kecamatan,
          alamat,
          provinsi
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat pendaftaran.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 my-10">
        <div className="w-full max-w-lg">
          <div className="border border-border rounded-3xl p-8 sm:p-10 bg-card flex flex-col items-center text-center shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-5 ring-4 ring-emerald-500/20">
              <CheckCircle size={32} />
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 mb-2">
              Akun Lembaga Terverifikasi
            </span>
            <h2 className="text-2xl font-black tracking-tight text-foreground">Pendaftaran Organisasi Berhasil</h2>
            <p className="text-muted-foreground text-sm mt-2 mb-6 leading-relaxed">
              Akun lembaga <strong>{instansi}</strong> telah berhasil dibuat. Silakan masuk untuk mulai mengajukan jadwal audiensi dan menyampaikan aspirasi ke DPRD Provinsi Jawa Barat.
            </p>
            <Link 
              href="/login" 
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center text-sm shadow-md"
            >
              Masuk ke Portal Lembaga
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-6 my-10">
      <div className="w-full max-w-2xl">
        <div className="border border-border rounded-[2.5rem] p-6 sm:p-10 bg-card shadow-2xl relative overflow-hidden">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 ring-8 ring-primary/5">
              <Building2 size={26} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={13} />
              Khusus Instansi / Ormas / Lembaga
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Registrasi Lembaga & Ormas
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 max-w-md">
              Pendaftaran akun resmi bagi perwakilan Organisasi Kemasyarakatan, LSM, Paguyuban, Asosiasi, dan Komunitas Warga Jawa Barat.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* BAGIAN 1: IDENTITAS LEMBAGA / ORMAS */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/70 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Building2 size={15} className="text-primary" />
                1. Profil Lembaga / Organisasi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nama Lengkap Lembaga / Ormas / Komunitas <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={instansi}
                    onChange={(e) => setInstansi(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs sm:text-sm font-medium"
                    placeholder="Contoh: DPD KNPI Jawa Barat / LSM Bina Warga Garut"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Kategori Entitas / Organisasi <span className="text-red-500">*</span></label>
                  <select
                    value={kategoriInstansi}
                    onChange={(e) => setKategoriInstansi(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs sm:text-sm font-medium"
                  >
                    {KATEGORI_ORGANISASI.map((kat) => (
                      <option key={kat} value={kat}>{kat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* BAGIAN 2: PENANGGUNG JAWAB (PIC) & WHATSAPP AKTIF */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/70 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <User size={15} className="text-emerald-500" />
                2. Penanggung Jawab (PIC Delegasi)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nama PIC / Ketua Delegasi <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs sm:text-sm font-medium"
                    placeholder="Nama lengkap PIC & Gelar"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Phone size={13} />
                    Nomor WhatsApp Aktif PIC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={noWhatsapp}
                    onChange={(e) => setNoWhatsapp(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-background border border-emerald-500/40 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-xs sm:text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300"
                    placeholder="0812-xxxx-xxxx"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">Digunakan untuk konfirmasi jadwal video conference dan penerimaan surat resmi disposisi.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Email Resmi Organisasi / PIC <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs sm:text-sm font-medium"
                    placeholder="sekretariat@ormas-jabar.org"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Kata Sandi Akun <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs sm:text-sm font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {/* BAGIAN 3: DAFTAR NAMA-NAMA PESERTA / DELEGASI */}
            <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Users size={15} className="text-blue-500" />
                  3. Daftar Nama Peserta / Anggota Delegasi Sesi
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black">
                  {pesertaList.length} Peserta
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Daftar perwakilan atau pengurus yang akan hadir dalam ruang video rapat aspirasi bersama anggota DPRD.
              </p>

              {/* Input New Attendee */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPeserta}
                  onChange={(e) => setNewPeserta(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPeserta();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 bg-background border border-border rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Ketik nama peserta & jabatan (cth: Bpk. Dani Sukma - Divisi Advokasi)"
                />
                <button
                  type="button"
                  onClick={handleAddPeserta}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1 shrink-0"
                >
                  <Plus size={14} />
                  <span>Tambah</span>
                </button>
              </div>

              {/* List of Attendees */}
              <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar">
                {pesertaList.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-card border border-border/80 rounded-xl text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-foreground">{p}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePeserta(idx)}
                      className="p-1 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-all"
                      title="Hapus Peserta"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* BAGIAN 4: DOMISILI SEKRETARIAT */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/70 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <MapPin size={15} className="text-primary" />
                4. Domisili Kantor / Sekretariat Organisasi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Kabupaten / Kota (Jawa Barat) <span className="text-red-500">*</span></label>
                  <select
                    value={kabupaten}
                    onChange={(e) => setKabupaten(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs sm:text-sm font-medium"
                  >
                    {JABAR_REGENCY_OPTIONS.map((reg) => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Kecamatan <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs sm:text-sm font-medium"
                    placeholder="Contoh: Coblong / Sumur Bandung"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Alamat Lengkap Kantor Sekretariat <span className="text-red-500">*</span></label>
                  <textarea
                    rows={2}
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    className="block w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs sm:text-sm font-medium resize-none"
                    placeholder="Jl. Raya No. ..., RT 01/RW 02..."
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-blue-700 hover:from-primary/90 hover:to-blue-800 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Mendaftarkan Lembaga...</span>
                </>
              ) : (
                <>
                  <span>Daftarkan Lembaga & Dapatkan Akun</span>
                  <Building2 size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground font-medium">
              Sudah memiliki akun lembaga?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Masuk di Sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
