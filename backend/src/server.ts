import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();

// Trust proxy for accurate rate limiting (Nginx)
app.set('trust proxy', 1);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // set `RateLimit` and `RateLimit-Policy` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);
const server = http.createServer(app);
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));
app.use(express.json());

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

// --- API ROUTES ---

// 1. List all Dewan
app.get('/api/dewan', async (req, res) => {
    try {
        const result = await prisma.user.findMany({
            where: { role: 'dewan' },
            include: {
                ratingsAsDewan: {
                    select: { rating: true }
                }
            }
        });

        const dewanWithAvg = result.map((d: any) => {
            const sum = d.ratingsAsDewan.reduce((acc: number, r: any) => acc + r.rating, 0);
            const avg = d.ratingsAsDewan.length > 0 ? sum / d.ratingsAsDewan.length : 4.5;
            return {
                id: d.id,
                name: d.name,
                bio: d.bio || "Tidak ada biodata.",
                rating: avg
            };
        });

        res.json(dewanWithAvg);
    } catch (err) {
        console.error("Error fetching dewan:", err);
        res.status(500).json({ error: "Gagal mengambil daftar dewan" });
    }
});

// 2. Schedule a meeting
app.post('/api/schedules', async (req, res) => {
    const { dewan_id, masyarakat_id, start_time } = req.body;
    try {
        const result = await prisma.schedule.create({
            data: {
                dewanId: Number(dewan_id),
                masyarakatId: Number(masyarakat_id),
                startTime: new Date(start_time),
            }
        });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error creating schedule:", err);
        res.status(500).json({ error: "Gagal membuat jadwal pertemuan" });
    }
});

// 3. Get Schedules
app.get('/api/schedules', async (req, res) => {
    const { role, userId } = req.query;
    try {
        const where: any = {};

        // Validasi ID jika ada
        if (userId) {
            const parsedId = Number(userId);
            if (isNaN(parsedId)) {
                return res.status(400).json({ error: "ID pengguna tidak valid" });
            }
            if (role === 'dewan') where.dewanId = parsedId;
            if (role === 'masyarakat') where.masyarakatId = parsedId;
        }

        const result = await prisma.schedule.findMany({
            where,
            orderBy: { startTime: 'desc' }
        });

        const mapped = result.map((s: any) => ({
            id: s.id,
            dewan_id: s.dewanId,
            masyarakat_id: s.masyarakatId,
            start_time: s.startTime,
            status: s.status
        }));

        res.json(mapped);
    } catch (err) {
        console.error("Error fetching schedules:", err);
        res.status(500).json({ error: "Gagal mengambil data jadwal" });
    }
});

// 4. Update Schedule Status
app.patch('/api/schedules/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await prisma.schedule.update({
            where: { id: Number(id) },
            data: { status }
        });
        res.json({
            id: result.id,
            status: result.status
        });
    } catch (err) {
        console.error("Error updating schedule:", err);
        res.status(500).json({ error: "Gagal memperbarui status jadwal" });
    }
});

// 5. Submit Rating
app.post('/api/ratings', async (req, res) => {
    const { schedule_id, dewan_id, rating, comment } = req.body;
    try {
        const result = await prisma.rating.create({
            data: {
                scheduleId: Number(schedule_id),
                dewanId: Number(dewan_id),
                rating: Number(rating),
                comment
            }
        });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error submitting rating:", err);
        res.status(500).json({ error: "Gagal mengirim penilaian. Anda mungkin sudah menilai pertemuan ini." });
    }
});

// --- SOCKET.IO ---
const io = new Server(server, {
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
