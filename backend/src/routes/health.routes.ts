import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
    const startTime = Date.now();
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;

    try {
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        dbLatencyMs = Date.now() - dbStart;
    } catch (err: any) {
        dbStatus = 'unhealthy';
    }

    const uptimeSeconds = Math.floor(process.uptime());
    const memoryUsage = process.memoryUsage();

    const isHealthy = dbStatus === 'healthy';

    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptimeSeconds,
        services: {
            database: {
                status: dbStatus,
                latencyMs: dbLatencyMs,
            },
            server: {
                status: 'healthy',
                responseLatencyMs: Date.now() - startTime,
                memory: {
                    rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
                    heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                },
            }
        }
    });
});

export default router;
