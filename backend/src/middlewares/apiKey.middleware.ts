import { Request, Response, NextFunction } from 'express';
import { envConfig } from '../config/env';

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Only protect /api routes
    if (!req.path.startsWith('/api')) {
        return next();
    }

    // Whitelist all public endpoints, auth, dewan, healthcheck, and test environment
    if (
        req.path.startsWith('/api/public') ||
        req.path.startsWith('/api/auth') ||
        req.path.startsWith('/api/dewan') ||
        req.path.startsWith('/api/users/dewan') ||
        req.path.startsWith('/api/system') ||
        req.path === '/api/health' ||
        envConfig.NODE_ENV === 'test'
    ) {
        return next();
    }

    // If request already has Bearer token, it will be validated by authenticateToken
    if (req.headers.authorization) {
        return next();
    }

    const validKey = envConfig.MOBILE_API_KEY;
    if (!validKey) {
        return next();
    }

    let origin = req.headers.origin as string;
    if (!origin && req.headers.referer) {
        try {
            origin = new URL(req.headers.referer).origin;
        } catch (e) {}
    }

    if (origin) {
        if (
            envConfig.FRONTEND_URLS.includes(origin) ||
            origin.includes('localhost') ||
            origin.includes('127.0.0.1')
        ) {
            return next();
        }
    }

    const apiKey = req.headers['x-api-key'];
    if (apiKey === validKey) {
        return next();
    }

    return res.status(403).json({ error: "Forbidden: Invalid API Key" });
};
