import os
import sys
from playwright.sync_api import sync_playwright

screenshots_dir = "e:/project/DPRD/MEETDEWAN/screenshots".replace("\\", "/")

html_content = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Dokumen Panduan, Grafik & Data Aspirasi HUDANG Sekretariat DPRD Jawa Barat</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=JetBrains+Mono:wght@400;500;700&display=swap');

  @page {{
    size: A4 portrait;
    margin: 11mm 12mm 13mm 12mm;
  }}

  *, *::before, *::after {{
    box-sizing: border-box;
  }}

  body {{
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    line-height: 1.45;
    font-size: 8.6pt;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }}

  .page {{
    page-break-after: always;
    break-after: page;
    min-height: 262mm;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }}
  .page:last-child {{
    page-break-after: avoid;
    break-after: avoid;
  }}

  /* Cover Page */
  .cover-page {{
    min-height: 268mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 24px 20px;
    background: linear-gradient(140deg, #091224 0%, #0f2b5c 40%, #0369a1 100%);
    color: #ffffff;
    border-radius: 8px;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }}
  .cover-header {{
    position: relative;
    z-index: 2;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 12px;
  }}
  .cover-badge {{
    display: inline-block;
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.4);
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 7.5pt;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }}
  .cover-title {{
    font-size: 20pt;
    font-weight: 800;
    line-height: 1.25;
    margin: 4px 0;
    color: #ffffff;
  }}
  .cover-subtitle {{
    font-size: 10.5pt;
    font-weight: 400;
    color: #94a3b8;
    margin-top: 4px;
    line-height: 1.4;
  }}
  .cover-body {{
    position: relative;
    z-index: 2;
    margin: 14px 0;
  }}
  .cover-highlights {{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 14px;
  }}
  .highlight-card {{
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.16);
    padding: 10px 12px;
    border-radius: 8px;
    backdrop-filter: blur(8px);
  }}
  .highlight-card h4 {{
    margin: 0 0 4px 0;
    color: #38bdf8;
    font-size: 8.8pt;
    font-weight: 700;
  }}
  .highlight-card p {{
    margin: 0;
    color: #cbd5e1;
    font-size: 7.6pt;
    line-height: 1.35;
  }}
  .cover-footer {{
    position: relative;
    z-index: 2;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-top: 12px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }}
  .meta-col h5 {{
    margin: 0 0 2px 0;
    font-size: 6.8pt;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #94a3b8;
  }}
  .meta-col p {{
    margin: 0;
    font-size: 8pt;
    font-weight: 600;
    color: #f8fafc;
  }}

  /* Typography */
  h1 {{
    font-size: 13.5pt;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 4px;
    margin-top: 0;
    margin-bottom: 8px;
    color: #0369a1;
    font-weight: 800;
    letter-spacing: -0.3px;
  }}
  h2 {{
    font-size: 10pt;
    color: #0f172a;
    border-left: 3.5px solid #0284c7;
    padding-left: 8px;
    margin-top: 10px;
    margin-bottom: 5px;
    font-weight: 700;
  }}
  h3 {{
    font-size: 8.8pt;
    color: #334155;
    margin-top: 8px;
    margin-bottom: 4px;
    font-weight: 700;
  }}
  p {{
    margin-top: 0;
    margin-bottom: 6px;
    text-align: justify;
    font-size: 8.3pt;
  }}

  /* Callouts */
  .callout {{
    padding: 8px 12px;
    border-radius: 6px;
    margin: 6px 0 8px 0;
    font-size: 8pt;
    page-break-inside: avoid;
  }}
  .callout-info {{
    background-color: #f0f9ff;
    border-left: 3.5px solid #0284c7;
    color: #0369a1;
  }}
  .callout-success {{
    background-color: #f0fdf4;
    border-left: 3.5px solid #16a34a;
    color: #15803d;
  }}
  .callout-warning {{
    background-color: #fffbeb;
    border-left: 3.5px solid #f59e0b;
    color: #b45309;
  }}
  .callout strong {{
    display: block;
    margin-bottom: 2px;
    font-size: 8.4pt;
  }}

  /* Tables */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 4px 0 7px 0;
    font-size: 7.4pt;
    page-break-inside: avoid;
  }}
  th {{
    background-color: #0f172a;
    color: #ffffff;
    text-align: left;
    padding: 4px 6px;
    font-weight: 600;
    font-size: 7.4pt;
  }}
  td {{
    padding: 3.5px 6px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
  }}
  tr:nth-child(even) td {{
    background-color: #f8fafc;
  }}

  /* Badges */
  .badge {{
    display: inline-block;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 6.6pt;
    font-weight: 600;
    text-transform: uppercase;
  }}
  .badge-primary {{ background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }}
  .badge-success {{ background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }}
  .badge-warning {{ background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }}
  .badge-danger {{ background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }}
  .badge-purple {{ background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff; }}
  .badge-slate {{ background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }}

  /* Diagram Canvas Boxes */
  .diagram-container {{
    background: #f8fafc;
    border: 1.5px solid #cbd5e1;
    border-radius: 8px;
    padding: 8px 6px;
    margin: 6px 0 10px 0;
    text-align: center;
    page-break-inside: avoid;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }}
  .diagram-title {{
    font-size: 8.2pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}

  /* Screenshot Figure Box */
  .screenshot-card {{
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 6px;
    margin-bottom: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    page-break-inside: avoid;
  }}
  .screenshot-card img {{
    width: 100%;
    height: auto;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    display: block;
  }}
  .screenshot-caption {{
    font-size: 7.2pt;
    font-weight: 600;
    color: #475569;
    text-align: center;
    margin-top: 4px;
  }}

  .screenshot-grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
  }}

  /* Modern UI Cards from HUDANG Frontend */
  .hudang-card-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 8px 0 10px 0;
    page-break-inside: avoid;
  }}
  .hudang-stat-box {{
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    position: relative;
  }}
  .hudang-stat-box .head-row {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }}
  .hudang-stat-box .icon-badge {{
    padding: 3px 6px;
    border-radius: 5px;
    font-size: 6.8pt;
    font-weight: 700;
    text-transform: uppercase;
  }}
  .hudang-stat-box .grow-tag {{
    font-size: 6.5pt;
    font-weight: 800;
    color: #16a34a;
    background: #f0fdf4;
    padding: 1px 5px;
    border-radius: 8px;
    border: 1px solid #bbf7d0;
  }}
  .hudang-stat-box .val {{
    font-size: 13pt;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.1;
  }}
  .hudang-stat-box .lbl {{
    font-size: 6.4pt;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 700;
    margin-top: 2px;
  }}

  /* DewanCard Component UI */
  .dewan-component-card {{
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px;
    margin: 8px 0;
    display: flex;
    gap: 12px;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    page-break-inside: avoid;
  }}
  .dewan-avatar-box {{
    width: 60px;
    height: 60px;
    background: #e0f2fe;
    border: 2px solid #0284c7;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16pt;
    font-weight: 800;
    color: #0369a1;
    flex-shrink: 0;
  }}
  .dewan-info-col {{
    flex-grow: 1;
  }}
  .dewan-name {{
    font-size: 9.5pt;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 2px 0;
  }}
  .dewan-meta-row {{
    font-size: 7.2pt;
    color: #64748b;
    margin-bottom: 4px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }}
  .dewan-action-col {{
    text-align: right;
    flex-shrink: 0;
  }}

  /* Aspirasi Card */
  .aspirasi-card {{
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 8px 10px;
    margin-bottom: 9px;
    page-break-inside: avoid;
  }}
  .aspirasi-header {{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    margin-bottom: 5px;
  }}
  .aspirasi-title {{
    font-size: 8.8pt;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 2px 0;
  }}
  .aspirasi-meta {{
    font-size: 7pt;
    color: #64748b;
  }}
  .aspirasi-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 5px;
  }}
  .grid-box {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 5px 7px;
  }}
  .grid-box h6 {{
    margin: 0 0 2px 0;
    font-size: 7pt;
    text-transform: uppercase;
    color: #475569;
    letter-spacing: 0.4px;
  }}
  .grid-box p {{
    margin: 0;
    font-size: 7.6pt;
    color: #1e293b;
    line-height: 1.3;
    text-align: left;
  }}
  .verbatim-box {{
    background: #0f172a;
    color: #e2e8f0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 6.6pt;
    padding: 6px 8px;
    border-radius: 4px;
    line-height: 1.35;
    margin: 4px 0;
  }}
  .verbatim-speaker {{ color: #38bdf8; font-weight: 700; }}
  .verbatim-dewan {{ color: #4ade80; font-weight: 700; }}

  .ai-analysis-box {{
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 4px;
    padding: 5px 8px;
    margin-top: 5px;
  }}
  .ai-analysis-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
  }}
  .ai-score-pill {{
    display: inline-block;
    background: #15803d;
    color: #ffffff;
    font-size: 6.6pt;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 6px;
  }}
  .metrics-bar-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    margin-top: 4px;
  }}
  .metric-item {{
    background: #ffffff;
    border: 1px solid #dcfce7;
    border-radius: 3px;
    padding: 3px;
    text-align: center;
  }}
  .metric-item .val {{
    font-size: 8.2pt;
    font-weight: 800;
    color: #15803d;
    line-height: 1.1;
  }}
  .metric-item .lbl {{
    font-size: 6pt;
    color: #64748b;
    text-transform: uppercase;
  }}

  /* Charts Container Grid */
  .chart-grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 6px 0;
    page-break-inside: avoid;
  }}
  .chart-grid-3 {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 7px;
    margin: 6px 0;
    page-break-inside: avoid;
  }}
  .chart-box {{
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }}
  .chart-box h4 {{
    margin: 0 0 5px 0;
    font-size: 7.5pt;
    font-weight: 700;
    color: #0f172a;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 3px;
  }}
</style>
</head>
<body>

<!-- HALAMAN 1: COVER -->
<div class="cover-page">
  <div class="cover-header">
    <div class="cover-badge">SEKRETARIAT DPRD PROVINSI JAWA BARAT</div>
    <div class="cover-title">BUKU PANDUAN PENGGUNAAN SISTEM, DIAGRAM ALUR, GRAFIK ANALITIK &amp; DATA ASPIRASI "HUDANG"</div>
    <div class="cover-subtitle">(HUDANG: Hadirkeun Usulan, Dangukeun Aspirasi, Nyatakeun Gagasan)</div>
  </div>

  <div class="cover-body">
    <p style="color: #e2e8f0; font-size: 8.8pt; line-height: 1.5; max-width: 95%;">
      Dokumen teknis dan panduan operasional ini disusun oleh Tim Pengembang &amp; Tim Ahli Sistem HUDANG untuk Sekretariat DPRD Provinsi Jawa Barat. Sistem dirancang dan disiapkan untuk meng-cover seluruh 120 Anggota DPRD, 15 Daerah Pemilihan (Dapil I s/d XV), 5 Komisi &amp; 4 Badan AKD, serta 27 Kabupaten/Kota se-Jawa Barat lengkap dengan visualisasi grafik analitik real-time, card interaktif, dan data aspirasi terolah.
    </p>

    <div class="cover-highlights">
      <div class="highlight-card">
        <h4>Diagram Alur Multi-Aktor</h4>
        <p>Visualisasi skematis alur kerja dari booking jadwal hingga tindak lanjut rekomendasi dinas terkait.</p>
      </div>
      <div class="highlight-card">
        <h4>Grafik &amp; Card Analitik HUDANG</h4>
        <p>Visualisasi grafik tren bulanan, komposisi topik donat, ranking komisi, ranking dapil, ranking dewan, dan organisasi teraktif.</p>
      </div>
      <div class="highlight-card">
        <h4>Geospasial GIS Sebaran Dapil</h4>
        <p>Integrasi peta digital 27 Kabupaten/Kota dan 15 Dapil untuk monitoring titik rawan isu aspirasi warga.</p>
      </div>
      <div class="highlight-card">
        <h4>Evaluasi Kinerja 5 Dimensi</h4>
        <p>Penilaian objektif: Artikulasi (Speaking), Konteks Masalah, Ketepatan Waktu, Responsivitas, dan Solusi Konkret.</p>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <div class="meta-col">
      <h5>Disusun Oleh</h5>
      <p>Tim Pengembang &amp; Tim Ahli Sistem HUDANG</p>
    </div>
    <div class="meta-col">
      <h5>Instansi Penyelenggara</h5>
      <p>Sekretariat DPRD Provinsi Jawa Barat</p>
    </div>
    <div class="meta-col">
      <h5>Status Kesiapan</h5>
      <p>Siap Operasional (Tahap Pilot Testing)</p>
    </div>
    <div class="meta-col">
      <h5>Tahun Anggaran</h5>
      <p>2026</p>
    </div>
  </div>
</div>

<!-- HALAMAN 2: DAFTAR ISI, RINGKASAN EKSEKUTIF & LANDING SCREENSHOT -->
<div class="page">
  <h1>RINGKASAN EKSEKUTIF &amp; DAFTAR ISI</h1>
  
  <div class="callout callout-info">
    <strong>Kesiapan Sistem &amp; Mandat Sekretariat Dewan</strong>
    Platform <strong>HUDANG (Hadirkeun Usulan, Dangukeun Aspirasi, Nyatakeun Gagasan)</strong> dikembangkan oleh Tim Pengembang &amp; Tim Ahli untuk memfasilitasi tugas pokok dan fungsi Sekretariat DPRD Provinsi Jawa Barat dalam pelayanan penyerapan aspirasi publik. Sistem telah dirancang dan disiapkan secara komprehensif untuk meng-cover seluruh wilayah Jawa Barat, namun saat ini berada pada tahap kesiapan implementasi &amp; uji coba percontohan (pilot phase) sebelum dibuka secara massal kepada masyarakat luas.
  </div>

  <!-- HUDANG Analytics Cards Component -->
  <div class="hudang-card-grid">
    <div class="hudang-stat-box">
      <div class="head-row">
        <span class="icon-badge" style="background:#e0f2fe; color:#0369a1;">Total Aspirasi</span>
        <span class="grow-tag">+12.5%</span>
      </div>
      <div class="val">1.284 <span style="font-size:7pt; color:#64748b; font-weight:600;">Unit</span></div>
      <div class="lbl">Aspirasi Warga Masuk</div>
    </div>
    <div class="hudang-stat-box">
      <div class="head-row">
        <span class="icon-badge" style="background:#fef3c7; color:#b45309;">Sesi Aktif</span>
        <span class="grow-tag">+8.2%</span>
      </div>
      <div class="val">42 <span style="font-size:7pt; color:#64748b; font-weight:600;">Unit</span></div>
      <div class="lbl">Tatap Muka Berjalan</div>
    </div>
    <div class="hudang-stat-box">
      <div class="head-row">
        <span class="icon-badge" style="background:#fee2e2; color:#b91c1c;">Tingkat Kepuasan</span>
        <span class="grow-tag">+2.4%</span>
      </div>
      <div class="val">98.2% <span style="font-size:7pt; color:#64748b; font-weight:600;">Unit</span></div>
      <div class="lbl">Indeks Positif Warga</div>
    </div>
    <div class="hudang-stat-box">
      <div class="head-row">
        <span class="icon-badge" style="background:#dcfce7; color:#15803d;">Warga Terlibat</span>
        <span class="grow-tag">+15.7%</span>
      </div>
      <div class="val">10.4k <span style="font-size:7pt; color:#64748b; font-weight:600;">Unit</span></div>
      <div class="lbl">Partisipasi Konstituen</div>
    </div>
  </div>

  <div class="screenshot-card">
    <img src="file:///{screenshots_dir}/landing_page.png" alt="Landing Page HUDANG" style="max-height: 98mm; object-fit: cover; object-position: top;" />
    <div class="screenshot-caption">Gambar 1: Tampilan Beranda (Landing Page) Aplikasi HUDANG - Sekretariat DPRD Provinsi Jawa Barat</div>
  </div>

  <h2>Daftar Isi Dokumen</h2>
  <table style="margin-top: 2px;">
    <thead>
      <tr>
        <th style="width: 12%;">Bagian</th>
        <th style="width: 60%;">Topik Pembahasan</th>
        <th style="width: 28%;">Fokus Utama</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>BAB I</strong></td><td>Gambaran Umum &amp; Arsitektur Sistem HUDANG Sekretariat Dewan</td><td>Landasan &amp; 4 Aktor Pengguna</td></tr>
      <tr><td><strong>BAB II</strong></td><td>Panduan Penggunaan, Diagram Alur &amp; Card Komponen Aplikasi</td><td>Diagram Swimlane &amp; Card Dewan</td></tr>
      <tr><td><strong>BAB III</strong></td><td>Diagram Pipeline Pengolahan Data Audio &amp; AI Gemini Multimodal</td><td>Transkripsi Verbatim &amp; Sentimen</td></tr>
      <tr><td><strong>BAB IV</strong></td><td>Data Aspirasi Masyarakat Masuk &amp; Terolah (Dapil I s/d XV)</td><td>6 Contoh Kasus Terolah</td></tr>
      <tr><td><strong>BAB V</strong></td><td>Statistik Partisipasi Publik &amp; Grafik Analisis Sektoral HUDANG</td><td>Donut, Tren, Bar Komisi, Dapil &amp; Dewan</td></tr>
      <tr><td><strong>BAB V (Lanjutan)</strong></td><td>Dashboard Geospasial GIS &amp; Matriks AKD / 15 Dapil</td><td>GIS Jabar &amp; Alokasi 120 Kursi</td></tr>
      <tr><td><strong>BAB VI</strong></td><td>Kesimpulan &amp; Roadmap Rencana Pengembangan</td><td>Rencana Aksi &amp; Evaluasi</td></tr>
    </tbody>
  </table>
</div>

<!-- HALAMAN 3: BAB I - GAMBARAN UMUM & ARSITEKTUR -->
<div class="page">
  <h1>BAB I: GAMBARAN UMUM &amp; ARSITEKTUR SISTEM</h1>

  <h2>1.1 Definisi &amp; Singkatan Resmi HUDANG</h2>
  <p>
    <strong>HUDANG</strong> merupakan akronim resmi dalam bahasa Sunda: <em>"Hadirkeun Usulan, Dangukeun Aspirasi, Nyatakeun Gagasan"</em> (Hadirkan Usulan, Dengarkan Aspirasi, Nyatakan Gagasan). Sistem ini adalah inovasi digital resmi yang disiapkan di lingkungan <strong>Sekretariat DPRD Provinsi Jawa Barat</strong> untuk menghubungkan warga masyarakat di 27 Kabupaten/Kota dengan 120 Anggota DPRD secara terstruktur, transparan, dan akuntabel.
  </p>

  <h2>1.2 Matriks 4 Peran Pengguna (User Actors)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Peran Pengguna</th>
        <th style="width: 42%;">Tanggung Jawab &amp; Hak Akses Utama</th>
        <th style="width: 40%;">Menu / Fitur Kunci di Platform</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="badge badge-primary">Warga (Masyarakat)</span></td>
        <td>Mengajukan aspirasi, memilih dewan berdasarkan Dapil/Komisi, memilih slot waktu, bertatap muka virtual, dan memberi rating evaluasi 5 dimensi.</td>
        <td>
          &bull; Direktori 120 Profil Anggota Dewan<br>
          &bull; Form Booking Jadwal &amp; Unggah Bukti<br>
          &bull; Ruang Video Conference WebRTC<br>
          &bull; Form Penilaian Rating 5 Dimensi
        </td>
      </tr>
      <tr>
        <td><span class="badge badge-success">Anggota DPRD</span></td>
        <td>Menentukan slot ketersediaan (availability), menyetujui jadwal aspirasi masuk, berdialog virtual, dan menerima notulensi otomatis AI.</td>
        <td>
          &bull; Manajemen Kalender Waktu Luang<br>
          &bull; Approval Jadwal Aspirasi Warga<br>
          &bull; Akses Transkrip Verbatim &amp; Analisis AI<br>
          &bull; Rekap Nilai Kepuasan Konstituen
        </td>
      </tr>
      <tr>
        <td><span class="badge badge-purple">AKD &amp; Fraksi</span></td>
        <td>Memantau agregasi aspirasi sesuai bidang Komisi (Komisi I s.d V) dan Badan Dewan untuk bahan usulan Pokir dan RDP.</td>
        <td>
          &bull; Filter Aspirasi Berdasarkan Bidang Komisi<br>
          &bull; Matriks Isu Tematik Lintas Fraksi<br>
          &bull; Unduh Berita Acara Sesi Aspirasi
        </td>
      </tr>
      <tr>
        <td><span class="badge badge-slate">Admin Setwan</span></td>
        <td>Pengelolaan master data 120 dewan, monitoring server LiveKit WebRTC, pengawasan antrean AI Gemini, dan pemetaan geospasial GIS.</td>
        <td>
          &bull; Monitoring Server Video &amp; Egress Recorder<br>
          &bull; Pemantauan Antrean Transkripsi AI<br>
          &bull; Peta Geospasial Sebaran Aspirasi (GIS)<br>
          &bull; Audit Trail Log &amp; User Master Data
        </td>
      </tr>
    </tbody>
  </table>

  <h2>1.3 Fondasi Ekosistem Teknologi Modern</h2>
  <div class="callout callout-info">
    <strong>Infrastruktur Fullstack &amp; AI Engine</strong>
    <ul>
      <li><strong>Frontend Layer:</strong> Next.js 14, Tailwind CSS, TypeScript, Lucide Icons dengan UI Glassmorphism adaptif Light/Dark mode.</li>
      <li><strong>Backend Layer:</strong> Node.js Express, Prisma ORM, PostgreSQL Database, Redis Queue (BullMQ), dan JWT Auth.</li>
      <li><strong>Media Engine:</strong> LiveKit SFU WebRTC Server dan LiveKit Egress untuk perekaman audio-video resolusi tinggi.</li>
      <li><strong>AI Engine:</strong> Google Gemini Flash Multimodal API untuk transkripsi audio verbatim murni dan ekstraksi rekomendasi disposisi.</li>
      <li><strong>Geospatial Layer:</strong> GeoJSON 27 Kabupaten/Kota Jawa Barat untuk visualisasi peta sebaran aspirasi.</li>
    </ul>
  </div>
</div>

<!-- HALAMAN 4: BAB II - DIAGRAM ALUR MULTI-AKTOR & CARD KOMPONEN -->
<div class="page">
  <h1>BAB II: PANDUAN PENGGUNAAN &amp; DIAGRAM ALUR (SOP)</h1>

  <div class="diagram-container">
    <div class="diagram-title">DIAGRAM 1: ALUR KERJA MULTI-AKTOR SISTEM HUDANG</div>
    
    <svg width="100%" height="200" viewBox="0 0 740 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="font-family:'Plus Jakarta Sans', sans-serif;">
      <!-- Lane 1: Warga -->
      <rect x="10" y="8" width="720" height="48" rx="6" fill="#F0F9FF" stroke="#BAE6FD" stroke-width="1.5"/>
      <rect x="20" y="14" width="95" height="34" rx="4" fill="#0284C7"/>
      <text x="67" y="35" fill="#FFFFFF" font-size="9" font-weight="700" text-anchor="middle">WARGA</text>
      
      <rect x="130" y="14" width="125" height="34" rx="4" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/>
      <text x="192" y="27" fill="#0369A1" font-size="7.8" font-weight="700" text-anchor="middle">1. Pilih Dewan &amp; Dapil</text>
      <text x="192" y="39" fill="#64748B" font-size="6.8" text-anchor="middle">Booking Slot Waktu</text>
      
      <path d="M255 31 H270" stroke="#0284C7" stroke-width="2" marker-end="url(#arr-blue)"/>

      <rect x="275" y="14" width="130" height="34" rx="4" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/>
      <text x="340" y="27" fill="#0369A1" font-size="7.8" font-weight="700" text-anchor="middle">2. Isi Topik &amp; Bukti</text>
      <text x="340" y="39" fill="#64748B" font-size="6.8" text-anchor="middle">Unggah Dokumen Usulan</text>

      <path d="M340 48 V65" stroke="#0284C7" stroke-width="2" stroke-dasharray="3 3"/>

      <!-- Lane 2: Dewan -->
      <rect x="10" y="68" width="720" height="48" rx="6" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1.5"/>
      <rect x="20" y="74" width="95" height="34" rx="4" fill="#16A34A"/>
      <text x="67" y="95" fill="#FFFFFF" font-size="9" font-weight="700" text-anchor="middle">DEWAN</text>

      <rect x="275" y="74" width="130" height="34" rx="4" fill="#FFFFFF" stroke="#16A34A" stroke-width="1.5"/>
      <text x="340" y="87" fill="#15803D" font-size="7.8" font-weight="700" text-anchor="middle">3. Tinjau &amp; Konfirmasi</text>
      <text x="340" y="99" fill="#64748B" font-size="6.8" text-anchor="middle">Approve / Reschedule</text>

      <path d="M405 91 H425" stroke="#16A34A" stroke-width="2"/>

      <!-- Step 4: Joint Video -->
      <rect x="430" y="42" width="140" height="42" rx="6" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
      <text x="500" y="58" fill="#B45309" font-size="8" font-weight="800" text-anchor="middle">4. TATAP MUKA VIRTUAL</text>
      <text x="500" y="71" fill="#78350F" font-size="6.8" text-anchor="middle">LiveKit SFU (Perekaman Egress)</text>

      <path d="M405 31 H450 V42" stroke="#0284C7" stroke-width="2"/>
      <path d="M425 91 H450 V84" stroke="#16A34A" stroke-width="2"/>
      <path d="M570 63 H590" stroke="#F59E0B" stroke-width="2"/>

      <rect x="595" y="14" width="125" height="34" rx="4" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/>
      <text x="657" y="27" fill="#0369A1" font-size="7.8" font-weight="700" text-anchor="middle">5. Rating 5 Dimensi</text>
      <text x="657" y="39" fill="#64748B" font-size="6.8" text-anchor="middle">Warga Menilai Dewan</text>

      <rect x="595" y="74" width="125" height="34" rx="4" fill="#FFFFFF" stroke="#16A34A" stroke-width="1.5"/>
      <text x="657" y="96" fill="#15803D" font-size="7.8" font-weight="700" text-anchor="middle">6. Risalah &amp; Analisis AI</text>
      <text x="657" y="109" fill="#64748B" font-size="7" text-anchor="middle">Notulensi Instan Terbit</text>

      <!-- Lane 3: Setwan & AKD -->
      <rect x="10" y="128" width="720" height="52" rx="6" fill="#FAF5FF" stroke="#E9D5FF" stroke-width="1.5"/>
      <rect x="20" y="135" width="95" height="36" rx="4" fill="#9333EA"/>
      <text x="67" y="157" fill="#FFFFFF" font-size="8.5" font-weight="700" text-anchor="middle">SETWAN &amp; AKD</text>

      <rect x="130" y="135" width="275" height="36" rx="4" fill="#FFFFFF" stroke="#9333EA" stroke-width="1.5"/>
      <text x="267" y="149" fill="#7E22CE" font-size="8" font-weight="700" text-anchor="middle">7. Pemetaan Geospasial GIS &amp; Heatmap</text>
      <text x="267" y="161" fill="#64748B" font-size="6.8" text-anchor="middle">Pengelompokan Isu Tematik 27 Kab/Kota Se-Jawa Barat</text>

      <path d="M405 153 H425" stroke="#9333EA" stroke-width="2"/>

      <rect x="430" y="135" width="290" height="36" rx="4" fill="#FFFFFF" stroke="#9333EA" stroke-width="1.5"/>
      <text x="575" y="149" fill="#7E22CE" font-size="8" font-weight="700" text-anchor="middle">8. Disposisi Rekomendasi ke OPD &amp; Pokir</text>
      <text x="575" y="161" fill="#64748B" font-size="6.8" text-anchor="middle">Integrasi SIPD / Musrenbang RKPD Pemprov Jawa Barat</text>

      <defs>
        <marker id="arr-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284C7"/>
        </marker>
      </defs>
    </svg>
  </div>

  <h2>2.2 Tampilan Card Komponen Profil Dewan (DewanCard UI)</h2>
  <div class="dewan-component-card">
    <div class="dewan-avatar-box">AR</div>
    <div class="dewan-info-col">
      <div class="dewan-name">H. Arip Rahman, S.E.</div>
      <div class="dewan-meta-row">
        <span class="badge badge-primary">Fraksi PKB</span>
        <span class="badge badge-success">Komisi II (Ekonomi &amp; Pertanian)</span>
        <span class="badge badge-purple">Dapil XV (Kota/Kab. Tasikmalaya)</span>
      </div>
      <div style="font-size:7pt; color:#475569;">
        Ketersediaan: <strong>Senin &amp; Kamis (09.00 - 11.30 WIB)</strong> &bull; Total Dialog: <strong>28 Sesi</strong>
      </div>
    </div>
    <div class="dewan-action-col">
      <div style="font-size:11pt; font-weight:800; color:#15803d;">4.95 / 5.0</div>
      <div style="font-size:6.5pt; color:#64748b; text-transform:uppercase;">Rating Kinerja Warga</div>
      <div class="badge badge-success" style="margin-top:3px;">Slot Tersedia</div>
    </div>
  </div>

  <h2>2.3 SOP Penilaian Kinerja 5 Dimensi (Feedback Loop Warga)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Dimensi Evaluasi</th>
        <th style="width: 50%;">Deskripsi Parameter yang Dinilai Warga</th>
        <th style="width: 15%;">Bobot</th>
        <th style="width: 15%;">Target Minimal</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>1. Speaking Score</strong></td><td>Kejelasan artikulasi bicara, keramahan bahasa, dan keterbukaan komunikasi dewan.</td><td>20%</td><td>4.0 / 5.0</td></tr>
      <tr><td><strong>2. Context Score</strong></td><td>Tingkat penguasaan dewan terhadap substansi masalah daerah dan regulasi hukum terkait.</td><td>20%</td><td>4.0 / 5.0</td></tr>
      <tr><td><strong>3. Time Score</strong></td><td>Kedisiplinan hadir tepat waktu di ruang virtual sesuai jadwal yang disepakati.</td><td>15%</td><td>4.5 / 5.0</td></tr>
      <tr><td><strong>4. Responsiveness</strong></td><td>Kecepatan tanggapan, perhatian menyimak keluhan warga tanpa memotong pembicaraan.</td><td>20%</td><td>4.2 / 5.0</td></tr>
      <tr><td><strong>5. Solution Score</strong></td><td>Kualitas tawaran solusi konkret, komitmen pengawalan Pokir, dan kejelasan tindak lanjut ke OPD.</td><td>25%</td><td>4.0 / 5.0</td></tr>
    </tbody>
  </table>
</div>

<!-- HALAMAN 5: BAB II (LANJUTAN) - EVIDENCE SCREENSHOT ANTARMUKA -->
<div class="page">
  <h1>BAB II: TAMPILAN ANTARMUKA APLIKASI HUDANG</h1>
  <p>
    Dokumentasi tangkapan layar antarmuka operasional platform HUDANG Sekretariat DPRD Provinsi Jawa Barat:
  </p>

  <div class="screenshot-grid-2">
    <div class="screenshot-card">
      <img src="file:///{screenshots_dir}/masyarakat_page.png" alt="Portal Masyarakat" style="max-height: 82mm; object-fit: cover; object-position: top;" />
      <div class="screenshot-caption">Gambar 2: Portal Warga - Pencarian 120 Dewan, Filter Dapil &amp; Booking Jadwal</div>
    </div>
    <div class="screenshot-card">
      <img src="file:///{screenshots_dir}/dewan_page.png" alt="Dashboard Dewan" style="max-height: 82mm; object-fit: cover; object-position: top;" />
      <div class="screenshot-caption">Gambar 3: Dashboard Legislator - Kalender Ketersediaan &amp; Konfirmasi Sesi</div>
    </div>
  </div>

  <div class="screenshot-grid-2">
    <div class="screenshot-card">
      <img src="file:///{screenshots_dir}/room_prejoin_page.png" alt="Prejoin Video Call" style="max-height: 82mm; object-fit: cover; object-position: top;" />
      <div class="screenshot-caption">Gambar 4: Ruang Pre-Join &amp; Konferensi Video LiveKit SFU Terenkripsi</div>
    </div>
    <div class="screenshot-card">
      <img src="file:///{screenshots_dir}/admin_page.png" alt="Dashboard Admin Setwan" style="max-height: 82mm; object-fit: cover; object-position: top;" />
      <div class="screenshot-caption">Gambar 5: Dashboard Administrator Sekretariat Dewan - Monitoring Server &amp; AI Queue</div>
    </div>
  </div>
</div>

<!-- HALAMAN 6: BAB III - DIAGRAM PIPELINE AI GEMINI -->
<div class="page">
  <h1>BAB III: DIAGRAM PIPELINE PENGOLAHAN DATA &amp; AI</h1>

  <div class="diagram-container">
    <div class="diagram-title">DIAGRAM 2: ARSITEKTUR PIPELINE AI MULTIMODAL (GOOGLE GEMINI FLASH)</div>
    
    <svg width="100%" height="235" viewBox="0 0 740 235" fill="none" xmlns="http://www.w3.org/2000/svg" style="font-family:'Plus Jakarta Sans', sans-serif;">
      <rect x="10" y="15" width="115" height="60" rx="6" fill="#0F172A" stroke="#334155" stroke-width="1.5"/>
      <text x="67" y="36" fill="#38BDF8" font-size="8.5" font-weight="700" text-anchor="middle">Rapat Virtual</text>
      <text x="67" y="50" fill="#94A3B8" font-size="7.5" text-anchor="middle">LiveKit SFU</text>
      <text x="67" y="64" fill="#E2E8F0" font-size="7" text-anchor="middle">WebRTC Stream</text>

      <path d="M125 45 H155" stroke="#0284C7" stroke-width="2"/>

      <rect x="160" y="15" width="125" height="60" rx="6" fill="#F0F9FF" stroke="#0284C7" stroke-width="1.5"/>
      <text x="222" y="36" fill="#0369A1" font-size="8.5" font-weight="700" text-anchor="middle">LiveKit Egress</text>
      <text x="222" y="50" fill="#475569" font-size="7.5" text-anchor="middle">Audio Recorder</text>
      <text x="222" y="64" fill="#0284C7" font-size="7" font-weight="600" text-anchor="middle">Format WAV / MP4</text>

      <path d="M285 45 H315" stroke="#0284C7" stroke-width="2"/>

      <rect x="320" y="15" width="135" height="60" rx="6" fill="#F8FAFC" stroke="#64748B" stroke-width="1.5"/>
      <text x="387" y="36" fill="#0F172A" font-size="8.5" font-weight="700" text-anchor="middle">Backend Queue</text>
      <text x="387" y="50" fill="#475569" font-size="7.5" text-anchor="middle">BullMQ / Redis Cache</text>
      <text x="387" y="64" fill="#16A34A" font-size="7" font-weight="600" text-anchor="middle">Status Progress 0-100%</text>

      <path d="M455 45 H485" stroke="#0284C7" stroke-width="2"/>

      <rect x="490" y="15" width="240" height="60" rx="6" fill="#FAF5FF" stroke="#9333EA" stroke-width="2"/>
      <text x="610" y="35" fill="#7E22CE" font-size="9" font-weight="800" text-anchor="middle">GOOGLE GEMINI FILE API</text>
      <text x="610" y="49" fill="#6B21A8" font-size="7.5" text-anchor="middle">Direct Multimodal Audio Ingestion</text>
      <text x="610" y="63" fill="#DC2626" font-size="7" font-weight="700" text-anchor="middle">Temperature: 0 (Strict Anti-Hallucination)</text>

      <path d="M610 75 V100" stroke="#9333EA" stroke-width="2"/>

      <rect x="10" y="105" width="720" height="115" rx="8" fill="#F0FDF4" stroke="#16A34A" stroke-width="1.5"/>
      <text x="370" y="123" fill="#15803D" font-size="8.5" font-weight="800" text-anchor="middle">OUTPUT HASIL ANALISIS OTOMATIS BERBASIS JSON MURNI</text>

      <rect x="25" y="132" width="160" height="74" rx="4" fill="#FFFFFF" stroke="#BBF7D0"/>
      <text x="105" y="150" fill="#0F172A" font-size="8" font-weight="700" text-anchor="middle">1. Transkripsi Verbatim</text>
      <text x="105" y="165" fill="#64748B" font-size="7" text-anchor="middle">Kata demi kata faktual</text>
      <text x="105" y="179" fill="#64748B" font-size="7" text-anchor="middle">Label pembicara &amp; waktu</text>
      <text x="105" y="194" fill="#16A34A" font-size="6.8" font-weight="600" text-anchor="middle">Validitas Administrasi 100%</text>

      <rect x="195" y="132" width="165" height="74" rx="4" fill="#FFFFFF" stroke="#BBF7D0"/>
      <text x="277" y="150" fill="#0F172A" font-size="8" font-weight="700" text-anchor="middle">2. Analisis Sentimen</text>
      <text x="277" y="165" fill="#64748B" font-size="7" text-anchor="middle">Klasifikasi Emosi Warga</text>
      <text x="277" y="179" fill="#64748B" font-size="7" text-anchor="middle">Positif / Netral / Kritis</text>
      <text x="277" y="194" fill="#D97706" font-size="6.8" font-weight="600" text-anchor="middle">Tingkat Urgensi Masalah</text>

      <rect x="370" y="132" width="165" height="74" rx="4" fill="#FFFFFF" stroke="#BBF7D0"/>
      <text x="452" y="150" fill="#0F172A" font-size="8" font-weight="700" text-anchor="middle">3. Ekstraksi Action Items</text>
      <text x="452" y="165" fill="#64748B" font-size="7" text-anchor="middle">Poin Kesepakatan Bersama</text>
      <text x="452" y="179" fill="#64748B" font-size="7" text-anchor="middle">Rekomendasi Disposisi OPD</text>
      <text x="452" y="194" fill="#0284C7" font-size="6.8" font-weight="600" text-anchor="middle">Bahan RDP Komisi / Pokir</text>

      <rect x="545" y="132" width="170" height="74" rx="4" fill="#FFFFFF" stroke="#BBF7D0"/>
      <text x="630" y="150" fill="#0F172A" font-size="8" font-weight="700" text-anchor="middle">4. Scoring AI Objektif</text>
      <text x="630" y="165" fill="#64748B" font-size="7" text-anchor="middle">Discussion Quality (1-10)</text>
      <text x="630" y="179" fill="#64748B" font-size="7" text-anchor="middle">Problem Solving (1-10)</text>
      <text x="630" y="194" fill="#9333EA" font-size="6.8" font-weight="600" text-anchor="middle">Dewan Responsiveness (1-10)</text>
    </svg>
  </div>

  <h2>3.2 Format JSON Database Output</h2>
  <div class="verbatim-box">
{{
  <span style="color: #f43f5e;">"transcription"</span>: <span style="color: #fef08a;">"[00:02] [Warga]: Sampurasun Pak Dewan... [00:18] [Dewan]: Rampes, kami koordinasikan segera."</span>,
  <span style="color: #f43f5e;">"analysis"</span>: {{
    <span style="color: #38bdf8;">"summary"</span>: <span style="color: #fef08a;">"Diskusi aspirasi perbaikan infrastruktur darurat di daerah pemilihan."</span>,
    <span style="color: #38bdf8;">"sentiment"</span>: <span style="color: #4ade80;">"Positif (Solutif)"</span>,
    <span style="color: #38bdf8;">"actionItems"</span>: [<span style="color: #fef08a;">"Kunjungan kerja lapangan Komisi IV"</span>, <span style="color: #fef08a;">"Penyusunan usulan APBD Perubahan"</span>],
    <span style="color: #38bdf8;">"citizenSatisfaction"</span>: 9, <span style="color: #38bdf8;">"dewanResponsiveness"</span>: 10, <span style="color: #38bdf8;">"problemSolving"</span>: 9
  }}
}}
  </div>
</div>

<!-- HALAMAN 7: BAB IV - DATA MASUK (KASUS 1 & 2) -->
<div class="page">
  <h1>BAB IV: DATA ASPIRASI MASYARAKAT MASUK &amp; TEROLAH (KASUS 1 &amp; 2)</h1>

  <!-- KASUS 1 -->
  <div class="aspirasi-card">
    <div class="aspirasi-header">
      <div>
        <div class="aspirasi-title">ASP-2026-JBR-00104: Penanganan Abrasi Pantai &amp; Normalisasi Muara Nelayan Dadap</div>
        <div class="aspirasi-meta">
          <strong>Wilayah:</strong> Desa Dadap, Kec. Juntinyuat, Kab. Indramayu (Dapil XII) &bull; 
          <strong>Waktu:</strong> 12 Agustus 2026, 09:30 - 10:15 WIB
        </div>
      </div>
      <div>
        <span class="badge badge-danger">Prioritas Kritis</span> &nbsp;
        <span class="badge badge-success">Sesi Selesai</span>
      </div>
    </div>

    <div class="aspirasi-grid">
      <div class="grid-box">
        <h6>Identitas Pengusul &amp; Dewan</h6>
        <p>
          <strong>Warga:</strong> H. Kasim Solihin (Ketua KUD Mina Bahari)<br>
          <strong>Dewan:</strong> H. Syahrir, S.E., M.I.Pol (Komisi IV - Infrastruktur &amp; SDA)<br>
          <strong>Fraksi:</strong> Gerindra
        </p>
      </div>
      <div class="grid-box">
        <h6>Kategori Isu &amp; Dampak</h6>
        <p>
          <strong>Kategori:</strong> Kelautan, Perikanan &amp; Pengaman Pantai<br>
          <strong>Dampak Warga:</strong> 450 perahu nelayan terhambat melaut akibat sedimentasi muara setebal 2 meter dan abrasi merusak 14 tambak.
        </p>
      </div>
    </div>

    <div class="verbatim-box">
[00:05] <span class="verbatim-speaker">[Warga H. Kasim]:</span> "Assalamu'alaikum Pak Syahrir. Nelayan Dadap sudah 6 bulan terhambat melaut karena muara dangkal parah. Mohon pengerukan beko amfibi dan tanggul pemecah ombak."<br>
[00:42] <span class="verbatim-dewan">[Dewan Syahrir]:</span> "Wa'alaikumsalam Pak Haji. Komisi IV sedang membahas Renja Dinas SDA &amp; DKP Jabar. Pekan depan kami kunker langsung bersama UPTD SDA untuk drop ekskavator long-arm."
    </div>

    <div class="ai-analysis-box">
      <div class="ai-analysis-header">
        <strong style="color: #15803d; font-size: 7.8pt;">Hasil Analisis Gemini AI &amp; Rekomendasi Disposisi</strong>
        <span class="ai-score-pill">Sentimen: Negatif &rarr; Solutif</span>
      </div>
      <p style="margin: 0; font-size: 7.5pt; color: #166534;">
        <strong>Disposisi:</strong> Dinas Sumber Daya Air (SDA) &amp; Dinas Kelautan Perikanan Jabar. (Action: Pengerukan darurat muara &amp; pengajuan breakwater APBD-P).
      </p>
      <div class="metrics-bar-grid">
        <div class="metric-item"><div class="val">9.5/10</div><div class="lbl">Kualitas Diskusi</div></div>
        <div class="metric-item"><div class="val">9.0/10</div><div class="lbl">Respons Dewan</div></div>
        <div class="metric-item"><div class="val">9.5/10</div><div class="lbl">Solusi Masalah</div></div>
        <div class="metric-item"><div class="val">4.9/5.0</div><div class="lbl">Rating Warga</div></div>
      </div>
    </div>
  </div>

  <!-- KASUS 2 -->
  <div class="aspirasi-card">
    <div class="aspirasi-header">
      <div>
        <div class="aspirasi-title">ASP-2026-JBR-00105: Evaluasi Kuota Zonasi PPDB &amp; Kebutuhan USB SMAN di Bandung Timur</div>
        <div class="aspirasi-meta">
          <strong>Wilayah:</strong> Kec. Cibiru &amp; Panyileukan, Kota Bandung (Dapil I) &bull; 
          <strong>Waktu:</strong> 13 Agustus 2026, 14:00 - 14:45 WIB
        </div>
      </div>
      <div>
        <span class="badge badge-warning">Prioritas Tinggi</span> &nbsp;
        <span class="badge badge-success">Sesi Selesai</span>
      </div>
    </div>

    <div class="aspirasi-grid">
      <div class="grid-box">
        <h6>Identitas Pengusul &amp; Dewan</h6>
        <p>
          <strong>Warga:</strong> Dra. Ratna Kusuma (Forum Orang Tua Murid Jabar)<br>
          <strong>Dewan:</strong> Hj. Siti Muntamah, S.AP (Komisi V - Pendidikan &amp; Kesra)<br>
          <strong>Fraksi:</strong> PKS
        </p>
      </div>
      <div class="grid-box">
        <h6>Kategori Isu &amp; Dampak</h6>
        <p>
          <strong>Kategori:</strong> Pendidikan Menengah &amp; Sarana Sekolah<br>
          <strong>Dampak Warga:</strong> Kawasan Cibiru mengalami 'blank spot' SMA Negeri, memaksa ratusan siswa berprestasi masuk sekolah swasta berbiaya tinggi.
        </p>
      </div>
    </div>

    <div class="verbatim-box">
[00:10] <span class="verbatim-speaker">[Warga Ibu Ratna]:</span> "Ibu Siti, sistem zonasi membuat anak-anak di 3 kelurahan Cibiru tidak ada yang tembus SMA Negeri karena jaraknya 4,8 km. Mohon dibangun Unit Sekolah Baru (USB) di lahan Pemprov di Palasari."<br>
[00:55] <span class="verbatim-dewan">[Dewan Siti]:</span> "Terima kasih Bu Ratna. Komisi V sudah memetakan blank spot Bandung. Kami akan dorong Disdik Jabar menganggarkan DED dan pembebasan lahan SMA Negeri baru di APBD Murni 2027."
    </div>

    <div class="ai-analysis-box">
      <div class="ai-analysis-header">
        <strong style="color: #15803d; font-size: 7.8pt;">Hasil Analisis Gemini AI &amp; Rekomendasi Disposisi</strong>
        <span class="ai-score-pill">Sentimen: Konstruktif / Positif</span>
      </div>
      <p style="margin: 0; font-size: 7.5pt; color: #166534;">
        <strong>Disposisi:</strong> Dinas Pendidikan Provinsi Jawa Barat. (Action: Pemetaan kebutuhan USB SMA Negeri &amp; usulan DED APBD 2027).
      </p>
      <div class="metrics-bar-grid">
        <div class="metric-item"><div class="val">9.0/10</div><div class="lbl">Kualitas Diskusi</div></div>
        <div class="metric-item"><div class="val">9.5/10</div><div class="lbl">Respons Dewan</div></div>
        <div class="metric-item"><div class="val">8.8/10</div><div class="lbl">Solusi Masalah</div></div>
        <div class="metric-item"><div class="val">4.8/5.0</div><div class="lbl">Rating Warga</div></div>
      </div>
    </div>
  </div>
</div>

<!-- HALAMAN 8: BAB IV - DATA MASUK (KASUS 3 & 4) -->
<div class="page">
  <h1>BAB IV: DATA ASPIRASI MASYARAKAT MASUK &amp; TEROLAH (KASUS 3 &amp; 4)</h1>

  <!-- KASUS 3 -->
  <div class="aspirasi-card">
    <div class="aspirasi-header">
      <div>
        <div class="aspirasi-title">ASP-2026-JBR-00106: Alokasi Pupuk Subsidi &amp; Kerusakan Bendung Irigasi Cisayong</div>
        <div class="aspirasi-meta">
          <strong>Wilayah:</strong> Kec. Cisayong &amp; Rajapolah, Kab. Tasikmalaya (Dapil XV) &bull; 
          <strong>Waktu:</strong> 14 Agustus 2026, 10:00 - 10:40 WIB
        </div>
      </div>
      <div>
        <span class="badge badge-danger">Prioritas Kritis</span> &nbsp;
        <span class="badge badge-success">Sesi Selesai</span>
      </div>
    </div>

    <div class="aspirasi-grid">
      <div class="grid-box">
        <h6>Identitas Pengusul &amp; Dewan</h6>
        <p>
          <strong>Warga:</strong> Endang Koswara (Ketua Gapoktan Tani Mukti Jaya)<br>
          <strong>Dewan:</strong> H. Arip Rahman, S.E. (Komisi II - Pertanian &amp; Ekonomi)<br>
          <strong>Fraksi:</strong> PKB
        </p>
      </div>
      <div class="grid-box">
        <h6>Kategori Isu &amp; Dampak</h6>
        <p>
          <strong>Kategori:</strong> Pertanian, Ketahanan Pangan &amp; Irigasi<br>
          <strong>Dampak Warga:</strong> 320 hektar sawah padi organik terancam puso akibat jebolnya sayap bendung irigasi dan kuota pupuk subsidi baru terdistribusi 35%.
        </p>
      </div>
    </div>

    <div class="verbatim-box">
[00:08] <span class="verbatim-speaker">[Warga Pak Endang]:</span> "Kang Arip, irigasi Cisayong amblas tergerus banjir. Petani di 4 desa terancam gagal panen. Terus penebusan pupuk di KPL juga dipersulit sistem e-Alokasi."<br>
[00:48] <span class="verbatim-dewan">[Dewan Arip]:</span> "Muhun Kang Endang. Untuk irigasi, saya alokasikan dana Pokir darurat perbaikan bronjong lewat Dinas Bina Marga &amp; SDA Jabar. Untuk pupuk, lusa kami panggil Dinas Pertanian dalam RDP Komisi II."
    </div>

    <div class="ai-analysis-box">
      <div class="ai-analysis-header">
        <strong style="color: #15803d; font-size: 7.8pt;">Hasil Analisis Gemini AI &amp; Rekomendasi Disposisi</strong>
        <span class="ai-score-pill">Sentimen: Sangat Mendesak / Positif</span>
      </div>
      <p style="margin: 0; font-size: 7.5pt; color: #166534;">
        <strong>Disposisi:</strong> Dinas Tanaman Pangan &amp; Hortikultura + Dinas SDA Jabar. (Action: Alokasi bronjongisasi darurat &amp; RDP evaluasi kuota e-Alokasi pupuk).
      </p>
      <div class="metrics-bar-grid">
        <div class="metric-item"><div class="val">9.2/10</div><div class="lbl">Kualitas Diskusi</div></div>
        <div class="metric-item"><div class="val">9.8/10</div><div class="lbl">Respons Dewan</div></div>
        <div class="metric-item"><div class="val">9.4/10</div><div class="lbl">Solusi Masalah</div></div>
        <div class="metric-item"><div class="val">5.0/5.0</div><div class="lbl">Rating Warga</div></div>
      </div>
    </div>
  </div>

  <!-- KASUS 4 -->
  <div class="aspirasi-card">
    <div class="aspirasi-header">
      <div>
        <div class="aspirasi-title">ASP-2026-JBR-00107: Penegakan Hukum Limbah B3 Aliran Sungai Cileungsi Bogor</div>
        <div class="aspirasi-meta">
          <strong>Wilayah:</strong> Kec. Gunung Putri &amp; Cileungsi, Kab. Bogor (Dapil VI) &bull; 
          <strong>Waktu:</strong> 15 Agustus 2026, 15:30 - 16:15 WIB
        </div>
      </div>
      <div>
        <span class="badge badge-danger">Prioritas Kritis</span> &nbsp;
        <span class="badge badge-success">Sesi Selesai</span>
      </div>
    </div>

    <div class="aspirasi-grid">
      <div class="grid-box">
        <h6>Identitas Pengusul &amp; Dewan</h6>
        <p>
          <strong>Warga:</strong> Puarman (Komunitas Peduli Sungai Cileungsi / KP2C)<br>
          <strong>Dewan:</strong> Ricky Kurniawan, Lc. (Wakil Ketua Komisi IV)<br>
          <strong>Fraksi:</strong> Gerindra
        </p>
      </div>
      <div class="grid-box">
        <h6>Kategori Isu &amp; Dampak</h6>
        <p>
          <strong>Kategori:</strong> Lingkungan Hidup &amp; Pengelolaan Limbah B3<br>
          <strong>Dampak Warga:</strong> Bau menyengat dan ikan mati berkala, mengancam kualitas intake air baku PDAM untuk 30.000 pelanggan rumah tangga.
        </p>
      </div>
    </div>

    <div class="verbatim-box">
[00:15] <span class="verbatim-speaker">[Warga Pak Puarman]:</span> "Pak Ricky, pencemaran Cileungsi darurat. Pabrik buang limbah hitam pekat saat malam hari. Kami butuh CCTV pemantau otomatis dan penutupan outlet limbah ilegal."<br>
[01:05] <span class="verbatim-dewan">[Dewan Ricky]:</span> "Bukti koordinat ini langsung saya teruskan ke Kadis LH Jabar. Pekan depan Komisi IV bersama Gakkum KLHK akan sidak gabungan tanpa pemberitahuan ke pabrik bantaran sungai."
    </div>

    <div class="ai-analysis-box">
      <div class="ai-analysis-header">
        <strong style="color: #15803d; font-size: 7.8pt;">Hasil Analisis Gemini AI &amp; Rekomendasi Disposisi</strong>
        <span class="ai-score-pill">Sentimen: Kritis &rarr; Respons Cepat</span>
      </div>
      <p style="margin: 0; font-size: 7.5pt; color: #166534;">
        <strong>Disposisi:</strong> Dinas Lingkungan Hidup (DLH) Jawa Barat &amp; Satpol PP Jabar. (Action: Sidak terpadu Komisi IV &amp; pengadaan early warning sensor limbah).
      </p>
      <div class="metrics-bar-grid">
        <div class="metric-item"><div class="val">9.6/10</div><div class="lbl">Kualitas Diskusi</div></div>
        <div class="metric-item"><div class="val">9.4/10</div><div class="lbl">Respons Dewan</div></div>
        <div class="metric-item"><div class="val">9.2/10</div><div class="lbl">Solusi Masalah</div></div>
        <div class="metric-item"><div class="val">4.7/5.0</div><div class="lbl">Rating Warga</div></div>
      </div>
    </div>
  </div>
</div>

<!-- HALAMAN 9: BAB IV - DATA MASUK (KASUS 5 & 6) -->
<div class="page">
  <h1>BAB IV: DATA ASPIRASI MASYARAKAT MASUK &amp; TEROLAH (KASUS 5 &amp; 6)</h1>

  <!-- KASUS 5 -->
  <div class="aspirasi-card">
    <div class="aspirasi-header">
      <div>
        <div class="aspirasi-title">ASP-2026-JBR-00108: Percepatan Jalur Truk Tambang Parung Panjang &amp; Pos Timbang 24 Jam</div>
        <div class="aspirasi-meta">
          <strong>Wilayah:</strong> Kec. Parung Panjang &amp; Rumpin, Kab. Bogor (Dapil VI) &bull; 
          <strong>Waktu:</strong> 16 Agustus 2026, 11:00 - 11:50 WIB
        </div>
      </div>
      <div>
        <span class="badge badge-danger">Prioritas Kritis</span> &nbsp;
        <span class="badge badge-success">Sesi Selesai</span>
      </div>
    </div>

    <div class="aspirasi-grid">
      <div class="grid-box">
        <h6>Identitas Pengusul &amp; Dewan</h6>
        <p>
          <strong>Warga:</strong> TB. Ujang Ruhiyat (Aliansi Parung Panjang Bersatu)<br>
          <strong>Dewan:</strong> H. Cecep Gogom, S.Ag., M.Pd. (Komisi IV)<br>
          <strong>Fraksi:</strong> Gerindra
        </p>
      </div>
      <div class="grid-box">
        <h6>Kategori Isu &amp; Dampak</h6>
        <p>
          <strong>Kategori:</strong> Perhubungan, Keselamatan Jalan &amp; Tambang<br>
          <strong>Dampak Warga:</strong> Tingginya angka kecelakaan fatal roda dua akibat debu pekat, jalan hancur, dan pelanggaran jam operasional truk tronton tambang.
        </p>
      </div>
    </div>

    <div class="verbatim-box">
[00:12] <span class="verbatim-speaker">[Warga TB Ujang]:</span> "Pak Dewan Cecep, warga lelah dengan debu dan kecelakaan di Parung Panjang. Jam operasional Perbup sering dilanggar. Bagaimana kepastian jalan khusus tambang?"<br>
[01:02] <span class="verbatim-dewan">[Dewan Cecep]:</span> "DPRD Jabar terus mendesak Pj. Gubernur dan BUMD Jasa Sarana menyelesaikan konsorsium lahan jalur tambang. Kami juga instruksikan Dishub Jabar dirikan pos timbang 24 jam."
    </div>

    <div class="ai-analysis-box">
      <div class="ai-analysis-header">
        <strong style="color: #15803d; font-size: 7.8pt;">Hasil Analisis Gemini AI &amp; Rekomendasi Disposisi</strong>
        <span class="ai-score-pill">Sentimen: Kritis &amp; Mendesak</span>
      </div>
      <p style="margin: 0; font-size: 7.5pt; color: #166534;">
        <strong>Disposisi:</strong> Dinas Perhubungan (Dishub) Jabar &amp; Dinas BMPR. (Action: Percepatan groundbreaking jalur tambang &amp; penegakan hukum jam operasional truk).
      </p>
      <div class="metrics-bar-grid">
        <div class="metric-item"><div class="val">9.4/10</div><div class="lbl">Kualitas Diskusi</div></div>
        <div class="metric-item"><div class="val">9.2/10</div><div class="lbl">Respons Dewan</div></div>
        <div class="metric-item"><div class="val">9.0/10</div><div class="lbl">Solusi Masalah</div></div>
        <div class="metric-item"><div class="val">4.6/5.0</div><div class="lbl">Rating Warga</div></div>
      </div>
    </div>
  </div>

  <!-- KASUS 6 -->
  <div class="aspirasi-card">
    <div class="aspirasi-header">
      <div>
        <div class="aspirasi-title">ASP-2026-JBR-00109: Bantuan Modal &amp; Pelatihan Digital Marketing UMKM Rajutan Binong Jati</div>
        <div class="aspirasi-meta">
          <strong>Wilayah:</strong> Sentra Rajut Binong Jati, Kec. Batununggal, Kota Bandung (Dapil I) &bull; 
          <strong>Waktu:</strong> 17 Agustus 2026, 13:30 - 14:15 WIB
        </div>
      </div>
      <div>
        <span class="badge badge-primary">Prioritas Sedang</span> &nbsp;
        <span class="badge badge-success">Sesi Selesai</span>
      </div>
    </div>

    <div class="aspirasi-grid">
      <div class="grid-box">
        <h6>Identitas Pengusul &amp; Dewan</h6>
        <p>
          <strong>Warga:</strong> Dedi Supriadi (Paguyuban Rajut Bandung Creative)<br>
          <strong>Dewan:</strong> Taufik Hidayat, S.H., M.H. (Komisi II)<br>
          <strong>Fraksi:</strong> Golkar
        </p>
      </div>
      <div class="grid-box">
        <h6>Kategori Isu &amp; Dampak</h6>
        <p>
          <strong>Kategori:</strong> UMKM, Koperasi &amp; Ekonomi Kreatif<br>
          <strong>Dampak Warga:</strong> Penurunan omset pengrajin rajut hingga 40% akibat serbuan barang impor murah; butuh bantuan mesin rajut modern dan pelatihan marketplace.
        </p>
      </div>
    </div>

    <div class="verbatim-box">
[00:10] <span class="verbatim-speaker">[Warga Pak Dedi]:</span> "Kang Taufik, sentra rajut Binong Jati butuh regenerasi teknologi mesin komputer dan fasilitasi kredit KUR bunga rendah Bank BJB untuk modal produksi."<br>
[00:50] <span class="verbatim-dewan">[Dewan Taufik]:</span> "Sangat tepat Pak Dedi. Kami hubungkan paguyuban dengan program fasilitasi Dinas KUK Jabar dan agendakan workshop digital bersama e-commerce di Dekranasda bulan depan."
    </div>

    <div class="ai-analysis-box">
      <div class="ai-analysis-header">
        <strong style="color: #15803d; font-size: 7.8pt;">Hasil Analisis Gemini AI &amp; Rekomendasi Disposisi</strong>
        <span class="ai-score-pill">Sentimen: Positif &amp; Optimis</span>
      </div>
      <p style="margin: 0; font-size: 7.5pt; color: #166534;">
        <strong>Disposisi:</strong> Dinas Koperasi dan Usaha Kecil (KUK) Jabar &amp; Bank BJB. (Action: Pelatihan digital onboarding &amp; akses permodalan KUR bunga murah).
      </p>
      <div class="metrics-bar-grid">
        <div class="metric-item"><div class="val">9.2/10</div><div class="lbl">Kualitas Diskusi</div></div>
        <div class="metric-item"><div class="val">9.6/10</div><div class="lbl">Respons Dewan</div></div>
        <div class="metric-item"><div class="val">9.3/10</div><div class="lbl">Solusi Masalah</div></div>
        <div class="metric-item"><div class="val">4.9/5.0</div><div class="lbl">Rating Warga</div></div>
      </div>
    </div>
  </div>
</div>

<!-- HALAMAN 10: BAB V - GRAFIK ANALITIK & STATISTIK PARTISIPASI PUBLIK (SESUAI UI HUDANG) -->
<div class="page">
  <h1>BAB V: STATISTIK PARTISIPASI PUBLIK &amp; GRAFIK ANALITIK</h1>
  
  <div class="callout callout-info" style="margin-bottom:6px;">
    <strong>Dashboard Analitik HUDANG (Statistik Partisipasi Publik)</strong>
    Komponen analitik di bawah ini merupakan visualisasi data real-time pada modul dashboard utama platform HUDANG:
  </div>

  <!-- Row 1: Topik Populer (Donut) & Tren Aktivitas (Line) -->
  <div class="chart-grid-2">
    <!-- Chart 1: Donut Chart Topik Populer -->
    <div class="chart-box">
      <h4>TOPIK POPULER ASPIRASI</h4>
      <svg width="100%" height="95" viewBox="0 0 340 95" fill="none" xmlns="http://www.w3.org/2000/svg" style="font-family:'Plus Jakarta Sans', sans-serif;">
        <!-- Donut Segments -->
        <circle cx="55" cy="48" r="36" stroke="#e2e8f0" stroke-width="14" fill="none" />
        <circle cx="55" cy="48" r="36" stroke="#10b981" stroke-width="14" stroke-dasharray="79 226" stroke-dashoffset="0" fill="none" />
        <circle cx="55" cy="48" r="36" stroke="#3b82f6" stroke-width="14" stroke-dasharray="56 226" stroke-dashoffset="-79" fill="none" />
        <circle cx="55" cy="48" r="36" stroke="#ef4444" stroke-width="14" stroke-dasharray="45 226" stroke-dashoffset="-135" fill="none" />
        <circle cx="55" cy="48" r="36" stroke="#f59e0b" stroke-width="14" stroke-dasharray="34 226" stroke-dashoffset="-180" fill="none" />
        <circle cx="55" cy="48" r="36" stroke="#64748b" stroke-width="14" stroke-dasharray="12 226" stroke-dashoffset="-214" fill="none" />
        <text x="55" y="46" fill="#0f172a" font-size="10" font-weight="800" text-anchor="middle">100%</text>
        <text x="55" y="56" fill="#64748b" font-size="6" font-weight="600" text-anchor="middle">Proporsi</text>

        <!-- Legend -->
        <rect x="125" y="10" width="7" height="7" rx="2" fill="#10b981"/>
        <text x="137" y="17" fill="#334155" font-size="7" font-weight="600">Pendidikan (35%)</text>
        <rect x="125" y="26" width="7" height="7" rx="2" fill="#3b82f6"/>
        <text x="137" y="33" fill="#334155" font-size="7" font-weight="600">Kesehatan (25%)</text>
        <rect x="125" y="42" width="7" height="7" rx="2" fill="#ef4444"/>
        <text x="137" y="49" fill="#334155" font-size="7" font-weight="600">Infrastruktur (20%)</text>
        <rect x="125" y="58" width="7" height="7" rx="2" fill="#f59e0b"/>
        <text x="137" y="65" fill="#334155" font-size="7" font-weight="600">Ekonomi Kreatif (15%)</text>
        <rect x="125" y="74" width="7" height="7" rx="2" fill="#64748b"/>
        <text x="137" y="81" fill="#334155" font-size="7" font-weight="600">Lingkungan (5%)</text>
      </svg>
    </div>

    <!-- Chart 2: Tren Aktivitas Line Chart -->
    <div class="chart-box">
      <h4>TREN AKTIVITAS PERTUMBUHAN SESI</h4>
      <svg width="100%" height="95" viewBox="0 0 340 95" fill="none" xmlns="http://www.w3.org/2000/svg" style="font-family:'Plus Jakarta Sans', sans-serif;">
        <line x1="25" y1="15" x2="325" y2="15" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="25" y1="38" x2="325" y2="38" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="25" y1="60" x2="325" y2="60" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="25" y1="78" x2="325" y2="78" stroke="#cbd5e1" stroke-width="1"/>

        <path d="M35 72 L85 66 L135 54 L185 42 L235 28 L285 14 L285 78 L35 78 Z" fill="rgba(59, 130, 246, 0.12)"/>
        <path d="M35 72 L85 66 L135 54 L185 42 L235 28 L285 14" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>

        <circle cx="35" cy="72" r="3" fill="#3b82f6"/>
        <circle cx="85" cy="66" r="3" fill="#3b82f6"/>
        <circle cx="135" cy="54" r="3" fill="#3b82f6"/>
        <circle cx="185" cy="42" r="3" fill="#3b82f6"/>
        <circle cx="235" cy="28" r="3" fill="#3b82f6"/>
        <circle cx="285" cy="14" r="3" fill="#3b82f6"/>

        <text x="35" y="88" fill="#64748b" font-size="6.8" font-weight="600" text-anchor="middle">Jan</text>
        <text x="85" y="88" fill="#64748b" font-size="6.8" font-weight="600" text-anchor="middle">Feb</text>
        <text x="135" y="88" fill="#64748b" font-size="6.8" font-weight="600" text-anchor="middle">Mar</text>
        <text x="185" y="88" fill="#64748b" font-size="6.8" font-weight="600" text-anchor="middle">Apr</text>
        <text x="235" y="88" fill="#64748b" font-size="6.8" font-weight="600" text-anchor="middle">Mei</text>
        <text x="285" y="88" fill="#64748b" font-size="6.8" font-weight="600" text-anchor="middle">Jun</text>

        <text x="35" y="65" fill="#0369a1" font-size="6.2" font-weight="700" text-anchor="middle">45</text>
        <text x="285" y="9" fill="#0369a1" font-size="6.2" font-weight="700" text-anchor="middle">145</text>
      </svg>
    </div>
  </div>

  <!-- Row 2: Ranking Komisi, Ranking Dapil, Ranking Anggota (3 Columns) -->
  <div class="chart-grid-3">
    <!-- Chart 3: Ranking Komisi Aktif -->
    <div class="chart-box">
      <h4>RANKING KOMISI AKTIF</h4>
      <svg width="100%" height="95" viewBox="0 0 220 95" fill="none" xmlns="http://www.w3.org/2000/svg" style="font-family:'Plus Jakarta Sans', sans-serif;">
        <line x1="15" y1="78" x2="205" y2="78" stroke="#cbd5e1" stroke-width="1"/>
        <!-- Bars -->
        <rect x="25" y="16" width="22" height="62" rx="3" fill="#3b82f6"/>
        <text x="36" y="12" fill="#1e40af" font-size="6" font-weight="700" text-anchor="middle">42</text>
        <text x="36" y="87" fill="#64748b" font-size="5.8" font-weight="600" text-anchor="middle">Kom.I</text>

        <rect x="62" y="24" width="22" height="54" rx="3" fill="#3b82f6"/>
        <text x="73" y="20" fill="#1e40af" font-size="6" font-weight="700" text-anchor="middle">38</text>
        <text x="73" y="87" fill="#64748b" font-size="5.8" font-weight="600" text-anchor="middle">Kom.II</text>

        <rect x="99" y="30" width="22" height="48" rx="3" fill="#3b82f6"/>
        <text x="110" y="26" fill="#1e40af" font-size="6" font-weight="700" text-anchor="middle">35</text>
        <text x="110" y="87" fill="#64748b" font-size="5.8" font-weight="600" text-anchor="middle">Kom.III</text>

        <rect x="136" y="40" width="22" height="38" rx="3" fill="#3b82f6"/>
        <text x="147" y="36" fill="#1e40af" font-size="6" font-weight="700" text-anchor="middle">29</text>
        <text x="147" y="87" fill="#64748b" font-size="5.8" font-weight="600" text-anchor="middle">Kom.IV</text>

        <rect x="173" y="48" width="22" height="30" rx="3" fill="#3b82f6"/>
        <text x="184" y="44" fill="#1e40af" font-size="6" font-weight="700" text-anchor="middle">24</text>
        <text x="184" y="87" fill="#64748b" font-size="5.8" font-weight="600" text-anchor="middle">Kom.V</text>
      </svg>
    </div>

    <!-- Chart 4: Ranking Dapil Aktif -->
    <div class="chart-box">
      <h4>RANKING DAPIL AKTIF</h4>
      <svg width="100%" height="95" viewBox="0 0 220 95" fill="none" xmlns="http://www.w3.org/2000/svg" style="font-family:'Plus Jakarta Sans', sans-serif;">
        <line x1="15" y1="78" x2="205" y2="78" stroke="#cbd5e1" stroke-width="1"/>
        <!-- Bars -->
        <rect x="25" y="14" width="22" height="64" rx="3" fill="#10b981"/>
        <text x="36" y="10" fill="#065f46" font-size="6" font-weight="700" text-anchor="middle">120</text>
        <text x="36" y="87" fill="#64748b" font-size="5.8" font-weight="600" text-anchor="middle">Dap.1</text>

        <rect x="62" y="27" width="22" height="51" rx="3" fill="#10b981"/>
        <text x="73" y="23" fill="#065f46" font-size="6" font-weight="700" text-anchor="middle">95</text>
        <text x="73" y="87" fill="#64748b" font-size="5.8" font-weight="600" text-anchor="middle">Dap.2</text>

        <rect x="99" y="32" width="22" height="46" rx="3" fill="#10b981"/>
        <text x="110" y="28" fill="#065f46" font-size="6" font-weight="700" text-anchor="middle">88</text>
        <text x="110" y="87" fill="#64748b" font-size="5.8" font-weight="600" text-anchor="middle">Dap.3</text>

        <rect x="136" y="39" width="22" height="39" rx="3" fill="#10b981"/>
        <text x="147" y="35" fill="#065f46" font-size="6" font-weight="700" text-anchor="middle">76</text>
        <text x="147" y="87" fill="#64748b" font-size="5.8" font-weight="600" text-anchor="middle">Dap.4</text>

        <rect x="173" y="46" width="22" height="32" rx="3" fill="#10b981"/>
        <text x="184" y="42" fill="#065f46" font-size="6" font-weight="700" text-anchor="middle">64</text>
        <text x="184" y="87" fill="#64748b" font-size="5.8" font-weight="600" text-anchor="middle">Dap.5</text>
      </svg>
    </div>

    <!-- Chart 5: Ranking Anggota Teraktif -->
    <div class="chart-box">
      <h4>RANKING ANGGOTA TERAKTIF</h4>
      <svg width="100%" height="95" viewBox="0 0 220 95" fill="none" xmlns="http://www.w3.org/2000/svg" style="font-family:'Plus Jakarta Sans', sans-serif;">
        <text x="5" y="16" fill="#334155" font-size="6.2" font-weight="600">Asep S.</text>
        <rect x="52" y="9" width="130" height="9" rx="2" fill="#ef4444"/>
        <text x="188" y="16" fill="#991b1b" font-size="6.2" font-weight="700">15</text>

        <text x="5" y="32" fill="#334155" font-size="6.2" font-weight="600">Siti A.</text>
        <rect x="52" y="25" width="104" height="9" rx="2" fill="#ef4444"/>
        <text x="162" y="32" fill="#991b1b" font-size="6.2" font-weight="700">12</text>

        <text x="5" y="48" fill="#334155" font-size="6.2" font-weight="600">Ridwan K.</text>
        <rect x="52" y="41" width="86" height="9" rx="2" fill="#ef4444"/>
        <text x="144" y="48" fill="#991b1b" font-size="6.2" font-weight="700">10</text>

        <text x="5" y="64" fill="#334155" font-size="6.2" font-weight="600">Budi G.</text>
        <rect x="52" y="57" width="69" height="9" rx="2" fill="#ef4444"/>
        <text x="127" y="64" fill="#991b1b" font-size="6.2" font-weight="700">8</text>

        <text x="5" y="80" fill="#334155" font-size="6.2" font-weight="600">Santi S.</text>
        <rect x="52" y="73" width="60" height="9" rx="2" fill="#ef4444"/>
        <text x="118" y="80" fill="#991b1b" font-size="6.2" font-weight="700">7</text>
      </svg>
    </div>
  </div>

  <!-- Row 3: Organisasi Teraktif Horizontal Bar & List -->
  <div class="chart-box" style="margin-top: 4px;">
    <h4>PARTISIPASI ORGANISASI &amp; KOMUNITAS MASYARAKAT</h4>
    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px; align-items: center;">
      <svg width="100%" height="75" viewBox="0 0 380 75" fill="none" xmlns="http://www.w3.org/2000/svg" style="font-family:'Plus Jakarta Sans', sans-serif;">
        <text x="5" y="12" fill="#334155" font-size="6.8" font-weight="600">LSM Merdeka</text>
        <rect x="115" y="5" width="210" height="8" rx="2" fill="#f59e0b"/>
        <text x="332" y="12" fill="#b45309" font-size="6.8" font-weight="700">85 Sesi</text>

        <text x="5" y="27" fill="#334155" font-size="6.8" font-weight="600">Karang Taruna</text>
        <rect x="115" y="20" width="178" height="8" rx="2" fill="#f59e0b"/>
        <text x="300" y="27" fill="#b45309" font-size="6.8" font-weight="700">72 Sesi</text>

        <text x="5" y="42" fill="#334155" font-size="6.8" font-weight="600">Paguyuban Pasundan</text>
        <rect x="115" y="35" width="160" height="8" rx="2" fill="#f59e0b"/>
        <text x="282" y="42" fill="#b45309" font-size="6.8" font-weight="700">65 Sesi</text>

        <text x="5" y="57" fill="#334155" font-size="6.8" font-weight="600">KNPI Jabar</text>
        <rect x="115" y="50" width="118" height="8" rx="2" fill="#f59e0b"/>
        <text x="240" y="57" fill="#b45309" font-size="6.8" font-weight="700">48 Sesi</text>

        <text x="5" y="72" fill="#334155" font-size="6.8" font-weight="600">HMI Bandung</text>
        <rect x="115" y="65" width="88" height="8" rx="2" fill="#f59e0b"/>
        <text x="210" y="72" fill="#b45309" font-size="6.8" font-weight="700">36 Sesi</text>
      </svg>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px 8px; font-size:7pt;">
        <div style="font-weight:700; color:#0f172a; margin-bottom:3px; border-bottom:1px solid #e2e8f0; padding-bottom:2px;">Keterlibatan Elemen Sipil</div>
        <div style="color:#475569; line-height:1.35;">
          Data mencerminkan tingginya partisipasi ormas, pemuda, paguyuban adat, dan organisasi mahasiswa dalam menyuarakan isu publik langsung ke dewan.
        </div>
      </div>
    </div>
  </div>
</div>

<!-- HALAMAN 11: BAB V (LANJUTAN) - DASHBOARD GIS & STRUKTUR AKD -->
<div class="page">
  <h1>BAB V: DASHBOARD GEOSPASIAL GIS &amp; STRUKTUR AKD</h1>

  <div class="screenshot-card" style="margin-bottom: 8px;">
    <img src="file:///{screenshots_dir}/gis_page.png" alt="GIS Heatmap Jawa Barat" style="max-height: 80mm; object-fit: cover; object-position: center;" />
    <div class="screenshot-caption">Gambar 6: Dashboard Pemetaan Geospasial GIS Sebaran Aspirasi 27 Kabupaten/Kota se-Jawa Barat</div>
  </div>

  <h2>5.1 Pembagian Bidang Tugas Komisi (I - V) &amp; 4 Badan AKD</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Komisi / Badan AKD</th>
        <th style="width: 38%;">Bidang Tugas &amp; Urusan</th>
        <th style="width: 40%;">Mitra Kerja Perangkat Daerah (OPD)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>Komisi I</strong></td><td>Pemerintahan, Hukum, Kepegawaian, Perizinan, Diskominfo</td><td>Inspektorat, BKD, Satpol PP, DPMPTSP, Diskominfo</td></tr>
      <tr><td><strong>Komisi II</strong></td><td>Perekonomian, Pertanian, Ketahanan Pangan, KUKM, DKP</td><td>Dinas Pertanian, Dinas KUK, DKP, Bank BJB</td></tr>
      <tr><td><strong>Komisi III</strong></td><td>Keuangan Daerah, Pengelolaan Aset, Pendapatan (Bapenda), BUMD</td><td>Bapenda, BPKAD, BUMD PT Jasa Sarana, Jamkrida</td></tr>
      <tr><td><strong>Komisi IV</strong></td><td>Infrastruktur, Bina Marga, SDA, Perhubungan, Lingkungan Hidup</td><td>Dinas BMPR, Dinas SDA, Dishub, Dinas LH</td></tr>
      <tr><td><strong>Komisi V</strong></td><td>Pendidikan Menengah, Kesehatan, Sosial, Tenaga Kerja</td><td>Dinas Pendidikan, Dinas Kesehatan, Dinsos, Disnakertrans</td></tr>
      <tr><td><strong>Badan AKD</strong></td><td>Bamus, Banggar, Badan Kehormatan (BK), dan Bapemperda</td><td>Sekretariat DPRD Provinsi Jawa Barat &amp; Biro Hukum Setda Jabar</td></tr>
    </tbody>
  </table>

  <h2>5.2 Rekapitulasi Cakupan 15 Daerah Pemilihan (Dapil I s/d XV)</h2>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Dapil</th>
          <th style="width: 55%;">Kabupaten / Kota</th>
          <th style="width: 20%;">Kursi</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>Dapil I</strong></td><td>Kota Bandung, Kota Cimahi</td><td>8</td></tr>
        <tr><td><strong>Dapil II</strong></td><td>Kabupaten Bandung</td><td>10</td></tr>
        <tr><td><strong>Dapil III</strong></td><td>Kabupaten Bandung Barat</td><td>4</td></tr>
        <tr><td><strong>Dapil IV</strong></td><td>Kabupaten Cianjur</td><td>6</td></tr>
        <tr><td><strong>Dapil V</strong></td><td>Kota &amp; Kab. Sukabumi</td><td>8</td></tr>
        <tr><td><strong>Dapil VI</strong></td><td>Kabupaten Bogor</td><td>11</td></tr>
        <tr><td><strong>Dapil VII</strong></td><td>Kota Bogor</td><td>3</td></tr>
        <tr><td><strong>Dapil VIII</strong></td><td>Kota Depok, Kota Bekasi</td><td>11</td></tr>
      </tbody>
    </table>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Dapil</th>
          <th style="width: 55%;">Kabupaten / Kota</th>
          <th style="width: 20%;">Kursi</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>Dapil IX</strong></td><td>Kabupaten Bekasi</td><td>7</td></tr>
        <tr><td><strong>Dapil X</strong></td><td>Kab. Karawang, Purwakarta</td><td>8</td></tr>
        <tr><td><strong>Dapil XI</strong></td><td>Subang, Majalengka, Sumedang</td><td>11</td></tr>
        <tr><td><strong>Dapil XII</strong></td><td>Kota/Kab. Cirebon, Indramayu</td><td>12</td></tr>
        <tr><td><strong>Dapil XIII</strong></td><td>Kuningan, Ciamis, Pangandaran, Banjar</td><td>8</td></tr>
        <tr><td><strong>Dapil XIV</strong></td><td>Kabupaten Garut</td><td>6</td></tr>
        <tr><td><strong>Dapil XV</strong></td><td>Kota &amp; Kab. Tasikmalaya</td><td>7</td></tr>
        <tr><td colspan="2" style="background:#f1f5f9; font-weight:700;">TOTAL ALOKASI KURSI DEWAN</td><td style="background:#f1f5f9; font-weight:800; color:#0369a1;">120</td></tr>
      </tbody>
    </table>
  </div>
</div>

<!-- HALAMAN 12: BAB VI - KESIMPULAN & ROADMAP -->
<div class="page">
  <h1>BAB VI: KESIMPULAN &amp; RENCANA TINDAK LANJUT</h1>

  <h2>6.1 Kesimpulan Implementasi Platform HUDANG</h2>
  <p>
    Berdasarkan hasil perancangan, pengujian pengguna (QA/QC), dan kesiapan infrastruktur data, dapat disimpulkan bahwa:
  </p>
  <ol style="margin-top: 0; padding-left: 18px; font-size: 8.2pt;">
    <li><strong>Kesiapan Penuh Meng-cover Jawa Barat:</strong> Sistem telah memuat basis data master lengkap 120 Anggota DPRD, 15 Daerah Pemilihan, 5 Komisi, 4 Badan AKD, dan peta batas digital 27 Kabupaten/Kota se-Jawa Barat.</li>
    <li><strong>Efisiensi Anggaran Pelayanan Sekretariat Dewan:</strong> Sistem HUDANG mampu memangkas biaya logistik audiensi tatap muka langsung sekaligus memperluas jangkauan ke pelosok daerah pemilihan tanpa hambatan geografis.</li>
    <li><strong>Dokumentasi Otomatis Berbasis AI:</strong> Pemanfaatan Google Gemini Multimodal menghadirkan transkripsi verbatim berakurasi tinggi, menghilangkan risiko hilangnya catatan aspirasi warga, serta mempercepat proses pembuatan risalah rapat dari hitungan hari menjadi menit.</li>
    <li><strong>Peningkatan Akuntabilitas Kinerja:</strong> Skema rating 5 dimensi memberikan umpan balik langsung yang mendorong peningkatan kedisiplinan dan kualitas solusi para anggota dewan.</li>
  </ol>

  <h2>6.2 Roadmap Pengembangan Strategis Jangka Lanjutan</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Fase / Periode</th>
        <th style="width: 32%;">Inisiatif Pengembangan</th>
        <th style="width: 50%;">Target Manfaat / Dampak</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Fase 1 (Q3 2026)</strong><br><span class="badge badge-success">Berjalan</span></td>
        <td>Stabilisasi Server LiveKit, Egress Recording, dan AI Multimodal Gemini Pipeline.</td>
        <td>Sesi tatap muka virtual stabil dan transkripsi instan langsung tersimpan di database.</td>
      </tr>
      <tr>
        <td><strong>Fase 2 (Q4 2026)</strong><br><span class="badge badge-primary">Tahap Lanjut</span></td>
        <td>Integrasi WhatsApp Bot Gateway Resmi Sekretariat DPRD Jabar untuk reminder jadwal otomatis.</td>
        <td>Masyarakat menerima link room dan pengingat 15 menit sebelum rapat di WhatsApp.</td>
      </tr>
      <tr>
        <td><strong>Fase 3 (Q1 2027)</strong><br><span class="badge badge-purple">Integrasi OPD</span></td>
        <td>Integrasi API Disposisi Langsung ke Sistem SIPD &amp; Musrenbang Bappeda Jabar.</td>
        <td>Aspirasi yang disetujui dewan otomatis menjadi draf usulan e-Pokir terhubung ke OPD terkait.</td>
      </tr>
      <tr>
        <td><strong>Fase 4 (Q2 2027)</strong><br><span class="badge badge-slate">Mobile Native</span></td>
        <td>Peluncuran Aplikasi Mobile Android &amp; iOS HUDANG untuk warga pedesaan.</td>
        <td>Kemudahan akses video call dengan kompresi data hemat kuota di area sinyal terbatas.</td>
      </tr>
    </tbody>
  </table>

</div>

</body>
</html>
"""

output_html_path = "e:/project/DPRD/MEETDEWAN/scratch/dokumen_aspirasi_hudang.html"
output_pdf_path = "e:/project/DPRD/MEETDEWAN/GAMBARAN_PENGGUNAAN_DAN_DATA_ASPIRASI_HUDANG.pdf"

os.makedirs("e:/project/DPRD/MEETDEWAN/scratch", exist_ok=True)

with open(output_html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML generated at {output_html_path}")

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page()
    page.goto(f"file:///{output_html_path.replace(chr(92), '/')}")
    page.wait_for_load_state("networkidle")
    page.pdf(
        path=output_pdf_path,
        format="A4",
        print_background=True,
        margin={"top": "11mm", "bottom": "13mm", "left": "11mm", "right": "11mm"},
        display_header_footer=True,
        header_template="<div></div>",
        footer_template='<div style="font-size:7.5pt; font-family:\'Plus Jakarta Sans\', sans-serif; width:100%; display:flex; justify-content:space-between; padding:0 12mm; color:#64748b;"><span>HUDANG &bull; Sekretariat DPRD Provinsi Jawa Barat</span><span>Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></span></div>'
    )
    browser.close()

print(f"PDF successfully generated at {output_pdf_path}")
