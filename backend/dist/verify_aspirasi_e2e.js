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
const http_1 = __importDefault(require("http"));
const BASE_URL = 'http://localhost:5001';
function request(path_1) {
    return __awaiter(this, arguments, void 0, function* (path, options = {}) {
        const url = new URL(path, BASE_URL);
        const bodyStr = options.body ? JSON.stringify(options.body) : undefined;
        return new Promise((resolve, reject) => {
            const req = http_1.default.request(url, {
                method: options.method || 'GET',
                headers: Object.assign(Object.assign({ 'Content-Type': 'application/json', 'Origin': 'http://localhost:3001' }, (bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})), options.headers)
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve({ status: res.statusCode || 200, data: parsed });
                    }
                    catch (_a) {
                        resolve({ status: res.statusCode || 200, data });
                    }
                });
            });
            req.on('error', reject);
            if (bodyStr)
                req.write(bodyStr);
            req.end();
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log('[E2E-TEST] Memulai pengujian integrasi E-Aspirasi dan Analisis AI...\n');
        // 1. Login sebagai masyarakat@demo.id
        console.log('1. Menguji Otentikasi: Login akun masyarakat@demo.id...');
        const loginRes = yield request('/api/auth/login', {
            method: 'POST',
            body: {
                email: 'masyarakat@demo.id',
                password: 'password'
            }
        });
        if (loginRes.status !== 200 || !loginRes.data.token) {
            throw new Error(`Login gagal: status ${loginRes.status}, data: ${JSON.stringify(loginRes.data)}`);
        }
        const token = loginRes.data.token;
        console.log(`   [OK] Login berhasil. Nama Pengguna: ${loginRes.data.user.name}, Peran: ${loginRes.data.user.role}`);
        // 2. Ambil daftar aspirasi milik masyarakat@demo.id
        console.log('\n2. Mengambil daftar aspirasi (GET /api/aspirasi)...');
        const aspirasiRes = yield request('/api/aspirasi', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (aspirasiRes.status !== 200 || !Array.isArray(aspirasiRes.data)) {
            throw new Error(`Gagal mengambil aspirasi: status ${aspirasiRes.status}, data: ${JSON.stringify(aspirasiRes.data)}`);
        }
        console.log(`   [OK] Ditemukan ${aspirasiRes.data.length} data aspirasi.`);
        for (const item of aspirasiRes.data) {
            console.log(`   - Tiket: ${item.ticketNumber} | Status: ${item.status.padEnd(14)} | Rekomendasi AI: ${item.aiRecommendation || 'Belum Ada'}`);
            console.log(`     Judul: ${item.judul.slice(0, 60)}...`);
            console.log(`     Berkas: ${item.materiFileName} (${item.materiType})`);
        }
        // 3. Verifikasi ketersediaan berkas proposal fisik
        console.log('\n3. Menguji akses berkas materi statis...');
        for (const item of aspirasiRes.data.slice(0, 2)) {
            const fileRes = yield request(item.materiUrl);
            console.log(`   - Berkas ${item.materiFileName}: Status HTTP ${fileRes.status}`);
            if (fileRes.status !== 200) {
                throw new Error(`Berkas statis ${item.materiUrl} tidak dapat diakses!`);
            }
        }
        // 4. Uji endpoint Analisis AI On-Demand (POST /api/aspirasi/:id/analisis-ai)
        console.log('\n4. Menguji analisis Tenaga Ahli AI On-Demand...');
        const targetId = aspirasiRes.data[0].id;
        const aiRes = yield request(`/api/aspirasi/${targetId}/analisis-ai`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (aiRes.status !== 200 || !aiRes.data.result) {
            throw new Error(`Analisis AI gagal: status ${aiRes.status}, data: ${JSON.stringify(aiRes.data)}`);
        }
        console.log(`   [OK] Rekomendasi AI: "${aiRes.data.result.recommendation}"`);
        console.log(`   [OK] Cuplikan Hasil Telaah:`);
        const lines = aiRes.data.result.analysis.split('\n').filter((l) => l.trim().length > 0);
        for (const l of lines.slice(0, 4)) {
            console.log(`        ${l}`);
        }
        // 5. Uji pembuatan E-Aspirasi baru dengan berkas PDF
        console.log('\n5. Menguji pengajuan E-Aspirasi baru dengan berkas materi...');
        const fakePdfBase64 = Buffer.from('%PDF-1.4 proposal uji coba resmi warga').toString('base64');
        // Upload materi
        const uploadRes = yield request('/api/aspirasi/upload-materi', {
            method: 'POST',
            body: {
                fileName: 'proposal_uji_coba_warga.pdf',
                fileBase64: `data:application/pdf;base64,${fakePdfBase64}`
            }
        });
        if (uploadRes.status !== 200 || !uploadRes.data.fileUrl) {
            throw new Error(`Upload materi gagal: ${JSON.stringify(uploadRes.data)}`);
        }
        console.log(`   [OK] Berkas materi berhasil diunggah: ${uploadRes.data.fileUrl}`);
        // Create aspirasi
        const createRes = yield request('/api/aspirasi', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: {
                judul: 'Proposal Pengadaan Sarana Penerangan Jalan Umum (PJU) Tenaga Surya Desa Mandiri',
                deskripsi: 'Permohonan bantuan pemasangan 20 unit lampu penerangan jalan umum tenaga surya di sepanjang jalan desa minim penerangan untuk mencegah tindak kriminalitas dan kecelakaan warga saat malam hari.',
                kategori: 'Infrastruktur Jalan & Jembatan',
                dapil: 'DAPIL IV (Kabupaten Cianjur)',
                kabupatenKota: 'Kabupaten Cianjur',
                kecamatan: 'Cidaun',
                alamat: 'Jl. Poros Desa Mandiri KM 02',
                materiUrl: uploadRes.data.fileUrl,
                materiType: uploadRes.data.materiType,
                materiFileName: uploadRes.data.fileName,
                materiSize: uploadRes.data.sizeBytes
            }
        });
        if (createRes.status !== 201 || !createRes.data.ticketNumber) {
            throw new Error(`Create aspirasi gagal: ${JSON.stringify(createRes.data)}`);
        }
        console.log(`   [OK] E-Aspirasi baru berhasil diajukan dengan Nomor Tiket: ${createRes.data.ticketNumber}`);
        console.log(`   [OK] Tahap Timeline awal otomatis terbentuk: "${(_a = createRes.data.timelineEvents[0]) === null || _a === void 0 ? void 0 : _a.tahap}"`);
        console.log('\n[SELESAI] Seluruh pengujian integrasi E-Aspirasi & Analisis AI berhasil 100% tanpa kendala.');
    });
}
run().catch(err => {
    console.error('[GAGAL] Terjadi kesalahan dalam pengujian:', err);
    process.exit(1);
});
