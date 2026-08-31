import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../lib/prisma';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';
import { syncHubData } from '../services/hubSync';
import { memoryFollowUps } from './followup.routes';

const router = Router();

// GET /api/system/info (Public)
router.get('/system/info', async (req: Request, res: Response) => {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: ['app_name', 'app_logo', 'app_description'] }
            }
        });
        const result = settings.reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(result);
    } catch (err) {
        console.error("Error fetching system info:", err);
        res.status(500).json({ error: "Gagal mengambil info sistem" });
    }
});

// GET /api/centre/performance (M2M Auth)
router.get('/centre/performance', async (req: Request, res: Response) => {
    const secret = req.headers['x-centre-pull-secret'];
    const expectedSecret = process.env.CENTRE_PULL_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
        return res.status(403).json({ error: "Akses ditolak. Secret tidak valid." });
    }

    try {
        const [totalMeetings, allRatings, dewanUsers] = await Promise.all([
            prisma.schedule.count(),
            prisma.rating.findMany({
                include: {
                    dewan: { select: { id: true, name: true, nip: true, fraksi: true, jabatan: true, dapil: true } }
                }
            }),
            prisma.user.findMany({
                where: { role: 'dewan' },
                select: { id: true, name: true, nip: true, fraksi: true, jabatan: true, dapil: true }
            })
        ]);

        const performanceMap: Record<number, any> = {};

        for (const d of dewanUsers) {
            performanceMap[d.id] = {
                dewanId: d.id,
                name: d.name,
                nip: d.nip,
                fraksi: d.fraksi,
                jabatan: d.jabatan,
                dapil: d.dapil,
                meetingCount: 0,
                totalRatings: 0,
                speaking: 0,
                context: 0,
                time: 0,
                responsiveness: 0,
                solution: 0
            };
        }

        for (const r of allRatings) {
            const p = performanceMap[r.dewanId];
            if (p) {
                p.totalRatings++;
                p.speaking += r.speakingScore;
                p.context += r.contextScore;
                p.time += r.timeScore;
                p.responsiveness += r.responsivenessScore;
                p.solution += r.solutionScore;
            }
        }

        const completedSchedules = await prisma.scheduleParticipant.groupBy({
            by: ['dewanId'],
            where: { status: { in: ['completed', 'confirmed'] } },
            _count: true
        });
        for (const s of completedSchedules) {
            if (performanceMap[s.dewanId]) {
                performanceMap[s.dewanId].meetingCount = s._count;
            }
        }

        const dewanPerformance = Object.values(performanceMap).map((p: any) => {
            const n = p.totalRatings || 1;
            const avgScore = p.totalRatings > 0
                ? Math.round(((p.speaking + p.context + p.time + p.responsiveness + p.solution) / (5 * p.totalRatings)) * 100) / 100
                : 0;
            return {
                dewanId: p.dewanId,
                name: p.name,
                nip: p.nip || '',
                fraksi: p.fraksi || '',
                jabatan: p.jabatan || '',
                dapil: p.dapil || '',
                meetingCount: p.meetingCount,
                totalRatings: p.totalRatings,
                avgScore,
                scores: {
                    speaking: p.totalRatings > 0 ? Math.round((p.speaking / n) * 100) / 100 : 0,
                    context: p.totalRatings > 0 ? Math.round((p.context / n) * 100) / 100 : 0,
                    time: p.totalRatings > 0 ? Math.round((p.time / n) * 100) / 100 : 0,
                    responsiveness: p.totalRatings > 0 ? Math.round((p.responsiveness / n) * 100) / 100 : 0,
                    solution: p.totalRatings > 0 ? Math.round((p.solution / n) * 100) / 100 : 0,
                }
            };
        });

        let globalAvg = 0;
        if (allRatings.length > 0) {
            const total = allRatings.reduce((acc, r) =>
                acc + (r.speakingScore + r.contextScore + r.timeScore + r.responsivenessScore + r.solutionScore) / 5, 0);
            globalAvg = Math.round((total / allRatings.length) * 10) / 10;
        }

        res.json({
            stats: {
                totalMeetings,
                totalRatings: allRatings.length,
                avgRating: globalAvg,
                totalDewan: dewanUsers.length,
            },
            dewanPerformance,
            pulledAt: new Date().toISOString()
        });
    } catch (err) {
        console.error("Error fetching centre performance data:", err);
        res.status(500).json({ error: "Gagal mengambil data performa." });
    }
});

// Admin Authentication Required Routes below:
router.use(authenticateToken);
router.use(authorizeRole(['admin']));

// GET /api/admin/stats
router.get('/admin/stats', async (req: Request, res: Response) => {
    try {
        const [totalUsers, totalMeetings, ratings] = await Promise.all([
            prisma.user.count(),
            prisma.schedule.count(),
            prisma.rating.findMany()
        ]);

        let avgRating = 0;
        if (ratings.length > 0) {
            const totalScore = ratings.reduce((acc: number, r: any) => {
                const avg = (r.speakingScore + r.contextScore + r.timeScore + r.responsivenessScore + r.solutionScore) / 5;
                return acc + avg;
            }, 0);
            avgRating = Math.round((totalScore / ratings.length) * 10) / 10;
        }

        res.json({ totalUsers, totalMeetings, avgRating, totalRatings: ratings.length });
    } catch (err) {
        console.error("Error fetching admin stats:", err);
        res.status(500).json({ error: "Gagal mengambil statistik" });
    }
});

// GET /api/admin/ratings
router.get('/admin/ratings', async (req: Request, res: Response) => {
    try {
        const ratings = await prisma.rating.findMany({
            orderBy: { id: 'desc' },
            include: {
                dewan: { select: { id: true, name: true, fraksi: true } },
                schedule: {
                    include: {
                        masyarakat: { select: { name: true } }
                    }
                }
            }
        });

        const formatted = ratings.map((r: any) => ({
            id: r.id,
            dewanId: r.dewanId,
            dewanName: r.dewan?.name || 'N/A',
            dewanFraksi: r.dewan?.fraksi || '-',
            masyarakatName: r.schedule?.masyarakat?.name || 'N/A',
            meetingTitle: r.schedule?.title || 'N/A',
            meetingDate: r.schedule?.startTime,
            speakingScore: r.speakingScore,
            contextScore: r.contextScore,
            timeScore: r.timeScore,
            responsivenessScore: r.responsivenessScore,
            solutionScore: r.solutionScore,
            avgScore: Math.round(((r.speakingScore + r.contextScore + r.timeScore + r.responsivenessScore + r.solutionScore) / 5) * 10) / 10,
            comment: r.comment,
        }));

        res.json(formatted);
    } catch (err) {
        console.error("Error fetching admin ratings:", err);
        res.status(500).json({ error: "Gagal mengambil data penilaian" });
    }
});

// GET /api/admin/users
router.get('/admin/users', async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { id: 'desc' },
            select: {
                id: true, name: true, email: true, role: true, bio: true,
                nip: true, fraksi: true, jabatan: true, dapil: true,
                noKtp: true, instansi: true, isSync: true
            }
        });
        res.json(users);
    } catch (err) {
        console.error("Error fetching admin users:", err);
        res.status(500).json({ error: "Gagal mengambil data pengguna" });
    }
});

// PATCH /api/admin/users/:id
router.patch('/admin/users/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { password, ...otherData } = req.body;
    try {
        const updateData: any = { ...otherData };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(password, salt);
        }

        const updated = await prisma.user.update({
            where: { id },
            data: updateData
        });
        res.json({ message: "Pengguna berhasil diperbarui", user: { id: updated.id, email: updated.email } });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: "Gagal memperbarui pengguna" });
    }
});

// DELETE /api/admin/users/:id
router.delete('/admin/users/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        await prisma.user.delete({ where: { id } });
        res.json({ message: "Pengguna berhasil dihapus" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Gagal menghapus pengguna" });
    }
});

// GET /api/admin/schedules
router.get('/admin/schedules', async (req: Request, res: Response) => {
    try {
        const schedules = await prisma.schedule.findMany({
            orderBy: { startTime: 'desc' },
            include: {
                masyarakat: { select: { id: true, name: true, email: true, kabupaten: true, kecamatan: true } },
                participants: {
                    include: {
                        dewan: { select: { id: true, name: true, fraksi: true } }
                    }
                },
                followUps: true
            }
        });

        const formatted = schedules.map((s: any) => ({
            ...s,
            status: s.participants[0]?.status || 'pending',
            followUp: s.followUps?.[0] || memoryFollowUps[s.id] || null
        }));

        res.json(formatted);
    } catch (err) {
        console.error("Error fetching admin schedules:", err);
        res.status(500).json({ error: "Gagal mengambil data jadwal" });
    }
});

// PATCH /api/admin/schedules/:id
router.patch('/admin/schedules/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { title, startTime, status } = req.body;
    try {
        const updatedSchedule = await prisma.schedule.update({
            where: { id },
            data: {
                title,
                startTime: startTime ? new Date(startTime) : undefined
            }
        });

        if (status) {
            await prisma.scheduleParticipant.updateMany({
                where: { scheduleId: id },
                data: { status }
            });
        }

        res.json({ message: "Jadwal berhasil diperbarui", schedule: updatedSchedule });
    } catch (err) {
        console.error("Error updating schedule:", err);
        res.status(500).json({ error: "Gagal memperbarui jadwal" });
    }
});

// DELETE /api/admin/schedules/:id
router.delete('/api/admin/schedules/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        await prisma.schedule.delete({ where: { id } });
        res.json({ message: "Jadwal berhasil dihapus" });
    } catch (err) {
        console.error("Error deleting schedule:", err);
        res.status(500).json({ error: "Gagal menghapus jadwal" });
    }
});

// POST /api/admin/schedules/:id/transcribe
router.post('/admin/schedules/:id/transcribe', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        const schedule = await prisma.schedule.findUnique({ where: { id } });
        if (!schedule || !schedule.recordingUrl) {
            return res.status(404).json({ error: "Rekaman tidak ditemukan untuk jadwal ini" });
        }

        if (schedule.isTranscribing) {
            return res.status(400).json({ error: "Transkripsi sedang berjalan" });
        }

        let videoPath = path.join(process.cwd(), '..', schedule.recordingUrl);

        if (!fs.existsSync(videoPath)) {
            videoPath = path.join(process.cwd(), schedule.recordingUrl);
        }

        if (!fs.existsSync(videoPath) && fs.existsSync('/app')) {
            videoPath = `/app${schedule.recordingUrl}`;
        }

        if (!fs.existsSync(videoPath)) {
            const recordingsDir = path.join(process.cwd(), '..', 'recordings');
            if (fs.existsSync(recordingsDir)) {
                const files = fs.readdirSync(recordingsDir);
                const matchingFile = files.find((f: string) => f.startsWith(`recording_${id}_`) && f.endsWith('.mp4'));
                if (matchingFile) {
                    videoPath = path.join(recordingsDir, matchingFile);
                }
            }
        }

        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({ error: "File rekaman tidak ditemukan di server. Pastikan rekaman sudah selesai diunggah." });
        }

        await prisma.schedule.update({
            where: { id },
            data: {
                isTranscribing: false,
                isAnalyzing: false,
                transcriptionStatus: null,
                transcriptionProgress: 0
            }
        });

        res.json({ message: "Transkripsi telah dimasukkan ke dalam antrean otomatis." });
    } catch (err: any) {
        console.error("Error starting transcription:", err);
        res.status(500).json({ error: "Gagal memasukkan ke antrean: " + (err.message || "Internal Error") });
    }
});

// GET /api/admin/settings/streaming
router.get('/admin/settings/streaming', async (req: Request, res: Response) => {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: ['stream_url', 'stream_key', 'is_auto_stream'] }
            }
        });

        const result = {
            stream_url: settings.find(s => s.key === 'stream_url')?.value || '',
            stream_key: settings.find(s => s.key === 'stream_key')?.value || '',
            is_auto_stream: settings.find(s => s.key === 'is_auto_stream')?.value === 'true'
        };

        res.json(result);
    } catch (err) {
        console.error("Error fetching stream settings:", err);
        res.status(500).json({ error: "Gagal mengambil pengaturan streaming" });
    }
});

// POST /api/admin/settings/streaming
router.post('/admin/settings/streaming', async (req: Request, res: Response) => {
    const { stream_url, stream_key, is_auto_stream } = req.body;
    try {
        await prisma.$transaction([
            prisma.systemSetting.upsert({
                where: { key: 'stream_url' },
                update: { value: stream_url },
                create: { key: 'stream_url', value: stream_url }
            }),
            prisma.systemSetting.upsert({
                where: { key: 'stream_key' },
                update: { value: stream_key },
                create: { key: 'stream_key', value: stream_key }
            }),
            prisma.systemSetting.upsert({
                where: { key: 'is_auto_stream' },
                update: { value: String(is_auto_stream) },
                create: { key: 'is_auto_stream', value: String(is_auto_stream) }
            })
        ]);
        res.json({ message: "Pengaturan streaming berhasil diperbarui" });
    } catch (err) {
        console.error("Error updating stream settings:", err);
        res.status(500).json({ error: "Gagal memperbarui pengaturan streaming" });
    }
});

// GET /api/admin/settings
router.get('/admin/settings', async (req: Request, res: Response) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        const settingsMap = settings.reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsMap);
    } catch (err) {
        console.error("Error fetching all settings:", err);
        res.status(500).json({ error: "Gagal mengambil pengaturan sistem" });
    }
});

// POST /api/admin/settings
router.post('/admin/settings', async (req: Request, res: Response) => {
    const settings = req.body;
    try {
        const operations = Object.entries(settings).map(([key, value]) =>
            prisma.systemSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            })
        );
        await prisma.$transaction(operations);
        res.json({ message: "Pengaturan berhasil diperbarui" });
    } catch (err) {
        console.error("Error updating bulk settings:", err);
        res.status(500).json({ error: "Gagal memperbarui pengaturan" });
    }
});

// GET /api/admin/management/export
router.get('/admin/management/export', async (req: Request, res: Response) => {
    try {
        const [users, schedules, ratings, settings] = await Promise.all([
            prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, nip: true, fraksi: true, jabatan: true } }),
            prisma.schedule.findMany({ include: { participants: true } }),
            prisma.rating.findMany(),
            prisma.systemSetting.findMany()
        ]);

        const exportData = {
            exportedAt: new Date().toISOString(),
            users,
            schedules,
            ratings,
            settings
        };

        res.setHeader('Content-disposition', 'attachment; filename=meetdewan_export.json');
        res.setHeader('Content-type', 'application/json');
        res.status(200).send(JSON.stringify(exportData, null, 2));
    } catch (err) {
        console.error("Error exporting data:", err);
        res.status(500).json({ error: "Gagal mengekspor data" });
    }
});

// POST /api/admin/management/cleanup
router.post('/admin/management/cleanup', async (req: Request, res: Response) => {
    const { daysOld, type } = req.body;
    if (!daysOld || isNaN(Number(daysOld))) {
        return res.status(400).json({ error: "Parameter daysOld tidak valid" });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(daysOld));

    try {
        let deletedCount = 0;
        if (type === 'schedules' || type === 'all') {
            const result = await prisma.schedule.deleteMany({
                where: { startTime: { lt: cutoffDate } }
            });
            deletedCount += result.count;
        }

        res.json({ message: `Cleanup berhasil. ${deletedCount} item dihapus.`, deletedCount });
    } catch (err) {
        console.error("Error during cleanup:", err);
        res.status(500).json({ error: "Gagal melakukan cleanup data" });
    }
});

// POST /api/admin/sync-centre
router.post('/admin/sync-centre', async (req: Request, res: Response) => {
    const result = await syncHubData();
    if (result.success) {
        res.json({ message: "Sinkronisasi dengan Master Hub berhasil.", members_processed: result.processed });
    } else {
        res.status(500).json({ error: `Gagal sinkronisasi: ${result.error}` });
    }
});

export default router;
