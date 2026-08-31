# Dokumen Desain Teknis: Modularisasi Arsitektur, Penguatan Keamanan, dan Optimasi Antarmuka

Tanggal: 31 Agustus 2026  
Topik: Modularisasi Backend & Frontend serta Penguatan Keamanan Sistem DPRD HUDANG (Ketemu Dewan)  
Status: Disetujui

---

## 1. Latar Belakang & Tujuan

Aplikasi **DPRD HUDANG (Ketemu Dewan)** telah memiliki fungsionalitas menyeluruh yang mencakup otentikasi JWT, konferensi video berbasis LiveKit SFU, manajemen jadwal aspirasi, alur 4 tahap tindak lanjut disposisi, dashboard GIS, dan analitik performa legislator.

Namun, pertumbuhan kode yang pesat menyebabkan berkas utama membesar secara monolitik:
1. `backend/src/server.ts` mencapai 2.526 baris, menggabungkan seluruh handler rute, konfigurasi middleware, logika bisnis, query Prisma, dan kontrol Egress LiveKit.
2. Terdapat celah keamanan fallback hardcoded API Key pada otentikasi backend.
3. `frontend/app/admin/page.tsx` mencapai 1.750 baris yang memuat seluruh tab administrasi dalam satu komponen.
4. Kueri database belum dioptimalkan dengan indeks eksplisit pada model Prisma.
5. Pembaruan data di frontend belum memanfaatkan kapabilitas Socket.io yang sudah terpasang di backend.

Tujuan dari perbaikan ini adalah meningkatkan modularitas, keamanan, performa, dan kemudahan pemeliharaan kode tanpa mengubah spesifikasi fungsional maupun API kontrak yang telah digunakan oleh frontend web dan aplikasi mobile.

---

## 2. Arsitektur & Desain Backend

### 2.1 Struktur Direktori Backend Baru

```
backend/src/
├── config/
│   ├── env.ts                 # Validasi dan konfigurasi variabel lingkungan
│   └── livekit.ts             # Inisialisasi EgressClient dan helper token
├── lib/
│   └── prisma.ts              # Singleton instance PrismaClient
├── middlewares/
│   ├── auth.middleware.ts     # Middleware verifikasi JWT dan otorisasi peran
│   ├── apiKey.middleware.ts   # Middleware validasi Mobile API Key resmi
│   └── validate.middleware.ts # Middleware eksekusi skema Zod
├── schemas/
│   ├── auth.schema.ts         # Skema validasi login, registrasi, pembaruan profil
│   ├── schedule.schema.ts     # Skema validasi pemesanan jadwal & ketersediaan
│   ├── followup.schema.ts     # Skema validasi 4 tahapan disposisi
│   └── admin.schema.ts        # Skema validasi pengaturan admin dan pembersihan data
├── routes/
│   ├── auth.routes.ts         # Endpoint /api/auth dan /api/user
│   ├── schedule.routes.ts     # Endpoint /api/schedules dan /api/availability
│   ├── followup.routes.ts     # Endpoint /api/schedules/:id/follow-up
│   ├── public.routes.ts       # Endpoint /api/public/* (disposisi publik, transparansi)
│   ├── gis.routes.ts          # Endpoint /api/gis/recap dan /api/gis/kunjungan
│   ├── livekit.routes.ts      # Endpoint /api/livekit/* (token, recording, egress)
│   ├── admin.routes.ts        # Endpoint /api/admin/* (users, stats, settings, sync)
│   └── health.routes.ts       # Endpoint /api/health (status server, DB, Redis)
├── services/
│   ├── analysisService.ts     # Layanan transkripsi & analisis AI Gemini
│   ├── queueService.ts        # Antrean daemon otomatis
│   ├── transcriptionService.ts# Layanan pemrosesan audio/video
│   └── hubSync.ts             # Layanan sinkronisasi data anggota dewan
└── server.ts                  # Inisialisasi Express, Socket.io, middleware global, dan rute
```

### 2.2 Penguatan Keamanan & Validasi Input

1. **Penghapusan Hardcoded Fallback Key**:
   - Menghapus string API Key default pada fungsi middleware otentikasi.
   - Jika `MOBILE_API_KEY` tidak dikonfigurasi pada environment, akses melalui header `x-api-key` ditolak secara eksplisit.
   - Memastikan `FINAL_JWT_SECRET` mewajibkan `JWT_SECRET` pada mode produksi dan memicu error fatal saat server dimulai jika variabel tersebut tidak ditemukan.

2. **Implementasi Validasi Skema Zod**:
   - Memasang pustaka `zod` pada backend.
   - Membuat middleware `validateBody(schema)` yang memvalidasi `req.body` sebelum diteruskan ke handler rute.
   - Mengembalikan respons HTTP 400 terstandarisasi dengan daftar error spesifik jika payload tidak sesuai skema.

3. **Sanitasi dan Validasi Upload Berkas**:
   - Membatasi jenis berkas yang diizinkan pada `/api/public/upload-document` (hanya format PDF, PNG, JPG, JPEG).
   - Membatasi ukuran berkas maksimum sebesar 10MB.
   - Menghasilkan nama berkas yang aman menggunakan UUID / timestamp untuk mencegah directory traversal.

4. **Endpoint Pemeriksaan Kesehatan Sistem (Health Check)**:
   - Rute `GET /api/health` yang memeriksa konektivitas PostgreSQL via `prisma.$queryRaw`, ketersediaan LiveKit SFU, dan waktu aktif (uptime) server.

### 2.3 Optimalisasi Indeks Database PostgreSQL

Pembaruan skema pada `backend/prisma/schema.prisma` dengan menambahkan indeks:
- Model `User`: `@@index([role])`, `@@index([email])`
- Model `Schedule`: `@@index([startTime])`, `@@index([masyarakatId])`, `@@index([isTranscribing])`
- Model `ScheduleParticipant`: `@@index([dewanId, status])`
- Model `FollowUp`: `@@index([status])`, `@@index([scheduleId])`
- Model `Rating`: `@@index([dewanId])`, `@@index([scheduleId])`

---

## 3. Arsitektur & Desain Frontend

### 3.1 Modularisasi Dashboard Admin

Struktur komponen admin pada `frontend/components/admin/`:

1. **`AdminStatsCard.tsx`**: Komponen reusable untuk kartu metrik statistik dengan indikator tren.
2. **`AdminOverviewTab.tsx`**: Tab ringkasan metrik utama, grafik tren aspirasi, dan distribusi isu.
3. **`AdminUsersTab.tsx`**: Tab manajemen akun pengguna (Masyarakat, Dewan, Admin), pencarian, dan pengelolaan hak akses.
4. **`AdminSchedulesTab.tsx`**: Tab pemantauan seluruh jadwal rapat aspirasi, pemfilteran tanggal, status, dan pemicu transkripsi manual.
5. **`AdminFollowUpTab.tsx`**: Tab kontrol dan monitoring 4 tahapan disposisi/tindak lanjut dengan integrasi modal timeline.
6. **`AdminRatingsTab.tsx`**: Tab evaluasi kinerja dan ulasan Anggota Dewan berdasarkan 5 aspek penilaian.
7. **`AdminAkdTab.tsx`**: Tab pengelolaan Alat Kelengkapan Dewan (AKD) dan sinkronisasi seeder.

Halaman [frontend/app/admin/page.tsx](file:///e:/project/DPRD/MEETDEWAN/frontend/app/admin/page.tsx) direduksi menjadi pengendali navigasi tab, pemuatan data awal terpadu, dan manajemen sesi yang bersih (< 200 baris).

### 3.2 Sinkronisasi Real-Time via Socket.io

1. **Hook Terpusat (`frontend/hooks/useSocketUpdates.ts`)**:
   - Mengelola koneksi Socket.io client yang menghubungkan frontend ke backend.
   - Mendengarkan event:
     - `schedule:updated`: Pembaruan status permohonan rapat.
     - `followup:updated`: Pembaruan tahapan disposisi dari OPD atau admin.
     - `transcription:progress`: Pembaruan indikator persentase transkripsi AI.
   - Memicu pembaruan state lokal secara reaktif tanpa memerlukan *full-page reload*.

2. **Emisi Event di Backend**:
   - Rute backend memancarkan event `io.emit()` pada mutasi status jadwal, tindak lanjut, dan progres antrean transkripsi.

---

## 4. Rencana Pengujian & Verifikasi

### 4.1 Pengujian Otomatis
1. **Pemeriksaan Kompilasi TypeScript**:
   - Backend: `npm run build` (tsc) harus selesai dengan exit code 0 tanpa error tipe.
   - Frontend: `npm run build` (next build) harus sukses membangun halaman static dan dynamic.
2. **Pengujian Unit & Integrasi Backend**:
   - Menjalankan suite pengujian Jest yang ada (`npm test`).
   - Menambahkan pengujian integrasi baru untuk endpoint otentikasi, validasi Zod, dan endpoint healthcheck.

### 4.2 Verifikasi Manual
1. Uji login sebagai Administrator, Anggota Dewan, dan Masyarakat.
2. Uji alur pengajuan jadwal baru dan verifikasi penerimaan notifikasi via Socket.io.
3. Uji perpindahan seluruh tab pada Admin Dashboard untuk memastikan integritas data dan rendering komponen.
4. Uji endpoint `/api/health` untuk memverifikasi respons JSON status sistem.

---

## 5. Rencana Transisi & Rollout

1. **Fase 1: Backend Setup & Refactoring**:
   - Instalasi pustaka `zod` pada backend.
   - Pembuatan `src/config/`, `src/lib/`, `src/middlewares/`, `src/schemas/`, dan modul `src/routes/`.
   - Pembaruan `server.ts` menjadi berkas inisialisasi ramping.
   - Eksekusi `npx prisma db push` untuk pembaruan indeks database.
2. **Fase 2: Frontend Admin Modularization & Socket Hooks**:
   - Pembuatan subkomponen dalam `frontend/components/admin/`.
   - Refaktor `frontend/app/admin/page.tsx`.
   - Implementasi hook `useSocketUpdates.ts`.
3. **Fase 3: Pengujian & Validasi**:
   - Eksekusi build, unit test, dan uji end-to-end menyeluruh.
