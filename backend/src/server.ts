import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { AccessToken, EgressClient, EncodedFileOutput, EncodedFileType, StreamOutput, EncodingOptionsPreset } from 'livekit-server-sdk';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { syncHubData } from './services/hubSync';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';
const LIVEKIT_HOST = process.env.LIVEKIT_URL || 'http://localhost:7880';
const egressClient = new EgressClient(
    LIVEKIT_HOST,
    process.env.LIVEKIT_API_KEY || 'devkey',
    process.env.LIVEKIT_API_SECRET || 'secretkey'
);

// Trust proxy for accurate rate limiting (Nginx)
app.set('trust proxy', 1);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

app.use(limiter);
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));
app.use(express.json());

const server = http.createServer(app);

// --- AUTH MIDDLEWARE ---
interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Akses ditolak. Token tidak ditemukan." });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ error: "Token tidak valid atau kedaluwarsa." });
        req.user = user;
        next();
    });
};

const authorizeRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Anda tidak memiliki izin untuk akses ini." });
        }
        next();
    };
};

// Database connection
const connectDB = async () => {
    console.log("Mencoba menghubungkan ke database...");
    try {
        await prisma.$connect();
        console.log("Database berhasil terhubung.");
    } catch (err) {
        console.error("Gagal menghubungkan ke database:");
        console.error(err);
    }
};

connectDB();

// --- AUTH ROUTES ---

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "Pengguna tidak ditemukan." });

        // If no passwordHash set (legacy user), allow login for now OR handle it
        if (user.passwordHash) {
            const validPassword = await bcrypt.compare(password, user.passwordHash);
            if (!validPassword) return res.status(401).json({ error: "Password salah." });
        } else {
            // For demo/dev purposes where seed didn't hash: 
            // In production, we should force password reset or use a migration script
            if (password !== 'password') return res.status(401).json({ error: "Password salah (Legacy Check)." });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Gagal memproses login." });
    }
});

// Simple Register for demo
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const user = await prisma.user.create({
            data: { name, email, passwordHash, role: role || 'masyarakat' }
        });

        res.status(201).json({ message: "Registrasi berhasil", userId: user.id });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Gagal mendaftarkan pengguna (Email mungkin sudah terdaftar)." });
    }
});

// --- API ROUTES ---

// 1. List all Dewan with Availability (Public)
app.get('/api/dewan', async (req, res) => {
    try {
        const result = await prisma.user.findMany({
            where: { role: 'dewan' },
            include: {
                availabilities: true,
                ratingsAsDewan: true
            }
        });

        const dewanWithDetails = result.map((d: any) => {
            let avg = 4.5;
            if (d.ratingsAsDewan.length > 0) {
                const totalScores = d.ratingsAsDewan.reduce((acc: number, r: any) => 
                    acc + (r.speakingScore + r.contextScore + r.timeScore) / 3, 0);
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
    } catch (err) {
        console.error("Error fetching dewan:", err);
        res.status(500).json({ error: "Gagal mengambil daftar dewan" });
    }
});

// 2. Set Availability (Dewan only)
app.post('/api/availability', authenticateToken, authorizeRole(['dewan', 'admin']), async (req: AuthRequest, res) => {
    const { start_time, end_time } = req.body;
    const dewan_id = req.user!.id;
    
    try {
        const result = await prisma.availability.create({
            data: {
                dewanId: dewan_id,
                startTime: new Date(start_time),
                endTime: new Date(end_time),
            }
        });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error creating availability:", err);
        res.status(500).json({ error: "Gagal membuat ketersediaan waktu" });
    }
});

// 3. Schedule a meeting (Protected)
app.post('/api/schedules', authenticateToken, async (req: AuthRequest, res) => {
    const { dewan_id, start_time, title } = req.body;
    const masyarakat_id = req.user!.id; // Current logged in user is the 'masyarakat'
    const requestedTime = new Date(start_time);
    
    try {
        const availability = await prisma.availability.findFirst({
            where: {
                dewanId: Number(dewan_id),
                startTime: { lte: requestedTime },
                endTime: { gte: requestedTime }
            }
        });

        if (!availability) {
            return res.status(400).json({ error: "Waktu ini tidak tersedia untuk Dewan tersebut" });
        }

        const conflict = await prisma.schedule.findFirst({
            where: {
                dewanId: Number(dewan_id),
                startTime: requestedTime,
                status: { in: ['pending', 'confirmed'] }
            }
        });

        if (conflict) {
            return res.status(400).json({ error: "Waktu ini sudah dipesan oleh orang lain" });
        }

        const result = await prisma.schedule.create({
            data: {
                title: title || "Diskusi Aspirasi",
                dewanId: Number(dewan_id),
                masyarakatId: masyarakat_id,
                startTime: requestedTime,
            }
        });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error creating schedule:", err);
        res.status(500).json({ error: "Gagal membuat jadwal pertemuan" });
    }
});

// 4. Get Schedules (Protected - Context sensitive)
app.get('/api/schedules', authenticateToken, async (req: AuthRequest, res) => {
    const { role, id: userId } = req.user!;
    try {
        const where: any = {};
        if (role === 'dewan') where.dewanId = Number(userId);
        if (role === 'masyarakat') where.masyarakatId = Number(userId);
        // If admin, they see everything (where stays empty)

        const result = await prisma.schedule.findMany({
            where,
            orderBy: { startTime: 'desc' },
            include: {
                dewan: { select: { name: true } },
                masyarakat: { select: { name: true } },
                rating: true
            }
        });

        res.json(result);
    } catch (err) {
        console.error("Error fetching schedules:", err);
        res.status(500).json({ error: "Gagal mengambil data jadwal" });
    }
});

// 5. Update Schedule Status (Dewan/Admin only)
app.patch('/api/schedules/:id', authenticateToken, authorizeRole(['dewan', 'admin']), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await prisma.schedule.update({
            where: { id: Number(id) },
            data: { status }
        });
        res.json(result);
    } catch (err) {
        console.error("Error updating schedule:", err);
        res.status(500).json({ error: "Gagal memperbarui status jadwal" });
    }
});

// 6. Master Hub Sync (Admin only)
app.post('/api/admin/sync-centre', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    const result = await syncHubData();
    if (result.success) {
        res.json({ message: "Sinkronisasi dengan Master Hub berhasil.", members_processed: result.processed });
    } else {
        res.status(500).json({ error: `Gagal sinkronisasi: ${result.error}` });
    }
});

// 7. Submit Multi-Aspect Rating (Masyarakat only)
app.post('/api/ratings', authenticateToken, authorizeRole(['masyarakat']), async (req, res) => {
    const { schedule_id, dewan_id, speaking_score, context_score, time_score, responsiveness_score, solution_score, comment } = req.body;
    try {
        const result = await prisma.rating.create({
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
    } catch (err) {
        console.error("Error submitting rating:", err);
        res.status(500).json({ error: "Gagal mengirim penilaian" });
    }
});

// 8. Admin Stats (Admin only)
app.get('/api/admin/stats', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const [totalUsers, totalMeetings, ratings] = await Promise.all([
            prisma.user.count(),
            prisma.schedule.count(),
            prisma.rating.findMany()
        ]);

        let avgRating = 0;
        if (ratings.length > 0) {
            const totalScore = ratings.reduce((acc: number, r: any) => {
                const avg = (r.speakingScore + r.contextScore + r.timeScore + r.responsivenessScore + r.solutionScore) / 5;
                return acc + avg;
            }, 0);
            avgRating = Math.round((totalScore / ratings.length) * 10) / 10;
        }

        res.json({ totalUsers, totalMeetings, avgRating, totalRatings: ratings.length });
    } catch (err) {
        console.error("Error fetching admin stats:", err);
        res.status(500).json({ error: "Gagal mengambil statistik" });
    }
});

// 9. Admin - All Ratings (Admin only)
app.get('/api/admin/ratings', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const ratings = await prisma.rating.findMany({
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

        const formatted = ratings.map((r: any) => ({
            id: r.id,
            dewanId: r.dewanId,
            dewanName: r.dewan?.name || 'N/A',
            dewanFraksi: r.dewan?.fraksi || '-',
            masyarakatName: r.schedule?.masyarakat?.name || 'N/A',
            meetingTitle: r.schedule?.title || 'N/A',
            meetingDate: r.schedule?.startTime,
            speakingScore: r.speakingScore,
            contextScore: r.contextScore,
            timeScore: r.timeScore,
            responsivenessScore: r.responsivenessScore,
            solutionScore: r.solutionScore,
            avgScore: Math.round(((r.speakingScore + r.contextScore + r.timeScore + r.responsivenessScore + r.solutionScore) / 5) * 10) / 10,
            comment: r.comment,
        }));

        res.json(formatted);
    } catch (err) {
        console.error("Error fetching admin ratings:", err);
        res.status(500).json({ error: "Gagal mengambil data penilaian" });
    }
});


// 10. Centre Performance Pull (M2M - Shared Secret Auth)
app.get('/api/centre/performance', async (req, res) => {
    const secret = req.headers['x-centre-pull-secret'];
    const expectedSecret = process.env.CENTRE_PULL_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
        return res.status(403).json({ error: "Akses ditolak. Secret tidak valid." });
    }

    try {
        const [totalMeetings, allRatings, dewanUsers] = await Promise.all([
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
        const performanceMap: Record<number, {
            dewanId: number, name: string, nip: string | null, fraksi: string | null,
            jabatan: string | null, dapil: string | null,
            meetingCount: number, totalRatings: number,
            speaking: number, context: number, time: number, responsiveness: number, solution: number
        }> = {};

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
        const completedSchedules = await prisma.schedule.groupBy({
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
            const total = allRatings.reduce((acc, r) =>
                acc + (r.speakingScore + r.contextScore + r.timeScore + r.responsivenessScore + r.solutionScore) / 5, 0);
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

    } catch (err) {
        console.error("Error fetching centre performance data:", err);
        res.status(500).json({ error: "Gagal mengambil data performa." });
    }
});

// --- LIVEKIT REST ENDPOINTS ---

// Admin: Get Streaming Settings
app.get('/api/admin/settings/streaming', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: ['stream_url', 'stream_key', 'is_auto_stream'] }
            }
        });
        
        const result = {
            stream_url: settings.find(s => s.key === 'stream_url')?.value || '',
            stream_key: settings.find(s => s.key === 'stream_key')?.value || '',
            is_auto_stream: settings.find(s => s.key === 'is_auto_stream')?.value === 'true'
        };
        
        res.json(result);
    } catch (err) {
        console.error("Error fetching stream settings:", err);
        res.status(500).json({ error: "Gagal mengambil pengaturan streaming" });
    }
});

// Admin: Update Streaming Settings
app.post('/api/admin/settings/streaming', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    const { stream_url, stream_key, is_auto_stream } = req.body;
    try {
        await prisma.$transaction([
            prisma.systemSetting.upsert({
                where: { key: 'stream_url' },
                update: { value: stream_url },
                create: { key: 'stream_url', value: stream_url }
            }),
            prisma.systemSetting.upsert({
                where: { key: 'stream_key' },
                update: { value: stream_key },
                create: { key: 'stream_key', value: stream_key }
            }),
            prisma.systemSetting.upsert({
                where: { key: 'is_auto_stream' },
                update: { value: String(is_auto_stream) },
                create: { key: 'is_auto_stream', value: String(is_auto_stream) }
            })
        ]);
        res.json({ message: "Pengaturan streaming berhasil diperbarui" });
    } catch (err) {
        console.error("Error updating stream settings:", err);
        res.status(500).json({ error: "Gagal memperbarui pengaturan streaming" });
    }
});

app.post('/api/livekit/token', authenticateToken, async (req: AuthRequest, res) => {
    const { roomName, scheduleId } = req.body;
    const participantName = req.user!.email;

    if (!roomName) {
        return res.status(400).json({ error: "roomName is required" });
    }

    try {
        // Create token
        const at = new AccessToken(
            process.env.LIVEKIT_API_KEY || 'devkey',
            process.env.LIVEKIT_API_SECRET || 'secretkey',
            {
                identity: participantName,
                name: req.user!.role.toUpperCase() + ": " + participantName.split('@')[0],
            }
        );

        at.addGrant({ roomJoin: true, room: roomName });
        const token = await at.toJwt();

        // Check if we should auto-start streaming
        const parsedScheduleId = Number(scheduleId);
        if (scheduleId && !isNaN(parsedScheduleId)) {
            const autoStream = await prisma.systemSetting.findUnique({ where: { key: 'is_auto_stream' } });
            if (autoStream?.value === 'true') {
                const schedule = await prisma.schedule.findUnique({ where: { id: parsedScheduleId } });
                if (schedule && !schedule.isStreaming) {
                    const url = await prisma.systemSetting.findUnique({ where: { key: 'stream_url' } });
                    const key = await prisma.systemSetting.findUnique({ where: { key: 'stream_key' } });
                    
                    if (url?.value && key?.value) {
                        const fullStreamUrl = `${url.value}/${key.value}`;
                        try {
                            console.log(`[STREAM API] Starting auto-egress for room: ${roomName} to ${url.value}`);
                            const info = await egressClient.startRoomCompositeEgress(roomName, {
                                stream: { urls: [fullStreamUrl] },
                                options: { preset: EncodingOptionsPreset.H264_720P_30 }
                            } as any);
                            
                            await prisma.schedule.update({
                                where: { id: parsedScheduleId },
                                data: { isStreaming: true, egressId: info.egressId }
                            });
                            console.log(`[STREAM API] Auto-streaming started successfully for room ${roomName}, egressId: ${info.egressId}`);
                        } catch (egressErr) {
                            console.error("[STREAM API] Failed to auto-start egress:", egressErr);
                        }
                    }
                }
            }
        }

        res.json({ token });
    } catch (error) {
        console.error("Error generating LiveKit token:", error);
        res.status(500).json({ error: "Failed to generate token" });
    }
});

// Manual Egress Start/Stop
app.post('/api/livekit/egress/start', authenticateToken, authorizeRole(['admin', 'dewan']), async (req, res) => {
    const { scheduleId, roomName } = req.body;
    try {
        console.log(`[STREAM API] Manual stream start requested for room: ${roomName}`);
        const parsedScheduleId = Number(scheduleId);
        if (isNaN(parsedScheduleId)) {
            console.error(`[STREAM API] Manual start failed: Invalid scheduleId (${scheduleId})`);
            return res.status(400).json({ error: "ID Jadwal tidak valid" });
        }
        const schedule = await prisma.schedule.findUnique({ where: { id: parsedScheduleId } });
        if (schedule && !schedule.isStreaming) {
            const url = await prisma.systemSetting.findUnique({ where: { key: 'stream_url' } });
            const key = await prisma.systemSetting.findUnique({ where: { key: 'stream_key' } });
            
            if (url?.value && key?.value) {
                const fullStreamUrl = `${url.value}/${key.value}`;
                console.log(`[STREAM API] Streaming destination: ${url.value}`);
                
                const info = await egressClient.startRoomCompositeEgress(roomName, {
                    stream: { urls: [fullStreamUrl] },
                    options: { preset: EncodingOptionsPreset.H264_720P_30 }
                } as any);
                
                await prisma.schedule.update({
                    where: { id: parsedScheduleId },
                    data: { isStreaming: true, egressId: info.egressId }
                });
                console.log(`[STREAM API] Manual streaming started successfully! egressId: ${info.egressId}`);
                res.json({ message: "Streaming dimulai", egressId: info.egressId });
            } else {
                console.error(`[STREAM API] Manual start failed: Missing stream keys in database!`);
                res.status(400).json({ error: "Stream URL / Key kosong di pengaturan" });
            }
        } else {
            console.log(`[STREAM API] Manual start failed: Either active or schedule missing.`);
            res.status(400).json({ error: "Sesi sudah streaming atau tidak ditemukan" });
        }
    } catch (err) {
        console.error("[STREAM API] Error starting egress manually:", err);
        res.status(500).json({ error: "Gagal memulai streaming" });
    }
});

app.post('/api/livekit/egress/stop', authenticateToken, authorizeRole(['admin', 'dewan']), async (req, res) => {
    const { scheduleId } = req.body;
    try {
        console.log(`[STREAM API] Manual stream stop requested for scheduleId: ${scheduleId}`);
        const parsedScheduleId = Number(scheduleId);
        if (isNaN(parsedScheduleId)) {
            console.error(`[STREAM API] Manual stop failed: Invalid scheduleId (${scheduleId})`);
            return res.status(400).json({ error: "ID Jadwal tidak valid" });
        }
        const schedule = await prisma.schedule.findUnique({ where: { id: parsedScheduleId } });
        
        if (schedule?.egressId) {
            try {
                await egressClient.stopEgress(schedule.egressId);
            } catch (egressErr: any) {
                // If egress is already stopped/aborted, LiveKit returns 412. 
                // We still want to clear our DB state in this case.
                console.warn(`[STREAM API] LiveKit stopEgress warned: ${egressErr.message}`);
                if (egressErr.status !== 412 && !egressErr.message?.includes("cannot be stopped")) {
                    throw egressErr; // Re-throw if it's a real connection error
                }
            }

            await prisma.schedule.update({
                where: { id: parsedScheduleId },
                data: { isStreaming: false, egressId: null }
            });
            res.json({ message: "Streaming dihentikan" });
        } else {
            res.status(404).json({ error: "Tidak ada session streaming aktif" });
        }
    } catch (err) {
        console.error("[STREAM API] Error stopping egress:", err);
        res.status(500).json({ error: "Gagal menghentikan streaming" });
    }
});

// --- SOCKET.IO (Removed legacy WebRTC signaling) ---
const io = new Server(server, {
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
