import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import * as path from 'path';

import { envConfig } from './config/env';
import { prisma } from './lib/prisma';
import { apiKeyMiddleware } from './middlewares/apiKey.middleware';
import { uploadsDir } from './middlewares/upload.middleware';
import { startQueueDaemon } from './services/queueService';

// Domain Routers
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import scheduleRoutes from './routes/schedule.routes';
import followupRoutes from './routes/followup.routes';
import publicRoutes from './routes/public.routes';
import gisRoutes from './routes/gis.routes';
import livekitRoutes from './routes/livekit.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const server = http.createServer(app);

// Inisialisasi Socket.io
const io = new Server(server, {
    cors: {
        origin: envConfig.FRONTEND_URLS,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log(`[Socket.io] Klien terhubung: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`[Socket.io] Klien terputus: ${socket.id}`);
    });
});

// Trust proxy for Nginx reverse proxy
app.set('trust proxy', 1);

// 1. Custom CORS Middleware
app.use((req, res, next) => {
    const origin = req.headers.origin as string;
    if (origin && envConfig.FRONTEND_URLS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,x-api-key,x-centre-pull-secret');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// 2. Global Rate Limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use(globalLimiter);

// 3. Security Headers via Helmet
app.use(helmet({
    crossOriginResourcePolicy: false,
    hsts: envConfig.NODE_ENV === 'production',
    contentSecurityPolicy: envConfig.NODE_ENV === 'production' ? undefined : {
        directives: {
            upgradeInsecureRequests: null
        }
    }
}));

// 4. Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 5. Static Directories
app.use('/uploads', express.static(uploadsDir));
app.use('/recordings', express.static('/app/recordings'));

// 6. Request Logger
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} (${ms}ms)`);
    });
    next();
});

// 7. API Key Verification Middleware
app.use(apiKeyMiddleware);

// 8. Mount Domain Routers
app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', followupRoutes);
app.use('/api', publicRoutes);
app.use('/api', gisRoutes);
app.use('/api', livekitRoutes);
app.use('/api', adminRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[Unhandled Error] ${req.method} ${req.path}:`, err);
    res.status(500).json({ error: "Terjadi kesalahan internal pada server" });
});

// Database Connection Check & Server Listen
const connectDB = async () => {
    try {
        if (prisma && typeof prisma.$connect === 'function') {
            await prisma.$connect();
            console.log("Database PostgreSQL berhasil terhubung.");
        }
    } catch (err) {
        console.error("Gagal menghubungkan ke database PostgreSQL:", err);
    }
};

if (envConfig.NODE_ENV !== 'test') {
    connectDB();
    server.listen(envConfig.PORT, () => {
        console.log(`Server DPRD HUDANG berjalan di port ${envConfig.PORT}`);
        startQueueDaemon();
    });
}

export { app, server, io };
