import os
import subprocess

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
OUTPUT_DIR = os.path.abspath("docs/diagrams")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Common HTML Head & Style
COMMON_STYLE = """
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
        background-color: #F8FAFC;
        color: #0F172A;
        padding: 32px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
    }
    .diagram-container {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
        width: 100%;
        max-width: 1320px;
    }
    .header-bar {
        border-bottom: 2px solid #E2E8F0;
        padding-bottom: 20px;
        margin-bottom: 28px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }
    .title-main {
        font-size: 20px;
        font-weight: 700;
        color: #1E3A8A;
        letter-spacing: -0.02em;
        text-transform: uppercase;
    }
    .subtitle-main {
        font-size: 13px;
        color: #64748B;
        margin-top: 4px;
        font-weight: 500;
    }
    .badge-doc {
        background: #EFF6FF;
        color: #1D4ED8;
        border: 1px solid #BFDBFE;
        font-size: 11px;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 6px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }
    .card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .card-title {
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .card-desc {
        font-size: 11.5px;
        color: #475569;
        line-height: 1.5;
    }
    .arrow-right {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94A3B8;
        font-weight: 800;
        font-size: 18px;
    }
    .stage-badge {
        display: inline-block;
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 4px;
        margin-bottom: 8px;
        text-transform: uppercase;
    }
    .bg-blue { background: #EFF6FF; color: #1E40AF; border: 1px solid #DBEAFE; }
    .bg-amber { background: #FFFBEB; color: #92400E; border: 1px solid #FEF3C7; }
    .bg-purple { background: #FAF5FF; color: #6B21A8; border: 1px solid #F3E8FF; }
    .bg-indigo { background: #EEF2FF; color: #3730A3; border: 1px solid #E0E7FF; }
    .bg-emerald { background: #ECFDF5; color: #065F46; border: 1px solid #D1FAE5; }
    .bg-slate { background: #F1F5F9; color: #334155; border: 1px solid #E2E8F0; }
</style>
"""

DIAGRAMS = {}

# Diagram 1: SOP Alur Makro
DIAGRAMS["sop_diagram_1"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_STYLE}</head>
<body>
<div class="diagram-container" style="max-width: 1360px;">
    <div class="header-bar">
        <div>
            <div class="title-main">Alur Makro Pengelolaan Aspirasi dan E-Audiensi (End-to-End)</div>
            <div class="subtitle-main">Standar Operasional Prosedur Sekretariat DPRD Provinsi Jawa Barat &bull; Platform HUDANG</div>
        </div>
        <div class="badge-doc">SOP-HUDANG-01 &bull; Tahap 1 s.d. 5</div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr auto 1fr; gap: 12px; align-items: stretch;">
        <!-- Tahap 1 -->
        <div class="card" style="border-top: 4px solid #2563EB;">
            <span class="stage-badge bg-blue">Tahap 1</span>
            <div class="card-title" style="color: #1E40AF;">Penerimaan & Registrasi</div>
            <div class="card-desc">
                1. Warga akses Portal / Mobile App.<br>
                2. Input formulir usulan & NIK.<br>
                3. Ekstraksi AI & deteksi duplikasi.<br>
                4. Terbit <b>Tracking Number</b> unik & tanda terima digital.
            </div>
        </div>
        
        <div class="arrow-right">&rarr;</div>
        
        <!-- Tahap 2 -->
        <div class="card" style="border-top: 4px solid #D97706;">
            <span class="stage-badge bg-amber">Tahap 2</span>
            <div class="card-title" style="color: #B45309;">Verifikasi ASN</div>
            <div class="card-desc">
                1. Desk verifikasi berkas oleh ASN.<br>
                2. Filter kewenangan Provinsi Jabar.<br>
                3. Klasifikasi Komisi I s.d. V.<br>
                4. Penetapan: <b>Diterima</b>, <b>Perbaikan 3x24 Jam</b>, atau <b>Pelimpahan</b>.
            </div>
        </div>
        
        <div class="arrow-right">&rarr;</div>
        
        <!-- Tahap 3 -->
        <div class="card" style="border-top: 4px solid #7C3AED;">
            <span class="stage-badge bg-purple">Tahap 3</span>
            <div class="card-title" style="color: #6D28D9;">E-Audiensi Virtual</div>
            <div class="card-desc">
                1. Konfirmasi jadwal oleh Dewan.<br>
                2. Sesi video WebRTC LiveKit SFU.<br>
                3. Perekaman audio via Egress.<br>
                4. <b>Transkrip AI Verbatim</b> & rating multi-aspek konstituen.
            </div>
        </div>
        
        <div class="arrow-right">&rarr;</div>
        
        <!-- Tahap 4 -->
        <div class="card" style="border-top: 4px solid #4F46E5;">
            <span class="stage-badge bg-indigo">Tahap 4</span>
            <div class="card-title" style="color: #4338CA;">Disposisi OPD</div>
            <div class="card-desc">
                1. Terbit Surat Disposisi Resmi DPRD.<br>
                2. Konfirmasi baca pejabat OPD.<br>
                3. Surat Tanggapan & rencana aksi.<br>
                4. <b>Laporan Hasil Lapangan 100%</b> & bukti dokumentasi fisik.
            </div>
        </div>
        
        <div class="arrow-right">&rarr;</div>
        
        <!-- Tahap 5 -->
        <div class="card" style="border-top: 4px solid #059669;">
            <span class="stage-badge bg-emerald">Tahap 5</span>
            <div class="card-title" style="color: #047857;">Integrasi & Keterbukaan</div>
            <div class="card-desc">
                1. Kurasi Pokir untuk belanja daerah.<br>
                2. Standardisasi format <b>SIPD/RKPD</b>.<br>
                3. Tautan kamus usulan Musrenbang.<br>
                4. Publikasi status tuntas di <b>Portal Transparansi Publik</b>.
            </div>
        </div>
    </div>
    
    <div style="margin-top: 24px; padding: 14px 20px; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; font-size: 12px; color: #475569; display: flex; justify-content: space-between; align-items: center;">
        <div><b>Indikator Kunci SLA:</b> Penerbitan Tiket &lt; 5 Detik &bull; Verifikasi ASN &le; 1x24 Jam &bull; Tanggapan OPD &le; 5x24 Jam &bull; Tuntas Lapangan &le; 14 Hari</div>
        <div style="font-weight: 600; color: #059669;">Target Resolusi Capaian: 70% Tuntas Paripurna</div>
    </div>
</div>
</body>
</html>"""

# Diagram 2: SOP Verifikasi ASN
DIAGRAMS["sop_diagram_2"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_STYLE}</head>
<body>
<div class="diagram-container" style="max-width: 1240px;">
    <div class="header-bar">
        <div>
            <div class="title-main">Alur Rinci Verifikasi dan Klasifikasi Berkas ASN</div>
            <div class="subtitle-main">Standar Operasional Penapisan Berkas di Lingkungan Sekretariat DPRD Jawa Barat</div>
        </div>
        <div class="badge-doc">SOP-HUDANG-02 &bull; Desk Verification</div>
    </div>

    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 24px;">
        <div class="card" style="flex: 1; border-left: 4px solid #3B82F6;">
            <div class="card-title" style="color: #1D4ED8;">1. Usulan Masuk Antrean</div>
            <div class="card-desc">Aspirasi atau jadwal audiensi warga terdaftar otomatis dengan Tracking Number digital.</div>
        </div>
        <div class="arrow-right">&rarr;</div>
        <div class="card" style="flex: 1.2; border-left: 4px solid #6366F1;">
            <div class="card-title" style="color: #4338CA;">2. Validasi NIK & 15 Dapil</div>
            <div class="card-desc">Pemeriksaan format NIK kependudukan, keaktifan kontak WhatsApp, dan domisili 27 Kab/Kota.</div>
        </div>
        <div class="arrow-right">&rarr;</div>
        <div class="card" style="flex: 1.4; border-left: 4px solid #8B5CF6;">
            <div class="card-title" style="color: #6D28D9;">3. Analisis & Rekomendasi AI</div>
            <div class="card-desc">Ekstraksi entitas masalah, deteksi kemiripan naskah usulan, dan saran penugasan Komisi I sampai V.</div>
        </div>
    </div>

    <div style="padding: 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
        <div style="font-size: 13px; font-weight: 700; color: #1E293B; margin-bottom: 14px; text-transform: uppercase;">
            Keputusan Desk Verifikasi ASN Sekretariat (Paling Lambat 1x24 Jam):
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            <div class="card" style="border-top: 3px solid #10B981; background: #FFFFFF;">
                <div class="card-title" style="color: #047857;">A. Memenuhi Syarat (Valid)</div>
                <div class="card-desc">Usulan lengkap, relevan dengan urusan Provinsi. Diteruskan ke Meja Komisi, Fraksi, atau diterbitkan Surat Disposisi Resmi.</div>
            </div>
            <div class="card" style="border-top: 3px solid #F59E0B; background: #FFFFFF;">
                <div class="card-title" style="color: #B45309;">B. Permintaan Perbaikan</div>
                <div class="card-desc">Kekurangan berkas/bukti pendukung. Notifikasi perbaikan dikirim ke pemohon dengan batas waktu 3x24 jam kerja.</div>
            </div>
            <div class="card" style="border-top: 3px solid #EF4444; background: #FFFFFF;">
                <div class="card-title" style="color: #B91C1C;">C. Pelimpahan Kewenangan</div>
                <div class="card-desc">Materi merupakan kewenangan Pemerintah Pusat / Kabupaten / Kota. Sistem menerbitkan Surat Rekomendasi Pelimpahan Wilayah.</div>
            </div>
        </div>
    </div>
</div>
</body>
</html>"""

# Diagram 3: SOP E-Audiensi
DIAGRAMS["sop_diagram_3"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_STYLE}</head>
<body>
<div class="diagram-container" style="max-width: 1240px;">
    <div class="header-bar">
        <div>
            <div class="title-main">Alur Kerja E-Audiensi Virtual dan Perekaman Resmi</div>
            <div class="subtitle-main">Mekanisme Pelaksanaan Tatap Muka Daring Melalui Media WebRTC LiveKit SFU</div>
        </div>
        <div class="badge-doc">SOP-HUDANG-03 &bull; Virtual Hearing</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
        <!-- Fase 1 -->
        <div class="card" style="border-top: 4px solid #3B82F6;">
            <span class="stage-badge bg-blue">Fase 1: Pra-Sesi Audiensi</span>
            <div class="card-title" style="color: #1E40AF; font-size: 14px;">Persiapan & Penjadwalan</div>
            <div class="card-desc" style="margin-top: 10px;">
                <b>Langkah 1:</b> Konstituen memilih slot waktu pada kalender ketersediaan dewan.<br><br>
                <b>Langkah 2:</b> Anggota Dewan mengonfirmasi permohonan melalui dashboard dewan.<br><br>
                <b>Langkah 3:</b> Tautan ruang video terenkripsi diterbitkan secara otomatis.<br><br>
                <b>Langkah 4:</b> Uji teknis kamera dan mikrofon pada komponen <i>Pre-Join Screen</i>.
            </div>
        </div>

        <!-- Fase 2 -->
        <div class="card" style="border-top: 4px solid #8B5CF6;">
            <span class="stage-badge bg-purple">Fase 2: Pelaksanaan Sesi</span>
            <div class="card-title" style="color: #6D28D9; font-size: 14px;">Pertemuan Tatap Muka Virtual</div>
            <div class="card-desc" style="margin-top: 10px;">
                <b>Langkah 5:</b> Peserta bergabung ke ruang rapat terisolasi LiveKit SFU.<br><br>
                <b>Langkah 6:</b> Aktivasi perekaman komposit audio resmi melalui layanan <i>LiveKit Egress</i>.<br><br>
                <b>Langkah 7:</b> Pemaparan aspirasi warga dan tanggapan legislator disertai fitur obrolan teks terenkripsi.<br><br>
                <b>Langkah 8:</b> Penutupan sesi rapat dan pemutusan media stream secara aman.
            </div>
        </div>

        <!-- Fase 3 -->
        <div class="card" style="border-top: 4px solid #10B981;">
            <span class="stage-badge bg-emerald">Fase 3: Pasca-Sesi Audiensi</span>
            <div class="card-title" style="color: #047857; font-size: 14px;">Pemrosesan AI & Evaluasi</div>
            <div class="card-desc" style="margin-top: 10px;">
                <b>Langkah 9:</b> Berkas audio dikirim ke Google Gemini AI untuk transkripsi verbatim kata demi kata.<br><br>
                <b>Langkah 10:</b> Ekstraksi intisari pembahasan, analisis sentimen, dan butir tindakan format JSON murni.<br><br>
                <b>Langkah 11:</b> Notulensi rapat digital tersimpan otomatis pada basis data.<br><br>
                <b>Langkah 12:</b> Warga mengisi formulir evaluasi kepuasan kinerja legislator (5 dimensi skor).
            </div>
        </div>
    </div>
</div>
</body>
</html>"""

# Diagram 4: SOP Followup 4 Tahap
DIAGRAMS["sop_diagram_4"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_STYLE}</head>
<body>
<div class="diagram-container" style="max-width: 1240px;">
    <div class="header-bar">
        <div>
            <div class="title-main">Alur Pelacakan Empat Tahap Tindak Lanjut Perangkat Daerah (OPD)</div>
            <div class="subtitle-main">Rantai Akuntabilitas Penanganan Aspirasi Menuju Status Tuntas Paripurna (100%)</div>
        </div>
        <div class="badge-doc">SOP-HUDANG-04 &bull; 4-Stage Tracker</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; gap: 10px; align-items: stretch;">
        <div class="card" style="border-top: 4px solid #3B82F6; text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #2563EB; margin-bottom: 4px;">25%</div>
            <div class="card-title" style="justify-content: center; color: #1E40AF;">Tahap 1: Disposisi Terbit</div>
            <div class="card-desc" style="text-align: left; margin-top: 8px;">
                Sekretariat DPRD menerbitkan Surat Disposisi Resmi bernomor digital ke dinas teknis terkait.
            </div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-top: 4px solid #6366F1; text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #4F46E5; margin-bottom: 4px;">50%</div>
            <div class="card-title" style="justify-content: center; color: #3730A3;">Tahap 2: Dilihat / Dibaca</div>
            <div class="card-desc" style="text-align: left; margin-top: 8px;">
                Pejabat penghubung instansi OPD membuka lembar disposisi, sistem mencatat waktu baca resmi.
            </div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-top: 4px solid #D97706; text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #D97706; margin-bottom: 4px;">75%</div>
            <div class="card-title" style="justify-content: center; color: #92400E;">Tahap 3: Tanggapan OPD</div>
            <div class="card-desc" style="text-align: left; margin-top: 8px;">
                Pimpinan OPD mengunggah Surat Tanggapan Resmi beserta komitmen rencana aksi lapangan.
            </div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-top: 4px solid #10B981; text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #059669; margin-bottom: 4px;">100%</div>
            <div class="card-title" style="justify-content: center; color: #065F46;">Tahap 4: Tuntas Lapangan</div>
            <div class="card-desc" style="text-align: left; margin-top: 8px;">
                Tim teknis OPD mengunggah Laporan Hasil Akhir & foto dokumentasi fisik. Status menjadi Tuntas.
            </div>
        </div>
    </div>
</div>
</body>
</html>"""

# Diagram 5: Spec Arsitektur Multi-Tier
DIAGRAMS["spec_diagram_1"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_STYLE}</head>
<body>
<div class="diagram-container" style="max-width: 1320px;">
    <div class="header-bar">
        <div>
            <div class="title-main">Arsitektur Multi-Tier Sistem Platform HUDANG</div>
            <div class="subtitle-main">Diagram Desain Rekayasa Perangkat Lunak &bull; Dekopel Multi-Platform Web, Mobile, & Microservices</div>
        </div>
        <div class="badge-doc">TECSPEC-01 &bull; System Architecture</div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 18px;">
        <!-- Tier 1: Client -->
        <div style="padding: 16px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; margin-bottom: 10px;">Lapisan 1: Klien Multi-Platform (Frontend Client Tier)</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div class="card" style="border-left: 4px solid #16A34A;">
                    <div class="card-title" style="color: #15803D;">Aplikasi Web Portal (Next.js 14 / React 19 / Tailwind CSS)</div>
                    <div class="card-desc">Portal Publik, Transparansi Pelacakan Dokumen, Dashboard Warga, Dashboard Legislator, dan Panel Kontrol Super Admin.</div>
                </div>
                <div class="card" style="border-left: 4px solid #16A34A;">
                    <div class="card-title" style="color: #15803D;">Aplikasi Mobile Seluler (React Native Expo 57 / Android & iOS)</div>
                    <div class="card-desc">Klien seluler bagi Konstituen dan Anggota Dewan di lapangan, dilengkapi LiveKit Mobile SDK untuk konferensi video.</div>
                </div>
            </div>
        </div>

        <div style="text-align: center; color: #94A3B8; font-weight: bold; font-size: 16px;">&darr; Protokol HTTPS (Port 443) / WSS Secure WebSocket / RTC Traffic (Port 7880 - 7881) &darr;</div>

        <!-- Tier 2: Gateway & Security -->
        <div style="padding: 16px; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #1E40AF; text-transform: uppercase; margin-bottom: 10px;">Lapisan 2: Gateway Keamanan & Reverse Proxy (Security Tier)</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div class="card" style="border-left: 4px solid #2563EB;">
                    <div class="card-title" style="color: #1D4ED8;">Nginx Web Server Reverse Proxy & SSL TLS 1.3</div>
                    <div class="card-desc">Terminasi sertifikat SSL Certbot, kompresi Gzip, perutean traffic API `/api/` dan WebRTC signaling `/rtc`.</div>
                </div>
                <div class="card" style="border-left: 4px solid #2563EB;">
                    <div class="card-title" style="color: #1D4ED8;">Perisai Keamanan Helmet & Rate Limiter</div>
                    <div class="card-desc">Proteksi Cross-Site Scripting (XSS), HSTS, Clickjacking, dan pembatasan brute-force login maksimal 50 request / 15 menit.</div>
                </div>
            </div>
        </div>

        <div style="text-align: center; color: #94A3B8; font-weight: bold; font-size: 16px;">&darr; Internal Private Docker Network & Daemon Task Dispatcher &darr;</div>

        <!-- Tier 3: Service Engine -->
        <div style="padding: 16px; background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #6B21A8; text-transform: uppercase; margin-bottom: 10px;">Lapisan 3: Mesin Layanan Aplikasi (Application & Service Tier)</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                <div class="card" style="border-left: 3px solid #7C3AED;">
                    <div class="card-title" style="color: #6D28D9;">Backend API Engine</div>
                    <div class="card-desc">Node.js Express TypeScript, otentikasi JWT, validasi skema Zod, perutean domain.</div>
                </div>
                <div class="card" style="border-left: 3px solid #7C3AED;">
                    <div class="card-title" style="color: #6D28D9;">LiveKit SFU Server</div>
                    <div class="card-desc">Selective Forwarding Unit untuk distribusi stream audio video real-time latensi rendah.</div>
                </div>
                <div class="card" style="border-left: 3px solid #7C3AED;">
                    <div class="card-title" style="color: #6D28D9;">LiveKit Egress</div>
                    <div class="card-desc">Perekaman audio/video sesi pertemuan langsung ke penyimpanan berkas lokal.</div>
                </div>
                <div class="card" style="border-left: 3px solid #7C3AED;">
                    <div class="card-title" style="color: #6D28D9;">Google Gemini AI</div>
                    <div class="card-desc">Mesin kecerdasan buatan untuk transkripsi verbatim audio dan analisis sentimen terstruktur.</div>
                </div>
            </div>
        </div>

        <div style="text-align: center; color: #94A3B8; font-weight: bold; font-size: 16px;">&darr; Database Queries via Prisma ORM & Redis Cache Signaling &darr;</div>

        <!-- Tier 4: Data Layer -->
        <div style="padding: 16px; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #92400E; text-transform: uppercase; margin-bottom: 10px;">Lapisan 4: Penyimpanan Basis Data (Data Tier)</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;">
                <div class="card" style="border-left: 4px solid #D97706;">
                    <div class="card-title" style="color: #B45309;">PostgreSQL 15 Relational Database</div>
                    <div class="card-desc">Penyimpanan utama data pengguna, riwayat usulan, jadwal audiensi, dokumen disposisi, dan skor evaluasi rating.</div>
                </div>
                <div class="card" style="border-left: 4px solid #D97706;">
                    <div class="card-title" style="color: #B45309;">Redis 7 In-Memory Cache</div>
                    <div class="card-desc">Manajemen session state LiveKit SFU, penanganan antrean tugas transkripsi, dan cache sementara.</div>
                </div>
                <div class="card" style="border-left: 4px solid #D97706;">
                    <div class="card-title" style="color: #B45309;">Penyimpanan Berkas Terenkripsi</div>
                    <div class="card-desc">Direktori penyimpanan rekaman audio WAV/MP4 dan berkas lampiran resmi disposisi OPD.</div>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>"""

# Diagram 6: Spec ERD
DIAGRAMS["spec_diagram_2"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_STYLE}</head>
<body>
<div class="diagram-container" style="max-width: 1320px;">
    <div class="header-bar">
        <div>
            <div class="title-main">Skema Diagram Entitas Basis Data (ERD) Platform HUDANG</div>
            <div class="subtitle-main">Struktur Relasional Skema Prisma PostgreSQL 15 &bull; DPRD Provinsi Jawa Barat</div>
        </div>
        <div class="badge-doc">TECSPEC-02 &bull; Relational Schema</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
        <!-- User -->
        <div class="card" style="border-top: 3px solid #2563EB;">
            <div class="card-title" style="color: #1E40AF; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">PENGGUNA (User)</div>
            <div style="font-family: monospace; font-size: 11px; line-height: 1.8; color: #334155; margin-top: 8px;">
                <span style="color: #DC2626; font-weight: bold;">[PK]</span> id: Int<br>
                <span style="color: #2563EB;">[UQ]</span> email: String<br>
                &bull; name: String<br>
                &bull; role: 'masyarakat'|'dewan'|'admin'<br>
                &bull; passwordHash: String<br>
                &bull; noKtp: String (NIK)<br>
                &bull; dapil: String (Dapil I - XV)<br>
                &bull; fraksi: String<br>
                &bull; kabupaten: String<br>
                &bull; kecamatan: String
            </div>
        </div>

        <!-- Schedule -->
        <div class="card" style="border-top: 3px solid #7C3AED;">
            <div class="card-title" style="color: #6D28D9; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">JADWAL_ASPIRASI (Schedule)</div>
            <div style="font-family: monospace; font-size: 11px; line-height: 1.8; color: #334155; margin-top: 8px;">
                <span style="color: #DC2626; font-weight: bold;">[PK]</span> id: Int<br>
                <span style="color: #059669; font-weight: bold;">[FK]</span> masyarakatId: Int &rarr; User.id<br>
                &bull; title: String<br>
                &bull; startTime: DateTime<br>
                &bull; isRecording: Boolean<br>
                &bull; egressId: String<br>
                &bull; recordingUrl: String<br>
                &bull; transcription: Text (AI Verbatim)<br>
                &bull; analysis: JSON (Sentimen & Summary)<br>
                &bull; isTranscribing: Boolean
            </div>
        </div>

        <!-- FollowUp -->
        <div class="card" style="border-top: 3px solid #059669;">
            <div class="card-title" style="color: #047857; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">TINDAK_LANJUT (FollowUp)</div>
            <div style="font-family: monospace; font-size: 11px; line-height: 1.8; color: #334155; margin-top: 8px;">
                <span style="color: #DC2626; font-weight: bold;">[PK]</span> id: Int<br>
                <span style="color: #059669; font-weight: bold;">[FK]</span> scheduleId: Int &rarr; Schedule.id<br>
                &bull; suratDisposisiNo: String (Tahap 1)<br>
                &bull; sharedTo: String (Target OPD)<br>
                &bull; isViewed: Boolean (Tahap 2)<br>
                &bull; viewedAt: DateTime<br>
                &bull; suratTanggapanNo: String (Tahap 3)<br>
                &bull; suratLaporanNo: String (Tahap 4)<br>
                &bull; status: 'pending'|'proses'|'selesai'<br>
                &bull; progressPercent: Int (0 - 100%)
            </div>
        </div>

        <!-- Rating -->
        <div class="card" style="border-top: 3px solid #D97706;">
            <div class="card-title" style="color: #B45309; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">EVALUASI_RATING (Rating)</div>
            <div style="font-family: monospace; font-size: 11px; line-height: 1.8; color: #334155; margin-top: 8px;">
                <span style="color: #DC2626; font-weight: bold;">[PK]</span> id: Int<br>
                <span style="color: #059669; font-weight: bold;">[FK]</span> scheduleId: Int &rarr; Schedule.id<br>
                <span style="color: #059669; font-weight: bold;">[FK]</span> dewanId: Int &rarr; User.id<br>
                &bull; speakingScore: Int (1 - 5)<br>
                &bull; contextScore: Int (1 - 5)<br>
                &bull; timeScore: Int (1 - 5)<br>
                &bull; responsivenessScore: Int (1 - 5)<br>
                &bull; solutionScore: Int (1 - 5)<br>
                &bull; comment: Text
            </div>
        </div>

        <!-- AKD & Member -->
        <div class="card" style="border-top: 3px solid #4F46E5;">
            <div class="card-title" style="color: #4338CA; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">STRUKTUR_AKD & ANGGOTA</div>
            <div style="font-family: monospace; font-size: 11px; line-height: 1.8; color: #334155; margin-top: 8px;">
                <span style="color: #DC2626; font-weight: bold;">[PK]</span> AKD.id: String ('komisi_1', dst.)<br>
                &bull; AKD.nama: String<br>
                <span style="color: #DC2626; font-weight: bold;">[PK]</span> AKDMember.id: UUID<br>
                <span style="color: #059669; font-weight: bold;">[FK]</span> AKDMember.akdId &rarr; AKD.id<br>
                <span style="color: #059669; font-weight: bold;">[FK]</span> AKDMember.dewanId &rarr; User.id<br>
                &bull; AKDMember.jabatan: String
            </div>
        </div>

        <!-- Perjalanan Dinas -->
        <div class="card" style="border-top: 3px solid #0891B2;">
            <div class="card-title" style="color: #0E7490; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">PERJALANAN_DINAS (GIS)</div>
            <div style="font-family: monospace; font-size: 11px; line-height: 1.8; color: #334155; margin-top: 8px;">
                <span style="color: #DC2626; font-weight: bold;">[PK]</span> id: Int<br>
                &bull; judul: String<br>
                &bull; kategori: 'Kunjungan Kerja'<br>
                &bull; komisi: String (Komisi I - V)<br>
                &bull; lokasi: String (Kab/Kota Jabar)<br>
                &bull; tanggalPublikasi: DateTime<br>
                &bull; url: String
            </div>
        </div>
    </div>
</div>
</body>
</html>"""

# Diagram 7: Spec Agile Roadmap
DIAGRAMS["spec_diagram_3"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_STYLE}</head>
<body>
<div class="diagram-container" style="max-width: 1320px;">
    <div class="header-bar">
        <div>
            <div class="title-main">Peta Jalan Iterasi Sprint Agile Platform HUDANG (2026 - 2028)</div>
            <div class="subtitle-main">Penyelarasan Siklus Rilis Agile Scrum Terhadap Pentahapan Milestone Proyek Perubahan</div>
        </div>
        <div class="badge-doc">TECSPEC-03 &bull; Agile Roadmap</div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 20px;">
        <!-- Jangka Pendek -->
        <div style="padding: 16px; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 13px; font-weight: 700; color: #1E40AF; text-transform: uppercase;">1. Tahap Jangka Pendek: Fondasi Sistem & Piloting Internal (Sep - Nov 2026)</span>
                <span style="background: #DBEAFE; color: #1E40AF; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px;">Milestone Fondasi</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
                <div class="card" style="border-left: 3px solid #2563EB;">
                    <div style="font-size: 11px; font-weight: 700; color: #1E40AF;">Sprint 1 (Minggu 1-2)</div>
                    <div class="card-desc">Setup Docker Compose, database Prisma PostgreSQL, Redis, dan otentikasi JWT Bcrypt.</div>
                </div>
                <div class="card" style="border-left: 3px solid #2563EB;">
                    <div style="font-size: 11px; font-weight: 700; color: #1E40AF;">Sprint 2 (Minggu 3-5)</div>
                    <div class="card-desc">Penyusunan SOP, modul teknis, formulir aspirasi NIK, dan nomor pelacak instan.</div>
                </div>
                <div class="card" style="border-left: 3px solid #2563EB;">
                    <div style="font-size: 11px; font-weight: 700; color: #1E40AF;">Sprint 3 (Minggu 6-7)</div>
                    <div class="card-desc">Integrasi LiveKit SFU WebRTC, perekaman Egress, dan transkripsi verbatim Gemini AI.</div>
                </div>
                <div class="card" style="border-left: 3px solid #2563EB;">
                    <div style="font-size: 11px; font-weight: 700; color: #1E40AF;">Sprint 4 (Minggu 8-10)</div>
                    <div class="card-desc">Penyelesaian Mobile App Expo, modul disposisi OPD 4 tahap, dan uji coba piloting beta.</div>
                </div>
            </div>
        </div>

        <!-- Jangka Menengah -->
        <div style="padding: 16px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 13px; font-weight: 700; color: #065F46; text-transform: uppercase;">2. Tahap Jangka Menengah: Implementasi Penuh 15 Dapil & SIPD/RKPD (Jan - Jul 2027)</span>
                <span style="background: #D1FAE5; color: #065F46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px;">Milestone Implementasi</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <div class="card" style="border-left: 3px solid #059669;">
                    <div style="font-size: 11px; font-weight: 700; color: #047857;">Sprint 5 - 6 (Jan - Feb 2027)</div>
                    <div class="card-desc">Peluncuran publik resmi, sosialisasi terbuka, dan pelatihan teknis operator sekretariat di Dapil.</div>
                </div>
                <div class="card" style="border-left: 3px solid #059669;">
                    <div style="font-size: 11px; font-weight: 700; color: #047857;">Sprint 7 - 8 (Mar - Apr 2027)</div>
                    <div class="card-desc">Pembuatan data bridge format kamus usulan SIPD / RKPD Bappeda dan perluasan ke 15 Dapil.</div>
                </div>
                <div class="card" style="border-left: 3px solid #059669;">
                    <div style="font-size: 11px; font-weight: 700; color: #047857;">Sprint 9 (Mei - Jul 2027)</div>
                    <div class="card-desc">Evaluasi target capaian penanganan 70%, audit efisiensi anggaran daerah Rp25M, dan rilis V2.</div>
                </div>
            </div>
        </div>

        <!-- Jangka Panjang -->
        <div style="padding: 16px; background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 13px; font-weight: 700; color: #6B21A8; text-transform: uppercase;">3. Tahap Jangka Panjang: Analitik Prediktif & Keberlanjutan (Agu 2027 - 2028)</span>
                <span style="background: #F3E8FF; color: #6B21A8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px;">Milestone Berkelanjutan</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="card" style="border-left: 3px solid #7C3AED;">
                    <div style="font-size: 11px; font-weight: 700; color: #6D28D9;">Sprint 10 - 12 (Tahun 2027)</div>
                    <div class="card-desc">Pengembangan model AI prediktif untuk estimasi isu sektoral per Kabupaten/Kota dan audit keamanan bersama BSSN.</div>
                </div>
                <div class="card" style="border-left: 3px solid #7C3AED;">
                    <div style="font-size: 11px; font-weight: 700; color: #6D28D9;">Sprint 13+ (Tahun 2028)</div>
                    <div class="card-desc">Survei indeks kepercayaan publik berkala (public trust), penguatan SPBE terintegrasi Pemprov Jawa Barat.</div>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>"""

# Generate HTML files & Render with Edge
for name, html_content in DIAGRAMS.items():
    html_file = os.path.join(OUTPUT_DIR, f"{name}.html")
    png_file = os.path.join(OUTPUT_DIR, f"{name}.png")
    
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Generated HTML: {html_file}")
    
    cmd = [
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        "--force-device-scale-factor=2",
        f"--screenshot={png_file}",
        "--window-size=1400,900",
        f"file:///{html_file.replace(os.sep, '/')}"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(png_file):
        print(f"Rendered PNG: {png_file} ({os.path.getsize(png_file)} bytes)")
    else:
        print(f"Failed to render {png_file}: {res.stderr}")

print("All diagrams processed successfully.")
