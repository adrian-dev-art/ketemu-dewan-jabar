# Changelog - Ketemu Dewan

Semua perubahan penting pada proyek ini akan dicatat dalam berkas ini.

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
