import * as dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error("FATAL: JWT_SECRET must be set in production environment.");
    process.exit(1);
}

export const envConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT) || 5000,
    JWT_SECRET: JWT_SECRET || 'dev-secret-key-only',
    LIVEKIT_URL: process.env.LIVEKIT_URL || 'http://localhost:7880',
    LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY || 'devkey',
    LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET || 'secretkey',
    MOBILE_API_KEY: process.env.MOBILE_API_KEY || null,
    FRONTEND_URLS: process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
        : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
    CENTRE_HUB_URL: process.env.CENTRE_HUB_URL || 'http://127.0.0.1:8000/api/v1/members',
};
