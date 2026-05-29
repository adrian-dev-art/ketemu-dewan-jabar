"use client";

import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, CheckCircle, MapPin, Building, Globe, Compass } from 'lucide-react';
import Link from 'next/link';
import { getBackendUrl } from '@/context/utils';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [noKtp, setNoKtp] = useState('');
  const [instansi, setInstansi] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kabupaten, setKabupaten] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [provinsi, setProvinsi] = useState('Jawa Barat');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          noKtp,
          instansi,
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
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="border border-border rounded-2xl p-6 sm:p-8 bg-card flex flex-col items-center text-center shadow-xl">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <CheckCircle size={24} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Pendaftaran Berhasil</h2>
            <p className="text-muted-foreground text-sm mt-2 mb-6">
              Akun Anda telah berhasil dibuat. Silakan masuk untuk mulai menggunakan layanan.
            </p>
            <Link 
              href="/login" 
              className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center text-sm"
            >
              Ke Halaman Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-6 my-8">
      <div className="w-full max-w-xl">
        <div className="border border-border rounded-3xl p-6 sm:p-8 bg-card shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <UserPlus size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-center">Daftar Baru</h2>
            <p className="text-muted-foreground text-sm mt-1">Bergabunglah dengan platform aspirasi rakyat</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Nama & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm placeholder:text-muted-foreground"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-muted-foreground" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm placeholder:text-muted-foreground"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Password & NIK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-muted-foreground" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm placeholder:text-muted-foreground"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nomor KTP (NIK)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={noKtp}
                    onChange={(e) => setNoKtp(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm placeholder:text-muted-foreground"
                    placeholder="327xxxxxxxxxxxx"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Instansi & Provinsi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Instansi / Ormas</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building size={16} className="text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={instansi}
                    onChange={(e) => setInstansi(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm placeholder:text-muted-foreground"
                    placeholder="Nama Instansi/Kelompok"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Provinsi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe size={16} className="text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={provinsi}
                    onChange={(e) => setProvinsi(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm placeholder:text-muted-foreground"
                    placeholder="Contoh: Jawa Barat"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Kota/Kabupaten & Kecamatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Kota / Kabupaten</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building size={16} className="text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={kabupaten}
                    onChange={(e) => setKabupaten(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm placeholder:text-muted-foreground"
                    placeholder="Contoh: KOTA BANDUNG atau BOGOR"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Kecamatan</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Compass size={16} className="text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm placeholder:text-muted-foreground"
                    placeholder="Contoh: Coblong"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Alamat Lengkap */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Alamat Lengkap</label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <MapPin size={16} className="text-muted-foreground" />
                </div>
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 min-h-[80px] bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm placeholder:text-muted-foreground resize-none"
                  placeholder="Jl. Dago No. 123, RT 01/RW 02..."
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white font-medium py-3 rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                <>
                  Daftar Sekarang
                  <UserPlus size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
