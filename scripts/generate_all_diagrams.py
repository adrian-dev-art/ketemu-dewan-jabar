import os
import subprocess

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
OUTPUT_DIR = os.path.abspath("docs/diagrams")
os.makedirs(OUTPUT_DIR, exist_ok=True)

COMMON_CSS = """
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
        background-color: #F8FAFC;
        color: #0F172A;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
    }
    .diagram-container {
        background: #FFFFFF;
        border: 1.5px solid #CBD5E1;
        border-radius: 12px;
        padding: 24px 28px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        width: 1160px;
    }
    .header-bar {
        border-bottom: 2px solid #E2E8F0;
        padding-bottom: 16px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }
    .title-main {
        font-size: 23px;
        font-weight: 800;
        color: #000000 !important;
        letter-spacing: -0.01em;
        text-transform: uppercase;
    }
    .subtitle-main {
        font-size: 14px;
        color: #000000 !important;
        margin-top: 4px;
        font-weight: 600;
    }
    .badge-doc {
        background: #0F172A !important;
        color: #FFFFFF !important;
        border: 1.5px solid #0F172A;
        font-size: 12px;
        font-weight: 700;
        padding: 6px 14px;
        border-radius: 6px;
        letter-spacing: 0.03em;
        text-transform: uppercase;
    }
    .card {
        background: #FFFFFF;
        border: 1.5px solid #000000;
        border-radius: 8px;
        padding: 14px 16px;
    }
    .card-title {
        font-size: 15px;
        font-weight: 800;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #000000 !important;
    }
    .card-desc {
        font-size: 13.5px;
        color: #000000 !important;
        line-height: 1.5;
    }
    .arrow-right {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #000000 !important;
        font-weight: 900;
        font-size: 26px;
    }
    .arrow-down {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #000000 !important;
        font-weight: 900;
        font-size: 24px;
        margin: 6px 0;
    }
    .stage-badge {
        display: inline-block;
        font-size: 12px;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 4px;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }
    .code-pill {
        font-family: 'Consolas', monospace;
        background: #F1F5F9;
        border: 1px solid #CBD5E1;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12.5px;
        color: #000000 !important;
        font-weight: 700;
    }
    .bg-blue { background: #EFF6FF; color: #000000 !important; border: 1.5px solid #93C5FD; font-weight: 800; }
    .bg-amber { background: #FFFBEB; color: #000000 !important; border: 1.5px solid #FCD34D; font-weight: 800; }
    .bg-purple { background: #FAF5FF; color: #000000 !important; border: 1.5px solid #D8B4FE; font-weight: 800; }
    .bg-indigo { background: #EEF2FF; color: #000000 !important; border: 1.5px solid #A5B4FC; font-weight: 800; }
    .bg-emerald { background: #ECFDF5; color: #000000 !important; border: 1.5px solid #6EE7B7; font-weight: 800; }
    .bg-slate { background: #F1F5F9; color: #000000 !important; border: 1.5px solid #CBD5E1; font-weight: 800; }
    .bg-rose { background: #FFF1F2; color: #000000 !important; border: 1.5px solid #FDA4AF; font-weight: 800; }
    
    /* Dark background containers -> WHITE text */
    [style*="background: #1E3A8A"], 
    [style*="background: #0F172A"],
    [style*="background: #1E40AF"],
    [style*="background: #1D4ED8"],
    [style*="background: #047857"],
    [style*="background: #B45309"],
    [style*="background: #6D28D9"] {
        color: #FFFFFF !important;
    }
</style>
"""

DIAGRAMS = {}

# -------------------------------------------------------------
# SOP DIAGRAM 1: Alur Makro End-to-End
# -------------------------------------------------------------
DIAGRAMS["sop_diagram_1"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Alur Makro Pengelolaan Aspirasi dan E-Audiensi (End-to-End)</div>
            <div class="subtitle-main">Standar Operasional Prosedur Sekretariat DPRD Provinsi Jawa Barat &bull; Platform HUDANG</div>
        </div>
        <div class="badge-doc">SOP-HUDANG-01 &bull; Tahap 1 s.d. 5</div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 12px; align-items: stretch; margin-bottom: 12px;">
        <!-- Tahap 1 -->
        <div class="card" style="border-top: 4px solid #2563EB;">
            <span class="stage-badge bg-blue">Tahap 1: Ingestion</span>
            <div class="card-title" style="color: #1E40AF;">Penerimaan & Registrasi</div>
            <div class="card-desc">
                1. Warga input usulan via Web/Mobile.<br>
                2. Validasi NIK 16 digit & foto identitas.<br>
                3. Ekstraksi AI & deteksi duplikasi.<br>
                4. Terbit <b>Tracking Number</b> unik otomatis.
            </div>
        </div>
        
        <div class="arrow-right">&rarr;</div>
        
        <!-- Tahap 2 -->
        <div class="card" style="border-top: 4px solid #D97706;">
            <span class="stage-badge bg-amber">Tahap 2: Verifikasi</span>
            <div class="card-title" style="color: #B45309;">Verifikasi ASN (1x24 Jam)</div>
            <div class="card-desc">
                1. Penapisan syarat formil & materiil.<br>
                2. Uji kewenangan urusan Provinsi.<br>
                3. Klasifikasi bidang Komisi I s.d. V.<br>
                4. Penetapan status: Valid / Perbaikan.
            </div>
        </div>
        
        <div class="arrow-right">&rarr;</div>
        
        <!-- Tahap 3 -->
        <div class="card" style="border-top: 4px solid #7C3AED;">
            <span class="stage-badge bg-purple">Tahap 3: Audiensi</span>
            <div class="card-title" style="color: #6D28D9;">E-Audiensi Virtual LiveKit</div>
            <div class="card-desc">
                1. Konfirmasi ketersediaan jadwal Dewan.<br>
                2. Sesi tatap muka WebRTC terenkripsi.<br>
                3. Perekaman komposit resmi via Egress.<br>
                4. <b>Transkrip Verbatim & Ringkasan AI</b>.
            </div>
        </div>
    </div>

    <div style="display: flex; justify-content: flex-end; padding-right: 180px; margin: -4px 0 6px 0;">
        <div class="arrow-down" style="font-size: 28px;">&darr;</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 14px; align-items: stretch;">
        <!-- Tahap 5 -->
        <div class="card" style="border-top: 4px solid #059669;">
            <span class="stage-badge bg-emerald">Tahap 5: Integrasi & Akuntabilitas</span>
            <div class="card-title" style="color: #047857;">Integrasi Pokir SIPD & Portal Transparansi</div>
            <div class="card-desc">
                1. Kurasi naskah usulan menjadi Pokir DPRD untuk RKPD/APBD Pemprov Jawa Barat.<br>
                2. Sinkronisasi data kamus usulan terstandarisasi SIPD Bappeda Jabar.<br>
                3. Publikasi capaian penanganan di <b>Portal Transparansi Publik (Tuntas 100%)</b>.
            </div>
        </div>

        <div class="arrow-right" style="font-size: 26px;">&larr;</div>

        <!-- Tahap 4 -->
        <div class="card" style="border-top: 4px solid #4F46E5;">
            <span class="stage-badge bg-indigo">Tahap 4: Eksekusi</span>
            <div class="card-title" style="color: #4338CA;">Disposisi OPD Pemprov Jabar</div>
            <div class="card-desc">
                1. Penerbitan Surat Disposisi Resmi ber-barcode pimpinan DPRD.<br>
                2. Verifikasi baca pejabat struktural OPD & tanggapan rencana aksi.<br>
                3. <b>Eksekusi fisik lapangan</b> & unggah dokumen pembuktian hasil kerja.
            </div>
        </div>
    </div>
    
    <div style="margin-top: 16px; padding: 12px 18px; background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 8px; font-size: 13px; color: #334155; display: flex; justify-content: space-between; align-items: center;">
        <div><b>Target SLA Birokrasi:</b> Tiket Terbit &lt; 5 Detik &bull; Verifikasi ASN &le; 1x24 Jam &bull; Tanggapan OPD &le; 5x24 Jam &bull; Tuntas Lapangan &le; 14 Hari</div>
        <div style="font-weight: 700; color: #059669; font-size: 13.5px;">Target Capaian: 70% Tuntas Paripurna</div>
    </div>
</div>
</body>
</html>"""

# -------------------------------------------------------------
# SOP DIAGRAM 2: Verifikasi ASN
# -------------------------------------------------------------
DIAGRAMS["sop_diagram_2"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Alur Rinci Verifikasi dan Penapisan Berkas ASN</div>
            <div class="subtitle-main">Standar Operasional Penapisan Berkas di Lingkungan Sekretariat DPRD Provinsi Jawa Barat</div>
        </div>
        <div class="badge-doc">SOP-HUDANG-02 &bull; Desk Verification</div>
    </div>

    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
        <div class="card" style="flex: 1; border-left: 5px solid #3B82F6;">
            <div class="card-title" style="color: #1D4ED8;">1. Usulan Masuk Antrean</div>
            <div class="card-desc">Aspirasi atau jadwal audiensi warga terdaftar otomatis dengan Tracking Number digital.</div>
        </div>
        <div class="arrow-right">&rarr;</div>
        <div class="card" style="flex: 1.2; border-left: 5px solid #6366F1;">
            <div class="card-title" style="color: #4338CA;">2. Validasi NIK & 15 Dapil</div>
            <div class="card-desc">Pemeriksaan integritas NIK 16 digit, keaktifan kontak WhatsApp, dan domisili 27 Kab/Kota.</div>
        </div>
        <div class="arrow-right">&rarr;</div>
        <div class="card" style="flex: 1.4; border-left: 5px solid #8B5CF6;">
            <div class="card-title" style="color: #6D28D9;">3. Analisis Semantik AI</div>
            <div class="card-desc">Ekstraksi entitas masalah, uji kesamaan kosinus usulan duplikat, dan rekomendasi Komisi I-V.</div>
        </div>
    </div>

    <div style="padding: 16px 20px; background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 8px;">
        <div style="font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 12px; text-transform: uppercase;">
            Tiga Jalur Keputusan Desk Verifikasi ASN (Maksimal 1x24 Jam Kerja):
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;">
            <div class="card" style="border-top: 4px solid #10B981; background: #FFFFFF;">
                <div class="card-title" style="color: #047857;">A. Memenuhi Syarat (Valid)</div>
                <div class="card-desc">Usulan lengkap, relevan dengan kewenangan Provinsi Jawa Barat. Diteruskan ke Meja Fraksi/Komisi dan diterbitkan Surat Disposisi.</div>
            </div>
            <div class="card" style="border-top: 4px solid #F59E0B; background: #FFFFFF;">
                <div class="card-title" style="color: #B45309;">B. Permintaan Perbaikan</div>
                <div class="card-desc">Terdapat kekurangan dokumen pembuktian. Notifikasi otomatis dikirimkan ke pemohon dengan tenggat perbaikan 3x24 jam.</div>
            </div>
            <div class="card" style="border-top: 4px solid #EF4444; background: #FFFFFF;">
                <div class="card-title" style="color: #B91C1C;">C. Pelimpahan Kewenangan</div>
                <div class="card-desc">Substansi masalah merupakan yurisdiksi Pemerintah Pusat / Kabupaten / Kota. Sistem menerbitkan Surat Rekomendasi Pelimpahan.</div>
            </div>
        </div>
    </div>
</div>
</body>
</html>"""

# -------------------------------------------------------------
# SOP DIAGRAM 3: E-Audiensi Virtual WebRTC
# -------------------------------------------------------------
DIAGRAMS["sop_diagram_3"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Alur Kerja E-Audiensi Virtual dan Perekaman Resmi</div>
            <div class="subtitle-main">Mekanisme Pelaksanaan Tatap Muka Daring Melalui Media WebRTC LiveKit SFU</div>
        </div>
        <div class="badge-doc">SOP-HUDANG-03 &bull; Virtual Hearing</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
        <!-- Fase 1 -->
        <div class="card" style="border-top: 4px solid #3B82F6;">
            <span class="stage-badge bg-blue">Fase 1: Persiapan (H-1)</span>
            <div class="card-title" style="color: #1D4ED8;">Pra-Audiensi & Diagnostik</div>
            <div class="card-desc">
                1. Anggota Dewan menetapkan slot waktu audiensi.<br>
                2. Undangan kalender dan tautan aman dikirim ke warga.<br>
                3. Warga melakukan <b>Pre-Join Test</b> (audio, kamera, sinyal).<br>
                4. Operator ASN menyiapkan ruang rapat virtual di LiveKit.
            </div>
        </div>

        <!-- Fase 2 -->
        <div class="card" style="border-top: 4px solid #8B5CF6;">
            <span class="stage-badge bg-purple">Fase 2: Pelaksanaan (Hari H)</span>
            <div class="card-title" style="color: #6D28D9;">Sidang Tatap Muka WebRTC</div>
            <div class="card-desc">
                1. Verifikasi kehadiran peserta oleh Host Admin.<br>
                2. Dialog interaktif konstituen dengan Anggota Dewan.<br>
                3. Transmisi audio-video terenkripsi DTLS-SRTP 50-70ms.<br>
                4. <b>Egress Recording Server</b> merekam sesi komposit resmi.
            </div>
        </div>

        <!-- Fase 3 -->
        <div class="card" style="border-top: 4px solid #10B981;">
            <span class="stage-badge bg-emerald">Fase 3: Pasca-Audiensi (H+1)</span>
            <div class="card-title" style="color: #047857;">Notulensi AI & Tindak Lanjut</div>
            <div class="card-desc">
                1. Audio diproses otomatis oleh <b>Gemini AI Speech-to-Text</b>.<br>
                2. Dihasilkan transkrip verbatim & ringkasan butir kesepakatan.<br>
                3. Risalah resmi ditandatangani dan diunggah ke repositori.<br>
                4. Warga memberikan evaluasi kepuasan audiensi 5 skala Likert.
            </div>
        </div>
    </div>
</div>
</body>
</html>"""

# -------------------------------------------------------------
# SOP DIAGRAM 4: Disposisi OPD
# -------------------------------------------------------------
DIAGRAMS["sop_diagram_4"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Alur Pelacakan Empat Tahap Tindak Lanjut Perangkat Daerah (OPD)</div>
            <div class="subtitle-main">Rantai Akuntabilitas Penanganan Aspirasi Menuju Status Tuntas Paripurna (100%)</div>
        </div>
        <div class="badge-doc">SOP-HUDANG-04 &bull; OPD Execution</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; gap: 10px; align-items: stretch; margin-bottom: 16px;">
        <div class="card" style="border-left: 4px solid #3B82F6;">
            <span class="stage-badge bg-blue">Tahap 1 (24 Jam)</span>
            <div class="card-title" style="color: #1D4ED8;">Penerimaan Surat</div>
            <div class="card-desc">Surat Disposisi digital DPRD diterima akun OPD. Pejabat struktural mencatat tanda terima resmi.</div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-left: 4px solid #F59E0B;">
            <span class="stage-badge bg-amber">Tahap 2 (5 Hari)</span>
            <div class="card-title" style="color: #B45309;">Surat Tanggapan</div>
            <div class="card-desc">OPD menerbitkan Surat Tanggapan resmi yang memuat telaah teknis, jadwal eksekusi, dan alokasi tim.</div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-left: 4px solid #8B5CF6;">
            <span class="stage-badge bg-purple">Tahap 3 (14 Hari)</span>
            <div class="card-title" style="color: #6D28D9;">Eksekusi Lapangan</div>
            <div class="card-desc">Pelaksanaan intervensi fisik / administratif lapangan oleh tim teknis dinas terkait.</div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-left: 4px solid #10B981;">
            <span class="stage-badge bg-emerald">Tahap 4 (Final)</span>
            <div class="card-title" style="color: #047857;">Laporan Hasil 100%</div>
            <div class="card-desc">Unggah berita acara selesai, foto dokumentasi purna-kerja, dan penutupan tiket (Tuntas).</div>
        </div>
    </div>

    <div style="padding: 12px 18px; background: #FEF2F2; border: 1.5px solid #FECDD3; border-radius: 8px; font-size: 13px; color: #991B1B; display: flex; justify-content: space-between; align-items: center;">
        <div><b>Protokol Peringatan Keterlambatan:</b> Melebihi 5 hari tanggapan terbit SP-1 &bull; Melebihi 10 hari terbit SP-2 &bull; Melebihi 14 hari eskalasi langsung ke Pimpinan Komisi & Sekda Jabar.</div>
    </div>
</div>
</body>
</html>"""

# -------------------------------------------------------------
# SPEC DIAGRAM 1: Arsitektur Multi-Tier
# -------------------------------------------------------------
DIAGRAMS["spec_diagram_1"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Arsitektur Multi-Tier Sistem Platform HUDANG</div>
            <div class="subtitle-main">Diagram Desain Rekayasa Perangkat Lunak &bull; Dekopel Multi-Platform Web, Mobile, & Microservices</div>
        </div>
        <div class="badge-doc">SPEC-ARCH-01 &bull; System Architecture</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;">
        <div class="card" style="border-top: 4px solid #2563EB;">
            <span class="stage-badge bg-blue">Tier 1: Klien & Gerbang</span>
            <div class="card-title" style="color: #1E40AF;">Presentation & Ingress</div>
            <div class="card-desc">
                &bull; <b>Web Portal Next.js 14</b> (App Router, TailwindCSS)<br>
                &bull; <b>Mobile App Expo React Native</b> (Android & iOS)<br>
                &bull; <b>Nginx Reverse Proxy</b> (SSL/TLS Offloading, Rate Limit)<br>
                &bull; <b>Coturn STUN/TURN</b> (Port 3478, 5349 TLS)
            </div>
        </div>

        <div class="card" style="border-top: 4px solid #7C3AED;">
            <span class="stage-badge bg-purple">Tier 2: Layanan Komputasi</span>
            <div class="card-title" style="color: #6D28D9;">Core API & Real-Time Engine</div>
            <div class="card-desc">
                &bull; <b>Express.js Microservice Engine</b> (Node.js LTS)<br>
                &bull; <b>LiveKit SFU Cluster</b> (WebRTC Audio/Video Server)<br>
                &bull; <b>LiveKit Egress Service</b> (Composite Recording & HLS)<br>
                &bull; <b>Asynchronous Task Worker</b> (BullMQ / Redis)
            </div>
        </div>

        <div class="card" style="border-top: 4px solid #059669;">
            <span class="stage-badge bg-emerald">Tier 3: Persistensi & AI</span>
            <div class="card-title" style="color: #047857;">Persistence & Intelligence</div>
            <div class="card-desc">
                &bull; <b>PostgreSQL 15</b> (ACID Relational Storage, Prisma ORM)<br>
                &bull; <b>Redis 7 In-Memory Cache</b> (Pub/Sub, Token Store)<br>
                &bull; <b>Whisper & Gemini Flash</b> (Transkripsi & Ringkasan AI)<br>
                &bull; <b>Local Volume / NAS</b> (Penyimpanan Berkas MP4 & Dokumen)
            </div>
        </div>
    </div>

    <div style="margin-top: 14px; padding: 12px 18px; background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; color: #334155; display: flex; justify-content: space-between;">
        <div><b>Protokol Komunikasi:</b> HTTPS REST API (Port 443) &bull; WebSocket WSS (Port 7880) &bull; SRTP UDP (Port 50000-50050) &bull; TCP/IP Database (Port 5432)</div>
        <div style="font-weight: 700; color: #1E40AF;">Isolasi Jaringan: Docker Bridge 172.28.0.0/16</div>
    </div>
</div>
</body>
</html>"""

# -------------------------------------------------------------
# SPEC DIAGRAM: Topologi Docker Container
# -------------------------------------------------------------
DIAGRAMS["spec_topo_docker"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Topologi Jaringan Kontainer Docker dan Pemetaan Port</div>
            <div class="subtitle-main">Infrastruktur Host Server Ubuntu 22.04 LTS (IP: 31.97.71.134) &bull; Platform HUDANG</div>
        </div>
        <div class="badge-doc">SPEC-TOPO-01 &bull; Docker Network</div>
    </div>

    <div style="padding: 16px; background: #F1F5F9; border: 1.5px solid #CBD5E1; border-radius: 10px; margin-bottom: 14px;">
        <div style="font-size: 13.5px; font-weight: 800; color: #1E293B; margin-bottom: 10px; text-transform: uppercase;">
            Host Server Network & Public Ports:
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="card" style="background: #FFFFFF;">
                <div class="card-title" style="color: #1D4ED8;"><span class="code-pill">Port 80, 443 TCP</span> Nginx Ingress</div>
                <div class="card-desc">Menerima trafik publik HTTPS & WSS dari browser warga dan aplikasi mobile.</div>
            </div>
            <div class="card" style="background: #FFFFFF;">
                <div class="card-title" style="color: #B45309;"><span class="code-pill">Port 3478, 5349 TCP/UDP</span> Coturn STUN/TURN</div>
                <div class="card-desc">Penembusan firewall simetris & relai paket media UDP 49152-65535.</div>
            </div>
        </div>
    </div>

    <div style="padding: 18px; background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px;">
        <div style="font-size: 14px; font-weight: 800; color: #1E40AF; margin-bottom: 12px; text-transform: uppercase;">
            Docker Bridge Network Internal (172.28.0.0/16) - Terisolasi dari Akses Luar:
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
            <div class="card">
                <div class="card-title" style="color: #1E40AF;">meetdewan_frontend</div>
                <div class="card-desc">Next.js Web UI &bull; <span class="code-pill">Port 3001 TCP</span> internal.</div>
            </div>
            <div class="card">
                <div class="card-title" style="color: #6D28D9;">meetdewan_backend</div>
                <div class="card-desc">Node/Express API &bull; <span class="code-pill">Port 5001 TCP</span> internal.</div>
            </div>
            <div class="card">
                <div class="card-title" style="color: #047857;">meetdewan_livekit</div>
                <div class="card-desc">WebRTC SFU &bull; <span class="code-pill">Port 7880/7881 TCP</span>, UDP 50000-50050.</div>
            </div>
            <div class="card">
                <div class="card-title" style="color: #B45309;">meetdewan_egress</div>
                <div class="card-desc">Composite Recorder &bull; <span class="code-pill">shm_size: 2GB</span>, Chromium FFmpeg.</div>
            </div>
            <div class="card">
                <div class="card-title" style="color: #B91C1C;">meetdewan_redis</div>
                <div class="card-desc">Redis Cache &bull; <span class="code-pill">Port 6379 TCP</span> (Internal Only).</div>
            </div>
            <div class="card">
                <div class="card-title" style="color: #0F172A;">meetdewan_db</div>
                <div class="card-desc">PostgreSQL 15 &bull; <span class="code-pill">Port 5432 TCP</span> (Internal Only).</div>
            </div>
        </div>
    </div>
</div>
</body>
</html>"""

# -------------------------------------------------------------
# SPEC DIAGRAM: ICE & NAT Coturn
# -------------------------------------------------------------
DIAGRAMS["spec_ice_nat"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Alur Pengumpulan Kandidat ICE dan Penembusan Firewall NAT</div>
            <div class="subtitle-main">Mekanisme Penentuan Jalur Transmisi Audio-Video WebRTC Coturn STUN/TURN &bull; LiveKit SFU</div>
        </div>
        <div class="badge-doc">SPEC-NET-01 &bull; NAT Traversal</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 12px; align-items: stretch; margin-bottom: 16px;">
        <div class="card" style="border-top: 4px solid #3B82F6;">
            <span class="stage-badge bg-blue">1. ICE Gathering</span>
            <div class="card-title" style="color: #1D4ED8;">Pengumpulan Kandidat</div>
            <div class="card-desc">
                &bull; <b>Host Candidate:</b> Alamat IP lokal LAN/WLAN klien.<br>
                &bull; Klien kirim <i>Binding Request</i> ke Coturn STUN Port 3478.<br>
                &bull; Membaca pemetaan NAT eksternal.
            </div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-top: 4px solid #F59E0B;">
            <span class="stage-badge bg-amber">2. Uji NAT Simetris</span>
            <div class="card-title" style="color: #B45309;">Reflektif vs Relai</div>
            <div class="card-desc">
                &bull; <b>Full Cone / Restricted NAT:</b> Terbit <i>srflx candidate</i> (IP Publik Klien).<br>
                &bull; <b>Symmetric NAT / Firewall Korporat:</b> Kirim <i>Allocate Request</i> ke TURN TLS Port 5349.<br>
                &bull; Terbit <i>relay candidate</i> (IP Coturn).
            </div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-top: 4px solid #10B981;">
            <span class="stage-badge bg-emerald">3. Pertukaran SDP</span>
            <div class="card-title" style="color: #047857;">Koneksi WebRTC SFU</div>
            <div class="card-desc">
                &bull; Pertukaran kandidat via WebSocket persinyalan.<br>
                &bull; Uji konektivitas jalur (STUN Check).<br>
                &bull; Jalur tercepat dipilih (Langsung UDP / TURN Relay).<br>
                &bull; <b>ICE Connection State: Connected.</b>
            </div>
        </div>
    </div>

    <div style="padding: 12px 18px; background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; color: #334155; display: flex; justify-content: space-between;">
        <div><b>Keamanan Transmisi:</b> Semua paket media ditransmisikan menggunakan protokol SRTP dengan enkripsi DTLS 1.2 / 1.3 standar IETF.</div>
        <div style="font-weight: 700; color: #059669;">Latensi Target: &le; 100 ms</div>
    </div>
</div>
</body>
</html>"""

# -------------------------------------------------------------
# SPEC DIAGRAM: Autentikasi NIK & JWT
# -------------------------------------------------------------
DIAGRAMS["spec_auth_jwt"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Alur Autentikasi Identitas NIK dan Pengelolaan Token JWT</div>
            <div class="subtitle-main">Mekanisme Kredensial Multi-Peran (Warga, Admin ASN, Dewan, OPD) &bull; Platform HUDANG</div>
        </div>
        <div class="badge-doc">SPEC-SEC-01 &bull; Auth Lifecycle</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 12px; align-items: stretch; margin-bottom: 16px;">
        <div class="card" style="border-top: 4px solid #3B82F6;">
            <span class="stage-badge bg-blue">1. Login & Validasi</span>
            <div class="card-title" style="color: #1D4ED8;">Pemeriksaan Kredensial</div>
            <div class="card-desc">
                &bull; Warga memasukkan NIK 16 digit & kata sandi.<br>
                &bull; Hash kata sandi diverifikasi dengan algoritma <b>Bcrypt salt rounds 10</b>.<br>
                &bull; Pengecekan status akun aktif & hak akses peran.
            </div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-top: 4px solid #8B5CF6;">
            <span class="stage-badge bg-purple">2. Penerbitan Token</span>
            <div class="card-title" style="color: #6D28D9;">Dual-Token JWT Model</div>
            <div class="card-desc">
                &bull; <b>Access Token (Masa Aktif 15 Menit):</b> Disimpan dalam memori klien untuk otorisasi API.<br>
                &bull; <b>Refresh Token (Masa Aktif 7 Hari):</b> Disimpan dalam cookie <i>HttpOnly, Secure, SameSite=Strict</i>.
            </div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-top: 4px solid #10B981;">
            <span class="stage-badge bg-emerald">3. Otorisasi API</span>
            <div class="card-title" style="color: #047857;">Middleware RBAC</div>
            <div class="card-desc">
                &bull; Setiap request menyertakan header <i>Authorization: Bearer [token]</i>.<br>
                &bull; Backend memvalidasi signature kriptografi RS256/HS256.<br>
                &bull; Role guard memeriksa kecocokan hak akses endpoint.
            </div>
        </div>
    </div>

    <div style="padding: 12px 18px; background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; color: #334155; display: flex; justify-content: space-between;">
        <div><b>Keamanan Cookie:</b> Mencegah serangan Cross-Site Scripting (XSS) dan Cross-Site Request Forgery (CSRF).</div>
        <div style="font-weight: 700; color: #1E40AF;">Rotasi Token Otomatis saat Expired</div>
    </div>
</div>
</body>
</html>"""

# -------------------------------------------------------------
# SPEC DIAGRAM: FSM Siklus Tiket
# -------------------------------------------------------------
DIAGRAMS["spec_fsm_ticket"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Diagram Mesin Status Siklus Hidup Tiket Audiensi (Finite State Machine)</div>
            <div class="subtitle-main">Transisi Status Usulan Aspirasi dan E-Audiensi &bull; Rantai Kendali Mutu Pelayanan</div>
        </div>
        <div class="badge-doc">SPEC-FSM-01 &bull; Ticket Lifecycle</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 12px; align-items: stretch; margin-bottom: 14px;">
        <div class="card" style="border-left: 4px solid #3B82F6;">
            <span class="stage-badge bg-blue">Status: SUBMITTED</span>
            <div class="card-title" style="color: #1D4ED8;">1. Usulan Diterima</div>
            <div class="card-desc">Aspirasi didaftarkan pemohon. Nomor tracking terbit. Menunggu telaah ASN.</div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-left: 4px solid #F59E0B;">
            <span class="stage-badge bg-amber">Status: IN_REVIEW</span>
            <div class="card-title" style="color: #B45309;">2. Desk Verifikasi</div>
            <div class="card-desc">ASN memvalidasi data formil. Dapat beralih ke <b>NEEDS_REVISION</b> atau <b>REJECTED</b>.</div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-left: 4px solid #8B5CF6;">
            <span class="stage-badge bg-purple">Status: VERIFIED</span>
            <div class="card-title" style="color: #6D28D9;">3. Terverifikasi Valid</div>
            <div class="card-desc">Berkas lolos verifikasi. Diteruskan ke pimpinan Komisi untuk slot waktu audiensi.</div>
        </div>
    </div>

    <div style="display: flex; justify-content: flex-end; padding-right: 180px; margin: -4px 0 6px 0;">
        <div class="arrow-down" style="font-size: 28px;">&darr;</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 12px; align-items: stretch;">
        <div class="card" style="border-left: 4px solid #059669;">
            <span class="stage-badge bg-emerald">Status: RESOLVED</span>
            <div class="card-title" style="color: #047857;">6. Tuntas Paripurna</div>
            <div class="card-desc">Laporan eksekusi lapangan diterima, verifikasi dokumen 100%, tiket ditutup tuntas.</div>
        </div>

        <div class="arrow-right">&larr;</div>

        <div class="card" style="border-left: 4px solid #4F46E5;">
            <span class="stage-badge bg-indigo">Status: DISPOSITIONED</span>
            <div class="card-title" style="color: #4338CA;">5. Disposisi OPD</div>
            <div class="card-desc">Surat resmi terbit ke Dinas terkait. Pelaksanaan intervensi fisik lapangan.</div>
        </div>

        <div class="arrow-right">&larr;</div>

        <div class="card" style="border-left: 4px solid #0284C7;">
            <span class="stage-badge bg-blue">Status: SCHEDULED</span>
            <div class="card-title" style="color: #0369A1;">4. Terjadwal & Rapat</div>
            <div class="card-desc">Waktu audiensi dikonfirmasi Dewan. Berlanjut ke sesi <b>IN_MEETING</b> WebRTC.</div>
        </div>
    </div>
</div>
</body>
</html>"""

# -------------------------------------------------------------
# SPEC DIAGRAM: Pipeline Transkripsi LLM
# -------------------------------------------------------------
DIAGRAMS["spec_transcription"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Pipeline Komputasi Transkripsi Suara Verbatim dan Ringkasan AI</div>
            <div class="subtitle-main">Arsitektur Otomasi Risalah Audiensi Menggunakan Speech-to-Text & Gemini AI &bull; Platform HUDANG</div>
        </div>
        <div class="badge-doc">SPEC-AI-01 &bull; AI Pipeline</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 12px; align-items: stretch; margin-bottom: 16px;">
        <div class="card" style="border-top: 4px solid #3B82F6;">
            <span class="stage-badge bg-blue">1. Ekstraksi Audio</span>
            <div class="card-title" style="color: #1D4ED8;">LiveKit Egress Audio</div>
            <div class="card-desc">
                &bull; Perekaman audio multichannel berkualitas tinggi (Opus / WAV 16kHz).<br>
                &bull; Normalisasi gain & pereduksi derau latar belakang (noise suppression).<br>
                &bull; Segmentasi berkas per pembicara (diarization prep).
            </div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-top: 4px solid #8B5CF6;">
            <span class="stage-badge bg-purple">2. Speech Recognition</span>
            <div class="card-title" style="color: #6D28D9;">Whisper / STT Engine</div>
            <div class="card-desc">
                &bull; Transkripsi teks fonetik Bahasa Indonesia & istilah lokal Sunda.<br>
                &bull; Pembubuhan cap waktu presisi per kata (*word timestamps*).<br>
                &bull; Ekstraksi teks mentah verbatim tanpa pemotongan konteks.
            </div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-top: 4px solid #10B981;">
            <span class="stage-badge bg-emerald">3. AI Summarizer</span>
            <div class="card-title" style="color: #047857;">Google Gemini Flash</div>
            <div class="card-desc">
                &bull; Pembuatan naskah risalah terstruktur (Latar Belakang, Aspirasi, Tanggapan).<br>
                &bull; Formulasi butir komitmen Dewan & rekomendasi Disposisi OPD.<br>
                &bull; Ekstraksi kata kunci indeks pencarian semantik.
            </div>
        </div>
    </div>

    <div style="padding: 12px 18px; background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; color: #334155; display: flex; justify-content: space-between;">
        <div><b>Efisiensi Birokrasi:</b> Memangkas waktu penyusunan risalah rapat formal dari 3 hari kerja menjadi kurang dari 120 detik.</div>
        <div style="font-weight: 700; color: #059669;">Akurasi Fonetik: &gt; 92%</div>
    </div>
</div>
</body>
</html>"""

# -------------------------------------------------------------
# SPEC DIAGRAM: Pipeline Egress HLS
# -------------------------------------------------------------
DIAGRAMS["spec_egress_hls"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Pipeline Komputasi Egress Recording, Transcoding, dan HLS Streaming</div>
            <div class="subtitle-main">Mekanisme Siaran Langsung Sidang Terbuka & Pengarsipan Digital Resmi &bull; Platform HUDANG</div>
        </div>
        <div class="badge-doc">SPEC-MEDIA-01 &bull; Egress & HLS</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 12px; align-items: stretch; margin-bottom: 16px;">
        <div class="card" style="border-top: 4px solid #3B82F6;">
            <span class="stage-badge bg-blue">1. Media Source</span>
            <div class="card-title" style="color: #1D4ED8;">LiveKit Room Tracks</div>
            <div class="card-desc">
                &bull; Track video VP8/H.264 & audio Opus dari semua peserta.<br>
                &bull; Egress composite recorder me-render tata letak grid rapat otomatis.<br>
                &bull; Watermark resmi Sekretariat DPRD Jawa Barat tersemat.
            </div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-top: 4px solid #F59E0B;">
            <span class="stage-badge bg-amber">2. Transcoding Engine</span>
            <div class="card-title" style="color: #B45309;">FFmpeg Live Transcoder</div>
            <div class="card-desc">
                &bull; Transcode real-time ke format H.264 AAC.<br>
                &bull; Segmentasi file HLS (.m3u8 index & .ts segments 4 detik).<br>
                &bull; Ekspor simultan berkas rekaman master MP4 ke penyimpanan volume host.
            </div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-top: 4px solid #10B981;">
            <span class="stage-badge bg-emerald">3. Distribusi Publik</span>
            <div class="card-title" style="color: #047857;">HLS Web Player / CDN</div>
            <div class="card-desc">
                &bull; Siaran langsung diputar di Portal Publik HUDANG via HLS.js.<br>
                &bull; Distribusi RTMP ke kanal YouTube resmi Humas DPRD Jabar.<br>
                &bull; Klien publik dapat menonton tanpa membebani server SFU utama.
            </div>
        </div>
    </div>

    <div style="padding: 12px 18px; background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; color: #334155; display: flex; justify-content: space-between;">
        <div><b>Penyimpanan Rekaman:</b> Tersimpan pada volume permanen `/recordings` dengan retensi arsip minimum 5 tahun sesuai regulasi kearsipan.</div>
        <div style="font-weight: 700; color: #1E40AF;">Bitrate Siaran: 1080p @ 3500 kbps</div>
    </div>
</div>
</body>
</html>"""

# -------------------------------------------------------------
# SPEC DIAGRAM: Skema ERD
# -------------------------------------------------------------
DIAGRAMS["spec_diagram_2"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Skema Diagram Entitas Basis Data Relasional (ERD) Platform HUDANG</div>
            <div class="subtitle-main">Struktur Relasi PostgreSQL 15 &bull; Prisma ORM &bull; Sekretariat DPRD Provinsi Jawa Barat</div>
        </div>
        <div class="badge-doc">SPEC-DB-01 &bull; Schema Model</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="card" style="border-top: 4px solid #2563EB;">
            <div class="card-title" style="color: #1E40AF;">User & Identity</div>
            <div class="card-desc">
                &bull; <b>User:</b> id, nik, email, password, role, isVerified, createdAt<br>
                &bull; <b>Profile:</b> id, userId, fullName, phone, address, kabKota, dapil<br>
                &bull; <b>Dewan:</b> id, userId, nama, fraksi, komisi, dapilId, fotoUrl
            </div>
        </div>

        <div class="card" style="border-top: 4px solid #7C3AED;">
            <div class="card-title" style="color: #6D28D9;">Aspirasi & E-Audiensi</div>
            <div class="card-desc">
                &bull; <b>Aspirasi:</b> id, ticketNo, userId, title, description, categoryId, status, komisi<br>
                &bull; <b>Schedule:</b> id, dewanId, aspirasiId, scheduledAt, status, roomName<br>
                &bull; <b>RoomSession:</b> id, scheduleId, roomSid, duration, recordingUrl, transcript
            </div>
        </div>

        <div class="card" style="border-top: 4px solid #059669;">
            <div class="card-title" style="color: #047857;">Disposisi OPD & Audit</div>
            <div class="card-desc">
                &bull; <b>FollowUp:</b> id, aspirasiId, opdId, suratNo, step, status, proofUrl, notes<br>
                &bull; <b>OPD:</b> id, name, code, sector, contactPerson, email, phone<br>
                &bull; <b>AuditLog:</b> id, userId, action, ipAddress, userAgent, details, timestamp
            </div>
        </div>
    </div>

    <div style="padding: 12px 18px; background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; color: #334155; display: flex; justify-content: space-between;">
        <div><b>Integritas Relasional:</b> Menjamin kepatuhan prinsip ACID, kunci asing (Foreign Keys) berindeks, dan audit jejak transaksi perbankan/pemerintahan.</div>
        <div style="font-weight: 700; color: #1E40AF;">Indeks Pencarian: B-Tree & Full-Text Search GIN</div>
    </div>
</div>
</body>
</html>"""

# -------------------------------------------------------------
# SPEC DIAGRAM: Backup & PITR
# -------------------------------------------------------------
DIAGRAMS["spec_pitr_backup"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Siklus Pemulihan dan Pencadangan Basis Data (Point-in-Time Recovery)</div>
            <div class="subtitle-main">Rencana Tanggap Darurat Bencana Data (Disaster Recovery) & Replikasi PostgreSQL &bull; Platform HUDANG</div>
        </div>
        <div class="badge-doc">SPEC-OPS-01 &bull; Backup & PITR</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 12px; align-items: stretch; margin-bottom: 16px;">
        <div class="card" style="border-top: 4px solid #3B82F6;">
            <span class="stage-badge bg-blue">1. Operasi Harian</span>
            <div class="card-title" style="color: #1D4ED8;">WAL Archiving Otomatis</div>
            <div class="card-desc">
                &bull; Transaksi ditulis ke <b>Write-Ahead Log (WAL)</b> secara sinkron.<br>
                &bull; Berkas segmen WAL diarsipkan berkala setiap 16 MB.<br>
                &bull; Pencadangan logika harian (pg_dump) otomatis setiap pukul 02.00 WIB.
            </div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-top: 4px solid #F59E0B;">
            <span class="stage-badge bg-amber">2. Replikasi Off-Site</span>
            <div class="card-title" style="color: #B45309;">Enkripsi & Penyimpanan Luar</div>
            <div class="card-desc">
                &bull; Berkas backup dienkripsi dengan algoritma <b>AES-256 GCM</b>.<br>
                &bull; Sinkronisasi otomatis ke penyimpanan off-site independen (Pusat Data Pemprov Jabar).<br>
                &bull; Verifikasi checksum SHA-256 integritas berkas cadangan.
            </div>
        </div>

        <div class="arrow-right">&rarr;</div>

        <div class="card" style="border-top: 4px solid #10B981;">
            <span class="stage-badge bg-emerald">3. Simulasi Pemulihan</span>
            <div class="card-title" style="color: #047857;">Point-in-Time Recovery</div>
            <div class="card-desc">
                &bull; Basis data dapat dipulihkan ke titik detik tertentu sebelum kegagalan terjadi.<br>
                &bull; <b>Recovery Point Objective (RPO):</b> &lt; 5 Menit kehilangan data.<br>
                &bull; <b>Recovery Time Objective (RTO):</b> &lt; 30 Menit sistem aktif kembali.
            </div>
        </div>
    </div>

    <div style="padding: 12px 18px; background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; color: #334155; display: flex; justify-content: space-between;">
        <div><b>Kepatuhan Regulasi:</b> Memenuhi Standar Keamanan Informasi ISO/IEC 27001 dan Peraturan BSSN No. 4/2021 tentang Manajemen Kelangsungan SPBE.</div>
        <div style="font-weight: 700; color: #059669;">Ketersediaan Target: 99.9% Uptime</div>
    </div>
</div>
</body>
</html>"""

# -------------------------------------------------------------
# SPEC DIAGRAM: Peta Jalan Agile
# -------------------------------------------------------------
DIAGRAMS["spec_diagram_3"] = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{COMMON_CSS}</head>
<body>
<div class="diagram-container">
    <div class="header-bar">
        <div>
            <div class="title-main">Peta Jalan Iterasi Sprint Agile Platform HUDANG (2026 - 2028)</div>
            <div class="subtitle-main">Penyelarasan Siklus Rilis Agile Scrum Terhadap Pentahapan Milestone Proyek Perubahan</div>
        </div>
        <div class="badge-doc">SPEC-ROADMAP-01 &bull; 2026-2028</div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Jangka Pendek -->
        <div style="padding: 14px 18px; background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 14px; font-weight: 800; color: #1E40AF; text-transform: uppercase;">1. Tahap Jangka Pendek: Fondasi & Piloting 2 Dapil (Sep - Des 2026)</span>
                <span style="background: #DBEAFE; color: #1E40AF; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px;">Milestone Inti</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
                <div class="card" style="border-left: 4px solid #2563EB;">
                    <div style="font-size: 12px; font-weight: 800; color: #1E40AF;">Sprint 1 (Minggu 1-2)</div>
                    <div class="card-desc">Setup Docker Compose, database PostgreSQL, Redis, dan otentikasi NIK Bcrypt.</div>
                </div>
                <div class="card" style="border-left: 4px solid #2563EB;">
                    <div style="font-size: 12px; font-weight: 800; color: #1E40AF;">Sprint 2 (Minggu 3-5)</div>
                    <div class="card-desc">Penyusunan SOP, modul teknis, formulir aspirasi NIK, dan nomor pelacak instan.</div>
                </div>
                <div class="card" style="border-left: 4px solid #2563EB;">
                    <div style="font-size: 12px; font-weight: 800; color: #1E40AF;">Sprint 3 (Minggu 6-7)</div>
                    <div class="card-desc">Integrasi LiveKit SFU WebRTC, perekaman Egress, dan transkripsi verbatim Gemini AI.</div>
                </div>
                <div class="card" style="border-left: 4px solid #2563EB;">
                    <div style="font-size: 12px; font-weight: 800; color: #1E40AF;">Sprint 4 (Minggu 8-10)</div>
                    <div class="card-desc">Penyelesaian Mobile App Expo, modul disposisi OPD 4 tahap, dan uji coba piloting beta.</div>
                </div>
            </div>
        </div>

        <!-- Jangka Menengah -->
        <div style="padding: 14px 18px; background: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 14px; font-weight: 800; color: #065F46; text-transform: uppercase;">2. Tahap Jangka Menengah: Implementasi Penuh 15 Dapil & SIPD (Jan - Jul 2027)</span>
                <span style="background: #D1FAE5; color: #065F46; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px;">Milestone Implementasi</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <div class="card" style="border-left: 4px solid #059669;">
                    <div style="font-size: 12px; font-weight: 800; color: #047857;">Sprint 5 - 6 (Jan - Feb 2027)</div>
                    <div class="card-desc">Peluncuran publik resmi, sosialisasi terbuka, dan pelatihan teknis operator sekretariat di Dapil.</div>
                </div>
                <div class="card" style="border-left: 4px solid #059669;">
                    <div style="font-size: 12px; font-weight: 800; color: #047857;">Sprint 7 - 8 (Mar - Apr 2027)</div>
                    <div class="card-desc">Pembuatan data bridge format kamus usulan SIPD / RKPD Bappeda dan perluasan ke 15 Dapil.</div>
                </div>
                <div class="card" style="border-left: 4px solid #059669;">
                    <div style="font-size: 12px; font-weight: 800; color: #047857;">Sprint 9 (Mei - Jul 2027)</div>
                    <div class="card-desc">Evaluasi target capaian penanganan 70%, audit efisiensi anggaran daerah Rp25M, dan rilis V2.</div>
                </div>
            </div>
        </div>

        <!-- Jangka Panjang -->
        <div style="padding: 14px 18px; background: #FAF5FF; border: 1.5px solid #E9D5FF; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 14px; font-weight: 800; color: #6B21A8; text-transform: uppercase;">3. Tahap Jangka Panjang: Analitik Prediktif & Keberlanjutan (Agu 2027 - 2028)</span>
                <span style="background: #F3E8FF; color: #6B21A8; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px;">Milestone Berkelanjutan</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="card" style="border-left: 4px solid #7C3AED;">
                    <div style="font-size: 12px; font-weight: 800; color: #6D28D9;">Sprint 10 - 12 (Tahun 2027)</div>
                    <div class="card-desc">Pengembangan model AI prediktif untuk estimasi isu sektoral per Kabupaten/Kota dan audit BSSN.</div>
                </div>
                <div class="card" style="border-left: 4px solid #7C3AED;">
                    <div style="font-size: 12px; font-weight: 800; color: #6D28D9;">Sprint 13+ (Tahun 2028)</div>
                    <div class="card-desc">Survei indeks kepuasan dan kepercayaan publik berkala, integrasi penuh SPBE Pemprov Jabar.</div>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>"""

if __name__ == "__main__":
    for name, html_content in DIAGRAMS.items():
        html_file = os.path.join(OUTPUT_DIR, f"{name}.html")
        png_file = os.path.join(OUTPUT_DIR, f"{name}.png")
        
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html_content)
        
        print(f"Rendering: {name}.png...", flush=True)

        file_url = "file:///" + os.path.abspath(html_file).replace("\\", "/")
        cmd = [
            EDGE_PATH,
            "--headless=new",
            "--disable-gpu",
            "--force-device-scale-factor=2",
            f"--screenshot={png_file}",
            "--window-size=1200,820",
            file_url
        ]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            if res.returncode == 0 and os.path.exists(png_file):
                print(f"Rendered: {name}.png ({os.path.getsize(png_file):,} bytes)", flush=True)
            else:
                print(f"Error rendering {name}: {res.stderr}", flush=True)
        except subprocess.TimeoutExpired:
            print(f"Timeout rendering {name}", flush=True)

    print("All diagrams regenerated with high readability!", flush=True)
