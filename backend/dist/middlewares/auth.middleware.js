"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        // Only verify via x-api-key if MOBILE_API_KEY is configured in env
        const apiKey = req.headers['x-api-key'];
        if (env_1.envConfig.MOBILE_API_KEY && apiKey === env_1.envConfig.MOBILE_API_KEY) {
            req.user = { id: 1, email: 'mobile-system@dprd.jabarprov.go.id', role: 'admin' };
            return next();
        }
        return res.status(401).json({ error: "Akses ditolak. Token tidak ditemukan." });
    }
    jsonwebtoken_1.default.verify(token, env_1.envConfig.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token tidak valid atau telah kedaluwarsa." });
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Anda tidak memiliki izin untuk akses ini." });
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
