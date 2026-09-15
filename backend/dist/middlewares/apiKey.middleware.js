"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyMiddleware = void 0;
const env_1 = require("../config/env");
const apiKeyMiddleware = (req, res, next) => {
    // Only protect /api routes
    if (!req.path.startsWith('/api')) {
        return next();
    }
    // Whitelist all public endpoints and healthcheck
    if (req.path.startsWith('/api/public') || req.path === '/api/health') {
        return next();
    }
    const validKey = env_1.envConfig.MOBILE_API_KEY;
    if (!validKey) {
        return next(); // Pass through if not configured
    }
    // Allow requests from permitted web frontend origins to bypass the API key
    let origin = req.headers.origin;
    if (!origin && req.headers.referer) {
        try {
            origin = new URL(req.headers.referer).origin;
        }
        catch (e) { }
    }
    if (origin && env_1.envConfig.FRONTEND_URLS.includes(origin)) {
        return next();
    }
    const apiKey = req.headers['x-api-key'];
    if (apiKey === validKey) {
        return next();
    }
    return res.status(403).json({ error: "Forbidden: Invalid API Key" });
};
exports.apiKeyMiddleware = apiKeyMiddleware;
