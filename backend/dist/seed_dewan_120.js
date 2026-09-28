"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed120Dewan = seed120Dewan;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
function normalizeAkdId(name) {
    return name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
}
function seed120Dewan() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🏛️  Memulai Seeding 120 Anggota DPRD Provinsi Jawa Barat...\n');
        let jsonPath = path_1.default.join(__dirname, 'data/dewan_120.json');
        if (!fs_1.default.existsSync(jsonPath)) {
            jsonPath = path_1.default.join(__dirname, '../data/dewan_120.json');
        }
        if (!fs_1.default.existsSync(jsonPath)) {
            throw new Error(`File data tidak ditemukan di: ${jsonPath}`);
        }
        const dewanList = JSON.parse(fs_1.default.readFileSync(jsonPath, 'utf8'));
        console.log(`📋 Memuat ${dewanList.length} data anggota dewan dari dewan_120.json.`);
        const passwordHash = yield bcryptjs_1.default.hash('password', 10);
        // 1. Seed AKD (Alat Kelengkapan Dewan)
        console.log('🏛️  Menyiapkan master Alat Kelengkapan Dewan (AKD)...');
        const akdMap = new Map();
        for (const d of dewanList) {
            if (d.akdMemberships && Array.isArray(d.akdMemberships)) {
                for (const m of d.akdMemberships) {
                    if (!m.akd)
                        continue;
                    const id = normalizeAkdId(m.akd);
                    if (!akdMap.has(id)) {
                        let tipe = 'BADAN';
                        if (m.akd.toUpperCase().includes('KOMISI'))
                            tipe = 'KOMISI';
                        else if (m.akd.toUpperCase().includes('PIMPINAN'))
                            tipe = 'PIMPINAN';
                        akdMap.set(id, { id, nama: m.akd.trim(), tipe });
                    }
                }
            }
        }
        for (const akd of akdMap.values()) {
            yield prisma.aKD.upsert({
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
        const nextDay = (offsetDays, hour) => {
            const d = new Date(now);
            d.setDate(d.getDate() + offsetDays);
            d.setHours(hour, 0, 0, 0);
            return d;
        };
        for (let i = 0; i < dewanList.length; i++) {
            const d = dewanList[i];
            // Check existing by nip, centreId, or email
            const existing = yield prisma.user.findFirst({
                where: {
                    OR: [
                        { nip: d.nip },
                        { centreId: d.centreId },
                        { email: d.email },
                        { name: d.name },
                    ],
                },
            });
            const user = yield prisma.user.upsert({
                where: { id: (existing === null || existing === void 0 ? void 0 : existing.id) || -1 },
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
            yield prisma.aKDMember.deleteMany({ where: { dewanId: user.id } });
            if (d.akdMemberships && d.akdMemberships.length > 0) {
                for (const m of d.akdMemberships) {
                    if (!m.akd)
                        continue;
                    const akdId = normalizeAkdId(m.akd);
                    yield prisma.aKDMember.create({
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
            const existingSlots = yield prisma.availability.count({
                where: { dewanId: user.id },
            });
            if (existingSlots === 0) {
                yield prisma.availability.createMany({
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
    });
}
// Allow direct execution via CLI
if (require.main === module) {
    seed120Dewan()
        .catch((e) => {
        console.error('❌ Error saat seeding 120 dewan:', e);
        process.exit(1);
    })
        .finally(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.$disconnect();
    }));
}
