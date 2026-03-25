# User Testing & QA/QC Guide: Ketemu Dewan

Panduan ini disusun untuk membantu penguji (QA) dan pengguna dalam memverifikasi fungsionalitas, keamanan, dan pengalaman pengguna platform **Ketemu Dewan**.

---

## 🚀 Persiapan Awal
1. Pastikan server Backend dan Frontend berjalan (`npm run dev`).
2. Jalankan seeder untuk mereset data:
   ```bash
   cd backend && npx prisma db seed
   ```
3. Gunakan password default: **`password`** untuk semua akun demo.

---

## 🧪 Skenario Pengujian

### 1. Akses & Keamanan (Masyarakat)
| Langkah | Hasil yang Diharapkan | Status |
| :--- | :--- | :---: |
| Akses Dashboard tanpa Login | Dialihkan kembali ke halaman `/login`. | [ ] |
| Registrasi Akun Baru | Berhasil membuat akun dan dialihkan ke dashboard. | [ ] |
| Login dengan Email Terdaftar | Masuk ke dashboard dan melihat pesan selamat datang. | [ ] |
| Mengajukan Jadwal Aspirasi | Muncul di daftar "Riwayat & Status" dengan label "Menunggu". | [ ] |

### 2. Manajemen Jadwal (Anggota Dewan)
| Langkah | Hasil yang Diharapkan | Status |
| :--- | :--- | :---: |
| Login sebagai `ahmad@dewan.id` | Melihat dashboard khusus Legislator. | [ ] |
| Menyetujui (Approve) Jadwal | Status berubah menjadi "Dikonfirmasi" dan muncul tombol "Gabung Sesi". | [ ] |
| Mengatur Ketersediaan (Slot) | Slot yang ditambah muncul di sisi masyarakat saat pemesanan. | [ ] |
| Mencoba akses `/admin` | Akses ditolak (Error 403 atau Redirect). | [ ] |

### 3. Pengalaman Konferensi Video (User Testing)
| Langkah | Hasil yang Diharapkan | Status |
| :--- | :--- | :---: |
| Klik "Gabung Sesi" | Muncul layar **Pre-join** (Cek Kamera/Mic). | [ ] |
| Masuk ke Room | Video/Audio aktif, nama peserta sesuai dengan nama akun. | [ ] |
| Mengirim Chat Real-time | Pesan muncul di sidebar untuk semua peserta di room. | [ ] |
| Meninggalkan Room | Dialihkan kembali ke dashboard dengan selamat. | [ ] |

### 4. Kontrol Administratif (Admin)
| Langkah | Hasil yang Diharapkan | Status |
| :--- | :--- | :---: |
| Login sebagai `admin@dewan.id` | Melihat ringkasan seluruh sistem (Total User/Jadwal). | [ ] |
| Logout Sesi | Token dihapus dari storage dan kembali ke `/login`. | [ ] |

---

## 🎨 Verifikasi UI/UX Premium
- [ ] **Mode Gelap/Terang**: Transisi halus tanpa glitch pada teks.
- [ ] **Responsivitas**: Tampilan rapi di layar HP (tidak ada elemen yang bertumpuk).
- [ ] **Feedback**: Muncul notifikasi (toast/alert) saat berhasil kirim jadwal atau login salah.

---

## 📝 Catatan Bug / Temuan
*Gunakan bagian ini untuk mencatat temuan yang perlu diperbaiki:*
1. ...
2. ...
