import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedAspirasi() {
    console.log('[INFO] Memulai proses seeding data E-Aspirasi DPRD Provinsi Jawa Barat...');

    const passwordHash = await bcrypt.hash('password', 10);
    const now = new Date();
    const subDays = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const subHours = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

    // ─────────────────────────────────────────────────────────────
    // 1. PENGGUNA MASYARAKAT PEMOHON
    // ─────────────────────────────────────────────────────────────
    console.log('[INFO] Menyiapkan akun masyarakat pemohon aspirasi...');

    const userMasyarakatDemo = await prisma.user.upsert({
        where: { email: 'masyarakat@demo.id' },
        update: {
            name: 'Warga Konstituen Demo',
            role: 'masyarakat',
            kabupaten: 'Kota Bandung',
            kecamatan: 'Cibiru',
            noWhatsapp: '081234567890',
            passwordHash
        },
        create: {
            email: 'masyarakat@demo.id',
            name: 'Warga Konstituen Demo',
            role: 'masyarakat',
            kabupaten: 'Kota Bandung',
            kecamatan: 'Cibiru',
            noWhatsapp: '081234567890',
            passwordHash
        }
    });

    const userCirebon = await prisma.user.upsert({
        where: { email: 'ridwan.cirebon@demo.id' },
        update: {
            name: 'Ridwan Kamiludin (Koperasi Garam)',
            role: 'masyarakat',
            kabupaten: 'Kabupaten Cirebon',
            kecamatan: 'Kapetakan',
            noWhatsapp: '081398765432',
            passwordHash
        },
        create: {
            email: 'ridwan.cirebon@demo.id',
            name: 'Ridwan Kamiludin (Koperasi Garam)',
            role: 'masyarakat',
            kabupaten: 'Kabupaten Cirebon',
            kecamatan: 'Kapetakan',
            noWhatsapp: '081398765432',
            passwordHash
        }
    });

    const userBogor = await prisma.user.upsert({
        where: { email: 'siti.bogor@demo.id' },
        update: {
            name: 'Siti Rahmawati (Paguyuban Puncak)',
            role: 'masyarakat',
            kabupaten: 'Kabupaten Bogor',
            kecamatan: 'Cisarua',
            noWhatsapp: '081211223344',
            passwordHash
        },
        create: {
            email: 'siti.bogor@demo.id',
            name: 'Siti Rahmawati (Paguyuban Puncak)',
            role: 'masyarakat',
            kabupaten: 'Kabupaten Bogor',
            kecamatan: 'Cisarua',
            noWhatsapp: '081211223344',
            passwordHash
        }
    });

    const userKarawang = await prisma.user.upsert({
        where: { email: 'deden.karawang@demo.id' },
        update: {
            name: 'Deden Suhendar (Forum Pemuda Vokasi)',
            role: 'masyarakat',
            kabupaten: 'Kabupaten Karawang',
            kecamatan: 'Telukjambe Timur',
            noWhatsapp: '081987654321',
            passwordHash
        },
        create: {
            email: 'deden.karawang@demo.id',
            name: 'Deden Suhendar (Forum Pemuda Vokasi)',
            role: 'masyarakat',
            kabupaten: 'Kabupaten Karawang',
            kecamatan: 'Telukjambe Timur',
            noWhatsapp: '081987654321',
            passwordHash
        }
    });

    // ─────────────────────────────────────────────────────────────
    // 2. MENGAMBIL ANGGOTA DEWAN UNTUK RELASI DAPIL
    // ─────────────────────────────────────────────────────────────
    const dewanList = await prisma.user.findMany({
        where: { role: 'dewan' },
        take: 15
    });

    const findDewan = (keywords: string[]) => {
        return dewanList.find(d => {
            const str = `${d.dapil || ''} ${d.name} ${d.jabatan || ''}`.toLowerCase();
            return keywords.some(k => str.includes(k.toLowerCase()));
        }) || dewanList[0] || null;
    };

    const dewanCianjur = findDewan(['IV', 'Cianjur']);
    const dewanGarut = findDewan(['XIV', 'Garut']);
    const dewanSukabumi = findDewan(['V', 'Sukabumi']);
    const dewanBandung = findDewan(['I', 'Bandung', 'Cimahi']);
    const dewanSubang = findDewan(['XI', 'Subang', 'Sumedang']);
    const dewanCirebon = findDewan(['XII', 'Cirebon', 'Indramayu']);
    const dewanBogor = findDewan(['VI', 'Bogor']);
    const dewanKarawang = findDewan(['X', 'Karawang', 'Purwakarta']);
    const dewanBekasi = findDewan(['VIII', 'IX', 'Bekasi']);
    const dewanTasik = findDewan(['XV', 'Tasikmalaya']);

    // ─────────────────────────────────────────────────────────────
    // 3. SEED DATA ASPIRASI KOMPREHENSIF
    // ─────────────────────────────────────────────────────────────
    console.log('[INFO] Membersihkan data aspirasi terdahulu...');
    await prisma.aspirasiTimeline.deleteMany({});
    await prisma.aspirasi.deleteMany({});

    const aspirasiSeedData = [
        // ── 1. Cianjur: Jembatan Gantung Cidaun (Akun: masyarakat@demo.id) ──
        {
            ticketNumber: 'ASP-202609-10821',
            judul: 'Proposal Usulan Pembangunan Jembatan Gantung Penghubung Desa Cidaun - Jayapura',
            deskripsi: 'Masyarakat di Desa Cidaun dan Desa Jayapura saat ini hanya mengandalkan titian bambu darurat melintasi Sungai Ciwidig sepanjang 65 meter. Pada musim hujan dengan debit air meluap, titian tersebut sering terputus sehingga lebih dari 450 anak sekolah dan ribuan warga petani terisolasi tidak dapat melintas. Mohon fasilitasi pembangunan jembatan gantung permanen.',
            kategori: 'Infrastruktur Jalan & Jembatan',
            dapil: 'DAPIL IV (Kabupaten Cianjur)',
            kabupatenKota: 'Kabupaten Cianjur',
            kecamatan: 'Cidaun',
            alamat: 'Desa Jayapura RT 03/RW 04, Bantaran Sungai Ciwidig',
            materiUrl: '/uploads/materi/proposal_jembatan_gantung_cidaun.pdf',
            materiType: 'pdf',
            materiFileName: 'proposal_jembatan_gantung_cidaun.pdf',
            materiSize: 75818,
            masyarakatId: userMasyarakatDemo.id,
            dewanId: dewanCianjur?.id || null,
            status: 'selesai',
            aiRecommendation: 'Diteruskan untuk dibahas',
            aiAnalysedAt: subDays(4),
            submittedAt: subDays(5),
            verifiedAt: subDays(4),
            completedAt: subHours(6),
            createdAt: subDays(5),
            tanggapanDewan: 'Aspirasi telah kami terima dan ditelaah dalam rapat kerja Komisi IV DPRD Jawa Barat bersama Dinas Bina Marga dan Penataan Ruang (DBMPR) Provinsi Jawa Barat. Usulan jembatan gantung Cidaun-Jayapura telah dimasukkan ke dalam Rencana Kerja Pemerintah Daerah (RKPD) Perubahan Tahun Anggaran 2026 dengan alokasi anggaran Rp 850.000.000 melalui DPA DBMPR Jabar. Tim teknis Balai Pengelolaan Jalan Wilayah Pelayanan Cianjur dijadwalkan turun ke lokasi pada pekan depan untuk pengukuran kontur tanah akhir.',
            tanggapanOleh: dewanCianjur ? `${dewanCianjur.name} (${dewanCianjur.fraksi || 'Komisi IV DPRD Jabar'})` : 'Pimpinan Komisi IV DPRD Provinsi Jawa Barat',
            tanggapanAt: subHours(6),
            aiAnalysis: `**I. IDENTIFIKASI PROPOSAL & PEMOHON**
Proposal pembangunan infrastruktur ini diajukan oleh Warga Konstituen Demo atas nama Paguyuban Warga Cidaun-Jayapura yang berdomisili di Kabupaten Cianjur (wilayah DAPIL IV). Usulan bertujuan memohon bantuan fasilitasi alokasi anggaran pembangunan jembatan gantung permanen sepanjang 65 meter melintasi Sungai Ciwidig guna menggantikan jembatan bambu darurat yang kerap hanyut. Program ini ditujukan untuk memulihkan akses aman harian bagi 450 siswa sekolah dan mobilitas perekonomian warga pedesaan.

**II. TELAAH KELENGKAPAN ADMINISTRATIF**
- **Identitas Pengusul & Kontak:** Sangat jelas, disertai nama penanggung jawab permohonan, nomor telepon aktif WhatsApp, serta email pemohon terdaftar.
- **Surat Pengantar & Pengesahan:** Dokumen proposal PDF memuat surat pengantar resmi bernomor register desa, ditandatangani Kepala Desa Jayapura dan Desa Cidaun, serta dibubuhi stempel basah representatif.
- **Rencana Anggaran Biaya (RAB):** Terlampir tabel estimasi biaya sebesar Rp 850.000.000 mencakup pekerjaan pondasi pylon beton, kabel sling baja berstandar SNI, lantai plat bordes, dan pagar pengaman.
- **Lokasi & Dokumen Pendukung:** Titik koordinat GPS dan foto survei kontur tebing sungai Ciwidig telah dilampirkan secara presisi.

**III. TELAAH SUBSTANSI**
- **Urgensi & Kebutuhan Riil Masyarakat:** Kebutuhan sarana jembatan penyeberangan ini sangat mendesak dan faktual. Saat debit air sungai meluap di musim penghujan, warga terpaksa memutar sejauh 18 kilometer atau bertaruh nyawa menyeberangi titian bambu miring. Akses pendidikan anak dan transportasi hasil bumi terhenti total saat luapan air terjadi.
- **Kejelasan Tujuan & Manfaat:** Tujuan proposal spesifik dan terukur, yaitu menghubungkan dua desa agraris sehingga memangkas waktu tempuh dari 90 menit menjadi 10 menit, menurunkan biaya logistik panen pisang dan palawija, serta menjamin keselamatan siswa sekolah dasar dan menengah.
- **Kelayakan Anggaran & Teknis:** Estimasi pembiayaan Rp 850 juta untuk bentang jembatan gantung pejalan kaki 65 meter berada pada batas kewajaran Standar Biaya Masukan Daerah (SBMD) Jawa Barat. Komponen biaya mencerminkan harga material lokal dan ongkos angkut wilayah perbukitan terpencil.
- **Kesesuaian dengan Prioritas Pembangunan Daerah:** Program ini selaras penuh dengan prioritas RPJMD Provinsi Jawa Barat dalam percepatan konektivitas wilayah pedesaan tertinggal (Kecamatan Cidaun termasuk zona prioritas Cianjur Selatan). Tidak ditemukan tumpang tindih anggaran karena ruas penghubung desa ini belum masuk dalam program DAK maupun APBD Kabupaten.
- **Pihak Pelaksana & Pertanggungjawaban:** Direkomendasikan agar pelaksanaan teknis lelang dan konstruksi diampu langsung oleh Dinas Bina Marga dan Penataan Ruang (DBMPR) Provinsi Jawa Barat melalui Balai Pengelolaan Jalan Wilayah Pelayanan Cianjur, dengan serah terima aset ke pemerintah desa setempat pasca-uji beban.
- **Potensi Risiko & Mitigasi:** Risiko banjir bandang tahunan dapat menggerus fondasi pylon jika bantaran sungai tidak dipasangi bronjong penahan tebing (gabion). Diperlukan kajian hidrologi debit air puncak 50 tahunan oleh DBMPR sebelum penetapan elevasi bentang utama jembatan.

**IV. BAGIAN YANG MEMERLUKAN KLARIFIKASI**
Perlu kepastian surat pernyataan pelepasan hak atas tanah (hibah tanah) dari warga pemilik lahan di kedua sisi bibir jembatan untuk tapak pondasi pylon agar tidak menimbulkan sengketa agraria saat pengerjaan konstruksi dimulai.

**V. REKOMENDASI TENAGA AHLI**
**Rekomendasi:** "Diteruskan untuk dibahas"
**Alasan:** Proposal telah memenuhi seluruh kriteria administratif dan substansi teknis dengan urgensi kemanusiaan serta konektivitas antar-desa yang sangat tinggi. Layak diteruskan ke Rapat Kerja Komisi IV DPRD Jawa Barat bersama Dinas Bina Marga dan Penataan Ruang untuk dianggarkan pada RKPD Perubahan TA 2026.`,
            timeline: [
                { tahap: 'Pengajuan Aspirasi', status: 'selesai', keterangan: 'Aspirasi dan berkas proposal lengkap berhasil disubmit oleh warga pemohon melalui platform HUDANG.', aktor: 'Masyarakat', createdAt: subDays(5) },
                { tahap: 'Verifikasi Administrasi', status: 'selesai', keterangan: 'Pemeriksaan kelengkapan berkas proposal, surat pengantar kades, dan estimasi RAB senilai Rp 850 juta dinyatakan lengkap dan valid oleh tim fasilitator.', aktor: 'Sekretariat DPRD', createdAt: subDays(4) },
                { tahap: 'Diteruskan ke Meja Dewan', status: 'selesai', keterangan: 'Aspirasi diteruskan secara resmi ke Komisi IV DPRD Provinsi Jawa Barat dan Anggota Dewan perwakilan Dapil IV (Cianjur).', aktor: 'Sekretariat DPRD', createdAt: subDays(3) },
                { tahap: 'Penelaahan & Koordinasi Teknis', status: 'selesai', keterangan: 'Komisi IV melakukan pembahasan bersama Kepala Dinas Bina Marga dan Penataan Ruang (DBMPR) Provinsi Jawa Barat mengenai pemenuhan kriteria teknis jembatan gantung.', aktor: 'Anggota Dewan', createdAt: subDays(1) },
                { tahap: 'Tuntas & Tanggapan Resmi Diterbitkan', status: 'selesai', keterangan: 'Pemberian komitmen persetujuan alokasi anggaran pada RKPD Perubahan 2026 dan penerbitan surat tanggapan resmi kepada pemohon.', aktor: 'Anggota Dewan', createdAt: subHours(6) }
            ]
        },

        // ── 2. Garut: Sarana Komputer ANBK (Akun: masyarakat@demo.id) ──
        {
            ticketNumber: 'ASP-202609-20419',
            judul: 'Proposal Permohonan Pengadaan Perangkat Laboratorium Komputer & Internet Satelit SMA Pelosok Garut Selatan',
            deskripsi: 'Sebanyak 280 siswa di SMA Negeri pelosok Garut Selatan mengalami kendala besar dalam pelaksanaan Asesmen Nasional Berbasis Komputer (ANBK). Saat ujian tiba, siswa harus menempuh perjalanan 35 kilometer ke ibukota kecamatan dengan jalan rusak dan menyewa fasilitas sekolah lain. Kami memohon bantuan 35 unit PC dan jaringan satelit berkecepatan stabil.',
            kategori: 'Pendidikan & Sarana Sekolah',
            dapil: 'DAPIL XIV (Kab Garut)',
            kabupatenKota: 'Kabupaten Garut',
            kecamatan: 'Cibalong',
            alamat: 'Jl. Raya Lintas Selatan Garut KM 42',
            materiUrl: '/uploads/materi/proposal_sarana_lab_komputer_garut.pdf',
            materiType: 'pdf',
            materiFileName: 'proposal_sarana_lab_komputer_garut.pdf',
            materiSize: 77464,
            masyarakatId: userMasyarakatDemo.id,
            dewanId: dewanGarut?.id || null,
            status: 'tindak_lanjut',
            aiRecommendation: 'Diteruskan untuk dibahas',
            aiAnalysedAt: subDays(3),
            submittedAt: subDays(4),
            verifiedAt: subDays(3),
            createdAt: subDays(4),
            tanggapanDewan: 'Kami dari Komisi V DPRD Jawa Barat telah mencatat urgensi pengadaan sarana TIK ini. Saat ini kami sedang berkoordinasi intensif dengan Kepala Cabang Dinas Pendidikan Wilayah XI Garut agar kebutuhan laboratorium komputer ini dimasukkan pada pos bantuan sarana sekolah prioritas 3T tahun anggaran berjalan.',
            tanggapanOleh: dewanGarut ? `${dewanGarut.name} (Komisi V DPRD Jabar)` : 'Anggota Komisi V DPRD Jawa Barat',
            tanggapanAt: subDays(1),
            aiAnalysis: `**I. IDENTIFIKASI PROPOSAL & PEMOHON**
Proposal permohonan hibah sarana pendidikan ini diajukan oleh Komite Sekolah SMAN Pelosok Garut Selatan di Kabupaten Garut yang masuk dalam DAPIL XIV (Kabupaten Garut). Dokumen memohon bantuan pengadaan 35 unit komputer desktop, instalasi jaringan internet satelit berkecepatan tinggi, dan genset darurat dengan pagu usulan Rp 420.000.000. Tujuan utamanya adalah menyelenggarakan Asesmen Nasional Berbasis Komputer (ANBK) dan kegiatan literasi digital mandiri tanpa harus menempuh perjalanan berbahaya 35 km ke ibukota kecamatan.

**II. TELAAH KELENGKAPAN ADMINISTRATIF**
- **Identitas Pengusul & Kontak:** Terverifikasi lengkap mencakup Surat Keputusan (SK) Komite Sekolah, NPSN sekolah aktif, nama Kepala Sekolah, serta nomor kontak kepala laboratorium TIK.
- **Surat Pengantar & Dokumen Pendukung:** Terdapat surat rekomendasi dari Cabang Dinas Pendidikan Wilayah XI Provinsi Jawa Barat dan Berita Acara Rapat Komite Orang Tua Siswa.
- **Rincian Anggaran Biaya (RAB):** Spesifikasi teknis unit PC (Core i5, RAM 16GB, SSD 512GB) dan biaya langganan bandwidth internet satelit 12 bulan telah dijabarkan secara rinci per item.

**III. TELAAH SUBSTANSI**
- **Urgensi & Kebutuhan Riil Masyarakat:** Memiliki urgensi sangat tinggi terkait keadilan akses pendidikan bagi 280 peserta didik di daerah terisolir. Ketiadaan fasilitas komputer membebani anggaran operasional sekolah dan orang tua murid karena harus menyewa ruang laboratorium komputer di sekolah lain setiap pelaksanaan ANBK.
- **Kejelasan Tujuan & Manfaat:** Tujuan terarah dan terukur untuk meningkatkan skor literasi dan numerasi asesmen standar provinsi, sekaligus mempersiapkan siswa menghadapi seleksi perguruan tinggi berbasis komputer (SNBT).
- **Kelayakan Anggaran & Teknis:** Rata-rata harga satuan Rp 9,5 juta per unit PC bergaransi resmi tergolong wajar dan sesuai e-Katalog LKPP sektor pendidikan. Komponen genset cadangan 5 KVA sangat esensial menimbang seringnya pemadaman listrik di kawasan Garut Selatan.
- **Kesesuaian dengan Prioritas Pembangunan Daerah:** Program ini secara langsung mendukung program prioritas "Jabar Pintar" dan percepatan digitalisasi pendidikan sekolah menengah atas (kewenangan Pemerintah Provinsi di bawah Disdik Jabar).
- **Pihak Pelaksana & Pertanggungjawaban:** Mekanisme pengadaan disarankan melalui DPA Dinas Pendidikan Provinsi Jawa Barat (Bantuan Sarana Prasarana Sekolah Terpencil/3T) agar aset tercatat secara tertib pada SIMAK BMN Jawa Barat.
- **Potensi Risiko & Mitigasi:** Keamanan ruang laboratorium dari risiko pencurian dan kerusakan akibat petir/tegangan listrik tidak stabil. Sekolah perlu menyertakan komitmen pemasangan teralis besi dan instalasi penangkal petir mandiri.

**IV. BAGIAN YANG MEMERLUKAN KLARIFIKASI**
Perlu dilampirkan denah ruangan laboratorium komputer yang disiapkan sekolah, daya listrik terpasang PLN saat ini, serta nama tenaga teknisi TIK/proktor yang bertindak sebagai pengelola harian.

**V. REKOMENDASI TENAGA AHLI**
**Rekomendasi:** "Diteruskan untuk dibahas"
**Alasan:** Usulan menyangkut pemenuhan Standar Pelayanan Minimal (SPM) pendidikan jenjang SMA yang merupakan kewenangan konstitusional Pemerintah Provinsi. Direkomendasikan untuk dibahas dalam forum Komisi V DPRD Jabar bersama Dinas Pendidikan Provinsi Jawa Barat.`,
            timeline: [
                { tahap: 'Pengajuan Aspirasi', status: 'selesai', keterangan: 'Permohonan bantuan sarana lab komputer diajukan oleh komite sekolah melalui sistem HUDANG.', aktor: 'Masyarakat', createdAt: subDays(4) },
                { tahap: 'Verifikasi Administrasi', status: 'selesai', keterangan: 'Verifikasi data pokok pendidikan (Dapodik) dan proposal spesifikasi komputer dinyatakan terverifikasi.', aktor: 'Sekretariat DPRD', createdAt: subDays(3) },
                { tahap: 'Diteruskan ke Meja Dewan', status: 'selesai', keterangan: 'Aspirasi masuk dalam daftar telaah Komisi V DPRD Provinsi Jawa Barat urusan pendidikan.', aktor: 'Sekretariat DPRD', createdAt: subDays(2) },
                { tahap: 'Penelaahan & Tindak Lanjut', status: 'selesai', keterangan: 'Dewan memanggil perwakilan Dinas Pendidikan Jabar untuk memetakan alokasi unit komputer afirmasi wilayah pelosok.', aktor: 'Anggota Dewan', createdAt: subDays(1) }
            ]
        },

        // ── 3. Sukabumi: Video Jalan Rusak (Akun: masyarakat@demo.id) ──
        {
            ticketNumber: 'ASP-202609-30155',
            judul: 'Dokumentasi Video Kerusakan Parah Ruas Jalan Provinsi Cikembar - Pelabuhanratu',
            deskripsi: 'Kondisi lubang jalan sedalam 15-25 cm di sepanjang jalur logistik Cikembar menuju Pelabuhanratu sangat membahayakan pengendara roda dua dan menghambat distribusi ekonomi. Terlampir rekaman video kondisi riil lapangan saat dilintasi kendaraan bermuatan berat.',
            kategori: 'Infrastruktur Jalan & Jembatan',
            dapil: 'DAPIL V (Kabupaten & Kota Sukabumi)',
            kabupatenKota: 'Kabupaten Sukabumi',
            kecamatan: 'Cikembar',
            alamat: 'Ruas Jalan Provinsi KM 18-24 Cikembar',
            materiUrl: '/uploads/materi/video_dokumentasi_jalan_sukabumi.mp4',
            materiType: 'video',
            materiFileName: 'video_dokumentasi_jalan_sukabumi.mp4',
            materiSize: 5240,
            masyarakatId: userMasyarakatDemo.id,
            dewanId: dewanSukabumi?.id || null,
            status: 'selesai',
            aiRecommendation: 'Diteruskan untuk dibahas',
            aiAnalysedAt: subDays(2),
            submittedAt: subDays(3),
            verifiedAt: subDays(2),
            completedAt: subHours(12),
            createdAt: subDays(3),
            tanggapanDewan: 'Terima kasih atas rekaman video bukti kondisi lapangan yang sangat jelas dan objektif. Kami telah menginstruksikan Kepala UPTD Pengelolaan Jalan Wilayah Pelayanan II Sukabumi DBMPR Jabar untuk segera melakukan penanganan darurat penambalan lubang (patching) mulai pekan ini, sebelum pengerjaan peningkatan aspal hotmix penuh direalisasikan.',
            tanggapanOleh: dewanSukabumi ? `${dewanSukabumi.name} (${dewanSukabumi.fraksi || 'DPRD Jabar'})` : 'Pimpinan Komisi IV DPRD Jawa Barat',
            tanggapanAt: subHours(12),
            aiAnalysis: `**I. IDENTIFIKASI PROPOSAL & PEMOHON**
Aspirasi ini berupa laporan aduan masyarakat berbasis rekaman video visual dari warga pengendara dan pedagang jalur logistik Kabupaten Sukabumi yang termasuk ke dalam DAPIL V (Kabupaten & Kota Sukabumi). Tujuan permohonan adalah mendesak perbaikan darurat dan rekonstruksi jalan provinsi ruas Cikembar - Pelabuhanratu KM 18-24 yang mengalami kerusakan struktural lubang parah. Laporan ini diajukan untuk menekan angka kecelakaan lalu lintas dan melancarkan pasokan komoditas perikanan dan pertanian.

**II. TELAAH KELENGKAPAN ADMINISTRATIF**
- **Identitas Pengusul & Kontak:** Tertera nama warga pemohon beserta nomor telepon dan alamat domisili di jalur perlintasan.
- **Surat Pengantar & Proposal Tertulis:** Tidak menyertakan berkas naskah proposal tertulis formal maupun RAB angka, melainkan mengandalkan bukti otentik berkas rekaman video lapangan berdurasi 30 detik format MP4.
- **Lokasi & Bukti Visual:** Lokasi jalan teridentifikasi jelas pada patok KM 18-24 ruas jalan berstatus Jalan Provinsi Jawa Barat.

**III. TELAAH SUBSTANSI**
- **Urgensi & Kebutuhan Riil Masyarakat:** Sangat mendesak menyangkut keselamatan nyawa warga pelintas jalan raya. Kerusakan lubang sedalam 20 cm pada jalur berkecepatan tinggi sangat berisiko fatal terhadap pengendara sepeda motor pada malam hari dan kondisi hujan.
- **Kejelasan Tujuan & Manfaat:** Tujuan tunggal dan terarah, yaitu penambalan aspal cepat (patching) dan penataan saluran drainase bahu jalan agar air tidak menggenang di badan jalan aspal.
- **Kelayakan Anggaran & Teknis:** Tidak ada permintaan anggaran langsung dari warga. Penanganan merupakan beban pemeliharaan rutin jalan provinsi di bawah UPTD Pelayanan Wilayah II Sukabumi DBMPR Jabar.
- **Kesesuaian dengan Prioritas Pembangunan Daerah:** Sesuai dengan tupoksi kedewanan dalam pengawasan penyelenggaraan jalan mantap provinsi di Jawa Barat.
- **Pihak Pelaksana & Pertanggungjawaban:** Balai Pengelolaan Jalan Wilayah Pelayanan II Sukabumi DBMPR Provinsi Jawa Barat.
- **Potensi Risiko:** Genangan air limpasan dari saluran irigasi pinggir jalan yang tersumbat menjadi penyebab utama rusaknya aspal; jika hanya ditambal tanpa normalisasi drainase, aspal akan rusak kembali dalam 2-3 bulan.

**IV. BAGIAN YANG MEMERLUKAN KLARIFIKASI**
Perlu konfirmasi titik patok KM terparah dan titik-titik genangan air utama ke pelapor atau tim pengamat jalan (penilik jalan) DBMPR setempat.

**V. REKOMENDASI TENAGA AHLI**
**Rekomendasi:** "Diteruskan untuk dibahas"
**Alasan:** Meskipun tidak berupa naskah proposal bersurat pengantar, bukti rekaman video faktual membuktikan adanya ancaman keselamatan pengguna jalan di ruas jalan milik provinsi. Rekomendasi diteruskan ke Pimpinan Komisi IV dan dinas teknis terkait untuk penanganan penambalan darurat segera.`,
            timeline: [
                { tahap: 'Pengajuan Aspirasi', status: 'selesai', keterangan: 'Laporan warga beserta berkas video dokumentasi lapangan berhasil diunggah.', aktor: 'Masyarakat', createdAt: subDays(3) },
                { tahap: 'Verifikasi Administrasi', status: 'selesai', keterangan: 'Kesesuaian status ruas jalan provinsi telah divalidasi oleh tim teknis Setwan.', aktor: 'Sekretariat DPRD', createdAt: subDays(2) },
                { tahap: 'Diteruskan ke Meja Dewan', status: 'selesai', keterangan: 'Laporan dan rekaman video telah diputar dan ditelaah oleh legislator Dapil V Sukabumi.', aktor: 'Sekretariat DPRD', createdAt: subDays(1) },
                { tahap: 'Penelaahan & Koordinasi Teknis', status: 'selesai', keterangan: 'Instruksi penanganan darurat diterbitkan kepada dinas teknis DBMPR Jabar.', aktor: 'Anggota Dewan', createdAt: subHours(18) },
                { tahap: 'Tuntas & Tanggapan Resmi Diterbitkan', status: 'selesai', keterangan: 'Pemberitahuan jadwal pengerjaan penambalan dan perbaikan permanen jalan disampaikan ke pelapor.', aktor: 'Anggota Dewan', createdAt: subHours(12) }
            ]
        },

        // ── 4. Cimahi: TPST 3R Pengolahan Sampah (Akun: masyarakat@demo.id) ──
        {
            ticketNumber: 'ASP-202609-40912',
            judul: 'Proposal Pengadaan Fasilitas Tempat Pengolahan Sampah 3R (TPST 3R) Kelurahan Kota Cimahi',
            deskripsi: 'Inisiatif warga kelurahan di Cimahi untuk mengurangi ketergantungan buangan sampah ke TPA Sarimukti dengan mesin pencacah sampah organik berkapasitas 1,5 ton/jam, bak fermentasi kompos, dan 2 unit armada motor roda tiga sampah terpilah.',
            kategori: 'Lingkungan Hidup & Pengelolaan Sampah',
            dapil: 'DAPIL I (Kota Bandung & Kota Cimahi)',
            kabupatenKota: 'Kota Cimahi',
            kecamatan: 'Cimahi Selatan',
            alamat: 'Kelurahan Cibeureum RT 02/RW 07',
            materiUrl: '/uploads/materi/proposal_tpst_3r_cimahi.pdf',
            materiType: 'pdf',
            materiFileName: 'proposal_tpst_3r_cimahi.pdf',
            materiSize: 76212,
            masyarakatId: userMasyarakatDemo.id,
            dewanId: dewanBandung?.id || null,
            status: 'diteruskan',
            aiRecommendation: 'Diteruskan untuk dibahas',
            aiAnalysedAt: subDays(1),
            submittedAt: subDays(2),
            verifiedAt: subDays(1),
            createdAt: subDays(2),
            aiAnalysis: `**I. IDENTIFIKASI PROPOSAL & PEMOHON**
Proposal inisiatif lingkungan hidup ini diajukan oleh Paguyuban Warga Mandiri Kelurahan Cibeureum, Kota Cimahi yang berada dalam wilayah DAPIL I (Kota Bandung & Kota Cimahi). Usulan memohon bantuan fasilitasi pengadaan mesin pencacah sampah organik, komposter anaerobik, dan 2 unit motor roda tiga pengangkut sampah terpilah dengan total permohonan Rp 315.000.000. Tujuannya adalah mereduksi volume timbulan sampah rumah tangga hingga 60% di tingkat kelurahan sehingga mengurangi ketergantungan kiriman sampah ke TPA Sarimukti.

**II. TELAAH KELENGKAPAN ADMINISTRATIF**
- **Identitas Pengusul & Kontak:** Tertera akta pendirian kelompok swadaya masyarakat (KSM), daftar pengurus pengelola bank sampah, dan kontak penanggung jawab program.
- **Surat Pengantar & Dukungan Wilayah:** Dilengkapi surat pengantar Lurah Cibeureum dan rekomendasi Camat Cimahi Selatan tertanggal resmi.
- **RAB & Dokumen Pendukung:** Rincian biaya mesin pencacah 1,5 ton/jam, bak fermentasi, perlengkapan APD petugas, dan armada motor sampah dilampirkan secara transparan.

**III. TELAAH SUBSTANSI**
- **Urgensi & Kebutuhan Riil Masyarakat:** Tingkat urgensi sangat kritikal menyusul krisis kelebihan kapasitas (overcapacity) di TPA Regional Sarimukti. Inisiatif pengelolaan sampah mandiri berbasis 3R di kawasan padat penduduk Bandung Raya merupakan solusi konkret hulu yang wajib didukung.
- **Kejelasan Tujuan & Manfaat:** Target reduksi sampah organik mencapai 1,2 ton per hari yang diolah menjadi pupuk kompos untuk urban farming, serta pemilahan sampah plastik daur ulang bernilai ekonomis sirkular.
- **Kelayakan Anggaran & Teknis:** Anggaran Rp 315.000.000 sangat proporsional untuk lingkup fasilitas TPST tingkat RW-Kelurahan. Biaya operasional lanjutan direncanakan mandiri dari iuran warga dan hasil penjualan kompos.
- **Kesesuaian dengan Prioritas Pembangunan Daerah:** Selaras dengan Instruksi Gubernur Jawa Barat dan Perda Pengelolaan Sampah Provinsi Jawa Barat mengenai kewajiban pengelolaan sampah mandiri di kawasan permukiman perkotaan.
- **Pihak Pelaksana & Pertanggungjawaban:** Dinas Lingkungan Hidup (DLH) Provinsi Jawa Barat bekerja sama dengan DLH Kota Cimahi untuk pengadaan mesin dan pembinaan sertifikasi operator mesin cacah.
- **Potensi Risiko & Mitigasi:** Risiko aroma tidak sedap jika proses fermentasi kompos tidak terkontrol. Pengusul telah merancang sistem bio-aktivator dan filter serbuk gergaji aktif untuk mengeliminasi bau.

**IV. BAGIAN YANG MEMERLUKAN KLARIFIKASI**
Perlu kepastian surat izin penggunaan lahan fasilitas umum (fasum/fasos) dari Pemerintah Kota Cimahi sebagai lokasi pendirian hanggar TPST 3R agar tidak menimbulkan resistensi warga tetangga sekitar.

**V. REKOMENDASI TENAGA AHLI**
**Rekomendasi:** "Diteruskan untuk dibahas"
**Alasan:** Inisiatif mandiri masyarakat yang sejalan dengan kebijakan strategis penanganan krisis sampah Bandung Raya. Sangat direkomendasikan untuk dibahas dalam Komisi IV DPRD Provinsi Jawa Barat bersama Dinas Lingkungan Hidup Jabar.`,
            timeline: [
                { tahap: 'Pengajuan Aspirasi', status: 'selesai', keterangan: 'Proposal inisiatif TPST 3R mandiri warga diunggah ke portal HUDANG.', aktor: 'Masyarakat', createdAt: subDays(2) },
                { tahap: 'Verifikasi Administrasi', status: 'selesai', keterangan: 'Verifikasi dokumen legalitas paguyuban warga dan rincian RAB pengadaan dinyatakan memenuhi syarat.', aktor: 'Sekretariat DPRD', createdAt: subDays(1) },
                { tahap: 'Diteruskan ke Meja Dewan', status: 'selesai', keterangan: 'Aspirasi telah masuk ke dalam meja kerja Anggota DPRD Dapil I (Bandung - Cimahi) untuk diagendakan dalam reses.', aktor: 'Sekretariat DPRD', createdAt: subHours(10) }
            ]
        },

        // ── 5. Subang: Pompa Air Surya (Akun: masyarakat@demo.id) ──
        {
            ticketNumber: 'ASP-202609-50284',
            judul: 'Proposal Bantuan Sumur Bor Pompa Air Tenaga Surya & Normalisasi Irigasi Kelompok Tani Subang Pantura',
            deskripsi: 'Permohonan pengadaan 4 titik sumur bor tenaga surya untuk mengairi 320 hektar sawah tadah hujan di Pantura Subang guna mencegah gagal panen saat kemarau panjang tanpa membebani biaya solar petani.',
            kategori: 'Pertanian, Irigasi & Ketahanan Pangan',
            dapil: 'DAPIL XI (Kab Subang, Sumedang & Majalengka)',
            kabupatenKota: 'Kabupaten Subang',
            kecamatan: 'Pamanukan',
            alamat: 'Area Persawahan Gapoktan Makmur Jaya, Desa Rancasari',
            materiUrl: '/uploads/materi/proposal_pompa_air_petani_subang.pdf',
            materiType: 'pdf',
            materiFileName: 'proposal_pompa_air_petani_subang.pdf',
            materiSize: 75864,
            masyarakatId: userMasyarakatDemo.id,
            dewanId: dewanSubang?.id || null,
            status: 'verifikasi',
            aiRecommendation: 'Perlu klarifikasi/kelengkapan tambahan',
            aiAnalysedAt: subHours(3),
            submittedAt: subHours(16),
            verifiedAt: subHours(3),
            createdAt: subHours(16),
            aiAnalysis: `**I. IDENTIFIKASI PROPOSAL & PEMOHON**
Proposal permohonan sarana ketahanan pangan ini diajukan oleh Gabungan Kelompok Tani (Gapoktan) Makmur Jaya dari Desa Rancasari, Kecamatan Pamanukan, Kabupaten Subang dalam cakupan DAPIL XI (Kabupaten Subang, Sumedang & Majalengka). Usulan mengajukan permohonan bantuan instalasi 4 unit sumur bor dalam bertenaga surya (solar water pump) serta pengerukan sedimentasi saluran sekunder irigasi senilai Rp 380.000.000. Tujuannya adalah menyelamatkan 320 hektar areal sawah tadah hujan dari ancaman puso berkepanjangan pada musim kemarau.

**II. TELAAH KELENGKAPAN ADMINISTRATIF**
- **Identitas Pengusul & Kontak:** Nama ketua Gapoktan dan kontak pengurus tertera, namun nomor register Simluhtan (Sistem Informasi Manajemen Penyuluhan Pertanian) belum dicantumkan pada naskah pengantar.
- **Surat Pengantar & Rekomendasi:** Baru memuat surat permohonan tingkat desa; rekomendasi teknis dari Balai Penyuluhan Pertanian (BPP) Kecamatan Pamanukan belum terlampir.
- **RAB & Dokumen Pendukung:** Terdapat rincian kebutuhan biaya solar panel dan pompa submersible, namun peta topografi dan titik koordinat geolistrik sumber air tanah dalam belum disertakan.

**III. TELAAH SUBSTANSI**
- **Urgensi & Kebutuhan Riil Masyarakat:** Memiliki urgensi tinggi bagi ketahanan pangan Jawa Barat sebagai lumbung padi nasional. Kegagalan pasokan air irigasi di Pantura Subang dapat menurunkan produktivitas gabah hingga 1.800 ton per musim tanam gadu.
- **Kejelasan Tujuan & Manfaat:** Ditujukan untuk mengalirkan debit air 15 liter/detik per titik bor guna mengairi petak-petak sawah yang berada di ujung hilir saluran irigasi Tarum Timur yang sering mengalami kekeringan.
- **Kelayakan Anggaran & Teknis:** Anggaran Rp 380 juta tergolong rasional untuk sistem pompa bertenaga surya kapasitas sedang. Biaya operasional nol rupiah tanpa solar akan sangat meringankan petani kecil.
- **Kesesuaian dengan Prioritas Pembangunan Daerah:** Sangat selaras dengan program prioritas ketahanan pangan dan mitigasi perubahan iklim Pemerintah Provinsi Jawa Barat.
- **Pihak Pelaksana & Pertanggungjawaban:** Dinas Tanaman Pangan dan Hortikultura (DTPH) Provinsi Jawa Barat melalui mekanisme bantuan sarana prasarana pertanian kelompok tani terverifikasi.
- **Potensi Risiko:** Risiko kegagalan pemboran (dry hole) jika tidak didahului studi geolistrik air bawah tanah, serta risiko intrusi air asin karena wilayah Pamanukan relatif dekat dengan garis pantai pesisir Pantura.

**IV. BAGIAN YANG MEMERLUKAN KLARIFIKASI**
Perlu dilampirkan: (1) Nomor register SK Gapoktan terdaftar di dinas pertanian; (2) Hasil studi geolistrik uji kelayakan debit dan salinitas air tanah; (3) Surat pernyataan kesanggupan kelompok tani dalam merawat panel surya dari risiko vandalisme.

**V. REKOMENDASI TENAGA AHLI**
**Rekomendasi:** "Perlu klarifikasi/kelengkapan tambahan"
**Alasan:** Pokok substansi usulan sangat bermanfaat dan prioritas, namun kelengkapan dokumen teknis geolistrik dan rekomendasi BPP dinas pertanian belum lengkap. Disarankan pemohon melengkapi data teknis tersebut sebelum berkas dimajukan ke rapat kerja komisi.`,
            timeline: [
                { tahap: 'Pengajuan Aspirasi', status: 'selesai', keterangan: 'Proposal bantuan irigasi tenaga surya diterima oleh sistem HUDANG.', aktor: 'Masyarakat', createdAt: subHours(16) },
                { tahap: 'Verifikasi Administrasi', status: 'selesai', keterangan: 'Staf sekretariat DPRD sedang melakukan validasi peta kepemilikan lahan gapoktan dan kesiapan titik bor air tanah.', aktor: 'Sekretariat DPRD', createdAt: subHours(3) }
            ]
        },

        // ── 6. Cirebon: Breakwater & Mesin Pengering Garam (Akun: ridwan.cirebon@demo.id) ──
        {
            ticketNumber: 'ASP-202609-60117',
            judul: 'Proposal Pembangunan Tanggul Pemecah Ombak (Breakwater) & Mesin Pengering Garam Terowongan Surya Kapetakan',
            deskripsi: 'Permohonan bantuan tanggul penahan abrasi pantai sepanjang 400 meter dan teknologi pengeringan garam greenhouse guna melindungi 85 hektar tambak garam rakyat dari abrasi laut Jawa di musim angin barat.',
            kategori: 'Ekonomi Kerakyatan & Pesisir',
            dapil: 'DAPIL XII (Kab & Kota Cirebon, Kab Indramayu)',
            kabupatenKota: 'Kabupaten Cirebon',
            kecamatan: 'Kapetakan',
            alamat: 'Desa Bungko Lor, Kawasan Pesisir Kapetakan',
            materiUrl: '/uploads/materi/proposal_pompa_air_petani_subang.pdf',
            materiType: 'pdf',
            materiFileName: 'proposal_breakwater_garam_cirebon.pdf',
            materiSize: 74210,
            masyarakatId: userCirebon.id,
            dewanId: dewanCirebon?.id || null,
            status: 'diteruskan',
            aiRecommendation: 'Diteruskan untuk dibahas',
            aiAnalysedAt: subDays(1),
            submittedAt: subDays(3),
            verifiedAt: subDays(2),
            createdAt: subDays(3),
            aiAnalysis: `**I. IDENTIFIKASI PROPOSAL & PEMOHON**
Proposal permohonan infrastruktur pesisir dan pemberdayaan petambak ini diajukan oleh Koperasi Garam Rakyat Kapetakan dari Kabupaten Cirebon yang tercakup dalam DAPIL XII (Kab/Kota Cirebon & Indramayu). Tujuan utama adalah pembangunan tanggul pemecah gelombang 400 meter dan instalasi solar tunnel dryer senilai Rp 550.000.000 untuk melindungi tambak dari abrasi laut serta meningkatkan mutu garam krosok menjadi garam industri beryodium.

**II. TELAAH KELENGKAPAN ADMINISTRATIF**
- **Identitas Pengusul & Kontak:** Sangat lengkap dengan SK Kemenkumham Koperasi, NIB, dan kontak ketua koperasi.
- **Surat Pengantar & RAB:** Dilengkapi surat pengantar Dinas Kelautan dan Perikanan Kab. Cirebon serta estimasi RAB pemecah ombak batu belah.

**III. TELAAH SUBSTANSI**
- **Urgensi & Kebutuhan Riil:** Sangat mendesak karena abrasi telah menelan 12 hektar tambak produktif dalam 3 tahun terakhir.
- **Kejelasan Tujuan:** Menjaga mata pencaharian 140 kepala keluarga petambak garam dan meningkatkan produktivitas saat musim hujan dengan teknologi rumah kaca.
- **Kesesuaian Program:** Sangat sesuai dengan kewenangan pengelolaan ruang laut 0-12 mil di bawah Dinas Kelautan dan Perikanan Provinsi Jawa Barat.
- **Pelaksana:** DKP Provinsi Jawa Barat bekerja sama dengan Balai Pengelolaan Sumber Daya Pesisir.

**IV. BAGIAN YANG MEMERLUKAN KLARIFIKASI**
Perlu analisis dampak lingkungan sederhana (SPPL) mengenai pola arus laut pasca pemasangan breakwater agar tidak memindahkan abrasi ke desa tetangga.

**V. REKOMENDASI TENAGA AHLI**
**Rekomendasi:** "Diteruskan untuk dibahas"
**Alasan:** Memenuhi kriteria kewenangan provinsi di wilayah laut dan pesisir dengan urgensi mitigasi bencana abrasi dan ketahanan komoditas garam rakyat.`,
            timeline: [
                { tahap: 'Pengajuan Aspirasi', status: 'selesai', keterangan: 'Proposal permohonan breakwater diunggah melalui portal.', aktor: 'Masyarakat', createdAt: subDays(3) },
                { tahap: 'Verifikasi Administrasi', status: 'selesai', keterangan: 'Kesesuaian legalitas koperasi petambak garam dinyatakan lengkap.', aktor: 'Sekretariat DPRD', createdAt: subDays(2) },
                { tahap: 'Diteruskan ke Meja Dewan', status: 'selesai', keterangan: 'Diteruskan ke Anggota Komisi II DPRD Jabar membidangi urusan perikanan & kelautan.', aktor: 'Sekretariat DPRD', createdAt: subDays(1) }
            ]
        },

        // ── 7. Bogor: TPT Longsor Jalur Wisata Puncak (Akun: siti.bogor@demo.id) ──
        {
            ticketNumber: 'ASP-202609-70233',
            judul: 'Usulan Mendesak Pembangunan Tembok Penahan Tanah (TPT) Rawan Longsor Jalan Lingkar Cisarua Puncak',
            deskripsi: 'Tebing setinggi 14 meter di jalur alternatif Cisarua mengalami retakan selebar 10 cm akibat hujan deras beruntun. Kondisi ini mengancam pemukiman 35 KK di bawah tebing dan melumpuhkan jalur pengalihan macet wisata Puncak.',
            kategori: 'Infrastruktur Jalan & Jembatan',
            dapil: 'DAPIL VI (Kabupaten Bogor)',
            kabupatenKota: 'Kabupaten Bogor',
            kecamatan: 'Cisarua',
            alamat: 'Kp. Citeko Tengah RT 02/RW 05, Jalur Alternatif Puncak',
            materiUrl: '/uploads/materi/proposal_jembatan_gantung_cidaun.pdf',
            materiType: 'pdf',
            materiFileName: 'proposal_tpt_longsor_puncak.pdf',
            materiSize: 76540,
            masyarakatId: userBogor.id,
            dewanId: dewanBogor?.id || null,
            status: 'tindak_lanjut',
            aiRecommendation: 'Diteruskan untuk dibahas',
            aiAnalysedAt: subDays(2),
            submittedAt: subDays(3),
            verifiedAt: subDays(2),
            createdAt: subDays(3),
            tanggapanDewan: 'Komisi IV telah berkoordinasi dengan BPBD Provinsi Jawa Barat dan Balai Pengelolaan Jalan Wilayah Pelayanan I Bogor. Tim reaksi cepat telah memasang terpal darurat dan pengukuran geoteknik untuk penguatan bore pile TPT.',
            tanggapanOleh: dewanBogor ? `${dewanBogor.name} (Komisi IV DPRD Jabar)` : 'Anggota DPRD Dapil Bogor',
            tanggapanAt: subDays(1),
            aiAnalysis: `**I. IDENTIFIKASI PROPOSAL & PEMOHON**
Aspirasi mitigasi bencana diajukan oleh Paguyuban Warga Puncak Cisarua di Kabupaten Bogor yang masuk ke dalam wilayah DAPIL VI (Kabupaten Bogor). Usulan memohon penanganan darurat perkuatan tebing berupa dinding penahan tanah (TPT) bore pile sepanjang 80 meter di jalur Citeko-Cisarua senilai Rp 620.000.000 guna mencegah bencana tanah longsor yang mengancam keselamatan warga dan jalur wisata.

**II. TELAAH KELENGKAPAN ADMINISTRATIF**
- **Kelengkapan:** Terdapat foto retakan tanah eksisting, peta kontur kemiringan lereng 60 derajat, dan surat laporan bencana tingkat kecamatan.

**III. TELAAH SUBSTANSI**
- **Urgensi:** Berstatus darurat bencana (high hazard zone) berdasarkan peta kerawanan longsor PVMBG.
- **Tujuan & Manfaat:** Menyelamatkan pemukiman warga dari bahaya tertimbun material longsor dan menjamin kelancaran jalur evakuasi Puncak.
- **Kesesuaian:** Sangat relevan dengan alokasi Belanja Tidak Terduga (BTT) atau DPA DBMPR Jabar urusan kebencanaan.

**IV. BAGIAN YANG MEMERLUKAN KLARIFIKASI**
Perlu hasil uji tanah (soil investigation) dari BPBD/dinas geologi untuk menentukan kedalaman tiang pancang yang aman.

**V. REKOMENDASI TENAGA AHLI**
**Rekomendasi:** "Diteruskan untuk dibahas"
**Alasan:** Memiliki faktor risiko keselamatan jiwa masyarakat dan ancaman terputusnya mobilitas kawasan strategis pariwisata Jawa Barat.`,
            timeline: [
                { tahap: 'Pengajuan Aspirasi', status: 'selesai', keterangan: 'Laporan retakan tebing diunggah oleh warga.', aktor: 'Masyarakat', createdAt: subDays(3) },
                { tahap: 'Verifikasi Administrasi', status: 'selesai', keterangan: 'Verifikasi titik koordinat longsor divalidasi dengan peta bencana.', aktor: 'Sekretariat DPRD', createdAt: subDays(2) },
                { tahap: 'Diteruskan ke Meja Dewan', status: 'selesai', keterangan: 'Aspirasi diserahkan ke Pimpinan Komisi IV urusan infrastruktur.', aktor: 'Sekretariat DPRD', createdAt: subDays(2) },
                { tahap: 'Penelaahan & Koordinasi Teknis', status: 'selesai', keterangan: 'Rapat koordinasi bersama BPBD dan DBMPR wilayah Bogor digelar.', aktor: 'Anggota Dewan', createdAt: subDays(1) }
            ]
        },

        // ── 8. Karawang: Balai Latihan Kerja Vokasi Otomotif (Akun: deden.karawang@demo.id) ──
        {
            ticketNumber: 'ASP-202609-80455',
            judul: 'Proposal Pengadaan Fasilitas Pelatihan Vokasi Otomotif & Manufaktur Pemuda Karawang',
            deskripsi: 'Permohonan bantuan peralatan simulator mesin CNC dan workshop otomotif kendaraan listrik di Karawang untuk meningkatkan keterampilan 350 pemuda lokal agar mampu bersaing mengisi lowongan kerja industri manufaktur.',
            kategori: 'Ketenagakerjaan & Vokasi',
            dapil: 'DAPIL X (Kab Karawang & Purwakarta)',
            kabupatenKota: 'Kabupaten Karawang',
            kecamatan: 'Telukjambe Timur',
            alamat: 'Kompleks Balai Latihan Pemuda Karawang Mandiri',
            materiUrl: '/uploads/materi/proposal_sarana_lab_komputer_garut.pdf',
            materiType: 'pdf',
            materiFileName: 'proposal_vokasi_otomotif_karawang.pdf',
            materiSize: 76800,
            masyarakatId: userKarawang.id,
            dewanId: dewanKarawang?.id || null,
            status: 'diajukan',
            aiRecommendation: 'Diteruskan untuk dibahas',
            aiAnalysedAt: subHours(5),
            submittedAt: subHours(10),
            createdAt: subHours(10),
            aiAnalysis: `**I. IDENTIFIKASI PROPOSAL & PEMOHON**
Proposal permohonan sarana ketenagakerjaan ini diajukan oleh Forum Pemuda Vokasi Kabupaten Karawang di wilayah DAPIL X (Kabupaten Karawang & Purwakarta). Usulan memohon fasilitasi pengadaan mesin CNC training kit dan modul bengkel kendaraan listrik (EV) dengan estimasi pembiayaan Rp 480.000.000 guna menekan angka pengangguran terbuka pemuda di kawasan industri terbesar di Jawa Barat.

**II. TELAAH KELENGKAPAN ADMINISTRATIF**
- **Identitas Pengusul & Kontak:** Terverifikasi dengan SK Forum Pemuda dan rekomendasi Disnakertrans Kab. Karawang.
- **RAB:** Terinci per unit simulator pelatihan bersertifikasi BNSP.

**III. TELAAH SUBSTANSI**
- **Urgensi:** Tingkat pengangguran lulusan SMK di Karawang masih tinggi di tengah pesatnya kawasan industri KIIC dan Surya Cipta. Penguasaan teknologi otomotif modern menjadi syarat mutlak keterserapan tenaga kerja lokal.
- **Kesesuaian:** Sejalan dengan program link-and-match vokasi di bawah pembinaan Dinas Tenaga Kerja dan Transmigrasi Provinsi Jawa Barat.
- **Pelaksana:** UPTD Balai Pelatihan Kerja Disnakertrans Jabar.

**IV. BAGIAN YANG MEMERLUKAN KLARIFIKASI**
Perlu kepastian nota kesepahaman (MoU) kemitraan penyerapan tenaga kerja dengan asosiasi industri manufaktur kawasan industri Karawang.

**V. REKOMENDASI TENAGA AHLI**
**Rekomendasi:** "Diteruskan untuk dibahas"
**Alasan:** Sangat relevan dengan penyelesaian isu disparitas kompetensi kerja pemuda Jawa Barat di kawasan industri strategis.`,
            timeline: [
                { tahap: 'Pengajuan Aspirasi', status: 'selesai', keterangan: 'Proposal pelatihan vokasi diterima oleh sistem HUDANG.', aktor: 'Masyarakat', createdAt: subHours(10) }
            ]
        },

        // ── 9. Tasikmalaya: Sentra Bordir & Tenun Tradisional (Akun: userMasyarakatDemo) ──
        {
            ticketNumber: 'ASP-202609-90188',
            judul: 'Permohonan Bantuan Mesin Bordir Komputerisasi & Galeri Promosi Digital Pengrajin Tradisional Sukaraja',
            deskripsi: 'Paguyuban 45 UMKM pengrajin bordir Tasikmalaya memohon fasilitasi pengadaan 6 unit mesin bordir multi-head komputerisasi dan pendampingan e-commerce ekspor untuk merevitalisasi industri kreatif lokal.',
            kategori: 'Ekonomi Kreatif & Ketenagakerjaan',
            dapil: 'DAPIL XV (Kab & Kota Tasikmalaya)',
            kabupatenKota: 'Kabupaten Tasikmalaya',
            kecamatan: 'Sukaraja',
            alamat: 'Sentra Bordir Sukaraja RT 01/RW 03',
            materiUrl: '/uploads/materi/proposal_tpst_3r_cimahi.pdf',
            materiType: 'pdf',
            materiFileName: 'proposal_sentra_bordir_tasikmalaya.pdf',
            materiSize: 75100,
            masyarakatId: userMasyarakatDemo.id,
            dewanId: dewanTasik?.id || null,
            status: 'verifikasi',
            aiRecommendation: 'Perlu klarifikasi/kelengkapan tambahan',
            aiAnalysedAt: subHours(4),
            submittedAt: subDays(1),
            verifiedAt: subHours(4),
            createdAt: subDays(1),
            aiAnalysis: `**I. IDENTIFIKASI PROPOSAL & PEMOHON**
Usulan permohonan hibah alat ekonomi kreatif ini diajukan oleh Paguyuban Pengrajin Bordir Sukaraja dari Kabupaten Tasikmalaya (wilayah DAPIL XV). Pemohon mengajukan permohonan 6 unit mesin bordir terkomputerisasi dengan nilai usulan Rp 290.000.000 untuk meningkatkan kapasitas produksi kerajinan bordir khas Tasikmalaya.

**II. TELAAH KELENGKAPAN ADMINISTRATIF**
- **Kelengkapan:** Struktur kepengurusan paguyuban terlampir, namun surat keterangan terdaftar dari Dinas Koperasi dan UMKM Kabupaten Tasikmalaya belum disertakan.
- **RAB:** Sudah terinci spesifikasi mesin bordir 12 jarum 4 kepala.

**III. TELAAH SUBSTANSI**
- **Urgensi:** Pengrajin tradisional terancam kalah bersaing dengan produk bordir impor pabrikan jika masih mengandalkan mesin manual peninggalan lama.
- **Kesesuaian:** Mendukung program pelestarian warisan budaya kearifan lokal Jawa Barat.

**IV. BAGIAN YANG MEMERLUKAN KLARIFIKASI**
Perlu dilampirkan: (1) NIB dan SK paguyuban terdaftar; (2) Mekanisme pemanfaatan bersama (sharing system) mesin antar anggota agar tidak dimonopoli segelintir pengurus.

**V. REKOMENDASI TENAGA AHLI**
**Rekomendasi:** "Perlu klarifikasi/kelengkapan tambahan"
**Alasan:** Substansi pengembangan UMKM sangat bagus, namun legalitas kelembagaan kelompok pemohon harus dilengkapi terlebih dahulu sesuai regulasi penyaluran hibah daerah.`,
            timeline: [
                { tahap: 'Pengajuan Aspirasi', status: 'selesai', keterangan: 'Proposal dikirimkan melalui portal E-Aspirasi.', aktor: 'Masyarakat', createdAt: subDays(1) },
                { tahap: 'Verifikasi Administrasi', status: 'selesai', keterangan: 'Staf sekretariat memeriksa legalitas paguyuban dan menerbitkan catatan kelengkapan izin kelompok.', aktor: 'Sekretariat DPRD', createdAt: subHours(4) }
            ]
        },

        // ── 10. Bekasi: Normalisasi Saluran Pembuang Banjir Kali Jambe (Ditolak / Luar Kewenangan) ──
        {
            ticketNumber: 'ASP-202609-99002',
            judul: 'Permohonan Penggantian Pintu Pagar Rumah Tinggal di Sempadan Sungai',
            deskripsi: 'Permohonan penggantian biaya perbaikan pagar halaman rumah pribadi yang roboh akibat tergerus air selokan perumahan.',
            kategori: 'Lainnya',
            dapil: 'DAPIL VIII (Kota Bekasi & Kota Depok)',
            kabupatenKota: 'Kota Bekasi',
            kecamatan: 'Bekasi Timur',
            alamat: 'Perumahan Duren Jaya RT 05/RW 11',
            materiUrl: null,
            materiType: null,
            materiFileName: null,
            materiSize: null,
            masyarakatId: userMasyarakatDemo.id,
            dewanId: dewanBekasi?.id || null,
            status: 'ditolak',
            aiRecommendation: 'Tidak direkomendasikan',
            aiAnalysedAt: subDays(2),
            submittedAt: subDays(3),
            verifiedAt: subDays(2),
            createdAt: subDays(3),
            tanggapanDewan: 'Permohonan ini tidak dapat diproses lebih lanjut melalui forum aspirasi DPRD Provinsi Jawa Barat karena menyangkut aset pribadi/privat perorangan dan bukan merupakan fasilitas umum atau kepentingan masyarakat luas yang menjadi domain belanja pemerintah daerah.',
            tanggapanOleh: 'Sekretariat DPRD Provinsi Jawa Barat',
            tanggapanAt: subDays(2),
            aiAnalysis: `**I. IDENTIFIKASI PROPOSAL & PEMOHON**
Permohonan diajukan oleh perseorangan warga dari Kota Bekasi (DAPIL VIII) untuk meminta penggantian biaya renovasi pagar pribadi yang rusak. Permohonan bersifat privat dan tidak memiliki keterkaitan dengan pelayanan publik atau hajat hidup orang banyak.

**II. TELAAH KELENGKAPAN ADMINISTRATIF**
- Tidak melampirkan proposal resmi, tidak ada stempel perwakilan warga, dan tidak memenuhi format permohonan aspirasi perundang-undangan.

**III. TELAAH SUBSTANSI**
- Usulan berada di luar kewenangan Pemerintah Daerah dan DPRD. Sesuai UU No. 23 Tahun 2014 dan aturan perbendaharaan daerah, keuangan negara/daerah dilarang dialokasikan untuk kepentingan pembiayaan properti milik privat perorangan.

**IV. BAGIAN YANG MEMERLUKAN KLARIFIKASI**
Tidak ada dokumen publik yang dapat ditindaklanjuti.

**V. REKOMENDASI TENAGA AHLI**
**Rekomendasi:** "Tidak direkomendasikan"
**Alasan:** Usulan bertentangan dengan asas pengelolaan keuangan daerah karena ditujukan untuk aset pribadi perorangan dan di luar ruang lingkup kewenangan representasi DPRD Provinsi.`,
            timeline: [
                { tahap: 'Pengajuan Aspirasi', status: 'selesai', keterangan: 'Laporan permohonan diserahkan.', aktor: 'Masyarakat', createdAt: subDays(3) },
                { tahap: 'Verifikasi Administrasi', status: 'selesai', keterangan: 'Verifikasi menyatakan usulan tidak memenuhi kriteria fasilitas publik.', aktor: 'Sekretariat DPRD', createdAt: subDays(2) }
            ]
        }
    ];

    for (const item of aspirasiSeedData) {
        const { timeline, ...dataAspirasi } = item;
        console.log(`[INFO] Menyimpan tiket: ${dataAspirasi.ticketNumber} - ${dataAspirasi.judul.slice(0, 45)}...`);

        await prisma.aspirasi.create({
            data: {
                ...dataAspirasi,
                timelineEvents: {
                    create: timeline
                }
            }
        });
    }

    console.log(`\n[SUKSES] Berhasil men-seed ${aspirasiSeedData.length} data E-Aspirasi lengkap dengan dokumen proposal, video, timeline, dan Analisis Tenaga Ahli AI!`);
}

async function main() {
    try {
        await seedAspirasi();
    } catch (e) {
        console.error('[ERROR] Gagal saat menjalankan seeder aspirasi:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    main();
}
