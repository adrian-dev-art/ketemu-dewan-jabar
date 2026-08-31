import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: "Validasi data gagal",
                    details: error.issues.map((e: ZodIssue) => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            return res.status(400).json({ error: "Permintaan data tidak valid" });
        }
    };
};

export const validateQuery = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req.query);
            req.query = parsed as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: "Parameter pencarian tidak valid",
                    details: error.issues.map((e: ZodIssue) => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            return res.status(400).json({ error: "Parameter tidak valid" });
        }
    };
};
