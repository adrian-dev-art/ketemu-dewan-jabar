# MEETDEWAN - Aplikasi Konferensi Video & Penjadwalan

## Arsitektur
- **Frontend**: Next.js (React, TypeScript, Tailwind CSS). Terletak di folder `/frontend`.
- **Backend**: Express.js (Node.js, Socket.io, Prisma ORM, helmet). Terletak di folder `/backend`.
- **Database**: PostgreSQL (Prisma ORM - Pengguna, Jadwal, Penilaian).
- **Teknologi Utama**: WebRTC untuk video, Socket.io untuk sinyal (signaling).
- **Infrastruktur Relay**: Coturn (TURN server) untuk koneksi WebRTC antar jaringan yang berbeda.

## Peran Pengguna
- **Masyarakat**: Menjelajahi profil Dewan, membuat jadwal pertemuan, bergabung dalam panggilan, dan memberikan penilaian.
- **Dewan**: Mengatur ketersediaan, mengonfirmasi/menolak jadwal, dan bergabung dalam panggilan.
- **Admin**: Mengontrol pengguna, melihat semua jadwal, dan mengelola penilaian.

## Keamanan
- Penggunaan `helmet` dan CORS untuk transportasi data yang aman.
- Kontrol Akses Berbasis Peran (RBAC) pada endpoint API.
- Query database yang aman melalui Prisma.

## Peringatan Infrastruktur (PENTING)
- **Firewall**: Berhati-hatilah saat mengelola port. Port penting yang harus tetap terbuka:
  - 80/443 (Nginx/HTTP/HTTPS)
  - 22 (SSH)
  - 3478 (Coturn TCP/UDP)
  - 49152-65535 (UDP Relay Coturn)
  - ICMP (Ping)
- **Blokir IP**: Kesalahan konfigurasi atau restart layanan yang agresif dapat memicu pemblokiran IP oleh sistem keamanan VPS. Hindari restart beruntun jika tidak diperlukan.

## Standar Penulisan
- Dilarang menggunakan emoji dalam kode, dokumentasi, pesan commit, maupun antarmuka pengguna (UI).
- Semua teks harus menggunakan bahasa formal dan lugas.
