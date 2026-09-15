import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface DewanRecord {
  nip: string;
  centreId: string;
  name: string;
  email: string;
  role: string;
  fraksi: string;
  dapil: string;
  jabatan: string;
  noWhatsapp: string | null;
  bio: string;
  akdMemberships: Array<{
    akd: string;
    jabatan: string;
  }>;
}

function normalizeAkdId(name: string): string {
  return name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
}

export async function seed120Dewan() {
  console.log('🏛️  Memulai Seeding 120 Anggota DPRD Provinsi Jawa Barat...\n');

  let jsonPath = path.join(__dirname, 'data/dewan_120.json');
  if (!fs.existsSync(jsonPath)) {
    jsonPath = path.join(__dirname, '../data/dewan_120.json');
  }
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`File data tidak ditemukan di: ${jsonPath}`);
  }

  const dewanList: DewanRecord[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`📋 Memuat ${dewanList.length} data anggota dewan dari dewan_120.json.`);

  const passwordHash = await bcrypt.hash('password', 10);

  // 1. Seed AKD (Alat Kelengkapan Dewan)
  console.log('🏛️  Menyiapkan master Alat Kelengkapan Dewan (AKD)...');
  const akdMap = new Map<string, { id: string; nama: string; tipe: string }>();

  for (const d of dewanList) {
    if (d.akdMemberships && Array.isArray(d.akdMemberships)) {
      for (const m of d.akdMemberships) {
        if (!m.akd) continue;
        const id = normalizeAkdId(m.akd);
        if (!akdMap.has(id)) {
          let tipe = 'BADAN';
          if (m.akd.toUpperCase().includes('KOMISI')) tipe = 'KOMISI';
          else if (m.akd.toUpperCase().includes('PIMPINAN')) tipe = 'PIMPINAN';
          akdMap.set(id, { id, nama: m.akd.trim(), tipe });
        }
      }
    }
  }

  for (const akd of akdMap.values()) {
    await prisma.aKD.upsert({
      where: { id: akd.id },
      update: { nama: akd.nama, tipe: akd.tipe },
      create: { id: akd.id, nama: akd.nama, tipe: akd.tipe },
    });
  }
  console.log(`✅ ${akdMap.size} AKD berhasil disiapkan.`);

  // 2. Seed 120 Dewan Users
  console.log('👤 Mengisi data 120 Anggota Dewan ke database...');
  let successCount = 0;

  const now = new Date();
  const nextDay = (offsetDays: number, hour: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  for (let i = 0; i < dewanList.length; i++) {
    const d = dewanList[i];

    // Check existing by nip, centreId, or email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { nip: d.nip },
          { centreId: d.centreId },
          { email: d.email },
          { name: d.name },
        ],
      },
    });

    const user = await prisma.user.upsert({
      where: { id: existing?.id || -1 },
      update: {
        name: d.name,
        email: d.email,
        nip: d.nip,
        centreId: d.centreId,
        role: 'dewan',
        fraksi: d.fraksi,
        dapil: d.dapil,
        jabatan: d.jabatan,
        noWhatsapp: d.noWhatsapp,
        bio: d.bio,
        passwordHash,
        isSync: true,
      },
      create: {
        name: d.name,
        email: d.email,
        nip: d.nip,
        centreId: d.centreId,
        role: 'dewan',
        fraksi: d.fraksi,
        dapil: d.dapil,
        jabatan: d.jabatan,
        noWhatsapp: d.noWhatsapp,
        bio: d.bio,
        passwordHash,
        isSync: true,
      },
    });

    // Sync AKD Memberships
    await prisma.aKDMember.deleteMany({ where: { dewanId: user.id } });
    if (d.akdMemberships && d.akdMemberships.length > 0) {
      for (const m of d.akdMemberships) {
        if (!m.akd) continue;
        const akdId = normalizeAkdId(m.akd);
        await prisma.aKDMember.create({
          data: {
            akdId,
            dewanId: user.id,
            jabatan: m.jabatan || 'Anggota',
          },
        });
      }
    }

    // Seed Availability Slots (2 upcoming slots per dewan)
    const slot1Start = nextDay((i % 5) + 1, 9 + (i % 4));
    const slot1End = new Date(slot1Start.getTime() + 60 * 60 * 1000);
    const slot2Start = nextDay((i % 5) + 3, 13 + (i % 3));
    const slot2End = new Date(slot2Start.getTime() + 60 * 60 * 1000);

    const existingSlots = await prisma.availability.count({
      where: { dewanId: user.id },
    });

    if (existingSlots === 0) {
      await prisma.availability.createMany({
        data: [
          { dewanId: user.id, startTime: slot1Start, endTime: slot1End },
          { dewanId: user.id, startTime: slot2Start, endTime: slot2End },
        ],
      });
    }

    successCount++;
    if (successCount % 20 === 0 || successCount === dewanList.length) {
      console.log(`   Progres: ${successCount}/${dewanList.length} anggota dewan terproses...`);
    }
  }

  console.log(`\n🎉 SEEDING SELESAI: Berhasil mendaftarkan ${successCount} Anggota DPRD Jawa Barat!`);
  console.log(`🔑 Semua akun dewan dapat login menggunakan password: 'password'`);
}

// Allow direct execution via CLI
if (require.main === module) {
  seed120Dewan()
    .catch((e) => {
      console.error('❌ Error saat seeding 120 dewan:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
