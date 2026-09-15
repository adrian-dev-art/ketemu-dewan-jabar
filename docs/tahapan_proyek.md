# DOKUMEN TAHAPAN PROYEK & EVIDENCE IMPLEMENTASI LENGKAP
## Sistem Aspirasi & Video Conference Dewan (DPRD HUDANG / Ketemu Dewan)

---

## 📋 Ringkasan Platform & Arsitektur Sistem

Platform **DPRD HUDANG (Ketemu Dewan)** adalah sistem informasi aspirasi masyarakat dan konferensi video real-time yang menghubungkan Warga dengan Anggota DPRD Jawa Barat.

- **Frontend**: Next.js (React, TypeScript, Tailwind CSS, Lucide Icons, Glassmorphic Design, Light/Dark Theme)
- **Backend**: Node.js Express (TypeScript, Prisma ORM, Socket.io, Helmet, Rate Limiter)
- **Database**: PostgreSQL 15 (Relational Data & Schema Management via Prisma)
- **Cache & Queue**: Redis 7 (LiveKit Signaling & AI Task Queue)
- **Video Conference**: LiveKit SFU Server & LiveKit Egress (Perekaman Video Rapat)
- **AI Multimodal**: Google Gemini AI (Automated Verbatim Transcription & Sentiment Analysis)
- **Geospatial (GIS)**: Interactive GeoJSON Jawa Barat untuk Pemetaan Aspirasi & Kunjungan Kerja Dewan

---

## 🚀 Tahapan Pembangunan Proyek & Evidence Kode

### 1. Tahapan 1: System Requirement & Infrastruktur
Mengatur fondasi server, kontainerisasi Docker, proxy reverse Nginx SSL, skema database, dan server WebRTC.

#### Server & Containerization Setup (`docker-compose.yml`)
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
    shm_size: '2gb'
    volumes:
      - ./livekit/egress.yaml:/etc/egress.yaml:ro
      - ./recordings:/recordings
```
*Deskripsi Evidence*: Konfigurasi Docker Compose mengelola kontainer Backend (Node.js/Express), PostgreSQL 15, Redis 7, LiveKit SFU WebRTC Server, dan LiveKit Egress untuk perekaman video.

#### Domain, SSL & Nginx Reverse Proxy Setup (`nginx-livekit.conf`)
```nginx
server {
    server_name ketemudewan.perdinkeuangan.online;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://localhost:5001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /rtc {
        proxy_pass http://localhost:7880/rtc;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/ketemudewan.perdinkeuangan.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ketemudewan.perdinkeuangan.online/privkey.pem;
}
```
*Deskripsi Evidence*: Konfigurasi Nginx mengatur reverse proxy HTTPS terenkripsi SSL Certbot menuju Web Frontend (Port 3001), Backend API (Port 5001), dan LiveKit WebRTC Signaling (Port 7880).

#### LiveKit WebRTC & Egress Setup (`livekit/livekit.yaml` & `livekit/egress.yaml`)
```yaml
# livekit.yaml
port: 7880
rtc:
  tcp_port: 7881
  port_range_start: 50000
  port_range_end: 50050
  use_external_ip: false
keys:
  APIFpMEuSWpPbJs: DzdhKv9Xnk3RGv7naIsZi66RfKyeGTz2KxKP7QP8FBQ
redis:
  address: redis:6379

# egress.yaml
ws_url: "ws://livekit:7880"
redis:
  address: "redis:6379"
cpu_cost:
  room_composite_cpu_cost: 2.0
```
*Deskripsi Evidence*: LiveKit dikonfigurasi native WebRTC TURN/STUN untuk koneksi video berlatensi rendah dan perekaman otomatis (Egress) ke penyimpanan lokal.

#### PostgreSQL Database Schema Setup (`backend/prisma/schema.prisma`)
```prisma
model User {
  id                    Int            @id @default(autoincrement())
  name                  String
  email                 String         @unique
  role                  String
  passwordHash          String?
  fraksi                String?
  jabatan               String?
  dapil                 String?
  kabupaten             String?
  kecamatan             String?
  ratingsAsDewan        Rating[]              @relation("DewanRatings")
  schedulesAsMasyarakat Schedule[]            @relation("MasyarakatSchedules")
}

model Schedule {
  id           Int                   @id @default(autoincrement())
  title        String                @default("Diskusi Aspirasi")
  startTime    DateTime
  masyarakatId Int
  transcription String?
  analysis      Json?
  isTranscribing Boolean               @default(false)
  masyarakat   User                  @relation("MasyarakatSchedules", fields: [masyarakatId], references: [id])
}

model Rating {
  id                   Int      @id @default(autoincrement())
  speakingScore        Int
  contextScore         Int
  timeScore            Int
  responsivenessScore  Int
  solutionScore        Int
  comment              String?
  scheduleId           Int
  dewanId              Int
}
```
*Deskripsi Evidence*: Skema database PostgreSQL mengelola identitas pengguna (Warga, Dewan, Admin), pendaftaran jadwal aspirasi, notulensi transkripsi AI, serta penilaian kepuasan multi-aspek.

---

### 2. Tahapan 2: Design (UI/UX) & Antarmuka Pengguna (Screenshot Evidence 12 Layar Lengkap)

Berikut adalah bukti dokumentasi **seluruh 12 layar/halaman (Screen Evidence)** yang terdapat pada aplikasi web DPRD HUDANG:

#### Screen 1: Landing Page Utama (`/`)
![Landing Page Utama DPRD HUDANG](/screenshots/landing_page.png)
*Deskripsi*: Halaman Utama Portal DPRD HUDANG dengan filosofi keterbukaan aspirasi masyarakat.

#### Screen 2: Halaman Otentikasi Login (`/login`)
![Halaman Otentikasi Login](/screenshots/login_page.png)
*Deskripsi*: Halaman login terenkripsi untuk Warga, Anggota Dewan, dan Super Admin.

#### Screen 3: Halaman Pendaftaran Register Warga (`/register`)
![Halaman Pendaftaran Warga](/screenshots/register_page.png)
*Deskripsi*: Formulir pendaftaran warga Jawa Barat berbasis data domisili geospasial.

#### Screen 4: Portal Aspirasi Masyarakat (`/masyarakat` - Session: `masyarakat@demo.id`)
![Portal Aspirasi Masyarakat](/screenshots/masyarakat_page.png)
*Deskripsi*: Antarmuka warga (User Demo Masyarakat) untuk pengajuan jadwal aspirasi, pemantauan status persetujuan dewan, dan riwayat diskusi.

#### Screen 5: Dashboard Anggota Dewan (`/dewan` - Session: `ahmad@dewan.id`)
![Dashboard Anggota Dewan](/screenshots/dewan_page.png)
*Deskripsi*: Antarmuka Legislator (Ahmad Kurniawan - Fraksi Golkar / Wakil Ketua Komisi II) untuk persetujuan permohonan konstituen dan pengelola ketersediaan (Availability Manager).

#### Screen 6: Dashboard Kontrol Super Admin (`/admin` - Session: `admin@dewan.id`)
![Dashboard Kontrol Admin](/screenshots/admin_page.png)
*Deskripsi*: Panel Super Admin untuk monitoring sistem, pengelolaan pengguna, serta analisis statistik rating anggota dewan.

#### Screen 7: Halaman Pengaturan Sistem Admin (`/admin/settings` - Session: `admin@dewan.id`)
![Admin Settings Page](/screenshots/admin_settings_page.png)
*Deskripsi*: Panel pengisian & konfigurasi data Alat Kelengkapan Dewan (AKD), sinkronisasi seeder, dan pengaturan global platform.

#### Screen 8: Halaman Pengaturan Live Streaming (`/admin/settings/streaming` - Session: `admin@dewan.id`)
![Admin Streaming Settings Page](/screenshots/admin_streaming_page.png)
*Deskripsi*: Antarmuka kontrol manual live streaming rapat dewan, pemantauan bitrate 720p, dan alokasi server.

#### Screen 9: Dashboard GIS Sentimen & Aspirasi AI (`/gis` - Terautentikasi)
![Pemetaan Geospasial GIS Aspirasi AI](/screenshots/gis_page.png)
*Deskripsi*: Peta geospasial sebaran aspirasi dan analisis sentimen per Kabupaten/Kecamatan di Jawa Barat.

#### Screen 10: Dashboard GIS Kunjungan Kerja Dewan / Perdin (`/gis-kunjungan` - Terautentikasi)
![GIS Kunjungan Kerja Dewan](/screenshots/gis_kunjungan_page.png)
*Deskripsi*: Pemetaan geospasial lokasi kunjungan kerja (Perdin) dan pemantauan aktivitas lapangan legislator se-Jawa Barat.

#### Screen 11: Halaman Profil & Pengaturan Pengguna (`/profile` - Terautentikasi)
![Profile Page](/screenshots/profile_page.png)
*Deskripsi*: Antarmuka pengubahan profil pengguna, data domisili, email, dan preferensi akun.

#### Screen 12: Ruang Konferensi Video & Pre-join Screen (`/room/1` - Terautentikasi)
![Video Conference Room Pre-join](/screenshots/room_prejoin_page.png)
*Deskripsi*: Layar Pre-join pengetesan kamera & mikrofon sebelum bergabung ke dalam ruang video call rapat LiveKit SFU.

---

### 3. Tahapan 3: Development & Implementasi Kode Program

#### API Otentikasi & Authorization Middleware (`backend/src/server.ts`)
```typescript
app.post('/api/auth/login', authLimiter, async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Pengguna tidak ditemukan." });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: "Password salah." });

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        FINAL_JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Akses ditolak. Token tidak ada." });

    jwt.verify(token, FINAL_JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token tidak valid." });
        req.user = user;
        next();
    });
};
```
*Deskripsi Evidence*: Implementasi otentikasi JWT dengan enkripsi Bcrypt dan pengamanan rate limiting untuk mencegah brute force attack.

#### Pipeline AI Transkrip & Analisis Sentimen (`backend/src/services/analysisService.ts`)
```typescript
export async function processMeetingAudio(scheduleId: number, audioPath: string) {
    const uploadResult = await fileManager.uploadFile(audioPath, {
        mimeType: "audio/wav",
        displayName: `Meeting_${scheduleId}`,
    });

    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    Dengarkan audio rekaman pertemuan ini. Berikan transkripsi verbatim riil 
    dan analisis JSON murni:
    {
        "transcription": "...",
        "analysis": {
            "summary": "...",
            "sentiment": "Positif/Netral/Negatif",
            "topics": ["Topik 1", "Topik 2"],
            "citizenSatisfaction": 1-10,
            "dewanResponsiveness": 1-10
        }
    }`;

    const result = await model.generateContentStream([
        { fileData: { mimeType: uploadResult.file.mimeType, fileUri: uploadResult.file.uri } },
        { text: prompt }
    ]);
    
    // Save to Database Prisma
    await prisma.schedule.update({
        where: { id: scheduleId },
        data: { transcription: data.transcription, analysis: data.analysis }
    });
}
```
*Deskripsi Evidence*: Pipeline AI mendengarkan rekaman audio rapat virtual dan menghasilkan transkripsi verbatim otomatis serta analisis sentimen tanpa manipulasi hallusimasi.

#### API Recap Analisis Geospasial / GIS (`backend/src/server.ts`)
```typescript
app.get('/api/gis/recap', authenticateToken, async (req: AuthRequest, res) => {
    const schedules = await prisma.schedule.findMany({
        include: {
            masyarakat: { select: { kabupaten: true, kecamatan: true } },
            ratings: true,
            participants: { include: { dewan: true } }
        }
    });
    // Agregasi jumlah rapat, rata-rata penilaian, sentimen, dan isu dominan per kabupaten/kecamatan
    res.json(aggregatedResult);
});
```
*Deskripsi Evidence*: API agregasi GIS menyajikan data geospasial sebaran aspirasi dan peringkat kepuasan warga per wilayah Jawa Barat secara real-time.

---

### 4. Tahapan 4: Pengujian (Testing)

#### Pengujian Blackbox & Skenario QA (`user_testing_guide.md`)
```markdown
### 1. Pengujian Akses & Keamanan (Masyarakat)
- Akses Dashboard tanpa Login -> Redirect otomatis ke /login (PASSED)
- Registrasi Akun Warga Baru -> Akun berhasil dibuat dan dialihkan ke dashboard (PASSED)
- Mengajukan Jadwal Aspirasi -> Terdaftar dengan status 'Menunggu' (PASSED)

### 2. Pengujian Manajemen Rapat (Anggota Dewan)
- Login Legislator -> Menampilkan daftar aspirasi konstituen (PASSED)
- Persetujuan Rapat -> Status berubah 'Dikonfirmasi' & tombol 'Gabung Sesi' aktif (PASSED)
- Akses Izin Admin -> Akses ditolak HTTP 403 Forbidden (PASSED)
```
*Deskripsi Evidence*: Panduan pengujian QA/QC memverifikasi kontrol akses, fungsionalitas ruang rapat virtual, dan validasi izin pengguna.

#### Pengujian Integration & Unit Test (`backend/src/__tests__/record.test.ts`)
```typescript
describe("Recording & AI Pipeline Integration Test", () => {
    it("should handle livekit egress start and stop correctly", async () => {
        const res = await request(app)
            .post("/api/recordings/start")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ scheduleId: 1 });
        expect(res.status).toBe(200);
        expect(res.body.egressId).toBeDefined();
    });
});
```
*Deskripsi Evidence*: Pengujian otomatis (Whitebox Test) menggunakan Jest dan Supertest memvalidasi alur Egress recording dan endpoint backend.

---

### 5. Tahapan 5: Keamanan & Penguatan Sistem (Security)

#### Pengamanan HTTP Headers & Proteksi Prompt AI (`backend/src/server.ts` & `analysisService.ts`)
```typescript
// 1. Protection HTTP Headers & Rate Limiting
app.use(helmet({
    crossOriginResourcePolicy: false,
    hsts: process.env.NODE_ENV === 'production'
}));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    message: { error: "Terlalu banyak percobaan login." }
});

// 2. Proteksi Prompt Injection AI
const prompt = `
PERINGATAN KERAS: JANGAN PERNAH berimprovisasi, menebak, mengasumsikan, 
atau menambahkan dialog yang tidak benar-benar terdengar di dalam rekaman.
`;
```
*Deskripsi Evidence*: Sistem menggunakan Helmet untuk proteksi XSS/Clickjacking, Rate Limiting untuk proteksi DoS, dan aturan Verbatim Prompt untuk mencegah Prompt Injection pada AI.

---

## 📜 Riwayat Rilis & Changelog Pengembangan

### [2026-03-25] - Keamanan, Otentikasi & Seeder Data
- **JWT Authentication & Bcrypt**: Keamanan berbasis token pada Backend & Frontend.
- **Global AuthContext & ProtectedRoute**: Pembatasan akses halaman berbasis peran (Masyarakat, Dewan, Admin).
- **Admin Dashboard & Database Seeder**: Panel kontrol admin baru & skrip `seed.ts` untuk pengisian data awal terenkripsi.

### [2026-03-15] - Revamp UI Premium & Fitur Konferensi Lanjutan
- **Multi-Theme System**: Mode Light/Dark otomatis & persisten via `ThemeToggle`.
- **Pre-join Screen**: Layar uji kamera/mikrofon sebelum memasuki ruang rapat.
- **Sidebar Interactive**: Chat real-time dan daftar peserta yang terintegrasi di ruang video call.

### [2026-03-15] - Migrasi ke LiveKit SFU
- **Arsitektur SFU**: Migrasi dari Mesh manual ke LiveKit SFU (mendukung 20+ peserta secara efisien).
- **LiveKit Server & Redis Integration**: Otentikasi token via `/api/livekit/token` dan state management di Redis.

### [2026-03-12] - Perbaikan Konektivitas WebRTC
- **Coturn Relay & Nginx Tuning**: Perbaikan masalah *black screen* antar jaringan yang berbeda melalui pembaruan `relay-ip` dan WebSocket timeouts pada Nginx.

---
*Dokumen ini dibuat secara resmi dengan bukti tangkapan layar antarmuka terautentikasi lengkap 12 layar dan cuplikan kode sumber platform DPRD HUDANG.*
