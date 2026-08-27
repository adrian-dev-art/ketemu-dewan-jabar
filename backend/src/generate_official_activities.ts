import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RegencyInfo {
  kabupaten: string;
  kecamatans: string[];
  dapilKeywords: string[];
}

const JABAR_REGIONS: RegencyInfo[] = [
  { kabupaten: "Kota Bandung", kecamatans: ["Sumur Bandung", "Coblong", "Cicendo", "Lengkong", "Buahbatu"], dapilKeywords: ["Kota Bandung", "DAPIL I"] },
  { kabupaten: "Kabupaten Bandung", kecamatans: ["Soreang", "Baleendah", "Pangalengan", "Ciwidey", "Banjaran"], dapilKeywords: ["Kab Bandung", "DAPIL II"] },
  { kabupaten: "Kabupaten Bandung Barat", kecamatans: ["Padalarang", "Batujajar", "Lembang", "Cikalongwetan", "Cililin"], dapilKeywords: ["Bandung Barat", "DAPIL III"] },
  { kabupaten: "Kota Cimahi", kecamatans: ["Cimahi Tengah", "Cimahi Utara", "Cimahi Selatan"], dapilKeywords: ["Cimahi", "DAPIL I"] },
  { kabupaten: "Kabupaten Bogor", kecamatans: ["Cibinong", "Ciawi", "Gunung Putri", "Babakan Madang", "Cileungsi"], dapilKeywords: ["Kabupaten Bogor", "DAPIL VI"] },
  { kabupaten: "Kota Bogor", kecamatans: ["Bogor Tengah", "Bogor Timur", "Bogor Selatan", "Bogor Barat"], dapilKeywords: ["Kota Bogor", "DAPIL VII"] },
  { kabupaten: "Kota Depok", kecamatans: ["Pancoran Mas", "Sukmajaya", "Cimanggis", "Beji", "Sawangan"], dapilKeywords: ["Kota Depok", "DAPIL VIII"] },
  { kabupaten: "Kota Bekasi", kecamatans: ["Bekasi Timur", "Bekasi Barat", "Bekasi Selatan", "Medan Satria"], dapilKeywords: ["Kota Bekasi", "DAPIL VIII"] },
  { kabupaten: "Kabupaten Bekasi", kecamatans: ["Cikarang Pusat", "Cikarang Barat", "Tambun Selatan", "Cibitung"], dapilKeywords: ["Kabupaten Bekasi", "DAPIL IX"] },
  { kabupaten: "Kabupaten Karawang", kecamatans: ["Karawang Barat", "Telukjambe", "Cikampek", "Rengasdengklok", "Klari"], dapilKeywords: ["Karawang", "DAPIL X"] },
  { kabupaten: "Kabupaten Subang", kecamatans: ["Subang Kota", "Patimban", "Pamanukan", "Kalijati", "Pagaden"], dapilKeywords: ["Subang", "DAPIL XI"] },
  { kabupaten: "Kabupaten Purwakarta", kecamatans: ["Purwakarta Kota", "Jatiluhur", "Plered", "Campaka"], dapilKeywords: ["Purwakarta", "DAPIL X"] },
  { kabupaten: "Kabupaten Cianjur", kecamatans: ["Cianjur Kota", "Cipanas", "Pacet", "Ciranjang", "Warungkondang"], dapilKeywords: ["Cianjur", "DAPIL IV"] },
  { kabupaten: "Kabupaten Sukabumi", kecamatans: ["Palabuhanratu", "Cisolok", "Cibadak", "Cisaat", "Cicurug"], dapilKeywords: ["Sukabumi", "DAPIL V"] },
  { kabupaten: "Kota Sukabumi", kecamatans: ["Cikole", "Citamiang", "Warudoyong", "Gunungpuyuh"], dapilKeywords: ["Kota Sukabumi", "DAPIL V"] },
  { kabupaten: "Kabupaten Sumedang", kecamatans: ["Sumedang Utara", "Jatinangor", "Tanjungsari", "Situtatar"], dapilKeywords: ["Sumedang", "DAPIL XI"] },
  { kabupaten: "Kabupaten Garut", kecamatans: ["Garut Kota", "Pameungpeuk", "Tarogong Kidul", "Cisurupan", "Kadungora"], dapilKeywords: ["Garut", "DAPIL XIV"] },
  { kabupaten: "Kabupaten Indramayu", kecamatans: ["Indramayu Kota", "Jatibarang", "Karangampel", "Losarang"], dapilKeywords: ["Indramayu", "DAPIL XII"] },
  { kabupaten: "Kabupaten Majalengka", kecamatans: ["Majalengka Kota", "Kertajati", "Jatiwangi", "Kadipaten"], dapilKeywords: ["Majalengka", "DAPIL XI"] },
  { kabupaten: "Kabupaten Cirebon", kecamatans: ["Sumber", "Palimanan", "Weru", "Ciledug", "Kedawung"], dapilKeywords: ["Kab & Kota Cirebon", "Cirebon", "DAPIL XII"] },
  { kabupaten: "Kota Cirebon", kecamatans: ["Kejaksan", "Kesambi", "Lemahwungkuk", "Harjamukti"], dapilKeywords: ["Kota Cirebon", "DAPIL XII"] },
  { kabupaten: "Kabupaten Kuningan", kecamatans: ["Kuningan Kota", "Cilimus", "Linggarjati", "Ciawigebang"], dapilKeywords: ["Kuningan", "DAPIL XIII"] },
  { kabupaten: "Kabupaten Tasikmalaya", kecamatans: ["Singaparna", "Manonjaya", "Ciawi", "Karangnunggal"], dapilKeywords: ["Kab & Kota Tasikmalaya", "Tasikmalaya", "DAPIL XV"] },
  { kabupaten: "Kota Tasikmalaya", kecamatans: ["Tawang", "Cihideung", "Mangkubumi", "Indihiang"], dapilKeywords: ["Kota Tasikmalaya", "DAPIL XV"] },
  { kabupaten: "Kabupaten Ciamis", kecamatans: ["Ciamis Kota", "Kawali", "Panumbangan", "Rancah"], dapilKeywords: ["Ciamis", "DAPIL XIII"] },
  { kabupaten: "Kota Banjar", kecamatans: ["Banjar", "Pataruman", "Purwaharja", "Langensari"], dapilKeywords: ["Kota Banjar", "Banjar", "DAPIL XIII"] },
  { kabupaten: "Kabupaten Pangandaran", kecamatans: ["Pangandaran", "Parigi", "Kalipucang", "Cijulang"], dapilKeywords: ["Pangandaran", "DAPIL XIII"] }
];

// Template Kegiatan Resmi Anggota Dewan (Kunjungan Kerja, Reses & Aspirasi)
const ACTIVITY_TEMPLATES = [
  {
    type: "Kunjungan Kerja",
    komisi: "Komisi I",
    title: (kab: string, kec: string) => `Kunjungan Kerja Komisi I: Pengawasan Tata Kelola Pelayanan Publik & Desa di ${kab}`,
    topic: "Pemerintahan, Hukum, dan Tata Kelola Desa",
    dialogAspirasi: "evaluasi efektivitas pelayanan administrasi terpadu kecamatan dan alokasi dana bantuan desa",
    solusiDewan: "mendorong digitalisasi pelayanan publik dan memastikan alokasi anggaran pembinaan aparatur desa masuk dalam evaluasi APBD"
  },
  {
    type: "Kunjungan Kerja",
    komisi: "Komisi II",
    title: (kab: string, kec: string) => `Kunjungan Kerja Komisi II: Monitoring Ketahanan Pangan & Sentra UMKM ${kab}`,
    topic: "Perekonomian, Pertanian, dan UMKM",
    dialogAspirasi: "stabilitas harga pupuk subsidi, akses permodalan UMKM lokal, dan jalur distribusi komoditas pangan",
    solusiDewan: "berkoordinasi dengan Dinas Ketahanan Pangan dan Peternakan Provinsi Jawa Barat untuk subsidi distribusi logistik pangan"
  },
  {
    type: "Kunjungan Kerja",
    komisi: "Komisi III",
    title: (kab: string, kec: string) => `Kunjungan Kerja Komisi III: Evaluasi Optimalisasi PAD & Pelayanan Samsat di ${kab}`,
    topic: "Keuangan Daerah dan Optimalisasi Pajak",
    dialogAspirasi: "kemudahan pembayaran Pajak Kendaraan Bermotor (PKB) dan transparansi bagi hasil pajak ke daerah",
    solusiDewan: "mengembangkan Samsat Digital keliling di tingkat kecamatan serta memantau integrasi penerimaan kas daerah"
  },
  {
    type: "Kunjungan Kerja",
    komisi: "Komisi IV",
    title: (kab: string, kec: string) => `Kunjungan Kerja Komisi IV: Peninjauan Infrastruktur Jalan, Jembatan & Tata Ruang ${kab}`,
    topic: "Infrastruktur, Tata Ruang, dan Bina Marga",
    dialogAspirasi: "perbaikan jalan provinsi yang rusak akibat tonase kendaraan berat dan normalisasi saluran drainase pengendali banjir",
    solusiDewan: "menginstruksikan Balai Pengelolaan Jalan Wilayah untuk mempercepat pemeliharaan berkala dan pemasangan penerangan jalan"
  },
  {
    type: "Kunjungan Kerja",
    komisi: "Komisi V",
    title: (kab: string, kec: string) => `Kunjungan Kerja Komisi V: Pengawasan Fasilitas Kesehatan RSUD & Kesiapan Sekolah di ${kab}`,
    topic: "Kesehatan, Pendidikan, dan Kesejahteraan Rakyat",
    dialogAspirasi: "penambahan alat medis penunjang di RSUD rujukan serta pemerataan sarana ruang kelas baru bagi siswa",
    solusiDewan: "mengawal pembiayaan prioritas sektor kesehatan dan pendidikan pada pembahasan APBD Perubahan Provinsi Jawa Barat"
  },
  {
    type: "Reses",
    komisi: "Seluruh Anggota (Reses Dapil)",
    title: (kab: string, kec: string) => `Reses Masa Sidang: Sesi Serap Aspirasi Warga Kecamatan ${kec}, ${kab}`,
    topic: "Penyerapan Aspirasi Masyarakat & Pokir",
    dialogAspirasi: "usulan bantuan infrastruktur lingkungan RT/RW, pelatihan vokasi pemuda, dan fasilitas air bersih warga",
    solusiDewan: "merangkum seluruh usulan prioritas warga ke dalam dokumen resmi Pokok-Pokok Pikiran (Pokir) DPRD Jawa Barat"
  },
  {
    type: "Aspirasi",
    komisi: "Komisi IV",
    title: (kab: string, kec: string) => `Audiensi Komisi IV: Dialog Aspirasi Penataan Pemukiman & Lingkungan Hidup di ${kec}, ${kab}`,
    topic: "Pemukiman Rakyat dan Lingkungan Hidup",
    dialogAspirasi: "program bantuan renovasi Rumah Tidak Layak Huni (Rutilahu) dan pengelolaan sampah terpadu tingkat kawasan",
    solusiDewan: "meningkatkan kuota penerima manfaat program Rutilahu Jawa Barat dan memfasilitasi armada pengangkut sampah"
  },
  {
    type: "Aspirasi",
    komisi: "Komisi V",
    title: (kab: string, kec: string) => `Sesi Temu Aspirasi Komisi V: Peningkatan Beasiswa & Fasilitas Pendidikan di ${kab}`,
    topic: "Pendidikan dan Bantuan Beasiswa",
    dialogAspirasi: "kemudahan akses program beasiswa Jabar Future Leaders dan pemerataan zonasi jenjang SMA/SMK",
    solusiDewan: "memastikan transparansi seleksi beasiswa dan berkoordinasi dengan Cabang Dinas Pendidikan wilayah terkait"
  }
];

function generateVerbatimTranscript(title: string, dewanName: string, dewanFraksi: string, wargaName: string, kab: string, kec: string, template: any): string {
  return `[00:04] [${wargaName} - Perwakilan Warga ${kec}]: "Selamat pagi Bapak/Ibu Anggota Dewan. Kami menyampaikan aspirasi resmi masyarakat terkait ${template.dialogAspirasi} di wilayah Kecamatan ${kec}, ${kab}."

[00:36] [Dewan - ${dewanName} (${dewanFraksi})]: "Selamat pagi Bapak/Ibu. Terima kasih atas kehadirannya. Sebagai perwakilan rakyat di DPRD Provinsi Jawa Barat, kami hadir langsung untuk mendengarkan dan memastikan bahwa ${template.solusiDewan}."

[01:15] [${wargaName} - Perwakilan Warga ${kec}]: "Kami berharap hasil pertemuan dan kunjungan kerja ini tidak sekadar menjadi catatan, melainkan benar-benar terealisasi dalam waktu dekat."

[01:45] [Dewan - ${dewanName} (${dewanFraksi})]: "Kami berkomitmen penuh. Seluruh poin aspirasi ini telah kami masukkan ke dalam risalah rapat kerja dewan dan akan dikawal ketat pada agenda rapat evaluasi bersama dinas teknis Pemprov Jabar."`;
}

function generateAIAnalysis(title: string, kab: string, kec: string, template: any) {
  return {
    summary: `Sesi ${template.type} resmi mengenai '${title}'. Dewan telah menampung aspirasi masyarakat terkait ${template.dialogAspirasi} dan menyepakati langkah tindak lanjut bersama OPD terkait.`,
    sentiment: "Positif",
    topics: [
      template.topic,
      `Pengawasan Lapangan di ${kab}`,
      `Aspirasi Warga Kecamatan ${kec}`,
      "Tindak Lanjut Pokir & APBD Jawa Barat"
    ],
    actionItems: [
      `Menyusun laporan hasil monitoring kegiatan di Kecamatan ${kec}, ${kab}`,
      `Koordinasi teknis bersama dinas mitra kerja DPRD Provinsi Jawa Barat`,
      `Memastikan alokasi program masuk ke dalam rencana kerja APBD Provinsi`
    ],
    citizenSatisfaction: 9,
    dewanResponsiveness: 9,
    discussionQuality: 9,
    problemSolving: 9
  };
}

async function main() {
  console.log('🏛️ Memulai generate kegiatan resmi Anggota Dewan (Perjalanan Dinas, Reses & Aspirasi) untuk 27 Kab/Kota...');

  const dewanList = await prisma.user.findMany({ where: { role: 'dewan' } });
  if (dewanList.length === 0) {
    throw new Error('Tidak ada data anggota dewan di database!');
  }
  console.log(`📋 Ditemukan ${dewanList.length} anggota dewan terdaftar.`);

  // 1. Siapkan user masyarakat untuk tiap Kecamatan di 27 Kab/Kota
  const citizenMap: Record<string, any> = {};
  for (const reg of JABAR_REGIONS) {
    for (const kec of reg.kecamatans) {
      const email = `warga.${reg.kabupaten.toLowerCase().replace(/[^a-z]/g, '')}.${kec.toLowerCase().replace(/[^a-z]/g, '')}@ketemudewan.online`;
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: `Perwakilan Warga ${kec}`,
            email: email,
            role: 'masyarakat',
            kabupaten: reg.kabupaten,
            kecamatan: kec,
            alamat: `Kecamatan ${kec}, ${reg.kabupaten}`
          }
        });
      }
      citizenMap[`${reg.kabupaten}_${kec}`] = user;
    }
  }

  // 2. Bersihkan database jadwal & perdin lama
  console.log('🧹 Membersihkan database dari data berita non-dewan...');
  await prisma.rating.deleteMany({});
  await prisma.scheduleParticipant.deleteMany({});
  await prisma.schedule.deleteMany({});
  await (prisma as any).perjalananDinas.deleteMany({});

  let totalGenerated = 0;

  // 3. Untuk setiap 27 Kabupaten/Kota, buat 6 - 8 kegiatan resmi terarah (total ~170-200 sesi)
  for (let rIdx = 0; rIdx < JABAR_REGIONS.length; rIdx++) {
    const reg = JABAR_REGIONS[rIdx];

    // Cari anggota dewan yang dapilnya cocok atau round-robin
    const matchedDewan = dewanList.filter(d => {
      const dapilStr = (d.dapil || "") + " " + (d.jabatan || "");
      return reg.dapilKeywords.some(k => dapilStr.toLowerCase().includes(k.toLowerCase()));
    });

    const activeDewanList = matchedDewan.length > 0 ? matchedDewan : dewanList;

    // Buat 7 sesi per kabupaten/kota (mewakili Komisi I-V, Reses, dan Aspirasi Warga)
    for (let tIdx = 0; tIdx < ACTIVITY_TEMPLATES.length; tIdx++) {
      const template = ACTIVITY_TEMPLATES[tIdx];
      const kec = reg.kecamatans[tIdx % reg.kecamatans.length];
      const citizenUser = citizenMap[`${reg.kabupaten}_${kec}`];
      const assignedDewan = activeDewanList[tIdx % activeDewanList.length];

      totalGenerated++;
      const title = template.title(reg.kabupaten, kec);

      // Tanggal tersebar dalam beberapa bulan terakhir
      const daysAgo = (totalGenerated * 2) % 180;
      const activityDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      // Simpan ke PerjalananDinas
      await (prisma as any).perjalananDinas.create({
        data: {
          code: `PD-${String(totalGenerated).padStart(3, '0')}`,
          judul: title,
          kategori: template.type,
          komisi: template.komisi,
          lokasi: reg.kabupaten,
          tanggalPublikasi: activityDate,
          sumber: "Sekretariat DPRD Provinsi Jawa Barat",
          url: "https://dprd.jabarprov.go.id"
        }
      });

      // Transkrip & Analisis AI
      const transcript = generateVerbatimTranscript(
        title,
        assignedDewan.name,
        assignedDewan.fraksi || 'DPRD Jabar',
        citizenUser.name,
        reg.kabupaten,
        kec,
        template
      );

      const aiAnalysis = generateAIAnalysis(
        title,
        reg.kabupaten,
        kec,
        template
      );

      // Simpan ke Schedule
      const sched = await prisma.schedule.create({
        data: {
          title: title,
          startTime: activityDate,
          masyarakatId: citizenUser.id,
          isRecording: true,
          transcription: transcript,
          analysis: aiAnalysis as any,
          transcriptionProgress: 100,
          transcriptionStatus: 'Selesai',
          recordingUrl: '/recordings/sample_perdin.mp4',
          participants: {
            create: [
              {
                dewanId: assignedDewan.id,
                status: 'completed'
              }
            ]
          }
        }
      });

      // Rating Aspek Wilayah
      await prisma.rating.create({
        data: {
          scheduleId: sched.id,
          dewanId: assignedDewan.id,
          speakingScore: 9,
          contextScore: 9,
          timeScore: 9,
          responsivenessScore: 9,
          solutionScore: 9,
          comment: `Sesi aspirasi bersama ${assignedDewan.name} di Kecamatan ${kec} (${reg.kabupaten}) berjalan sangat terarah dan konstruktif.`
        }
      });
    }
  }

  console.log(`\n🎉 SELESAI GENERATE KEGIATAN RESMI!`);
  console.log(`   - Total Kegiatan Resmi Dewan & Aspirasi: ${totalGenerated}`);
  console.log(`   - Terdistribusi secara terstruktur di seluruh 27 Kabupaten/Kota Jawa Barat.`);
  console.log(`   - Bebas dari judul artikel berita umum!`);
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
