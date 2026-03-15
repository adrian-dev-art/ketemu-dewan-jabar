## [2026-03-15] - Revamp UI Premium & Fitur Konferensi Lanjutan

### Ditambahkan
- Implementasi sistem **Multi-Theme (Light & Dark)** dengan dukungan otomatis `prefers-color-scheme`.
- Komponen `ThemeToggle` untuk perpindahan mode tema yang halus dan persisten.
- Fitur **Pre-join Screen** pada ruang pertemuan untuk pengecekan kamera/mikrofon sebelum bergabung.
- **Sidebar Kustom** pada video call untuk Chat real-time dan daftar Peserta yang terintegrasi.
- Animasi premium (entrance animations) dan efek **Glassmorphism** di seluruh platform.

### Diubah
- Refaktor total desain Dashboard (Masyarakat, Dewan, Admin) dengan estetika premium yang konsisten.
- Peningkatan layout ruang pertemuan menjadi lebih fleksibel dan profesional.
- Pembaruan formulir pemesanan dengan dukungan input judul pertemuan (Meeting Title).

### Diperbaiki
- Perbaikan berbagai bug sintaksis pada dashboard dan komponen UI.
- Optimalisasi transisi tema pada elemen glassmorphic untuk menghindari glitch visual.

## [2026-03-15] - Migrasi ke LiveKit SFU

### Ditambahkan
- Implementasi **LiveKit SFU (Selective Forwarding Unit)** untuk menggantikan arsitektur Mesh lama.
- Integrasi **LiveKit Server SDK** pada backend untuk otentikasi token.
- Penambahan endpoint `/api/livekit/token` untuk manajemen akses peserta.
- Implementasi **LiveKit React Components** pada frontend untuk pengalaman video call yang lebih stabil dan fitur-lengkap (grid layout, active speaker detection).
- Konfigurasi **Redis** dalam `docker-compose.yml` untuk manajemen state LiveKit.
- Penambahan lokasi `/ws` pada konfigurasi Nginx untuk proxy WebSocket Signaling LiveKit.

### Diubah
- Refaktor total `app/room/[id]/page.tsx` dari WebRTC manual menjadi LiveKit SDK.
- Pembaruan konfigurasi `docker-compose.yml` untuk menyertakan layanan LiveKit dan Redis.
- Menonaktifkan layanan **Coturn** karena fungsi STUN/TURN kini ditangani secara internal oleh LiveKit.

### Diperbaiki
- Perbaikan masalah skalabilitas pada pertemuan grup (dukungan peserta hingga 20+ orang dengan penggunaan CPU/Bandwidth client yang optimal).
- Perbaikan berbagai error tipe data Prisma dan duplikasi impor pada `server.ts` backend.

## [2026-03-12] - Perbaikan Konektivitas WebRTC

### Ditambahkan
- Penambahan parameter `relay-ip` pada konfigurasi Coturn (`turnserver.conf`) untuk memastikan binding IP publik yang tepat saat relaying.
- Penambahan parameter `proxy_read_timeout` dan `proxy_send_timeout` pada konfigurasi Nginx untuk menjaga koneksi WebSocket (signaling) tetap stabil.

### Diubah
- Mengubah mode jaringan kontainer `coturn` di `docker-compose.yml` menjadi `network_mode: host` untuk meningkatkan reliabilitas relay WebRTC antar jaringan yang berbeda.
- Memperbarui fungsi `getIceServers` di frontend (`page.tsx`) agar menggunakan variabel lingkungan (`NEXT_PUBLIC_TURN_SERVERS`, dll.) secara konsisten dan menyediakan fallback yang aman.

### Diperbaiki
- Perbaikan masalah peserta yang tidak muncul (layar hitam) ketika berada di jaringan internet yang berbeda (Cross-Network Connectivity).
- Perbaikan status "pending" pada koneksi WebSocket signaling melalui optimalisasi konfigurasi Nginx.
