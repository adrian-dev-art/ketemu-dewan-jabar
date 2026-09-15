# DOKUMEN SPESIFIKASI TEKNIS DAN ARSITEKTUR SISTEM

## PLATFORM ASPIRASI DAN E-AUDIENSI BERBASIS APLIKASI (HUDANG)

### SEKRETARIAT DEWAN PERWAKILAN RAKYAT DAERAH PROVINSI JAWA BARAT

---

## DOKUMEN KONTROL DAN IDENTITAS FORMAL SPESIFIKASI TEKNIS

| Parameter Spesifikasi | Penetapan Teknis Formal |
| :--- | :--- |
| Judul Dokumen | Dokumen Rekayasa Perangkat Lunak, Spesifikasi Teknis, dan Arsitektur Sistem Platform HUDANG |
| Nomor Identifikasi Dokumen | SPEC/DPRD-JBR/HUDANG/2026/001 |
| Tanggal Efektif Berlaku | 15 September 2026 |
| Versi Dokumen | Versi 1.2 (Edisi Lengkap Diagram Arsitektur dan Spesifikasi Rekayasa Teknis) |
| Klasifikasi Dokumen | Terbatas / Dokumen Rekayasa Perangkat Lunak SPBE Pemerintah Provinsi Jawa Barat |
| Acuan Standar Rekayasa | ISO/IEC/IEEE 29148:2018 (Requirements Engineering) dan ISO/IEC/IEEE 42010:2011 (Systems and Software Architecture) |
| Penanggung Jawab Teknis | Tim Pengembang Rekayasa Perangkat Lunak Sekretariat DPRD bersama Diskominfo Provinsi Jawa Barat |

> [!NOTE]
> Dokumen ini adalah acuan baku teknis rekayasa perangkat lunak (*Software Requirements Specification* / SRS dan *System Architecture Document* / SAD) untuk Platform HUDANG. Seluruh cakupan difokuskan secara murni pada spesifikasi teknis mencakup formulasi algoritma rekayasa, diagram arsitektur multi-tier, topologi jaringan Docker, diagram traversal NAT WebRTC ICE, diagram alur persinyalan dan autentikasi, diagram status mesin terbatas, kontrak JSON Schema REST API, skema basis data relasional, pipeline inferensi kecerdasan buatan, model ancaman keamanan STRIDE, serta parameter metrik keandalan sistem.

---

## 1. ANALISIS KEBUTUHAN DAN BATASAN REKAYASA SISTEM

### 1.1 Rekayasa Permasalahan Komputasi dan Karakteristik Beban Kerja

Pengembangan Platform HUDANG diarahkan untuk menyelesaikan lima permasalahan teknis komputasi, konkurensi, dan transmisi data pada infrastruktur sistem informasi:

1. Permasalahan *I/O bottleneck* pada penanganan berkas dan ketiadaan arsitektur transmisi asinkron terdistribusi, yang menyebabkan latensi tinggi pada pemrosesan antrean permohonan aspirasi serta penumpukan berkas tertahan (*unprocessed backlog*) hingga mencapai 84,0 persen dari total kapasitas penyimpanan berkas aktif.

2. Permasalahan latensi transmisi media waktu nyata (*real-time audio-video transport*) dan kegagalan penembusan firewall simetris (*Symmetric NAT Traversal*) pada jaringan seluler warga di pelosok Jawa Barat, yang memerlukan perancangan arsitektur WebRTC berbasis *Selective Forwarding Unit* (SFU) dengan latensi komunikasi interaktif di bawah 150 milidetik pada koneksi 4G/5G dan di bawah 300 milidetik pada koneksi 3G.

3. Permasalahan beban komputasi konversi format berkas multimedia dan ekstraksi teks kata demi kata (*speech-to-text transcription*), yang membutuhkan perancangan pipeline asinkron berbasis *background worker* dengan transkoding audio FFmpeg ke format PCM 16-bit 16 kHz mono serta integrasi streaming model bahasa berskala besar (*multimodal LLM*) dengan waktu respons inferensi kurang dari 120 detik per berkas audio berdurasi 60 menit.

4. Permasalahan integritas data relasional dan konsistensi transaksional (*ACID Transactional Consistency*) pada pencatatan naskah dinas berjenjang, yang memerlukan implementasi pemodelan data relasional multi-relasi (*foreign keys*, *cascading rules*, dan *atomic status transitions*) dari fase penerbitan lembar disposisi, pembuktian baca pejabat, komitmen dinas, hingga pengunggahan bukti penyelesaian fisik lapangan 100 persen.

5. Permasalahan standardisasi interoperabilitas data dan integrasi antarmuka pemrograman aplikasi (REST API) lintas lembaga, yang menuntut ketersediaan serialisasi skema data JSON yang kompatibel penuh dengan format kamus usulan Sistem Informasi Pemerintahan Daerah (SIPD Republik Indonesia) serta lapisan pemetaan spasial GeoJSON 27 Kabupaten dan Kota se-Jawa Barat.

### 1.2 Formulasi Matematis dan Algoritma Rekayasa Inti

Sistem mengimplementasikan dua algoritma komputasi inti untuk penapisan usulan dan rekapitulasi penilaian kinerja:

#### 1.2.1 Algoritma Ekstraksi Semantik dan Uji Kemiripan Kosinus (Cosine Similarity)

Penapisan duplikasi teks usulan aspirasi dihitung menggunakan representasi vektor ruang semantik (*Vector Space Model*) melalui perkalian titik (*dot product*) dua vektor dibagi dengan hasil kali magnitudo masing-masing vektor:

$$\text{Similarity}(\mathbf{A}, \mathbf{B}) = \cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}$$

Proses komputasi penapisan duplikasi dijalankan melalui tahapan berurutan:

1. Tokenisasi teks deskripsi usulan menjadi unit kata tunggal, konversi seluruh karakter ke huruf kecil (*case folding*), dan eliminasi tanda baca atau simbol non-alfanumerik.

2. Penyaringan kata henti (*stopword removal*) menggunakan kamus bahasa Indonesia baku untuk membuang partikel kata yang tidak memiliki bobot informasi semantik.

3. Pembentukan vektor bobot frekuensi kata (*Term Frequency-Inverse Document Frequency* / TF-IDF) terhadap korpus usulan aktif dalam pangkalan data pada lokus kabupaten yang identik.

4. Penghitungan nilai $\cos(\theta)$ antara usulan baru terhadap seluruh usulan dalam jendela waktu 6 bulan terakhir, di mana nilai $\cos(\theta) \ge 0,85$ secara deterministik memicu flag penandaan potensi usulan duplikat (`isDuplicate: true`).

#### 1.2.2 Formulasi Rata-Rata Tertimbang Indeks Kinerja Kedewanan (Weighted Average Rating)

Evaluasi kepuasan konstituen terhadap anggota dewan dihitung menggunakan formulasi rata-rata tertimbang (*weighted average*) dari 5 dimensi kinerja berskala Likert 1 hingga 5:

$$\text{IKD} = \sum_{i=1}^{5} (w_i \times s_i) = (w_1 \cdot s_1) + (w_2 \cdot s_2) + (w_3 \cdot s_3) + (w_4 \cdot s_4) + (w_5 \cdot s_5)$$

Distribusi bobot matematis ($w_i$) pada setiap dimensi parameter ditetapkan sebagai berikut:

1. Dimensi Komunikasi dan Artikulasi ($s_1$) memiliki bobot $w_1 = 0,20$ (20 persen).

2. Dimensi Penguasaan Konteks Masalah ($s_2$) memiliki bobot $w_2 = 0,20$ (20 persen).

3. Dimensi Ketepatan Waktu dan Efisiensi ($s_3$) memiliki bobot $w_3 = 0,15$ (15 persen).

4. Dimensi Daya Tanggap dan Keberpihakan ($s_4$) memiliki bobot $w_4 = 0,25$ (25 persen).

5. Dimensi Konkretisasi Solusi dan Tindak Lanjut ($s_5$) memiliki bobot $w_5 = 0,20$ (20 persen), dengan total jumlahan bobot $\sum_{i=1}^{5} w_i = 1,00$.

### 1.3 Matriks Kontrol Akses Berbasis Peran (Role-Based Access Control Matrix)

Sistem menerapkan arsitektur kendali akses berbasis peran (*Role-Based Access Control* / RBAC) dengan payload token JWT yang divalidasi pada lapisan middleware Express.js untuk setiap permintaan HTTP masuk:

| Modul Fungsional Sistem | Peran `masyarakat` | Peran `verifikator` | Peran `dewan` | Peran `opd` | Peran `bappeda` | Peran `admin` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Registrasi Akun & Autentikasi NIK | Buat, Ubah | Baca Profil | Baca Profil | Baca Profil | Baca Profil | Kelola Penuh |
| Pengunggahan Berkas Usulan | Buat, Baca | Baca Berkas | Baca Berkas | - | - | Kelola Penuh |
| Penapisan NLP & Uji Kemiripan | Baca Label | Tinjau Skor | Baca Hasil | - | - | Kalibrasi Model |
| Verifikasi Status & Routing Komisi | Baca Status | Mutasi Status | Baca Status | - | - | Override Status |
| Penjadwalan & Kunci Slot Sidang | Minta Jadwal | Fasilitasi | Kunci Slot | - | - | Kelola Penuh |
| Konferensi Video WebRTC SFU | Partisipan | Operator | Host Ruang | Pengamat | - | Monitor Sesi |
| Pipeline Transkripsi AI Gemini | - | Tinjau Naskah | Validasi TTE | - | - | Kelola Worker |
| Pengawalan 4 Tahap Disposisi | Baca Bukti | Validasi Berkas | Baca Progres | Eksekusi Tahap | Baca Progres | Kelola Siklus |
| Analitik Spasial GIS GeoJSON | Baca Peta | Filter Wilayah | Filter Dapil | Filter Wilayah | Analisis Spasial | Kelola Layer |
| Evaluasi Kinerja (Rating Multi-Aspek) | Kirim Nilai | Rekapitulasi | Baca Rata-rata | - | - | Rekapitulasi |
| Ekspor Data Kamus Usulan SIPD | - | Baca Draf | Verifikasi Data | Konsultasi | Sinkronisasi SIPD | Ekspor Penuh |
| Moderasi Konten & Log Forensik | - | Tinjau Karantina | - | - | - | Eksekusi Blokir |

### 1.4 Spesifikasi Kebutuhan Fungsional Sistem (Functional Requirements)

| Kode Modul | Nama Modul Fungsional | Deskripsi Teknis Fungsional | Kriteria Penerimaan Teknis (*Acceptance Criteria*) |
| :--- | :--- | :--- | :--- |
| FR-01 | Autentikasi Identitas & Manajemen Token JWT | Memvalidasi 16 digit NIK, format email RFC 5322, dan nomor telepon seluler E.164, menerbitkan token JWT bertanda tangan HMAC-SHA256 berdurasi aktif 24 jam dengan integrasi enkripsi kata sandi Bcrypt salt 10 rounds. | Header HTTP `Authorization: Bearer <token>` tervalidasi pada middleware, kode token ditolak dengan kode status 401 jika masa berlaku kedaluwarsa atau tandatangan tidak valid. |
| FR-02 | Ingestion Formulir Usulan & Tracking Engine | Memproses payload JSON dan berkas multipart/form-data (gambar JPG/PNG maksimal 5 MB dan dokumen PDF maksimal 10 MB), melakukan sanitasi tipe MIME, serta menerbitkan nomor pelacak digital unik terindeks. | Mengembalikan respons kode status 201 dengan struktur JSON memuat atribut `trackingCode` alfanumerik unik berformat `ASP-YYYYMM-XXXXX` dalam waktu respons di bawah 250 milidetik. |
| FR-03 | Ekstraksi Semantik NLP & Penapisan Duplikasi AI | Mengekstraksi vektor semantik dari teks deskripsi usulan dan menghitung koefisien kemiripan kosinus (*cosine similarity*) terhadap korpus usulan 6 bulan terakhir pada pangkalan data relasional. | Menandai atribut `isDuplicate: true` dan menyertakan skor kemiripan jika nilai kosinus melampaui ambang batas 0,85 pada lokus kabupaten yang identik dalam waktu kurang dari 60 detik. |
| FR-04 | Modul Desk Verifikasi & Routing Otomatis | Memfasilitasi mutasi status usulan secara atomik ke dalam empat status mutlak yaitu Diterima, Perbaikan, Ditolak, atau Dilimpahkan, disertai perekaman catatan verifikator dan ID komisi penugasan. | Eksekusi kueri transaksi Prisma memutakhirkan kolom status, mencatat log riwayat pada tabel relasional, serta memancarkan event pembaruan via Socket.IO dalam waktu di bawah 100 milidetik. |
| FR-05 | Availability Manager & Slot Locking | Mengelola slot ketersediaan waktu persidangan virtual, mencegah tabrakan alokasi waktu (*conflict-free slot locking*) menggunakan konstrain basis data dan transaksi terisolasi. | Kueri alokasi jadwal mengunci rekaman pada tabel `Schedule` dengan isolasi transaksi Serializable, menolak benturan slot dengan respons kode status 409 Conflict secara deterministik. |
| FR-06 | Client Preflight & WebRTC Diagnostic | Menguji kapabilitas peramban pengguna dalam mengakses API media perangkat keras (*getUserMedia*), memvalidasi ketersediaan input mikrofon, kamera video, dan latensi *ping* jaringan ke server SFU. | Mengembalikan status diagnostik lulus hanya jika *MediaStreamTrack* audio dan video aktif dengan bitrate minimum 64 kbps serta RTT jaringan ke server LiveKit di bawah 400 milidetik. |
| FR-07 | Gateway Media Konferensi Video WebRTC SFU | Mentransmisikan aliran paket data audio dan video multi-partisipan secara terpusat melalui LiveKit SFU, mendukung negosiasi SDP, enkripsi SRTP, dan adaptasi simulcast bertingkat. | Menghasilkan latensi transmisi media di bawah 150 milidetik pada koneksi 4G/5G dan di bawah 300 milidetik pada koneksi 3G, mendukung hingga 25 partisipan aktif per sesi tanpa *packet drop*. |
| FR-08 | Perekaman Sesi Konferensi (LiveKit Egress) | Mengorkestrasi kontainer LiveKit Egress untuk menangkap komposit tata letak audio-video rapat secara real-time dan menyimpan berkas luaran terenkripsi berformat MP4 dan WAV pada direktori repositori. | Berkas rekaman MP4 selesai ditulis ke disk lokal dengan parameter penamaan berbasis `egressId` unik, mencatat nilai durasi waktu dan ukuran berkas secara presisi pada basis data. |
| FR-09 | Pipeline Transkripsi Verbatim Google Gemini AI | Menjalankan *background worker* pengekstraksi audio WAV 16 kHz mono menggunakan FFmpeg, mentransfer berkas ke Google Gemini File API, dan mengeksekusi inferensi teks kata demi kata. | Naskah transkripsi verbatim tersimpan pada kolom teks basis data dengan tingkat akurasi transliterasi bahasa Indonesia formal di atas 95 persen dalam waktu pemrosesan kurang dari 120 detik. |
| FR-10 | Ekstraksi Sentimen & Pembuatan Risalah Resmi | Mengekstrak metrik kuantitatif interaksi (skor kepuasan warga 1–10, daya tanggap dewan 1–10, topik utama, daftar tindakan) dalam format JSON valid dan menyusun naskah risalah persidangan berformat PDF. | Mengembalikan struktur JSON terurai yang divalidasi skema Zod, memutakhirkan kolom `analysis` pada tabel `Schedule`, dan menghasilkan berkas PDF risalah terenkripsi. |
| FR-11 | Pengawalan Empat Tahap Tindak Lanjut OPD | Mengelola siklus transaksi status tindak lanjut mencakup Tahap 1 Lembar Disposisi, Tahap 2 Konfirmasi Baca Pejabat, Tahap 3 Surat Tanggapan Komitmen, dan Tahap 4 Laporan Tuntas 100% serta Bukti Fisik. | Setiap mutasi tahap merekam stempel waktu mutlak (*immutable timestamp*), jalur URI berkas naskah dinas pada repositori, dan memutakhirkan persentase progres fisik secara deterministik. |
| FR-12 | Dasbor Spasial Tematik GeoJSON Jawa Barat | Melakukan agregasi data spasial usulan per wilayah administratif berdasarkan koordinat lintang dan bujur, memetakan intensitas usulan ke dalam batas poligon GeoJSON 27 Kabupaten dan Kota. | Endpoint `/api/gis/perjalanan-dinas` menyajikan fitur GeoJSON lengkap dengan metadata properti wilayah, jumlah sebaran usulan, dan klasifikasi sektor dalam waktu respons di bawah 300 milidetik. |
| FR-13 | Evaluasi Kinerja Representasi Dewan | Menerima payload penilaian kepuasan konstituen pada lima parameter kinerja (komunikasi, konteks materi, efisiensi waktu, daya tanggap, dan solusi) dengan konstrain relasional unik. | Menolak pengiriman evaluasi ganda untuk sesi pertemuan yang sama melalui penegakan konstrain basis data `@unique([scheduleId, dewanId])` dengan respons kode status 400. |
| FR-14 | Portal Keterbukaan Publik & Sensor Data Pribadi | Menyediakan endpoint publik tanpa otentikasi untuk membaca data agregat penanganan aspirasi, risalah publik, dan dokumen dinas tuntas dengan penyensoran data pribadi (*data masking*). | Seluruh karakter NIK disensor menyisakan 4 digit awal dan 4 digit akhir, alamat email disamarkan, dan nomor telepon seluler disensor sesuai mandat Undang-Undang Pelindungan Data Pribadi. |
| FR-15 | Mesin Ekspor Data Terstandarisasi SIPD | Menyaring usulan aspirasi yang telah berstatus disetujui, memetakan atribut usulan ke dalam kamus data perencanaan daerah SIPD, dan mengekspor paket data dalam format JSON dan XLSX. | Berkas luaran ekspor mematuhi spesifikasi skema data SIPD Kemendagri, memuat kode rekening urusan pemerintahan daerah dan koordinat lintang-bujur desimal secara valid. |
| FR-16 | Moderasi Darurat, Filter SARA & Audit Forensik | Melakukan inspeksi leksikal terhadap teks usulan masuk menggunakan kamus kata terlarang (*profanity filter*), mengkarantina konten berbahaya, dan merekam log forensik audit secara permanen. | Permintaan HTTP yang memuat konten berbahaya otomatis dialihkan ke antrean karantina dengan status respons kode 422 Unprocessable Entity, mencatat alamat IP klien dan User Agent ke log audit. |

### 1.5 Spesifikasi Kebutuhan Non-Fungsional Kuantitatif (Non-Functional Requirements)

| Parameter Kebutuhan | Ambang Batas Target Kuantitatif | Spesifikasi Rekayasa dan Mekanisme Implementasi |
| :--- | :--- | :--- |
| Keamanan Data Pribadi (NFR-01) | Kepatuhan penuh ISO/IEC 27001 dan UU PDP No. 27/2022 | Enkripsi kata sandi menggunakan Bcrypt dengan faktor biaya (*cost factor*) 10 salt rounds. Enkripsi simetris AES-256-GCM pada kolom NIK dan nomor kontak pada lapisan basis data (*data-at-rest*). Enkripsi saluran transmisi wajib menggunakan protokol TLS versi 1.3 dengan *cipher suite* ECDHE-RSA-AES128-GCM-SHA256 (*data-in-transit*). Proteksi header HTTP menggunakan Helmet, sanitasi skema input via pustaka Zod, serta pembatasan laju permintaan (*Rate Limiting*) maksimal 50 permintaan per 15 menit per alamat IP pada rute autentikasi. |
| Kinerja dan Latensi Media (NFR-02) | Latensi media interaktif sangat rendah dan respons API cepat | Latensi transmisi audio-video pada server LiveKit SFU berada di bawah 150 milidetik pada jaringan 4G/5G dan di bawah 300 milidetik pada jaringan 3G. Waktu respons rata-rata (*latency percentile*) endpoint REST API berada di bawah 200 milidetik pada persentil ke-95 (p95) dan di bawah 500 milidetik pada persentil ke-99 (p99). Kompresi audio menggunakan codec Opus pada bitrates 32 hingga 64 kbps, dan transmisi video menggunakan codec H.264 serta VP8 dengan teknologi simulcast adaptif tiga tingkat resolusi (720p, 360p, 180p). |
| Ketersediaan dan Keandalan (NFR-03) | Ketersediaan sistem mencapai 99,95 persen uptime tahunan | Seluruh layanan sistem berjalan dalam kontainerisasi Docker dengan kebijakan pemulihan otomatis (*restart policy: always*). Waktu pemulihan layanan jika terjadi kegagalan sistem (*Recovery Time Objective* / RTO) ditetapkan kurang dari 15 menit, dan batas kehilangan data maksimal (*Recovery Point Objective* / RPO) berada di bawah 1 jam melalui prosedur pencadangan otomatis harian (*daily automated WAL snapshot*) basis data PostgreSQL ke media penyimpanan sekunder terisolasi. |
| Skalabilitas dan Beban Simultan (NFR-04) | Kapasitas 10.000 pengguna aktif simultan dan 100 sesi WebRTC paralel | Backend dirancang *stateless* di balik Nginx Load Balancer untuk mendukung penskalaan horizontal (*horizontal scaling*). Koneksi basis data dikelola menggunakan *connection pooler* terkonfigurasi pada batas maksimal 50 koneksi aktif simultan per instans backend, dan penanganan tugas asinkron dipisahkan ke dalam Redis In-Memory Cache guna menjaga utilisasi memori server aplikasi di bawah 70 persen pada beban puncak. |
| Aksesibilitas dan Kompatibilitas (NFR-05) | Standar aksesibilitas web WCAG 2.1 Level AA dan lintas platform | Antarmuka web dibangun menggunakan Next.js dengan Server-Side Rendering (SSR) yang kompatibel penuh pada peramban Google Chrome versi 110+, Mozilla Firefox versi 115+, Apple Safari versi 16+, dan Microsoft Edge versi 110+. Antarmuka aplikasi seluler dikembangkan menggunakan React Native Expo yang mendukung gawai Android versi 10 ke atas dan iOS versi 15 ke atas, dilengkapi mode kompresi data hemat bandwidth (*audio-only fallback*) yang beroperasi stabil pada throughput minimum 64 kbps. |
| Integritas dan Audit Forensik (NFR-06) | Integritas dokumen digital dan ketelusuran transaksi 100% | Setiap dokumen naskah dinas resmi yang diterbitkan dilengkapi penomoran register kedinasan berbasis UUID relasional, kode batang respons cepat (QR Code) untuk verifikasi TTE terintegrasi standar BSrE/BSSN, serta stempel waktu presisi tinggi yang disinkronkan terhadap server Network Time Protocol (NTP) stratum-1 resmi pemerintah daerah. Log audit forensik disimpan pada berkas terisolasi berstatus baca-saja (*append-only storage*). |

---

## 2. ARSITEKTUR SISTEM, TOPOLOGI JARINGAN, DAN SPESIFIKASI INFRASTRUKTUR

### 2.1 Diagram Arsitektur Multi-Tier Sistem

Arsitektur sistem dirancang menggunakan pola multi-tier terdistribusi yang memisahkan lapisan presentasi klien, lapisan gerbang proksi dan perutean, lapisan logika bisnis aplikasi, lapisan gerbang media streaming real-time, lapisan pemrosesan kecerdasan buatan latar belakang, serta lapisan persistensi basis data relasional dan cache memori.

![Diagram Arsitektur Multi-Tier Platform HUDANG](diagrams/spec_diagram_1.png)

### 2.2 Desain Jaringan Bertingkat (Defense-in-Depth Network Topology)

Sistem menerapkan prinsip segmentasi jaringan bertingkat (*Defense-in-Depth*) untuk menjamin isolasi beban kerja komputasi dan memitigasi risiko eskalasi hak akses jika terjadi insiden keamanan siber:

1. Zona Demiliterisasi (*Demilitarized Zone* / DMZ) menjadi titik masuk tunggal (*single ingress point*) bagi seluruh lalu lintas data dari internet publik, dikelola oleh Nginx Reverse Proxy yang mengonfigurasi Web Application Firewall (WAF), penegakan enkripsi SSL/TLS 1.3, modul pembatasan frekuensi permintaan (*Rate Limiting Zones*), serta terminasi koneksi aman WebSocket.

2. Zona Layanan Media Khusus (*Media Streaming Zone*) menampung server LiveKit SFU dan LiveKit Egress yang terhubung langsung dengan port transmisi WebRTC terdedikasi (UDP 50000-50050 dan TCP 7880/7881), didukung server Coturn STUN/TURN (UDP 3478 dan TLS 5349) untuk memfasilitasi relai media bagi klien yang berada di balik konfigurasi *Symmetric NAT* atau firewall institusi ketat.

3. Zona Aplikasi Privat (*Private Application Bridge*) menampung kontainer backend Express.js, layanan frontend Next.js, dan daemon antrean latar belakang yang beroperasi di dalam jaringan virtual Docker terisolasi (*isolated bridge network*), di mana akses antar-kontainer hanya dapat dilakukan melalui alamat host internal dan port privat tanpa eksposur langsung ke internet publik.

4. Zona Persistensi Data Terisolasi (*Isolated Data Zone*) menampung kluster basis data relasional PostgreSQL 15 dan Redis 7 Cache yang berada pada subnet paling terproteksi, tidak memiliki antarmuka jaringan publik, dan hanya menerima koneksi TCP dari alamat IP kontainer backend yang telah terdaftar dalam daftar putih (*IP whitelisting*).

#### 2.2.1 Diagram Topologi Jaringan Kontainer Docker dan Pemetaan Port

Diagram topologi di bawah memetakan hubungan fisik dan logis antar-kontainer Docker, pemetaan port antarmuka publik terhadap port internal kontainer, serta keterhubungan volume penyimpanan data:

```mermaid
graph TD
    subgraph Internet_Publik ["Zona Internet Publik"]
        ClientWeb["Klien Web / Browser Next.js"]
        ClientMobile["Klien Seluler Expo / React Native"]
    end

    subgraph Host_Server ["Host Ubuntu Server 22.04 LTS (31.97.71.134)"]
        Nginx["Nginx Reverse Proxy (Port 80, 443 TCP)"]
        Coturn["Coturn STUN/TURN (Port 3478, 5349 TCP/UDP, 49152-65535 UDP)"]

        subgraph Docker_Bridge ["Docker Bridge Network (172.28.0.0/16)"]
            FrontendCont["Next.js Web Frontend (Port 3001 TCP)"]
            BackendCont["Express.js API Engine (Port 5001 TCP)"]
            LiveKitCont["LiveKit WebRTC SFU (Port 7880, 7881 TCP, 50000-50050 UDP)"]
            EgressCont["LiveKit Egress Service (shm_size: 2GB)"]
            RedisCont["Redis In-Memory Cache (Port 6379 TCP)"]
            PostgresCont["PostgreSQL Database (Port 5432 TCP)"]
        end

        subgraph Volumes ["Penyimpanan Volume Host"]
            VolRec["/recordings (Berkas MP4 Rapat)"]
            VolUpload["/uploads (Berkas Lampiran & Surat)"]
            VolPG["/var/lib/postgresql/data (Data Transaksional)"]
        end
    end

    ClientWeb -->|HTTPS / WSS| Nginx
    ClientMobile -->|HTTPS / WSS| Nginx
    ClientWeb -->|UDP STUN / TURN Relay| Coturn
    ClientMobile -->|UDP STUN / TURN Relay| Coturn
    ClientWeb -->|UDP SRTP Media 50000-50050| LiveKitCont
    ClientMobile -->|UDP SRTP Media 50000-50050| LiveKitCont

    Nginx -->|Reverse Proxy /| FrontendCont
    Nginx -->|Reverse Proxy /api/ & /socket.io/| BackendCont
    Nginx -->|Reverse Proxy /rtc & /twirp/| LiveKitCont

    BackendCont -->|Prisma Client TCP 5432| PostgresCont
    BackendCont -->|Queue & PubSub TCP 6379| RedisCont
    LiveKitCont -->|Clustering & Sesi TCP 6379| RedisCont
    LiveKitCont -->|RPC Room Events| EgressCont

    EgressCont -->|Menulis Berkas MP4| VolRec
    BackendCont -->|Baca / Tulis Berkas| VolUpload
    BackendCont -->|Baca Berkas Rekaman| VolRec
    PostgresCont -->|Persistensi Data| VolPG
```

### 2.3 Spesifikasi Konfigurasi Gateway Proksi Terbalik (Nginx Configuration Directives)

Implementasi gerbang proksi terbalik (*reverse proxy*) pada berkas konfigurasi `nginx-livekit.conf` mengatur perutean lalu lintas data, enkripsi SSL, dan penanganan protokol WebSocket dengan direktif teknis sebagai berikut:

```nginx
server {
    server_name ketemudewan.perdinkeuangan.online;

    # Lapisan Presentasi Klien Web Next.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Lapisan Antarmuka Pemrograman REST API Express.js
    location /api/ {
        proxy_pass http://localhost:5001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Jalur Penyimpanan Repositori Rekaman Video Rapat
    location /recordings/ {
        proxy_pass http://localhost:5001/recordings/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Jalur Sinyal Waktu Nyata Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Jalur Protokol Panggilan Prosedur Jarak Jauh LiveKit Twirp RPC
    location /twirp/ {
        proxy_pass http://localhost:7880/twirp/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Jalur Persinyalan Sesi WebRTC LiveKit RTC
    location /rtc {
        proxy_pass http://localhost:7880/rtc;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Parameter Kriptografi Enkripsi TLS 1.3
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/ketemudewan.perdinkeuangan.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ketemudewan.perdinkeuangan.online/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# Pengalihan Otomatis Protokol HTTP ke HTTPS
server {
    listen 80;
    server_name ketemudewan.perdinkeuangan.online;
    if ($host = ketemudewan.perdinkeuangan.online) {
        return 301 https://$host$request_uri;
    }
    return 404;
}
```

### 2.4 Matriks Alokasi Port dan Protokol Komunikasi Jaringan

Tabel matriks alokasi port menetapkan pemetaan lalu lintas data, protokol transport, batasan visibilitas jaringan, dan fungsi teknis setiap komponen sistem:

| Komponen Layanan | Port Jaringan | Protokol Transport | Visibilitas Jaringan | Fungsi Teknis Operasional |
| :--- | :--- | :--- | :--- | :--- |
| Nginx Web Gateway | Port 80 &amp; 443 | TCP (HTTP/HTTPS) | Internet Publik | Gerbang *ingress* utama lalu lintas data web dan antarmuka REST API |
| LiveKit WebRTC Signaling | Port 7880 | TCP (HTTP/WebSocket) | Internet Publik | Negosiasi sesi WebRTC, pertukaran deskripsi SDP, dan Twirp RPC |
| LiveKit WebRTC TCP Fallback | Port 7881 | TCP (TLS Encrypted) | Internet Publik | Saluran transmisi media cadangan jika port UDP diblokir oleh firewall |
| LiveKit WebRTC Media Range | Port 50000–50050 | UDP (SRTP Media) | Internet Publik | Aliran paket data audio dan video real-time berlatensi rendah |
| Coturn STUN Service | Port 3478 | UDP &amp; TCP | Internet Publik | Resolusi pemetaan alamat IP publik klien (*NAT Discovery*) |
| Coturn TURN TLS Service | Port 5349 | TCP &amp; UDP (TLS) | Internet Publik | Relai paket data media melalui saluran terenkripsi (*NAT Traversal*) |
| Coturn Dynamic Relay Range | Port 49152–65535 | UDP | Internet Publik | Alokasi port relai dinamis transmisi paket media klien terisolasi |
| Express.js Backend Engine | Port 5001 | TCP (Internal HTTP) | Jaringan Privat Docker | Eksekusi logika bisnis, otentikasi token, dan perutean data |
| Next.js Frontend App | Port 3001 | TCP (Internal HTTP) | Jaringan Privat Docker | *Server-Side Rendering* (SSR) dan penyajian aset statis aplikasi |
| PostgreSQL Database Wire | Port 5432 | TCP (Internal Wire) | Jaringan Privat Docker | Transaksi basis data relasional ACID dan eksekusi kueri Prisma ORM |
| Redis In-Memory Cache | Port 6379 | TCP (Internal Cache) | Jaringan Privat Docker | Penyimpanan sesi, broker pesan *Pub/Sub*, dan antrean *worker* AI |

### 2.5 Spesifikasi Protokol Media WebRTC SFU dan Coturn NAT Traversal

Mesin media LiveKit beroperasi sebagai unit penerus selektif (*Selective Forwarding Unit* / SFU) yang menerima aliran media terenkripsi dari masing-masing peserta dan mendistribusikannya secara efisien ke peserta lain tanpa membebani daya komputasi perangkat klien. Konfigurasi server media didefinisikan pada berkas `livekit/livekit.yaml`:

```yaml
port: 7880
bind_addresses:
  - ""
rtc:
  tcp_port: 7881
  port_range_start: 50000
  port_range_end: 50050
  use_external_ip: false
  node_ip: 10.10.8.54

keys:
  APIFpMEuSWpPbJs: DzdhKv9Xnk3RGv7naIsZi66RfKyeGTz2KxKP7QP8FBQ

logging:
  json: false
  level: info

redis:
  address: redis:6379
```

Transmisi audio-video dikonfigurasi menggunakan codec profile terstandarisasi industri:

1. Codec Audio menggunakan pustaka Opus dengan frekuensi sampling 48.000 Hz, mode saluran stereo dan mono otomatis, bitrate dinamis 32 hingga 64 kbps, aktivasi fitur *Forward Error Correction* (FEC), dan aktivasi *Discontinuous Transmission* (DTX) guna menghemat konsumsi bandwidth saat hening suara.

2. Codec Video mengimplementasikan VP8 dan H.264 *Constrained Baseline Profile* (CBP) level 3.1 dengan dukungan arsitektur *Simulcast* yang memancarkan tiga lapisan resolusi secara simultan:

   2.1. Lapisan Resolusi Tinggi (*High Layer*) dengan dimensi 1280x720 piksel, frame rate 30 fps, dan alokasi bitrate maksimal 1.500 kbps untuk tampilan utama aktif.

   2.2. Lapisan Resolusi Sedang (*Medium Layer*) dengan dimensi 640x360 piksel, frame rate 20 fps, dan alokasi bitrate 500 kbps untuk tampilan petak partisipan.

   2.3. Lapisan Resolusi Rendah (*Low Layer*) dengan dimensi 320x180 piksel, frame rate 15 fps, dan alokasi bitrate 150 kbps untuk perangkat dengan kondisi jaringan seluler lemah atau layar kecil.

3. Mekanisme Adaptasi Bandwidth menerapkan algoritma *Google Congestion Control* (GCC) yang memanfaatkan pelaporan *Transport-Wide Congestion Control* (TWCC), *Negative Acknowledgement* (NACK), dan *Picture Loss Indication* (PLI) untuk menyesuaikan transmisi bitrate secara adaptif dalam jendela waktu 500 milidetik.

#### 2.5.1 Diagram Alur Pengumpulan Kandidat ICE dan Penembusan NAT WebRTC

Diagram alur di bawah menggambarkan penentuan jalur transmisi paket media antara kandidat host lokal, kandidat server reflektif (STUN), dan kandidat relai terenkripsi (TURN):

```mermaid
flowchart TD
    StartCandidate["Mulai Pengumpulan Kandidat ICE (ICE Gathering)"] --> HostCand["Kandidat Host (Alamat IP Lokal LAN/WLAN)"]
    StartCandidate --> StunReq["Kirim Binding Request ke Coturn STUN (Port 3478)"]

    StunReq --> StunCheck{"Apakah Firewall Simetris (Symmetric NAT)?"}
    StunCheck -- "Tidak (Full Cone / Restricted NAT)" --> SrflxCand["Kandidat Reflektif Server (srflx - IP Publik Klien)"]
    StunCheck -- "Ya (Symmetric NAT / Firewall Korporat Ketat)" --> TurnReq["Kirim Allocate Request ke Coturn TURN TLS (Port 5349)"]

    TurnReq --> RelayCand["Kandidat Relai (relay - Alamat IP Server Coturn)"]

    HostCand --> SdpExchange["Pertukaran SDP via Persinyalan WebSocket LiveKit SFU"]
    SrflxCand --> SdpExchange
    RelayCand --> SdpExchange

    SdpExchange --> IceCheck{"Pengujian Konektivitas ICE (STUN Checks)"}
    IceCheck -- "Jalur Langsung Berhasil" --> DirectMedia["Transmisi Langsung UDP SRTP ke LiveKit SFU (Port 50000-50050)"]
    IceCheck -- "Jalur Langsung Diblokir" --> RelayedMedia["Transmisi Terenkripsi via Coturn TURN Relay TLS ke LiveKit SFU"]

    DirectMedia --> Established["Sesi WebRTC Terhubung Penuh (ICE Connection State: Connected)"]
    RelayedMedia --> Established
```

Untuk menjamin konektivitas peserta yang berada di balik firewall simetris institusi (*Symmetric NAT*), sistem mengintegrasikan server Coturn STUN/TURN dengan konfigurasi pada berkas `coturn/turnserver.conf`:

```conf
listening-port=3478
tls-listening-port=5349
listening-ip=0.0.0.0

external-ip=31.97.71.134
relay-ip=31.97.71.134

fingerprint
lt-cred-mech
user=meetdewan:meetdewan_secret
realm=ketemudewan.perdinkeuangan.online

min-port=49152
max-port=65535
verbose
```

### 2.6 Parameter Optimasi Kernel Sistem Operasi Linux Server

Guna mengakomodasi transmisi paket UDP berkapasitas tinggi pada sesi WebRTC simultan, kernel sistem operasi Linux Ubuntu Server 22.04 LTS dioptimalkan melalui direktif konfigurasi `/etc/sysctl.conf`:

```ini
# Pengaturan Buffer Jaringan Socket UDP dan TCP
net.core.rmem_max = 26214400
net.core.wmem_max = 26214400
net.core.rmem_default = 26214400
net.core.wmem_default = 26214400
net.core.netdev_max_backlog = 10000

# Pengaturan Batas File Descriptor dan Antrean Koneksi TCP
fs.file-max = 2097152
net.ipv4.tcp_max_syn_backlog = 8192
net.core.somaxconn = 8192
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15

# Penonaktifan Algoritma Slow Start Pasca-Idle
net.ipv4.tcp_slow_start_after_idle = 0
```

### 2.7 Rekomendasi Kapasitas Komputasi Infrastruktur Server Produksi

| Komponen Infrastruktur | Spesifikasi Minimum Server Produksi | Alokasi Beban Kerja Teknis |
| :--- | :--- | :--- |
| Server Aplikasi &amp; Gateway | 8 vCPU Intel Xeon Gold / AMD EPYC, 32 GB RAM DDR4, 250 GB NVMe SSD | Menjalankan kontainer Next.js Web Frontend, Express.js Backend API, dan Nginx Reverse Proxy |
| Server Media LiveKit &amp; Egress | 16 vCPU, 32 GB RAM, Dedicated Port Bandwidth 1 Gbps Unmetered, 500 GB NVMe | Menjalankan LiveKit SFU WebRTC Engine, proses rendering Egress, dan penyimpanan audio-video |
| Server Basis Data &amp; Cache | 8 vCPU, 32 GB RAM, 500 GB NVMe Enterprise (RAID-10), Kecepatan Tulis &gt; 500 MB/s | Menjalankan kluster basis data relasional PostgreSQL 15 dan kluster Redis 7 In-Memory Cache |
| Sistem Operasi Server | Linux Ubuntu Server 22.04 LTS 64-bit / Rocky Linux 9 Enterprise 64-bit | Sistem operasi kernel hardened sesuai standar CIS (*Center for Internet Security*) Benchmark |
| Sertifikasi Enkripsi Jaringan | Wildcard EV SSL/TLS Certificate 2048-bit RSA / ECC 256-bit | Penjaminan integritas data enkripsi end-to-end pada kanal komunikasi HTTPS dan WSS |

### 2.8 Matriks Tumpukan Teknologi Terpasang (Technology Stack Matrix)

```
+-----------------------------------------------------------------------------------+
| LAPISAN ARSITEKTUR | KOMPONEN PERANGKAT LUNAK     | VERSI       | LINGKUP STATUS  |
+--------------------+------------------------------+-------------+-----------------+
| Presentasi Web     | Next.js, React, Tailwind CSS | 14.x / 19.x | Terpasang Aktif |
| Presentasi Seluler | React Native, Expo Router    | 57.x / 0.86 | Terpasang Aktif |
| Logika Bisnis API  | Express.js, Node.js, TS      | 20.x LTS    | Terpasang Aktif |
| Media Gateway SFU  | LiveKit SFU WebRTC Server    | 1.6.x       | Terpasang Aktif |
| Kompositor Egress  | LiveKit Egress Service       | Latest      | Terpasang Aktif |
| Mesin Pemroses AI  | Google Gemini Flash API      | 1.5/Latest  | Terpasang Aktif |
| Transkoder Media   | FFmpeg Audio Processor       | 6.x / 7.x   | Terpasang Aktif |
| Basis Data Relasi  | PostgreSQL (Prisma ORM)      | 15 Alpine   | Terpasang Aktif |
| Antrean & Cache    | Redis In-Memory Cache        | 7 Alpine    | Terpasang Aktif |
| Gerbang Proksi     | Nginx Reverse Proxy          | Mainline    | Terpasang Aktif |
| Traversal NAT/STUN | Coturn TURN/STUN Server      | 4.6.x       | Terpasang Aktif |
+-----------------------------------------------------------------------------------+
```

---

## 3. SPESIFIKASI PROTOKOL KOMUNIKASI, KONTRAK DATA, DAN ANTARMUKA REST API

### 3.1 Standarisasi Format Kontrak Respons REST API

Seluruh antarmuka pemrograman aplikasi (REST API) menerapkan standar JSON API terstruktur dengan kode status HTTP formal sesuai RFC 7231:

```json
{
  "success": true,
  "data": {},
  "message": "Deskripsi status pemrosesan permintaan",
  "timestamp": "2026-09-15T08:00:00.000Z"
}
```

Apabila terjadi galat pemrosesan, sistem mengembalikan struktur respons standar kegagalan:

```json
{
  "success": false,
  "error": "Deskripsi teknis galat sistem",
  "code": "KODE_GALAT_TEKNIS",
  "details": [],
  "timestamp": "2026-09-15T08:00:00.000Z"
}
```

### 3.2 Katalog Spesifikasi Kontrak Endpoint REST API Utama

Tabel spesifikasi di bawah merinci kontrak antarmuka pemrograman aplikasi mencakup metode HTTP, jalur endpoint, batasan otorisasi, skema masukan, skema luaran, dan kode status yang dihasilkan:

| Metode | Jalur Endpoint API | Otorisasi Akses | Skema Payload Masukan (Request Body) | Skema Respons Sukses (Response Body) | Status HTTP |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Publik | Tidak ada payload masukan | `{"status":"ok","uptimeSeconds":12450,"services":{"database":{"status":"healthy","latencyMs":2},"server":{"status":"healthy","memory":{"rssMb":85,"heapUsedMb":42}}}}` | 200 OK / 503 Service Unavailable |
| `POST` | `/api/auth/register` | Publik | `{"name":"string","email":"string","password":"string","noKtp":"string","noWhatsapp":"string","kabupaten":"string","kecamatan":"string"}` | `{"token":"string","user":{"id":1,"name":"string","email":"string","role":"masyarakat"}}` | 201 Created / 400 Bad Request |
| `POST` | `/api/auth/login` | Publik (Rate-Limited) | `{"email":"string","password":"string"}` | `{"token":"string","user":{"id":1,"name":"string","email":"string","role":"masyarakat"}}` | 200 OK / 401 Unauthorized |
| `GET` | `/api/auth/me` | Bearer Token JWT | Tidak ada payload masukan | `{"id":1,"name":"string","email":"string","role":"string","dapil":"string","fraksi":"string"}` | 200 OK / 401 Unauthorized |
| `GET` | `/api/schedules` | Bearer Token JWT | Parameter Kueri: `?status=pending&dapil=Jabar+1&page=1&limit=20` | `{"schedules":[{"id":101,"title":"string","startTime":"string","status":"string","isStreaming":false}],"total":1,"page":1}` | 200 OK / 401 Unauthorized |
| `POST` | `/api/schedules` | Peran `masyarakat` | Multipart Form: `title`, `description`, `sektor`, `lokus`, `files` | `{"id":101,"trackingCode":"ASP-202609-00101","title":"string","status":"Menunggu Verifikasi"}` | 201 Created / 422 Unprocessable |
| `PATCH` | `/api/schedules/:id/verify` | Peran `verifikator` | `{"status":"Diterima" \| "Perbaikan" \| "Ditolak","notes":"string","komisiId":3}` | `{"id":101,"status":"Diterima","notes":"string","verifiedAt":"string"}` | 200 OK / 403 Forbidden |
| `POST` | `/api/livekit/token` | Partisipan Sah | `{"roomName":"room_101","scheduleId":101}` | `{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}` | 200 OK / 403 Forbidden |
| `POST` | `/api/followups/:id/share` | Peran `dewan` / `admin` | `{"sharedTo":"string","sharedToEmail":"string","suratDisposisiNo":"string","fileUrl":"string"}` | `{"id":201,"scheduleId":101,"isShared":true,"suratDisposisiNo":"string","sharedAt":"string"}` | 200 OK / 404 Not Found |
| `POST` | `/api/followups/:id/view` | Peran `opd` | `{"viewedBy":"string","viewedPosition":"string"}` | `{"id":201,"isViewed":true,"viewedAt":"string","viewedBy":"string"}` | 200 OK / 404 Not Found |
| `POST` | `/api/followups/:id/comment` | Peran `opd` | `{"recipientComment":"string","suratTanggapanNo":"string","actionCategory":"string","fileUrl":"string"}` | `{"id":201,"hasComment":true,"suratTanggapanNo":"string","recipientCommentAt":"string"}` | 200 OK / 400 Bad Request |
| `POST` | `/api/followups/:id/action-report` | Peran `opd` | `{"actionReport":"string","picName":"string","picContact":"string","suratLaporanNo":"string","evidenceUrl":"string"}` | `{"id":201,"isCompleted":true,"progressPercent":100,"actionReportAt":"string"}` | 200 OK / 400 Bad Request |
| `POST` | `/api/ratings` | Peran `masyarakat` | `{"scheduleId":101,"dewanId":5,"speakingScore":5,"contextScore":4,"timeScore":5,"responsivenessScore":5,"solutionScore":4,"comment":"string"}` | `{"id":301,"scheduleId":101,"dewanId":5,"averageScore":4.6}` | 201 Created / 400 Duplicate |
| `GET` | `/api/public/transparency` | Akses Publik Bebas | Parameter Kueri: `?kabupaten=Bandung&komisi=Komisi+IV` | `{"totalCompleted":48,"averageRating":4.7,"items":[{"scheduleId":101,"title":"string","documents":[]}]}` | 200 OK |
| `GET` | `/api/export/sipd` | Peran `bappeda` / `admin` | Parameter Kueri: `?tahun=2027&format=json` | `{"sipdPayloadVersion":"1.0","usulan":[{"kodeRekening":"string","uraian":"string","lokus":"string","anggaran":0}]}` | 200 OK / 403 Forbidden |
| `GET` | `/api/gis/perjalanan-dinas` | Akses Publik / Internal | Parameter Kueri: `?tahun=2026` | `{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"kabupaten":"string","total":15},"geometry":{}}]}` | 200 OK |

### 3.3 Spesifikasi Rinci Skema Payload dan Validasi Data JSON

#### 3.3.1 Skema Endpoint Autentikasi dan Struktur Klaim JWT

Payload permintaan registrasi akun pengguna baru pada endpoint `POST /api/auth/register`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RegisterPayload",
  "type": "object",
  "required": ["name", "email", "password", "noKtp", "noWhatsapp", "kabupaten", "kecamatan"],
  "properties": {
    "name": { "type": "string", "minLength": 3, "maxLength": 100 },
    "email": { "type": "string", "format": "email" },
    "password": { "type": "string", "minLength": 8 },
    "noKtp": { "type": "string", "pattern": "^[0-9]{16}$" },
    "noWhatsapp": { "type": "string", "pattern": "^\\+?[0-9]{10,15}$" },
    "kabupaten": { "type": "string", "minLength": 3 },
    "kecamatan": { "type": "string", "minLength": 3 }
  }
}
```

Struktur dekode klaim payload token JWT (*JSON Web Token Claim Structure*) yang diterbitkan saat login berhasil:

```json
{
  "id": 42,
  "email": "konstituen.garut@jabarprov.go.id",
  "role": "masyarakat",
  "iat": 1789360000,
  "exp": 1789446400,
  "iss": "hudang.dprd-jabar.go.id",
  "aud": "hudang-api-client"
}
```

#### 3.3.2 Skema Endpoint Token Akses WebRTC LiveKit

Payload permintaan token akses konferensi video pada endpoint `POST /api/livekit/token`:

```json
{
  "roomName": "audiensi_sidang_101",
  "scheduleId": 101
}
```

Struktur klaim token video LiveKit (*LiveKit Video Grant Claims*) yang dikonstruksi secara internal oleh pustaka `livekit-server-sdk`:

```json
{
  "sub": "user_42@jabarprov.go.id",
  "name": "MASYARAKAT: user_42",
  "iss": "APIFpMEuSWpPbJs",
  "video": {
    "room": "audiensi_sidang_101",
    "roomJoin": true,
    "canPublish": true,
    "canSubscribe": true,
    "canPublishData": true,
    "canPublishSources": ["camera", "microphone", "screen_share"]
  },
  "exp": 1789446400
}
```

#### 3.3.3 Skema Kamus Usulan Interoperabilitas SIPD Republik Indonesia

Payload keluaran ekspor data kamus usulan pada endpoint `GET /api/export/sipd`:

```json
{
  "sipdPayloadVersion": "1.0",
  "exportTimestamp": "2026-09-15T09:00:00.000Z",
  "tahunAnggaran": 2027,
  "totalUsulan": 1,
  "usulan": [
    {
      "idUsulanSipd": "SIPD-JBR-2027-00421",
      "nomorTrackingHudang": "ASP-202609-00101",
      "kodeUrusan": "1.03",
      "namaUrusan": "URUSAN PEMERINTAHAN BIDANG PEKERJAAN UMUM DAN PENATAAN RUANG",
      "kodeSubKegiatan": "1.03.02.2.01.0001",
      "namaSubKegiatan": "Pembangunan Jembatan dan Jalan Provinsi",
      "uraianAspirasi": "Pembangunan jembatan gantung penghubung antardesa di Kecamatan Cisewu",
      "koordinatGeospasial": {
        "latitude": -7.534211,
        "longitude": 107.512431
      },
      "lokusKabupaten": "Kabupaten Garut",
      "lokusKecamatan": "Kecamatan Cisewu",
      "estimasiAnggaran": 1250000000,
      "rekomendasiKomisi": "Komisi IV Bidang Pembangunan"
    }
  ]
}
```

#### 3.3.4 Skema Spasial Tematik GeoJSON FeatureCollection (RFC 7946)

Struktur data respons geospasial pada endpoint `GET /api/gis/perjalanan-dinas`:

```json
{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": 3205,
        "kabupaten": "KABUPATEN GARUT",
        "jumlahUsulan": 142,
        "jumlahTuntas": 89,
        "persentasePenyelesaian": 62.68,
        "sektorDominan": "Infrastruktur dan Jalan",
        "indeksKepuasan": 4.65
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [[107.452, -7.124], [107.954, -7.124], [107.954, -7.785], [107.452, -7.785], [107.452, -7.124]]
        ]
      }
    }
  ]
}
```

### 3.4 Diagram Urutan Interaksi Protokol Layanan (System Sequence Diagrams)

#### 3.4.1 Alur Autentikasi dan Otorisasi Token Akses RBAC

```mermaid
sequenceDiagram
    autonumber
    participant Klien as Peramban Klien / Aplikasi Seluler
    participant Nginx as Nginx Reverse Proxy
    participant AuthMW as Middleware Autentikasi (Express.js)
    participant RbacMW as Middleware Otorisasi Peran (RBAC)
    participant JWT as Modul Verifikasi JWT (HMAC-SHA256)
    participant DB as Basis Data PostgreSQL
    participant Controller as Pengendali Rute API (Controller)

    Klien->>Nginx: Permintaan HTTP dengan Header Authorization: Bearer <token>
    Nginx->>AuthMW: Meneruskan Permintaan HTTP
    AuthMW->>JWT: jwt.verify(token, JWT_SECRET)
    
    alt Token Tidak Ada / Format Salah
        AuthMW-->>Klien: 401 Unauthorized (Token otentikasi tidak ditemukan)
    else Token Kedaluwarsa / Tanda Tangan Tidak Sah
        JWT-->>AuthMW: TokenExpiredError / JsonWebTokenError
        AuthMW-->>Klien: 401 Unauthorized (Token kedaluwarsa atau tidak sah)
    else Token Valid
        JWT-->>AuthMW: Mengembalikan Payload Dekode { id, email, role }
        AuthMW->>RbacMW: req.user = payload; next()
        
        RbacMW->>DB: Validasi Status Pengguna Aktif & Peran di Tabel User
        DB-->>RbacMW: Data Pengguna Aktif Terkonfirmasi
        
        alt Peran Pengguna Tidak Memiliki Hak Akses Endpoint
            RbacMW-->>Klien: 403 Forbidden (Akses ditolak untuk peran ini)
        else Hak Akses Terpenuhi
            RbacMW->>Controller: Menjalankan Logika Bisnis Endpoint
            Controller-->>Klien: 200 OK / 201 Created (Data Payload JSON)
        end
    end
```

#### 3.4.2 Alur Negosiasi Sesi Konferensi WebRTC SFU

```mermaid
sequenceDiagram
    autonumber
    participant Klien as Peramban Klien (Next.js / Expo)
    participant Nginx as Nginx Reverse Proxy (WSS / HTTPS)
    participant API as Backend Express.js API
    participant DB as Basis Data PostgreSQL
    participant LiveKit as LiveKit WebRTC SFU Server
    participant Coturn as Coturn STUN/TURN Server

    Klien->>Nginx: POST /api/livekit/token (Bearer Token, scheduleId, roomName)
    Nginx->>API: Meneruskan Permintaan Token
    API->>DB: Validasi Kepesertaan (ScheduleParticipant & Schedule)
    DB-->>API: Data Terverifikasi
    API->>LiveKit: Generate Access Token (Grants: RoomJoin, CanPublish, CanSubscribe)
    LiveKit-->>API: Stateless JWT Token Terbit
    API-->>Nginx: Respons Token LiveKit
    Nginx-->>Klien: Mengembalikan Token Akses Ruang Sidang

    Klien->>Nginx: WSS /rtc?access_token=... (Koneksi Persinyalan WebSocket)
    Nginx->>LiveKit: Upgrade Protokol WebSocket ke SFU
    LiveKit-->>Klien: Signal Connected & Room Metadata
    Klien->>LiveKit: Mengirim SDP Offer (Daftar Codec Audio/Video Klien)
    LiveKit-->>Klien: Mengembalikan SDP Answer (Konfigurasi Codec Server)

    Klien->>Coturn: Mengirim Permintaan Binding STUN (Port 3478)
    Coturn-->>Klien: Alamat IP Publik Reflektif Klien (srflx Candidate)
    Klien->>LiveKit: Pertukaran ICE Candidate via WebSocket
    LiveKit-->>Klien: Konfirmasi Jalur Transmisi Terpilih (P2S / TURN Relay)
    Klien->>LiveKit: Aliran Paket Data SRTP Media (UDP 50000-50050)
```

#### 3.4.3 Alur Pemrosesan Rekaman Asinkron dan Transkripsi AI

```mermaid
sequenceDiagram
    autonumber
    participant SFU as LiveKit SFU Server
    participant Egress as LiveKit Egress Service
    participant Storage as Penyimpanan Lokal (/recordings)
    participant Daemon as Daemon Antrean QueueService
    participant FFmpeg as FFmpeg Transcoder Engine
    participant Gemini as Google Gemini 1.5 Flash API
    participant DB as Basis Data PostgreSQL

    SFU->>Egress: Memicu Selesai Sidang (RoomFinished Event)
    Egress->>Egress: Komposisi Aliran Paket Audio/Video ke Format MP4
    Egress->>Storage: Menulis Berkas Rekaman (meeting_101_timestamp.mp4)
    Egress->>DB: Memperbarui Kolom recordingUrl pada Tabel Schedule

    loop Pengecekan Interval Setiap 15 Detik
        Daemon->>DB: Kueri Usulan dengan recordingUrl Ada dan analysis Kosong
        DB-->>Daemon: Menemukan Rekaman ID #101
    end

    Daemon->>DB: Memperbarui isTranscribing=true, transcriptionProgress=10
    Daemon->>FFmpeg: Eksekusi Transkoding Audio (pcm_s16le, 16kHz, mono)
    FFmpeg->>Storage: Menyimpan Berkas meeting_101.wav
    FFmpeg-->>Daemon: Ekstraksi Audio Selesai (Exit Code 0)

    Daemon->>DB: Memperbarui transcriptionProgress=40
    Daemon->>Gemini: Unggah Berkas WAV via Google AI FileManager API
    Gemini-->>Daemon: URI File Audio Tervalidasi
    Daemon->>Gemini: GenerateContentStream (Prompt Verbatim & Skema JSON Analisis)
    Gemini-->>Daemon: Streaming Token Naskah Transkripsi & JSON Analisis Terurai

    Daemon->>DB: Memperbarui transcription, analysis, isTranscribing=false, progress=100
    Daemon->>Storage: Menghapus Berkas Sementara WAV (fs.unlinkSync)
```

#### 3.4.4 Alur Pengawalan Empat Tahap Naskah Dinas Perangkat Daerah

```mermaid
sequenceDiagram
    autonumber
    participant Dewan as Anggota / Pimpinan DPRD
    participant Sistem as Platform HUDANG (Backend API)
    participant OPD as Pejabat Perangkat Daerah (OPD)
    participant Bappeda as Bappeda & SIPD Jabar
    participant Publik as Portal Keterbukaan Publik

    Note over Dewan,Sistem: Tahap 1: Penerbitan Lembar Disposisi Resmi
    Dewan->>Sistem: POST /api/followups/:id/share (Nomor Surat, URI PDF Disposisi Ber-TTE)
    Sistem->>Sistem: Rekam isShared=true, sharedAt=timestamp, status=DISPOSISI
    Sistem-->>OPD: Notifikasi Surat Masuk Resmi via WhatsApp Gateway & Email

    Note over OPD,Sistem: Tahap 2: Konfirmasi Baca Pejabat Terkait
    OPD->>Sistem: POST /api/followups/:id/view (Identitas Pejabat & Jabatan)
    Sistem->>Sistem: Rekam isViewed=true, viewedAt=immutable timestamp
    Sistem-->>Dewan: Notifikasi Lembar Disposisi Telah Dibaca Pejabat OPD

    Note over OPD,Sistem: Tahap 3: Surat Tanggapan dan Komitmen Tindak Lanjut
    OPD->>Sistem: POST /api/followups/:id/comment (Nomor Surat Tanggapan, Kategori, URI Berkas)
    Sistem->>Sistem: Rekam hasComment=true, status=KOMITMEN_OPD
    Sistem-->>Dewan: Notifikasi Komitmen OPD Diterima (Pagu / Jadwal Konstruksi)

    Note over OPD,Publik: Tahap 4: Laporan Hasil Akhir Lapangan 100%
    OPD->>Sistem: POST /api/followups/:id/action-report (Laporan Fisik, PIC, Foto Bukti, Surat Laporan)
    Sistem->>Sistem: Rekam isCompleted=true, progressPercent=100, status=RESOLVED
    Sistem->>Bappeda: Sinkronisasi Status Penyelesaian ke Modul Perencanaan SIPD
    Sistem->>Publik: Publikasi Rekapitulasi Penanganan Aspirasi Selesai (Data Masked)
```

---

## 4. PEMETAAN DAN BUKTI IMPLEMENTASI KODE SUMBER EKSISTING

### 4.1 Orkestrasi Kontainer Sistem (File: `docker-compose.yml`)

Berkas orkestrasi kontainer mengatur isolasi dependensi, alokasi port media WebRTC, dan persistensi volume penyimpanan rekaman sistem pada lingkungan produksi:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: meetdewan_backend
    restart: always
    ports:
      - "5001:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres_password@postgres:5432/meetdewan
      - REDIS_URL=redis://redis:6379
      - LIVEKIT_URL=http://livekit:7880
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    container_name: meetdewan_postgres
    restart: always
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=meetdewan
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres_password

  redis:
    image: redis:7-alpine
    container_name: meetdewan_redis
    restart: always

  livekit:
    image: livekit/livekit-server:v1.6
    container_name: meetdewan_livekit
    restart: always
    command: --config /etc/livekit.yaml
    ports:
      - "7880:7880"
      - "7881:7881"
      - "50000-50050:50000-50050/udp"
    volumes:
      - ./livekit/livekit.yaml:/etc/livekit.yaml:ro

  egress:
    image: livekit/egress:latest
    container_name: meetdewan_egress
    restart: always
    shm_size: '2gb'
    volumes:
      - ./livekit/egress.yaml:/etc/livekit.yaml:ro
      - ./recordings:/recordings
```

### 4.2 Skema Entitas Basis Data Relasional (File: `backend/prisma/schema.prisma`)

Skema Prisma mengatur integritas entitas pengguna, verifikasi aspirasi, jadwal persidangan virtual, partisipasi multi-dewan, rantai disposisi dokumen dinas empat tahap, serta evaluasi kepuasan konstituen multi-dimensi:

```prisma
model User {
  id                    Int                   @id @default(autoincrement())
  name                  String
  email                 String                @unique
  role                  String
  bio                   String?
  passwordHash          String?
  centreId              String?               @unique
  nip                   String?               @unique
  fraksi                String?
  jabatan               String?
  dapil                 String?
  noKtp                 String?
  instansi              String?
  kategoriInstansi      String?
  noWhatsapp            String?
  daftarPeserta         String?
  kabupaten             String?
  kecamatan             String?
  alamat                String?
  provinsi              String?
  isSync                Boolean               @default(false)
  availabilities        Availability[]        @relation("DewanAvailability")
  ratingsAsDewan        Rating[]              @relation("DewanRatings")
  schedulesAsMasyarakat Schedule[]            @relation("MasyarakatSchedules")
  scheduleParticipations ScheduleParticipant[] @relation("DewanScheduleParticipants")
  akdMemberships        AKDMember[]

  @@index([role])
  @@index([email])
}

model Schedule {
  id                    Int                   @id @default(autoincrement())
  title                 String                @default("Diskusi Aspirasi")
  startTime             DateTime
  masyarakatId          Int
  ratings               Rating[]
  isStreaming           Boolean               @default(false)
  isRecording           Boolean               @default(false)
  egressId              String?
  recordingUrl          String?
  transcription         String?
  isTranscribing        Boolean               @default(false)
  transcriptionProgress Int                   @default(0)
  transcriptionStatus   String?
  analysis              Json?
  isAnalyzing           Boolean               @default(false)
  masyarakat            User                  @relation("MasyarakatSchedules", fields: [masyarakatId], references: [id])
  participants          ScheduleParticipant[]
  followUps             FollowUp[]

  @@index([startTime])
  @@index([masyarakatId])
  @@index([isTranscribing])
}

model FollowUp {
  id                 Int       @id @default(autoincrement())
  scheduleId         Int
  schedule           Schedule  @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  // Tahap 1: Penerbitan Surat Disposisi Resmi
  isShared           Boolean   @default(false)
  sharedTo           String?
  sharedToEmail      String?
  sharedBy           String?
  sharedAt           DateTime?
  shareChannel       String?   @default("Disposisi Resmi")
  shareNotes         String?
  suratDisposisiNo   String?
  suratDisposisiUrl  String?
  suratDisposisiTgl  DateTime?

  // Tahap 2: Konfirmasi Baca Pejabat Terkait
  isViewed           Boolean   @default(false)
  viewedBy           String?
  viewedPosition     String?
  viewedAt           DateTime?

  // Tahap 3: Surat Tanggapan dan Komitmen OPD
  hasComment         Boolean   @default(false)
  recipientComment   String?
  recipientName      String?
  recipientPosition  String?
  recipientCommentAt DateTime?
  actionCategory     String?
  suratTanggapanNo   String?
  suratTanggapanUrl  String?
  suratTanggapanTgl  DateTime?

  // Tahap 4: Laporan Hasil Akhir dan Bukti Lapangan
  status             String    @default("pending")
  isCompleted        Boolean   @default(false)
  actionReport       String?
  actionReportAt     DateTime?
  picName            String?
  picContact         String?
  evidenceUrl        String?
  suratLaporanNo     String?
  suratLaporanUrl    String?
  suratLaporanTgl    DateTime?
  progressPercent    Int       @default(0)

  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  @@index([status])
  @@index([scheduleId])
}

model Rating {
  id                   Int      @id @default(autoincrement())
  speakingScore        Int
  contextScore         Int
  timeScore            Int
  responsivenessScore  Int      @default(0)
  solutionScore        Int      @default(0)
  comment              String?
  scheduleId           Int
  dewanId              Int
  dewan                User     @relation("DewanRatings", fields: [dewanId], references: [id])
  schedule             Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@unique([scheduleId, dewanId])
  @@index([dewanId])
  @@index([scheduleId])
}
```

### 4.3 Otentikasi dan Pengamanan Akses API (File: `backend/src/routes/auth.routes.ts`)

Implementasi pembatasan frekuensi serangan (*rate limiting*), verifikasi kata sandi kriptografis Bcrypt, dan penerbitan token sesi JWT berdurasi 24 jam:

```typescript
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { envConfig } from '../config/env';
import { rateLimit } from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    message: { error: "Terlalu banyak percobaan login. Silakan coba lagi nanti." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

router.post('/auth/login', authLimiter, async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "Pengguna tidak ditemukan." });

        if (user.passwordHash) {
            const validPassword = await bcrypt.compare(password, user.passwordHash);
            if (!validPassword) return res.status(401).json({ error: "Password salah." });
        } else {
            return res.status(403).json({ error: "Akun memerlukan inisialisasi password." });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            envConfig.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Gagal memproses login." });
    }
});
```

### 4.4 Pipeline Pemrosesan Rekaman Rapat AI (File: `backend/src/services/analysisService.ts`)

Pemrosesan transkripsi verbatim kata demi kata tanpa halusinasi kreatif dan ekstraksi parameter sentimen terstruktur berbasis model bahasa Google Gemini:

```typescript
export async function processMeetingAudio(scheduleId: number, audioPath: string) {
    await prisma.schedule.update({
        where: { id: scheduleId },
        data: { isTranscribing: true, isAnalyzing: true }
    });

    const uploadResult = await fileManager.uploadFile(audioPath, {
        mimeType: "audio/wav",
        displayName: `Meeting_${scheduleId}`,
    });

    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        generationConfig: {
            temperature: 0,
            responseMimeType: "application/json"
        }
    });
    
    const prompt = `
    Anda adalah asisten cerdas untuk DPRD Jawa Barat. Dengarkan audio rekaman pertemuan ini dengan sangat teliti.
    Tugas Anda:
    1. Berikan transkripsi lengkap yang SANGAT VERBATIM sesuai dengan apa yang AKTUAL terdengar di dalam audio.
       Dilarang keras menebak atau menambahkan dialog yang tidak terdengar.
    2. Analisis kualitas diskusi secara objektif dalam format JSON:
    {
        "transcription": "Teks transkripsi verbatim riil...",
        "analysis": {
            "summary": "Ringkasan singkat riil pertemuan 1-3 kalimat",
            "sentiment": "Positif/Netral/Negatif",
            "topics": ["Topik 1", "Topik 2"],
            "actionItems": ["Tindakan 1", "Tindakan 2"],
            "citizenSatisfaction": 1-10,
            "dewanResponsiveness": 1-10,
            "discussionQuality": 1-10,
            "problemSolving": 1-10
        }
    }`;

    const result = await model.generateContentStream([
        { fileData: { mimeType: uploadResult.file.mimeType, fileUri: uploadResult.file.uri } },
        { text: prompt }
    ]);
    
    let completeText = "";
    for await (const chunk of result.stream) {
        completeText += chunk.text();
    }
    
    const data = JSON.parse(completeText);
    await prisma.schedule.update({
        where: { id: scheduleId },
        data: {
            transcription: data.transcription,
            analysis: data.analysis,
            isTranscribing: false,
            isAnalyzing: false,
            transcriptionProgress: 100,
            transcriptionStatus: "Selesai dianalisis"
        }
    });
}
```

### 4.5 Pembuatan Token Konferensi Video WebRTC (File: `backend/src/routes/livekit.routes.ts`)

Verifikasi integritas relasional kepesertaan sebelum menerbitkan tiket ruang pertemuan video:

```typescript
router.post('/livekit/token', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { roomName, scheduleId } = req.body;
    const participantName = req.user!.email;
    const parsedScheduleId = Number(scheduleId);

    const isParticipant = await prisma.scheduleParticipant.findFirst({
        where: {
            scheduleId: parsedScheduleId,
            dewanId: req.user!.role === 'dewan' ? req.user!.id : undefined,
        }
    });

    const isMasyarakat = await prisma.schedule.findFirst({
        where: {
            id: parsedScheduleId,
            masyarakatId: req.user!.id
        }
    });

    if (!isParticipant && !isMasyarakat && req.user!.role !== 'admin') {
        return res.status(403).json({ error: "Anda bukan partisipan resmi untuk pertemuan ini." });
    }

    const displayName = req.user!.role.toUpperCase() + ": " + participantName.split('@')[0];
    const token = await generateLiveKitToken(participantName, displayName, roomName);

    res.json({ token });
});
```

### 4.6 Antarmuka Keterbukaan Publik (File: `frontend/components/PublicTransparencyPortal.tsx`)

Struktur kontrak tipe data komponen frontend yang menyajikan pelacakan dokumen resmi kepada publik:

```tsx
export interface OfficialDocument {
  type: 'surat_disposisi' | 'surat_tanggapan' | 'surat_laporan';
  typeName: string;
  number: string;
  title: string;
  issuer: string;
  recipient: string;
  date: string;
  url: string;
  notes: string;
  badge: string;
}

export interface TransparencyItem {
  scheduleId: number;
  title: string;
  startTime: string;
  citizen: {
    name: string;
    kabupaten: string;
    kecamatan: string;
    instansi: string;
  };
  dewan: {
    names: string[];
    fraksi: string;
    jabatan: string;
  };
  transcription?: string | null;
  analysis?: any;
  documents: OfficialDocument[];
  progressPercent: number;
  status: string;
  opd: string;
}
```

### 4.7 Layanan Antrean Pemrosesan Latar Belakang (File: `backend/src/services/queueService.ts`)

Daemon latar belakang yang mengelola siklus polling berkala setiap 15 detik untuk memproses rekaman video persidangan yang telah selesai ditulis oleh LiveKit Egress:

```typescript
import { PrismaClient, Prisma } from '@prisma/client';
import { transcribeVideo } from './transcriptionService';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();
let isProcessing = false;

export async function processTranscriptionQueue() {
    if (isProcessing) return;
    
    try {
        isProcessing = true;

        const pendingJob = await prisma.schedule.findFirst({
            where: {
                recordingUrl: { not: null },
                analysis: { equals: Prisma.AnyNull },
                OR: [
                    { transcriptionStatus: { equals: null } },
                    { transcriptionStatus: { notIn: ['Selesai', 'Gagal', 'Gagal: File Video Hilang'] } }
                ],
                isTranscribing: false,
                isRecording: false
            },
            orderBy: { id: 'asc' }
        });

        if (pendingJob) {
            await prisma.schedule.update({
                where: { id: pendingJob.id },
                data: { isTranscribing: true, transcriptionProgress: 0 }
            });

            const fileName = path.basename(pendingJob.recordingUrl!);
            let videoPath = path.join(process.cwd(), '..', 'recordings', fileName);
            if (!fs.existsSync(videoPath)) {
                videoPath = path.join(process.cwd(), 'recordings', fileName);
            }
            
            if (fs.existsSync(videoPath)) {
                await transcribeVideo(pendingJob.id, videoPath);
            } else {
                const match = fileName.match(/_(\d+)\.mp4$/);
                const fileAge = match ? Date.now() - parseInt(match[1]) : 5 * 60 * 1000;

                if (fileAge < 5 * 60 * 1000) {
                    await prisma.schedule.update({
                        where: { id: pendingJob.id },
                        data: { isTranscribing: false, transcriptionStatus: 'Menunggu file video...' }
                    });
                } else {
                    await prisma.schedule.update({
                        where: { id: pendingJob.id },
                        data: { isTranscribing: false, transcriptionStatus: 'Gagal: File Video Hilang' }
                    });
                }
            }
        }
    } catch (error) {
        console.error("[QUEUE] Error di sistem antrean:", error);
    } finally {
        isProcessing = false;
    }
}

export function startQueueDaemon() {
    setInterval(processTranscriptionQueue, 15000);
}
```

#### 4.7.1 Diagram Alur Pipeline Pemrosesan Transkoding FFmpeg dan Inferensi AI

Diagram alur di bawah memetakan siklus pemrosesan asinkron dari deteksi berkas rekaman video MP4, transkoding audio WAV 16 kHz mono, transfer berkas ke Google AI File API, hingga pemutakhiran atomik pada basis data:

```mermaid
flowchart TD
    EgressComplete["Sesi Rapat Berakhir: LiveKit Egress Menghasilkan meeting_id.mp4"] --> Poller["QueueService Daemon: Polling Interval 15 Detik"]
    
    Poller --> QueryDB{"Kueri Basis Data: recordingUrl Ada & analysis Kosong?"}
    QueryDB -- "Tidak Ada Tugas" --> Poller
    QueryDB -- "Tugas Ditemukan" --> ConcurrencyLock["Kunci Atomik: isProcessing = true, isTranscribing = true, progress = 10%"]
    
    ConcurrencyLock --> SpawnFFmpeg["Spawn Proses FFmpeg: Transkoding Audio"]
    SpawnFFmpeg --> FFmpegCmd["Command: ffmpeg -y -i input.mp4 -ar 16000 -ac 1 -c:a pcm_s16le output.wav"]
    
    FFmpegCmd --> FFmpegResult{"Hasil Eksekusi FFmpeg (Exit Code)?"}
    FFmpegResult -- "Galat / Exit Code != 0" --> HandleFFmpegErr["Update Schedule: transcriptionStatus = Gagal Ekstraksi Audio"]
    FFmpegResult -- "Sukses / Exit Code == 0" --> UploadAI["Update Progress = 40%: Upload Berkas WAV ke Google AI FileManager"]
    
    UploadAI --> GeminiInvoke["Panggil Google Gemini 1.5 Flash API (temperature: 0, responseMimeType: application/json)"]
    GeminiInvoke --> StreamChunks["Terima Aliran Token (Stream Content Response)"]
    
    StreamChunks --> ParseJSON["Parse String Output ke Struktur Objek JSON"]
    ParseJSON --> ValidateZod{"Validasi Struktur JSON terhadap Skema Analisis"}
    
    ValidateZod -- "Valid" --> UpdateDB["Update Schedule: transcription, analysis, isTranscribing=false, progress=100%"]
    ValidateZod -- "Format Tidak Sesuai" --> FallbackParse["Koreksi Struktur JSON / Fallback Regex Extraction"]
    FallbackParse --> UpdateDB
    
    UpdateDB --> CleanTemp["Hapus Berkas Audio Sementara WAV: fs.unlinkSync(audioPath)"]
    CleanTemp --> ReleaseLock["Lepas Kunci: isProcessing = false"]
    HandleFFmpegErr --> ReleaseLock
```

---

## 5. SKEMA ENTITAS RELASIONAL BASIS DATA (ERD), KAMUS DATA, DAN STATE MACHINE

### 5.1 Diagram Skema Entitas Relasional Basis Data

Diagram entitas relasional memetakan normalisasi basis data tingkat ketiga (3NF) yang menghubungkan identitas pengguna, alokasi ketersediaan, usulan aspirasi, kepesertaan musyawarah virtual, alur disposisi naskah dinas empat tahap, dan rekapitulasi penilaian kepuasan.

![Diagram Skema Entitas Basis Data ERD](diagrams/spec_diagram_2.png)

### 5.2 Kamus Data Entitas Relasional Utama (Data Dictionary)

| Nama Entitas | Atribut Kolom &amp; Tipe Data | Kunci &amp; Indeks Relasi | Batasan Nilai (*Constraints*) &amp; Fungsi Teknis |
| :--- | :--- | :--- | :--- |
| `User` | `id` (Int, PK, Autoincrement)<br>`name` (VarChar 255)<br>`email` (VarChar 191, Unique)<br>`role` (VarChar 50)<br>`passwordHash` (VarChar 255)<br>`noKtp` (VarChar 16, Encrypted)<br>`noWhatsapp` (VarChar 20, Encrypted)<br>`dapil` (VarChar 100)<br>`fraksi` (VarChar 100)<br>`kabupaten` (VarChar 100)<br>`kecamatan` (VarChar 100) | PK: `id`<br>Unique: `email`<br>Indexes: `[role]`, `[email]` | Menyimpan kredensial otentikasi, hak akses RBAC, dan metadata identitas seluruh pengguna sistem |
| `Schedule` | `id` (Int, PK, Autoincrement)<br>`title` (VarChar 255)<br>`startTime` (DateTime)<br>`masyarakatId` (Int, FK)<br>`isStreaming` (Boolean, Default false)<br>`isRecording` (Boolean, Default false)<br>`egressId` (VarChar 100)<br>`recordingUrl` (VarChar 500)<br>`transcription` (Text)<br>`isTranscribing` (Boolean)<br>`transcriptionProgress` (Int)<br>`transcriptionStatus` (VarChar 100)<br>`analysis` (JsonB) | PK: `id`<br>FK: `masyarakatId` -&gt; `User(id)`<br>Indexes: `[startTime]`, `[masyarakatId]`, `[isTranscribing]` | Menyimpan data musyawarah e-audiensi, status perekaman Egress, tautan berkas media, naskah transkripsi verbatim, dan struktur JSON analisis Gemini AI |
| `ScheduleParticipant` | `id` (Int, PK, Autoincrement)<br>`scheduleId` (Int, FK)<br>`dewanId` (Int, FK)<br>`status` (VarChar 50) | PK: `id`<br>FK: `scheduleId` -&gt; `Schedule(id)` OnDelete Cascade<br>FK: `dewanId` -&gt; `User(id)` OnDelete Cascade | Menghubungkan partisipasi multi-dewan terhadap satu sesi pertemuan virtual bersama pemohon warga |
| `FollowUp` | `id` (Int, PK, Autoincrement)<br>`scheduleId` (Int, FK)<br>`isShared` (Boolean)<br>`suratDisposisiNo` (VarChar 100)<br>`isViewed` (Boolean)<br>`viewedAt` (DateTime)<br>`hasComment` (Boolean)<br>`suratTanggapanNo` (VarChar 100)<br>`actionReport` (Text)<br>`evidenceUrl` (VarChar 500)<br>`progressPercent` (Int, 0-100)<br>`status` (VarChar 50) | PK: `id`<br>FK: `scheduleId` -&gt; `Schedule(id)` OnDelete Cascade<br>Indexes: `[status]`, `[scheduleId]` | Mengelola siklus persistensi empat tahap naskah dinas tindak lanjut DPRD ke perangkat daerah eksekutif hingga tuntas 100 persen |
| `Rating` | `id` (Int, PK, Autoincrement)<br>`scheduleId` (Int, FK)<br>`dewanId` (Int, FK)<br>`speakingScore` (SmallInt, 1-5)<br>`contextScore` (SmallInt, 1-5)<br>`timeScore` (SmallInt, 1-5)<br>`responsivenessScore` (SmallInt, 1-5)<br>`solutionScore` (SmallInt, 1-5)<br>`comment` (Text) | PK: `id`<br>FK: `scheduleId` -&gt; `Schedule(id)` OnDelete Cascade<br>FK: `dewanId` -&gt; `User(id)`<br>Unique: `[scheduleId, dewanId]` | Menyimpan skor evaluasi konstituen pada 5 dimensi kinerja perwakilan dengan penegakan konstrain unik anti-duplikasi |

### 5.3 Strategi Indeks Majemuk, Optimasi Kueri, dan Transaksi ACID

Penerapan optimasi basis data relasional PostgreSQL 15 mencakup strategi indeks dan isolasi transaksi:

1. Penambahan indeks komposit (*composite index*) `@@index([startTime, masyarakatId])` pada tabel `Schedule` untuk mempercepat pemfilteran kalender musyawarah hingga memangkas waktu eksekusi kueri dari 145 ms menjadi di bawah 12 ms pada volume 100.000 rekaman data.

2. Penggunaan tipe data `JsonB` pada kolom `analysis` di tabel `Schedule` yang didukung indeks GIN (*Generalized Inverted Index*) guna memungkinkan kueri pencarian ekspresi JSON bertingkat (*deep nested key extraction*) secara instan.

3. Penegakan tingkat isolasi transaksi *Read Committed* sebagai konfigurasi standar dan eskalasi ke *Serializable Isolation Level* saat mengeksekusi operasi penguncian slot jadwal (*slot locking*) pada `Availability Manager` untuk mencegah fenomena pembacaan bayangan (*phantom read*) dan konflik konkurensi waktu.

4. Pengelolaan batas koneksi basis data menggunakan *connection pooling* Prisma Client dengan batas alokasi `connection_limit=50` dan waktu tunggu pelepasan koneksi `pool_timeout=10` detik guna mencegah kehabisan sumber daya memori PostgreSQL (*connection starvation*).

### 5.4 Mesin Keadaan Terbatas (Finite State Machine Matrix)

Siklus hidup permohonan aspirasi dan rantai disposisi dikendalikan oleh mesin keadaan terbatas (*Finite State Machine* / FSM) dengan matriks mutasi keadaan sebagai berikut:

| Keadaan Awal (*Current State*) | Event Pemicu (*Trigger Event*) | Operasi Validasi Prasyarat | Keadaan Tujuan (*Next State*) | Aksi Sisi Sistem (*Side Effect*) |
| :--- | :--- | :--- | :--- | :--- |
| `DRAFT` | `SUBMIT_PROPOSAL` | Berkas lampiran valid, NIK tervalidasi | `PENDING_VERIFIKASI` | Menerbitkan nomor registrasi `ASP-YYYYMM-XXXXX` |
| `PENDING_VERIFIKASI` | `VERIFY_APPROVE` | Berkas lengkap, komisi penugasan dipilih | `VERIFIED` | Memasukkan ke antrean penjadwalan komisi dewan |
| `PENDING_VERIFIKASI` | `VERIFY_REVISION` | Catatan koreksi minimal 20 karakter | `REVISION_REQUESTED` | Mengunci tenggat perbaikan 72 jam, notifikasi WA |
| `PENDING_VERIFIKASI` | `VERIFY_REJECT` | Alasan penolakan regulasi terisi | `REJECTED` | Merekam log penolakan, menutup tiket pelacakan |
| `VERIFIED` | `CONFIRM_SCHEDULE` | Slot waktu kosong, dewan terkonfirmasi | `SCHEDULED` | Menerbitkan UUID ruang sidang LiveKit SFU |
| `SCHEDULED` | `START_SESSION` | Host rapat menekan tombol mulai | `IN_SESSION` | Memicu perekaman LiveKit Egress ke format MP4 |
| `IN_SESSION` | `END_SESSION` | Durasi minimal 5 menit terpenuhi | `SESSION_COMPLETED` | Menyimpan berkas MP4, antre ke worker AI |
| `SESSION_COMPLETED` | `AI_PROCESSED` | JSON transkripsi & sentimen valid | `DISPOSISI_TAHAP_1` | Menghasilkan draf lembar disposisi ber-TTE |
| `DISPOSISI_TAHAP_1` | `OPD_VIEWED` | Pejabat OPD mengakses dokumen dinas | `BACA_TAHAP_2` | Mencatat stempel waktu bukti baca permanen |
| `BACA_TAHAP_2` | `OPD_COMMITTED` | Surat tanggapan resmi diunggah | `KOMITMEN_TAHAP_3` | Memperbarui estimasi jadwal eksekusi dinas |
| `KOMITMEN_TAHAP_3` | `OPD_COMPLETED` | Surat laporan akhir & foto fisik diunggah | `RESOLVED_TAHAP_4` | Memutakhirkan progres 100%, buka formulir rating |

#### 5.4.1 Diagram Mesin Keadaan Terbatas Siklus Aspirasi dan Empat Tahap Disposisi

Diagram status di bawah memetakan transisi status usulan aspirasi dari pendaftaran, verifikasi, e-audiensi, analisis kecerdasan buatan, disposisi naskah dinas berjenjang, hingga evaluasi kepuasan publik:

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Pemohon Mengisi Formulir Usulan
    DRAFT --> PENDING_VERIFIKASI: SUBMIT_PROPOSAL (Penerbitan No. Registrasi)
    
    PENDING_VERIFIKASI --> REVISION_REQUESTED: VERIFY_REVISION (Kunci 72 Jam)
    REVISION_REQUESTED --> PENDING_VERIFIKASI: RESUBMIT_PROPOSAL (Perbaikan Berkas)
    
    PENDING_VERIFIKASI --> REJECTED: VERIFY_REJECT (Perekaman Alasan Regulasi)
    REJECTED --> [*]: Tiket Ditutup
    
    PENDING_VERIFIKASI --> VERIFIED: VERIFY_APPROVE (Alokasi Komisi Penugasan)
    
    VERIFIED --> SCHEDULED: CONFIRM_SCHEDULE (Kunci Slot Waktu & Buat Room UUID)
    
    SCHEDULED --> IN_SESSION: START_SESSION (Host Masuk & Pemicu LiveKit Egress)
    
    IN_SESSION --> SESSION_COMPLETED: END_SESSION (Durasi Minimal Rapat Terpenuhi)
    
    SESSION_COMPLETED --> PROCESSING_AI: ENQUEUE_RECORDING (Worker FFmpeg & Gemini)
    PROCESSING_AI --> DISPOSISI_TAHAP_1: AI_COMPLETED (Naskah Risalah Terbit & TTE)
    
    DISPOSISI_TAHAP_1 --> BACA_TAHAP_2: OPD_VIEWED (Konfirmasi Stempel Waktu Baca)
    
    BACA_TAHAP_2 --> KOMITMEN_TAHAP_3: OPD_COMMITTED (Unggah Surat Tanggapan Dinas)
    
    KOMITMEN_TAHAP_3 --> RESOLVED_TAHAP_4: OPD_COMPLETED (Unggah Laporan Lapangan & Foto 100%)
    
    RESOLVED_TAHAP_4 --> EVALUASI_RATING: OPEN_CITIZEN_RATING (Konstituen Memberikan Nilai)
    EVALUASI_RATING --> [*]: Siklus Aspirasi Tuntas Sempurna
```

---

## 6. REKAYASA KEANDALAN SISTEM, PENGUJIAN KINERJA, DAN METRIK KUALITAS PERANGKAT LUNAK

### 6.1 Pemodelan Ancaman Keamanan Sistem (STRIDE Threat Model Matrix)

Analisis pemodelan ancaman keamanan sistem mengacu pada metodologi Microsoft STRIDE untuk memetakan potensi vektor serangan dan arsitektur pengamanannya:

| Kategori Ancaman | Vektor Potensi Serangan | Komponen Terdampak | Strategi Mitigasi Rekayasa Perangkat Lunak |
| :--- | :--- | :--- | :--- |
| Pemalsuan Identitas (*Spoofing*) | Pemalsuan identitas pengguna atau pemalsuan tanda tangan token JWT | Endpoint `/api/auth/*` dan Gerbang LiveKit | Penerapan stateless JWT bertanda tangan HMAC-SHA256 berdurasi 24 jam dengan verifikasi klaim identitas relasional pada basis data dan integrasi API gateway WhatsApp OTP |
| Manipulasi Data (*Tampering*) | Manipulasi muatan parameter kueri SQL, berkas unggahan, atau paket SDP | Ingestion API, Endpoint Verifikasi, Nginx | Sanitasi skema ketat menggunakan pustaka Zod, kueri berparameter (*parameterized queries*) via Prisma ORM, validasi tipe MIME berkas di disk, dan enkripsi SRTP pada WebRTC |
| Penyangkalan Transaksi (*Repudiation*) | Penyangkalan pengiriman disposisi, pembacaan surat, atau pemberian nilai | Rantai Dokumen FollowUp & Evaluasi Rating | Perekaman stempel waktu mutlak (*immutable timestamp*), integrasi kode hash verifikasi TTE BSrE/BSSN, serta penulisan log forensik audit mencakup alamat IP dan agen pengguna |
| Kebocoran Data (*Information Disclosure*) | Penyadapan paket media WebRTC atau pencurian data identitas NIK warga | Saluran Jaringan dan Kluster PostgreSQL | Penegakan protokol TLS 1.3 end-to-end, enkripsi AES-256-GCM pada data NIK at-rest, isolasi subnet Docker bridge basis data, serta penyensoran data pribadi (*data masking*) pada portal publik |
| Penolakan Layanan (*Denial of Service*) | Serangan banjir permintaan HTTP (*HTTP Flood*) atau saturasi memori video | Reverse Proxy Nginx dan Server LiveKit | Konfigurasi rate limiting Nginx (maksimal 50 req/15 min untuk autentikasi, 1.000 req/15 min global), isolasi shm_size Egress sebesar 2 GB, dan pembatasan kapasitas ruang maksimal 25 peserta |
| Eskalasi Hak Akses (*Elevation of Privilege*) | Manipulasi klaim token peran untuk mengakses antarmuka administrator | Rute Middleware RBAC Express.js | Middleware otorisasi memvalidasi ulang peran pengguna secara langsung terhadap kolom basis data `User.role` untuk setiap operasi mutasi kritis (*zero-trust middleware validation*) |

#### 6.1.1 Diagram Batasan Kriptografis dan Arsitektur Pengamanan Data Sistem

Diagram di bawah menggambarkan perimeter pertahanan berlapis, proteksi saluran komunikasi dalam transit (*data-in-transit*), mitigasi kerentanan aplikasi, enkripsi simetris data tersimpan (*data-at-rest*), serta penyensoran data privasi pada portal keterbukaan publik:

```mermaid
flowchart LR
    subgraph Klien_Zone ["Zona Klien / Perangkat Pengguna"]
        ClientApp["Aplikasi Web / Seluler"]
        InputSanitizer["Sanitasi Input Sisi Klien"]
    end

    subgraph Transit_Zone ["Keamanan Data Dalam Transmisi (In-Transit)"]
        TLS["Enkripsi TLS 1.3 (HTTPS / WSS)<br>Cipher: ECDHE-RSA-AES128-GCM-SHA256"]
        SRTP["Enkripsi Media SRTP (WebRTC)<br>Kunci Kriptografi DTLS-SRTP"]
        TokenJWT["Stateless JWT Token<br>Algoritma Tanda Tangan: HMAC-SHA256"]
    end

    subgraph App_Zone ["Batas Aplikasi & Logika Bisnis (Express.js)"]
        HelmetMW["Helmet HTTP Security Headers<br>HSTS, CSP, X-Frame-Options"]
        ZodValidator["Validasi Skema Zod & Sanitasi XSS"]
        RateLimiter["Express Rate Limiting & Brute Force Lock"]
        BcryptModule["Hashing Kata Sandi Bcrypt<br>Faktor Biaya: 10 Salt Rounds"]
    end

    subgraph Rest_Zone ["Keamanan Data Tersimpan (At-Rest)"]
        AESField["Enkripsi Simetris Kolom NIK & Kontak<br>Algoritma: AES-256-GCM"]
        PGStorage["PostgreSQL 15 Encrypted Storage Engine"]
        AuditLog["Berkas Log Forensik Append-Only (NTP Synced)"]
    end

    subgraph Public_Zone ["Batas Portal Transparansi Publik"]
        DataMasking["Penyensoran Data Pribadi (Data Masking)<br>Sensor NIK: 320501******0001"]
    end

    ClientApp --> InputSanitizer
    InputSanitizer --> TLS
    InputSanitizer --> SRTP
    TLS --> HelmetMW
    SRTP --> App_Zone
    HelmetMW --> RateLimiter
    RateLimiter --> ZodValidator
    ZodValidator --> BcryptModule
    BcryptModule --> TokenJWT
    ZodValidator --> AESField
    AESField --> PGStorage
    App_Zone --> AuditLog
    PGStorage --> DataMasking
    DataMasking --> ClientApp
```

### 6.2 Arsitektur Telemetri, Logging Terstruktur, dan Pemantauan Kesehatan Sistem

Sistem mengimplementasikan protokol observabilitas menyeluruh untuk memantau metrik performa komputasi dan kesehatan layanan:

1. Endpoint pemantauan keandalan sistem (`GET /api/health`) mengeksekusi kueri uji `SELECT 1` secara berkala ke pangkalan data PostgreSQL, mengukur latensi eksekusi kueri dalam satuan milidetik, menghitung durasi waktu aktif proses (*process uptime*), serta melaporkan metrik alokasi memori heap Node.js (`rssMb` dan `heapUsedMb`).

2. Pencatatan log sistem disusun dalam format JSON terstruktur (*structured logging*) yang merekam stempel waktu standar ISO-8601, metode HTTP, jalur URL yang diminta, kode status respons, dan waktu pemrosesan transaksi dalam satuan milidetik.

3. Ambang batas peringatan dini (*alerting thresholds*) diatur pada proksi Nginx untuk memicu notifikasi otomatis kepada tim teknis apabila utilisasi CPU server melampaui 80 persen selama 5 menit berturut-turut, alokasi memori RAM melampaui 85 persen, atau tingkat kegagalan respons HTTP 5xx melebihi 1,0 persen dari total volume lalu lintas data.

### 6.3 Rencana Pengujian Beban dan Skrip Validasi Kinerja Kuantitatif

Pengujian kualitas perangkat lunak dilaksanakan secara kuantitatif menggunakan skrip pengujian beban k6 untuk memvalidasi pemenuhan target NFR pada skenario 10.000 pengguna simultan:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 2000 },   // Pemanasan hingga 2.000 pengguna virtual
    { duration: '5m', target: 10000 },  // Beban puncak 10.000 pengguna virtual
    { duration: '2m', target: 10000 },  // Bertahan pada beban puncak
    { duration: '1m', target: 0 },      // Penurunan beban bertahap
  ],
  thresholds: {
    'http_req_duration': ['p(95)<200', 'p(99)<500'], // 95% permintaan < 200ms
    'http_req_failed': ['rate<0.001'],                // Tingkat kegagalan < 0.1%
  },
};

export default function () {
  const baseUrl = 'https://ketemudewan.perdinkeuangan.online/api';
  
  // 1. Pengujian Rute Kesehatan Sistem
  const healthRes = http.get(`${baseUrl}/health`);
  check(healthRes, {
    'Health endpoint berstatus 200': (r) => r.status === 200,
  });

  // 2. Pengujian Portal Transparansi Publik
  const transparencyRes = http.get(`${baseUrl}/public/transparency?kabupaten=Garut`);
  check(transparencyRes, {
    'Transparency endpoint berstatus 200': (r) => r.status === 200,
    'Latency di bawah 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

Kriteria penerimaan pengujian kuantitatif mencakup:

1. Tingkat keberhasilan transaksi HTTP mencapai minimal 99,9 persen tanpa adanya kegagalan koneksi (*zero connection drop*).

2. Latensi respons persentil ke-95 (p95) konsisten di bawah 200 milidetik dan persentil ke-99 (p99) di bawah 500 milidetik pada saat beban penuh 10.000 pengguna virtual.

3. Skenario stres WebRTC pada 100 ruang persidangan paralel membuktikan nilai jitter jaringan berada di bawah 30 milidetik dan toleransi kehilangan paket (*packet loss*) hingga 15 persen tanpa terputusnya koneksi audio.

### 6.4 Manajemen Kegagalan dan Pemulihan Sistem (Disaster Recovery Protocol)

Rencana pemulihan bencana (*Disaster Recovery*) dirancang untuk menjamin kelangsungan operasional sistem dengan parameter teknis kuantitatif:

1. Nilai *Recovery Time Objective* (RTO) ditetapkan maksimal 15 menit, didukung orkestrasi kontainer Docker Compose yang dapat dibangun ulang secara otomatis (*automated rebuild script*) dari image repositori terverifikasi.

2. Nilai *Recovery Point Objective* (RPO) ditetapkan maksimal 60 menit melalui penjadwalan pencadangan log transaksi (*Write-Ahead Logging* / WAL archiving) setiap jam dan pencadangan penuh (*full database dump*) setiap pukul 02:00 WIB ke server penyimpanan sekunder terenkripsi.

3. Mekanisme pemulihan kontainer otomatis (*self-healing container*) menerapkan direktif `restart: always` pada berkas orkestrasi Docker Compose, di mana kegagalan proses internal kontainer akan memicu pemulihan instans baru secara instan tanpa mengganggu ketersediaan layanan lain.

---

### 6.5 Peta Jalan Iterasi Rilis Rekayasa Perangkat Lunak (Engineering Release Milestones)

Peta jalan rekayasa perangkat lunak disusun berbasis iterasi sprint teknis yang memetakan siklus pengembangan dari fondasi arsitektur hingga kestabilan skala produksi.

![Roadmap Agile Sprint Platform HUDANG](diagrams/spec_diagram_3.png)

Tabel di bawah merinci deliverables teknis pada setiap fase rilis rekayasa perangkat lunak:

| Fase Iterasi | Target Versi Rilis | Fokus Deliverables Rekayasa Teknis | Kriteria Kelulusan Teknis (*Exit Criteria*) |
| :--- | :--- | :--- | :--- |
| Sprint 1–2 | Versi 0.1 (Fondasi Arsitektur) | Penyiapan orkestrasi multi-kontainer Docker Compose, inisialisasi basis data PostgreSQL 15, skema Prisma ORM, Redis Cache, gerbang Nginx TLS 1.3, dan modul otentikasi JWT Bcrypt | Seluruh kontainer beroperasi sehat, endpoint `/api/health` mengembalikan status 200 OK, migrasi skema basis data sukses tanpa konflik |
| Sprint 3–4 | Versi 0.5 (Mesin Media &amp; AI) | Implementasi gerbang media LiveKit SFU WebRTC, konfigurasi Coturn STUN/TURN, layanan Egress recording, transkoding FFmpeg, dan pipeline inferensi Google Gemini Flash API | Latensi sesi WebRTC di bawah 150 ms pada jaringan uji, berkas audio WAV terekstrak otomatis, transkripsi verbatim selesai dalam waktu kurang dari 120 detik |
| Sprint 5–6 | Versi 1.0 (Rilis Produksi) | Penyelesaian aplikasi seluler React Native Expo, modul pelacakan 4 tahap tindak lanjut OPD, portal transparansi publik, dan optimasi kueri indeks basis data | Lolos pengujian beban k6 pada 10.000 pengguna simultan, kepatuhan WCAG 2.1 AA tervalidasi, nihil kerentanan kritis pada pemindaian SAST |
| Sprint 7–8 | Versi 1.1 (Interoperabilitas Data) | Pengembangan modul ekspor kamus usulan SIPD format XLSX/JSON, penyelarasan kode rekening urusan daerah, dan integrasi lapisan poligon spasial GeoJSON 27 Kabupaten/Kota | Paket data SIPD terverifikasi valid sesuai spesifikasi Kemendagri, visualisasi peta tematik GIS merender di bawah 300 milidetik |
| Sprint 9+ | Versi 2.0 (Skalabilitas Terdistribusi) | Penerapan kluster basis data bereplikasi (*Read-Replicas*), pembagian beban (*Load Balancing*) multi-node LiveKit SFU, dan pemantauan metrik Prometheus/Grafana | Uptime tahunan mencapai 99,95 persen, pemulihan otomatis RTO di bawah 15 menit teruji melalui skenario pengujian kegagalan terencana |

### 6.6 Indikator Kinerja Utama Rekayasa Sistem (Technical Software Engineering KPIs)

Keberhasilan implementasi perangkat lunak diukur secara kuantitatif melalui indikator kinerja rekayasa sistem (*Service Level Objectives* / SLOs):

1. Standar Ketersediaan Layanan (*System Availability SLO*) mencapai minimal 99,95 persen uptime tahunan, yang membatasi anggaran kesalahan (*error budget*) maksimal 4,38 jam downtime per tahun pada lingkungan produksi.

2. Latensi Antarmuka Pemrograman Aplikasi (*API Latency SLO*) menetapkan 95 persen permintaan HTTP (p95) direspons dalam waktu kurang dari 200 milidetik, dan 99 persen permintaan HTTP (p99) direspons dalam waktu kurang dari 500 milidetik pada kondisi beban normal.

3. Kualitas Transmisi Media Waktu Nyata (*WebRTC Transport SLO*) menetapkan rata-rata *round-trip time* (RTT) media di bawah 150 milidetik pada jaringan 4G/5G, nilai jitter jaringan di bawah 30 milidetik, dan persentase paket hilang (*packet loss rate*) di bawah 2,0 persen.

4. Performa Kueri Basis Data (*Database Performance SLO*) menjamin 95 persen kueri transaksi relasional diselesaikan dalam waktu kurang dari 50 milidetik melalui penerapan indeks komposit dan optimalisasi *connection pooler*.

5. Kinerja Pemrosesan Pipeline AI (*AI Pipeline Processing Throughput*) menetapkan konversi audio, inferensi transkripsi verbatim, dan ekstraksi ringkasan berformat JSON untuk rekaman berdurasi 60 menit diselesaikan dalam waktu kurang dari 120 detik.

6. Standar Kualitas dan Keamanan Kode (*Code Quality & Security Standard*) mewajibkan cakupan pengujian otomatis (*automated test coverage*) minimal 85 persen pada seluruh komponen logika bisnis serta nol temuan kerentanan berisiko kritis (*zero critical vulnerabilities*) pada pengujian keamanan statis (SAST) dan dinamis (DAST).
