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
const livekit_server_sdk_1 = require("livekit-server-sdk");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = require("express-rate-limit");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hubSync_1 = require("./services/hubSync");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';
// Trust proxy for accurate rate limiting (Nginx)
app.set('trust proxy', 1);
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use(limiter);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: "Akses ditolak. Token tidak ditemukan." });
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.status(403).json({ error: "Token tidak valid atau kedaluwarsa." });
        req.user = user;
        next();
    });
};
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Anda tidak memiliki izin untuk akses ini." });
        }
        next();
    };
};
// Database connection
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Mencoba menghubungkan ke database...");
    try {
        yield prisma.$connect();
        console.log("Database berhasil terhubung.");
    }
    catch (err) {
        console.error("Gagal menghubungkan ke database:");
        console.error(err);
    }
});
connectDB();
// --- AUTH ROUTES ---
app.post('/api/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: "Pengguna tidak ditemukan." });
        // If no passwordHash set (legacy user), allow login for now OR handle it
        if (user.passwordHash) {
            const validPassword = yield bcryptjs_1.default.compare(password, user.passwordHash);
            if (!validPassword)
                return res.status(401).json({ error: "Password salah." });
        }
        else {
            // For demo/dev purposes where seed didn't hash: 
            // In production, we should force password reset or use a migration script
            if (password !== 'password')
                return res.status(401).json({ error: "Password salah (Legacy Check)." });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Gagal memproses login." });
    }
}));
// Simple Register for demo
app.post('/api/auth/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = req.body;
    try {
        const salt = yield bcryptjs_1.default.genSalt(10);
        const passwordHash = yield bcryptjs_1.default.hash(password, salt);
        const user = yield prisma.user.create({
            data: { name, email, passwordHash, role: role || 'masyarakat' }
        });
        res.status(201).json({ message: "Registrasi berhasil", userId: user.id });
    }
    catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Gagal mendaftarkan pengguna (Email mungkin sudah terdaftar)." });
    }
}));
// --- API ROUTES ---
// 1. List all Dewan with Availability (Public)
app.get('/api/dewan', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma.user.findMany({
            where: { role: 'dewan' },
            include: {
                availabilities: true,
                ratingsAsDewan: true
            }
        });
        const dewanWithDetails = result.map((d) => {
            let avg = 4.5;
            if (d.ratingsAsDewan.length > 0) {
                const totalScores = d.ratingsAsDewan.reduce((acc, r) => acc + (r.speakingScore + r.contextScore + r.timeScore) / 3, 0);
                avg = totalScores / d.ratingsAsDewan.length;
            }
            return {
                id: d.id,
                name: d.name,
                bio: d.bio || "Tidak ada biodata.",
                rating: avg,
                availabilities: d.availabilities
            };
        });
        res.json(dewanWithDetails);
    }
    catch (err) {
        console.error("Error fetching dewan:", err);
        res.status(500).json({ error: "Gagal mengambil daftar dewan" });
    }
}));
// 2. Set Availability (Dewan only)
app.post('/api/availability', authenticateToken, authorizeRole(['dewan', 'admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { start_time, end_time } = req.body;
    const dewan_id = req.user.id;
    try {
        const result = yield prisma.availability.create({
            data: {
                dewanId: dewan_id,
                startTime: new Date(start_time),
                endTime: new Date(end_time),
            }
        });
        res.status(201).json(result);
    }
    catch (err) {
        console.error("Error creating availability:", err);
        res.status(500).json({ error: "Gagal membuat ketersediaan waktu" });
    }
}));
// 3. Schedule a meeting (Protected)
app.post('/api/schedules', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dewan_id, start_time, title } = req.body;
    const masyarakat_id = req.user.id; // Current logged in user is the 'masyarakat'
    const requestedTime = new Date(start_time);
    try {
        const availability = yield prisma.availability.findFirst({
            where: {
                dewanId: Number(dewan_id),
                startTime: { lte: requestedTime },
                endTime: { gte: requestedTime }
            }
        });
        if (!availability) {
            return res.status(400).json({ error: "Waktu ini tidak tersedia untuk Dewan tersebut" });
        }
        const conflict = yield prisma.schedule.findFirst({
            where: {
                dewanId: Number(dewan_id),
                startTime: requestedTime,
                status: { in: ['pending', 'confirmed'] }
            }
        });
        if (conflict) {
            return res.status(400).json({ error: "Waktu ini sudah dipesan oleh orang lain" });
        }
        const result = yield prisma.schedule.create({
            data: {
                title: title || "Diskusi Aspirasi",
                dewanId: Number(dewan_id),
                masyarakatId: masyarakat_id,
                startTime: requestedTime,
            }
        });
        res.status(201).json(result);
    }
    catch (err) {
        console.error("Error creating schedule:", err);
        res.status(500).json({ error: "Gagal membuat jadwal pertemuan" });
    }
}));
// 4. Get Schedules (Protected - Context sensitive)
app.get('/api/schedules', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role, id: userId } = req.user;
    try {
        const where = {};
        if (role === 'dewan')
            where.dewanId = userId;
        if (role === 'masyarakat')
            where.masyarakatId = userId;
        // If admin, they see everything (where stays empty)
        const result = yield prisma.schedule.findMany({
            where,
            orderBy: { startTime: 'desc' },
            include: {
                dewan: { select: { name: true } },
                masyarakat: { select: { name: true } },
                rating: true
            }
        });
        res.json(result);
    }
    catch (err) {
        console.error("Error fetching schedules:", err);
        res.status(500).json({ error: "Gagal mengambil data jadwal" });
    }
}));
// 5. Update Schedule Status (Dewan/Admin only)
app.patch('/api/schedules/:id', authenticateToken, authorizeRole(['dewan', 'admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = yield prisma.schedule.update({
            where: { id: Number(id) },
            data: { status }
        });
        res.json(result);
    }
    catch (err) {
        console.error("Error updating schedule:", err);
        res.status(500).json({ error: "Gagal memperbarui status jadwal" });
    }
}));
// 6. Master Hub Sync (Admin only)
app.post('/api/admin/sync-centre', authenticateToken, authorizeRole(['admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, hubSync_1.syncHubData)();
    if (result.success) {
        res.json({ message: "Sinkronisasi dengan Master Hub berhasil.", members_processed: result.processed });
    }
    else {
        res.status(500).json({ error: `Gagal sinkronisasi: ${result.error}` });
    }
}));
// 7. Submit Multi-Aspect Rating (Masyarakat only)
app.post('/api/ratings', authenticateToken, authorizeRole(['masyarakat']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { schedule_id, dewan_id, speaking_score, context_score, time_score, responsiveness_score, solution_score, comment } = req.body;
    try {
        const result = yield prisma.rating.create({
            data: {
                schedule: { connect: { id: Number(schedule_id) } },
                dewan: { connect: { id: Number(dewan_id) } },
                speakingScore: Number(speaking_score),
                contextScore: Number(context_score),
                timeScore: Number(time_score),
                responsivenessScore: Number(responsiveness_score) || 0,
                solutionScore: Number(solution_score) || 0,
                comment
            }
        });
        res.status(201).json(result);
    }
    catch (err) {
        console.error("Error submitting rating:", err);
        res.status(500).json({ error: "Gagal mengirim penilaian" });
    }
}));
// 8. Admin Stats (Admin only)
app.get('/api/admin/stats', authenticateToken, authorizeRole(['admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [totalUsers, totalMeetings, ratings] = yield Promise.all([
            prisma.user.count(),
            prisma.schedule.count(),
            prisma.rating.findMany()
        ]);
        let avgRating = 0;
        if (ratings.length > 0) {
            const totalScore = ratings.reduce((acc, r) => {
                const avg = (r.speakingScore + r.contextScore + r.timeScore + r.responsivenessScore + r.solutionScore) / 5;
                return acc + avg;
            }, 0);
            avgRating = Math.round((totalScore / ratings.length) * 10) / 10;
        }
        res.json({ totalUsers, totalMeetings, avgRating, totalRatings: ratings.length });
    }
    catch (err) {
        console.error("Error fetching admin stats:", err);
        res.status(500).json({ error: "Gagal mengambil statistik" });
    }
}));
// 9. Admin - All Ratings (Admin only)
app.get('/api/admin/ratings', authenticateToken, authorizeRole(['admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ratings = yield prisma.rating.findMany({
            orderBy: { id: 'desc' },
            include: {
                dewan: { select: { id: true, name: true, fraksi: true } },
                schedule: {
                    include: {
                        masyarakat: { select: { name: true } }
                    }
                }
            }
        });
        const formatted = ratings.map((r) => {
            var _a, _b, _c, _d, _e, _f;
            return ({
                id: r.id,
                dewanId: r.dewanId,
                dewanName: ((_a = r.dewan) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
                dewanFraksi: ((_b = r.dewan) === null || _b === void 0 ? void 0 : _b.fraksi) || '-',
                masyarakatName: ((_d = (_c = r.schedule) === null || _c === void 0 ? void 0 : _c.masyarakat) === null || _d === void 0 ? void 0 : _d.name) || 'N/A',
                meetingTitle: ((_e = r.schedule) === null || _e === void 0 ? void 0 : _e.title) || 'N/A',
                meetingDate: (_f = r.schedule) === null || _f === void 0 ? void 0 : _f.startTime,
                speakingScore: r.speakingScore,
                contextScore: r.contextScore,
                timeScore: r.timeScore,
                responsivenessScore: r.responsivenessScore,
                solutionScore: r.solutionScore,
                avgScore: Math.round(((r.speakingScore + r.contextScore + r.timeScore + r.responsivenessScore + r.solutionScore) / 5) * 10) / 10,
                comment: r.comment,
            });
        });
        res.json(formatted);
    }
    catch (err) {
        console.error("Error fetching admin ratings:", err);
        res.status(500).json({ error: "Gagal mengambil data penilaian" });
    }
}));
// 10. Centre Performance Pull (M2M - Shared Secret Auth)
app.get('/api/centre/performance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const secret = req.headers['x-centre-pull-secret'];
    const expectedSecret = process.env.CENTRE_PULL_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
        return res.status(403).json({ error: "Akses ditolak. Secret tidak valid." });
    }
    try {
        const [totalMeetings, allRatings, dewanUsers] = yield Promise.all([
            prisma.schedule.count(),
            prisma.rating.findMany({
                include: {
                    dewan: { select: { id: true, name: true, nip: true, fraksi: true, jabatan: true, dapil: true } }
                }
            }),
            prisma.user.findMany({
                where: { role: 'dewan' },
                select: { id: true, name: true, nip: true, fraksi: true, jabatan: true, dapil: true }
            })
        ]);
        // Aggregate scores per dewan
        const performanceMap = {};
        // Initialize all dewan (even those with zero ratings)
        for (const d of dewanUsers) {
            performanceMap[d.id] = {
                dewanId: d.id, name: d.name, nip: d.nip, fraksi: d.fraksi,
                jabatan: d.jabatan, dapil: d.dapil,
                meetingCount: 0, totalRatings: 0,
                speaking: 0, context: 0, time: 0, responsiveness: 0, solution: 0
            };
        }
        // Sum scores
        for (const r of allRatings) {
            const p = performanceMap[r.dewanId];
            if (p) {
                p.totalRatings++;
                p.speaking += r.speakingScore;
                p.context += r.contextScore;
                p.time += r.timeScore;
                p.responsiveness += r.responsivenessScore;
                p.solution += r.solutionScore;
            }
        }
        // Count completed meetings per dewan
        const completedSchedules = yield prisma.schedule.groupBy({
            by: ['dewanId'],
            where: { status: { in: ['completed', 'confirmed'] } },
            _count: true
        });
        for (const s of completedSchedules) {
            if (performanceMap[s.dewanId]) {
                performanceMap[s.dewanId].meetingCount = s._count;
            }
        }
        // Format output
        const dewanPerformance = Object.values(performanceMap).map(p => {
            const n = p.totalRatings || 1; // avoid div by zero
            const avgScore = p.totalRatings > 0
                ? Math.round(((p.speaking + p.context + p.time + p.responsiveness + p.solution) / (5 * p.totalRatings)) * 100) / 100
                : 0;
            return {
                dewanId: p.dewanId,
                name: p.name,
                nip: p.nip || '',
                fraksi: p.fraksi || '',
                jabatan: p.jabatan || '',
                dapil: p.dapil || '',
                meetingCount: p.meetingCount,
                totalRatings: p.totalRatings,
                avgScore,
                scores: {
                    speaking: p.totalRatings > 0 ? Math.round((p.speaking / n) * 100) / 100 : 0,
                    context: p.totalRatings > 0 ? Math.round((p.context / n) * 100) / 100 : 0,
                    time: p.totalRatings > 0 ? Math.round((p.time / n) * 100) / 100 : 0,
                    responsiveness: p.totalRatings > 0 ? Math.round((p.responsiveness / n) * 100) / 100 : 0,
                    solution: p.totalRatings > 0 ? Math.round((p.solution / n) * 100) / 100 : 0,
                }
            };
        });
        // Global stats
        let globalAvg = 0;
        if (allRatings.length > 0) {
            const total = allRatings.reduce((acc, r) => acc + (r.speakingScore + r.contextScore + r.timeScore + r.responsivenessScore + r.solutionScore) / 5, 0);
            globalAvg = Math.round((total / allRatings.length) * 10) / 10;
        }
        res.json({
            stats: {
                totalMeetings,
                totalRatings: allRatings.length,
                avgRating: globalAvg,
                totalDewan: dewanUsers.length,
            },
            dewanPerformance,
            pulledAt: new Date().toISOString()
        });
    }
    catch (err) {
        console.error("Error fetching centre performance data:", err);
        res.status(500).json({ error: "Gagal mengambil data performa." });
    }
}));
// --- LIVEKIT REST ENDPOINTS ---
app.post('/api/livekit/token', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomName } = req.body;
    const participantName = req.user.email; // Use email as unique identity
    if (!roomName) {
        return res.status(400).json({ error: "roomName is required" });
    }
    try {
        const at = new livekit_server_sdk_1.AccessToken(process.env.LIVEKIT_API_KEY || 'devkey', process.env.LIVEKIT_API_SECRET || 'secretkey', {
            identity: participantName,
            name: req.user.role.toUpperCase() + ": " + participantName.split('@')[0],
        });
        at.addGrant({ roomJoin: true, room: roomName });
        const token = yield at.toJwt();
        res.json({ token });
    }
    catch (error) {
        console.error("Error generating LiveKit token:", error);
        res.status(500).json({ error: "Failed to generate token" });
    }
}));
// --- SOCKET.IO (Removed legacy WebRTC signaling) ---
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
        methods: ['GET', 'POST']
    }
});
io.on('connection', (socket) => {
    console.log('User connected via Socket.io:', socket.id);
    // Add real-time notifications here late if needed
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
