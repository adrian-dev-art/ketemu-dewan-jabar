import { Request, Response, NextFunction } from 'express';
import { envConfig } from '../config/env';

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Only protect /api routes
    if (!req.path.startsWith('/api')) {
        return next();
    }

    // Whitelist all public endpoints and healthcheck
    if (req.path.startsWith('/api/public') || req.path === '/api/health') {
        return next();
    }

    const validKey = envConfig.MOBILE_API_KEY;
    if (!validKey) {
        return next(); // Pass through if not configured
    }

    // Allow requests from permitted web frontend origins to bypass the API key
    let origin = req.headers.origin as string;
    if (!origin && req.headers.referer) {
        try {
            origin = new URL(req.headers.referer).origin;
        } catch (e) {}
    }

    if (origin && envConfig.FRONTEND_URLS.includes(origin)) {
        return next();
    }

    const apiKey = req.headers['x-api-key'];
    if (apiKey === validKey) {
        return next();
    }

    return res.status(403).json({ error: "Forbidden: Invalid API Key" });
};
