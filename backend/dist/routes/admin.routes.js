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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const hubSync_1 = require("../services/hubSync");
const followup_routes_1 = require("./followup.routes");
const router = (0, express_1.Router)();
// GET /api/system/info (Public)
router.get('/system/info', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield prisma_1.prisma.systemSetting.findMany({
            where: {
                key: { in: ['app_name', 'app_logo', 'app_description'] }
            }
        });
        const result = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(result);
    }
    catch (err) {
        console.error("Error fetching system info:", err);
        res.status(500).json({ error: "Gagal mengambil info sistem" });
    }
}));
// GET /api/centre/performance (M2M Auth)
router.get('/centre/performance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const secret = req.headers['x-centre-pull-secret'];
    const expectedSecret = process.env.CENTRE_PULL_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
        return res.status(403).json({ error: "Akses ditolak. Secret tidak valid." });
    }
    try {
        const [totalMeetings, allRatings, dewanUsers] = yield Promise.all([
            prisma_1.prisma.schedule.count(),
            prisma_1.prisma.rating.findMany({
                include: {
                    dewan: { select: { id: true, name: true, nip: true, fraksi: true, jabatan: true, dapil: true } }
                }
            }),
            prisma_1.prisma.user.findMany({
                where: { role: 'dewan' },
                select: { id: true, name: true, nip: true, fraksi: true, jabatan: true, dapil: true }
            })
        ]);
        const performanceMap = {};
        for (const d of dewanUsers) {
            performanceMap[d.id] = {
                dewanId: d.id,
                name: d.name,
                nip: d.nip,
                fraksi: d.fraksi,
                jabatan: d.jabatan,
                dapil: d.dapil,
                meetingCount: 0,
                totalRatings: 0,
                speaking: 0,
                context: 0,
                time: 0,
                responsiveness: 0,
                solution: 0
            };
        }
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
        const completedSchedules = yield prisma_1.prisma.scheduleParticipant.groupBy({
            by: ['dewanId'],
            where: { status: { in: ['completed', 'confirmed'] } },
            _count: true
        });
        for (const s of completedSchedules) {
            if (performanceMap[s.dewanId]) {
                performanceMap[s.dewanId].meetingCount = s._count;
            }
        }
        const dewanPerformance = Object.values(performanceMap).map((p) => {
            const n = p.totalRatings || 1;
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
// Admin Authentication Required Routes below:
router.use(auth_middleware_1.authenticateToken);
router.use((0, auth_middleware_1.authorizeRole)(['admin']));
// GET /api/admin/stats
router.get('/admin/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [totalUsers, totalMeetings, ratings] = yield Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.schedule.count(),
            prisma_1.prisma.rating.findMany()
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
// GET /api/admin/ratings
router.get('/admin/ratings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ratings = yield prisma_1.prisma.rating.findMany({
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
// GET /api/admin/users
router.get('/admin/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.prisma.user.findMany({
            orderBy: { id: 'desc' },
            select: {
                id: true, name: true, email: true, role: true, bio: true,
                nip: true, fraksi: true, jabatan: true, dapil: true,
                noKtp: true, instansi: true, isSync: true
            }
        });
        res.json(users);
    }
    catch (err) {
        console.error("Error fetching admin users:", err);
        res.status(500).json({ error: "Gagal mengambil data pengguna" });
    }
}));
// PATCH /api/admin/users/:id
router.patch('/admin/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const _a = req.body, { password } = _a, otherData = __rest(_a, ["password"]);
    try {
        const updateData = Object.assign({}, otherData);
        if (password) {
            const salt = yield bcryptjs_1.default.genSalt(10);
            updateData.passwordHash = yield bcryptjs_1.default.hash(password, salt);
        }
        const updated = yield prisma_1.prisma.user.update({
            where: { id },
            data: updateData
        });
        res.json({ message: "Pengguna berhasil diperbarui", user: { id: updated.id, email: updated.email } });
    }
    catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: "Gagal memperbarui pengguna" });
    }
}));
// DELETE /api/admin/users/:id
router.delete('/admin/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        yield prisma_1.prisma.user.delete({ where: { id } });
        res.json({ message: "Pengguna berhasil dihapus" });
    }
    catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Gagal menghapus pengguna" });
    }
}));
// GET /api/admin/schedules
router.get('/admin/schedules', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schedules = yield prisma_1.prisma.schedule.findMany({
            orderBy: { startTime: 'desc' },
            include: {
                masyarakat: { select: { id: true, name: true, email: true, kabupaten: true, kecamatan: true } },
                participants: {
                    include: {
                        dewan: { select: { id: true, name: true, fraksi: true } }
                    }
                },
                followUps: true
            }
        });
        const formatted = schedules.map((s) => {
            var _a, _b;
            return (Object.assign(Object.assign({}, s), { status: ((_a = s.participants[0]) === null || _a === void 0 ? void 0 : _a.status) || 'pending', followUp: ((_b = s.followUps) === null || _b === void 0 ? void 0 : _b[0]) || followup_routes_1.memoryFollowUps[s.id] || null }));
        });
        res.json(formatted);
    }
    catch (err) {
        console.error("Error fetching admin schedules:", err);
        res.status(500).json({ error: "Gagal mengambil data jadwal" });
    }
}));
// PATCH /api/admin/schedules/:id
router.patch('/admin/schedules/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { title, startTime, status } = req.body;
    try {
        const updatedSchedule = yield prisma_1.prisma.schedule.update({
            where: { id },
            data: {
                title,
                startTime: startTime ? new Date(startTime) : undefined
            }
        });
        if (status) {
            yield prisma_1.prisma.scheduleParticipant.updateMany({
                where: { scheduleId: id },
                data: { status }
            });
        }
        res.json({ message: "Jadwal berhasil diperbarui", schedule: updatedSchedule });
    }
    catch (err) {
        console.error("Error updating schedule:", err);
        res.status(500).json({ error: "Gagal memperbarui jadwal" });
    }
}));
// DELETE /api/admin/schedules/:id
router.delete('/api/admin/schedules/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        yield prisma_1.prisma.schedule.delete({ where: { id } });
        res.json({ message: "Jadwal berhasil dihapus" });
    }
    catch (err) {
        console.error("Error deleting schedule:", err);
        res.status(500).json({ error: "Gagal menghapus jadwal" });
    }
}));
// POST /api/admin/schedules/:id/transcribe
router.post('/admin/schedules/:id/transcribe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const schedule = yield prisma_1.prisma.schedule.findUnique({ where: { id } });
        if (!schedule || !schedule.recordingUrl) {
            return res.status(404).json({ error: "Rekaman tidak ditemukan untuk jadwal ini" });
        }
        if (schedule.isTranscribing) {
            return res.status(400).json({ error: "Transkripsi sedang berjalan" });
        }
        let videoPath = path.join(process.cwd(), '..', schedule.recordingUrl);
        if (!fs.existsSync(videoPath)) {
            videoPath = path.join(process.cwd(), schedule.recordingUrl);
        }
        if (!fs.existsSync(videoPath) && fs.existsSync('/app')) {
            videoPath = `/app${schedule.recordingUrl}`;
        }
        if (!fs.existsSync(videoPath)) {
            const recordingsDir = path.join(process.cwd(), '..', 'recordings');
            if (fs.existsSync(recordingsDir)) {
                const files = fs.readdirSync(recordingsDir);
                const matchingFile = files.find((f) => f.startsWith(`recording_${id}_`) && f.endsWith('.mp4'));
                if (matchingFile) {
                    videoPath = path.join(recordingsDir, matchingFile);
                }
            }
        }
        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({ error: "File rekaman tidak ditemukan di server. Pastikan rekaman sudah selesai diunggah." });
        }
        yield prisma_1.prisma.schedule.update({
            where: { id },
            data: {
                isTranscribing: false,
                isAnalyzing: false,
                transcriptionStatus: null,
                transcriptionProgress: 0
            }
        });
        res.json({ message: "Transkripsi telah dimasukkan ke dalam antrean otomatis." });
    }
    catch (err) {
        console.error("Error starting transcription:", err);
        res.status(500).json({ error: "Gagal memasukkan ke antrean: " + (err.message || "Internal Error") });
    }
}));
// GET /api/admin/settings/streaming
router.get('/admin/settings/streaming', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const settings = yield prisma_1.prisma.systemSetting.findMany({
            where: {
                key: { in: ['stream_url', 'stream_key', 'is_auto_stream'] }
            }
        });
        const result = {
            stream_url: ((_a = settings.find(s => s.key === 'stream_url')) === null || _a === void 0 ? void 0 : _a.value) || '',
            stream_key: ((_b = settings.find(s => s.key === 'stream_key')) === null || _b === void 0 ? void 0 : _b.value) || '',
            is_auto_stream: ((_c = settings.find(s => s.key === 'is_auto_stream')) === null || _c === void 0 ? void 0 : _c.value) === 'true'
        };
        res.json(result);
    }
    catch (err) {
        console.error("Error fetching stream settings:", err);
        res.status(500).json({ error: "Gagal mengambil pengaturan streaming" });
    }
}));
// POST /api/admin/settings/streaming
router.post('/admin/settings/streaming', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { stream_url, stream_key, is_auto_stream } = req.body;
    try {
        yield prisma_1.prisma.$transaction([
            prisma_1.prisma.systemSetting.upsert({
                where: { key: 'stream_url' },
                update: { value: stream_url },
                create: { key: 'stream_url', value: stream_url }
            }),
            prisma_1.prisma.systemSetting.upsert({
                where: { key: 'stream_key' },
                update: { value: stream_key },
                create: { key: 'stream_key', value: stream_key }
            }),
            prisma_1.prisma.systemSetting.upsert({
                where: { key: 'is_auto_stream' },
                update: { value: String(is_auto_stream) },
                create: { key: 'is_auto_stream', value: String(is_auto_stream) }
            })
        ]);
        res.json({ message: "Pengaturan streaming berhasil diperbarui" });
    }
    catch (err) {
        console.error("Error updating stream settings:", err);
        res.status(500).json({ error: "Gagal memperbarui pengaturan streaming" });
    }
}));
// GET /api/admin/settings
router.get('/admin/settings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield prisma_1.prisma.systemSetting.findMany();
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsMap);
    }
    catch (err) {
        console.error("Error fetching all settings:", err);
        res.status(500).json({ error: "Gagal mengambil pengaturan sistem" });
    }
}));
// POST /api/admin/settings
router.post('/admin/settings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = req.body;
    try {
        const operations = Object.entries(settings).map(([key, value]) => prisma_1.prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        }));
        yield prisma_1.prisma.$transaction(operations);
        res.json({ message: "Pengaturan berhasil diperbarui" });
    }
    catch (err) {
        console.error("Error updating bulk settings:", err);
        res.status(500).json({ error: "Gagal memperbarui pengaturan" });
    }
}));
// GET /api/admin/management/export
router.get('/admin/management/export', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [users, schedules, ratings, settings] = yield Promise.all([
            prisma_1.prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, nip: true, fraksi: true, jabatan: true } }),
            prisma_1.prisma.schedule.findMany({ include: { participants: true } }),
            prisma_1.prisma.rating.findMany(),
            prisma_1.prisma.systemSetting.findMany()
        ]);
        const exportData = {
            exportedAt: new Date().toISOString(),
            users,
            schedules,
            ratings,
            settings
        };
        res.setHeader('Content-disposition', 'attachment; filename=meetdewan_export.json');
        res.setHeader('Content-type', 'application/json');
        res.status(200).send(JSON.stringify(exportData, null, 2));
    }
    catch (err) {
        console.error("Error exporting data:", err);
        res.status(500).json({ error: "Gagal mengekspor data" });
    }
}));
// POST /api/admin/management/cleanup
router.post('/admin/management/cleanup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { daysOld, type } = req.body;
    if (!daysOld || isNaN(Number(daysOld))) {
        return res.status(400).json({ error: "Parameter daysOld tidak valid" });
    }
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(daysOld));
    try {
        let deletedCount = 0;
        if (type === 'schedules' || type === 'all') {
            const result = yield prisma_1.prisma.schedule.deleteMany({
                where: { startTime: { lt: cutoffDate } }
            });
            deletedCount += result.count;
        }
        res.json({ message: `Cleanup berhasil. ${deletedCount} item dihapus.`, deletedCount });
    }
    catch (err) {
        console.error("Error during cleanup:", err);
        res.status(500).json({ error: "Gagal melakukan cleanup data" });
    }
}));
// POST /api/admin/sync-centre
router.post('/admin/sync-centre', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, hubSync_1.syncHubData)();
    if (result.success) {
        res.json({ message: "Sinkronisasi dengan Master Hub berhasil.", members_processed: result.processed });
    }
    else {
        res.status(500).json({ error: `Gagal sinkronisasi: ${result.error}` });
    }
}));
exports.default = router;
