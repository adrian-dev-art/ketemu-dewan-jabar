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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = require("express-rate-limit");
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // set `RateLimit` and `RateLimit-Policy` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});
// Apply the rate limiting middleware to all requests.
app.use(limiter);
const server = http_1.default.createServer(app);
const prisma = new client_1.PrismaClient();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));
app.use(express_1.default.json());
// Inisialisasi Database dengan penanganan error yang lebih baik
const seedDB = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Mencoba menghubungkan ke database...");
    try {
        yield prisma.$connect();
        // Buat data Dewan
        yield prisma.user.upsert({
            where: { email: 'ahmad@dewan.id' },
            update: {},
            create: { name: 'Ahmad Kurniawan', role: 'dewan', email: 'ahmad@dewan.id', bio: 'Wakil Rakyat Dapil A - Fokus pada infrastruktur.' }
        });
        yield prisma.user.upsert({
            where: { email: 'siti@dewan.id' },
            update: {},
            create: { name: 'Siti Aminah', role: 'dewan', email: 'siti@dewan.id', bio: 'Wakil Rakyat Dapil B - Fokus pada pendidikan dan kesehatan.' }
        });
        // Buat data Masyarakat untuk keperluan demo (ID 101)
        yield prisma.user.upsert({
            where: { email: 'masyarakat@demo.id' },
            update: {},
            create: { id: 101, name: 'User Demo Masyarakat', role: 'masyarakat', email: 'masyarakat@demo.id' }
        });
        console.log("Database berhasil terhubung dan diinisialisasi.");
    }
    catch (err) {
        console.error("Gagal melakukan inisialisasi database:");
        console.error(err);
    }
});
// Berikan jeda 2 detik agar kontainer DB punya waktu untuk siap sepenuhnya
setTimeout(seedDB, 2000);
// --- API ROUTES ---
// 1. List all Dewan
app.get('/api/dewan', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma.user.findMany({
            where: { role: 'dewan' },
            include: {
                ratingsAsDewan: {
                    select: { rating: true }
                }
            }
        });
        const dewanWithAvg = result.map((d) => {
            const sum = d.ratingsAsDewan.reduce((acc, r) => acc + r.rating, 0);
            const avg = d.ratingsAsDewan.length > 0 ? sum / d.ratingsAsDewan.length : 4.5;
            return {
                id: d.id,
                name: d.name,
                bio: d.bio || "Tidak ada biodata.",
                rating: avg
            };
        });
        res.json(dewanWithAvg);
    }
    catch (err) {
        console.error("Error fetching dewan:", err);
        res.status(500).json({ error: "Gagal mengambil daftar dewan" });
    }
}));
// 2. Schedule a meeting
app.post('/api/schedules', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dewan_id, masyarakat_id, start_time } = req.body;
    try {
        const result = yield prisma.schedule.create({
            data: {
                dewanId: Number(dewan_id),
                masyarakatId: Number(masyarakat_id),
                startTime: new Date(start_time),
            }
        });
        res.status(201).json(result);
    }
    catch (err) {
        console.error("Error creating schedule:", err);
        res.status(500).json({ error: "Gagal membuat jadwal pertemuan" });
    }
}));
// 3. Get Schedules
app.get('/api/schedules', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role, userId } = req.query;
    try {
        const where = {};
        // Validasi ID jika ada
        if (userId) {
            const parsedId = Number(userId);
            if (isNaN(parsedId)) {
                return res.status(400).json({ error: "ID pengguna tidak valid" });
            }
            if (role === 'dewan')
                where.dewanId = parsedId;
            if (role === 'masyarakat')
                where.masyarakatId = parsedId;
        }
        const result = yield prisma.schedule.findMany({
            where,
            orderBy: { startTime: 'desc' }
        });
        const mapped = result.map((s) => ({
            id: s.id,
            dewan_id: s.dewanId,
            masyarakat_id: s.masyarakatId,
            start_time: s.startTime,
            status: s.status
        }));
        res.json(mapped);
    }
    catch (err) {
        console.error("Error fetching schedules:", err);
        res.status(500).json({ error: "Gagal mengambil data jadwal" });
    }
}));
// 4. Update Schedule Status
app.patch('/api/schedules/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = yield prisma.schedule.update({
            where: { id: Number(id) },
            data: { status }
        });
        res.json({
            id: result.id,
            status: result.status
        });
    }
    catch (err) {
        console.error("Error updating schedule:", err);
        res.status(500).json({ error: "Gagal memperbarui status jadwal" });
    }
}));
// 5. Submit Rating
app.post('/api/ratings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { schedule_id, dewan_id, rating, comment } = req.body;
    try {
        const result = yield prisma.rating.create({
            data: {
                scheduleId: Number(schedule_id),
                dewanId: Number(dewan_id),
                rating: Number(rating),
                comment
            }
        });
        res.status(201).json(result);
    }
    catch (err) {
        console.error("Error submitting rating:", err);
        res.status(500).json({ error: "Gagal mengirim penilaian. Anda mungkin sudah menilai pertemuan ini." });
    }
}));
// --- SOCKET.IO ---
const io = new socket_io_1.Server(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});
io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId, socket.id);
        socket.on('disconnect', () => socket.to(roomId).emit('user-disconnected', socket.id));
    });
    socket.on('offer', (p) => io.to(p.target).emit('offer', p));
    socket.on('answer', (p) => io.to(p.target).emit('answer', p));
    socket.on('ice-candidate', (p) => io.to(p.target).emit('ice-candidate', p));
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
