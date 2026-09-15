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
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🌱 Memulai proses seeding data historical Perjalanan Dinas DPRD Jawa Barat...');
        // Path ke file JSON (bisa di root atau di backend)
        const candidatePaths = [
            path_1.default.resolve(__dirname, './perjalanan_dinas_jabar.json'),
            path_1.default.resolve(__dirname, '../perjalanan_dinas_jabar.json'),
            '/app/src/perjalanan_dinas_jabar.json',
            path_1.default.resolve(process.cwd(), 'perjalanan_dinas_jabar.json'),
            path_1.default.resolve(process.cwd(), 'src/perjalanan_dinas_jabar.json')
        ];
        let rawData = null;
        for (const p of candidatePaths) {
            if (fs_1.default.existsSync(p)) {
                console.log(`📂 Membaca file data dari: ${p}`);
                rawData = fs_1.default.readFileSync(p, 'utf-8');
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
            let parsedDate = null;
            if (item.tanggal_publikasi) {
                const d = new Date(item.tanggal_publikasi);
                if (!isNaN(d.getTime())) {
                    parsedDate = d;
                }
            }
            // Cek apakah sudah ada berdasarkan judul atau URL atau code
            const existing = yield prisma.perjalananDinas.findFirst({
                where: {
                    OR: [
                        { code: item.id },
                        { judul: item.judul }
                    ]
                }
            });
            if (existing) {
                yield prisma.perjalananDinas.update({
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
            }
            else {
                yield prisma.perjalananDinas.create({
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
        const totalInDb = yield prisma.perjalananDinas.count();
        console.log(`📈 Total record PerjalananDinas di database saat ini: ${totalInDb}`);
    });
}
main()
    .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
