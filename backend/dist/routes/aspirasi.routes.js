"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const emailService_1 = require("../services/emailService");
const aspirasiAiService_1 = require("../services/aspirasiAiService");
const router = (0, express_1.Router)();
// Helper untuk generate Nomor Tiket Aspirasi resmi: ASP-YYYYMM-XXXXX
const generateTicketNumber = () => {
    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7).replace('-', '');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `ASP-${yearMonth}-${randomSuffix}`;
};
// 1. POST /api/aspirasi/upload-materi (Materi Video, PDF, Dokumen, Foto)
router.post('/aspirasi/upload-materi', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileName, fileBase64 } = req.body;
        if (!fileName || !fileBase64) {
            return res.status(400).json({ error: "Nama berkas dan data berkas (base64) wajib disertakan." });
        }
        const base64Data = fileBase64.replace(/^data:.*?;base64,/, "");
        const fileBuffer = Buffer.from(base64Data, 'base64');
        if (fileBuffer.length > upload_middleware_1.MAX_MATERI_SIZE_BYTES) {
            return res.status(400).json({ error: "Ukuran berkas melebihi batas maksimum 50MB." });
        }
        const safeFileName = (0, upload_middleware_1.sanitizeMateriFileName)(fileName);
        const targetPath = path.join(upload_middleware_1.materiDir, safeFileName);
        yield fs.promises.writeFile(targetPath, fileBuffer);
        const materiType = (0, upload_middleware_1.getMateriCategory)(safeFileName);
        const fileUrl = `/uploads/materi/${safeFileName}`;
        return res.json({
            message: "Berkas materi aspirasi berhasil diunggah",
            fileUrl,
            fileName: safeFileName,
            originalName: fileName,
            materiType,
            sizeBytes: fileBuffer.length
        });
    }
    catch (err) {
        console.error("Error upload materi aspirasi:", err);
        return res.status(500).json({ error: "Gagal mengunggah berkas materi: " + err.message });
    }
}));
// 2. POST /api/aspirasi (Pengajuan Aspirasi Baru oleh Masyarakat)
router.post('/aspirasi', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: "Otentikasi pengguna tidak valid." });
        }
        const { judul, deskripsi, kategori, dapil, kabupatenKota, kecamatan, alamat, dewanId, materiUrl, materiType, materiFileName, materiSize } = req.body;
        if (!judul || !deskripsi || !dapil) {
            return res.status(400).json({ error: "Judul, deskripsi usulan, dan Daerah Pemilihan (Dapil) wajib diisi." });
        }
        const ticketNumber = generateTicketNumber();
        const newAspirasi = yield prisma_1.prisma.aspirasi.create({
            data: {
                ticketNumber,
                judul,
                deskripsi,
                kategori: kategori || "Infrastruktur",
                dapil,
                kabupatenKota: kabupatenKota || null,
                kecamatan: kecamatan || null,
                alamat: alamat || null,
                materiUrl: materiUrl || null,
                materiType: materiType || (materiFileName ? (0, upload_middleware_1.getMateriCategory)(materiFileName) : null),
                materiFileName: materiFileName || null,
                materiSize: materiSize ? Number(materiSize) : null,
                masyarakatId: userId,
                dewanId: dewanId ? Number(dewanId) : null,
                status: "diajukan",
                submittedAt: new Date(),
                timelineEvents: {
                    create: [
                        {
                            tahap: "Pengajuan Aspirasi",
                            status: "selesai",
                            keterangan: "Aspirasi telah berhasil dikirim oleh pemohon melalui portal HUDANG.",
                            aktor: "Masyarakat",
                            createdAt: new Date()
                        }
                    ]
                }
            },
            include: {
                masyarakat: {
                    select: { id: true, name: true, email: true, noWhatsapp: true, kabupaten: true, kecamatan: true }
                },
                dewan: {
                    select: { id: true, name: true, fraksi: true, dapil: true, jabatan: true }
                },
                timelineEvents: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        const io = req.app.get('io');
        if (io) {
            io.emit('aspirasi:created', { aspirasi: newAspirasi });
        }
        // Jalankan analisis Tenaga Ahli AI secara asinkron di latar belakang
        (0, aspirasiAiService_1.analyzeAspirasiProposal)(newAspirasi.id)
            .then(aiRes => {
            if (io) {
                io.emit('aspirasi:ai_analysed', { aspirasiId: newAspirasi.id, recommendation: aiRes.recommendation });
            }
        })
            .catch(aiErr => console.error("[AI-ASPIRASI] Gagal memproses analisis otomatis:", aiErr));
        return res.status(201).json(newAspirasi);
    }
    catch (err) {
        console.error("Error creating aspirasi:", err);
        return res.status(500).json({ error: "Gagal menyimpan aspirasi: " + err.message });
    }
}));
// 3. GET /api/aspirasi (Daftar Aspirasi berdasarkan Role)
router.get('/aspirasi', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Otentikasi pengguna tidak valid." });
        }
        const { status, dapil, search } = req.query;
        const where = {};
        if (status && typeof status === 'string' && status !== 'all') {
            where.status = status;
        }
        if (dapil && typeof dapil === 'string' && dapil !== 'all') {
            where.dapil = { contains: dapil, mode: 'insensitive' };
        }
        if (search && typeof search === 'string' && search.trim() !== '') {
            const q = search.trim();
            where.OR = [
                { judul: { contains: q, mode: 'insensitive' } },
                { deskripsi: { contains: q, mode: 'insensitive' } },
                { ticketNumber: { contains: q, mode: 'insensitive' } },
                { dapil: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (user.role === 'masyarakat') {
            where.masyarakatId = user.id;
        }
        else if (user.role === 'dewan') {
            const dewanUser = yield prisma_1.prisma.user.findUnique({
                where: { id: user.id },
                select: { dapil: true }
            });
            if (dewanUser === null || dewanUser === void 0 ? void 0 : dewanUser.dapil) {
                // Filter aspirasi yang ditujukan ke dewan ini ATAU aspirasi dari dapil yang sama
                const dapilKeyword = dewanUser.dapil.split('(')[0].trim(); // e.g. "DAPIL X"
                where.OR = [
                    { dewanId: user.id },
                    { dapil: { contains: dapilKeyword, mode: 'insensitive' } }
                ];
            }
            else {
                where.dewanId = user.id;
            }
        }
        // Admin: tidak ada batasan ID pemohon/dewan
        const list = yield prisma_1.prisma.aspirasi.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                masyarakat: {
                    select: { id: true, name: true, email: true, noWhatsapp: true, kabupaten: true, kecamatan: true }
                },
                dewan: {
                    select: { id: true, name: true, fraksi: true, dapil: true, jabatan: true }
                },
                timelineEvents: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        return res.json(list);
    }
    catch (err) {
        console.error("Error fetching aspirasi:", err);
        return res.status(500).json({ error: "Gagal mengambil daftar aspirasi: " + err.message });
    }
}));
// 4a. GET /api/aspirasi/analitik — HARUS sebelum /:id agar tidak tertangkap sebagai ID
router.get('/aspirasi/analitik', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || (user.role !== 'admin' && user.role !== 'dewan')) {
            return res.status(403).json({ error: "Akses ditolak. Hanya Admin atau Dewan yang dapat mengakses analitik." });
        }
        const { startDate, endDate } = req.query;
        const dateFilter = {};
        if (startDate && typeof startDate === 'string') {
            dateFilter.gte = new Date(startDate);
        }
        if (endDate && typeof endDate === 'string') {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.lte = end;
        }
        const whereBase = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
        if (user.role === 'dewan') {
            const dewanUser = yield prisma_1.prisma.user.findUnique({ where: { id: user.id }, select: { dapil: true } });
            if (dewanUser === null || dewanUser === void 0 ? void 0 : dewanUser.dapil) {
                const dapilKeyword = dewanUser.dapil.split('(')[0].trim();
                whereBase.dapil = { contains: dapilKeyword, mode: 'insensitive' };
            }
        }
        const allAspirasi = yield prisma_1.prisma.aspirasi.findMany({
            where: whereBase,
            select: { id: true, kategori: true, status: true, dapil: true, kabupatenKota: true, createdAt: true, submittedAt: true, completedAt: true, judul: true }
        });
        const total = allAspirasi.length;
        const kategoriMap = {};
        for (const a of allAspirasi) {
            const k = a.kategori || 'Lainnya';
            kategoriMap[k] = (kategoriMap[k] || 0) + 1;
        }
        const statusMap = {};
        for (const a of allAspirasi) {
            const s = a.status || 'diajukan';
            statusMap[s] = (statusMap[s] || 0) + 1;
        }
        const dapilMap = {};
        for (const a of allAspirasi) {
            const d = a.dapil || 'Tidak Diketahui';
            const dapilLabel = d.split('(')[0].trim();
            dapilMap[dapilLabel] = (dapilMap[dapilLabel] || 0) + 1;
        }
        const byDapil = Object.entries(dapilMap).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([dapil, jumlah]) => ({ dapil, jumlah }));
        const kabMap = {};
        for (const a of allAspirasi) {
            const k = a.kabupatenKota || 'Tidak Diketahui';
            kabMap[k] = (kabMap[k] || 0) + 1;
        }
        const byKabupaten = Object.entries(kabMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([kabupaten, jumlah]) => ({ kabupaten, jumlah }));
        const now = new Date();
        const trendBulanan = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const count = allAspirasi.filter(a => { const aDate = new Date(a.createdAt); return aDate.getFullYear() === d.getFullYear() && aDate.getMonth() === d.getMonth(); }).length;
            trendBulanan.push({ bulan: `${d.toLocaleString('id-ID', { month: 'short' })} ${d.getFullYear()}`, jumlah: count });
        }
        const selesaiList = allAspirasi.filter(a => a.status === 'selesai' && a.completedAt);
        let rataWaktuSelesaiHari = 0;
        if (selesaiList.length > 0) {
            const totalMs = selesaiList.reduce((acc, a) => acc + (new Date(a.completedAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime()), 0);
            rataWaktuSelesaiHari = Math.round(totalMs / selesaiList.length / 86400000);
        }
        const thisMonth = allAspirasi.filter(a => { const d = new Date(a.createdAt); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); }).length;
        return res.json({
            total, totalSelesai: statusMap['selesai'] || 0, totalBulanIni: thisMonth, rataWaktuSelesaiHari,
            byKategori: Object.entries(kategoriMap).sort((a, b) => b[1] - a[1]).map(([kategori, jumlah]) => ({ kategori, jumlah })),
            byStatus: Object.entries(statusMap).map(([status, jumlah]) => ({ status, jumlah })),
            byDapil, byKabupaten, trendBulanan,
        });
    }
    catch (err) {
        console.error("Error fetching aspirasi analitik:", err);
        return res.status(500).json({ error: "Gagal mengambil data analitik aspirasi: " + err.message });
    }
}));
// 4b. GET /api/aspirasi/export-excel — HARUS sebelum /:id
router.get('/aspirasi/export-excel', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || (user.role !== 'admin' && user.role !== 'dewan')) {
            return res.status(403).json({ error: "Akses ditolak." });
        }
        const { startDate, endDate, status, kategori, dapil } = req.query;
        const where = {};
        if (startDate && typeof startDate === 'string')
            where.createdAt = Object.assign(Object.assign({}, where.createdAt), { gte: new Date(startDate) });
        if (endDate && typeof endDate === 'string') {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            where.createdAt = Object.assign(Object.assign({}, where.createdAt), { lte: end });
        }
        if (status && typeof status === 'string' && status !== 'all')
            where.status = status;
        if (kategori && typeof kategori === 'string' && kategori !== 'all')
            where.kategori = kategori;
        if (dapil && typeof dapil === 'string' && dapil !== 'all')
            where.dapil = { contains: dapil, mode: 'insensitive' };
        if (user.role === 'dewan') {
            const dewanUser = yield prisma_1.prisma.user.findUnique({ where: { id: user.id }, select: { dapil: true } });
            if (dewanUser === null || dewanUser === void 0 ? void 0 : dewanUser.dapil)
                where.dapil = { contains: dewanUser.dapil.split('(')[0].trim(), mode: 'insensitive' };
        }
        const aspirasiList = yield prisma_1.prisma.aspirasi.findMany({
            where, orderBy: { createdAt: 'desc' },
            include: {
                masyarakat: { select: { name: true, email: true, kabupaten: true, kecamatan: true, noWhatsapp: true } },
                dewan: { select: { name: true, fraksi: true, dapil: true } },
            }
        });
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'HUDANG - DPRD Provinsi Jawa Barat';
        workbook.created = new Date();
        const rekapSheet = workbook.addWorksheet('Rekap Analitik');
        rekapSheet.mergeCells('A1:D1');
        rekapSheet.getCell('A1').value = 'REKAP ANALITIK E-ASPIRASI – DPRD PROVINSI JAWA BARAT';
        rekapSheet.getCell('A1').font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
        rekapSheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B21A8' } };
        rekapSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
        rekapSheet.getRow(1).height = 30;
        rekapSheet.mergeCells('A2:D2');
        rekapSheet.getCell('A2').value = `Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })} | Total: ${aspirasiList.length}`;
        rekapSheet.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF6B7280' } };
        rekapSheet.getCell('A2').alignment = { horizontal: 'center' };
        rekapSheet.getCell('A4').value = 'Rekap per Kategori';
        rekapSheet.getCell('A4').font = { bold: true, size: 11 };
        rekapSheet.addRow(['Kategori', 'Jumlah', 'Persentase', '']);
        const katMap = {};
        aspirasiList.forEach(a => { const k = a.kategori || 'Lainnya'; katMap[k] = (katMap[k] || 0) + 1; });
        Object.entries(katMap).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => { rekapSheet.addRow([k, v, aspirasiList.length > 0 ? `${((v / aspirasiList.length) * 100).toFixed(1)}%` : '0%', '']); });
        rekapSheet.addRow([]);
        const stRow = rekapSheet.rowCount + 1;
        rekapSheet.getCell(`A${stRow}`).value = 'Rekap per Status';
        rekapSheet.getCell(`A${stRow}`).font = { bold: true, size: 11 };
        rekapSheet.addRow(['Status', 'Jumlah', 'Persentase', '']);
        const stMap = {};
        aspirasiList.forEach(a => { stMap[a.status] = (stMap[a.status] || 0) + 1; });
        Object.entries(stMap).forEach(([s, v]) => { rekapSheet.addRow([s, v, aspirasiList.length > 0 ? `${((v / aspirasiList.length) * 100).toFixed(1)}%` : '0%', '']); });
        rekapSheet.columns = [{ key: 'a', width: 30 }, { key: 'b', width: 12 }, { key: 'c', width: 14 }, { key: 'd', width: 10 }];
        const detailSheet = workbook.addWorksheet('Data Aspirasi');
        const hRow = detailSheet.addRow(['No', 'No. Tiket', 'Judul Aspirasi', 'Kategori', 'Dapil', 'Kabupaten/Kota', 'Kecamatan', 'Status', 'Nama Pemohon', 'Email Pemohon', 'WhatsApp', 'Anggota Dewan', 'Fraksi', 'Tgl Diajukan', 'Tgl Selesai', 'Deskripsi']);
        hRow.eachCell((cell) => { cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4C1D95' } }; cell.alignment = { horizontal: 'center', vertical: 'middle' }; });
        detailSheet.getRow(1).height = 28;
        const stLabels = { diajukan: 'Diajukan', verifikasi: 'Verifikasi', diteruskan: 'Diteruskan', tindak_lanjut: 'Tindak Lanjut', selesai: 'Selesai', ditolak: 'Ditolak' };
        aspirasiList.forEach((a, i) => {
            var _a, _b, _c, _d, _e;
            const row = detailSheet.addRow([i + 1, a.ticketNumber, a.judul, a.kategori || '-', a.dapil || '-', a.kabupatenKota || '-', a.kecamatan || '-', stLabels[a.status] || a.status, ((_a = a.masyarakat) === null || _a === void 0 ? void 0 : _a.name) || '-', ((_b = a.masyarakat) === null || _b === void 0 ? void 0 : _b.email) || '-', ((_c = a.masyarakat) === null || _c === void 0 ? void 0 : _c.noWhatsapp) || '-', ((_d = a.dewan) === null || _d === void 0 ? void 0 : _d.name) || '-', ((_e = a.dewan) === null || _e === void 0 ? void 0 : _e.fraksi) || '-', a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('id-ID') : '-', a.completedAt ? new Date(a.completedAt).toLocaleDateString('id-ID') : '-', a.deskripsi || '-']);
            if (i % 2 === 0)
                row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F3FF' } }; });
        });
        detailSheet.columns = [{ width: 5 }, { width: 20 }, { width: 35 }, { width: 18 }, { width: 18 }, { width: 20 }, { width: 18 }, { width: 15 }, { width: 22 }, { width: 25 }, { width: 15 }, { width: 25 }, { width: 20 }, { width: 15 }, { width: 15 }, { width: 50 }];
        detailSheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 16 } };
        const fileName = `Rekap_EAspirasi_${new Date().toISOString().slice(0, 10)}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        yield workbook.xlsx.write(res);
        return res.end();
    }
    catch (err) {
        console.error("Error exporting aspirasi Excel:", err);
        return res.status(500).json({ error: "Gagal mengekspor data Excel: " + err.message });
    }
}));
// 4. GET /api/aspirasi/:id (Detail Aspirasi)
router.get('/aspirasi/:id', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID aspirasi tidak valid." });
        }
        const aspirasi = yield prisma_1.prisma.aspirasi.findUnique({
            where: { id },
            include: {
                masyarakat: {
                    select: { id: true, name: true, email: true, noWhatsapp: true, kabupaten: true, kecamatan: true }
                },
                dewan: {
                    select: { id: true, name: true, fraksi: true, dapil: true, jabatan: true }
                },
                timelineEvents: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        if (!aspirasi) {
            return res.status(404).json({ error: "Data aspirasi tidak ditemukan." });
        }
        return res.json(aspirasi);
    }
    catch (err) {
        console.error("Error fetching aspirasi detail:", err);
        return res.status(500).json({ error: "Gagal mengambil detail aspirasi: " + err.message });
    }
}));
// 5. PATCH /api/aspirasi/:id/status (Pembaruan Status & Log Timeline Otomatis)
router.patch('/aspirasi/:id/status', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = req.user;
        if (!user || (user.role !== 'dewan' && user.role !== 'admin')) {
            return res.status(403).json({ error: "Akses ditolak. Hanya Dewan atau Admin yang dapat memperbarui status." });
        }
        const id = Number(req.params.id);
        const { status, keterangan } = req.body;
        if (!status) {
            return res.status(400).json({ error: "Status baru wajib ditentukan." });
        }
        // Tentukan tahap timeline dan aktor
        let tahap = "Pembaruan Status";
        let defaultKeterangan = "Status aspirasi diperbarui.";
        let aktor = user.role === 'dewan' ? "Anggota Dewan" : "Sekretariat DPRD";
        if (status === 'verifikasi') {
            tahap = "Verifikasi Administrasi";
            defaultKeterangan = "Berkas materi dan kelengkapan administrasi telah diverifikasi oleh Sekretariat DPRD.";
            aktor = "Sekretariat DPRD";
        }
        else if (status === 'diteruskan') {
            tahap = "Diteruskan ke Meja Dewan";
            defaultKeterangan = "Aspirasi telah diteruskan ke Anggota Dewan pada Daerah Pemilihan (Dapil) terkait.";
            aktor = "Sekretariat DPRD";
        }
        else if (status === 'tindak_lanjut') {
            tahap = "Penelaahan & Tindak Lanjut";
            defaultKeterangan = "Aspirasi sedang ditelaah oleh Dewan untuk perumusan rekomendasi dan koordinasi OPD terkait.";
            aktor = "Anggota Dewan";
        }
        else if (status === 'selesai') {
            tahap = "Tuntas & Tanggapan Diterbitkan";
            defaultKeterangan = "Aspirasi telah selesai ditindaklanjuti dan tanggapan resmi kedewanan telah diterbitkan.";
            aktor = "Anggota Dewan";
        }
        else if (status === 'ditolak') {
            tahap = "Aspirasi Ditolak";
            defaultKeterangan = "Aspirasi belum dapat ditindaklanjuti karena tidak memenuhi syarat atau di luar kewenangan kedewanan.";
            aktor = "Sekretariat DPRD";
        }
        const updated = yield prisma_1.prisma.aspirasi.update({
            where: { id },
            data: {
                status,
                verifiedAt: status === 'verifikasi' ? new Date() : undefined,
                completedAt: status === 'selesai' ? new Date() : undefined,
                timelineEvents: {
                    create: [
                        {
                            tahap,
                            status: "selesai",
                            keterangan: keterangan || defaultKeterangan,
                            aktor,
                            createdAt: new Date()
                        }
                    ]
                }
            },
            include: {
                masyarakat: {
                    select: { id: true, name: true, email: true, noWhatsapp: true, kabupaten: true, kecamatan: true }
                },
                dewan: {
                    select: { id: true, name: true, fraksi: true, dapil: true, jabatan: true }
                },
                timelineEvents: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        const io = req.app.get('io');
        if (io) {
            io.emit('aspirasi:updated', { aspirasi: updated });
        }
        // Kirim notifikasi surel ke masyarakat pemohon
        if ((_a = updated.masyarakat) === null || _a === void 0 ? void 0 : _a.email) {
            (0, emailService_1.sendAspirasiStatusUpdateEmail)({
                to: updated.masyarakat.email,
                recipientName: updated.masyarakat.name,
                ticketNumber: updated.ticketNumber,
                judulAspirasi: updated.judul,
                dapil: updated.dapil,
                newStatus: status,
                keterangan: keterangan || defaultKeterangan,
                aktor
            }).catch(err => console.error("[EmailService] Gagal mengirim surel status:", err));
        }
        return res.json(updated);
    }
    catch (err) {
        console.error("Error updating aspirasi status:", err);
        return res.status(500).json({ error: "Gagal memperbarui status aspirasi: " + err.message });
    }
}));
// 6. POST /api/aspirasi/:id/tanggapan (Tanggapan Resmi Dewan & Catatan Tindak Lanjut)
router.post('/aspirasi/:id/tanggapan', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const user = req.user;
        if (!user || (user.role !== 'dewan' && user.role !== 'admin')) {
            return res.status(403).json({ error: "Akses ditolak. Hanya Dewan atau Admin yang dapat memberikan tanggapan." });
        }
        const id = Number(req.params.id);
        const { tanggapanDewan, suratTanggapanUrl, status = 'selesai' } = req.body;
        if (!tanggapanDewan) {
            return res.status(400).json({ error: "Teks tanggapan resmi wajib diisi." });
        }
        const responderName = user.role === 'dewan' ? `Anggota Dewan (${user.email})` : 'Sekretariat DPRD Jawa Barat';
        const updated = yield prisma_1.prisma.aspirasi.update({
            where: { id },
            data: {
                tanggapanDewan,
                tanggapanOleh: responderName,
                tanggapanAt: new Date(),
                suratTanggapanUrl: suratTanggapanUrl || null,
                status,
                completedAt: status === 'selesai' ? new Date() : undefined,
                timelineEvents: {
                    create: [
                        {
                            tahap: "Tanggapan Resmi Kedewanan",
                            status: "selesai",
                            keterangan: tanggapanDewan,
                            aktor: user.role === 'dewan' ? "Anggota Dewan" : "Sekretariat DPRD",
                            createdAt: new Date()
                        }
                    ]
                }
            },
            include: {
                masyarakat: {
                    select: { id: true, name: true, email: true, noWhatsapp: true, kabupaten: true, kecamatan: true }
                },
                dewan: {
                    select: { id: true, name: true, fraksi: true, dapil: true, jabatan: true }
                },
                timelineEvents: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        const io = req.app.get('io');
        if (io) {
            io.emit('aspirasi:updated', { aspirasi: updated });
        }
        // Kirim notifikasi surel tanggapan resmi ke masyarakat pemohon
        if ((_a = updated.masyarakat) === null || _a === void 0 ? void 0 : _a.email) {
            (0, emailService_1.sendAspirasiResponseEmail)({
                to: updated.masyarakat.email,
                recipientName: updated.masyarakat.name,
                ticketNumber: updated.ticketNumber,
                judulAspirasi: updated.judul,
                dapil: updated.dapil,
                status: updated.status,
                tanggapanDewan,
                dewanName: (_b = updated.dewan) === null || _b === void 0 ? void 0 : _b.name,
                dewanFraksi: ((_c = updated.dewan) === null || _c === void 0 ? void 0 : _c.fraksi) || undefined
            }).catch(err => console.error("[EmailService] Gagal mengirim surel tanggapan:", err));
        }
        return res.json(updated);
    }
    catch (err) {
        console.error("Error submitting tanggapan aspirasi:", err);
        return res.status(500).json({ error: "Gagal menyimpan tanggapan aspirasi: " + err.message });
    }
}));
// 7. POST /api/aspirasi/:id/analisis-ai (Penelaahan Proposal oleh Tenaga Ahli AI On-Demand)
router.post('/aspirasi/:id/analisis-ai', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID aspirasi tidak valid." });
        }
        const result = yield (0, aspirasiAiService_1.analyzeAspirasiProposal)(id);
        const updated = yield prisma_1.prisma.aspirasi.findUnique({
            where: { id },
            include: {
                masyarakat: {
                    select: { id: true, name: true, email: true, noWhatsapp: true, kabupaten: true, kecamatan: true }
                },
                dewan: {
                    select: { id: true, name: true, fraksi: true, dapil: true, jabatan: true }
                },
                timelineEvents: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        const io = req.app.get('io');
        if (io) {
            io.emit('aspirasi:updated', { aspirasi: updated });
        }
        return res.json({
            message: "Analisis Tenaga Ahli AI untuk proposal berhasil dilaksanakan.",
            result,
            aspirasi: updated
        });
    }
    catch (err) {
        console.error("Error running AI analysis:", err);
        return res.status(500).json({ error: "Gagal memproses telaah AI: " + err.message });
    }
}));
exports.default = router;
