import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { AccessToken } from 'livekit-server-sdk';
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

// 1. List all Dewan with Availability
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
            let avg = 0;
            if (d.ratingsAsDewan.length > 0) {
                const totalScores = d.ratingsAsDewan.reduce((acc: number, r: any) => 
                    acc + (r.speakingScore + r.contextScore + r.timeScore) / 3, 0);
                avg = totalScores / d.ratingsAsDewan.length;
            } else {
                avg = 4.5; // Default rating
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
app.post('/api/availability', async (req, res) => {
    const { dewan_id, start_time, end_time } = req.body;
    try {
        const result = await prisma.availability.create({
            data: {
                dewanId: Number(dewan_id),
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

// 3. Schedule a meeting (Masyarakat books a slot)
app.post('/api/schedules', async (req, res) => {
    const { dewan_id, masyarakat_id, start_time } = req.body;
    const requestedTime = new Date(start_time);
    
    try {
        // Validation 1: Must be within Dewan's availability
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

        // Validation 2: Must not overlap with existing confirmed booking
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
                dewanId: Number(dewan_id),
                masyarakatId: Number(masyarakat_id),
                startTime: requestedTime,
            }
        });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error creating schedule:", err);
        res.status(500).json({ error: "Gagal membuat jadwal pertemuan" });
    }
});

// 4. Get Schedules
app.get('/api/schedules', async (req, res) => {
    const { role, userId } = req.query;
    try {
        const where: any = {};
        if (userId) {
            const parsedId = Number(userId);
            if (!isNaN(parsedId)) {
                if (role === 'dewan') where.dewanId = parsedId;
                if (role === 'masyarakat') where.masyarakatId = parsedId;
            }
        }

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

// 5. Update Schedule Status
app.patch('/api/schedules/:id', async (req, res) => {
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

// 6. Submit Multi-Aspect Rating
app.post('/api/ratings', async (req, res) => {
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
app.post('/api/livekit/token', async (req, res) => {
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
        return res.status(400).json({ error: "roomName and participantName are required" });
    }

    try {
        const at = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                identity: participantName,
                name: participantName,
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
    socket.on('offer', (p) => io.to(p.target).emit('offer', { ...p, senderId: socket.id }));
    socket.on('answer', (p) => io.to(p.target).emit('answer', { ...p, senderId: socket.id }));
    socket.on('ice-candidate', (p) => io.to(p.target).emit('ice-candidate', { ...p, senderId: socket.id }));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
