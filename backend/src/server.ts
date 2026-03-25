import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { AccessToken } from 'livekit-server-sdk';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

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
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
        if (role === 'dewan') where.dewanId = userId;
        if (role === 'masyarakat') where.masyarakatId = userId;
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

// 6. Submit Multi-Aspect Rating (Masyarakat only)
app.post('/api/ratings', authenticateToken, authorizeRole(['masyarakat']), async (req, res) => {
    const { schedule_id, dewan_id, speaking_score, context_score, time_score, comment } = req.body;
    try {
        const result = await prisma.rating.create({
            data: {
                schedule: { connect: { id: Number(schedule_id) } },
                dewan: { connect: { id: Number(dewan_id) } },
                speakingScore: Number(speaking_score),
                contextScore: Number(context_score),
                timeScore: Number(time_score),
                comment
            }
        });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error submitting rating:", err);
        res.status(500).json({ error: "Gagal mengirim penilaian" });
    }
});

// --- LIVEKIT REST ENDPOINTS ---
app.post('/api/livekit/token', authenticateToken, async (req: AuthRequest, res) => {
    const { roomName } = req.body;
    const participantName = req.user!.email; // Use email as unique identity

    if (!roomName) {
        return res.status(400).json({ error: "roomName is required" });
    }

    try {
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
        res.json({ token });
    } catch (error) {
        console.error("Error generating LiveKit token:", error);
        res.status(500).json({ error: "Failed to generate token" });
    }
});

// --- SOCKET.IO (Removed legacy WebRTC signaling) ---
const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
    console.log('User connected via Socket.io:', socket.id);
    // Add real-time notifications here late if needed
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
