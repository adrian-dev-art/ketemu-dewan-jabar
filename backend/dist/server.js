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
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const env_1 = require("./config/env");
const prisma_1 = require("./lib/prisma");
const apiKey_middleware_1 = require("./middlewares/apiKey.middleware");
const upload_middleware_1 = require("./middlewares/upload.middleware");
const queueService_1 = require("./services/queueService");
// Domain Routers
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const schedule_routes_1 = __importDefault(require("./routes/schedule.routes"));
const followup_routes_1 = __importDefault(require("./routes/followup.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const gis_routes_1 = __importDefault(require("./routes/gis.routes"));
const livekit_routes_1 = __importDefault(require("./routes/livekit.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
// Inisialisasi Socket.io
const io = new socket_io_1.Server(server, {
    cors: {
        origin: env_1.envConfig.FRONTEND_URLS,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true
    }
});
exports.io = io;
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
    const origin = req.headers.origin;
    if (origin && env_1.envConfig.FRONTEND_URLS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    else {
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
const globalLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use(globalLimiter);
// 3. Security Headers via Helmet
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
    hsts: env_1.envConfig.NODE_ENV === 'production',
    contentSecurityPolicy: env_1.envConfig.NODE_ENV === 'production' ? undefined : {
        directives: {
            upgradeInsecureRequests: null
        }
    }
}));
// 4. Body Parsers
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// 5. Static Directories
app.use('/uploads', express_1.default.static(upload_middleware_1.uploadsDir));
app.use('/recordings', express_1.default.static('/app/recordings'));
// 6. Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} (${ms}ms)`);
    });
    next();
});
// 7. API Key Verification Middleware
app.use(apiKey_middleware_1.apiKeyMiddleware);
// 8. Mount Domain Routers
app.use('/api', health_routes_1.default);
app.use('/api', auth_routes_1.default);
app.use('/api', schedule_routes_1.default);
app.use('/api', followup_routes_1.default);
app.use('/api', public_routes_1.default);
app.use('/api', gis_routes_1.default);
app.use('/api', livekit_routes_1.default);
app.use('/api', admin_routes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[Unhandled Error] ${req.method} ${req.path}:`, err);
    res.status(500).json({ error: "Terjadi kesalahan internal pada server" });
});
// Database Connection Check & Server Listen
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.prisma.$connect();
        console.log("Database PostgreSQL berhasil terhubung.");
    }
    catch (err) {
        console.error("Gagal menghubungkan ke database PostgreSQL:", err);
    }
});
connectDB();
if (env_1.envConfig.NODE_ENV !== 'test') {
    server.listen(env_1.envConfig.PORT, () => {
        console.log(`Server DPRD HUDANG berjalan di port ${env_1.envConfig.PORT}`);
        (0, queueService_1.startQueueDaemon)();
    });
}
