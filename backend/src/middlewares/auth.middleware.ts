import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env';

export interface AuthUser {
    id: number;
    email: string;
    role: string;
}

export interface AuthRequest extends Request {
    user?: AuthUser;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // Only verify via x-api-key if MOBILE_API_KEY is configured in env
        const apiKey = req.headers['x-api-key'];
        if (envConfig.MOBILE_API_KEY && apiKey === envConfig.MOBILE_API_KEY) {
            req.user = { id: 1, email: 'mobile-system@dprd.jabarprov.go.id', role: 'admin' };
            return next();
        }
        return res.status(401).json({ error: "Akses ditolak. Token tidak ditemukan." });
    }

    jwt.verify(token, envConfig.JWT_SECRET, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: "Token tidak valid atau telah kedaluwarsa." });
        }
        req.user = user as AuthUser;
        next();
    });
};

export const authorizeRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Anda tidak memiliki izin untuk akses ini." });
        }
        next();
    };
};
