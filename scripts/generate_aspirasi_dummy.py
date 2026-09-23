import os
import subprocess
from playwright.sync_api import sync_playwright

materi_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/uploads/materi"))
os.makedirs(materi_dir, exist_ok=True)

print(f"Target directory materi: {materi_dir}")

proposals = [
    {
        "filename": "proposal_jembatan_gantung_cidaun.pdf",
        "title": "PROPOSAL USULAN PEMBANGUNAN JEMBATAN GANTUNG PENGHUBUNG DESA CIDAUN - JAYAPURA KABUPATEN CIANJUR",
        "dapil": "DAPIL IV (Kabupaten Cianjur)",
        "kategori": "Infrastruktur Jalan & Jembatan",
        "pemohon": "Forum Warga Konstituen Cianjur Selatan & Kepala Desa Jayapura",
        "anggaran": "Rp 850.000.000 (Delapan Ratus Lima Puluh Juta Rupiah)",
        "latar_belakang": "Masyarakat di Desa Cidaun dan Desa Jayapura saat ini hanya mengandalkan titian bambu darurat melintasi Sungai Ciwidig sepanjang 65 meter. Pada musim hujan dengan debit air meluap, titian tersebut sering terputus sehingga lebih dari 450 anak sekolah dan ribuan warga petani terisolasi tidak dapat melintas.",
        "maksud_tujuan": "1. Menyediakan sarana penyeberangan permanen yang aman dan layak bagi warga dan pelajar.<br>2. Memperlancar jalur distribusi hasil panen pertanian dan perikanan menuju pasar kecamatan.<br>3. Mencegah korban hanyut akibat arus sungai yang deras.",
        "spesifikasi": [
            ("Tipe Konstruksi", "Jembatan Gantung Pejalan Kaki & Roda Dua (Sling Baja Galvanis)"),
            ("Bentang Jembatan", "Panjang 65 meter, Lebar 1,8 meter"),
            ("Kapasitas Beban", "Maksimum 3,5 Ton (Lalu Lintas Warga & Sepeda Motor)"),
            ("Pondasi Abutment", "Beton Bertulang K-300 dengan Angkur Baja Tarik"),
            ("Lantai Jembatan", "Plat Bordes Baja Anti-Selip tebal 3.2 mm"),
            ("Waktu Pelaksanaan", "Estimasi 90 Hari Kalender Kerja")
        ],
        "rab": [
            ("Pekerjaan Pondasi & Abutment Beton K-300", "Rp 210.000.000"),
            ("Pengadaan & Pemasangan Kabel Sling Baja Utama 32mm", "Rp 280.000.000"),
            ("Konstruksi Rangka Gelagar & Lantai Bordes Baja", "Rp 195.000.000"),
            ("Pagar Pengaman & Tiang Pylon Baja Profil H-Beam", "Rp 115.000.000"),
            ("Biaya Pengawasan Teknis & Operasional K3", "Rp 50.000.000")
        ]
    },
    {
        "filename": "proposal_sarana_lab_komputer_garut.pdf",
        "title": "PROPOSAL PERMOHONAN PENGADAAN PERANGKAT LABORATORIUM KOMPUTER & INTERNET SATELIT SMA NEGERI PELOSOK GARUT SELATAN",
        "dapil": "DAPIL XIV (Kab Garut)",
        "kategori": "Pendidikan & Sarana Sekolah",
        "pemohon": "Komite Sekolah Bersama Tokoh Pemuda Garut Selatan",
        "anggaran": "Rp 425.000.000 (Empat Ratus Dua Puluh Lima Juta Rupiah)",
        "latar_belakang": "Sebanyak 280 siswa di SMA Negeri Satu Atap pelosok Garut Selatan mengalami kendala besar dalam pelaksanaan Asesmen Nasional Berbasis Komputer (ANBK). Saat ujian tiba, siswa harus menempuh perjalanan 35 kilometer ke ibukota kecamatan dengan jalan rusak dan menyewa fasilitas sekolah lain.",
        "maksud_tujuan": "1. Memenuhi standar sarana prasarana laboratorium komputer sekolah sesuai standar Kemendikbudristek.<br>2. Menyediakan akses jaringan internet satelit berkecepatan stabil untuk pembelajaran digital siswa.<br>3. Menghapus kesenjangan literasi digital siswa pelosok Jawa Barat.",
        "spesifikasi": [
            ("Unit Komputer Siswa", "35 Unit Desktop PC (Intel Core i5, RAM 16GB, SSD 512GB)"),
            ("Unit Server Sekolah", "1 Unit Rack Server Dual Power Supply untuk ANBK Lokal"),
            ("Konektivitas Jaringan", "Perangkat Satelit Low Earth Orbit (LEO) Ku-Band + Router Mikrotik"),
            ("Sistem Daya Cadangan", "2 Unit Online UPS 3000VA untuk proteksi lonjakan listrik desa"),
            ("Instalasi Jaringan", "Kabel UTP Cat6, Switch 48-Port Gigabit & Access Point Wi-Fi 6")
        ],
        "rab": [
            ("35 Unit Komputer Klien @ Rp 8.000.000", "Rp 280.000.000"),
            ("1 Unit Server ANBK & Administrasi Sekolah", "Rp 45.000.000"),
            ("Perangkat Satelit & Router Gateway Sekolah", "Rp 32.000.000"),
            ("2 Unit Online UPS & Penstabil Daya Listrik", "Rp 38.000.000"),
            ("Instalasi Jaringan LAN & Pelatihan Operator Guru", "Rp 30.000.000")
        ]
    },
    {
        "filename": "proposal_tpst_3r_cimahi.pdf",
        "title": "PROPOSAL PENGADAAN FASILITAS TEMPAT PENGOLAHAN SAMPAH 3R (REDUCE, REUSE, RECYCLE) KELURAHAN KOTA CIMAHI",
        "dapil": "DAPIL I (Kota Bandung & Kota Cimahi)",
        "kategori": "Lingkungan Hidup & Pengelolaan Sampah",
        "pemohon": "Paguyuban Pengelola Lingkungan Bersih Mandiri Kota Cimahi",
        "anggaran": "Rp 550.000.000 (Lima Ratus Lima Puluh Juta Rupiah)",
        "latar_belakang": "TPA Sarimukti sering mengalami kelebihan kapasitas (overcapacity) yang berdampak pada penumpukan sampah di tempat penampungan sementara (TPS) di wilayah Kota Cimahi. Warga berinisiatif membangun pengelolaan sampah mandiri dari hulu melalui sistem pilah dan olah kompos.",
        "maksud_tujuan": "1. Mengurangi volume sampah residu yang dibuang ke TPA regional hingga 60% dari tingkat kelurahan.<br>2. Mengolah sampah organik rumah tangga menjadi pupuk kompos bernilai ekonomis untuk pertanian perkotaan.<br>3. Meningkatkan kesadaran lingkungan sirkular di tengah masyarakat padat penduduk.",
        "spesifikasi": [
            ("Hanggar Pengolahan", "Bangunan Baja Ringan Semi-Terbuka Ukuran 15 x 20 Meter"),
            ("Mesin Pencacah Organik", "Kapasitas 1,5 Ton/Jam dengan Mesin Penggerak Diesel 16 HP"),
            ("Mesin Ayak Kompos", "Tipe Rotary Screen Mesh 3 mm Kapasitas 1 Ton/Jam"),
            ("Armada Pengangkut", "2 Unit Motor Roda Tiga Bak Hidrolik Sampah Terpilah"),
            ("Bak Fermentasi Kompos", "10 Unit Bak Fermentasi Bata Kedap Air Sistem Aerob")
        ],
        "rab": [
            ("Pembangunan Hanggar & Lantai Beton Pengolahan", "Rp 220.000.000"),
            ("Pengadaan Mesin Pencacah & Pengayak Kompos", "Rp 125.000.000"),
            ("2 Unit Armada Motor Roda Tiga Pengangkut", "Rp 85.000.000"),
            ("Pembuatan Bak Komposter & Bio-Aktivator", "Rp 70.000.000"),
            ("Pelatihan Manajemen TPST & Sosialisasi Warga", "Rp 50.000.000")
        ]
    },
    {
        "filename": "proposal_pompa_air_petani_subang.pdf",
        "title": "PROPOSAL BANTUAN SUMUR BOR POMPA AIR TENAGA SURYA & NORMALISASI IRIGASI TERSIER KELOMPOK TANI SUBANG PANTURA",
        "dapil": "DAPIL XI (Kab Subang, Sumedang & Majalengka)",
        "kategori": "Pertanian, Irigasi & Ketahanan Pangan",
        "pemohon": "Gabungan Kelompok Tani (Gapoktan) Makmur Jaya Pantura Subang",
        "anggaran": "Rp 680.000.000 (Enam Ratus Delapan Puluh Juta Rupiah)",
        "latar_belakang": "Kawasan persawahan seluas 320 hektar di Pantura Subang merupakan sawah tadah hujan yang sering mengalami gagal panen (puso) saat musim kemarau panjang. Petani terbebani biaya sewa pompa diesel berbahan bakar solar yang mahal.",
        "maksud_tujuan": "1. Menyediakan sumber pengairan air tanah mandiri ramah lingkungan tanpa biaya BBM solar.<br>2. Menjamin keberlangsungan masa tanam padi 2 sampai 3 kali dalam setahun (Indeks Pertanaman meningkat).<br>3. Mengamankan pasokan beras dan kesejahteraan 340 kepala keluarga petani Pantura.",
        "spesifikasi": [
            ("Titik Sumur Bor", "4 Titik Sumur Bor Kedalaman 80–100 Meter Aquifer Dalam"),
            ("Pompa Submersible Surya", "4 Unit Pompa Tenaga Surya Kapasitas Debit 15 Liter/Detik"),
            ("Array Solar Panel", "40 Panel Surya Monocrystalline 450Wp per Titik dengan Rangka Baja"),
            ("Toren Penampung Air", "4 Unit Tandon Silinder Kapasitas 10.000 Liter Elevasi 4 Meter"),
            ("Pipa Distribusi Tersier", "Jaringan Pipa HDPE 3 Inch Sepanjang 2.500 Meter Menuju Petak Sawah")
        ],
        "rab": [
            ("Pengeboran 4 Titik Sumur Dalam Aquifer 100 Meter", "Rp 240.000.000"),
            ("Pengadaan Paket Pompa Submersible Tenaga Surya", "Rp 210.000.000"),
            ("Menara Toren Air & Tandon 10.000 Liter", "Rp 95.000.000"),
            ("Pemasangan Jaringan Pipa Saluran Tersier HDPE", "Rp 95.000.000"),
            ("Pengujian Geolistrik & Uji Debit Air Lapangan", "Rp 40.000.000")
        ]
    }
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    for prop in proposals:
        spec_rows = "".join([f"<tr><td class='key'>{k}</td><td class='val'>{v}</td></tr>" for k, v in prop["spesifikasi"]])
        rab_rows = "".join([f"<tr><td class='key'>{item}</td><td class='val-right'>{cost}</td></tr>" for item, cost in prop["rab"]])

        html_doc = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
    @page {{
        size: A4 portrait;
        margin: 15mm 18mm 15mm 18mm;
    }}
    body {{
        font-family: Arial, Helvetica, sans-serif;
        color: #1e293b;
        font-size: 10pt;
        line-height: 1.5;
        margin: 0;
        padding: 0;
    }}
    .kop {{
        text-align: center;
        border-bottom: 3px double #000;
        padding-bottom: 12px;
        margin-bottom: 16px;
    }}
    .kop h2 {{
        margin: 0;
        font-size: 13pt;
        font-weight: 800;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }}
    .kop h3 {{
        margin: 3px 0 0 0;
        font-size: 11pt;
        font-weight: 700;
        color: #047857;
        text-transform: uppercase;
    }}
    .kop p {{
        margin: 3px 0 0 0;
        font-size: 8pt;
        color: #475569;
    }}
    .title-box {{
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        padding: 12px;
        border-radius: 6px;
        text-align: center;
        margin-bottom: 16px;
    }}
    .title-box h1 {{
        margin: 0;
        font-size: 11pt;
        font-weight: 800;
        line-height: 1.3;
        color: #0f172a;
    }}
    .meta-grid {{
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 14px;
        font-size: 9pt;
    }}
    .meta-grid td {{
        padding: 4px 8px;
        border-bottom: 1px solid #e2e8f0;
    }}
    .meta-grid td.label {{
        width: 28%;
        font-weight: bold;
        color: #475569;
    }}
    .meta-grid td.value {{
        width: 72%;
        font-weight: bold;
        color: #0f172a;
    }}
    h4 {{
        font-size: 10pt;
        font-weight: bold;
        color: #047857;
        border-left: 4px solid #047857;
        padding-left: 8px;
        margin: 14px 0 6px 0;
        text-transform: uppercase;
    }}
    p.justified {{
        text-align: justify;
        margin: 0 0 8px 0;
        font-size: 9.5pt;
    }}
    table.data-table {{
        width: 100%;
        border-collapse: collapse;
        margin: 8px 0 14px 0;
        font-size: 9pt;
    }}
    table.data-table th {{
        background: #047857;
        color: #fff;
        padding: 6px 10px;
        text-align: left;
        font-size: 8.5pt;
        text-transform: uppercase;
    }}
    table.data-table td {{
        padding: 6px 10px;
        border-bottom: 1px solid #e2e8f0;
    }}
    table.data-table td.key {{
        width: 65%;
        color: #1e293b;
    }}
    table.data-table td.val {{
        width: 35%;
        font-weight: bold;
        color: #0f172a;
    }}
    table.data-table td.val-right {{
        width: 35%;
        font-weight: bold;
        text-align: right;
        color: #047857;
    }}
    .signature {{
        width: 100%;
        margin-top: 24px;
        page-break-inside: avoid;
    }}
    .signature td {{
        text-align: center;
        font-size: 9pt;
    }}
    .stamp-box {{
        display: inline-block;
        border: 2px dashed #047857;
        color: #047857;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 8pt;
        font-weight: bold;
        margin: 8px 0;
        text-transform: uppercase;
    }}
</style>
</head>
<body>
    <div class="kop">
        <h2>DEWAN PERWAKILAN RAKYAT DAERAH PROVINSI JAWA BARAT</h2>
        <h3>BERKAS PENGAJUAN ASPIRASI PEMBANGUNAN DAERAH (HUDANG)</h3>
        <p>Sekretariat DPRD Jawa Barat • Gedung DPRD, Jl. Diponegoro No. 27 Bandung • Layanan E-Aspirasi Konstituen</p>
    </div>

    <div class="title-box">
        <h1>{prop["title"]}</h1>
    </div>

    <table class="meta-grid">
        <tr>
            <td class="label">Daerah Pemilihan (Dapil)</td>
            <td class="value">{prop["dapil"]}</td>
        </tr>
        <tr>
            <td class="label">Kategori Urusan</td>
            <td class="value">{prop["kategori"]}</td>
        </tr>
        <tr>
            <td class="label">Pemohon / Delegasi</td>
            <td class="value">{prop["pemohon"]}</td>
        </tr>
        <tr>
            <td class="label">Estimasi Kebutuhan Anggaran</td>
            <td class="value" style="color: #047857;">{prop["anggaran"]}</td>
        </tr>
    </table>

    <h4>I. Latar Belakang Permasalahan</h4>
    <p class="justified">{prop["latar_belakang"]}</p>

    <h4>II. Maksud dan Tujuan Usulan</h4>
    <p class="justified">{prop["maksud_tujuan"]}</p>

    <h4>III. Rincian Kebutuhan &amp; Spesifikasi Teknis</h4>
    <table class="data-table">
        <thead>
            <tr>
                <th>Komponen / Parameter Usulan</th>
                <th>Spesifikasi yang Diajukan</th>
            </tr>
        </thead>
        <tbody>
            {spec_rows}
        </tbody>
    </table>

    <h4>IV. Rencana Anggaran Biaya (RAB) Estimatif</h4>
    <table class="data-table">
        <thead>
            <tr>
                <th>Item Pekerjaan / Pengadaan</th>
                <th style="text-align: right;">Estimasi Biaya</th>
            </tr>
        </thead>
        <tbody>
            {rab_rows}
        </tbody>
    </table>

    <table class="signature">
        <tr>
            <td style="width: 50%;">
                Mengetahui,<br>
                <strong>Tokoh Masyarakat / Pemohon</strong><br>
                <div class="stamp-box">TERDAFTAR RESMI PLATFORM HUDANG</div><br>
                <u>(Tanda Tangan Elektronik Warga)</u><br>
                Konstituen {prop["dapil"].split('(')[0].strip()}
            </td>
            <td style="width: 50%;">
                Diterima &amp; Diverifikasi oleh:<br>
                <strong>Sekretariat DPRD Provinsi Jawa Barat</strong><br>
                <div class="stamp-box">VERIFIKASI ADMINISTRASI SETWAN</div><br>
                <u>Bagian Fasilitasi Penganggaran &amp; Pengawasan</u><br>
                Sistem Digital HUDANG Jabar
            </td>
        </tr>
    </table>
</body>
</html>
"""
        target_path = os.path.join(materi_dir, prop["filename"])
        page.set_content(html_doc)
        page.pdf(path=target_path, format="A4", print_background=True)
        print(f"Berhasil membuat proposal PDF: {target_path} (Ukuran: {os.path.getsize(target_path)} bytes)")

    browser.close()

# Generate sample MP4 video using ffmpeg
video_target = os.path.join(materi_dir, "video_dokumentasi_jalan_sukabumi.mp4")
try:
    print("Membuat berkas video materi MP4 demonstrasi menggunakan ffmpeg...")
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "color=c=#047857:s=640x360:d=4",
        "-vf", "drawtext=text='DOKUMENTASI KERUSAKAN JALAN CIKEMBAR SUKABUMI (DAPIL V)':fontcolor=white:fontsize=18:x=(w-text_w)/2:y=(h-text_h)/2",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-t", "4",
        video_target
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print(f"Berhasil membuat video materi MP4: {video_target} (Ukuran: {os.path.getsize(video_target)} bytes)")
except Exception as e:
    print("Catatan ffmpeg generator:", e)

print("Semua berkas materi proposal & video selesai disiapkan!")
