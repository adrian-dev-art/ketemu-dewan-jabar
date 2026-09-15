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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;
    try {
        const dbStart = Date.now();
        yield prisma_1.prisma.$queryRaw `SELECT 1`;
        dbLatencyMs = Date.now() - dbStart;
    }
    catch (err) {
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
}));
exports.default = router;
