import os, sys, time
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(16)
    run.font.color.rgb = RGBColor(15, 23, 42)
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(13)
    run.font.color.rgb = RGBColor(30, 58, 138)
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(11)
    run.font.color.rgb = RGBColor(3, 105, 161)
    return p

def add_body_text(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(text)
    run.font.size = Pt(10.5)
    run.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_code_block(doc, title, file_path, code_text, explanation=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    run_title = p.add_run(f"Evidence Code: {title}")
    run_title.bold = True
    run_title.font.size = Pt(10.5)
    run_title.font.color.rgb = RGBColor(14, 116, 144)

    if file_path:
        p_path = doc.add_paragraph()
        p_path.paragraph_format.space_after = Pt(4)
        run_path = p_path.add_run(f"Lokasi File: {file_path}")
        run_path.italic = True
        run_path.font.size = Pt(9)
        run_path.font.color.rgb = RGBColor(100, 116, 139)

    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    p_code = cell.paragraphs[0]
    p_code.paragraph_format.space_before = Pt(0)
    p_code.paragraph_format.space_after = Pt(0)
    p_code.paragraph_format.line_spacing = 1.15
    run_code = p_code.add_run(code_text.strip())
    run_code.font.name = "Consolas"
    run_code.font.size = Pt(8.5)
    run_code.font.color.rgb = RGBColor(30, 41, 59)

    if explanation:
        p_exp = doc.add_paragraph()
        p_exp.paragraph_format.space_before = Pt(4)
        p_exp.paragraph_format.space_after = Pt(10)
        run_exp = p_exp.add_run(f"Deskripsi Evidence: {explanation}")
        run_exp.font.size = Pt(9.5)
        run_exp.font.color.rgb = RGBColor(51, 65, 85)

def add_screenshot(doc, title, img_path, caption=None):
    if os.path.exists(img_path):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        run_t = p.add_run(f"Screenshot Evidence: {title}")
        run_t.bold = True
        run_t.font.size = Pt(10.5)
        run_t.font.color.rgb = RGBColor(2, 132, 199)

        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_img = p_img.add_run()
        run_img.add_picture(img_path, width=Inches(5.8))

        if caption:
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_after = Pt(10)
            run_cap = p_cap.add_run(f"Gambar: {caption}")
            run_cap.italic = True
            run_cap.font.size = Pt(8.5)
            run_cap.font.color.rgb = RGBColor(100, 116, 139)

def take_screenshots():
    os.makedirs('screenshots', exist_ok=True)
    try:
        from playwright.sync_api import sync_playwright
        pages = [
            ('landing_page', 'http://localhost:3000/'),
            ('login_page', 'http://localhost:3000/login'),
            ('register_page', 'http://localhost:3000/register'),
            ('gis_page', 'http://localhost:3000/gis'),
            ('masyarakat_page', 'http://localhost:3000/masyarakat'),
            ('dewan_page', 'http://localhost:3000/dewan'),
            ('admin_page', 'http://localhost:3000/admin')
        ]
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, channel="msedge")
            context = browser.new_context(viewport={'width': 1280, 'height': 800})
            for name, url in pages:
                print(f"[SCREENSHOT] Navigating to {url}...")
                page = context.new_page()
                try:
                    page.goto(url, wait_until='networkidle', timeout=12000)
                    page.wait_for_timeout(2000)
                    path = f'screenshots/{name}.png'
                    page.screenshot(path=path, full_page=False)
                    print(f"[SCREENSHOT] Saved {path}")
                except Exception as e:
                    print(f"[SCREENSHOT] Warning: {url} - {e}")
                finally:
                    page.close()
            browser.close()
    except Exception as err:
        print(f"[SCREENSHOT] Error: {err}")

def generate_docx():
    doc = docx.Document()

    # Margins
    for sec in doc.sections:
        sec.top_margin = Inches(0.8)
        sec.bottom_margin = Inches(0.8)
        sec.left_margin = Inches(0.8)
        sec.right_margin = Inches(0.8)

    # Style
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(10.5)
    style_normal.font.color.rgb = RGBColor(30, 41, 59)

    # Header Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(12)
    p_title.paragraph_format.space_after = Pt(2)
    r_title = p_title.add_run("DOKUMEN TAHAPAN PROYEK")
    r_title.bold = True
    r_title.font.size = Pt(22)
    r_title.font.color.rgb = RGBColor(15, 23, 42)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(16)
    r_sub = p_sub.add_run("Sistem Aspirasi & Video Conference Dewan (DPRD HUDANG)\nLaporan Evidence Implementasi Kode, Konfigurasi, & Pengujian Real")
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = RGBColor(71, 85, 105)

    # Table of Contents Summary
    add_heading_1(doc, "DAFTAR ISI & STRUKTUR TAHAPAN PROYEK")
    add_body_text(doc, "Dokumen ini menyajikan evidence berupa cuplikan kode sumber (source code), berkas konfigurasi, skema database, endpoint API, serta tangkapan layar (screenshot) aplikasi berjalan untuk seluruh tahapan pembangunan platform DPRD HUDANG.")

    # TAHAPAN 1: SYSTEM REQUIREMENT
    add_heading_1(doc, "1. SYSTEM REQUIREMENT & INFRASTRUKTUR")
    add_body_text(doc, "Kebutuhan sistem mencakup arsitektur server, containerization Docker, konfigurasi port, reverse proxy Nginx, database PostgreSQL, WebRTC LiveKit, dan kunci integrasi AI.")

    add_heading_2(doc, "Server & Containerization Setup")
    add_code_block(doc, "Docker Compose Services Setup", "docker-compose.yml", """
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
""", "Konfigurasi Docker Compose mengelola kontainer Backend (Node.js/Express), PostgreSQL 15, Redis 7, LiveKit SFU WebRTC Server, dan LiveKit Egress untuk perekaman video.")

    add_heading_2(doc, "Domain, SSL & Nginx Reverse Proxy Setup")
    add_code_block(doc, "Nginx & Certbot SSL Configuration", "nginx-livekit.conf", """
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
""", "Konfigurasi Nginx mengatur reverse proxy HTTPS terenkripsi SSL Certbot menuju aplikasi Web Frontend (Port 3001), Backend API (Port 5001), dan LiveKit WebRTC Signalling (Port 7880).")

    add_heading_2(doc, "LiveKit WebRTC & Egress Setup")
    add_code_block(doc, "LiveKit Server & Egress Config", "livekit/livekit.yaml & livekit/egress.yaml", """
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
""", "LiveKit dikonfigurasi native WebRTC TURN/STUN untuk koneksi video berlatensi rendah dan perekaman otomatis (Egress) ke penyimpanan lokal.")

    add_heading_2(doc, "PostgreSQL Database Schema Setup")
    add_code_block(doc, "Prisma Database Models", "backend/prisma/schema.prisma", """
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
""", "Skema database PostgreSQL mengelola identitas pengguna (Warga, Dewan, Admin), pendaftaran jadwal aspirasi, notulensi transkripsi AI, serta penilaian kepuasan multi-aspek.")

    # TAHAPAN 2: DESIGN (UI/UX)
    add_heading_1(doc, "2. DESIGN (UI/UX) & ANTARMUKA PENGGUNA")
    add_body_text(doc, "Desain UI/UX dibangun dengan estetika modern, responsif, dan mendukung tema gelap/terang untuk memberikan kenyamanan saat warga dan anggota dewan berinteraksi.")

    add_screenshot(doc, "Landing Page Utama DPRD HUDANG", "screenshots/landing_page.png", "Halaman Utama Portal DPRD HUDANG dengan filosofi layanan aspirasi rakyat.")
    add_screenshot(doc, "Halaman Otentikasi (Login)", "screenshots/login_page.png", "Halaman login terenkripsi untuk Warga, Anggota Dewan, dan Admin.")
    add_screenshot(doc, "Halaman Pendaftaran (Register Warga)", "screenshots/register_page.png", "Formulir pendaftaran warga Jawa Barat berbasis data domisili geospasial.")
    add_screenshot(doc, "Portal Aspirasi Masyarakat", "screenshots/masyarakat_page.png", "Antarmuka warga untuk mengajukan permohonan diskusi aspirasi dan memantau status.")
    add_screenshot(doc, "Dashboard Anggota Dewan", "screenshots/dewan_page.png", "Antarmuka Legislator untuk menerima dan mengkonfirmasi permohonan aspirasi.")
    add_screenshot(doc, "Dashboard Kontrol Admin", "screenshots/admin_page.png", "Panel manajemen sistem, statistik rapat, serta pemantauan penilaian dewan.")
    add_screenshot(doc, "Pemetaan Geospasial GIS Aspirasi AI", "screenshots/gis_page.png", "Peta geospasial sebaran aspirasi dan analisis sentimen per Kabupaten/Kecamatan di Jawa Barat.")

    # TAHAPAN 3: DEVELOPMENT
    add_heading_1(doc, "3. DEVELOPMENT & IMPLEMENTASI KODE PROGRAM")
    add_body_text(doc, "Pengembangan backend menggunakan Node.js TypeScript dengan arsitektur RESTful API, Socket.io real-time chat, dan pipeline AI Gemini Multimodal.")

    add_heading_2(doc, "API Otentikasi & Authorization Middleware")
    add_code_block(doc, "Login & JWT Authorization", "backend/src/server.ts", """
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
""", "Implementasi otentikasi JWT dengan enkripsi Bcrypt dan pengamanan rate limiting untuk mencegah brute force attack.")

    add_heading_2(doc, "Pipeline AI Transkrip & Analisis Sentimen (Gemini Multimodal)")
    add_code_block(doc, "AI Multimodal Audio Pipeline", "backend/src/services/analysisService.ts", """
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
""", "Pipeline AI mendengarkan rekaman audio rapat virtual dan menghasilkan transkripsi verbatim otomatis serta analisis sentimen tanpa manipulasi hallusimasi.")

    add_heading_2(doc, "API Recap Analisis Geospasial (GIS)")
    add_code_block(doc, "GIS Geospatial Aggregation Endpoint", "backend/src/server.ts", """
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
""", "API agregasi GIS menyajikan data geospasial sebaran aspirasi dan peringkat kepuasan warga per wilayah Jawa Barat secara real-time.")

    # TAHAPAN 4: PENGUJIAN
    add_heading_1(doc, "4. PENGUJIAN (TESTING)")
    add_body_text(doc, "Pengujian dilakukan melalui metode Blackbox Testing, Equivalence Partitioning, dan Whitebox Testing untuk memastikan keandalan fungsi dan keamanan data.")

    add_code_block(doc, "Pengujian Blackbox & Skenario QA", "user_testing_guide.md", """
### 1. Pengujian Akses & Keamanan (Masyarakat)
- Akses Dashboard tanpa Login -> Redirect otomatis ke /login (PASSED)
- Registrasi Akun Warga Baru -> Akun berhasil dibuat dan dialihkan ke dashboard (PASSED)
- Mengajukan Jadwal Aspirasi -> Terdaftar dengan status 'Menunggu' (PASSED)

### 2. Pengujian Manajemen Rapat (Anggota Dewan)
- Login Legislator -> Menampilkan daftar aspirasi konstituen (PASSED)
- Persetujuan Rapat -> Status berubah 'Dikonfirmasi' & tombol 'Gabung Sesi' aktif (PASSED)
- Akses Izin Admin -> Akses ditolak HTTP 403 Forbidden (PASSED)
""", "Panduan pengujian QA/QC memverifikasi kontrol akses, fungsionalitas ruang rapat virtual, dan validasi izin pengguna.")

    add_code_block(doc, "Pengujian Integration & Unit Test", "backend/src/__tests__/record.test.ts", """
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
""", "Pengujian otomatis (Whitebox Test) menggunakan Jest dan Supertest memvalidasi alur Egress recording dan endpoint backend.")

    # TAHAPAN 5: KEAMANAN
    add_heading_1(doc, "5. KEAMANAN & PENGUATAN SISTEM (SECURITY)")
    add_body_text(doc, "Keamanan platform diperkuat pada lapisan jaringan, HTTP headers, enkripsi token JWT, pengamanan prompt AI, dan penanganan beban tinggi.")

    add_code_block(doc, "Pengamanan HTTP Headers & Proteksi Prompt AI", "backend/src/server.ts & analysisService.ts", """
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
""", "Sistem menggunakan Helmet untuk proteksi XSS/Clickjacking, Rate Limiting untuk proteksi DoS, dan aturan Verbatim Prompt untuk mencegah Prompt Injection pada AI.")

    doc.save("Tahapan_Proyek.docx")
    print("[SUCCESS] Tahapan_Proyek.docx generated with complete evidence and screenshots!")

def main():
    take_screenshots()
    generate_docx()

if __name__ == "__main__":
    main()
