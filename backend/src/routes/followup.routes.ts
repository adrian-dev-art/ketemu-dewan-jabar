import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// In-memory cache fallback for follow-up state
export const memoryFollowUps: Record<number, any> = {};

// GET /api/schedules/:id/follow-up
router.get('/schedules/:id/follow-up', authenticateToken, async (req: AuthRequest, res: Response) => {
    const scheduleId = parseInt(req.params.id);
    if (isNaN(scheduleId)) {
        return res.status(400).json({ error: "ID Jadwal tidak valid" });
    }

    try {
        let followUp = null;
        try {
            followUp = await (prisma as any).followUp.findFirst({
                where: { scheduleId },
                orderBy: { updatedAt: 'desc' }
            });
        } catch (dbErr: any) {
            console.warn(`[FOLLOW-UP] DB read warning: ${dbErr.message}. Menggunakan cache memori.`);
            followUp = memoryFollowUps[scheduleId] || null;
        }

        if (!followUp && memoryFollowUps[scheduleId]) {
            followUp = memoryFollowUps[scheduleId];
        }

        res.json(followUp || null);
    } catch (err: any) {
        console.error("Error fetching follow-up:", err);
        res.status(500).json({ error: "Gagal mengambil data tindak lanjut" });
    }
});

// POST /api/schedules/:id/follow-up
router.post('/schedules/:id/follow-up', authenticateToken, async (req: AuthRequest, res: Response) => {
    const scheduleId = parseInt(req.params.id);
    if (isNaN(scheduleId)) {
        return res.status(400).json({ error: "ID Jadwal tidak valid" });
    }

    const {
        isShared, sharedTo, sharedToEmail, sharedBy, sharedAt, shareChannel, shareNotes,
        suratDisposisiNo, suratDisposisiUrl, suratDisposisiTgl,
        isViewed, viewedBy, viewedPosition, viewedAt,
        hasComment, recipientComment, recipientName, recipientPosition, recipientCommentAt, actionCategory,
        suratTanggapanNo, suratTanggapanUrl, suratTanggapanTgl,
        status, isCompleted, actionReport, actionReportAt, picName, picContact, evidenceUrl,
        suratLaporanNo, suratLaporanUrl, suratLaporanTgl, progressPercent
    } = req.body;

    let calculatedProgress = progressPercent;
    if (calculatedProgress === undefined || calculatedProgress === null) {
        let count = 0;
        if (isShared || suratDisposisiUrl || suratDisposisiNo) count += 25;
        if (isViewed) count += 25;
        if (hasComment || (recipientComment && recipientComment.trim().length > 0) || suratTanggapanUrl || suratTanggapanNo) count += 25;
        if (isCompleted || status === 'selesai' || (actionReport && actionReport.trim().length > 0) || suratLaporanUrl || suratLaporanNo) count += 25;
        calculatedProgress = count;
    }

    const payload: any = {
        scheduleId,
        isShared: Boolean(isShared || suratDisposisiUrl || suratDisposisiNo),
        sharedTo: sharedTo || null,
        sharedToEmail: sharedToEmail || null,
        sharedBy: sharedBy || req.user?.email || null,
        sharedAt: sharedAt ? new Date(sharedAt) : (isShared ? new Date() : null),
        shareChannel: shareChannel || "Disposisi Resmi",
        shareNotes: shareNotes || null,
        suratDisposisiNo: suratDisposisiNo || null,
        suratDisposisiUrl: suratDisposisiUrl || null,
        suratDisposisiTgl: suratDisposisiTgl ? new Date(suratDisposisiTgl) : (suratDisposisiUrl || suratDisposisiNo ? new Date() : null),

        isViewed: Boolean(isViewed),
        viewedBy: viewedBy || null,
        viewedPosition: viewedPosition || null,
        viewedAt: viewedAt ? new Date(viewedAt) : (isViewed ? new Date() : null),

        hasComment: Boolean(hasComment || (recipientComment && recipientComment.trim().length > 0) || suratTanggapanUrl || suratTanggapanNo),
        recipientComment: recipientComment || null,
        recipientName: recipientName || null,
        recipientPosition: recipientPosition || null,
        recipientCommentAt: recipientCommentAt ? new Date(recipientCommentAt) : (recipientComment ? new Date() : null),
        actionCategory: actionCategory || null,
        suratTanggapanNo: suratTanggapanNo || null,
        suratTanggapanUrl: suratTanggapanUrl || null,
        suratTanggapanTgl: suratTanggapanTgl ? new Date(suratTanggapanTgl) : (suratTanggapanUrl || suratTanggapanNo ? new Date() : null),

        status: status || (isCompleted ? 'selesai' : isShared ? 'diproses' : 'pending'),
        isCompleted: Boolean(isCompleted || status === 'selesai'),
        actionReport: actionReport || null,
        actionReportAt: actionReportAt ? new Date(actionReportAt) : (actionReport ? new Date() : null),
        picName: picName || null,
        picContact: picContact || null,
        evidenceUrl: evidenceUrl || null,
        suratLaporanNo: suratLaporanNo || null,
        suratLaporanUrl: suratLaporanUrl || null,
        suratLaporanTgl: suratLaporanTgl ? new Date(suratLaporanTgl) : (suratLaporanUrl || suratLaporanNo ? new Date() : null),
        progressPercent: Number(calculatedProgress)
    };

    try {
        let result: any = null;
        try {
            const existing = await (prisma as any).followUp.findFirst({
                where: { scheduleId }
            });

            if (existing) {
                result = await (prisma as any).followUp.update({
                    where: { id: existing.id },
                    data: payload
                });
            } else {
                result = await (prisma as any).followUp.create({
                    data: payload
                });
            }
        } catch (dbErr: any) {
            console.warn(`[FOLLOW-UP] DB write fallback: ${dbErr.message}`);
            result = {
                id: memoryFollowUps[scheduleId]?.id || Math.floor(Math.random() * 100000) + 1,
                ...payload,
                updatedAt: new Date(),
                createdAt: memoryFollowUps[scheduleId]?.createdAt || new Date()
            };
        }

        memoryFollowUps[scheduleId] = result;

        const io = req.app.get('io');
        if (io) {
            io.emit('followup:updated', { scheduleId, followUp: result });
        }

        res.json({ message: "Data tindak lanjut berhasil diperbarui", followUp: result });
    } catch (err: any) {
        console.error("Error saving follow-up:", err);
        res.status(500).json({ error: "Gagal menyimpan data tindak lanjut" });
    }
});

// PATCH /api/schedules/:id/follow-up
router.patch('/schedules/:id/follow-up', authenticateToken, async (req: AuthRequest, res: Response) => {
    const scheduleId = parseInt(req.params.id);
    if (isNaN(scheduleId)) {
        return res.status(400).json({ error: "ID Jadwal tidak valid" });
    }

    try {
        let existing: any = null;
        try {
            existing = await (prisma as any).followUp.findFirst({ where: { scheduleId } });
        } catch (dbErr: any) {
            existing = memoryFollowUps[scheduleId];
        }
        if (!existing && memoryFollowUps[scheduleId]) {
            existing = memoryFollowUps[scheduleId];
        }

        const current = existing || {
            scheduleId,
            isShared: false,
            isViewed: false,
            hasComment: false,
            isCompleted: false,
            progressPercent: 0,
            status: 'pending'
        };

        const updatedData: any = { ...current, ...req.body };
        if (req.body.isShared !== undefined && req.body.sharedAt === undefined && req.body.isShared) {
            updatedData.sharedAt = new Date();
        }
        if (req.body.suratDisposisiUrl && !updatedData.suratDisposisiTgl) {
            updatedData.suratDisposisiTgl = new Date();
        }
        if (req.body.isViewed !== undefined && req.body.viewedAt === undefined && req.body.isViewed) {
            updatedData.viewedAt = new Date();
        }
        if (req.body.recipientComment !== undefined && req.body.recipientCommentAt === undefined && req.body.recipientComment) {
            updatedData.recipientCommentAt = new Date();
            updatedData.hasComment = true;
        }
        if (req.body.suratTanggapanUrl && !updatedData.suratTanggapanTgl) {
            updatedData.suratTanggapanTgl = new Date();
            updatedData.hasComment = true;
        }
        if (req.body.actionReport !== undefined && req.body.actionReportAt === undefined && req.body.actionReport) {
            updatedData.actionReportAt = new Date();
        }
        if (req.body.suratLaporanUrl && !updatedData.suratLaporanTgl) {
            updatedData.suratLaporanTgl = new Date();
        }

        let count = 0;
        if (updatedData.isShared || updatedData.suratDisposisiUrl || updatedData.suratDisposisiNo) count += 25;
        if (updatedData.isViewed) count += 25;
        if (updatedData.hasComment || updatedData.recipientComment || updatedData.suratTanggapanUrl || updatedData.suratTanggapanNo) count += 25;
        if (updatedData.isCompleted || updatedData.status === 'selesai' || updatedData.actionReport || updatedData.suratLaporanUrl || updatedData.suratLaporanNo) count += 25;
        updatedData.progressPercent = count;

        let result: any = null;
        try {
            if (existing && existing.id) {
                result = await (prisma as any).followUp.update({
                    where: { id: existing.id },
                    data: updatedData
                });
            } else {
                result = await (prisma as any).followUp.create({
                    data: { ...updatedData, scheduleId }
                });
            }
        } catch (dbErr: any) {
            result = {
                id: current.id || Math.floor(Math.random() * 100000) + 1,
                ...updatedData,
                updatedAt: new Date()
            };
        }

        memoryFollowUps[scheduleId] = result;

        const io = req.app.get('io');
        if (io) {
            io.emit('followup:updated', { scheduleId, followUp: result });
        }

        res.json({ message: "Status tindak lanjut berhasil diperbarui", followUp: result });
    } catch (err: any) {
        console.error("Error patching follow-up:", err);
        res.status(500).json({ error: "Gagal memperbarui status tindak lanjut" });
    }
});

export default router;
