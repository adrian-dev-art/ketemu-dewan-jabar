import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const LOKASI_WARGA: Record<string, string> = {
  "Bandung": "Bpk. Dedi Kurniawan (Forum Warga Bandung)",
  "Bandung Barat": "Ibu Siti Rohmah (Warga Padalarang KBB)",
  "Garut": "Bpk. Hendra Gunawan (Perwakilan Warga Garut Selatan)",
  "Sukabumi": "Bpk. Asep Saepudin (Tokoh Masyarakat Sukabumi)",
  "Bogor": "Bpk. Ridwan Hakim (Forum Komunikasi Bogor)",
  "Cirebon": "Ibu Nurhasanah (Perwakilan Nelayan Cirebon)",
  "Bekasi": "Bpk. Bambang Sutrisno (Asosiasi Warga Bekasi)",
  "Depok": "Ibu Maya Lestari (Perwakilan Warga Depok)",
  "Karawang": "Bpk. Cecep Hidayat (Kelompok Tani Karawang)",
  "Subang": "Bpk. Ujang Permana (Warga Pantura Subang)",
  "Ciamis": "Bpk. Dadang Kusuma (Tokoh Masyarakat Ciamis)",
  "Tasikmalaya": "Ibu Enok Komariah (Perwakilan UMKM Tasikmalaya)",
  "Kuningan": "Bpk. Yayan Supriatna (Warga Kuningan)",
  "Majalengka": "Ibu Tintin Kartini (Warga Majalengka)",
  "Cianjur": "Bpk. Agus Salim (Forum Warga Cianjur)",
  "Pangandaran": "Bpk. Wawan Setiawan (Kelompok Sadar Wisata Pangandaran)",
  "Sumedang": "Bpk. Iwan Suherman (Warga Sumedang)",
  "Indramayu": "Bpk. Solihin (Kelompok Tani & Nelayan Indramayu)",
  "Purwakarta": "Ibu Lilis Suryani (Warga Purwakarta)",
  "Cimahi": "Bpk. Arif Budiman (Forum RT/RW Cimahi)",
  "Banjar": "Ibu Rina Marlina (Warga Kota Banjar)",
  "Bali": "Bpk. Wayan Sudarta (Studi Banding Desa Adat Bali)",
  "Yogyakarta": "Bpk. Sigit Purnomo (Koordinasi Tata Ruang DIY)",
  "Semarang": "Bpk. Joko Susilo (Studi Banding Irigasi Jateng)",
  "Jakarta": "Bpk. Taufik Hidayat (Badan Penghubung Jabar di Jakarta)"
};

function getRepresentativeName(lokasi: string): string {
  for (const [key, val] of Object.entries(LOKASI_WARGA)) {
    if (lokasi.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }
  return "Bpk. Wahyu Pratama (Perwakilan Masyarakat Jabar)";
}

function generateVerbatimTranscript(judul: string, komisi: string, lokasi: string, dewanName: string, wargaName: string): string {
  return `[00:05] [${wargaName}]: "Selamat pagi Bapak/Ibu Dewan. Terkait agenda ${judul} di wilayah ${lokasi}, kami ingin menyampaikan beberapa catatan lapangan dan aspirasi mendesak dari warga."

[00:38] [Dewan - ${dewanName}]: "Selamat pagi. Terima kasih atas kehadirannya. Kami dari ${komisi} DPRD Provinsi Jawa Barat hadir untuk memastikan bahwa fungsi pengawasan dan alokasi anggaran APBD benar-benar menjawab kebutuhan riil masyarakat di ${lokasi}."

[01:15] [${wargaName}]: "Harapan kami, program yang direncanakan dapat dipercepat realisasinya, terutama terkait peningkatan sarana prasarana, transparansi pelayanan, dan kepastian penyelesaian kendala di lapangan."

[01:45] [Dewan - ${dewanName}]: "Catatan bapak/ibu sekalian telah kami rangkum dalam notula resmi rapat kerja dan pokok-pokok pikiran (Pokir) ${komisi}. Kami akan segera mengoordinasikan hal ini dengan dinas terkait pada rapat kerja evaluasi mendatang."

[02:10] [${wargaName}]: "Terima kasih banyak atas respons cepat dan perhatian DPRD Jawa Barat."`;
}

function generateAIAnalysis(judul: string, komisi: string, lokasi: string) {
  return {
    summary: `Diskusi dan evaluasi mengenai ${judul} di wilayah ${lokasi}. Anggota ${komisi} DPRD Jawa Barat telah menampung aspirasi masyarakat dan berkomitmen mengawal tindak lanjut penganggaran serta koordinasi lintas dinas.`,
    sentiment: "Positif",
    topics: [
      judul.substring(0, 60),
      `Pengawasan ${komisi} di ${lokasi}`,
      "Evaluasi Realisasi Program APBD",
      "Peningkatan Pelayanan Publik Daerah"
    ],
    actionItems: [
      `Menyusun laporan hasil evaluasi kegiatan di ${lokasi}`,
      `Melakukan rapat koordinasi teknis bersama OPD mitra ${komisi}`,
      `Memastikan alokasi tindak lanjut masuk ke dalam Rencana Kerja Pemerintah Daerah (RKPD)`
    ],
    citizenSatisfaction: 9,
    dewanResponsiveness: 9,
    discussionQuality: 9,
    problemSolving: 9
  };
}

async function main() {
  console.log('🚀 Memulai injeksi data Perjalanan Dinas ke tabel Jadwal (Schedules)...');

  // 1. Ambil list Dewan & Masyarakat
  const dewanList = await prisma.user.findMany({
    where: { role: 'dewan' }
  });

  let masyarakatUser = await prisma.user.findFirst({
    where: { role: 'masyarakat' }
  });

  if (!masyarakatUser) {
    masyarakatUser = await prisma.user.create({
      data: {
        name: 'Masyarakat Jawa Barat (Aspirasi Publik)',
        email: 'masyarakat.jabar@ketemudewan.online',
        role: 'masyarakat',
        kabupaten: 'Kota Bandung',
        kecamatan: 'Sumur Bandung',
        alamat: 'Jl. Diponegoro No. 22 Bandung'
      }
    });
    console.log('👤 Membuat user Masyarakat default:', masyarakatUser.name);
  }

  // Jika tidak ada dewan, buat fallback dewan
  if (dewanList.length === 0) {
    const defaultDewan = await prisma.user.create({
      data: {
        name: 'H. Ono Surono, S.T. (Pimpinan DPRD Jabar)',
        email: 'ono.surono@dprd.jabarprov.go.id',
        role: 'dewan',
        fraksi: 'PDI Perjuangan',
        jabatan: 'Pimpinan DPRD',
        dapil: 'Jabar XII'
      }
    });
    dewanList.push(defaultDewan);
  }

  // 2. Baca file perjalanan_dinas_jabar.json
  const candidatePaths = [
    path.resolve(__dirname, './perjalanan_dinas_jabar.json'),
    '/app/src/perjalanan_dinas_jabar.json',
    path.resolve(process.cwd(), 'perjalanan_dinas_jabar.json')
  ];

  let raw = null;
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      raw = fs.readFileSync(p, 'utf-8');
      break;
    }
  }

  if (!raw) {
    throw new Error('❌ File perjalanan_dinas_jabar.json tidak ditemukan!');
  }

  const items = JSON.parse(raw);
  console.log(`📊 Memproses ${items.length} data untuk dimasukkan ke tabel Jadwal...`);

  let createdCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const assignedDewan = dewanList[i % dewanList.length];
    const wargaName = getRepresentativeName(item.lokasi || 'Jawa Barat');
    
    let startTime = new Date();
    if (item.tanggal_publikasi) {
      const d = new Date(item.tanggal_publikasi);
      if (!isNaN(d.getTime())) {
        startTime = d;
      }
    }

    const transcriptText = generateVerbatimTranscript(
      item.judul,
      item.komisi || 'DPRD Jawa Barat',
      item.lokasi || 'Jawa Barat',
      assignedDewan.name,
      wargaName
    );

    const aiAnalysis = generateAIAnalysis(
      item.judul,
      item.komisi || 'DPRD Jawa Barat',
      item.lokasi || 'Jawa Barat'
    );

    // Cek apakah Schedule dengan judul ini sudah ada
    const existingSchedule = await prisma.schedule.findFirst({
      where: { title: item.judul },
      include: { participants: true }
    });

    if (existingSchedule) {
      await prisma.schedule.update({
        where: { id: existingSchedule.id },
        data: {
          startTime: startTime,
          transcription: transcriptText,
          analysis: aiAnalysis as any,
          isRecording: true,
          transcriptionProgress: 100,
          transcriptionStatus: 'Selesai'
        }
      });
      updatedCount++;
    } else {
      const newSchedule = await prisma.schedule.create({
        data: {
          title: item.judul,
          startTime: startTime,
          masyarakatId: masyarakatUser.id,
          isRecording: true,
          transcription: transcriptText,
          analysis: aiAnalysis as any,
          transcriptionProgress: 100,
          transcriptionStatus: 'Selesai',
          recordingUrl: item.url || '/recordings/sample_perdin.mp4',
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
      createdCount++;
    }
  }

  console.log(`✅ Berhasil menyinkronkan data ke tabel Jadwal!`);
  console.log(`   - Baru dibuat: ${createdCount}`);
  console.log(`   - Diperbarui: ${updatedCount}`);
  const totalSchedules = await prisma.schedule.count();
  console.log(`📈 Total Jadwal & Sesi di database sekarang: ${totalSchedules}`);
}

main()
  .catch((e) => {
    console.error('❌ Gagal sinkronisasi ke tabel jadwal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
