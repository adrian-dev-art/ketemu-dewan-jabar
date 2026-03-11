# MEETDEWAN - Aplikasi Konferensi Video & Penjadwalan

## Arsitektur
- **Frontend**: Next.js (React, TypeScript, Tailwind CSS). Terletak di folder `/frontend`.
- **Backend**: Express.js (Node.js, Socket.io, Prisma ORM, helmet). Terletak di folder `/backend`.
- **Database**: PostgreSQL (Prisma ORM - Pengguna, Jadwal, Penilaian).
- **Teknologi Utama**: WebRTC untuk video, Socket.io untuk sinyal (signaling).

## Peran Pengguna
- **Masyarakat**: Menjelajahi profil Dewan, membuat jadwal pertemuan, bergabung dalam panggilan, dan memberikan penilaian.
- **Dewan**: Mengatur ketersediaan, mengonfirmasi/menolak jadwal, dan bergabung dalam panggilan.
- **Admin**: Mengontrol pengguna, melihat semua jadwal, dan mengelola penilaian.

## Keamanan
- Penggunaan `helmet` dan CORS untuk transportasi data yang aman.
- Kontrol Akses Berbasis Peran (RBAC) pada endpoint API.
- Query database yang aman melalui Prisma.

## Standar Penulisan
- Dilarang menggunakan emoji dalam kode, dokumentasi, pesan commit, maupun antarmuka pengguna (UI).
- Semua teks harus menggunakan bahasa formal dan lugas.
