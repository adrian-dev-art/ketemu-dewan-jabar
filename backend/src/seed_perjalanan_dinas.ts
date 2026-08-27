import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding data historical Perjalanan Dinas DPRD Jawa Barat...');

  // Path ke file JSON (bisa di root atau di backend)
  const candidatePaths = [
    path.resolve(__dirname, './perjalanan_dinas_jabar.json'),
    path.resolve(__dirname, '../perjalanan_dinas_jabar.json'),
    '/app/src/perjalanan_dinas_jabar.json',
    path.resolve(process.cwd(), 'perjalanan_dinas_jabar.json'),
    path.resolve(process.cwd(), 'src/perjalanan_dinas_jabar.json')
  ];

  let rawData = null;
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      console.log(`📂 Membaca file data dari: ${p}`);
      rawData = fs.readFileSync(p, 'utf-8');
      break;
    }
  }

  if (!rawData) {
    throw new Error('❌ File perjalanan_dinas_jabar.json tidak ditemukan!');
  }

  const items = JSON.parse(rawData);
  console.log(`📊 Ditemukan ${items.length} item data historical.`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of items) {
    let parsedDate: Date | null = null;
    if (item.tanggal_publikasi) {
      const d = new Date(item.tanggal_publikasi);
      if (!isNaN(d.getTime())) {
        parsedDate = d;
      }
    }

    // Cek apakah sudah ada berdasarkan judul atau URL atau code
    const existing = await (prisma as any).perjalananDinas.findFirst({
      where: {
        OR: [
          { code: item.id },
          { judul: item.judul }
        ]
      }
    });

    if (existing) {
      await (prisma as any).perjalananDinas.update({
        where: { id: existing.id },
        data: {
          code: item.id,
          judul: item.judul,
          kategori: item.kategori || 'Kunjungan Kerja',
          komisi: item.komisi || 'DPRD Jabar / Pimpinan',
          lokasi: item.lokasi || 'Jawa Barat / Terkait',
          tanggalPublikasi: parsedDate,
          sumber: item.sumber,
          url: item.url
        }
      });
      updatedCount++;
    } else {
      await (prisma as any).perjalananDinas.create({
        data: {
          code: item.id,
          judul: item.judul,
          kategori: item.kategori || 'Kunjungan Kerja',
          komisi: item.komisi || 'DPRD Jabar / Pimpinan',
          lokasi: item.lokasi || 'Jawa Barat / Terkait',
          tanggalPublikasi: parsedDate,
          sumber: item.sumber,
          url: item.url
        }
      });
      insertedCount++;
    }
  }

  console.log(`✅ Selesai! Berhasil memasukkan ${insertedCount} data baru dan memperbarui ${updatedCount} data.`);
  const totalInDb = await (prisma as any).perjalananDinas.count();
  console.log(`📈 Total record PerjalananDinas di database saat ini: ${totalInDb}`);
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
