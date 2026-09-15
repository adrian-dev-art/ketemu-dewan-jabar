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
exports.memoryFollowUps = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// In-memory cache fallback for follow-up state
exports.memoryFollowUps = {};
// GET /api/schedules/:id/follow-up
router.get('/schedules/:id/follow-up', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const scheduleId = parseInt(req.params.id);
    if (isNaN(scheduleId)) {
        return res.status(400).json({ error: "ID Jadwal tidak valid" });
    }
    try {
        let followUp = null;
        try {
            followUp = yield prisma_1.prisma.followUp.findFirst({
                where: { scheduleId },
                orderBy: { updatedAt: 'desc' }
            });
        }
        catch (dbErr) {
            console.warn(`[FOLLOW-UP] DB read warning: ${dbErr.message}. Menggunakan cache memori.`);
            followUp = exports.memoryFollowUps[scheduleId] || null;
        }
        if (!followUp && exports.memoryFollowUps[scheduleId]) {
            followUp = exports.memoryFollowUps[scheduleId];
        }
        res.json(followUp || null);
    }
    catch (err) {
        console.error("Error fetching follow-up:", err);
        res.status(500).json({ error: "Gagal mengambil data tindak lanjut" });
    }
}));
// POST /api/schedules/:id/follow-up
router.post('/schedules/:id/follow-up', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const scheduleId = parseInt(req.params.id);
    if (isNaN(scheduleId)) {
        return res.status(400).json({ error: "ID Jadwal tidak valid" });
    }
    const { isShared, sharedTo, sharedToEmail, sharedBy, sharedAt, shareChannel, shareNotes, suratDisposisiNo, suratDisposisiUrl, suratDisposisiTgl, isViewed, viewedBy, viewedPosition, viewedAt, hasComment, recipientComment, recipientName, recipientPosition, recipientCommentAt, actionCategory, suratTanggapanNo, suratTanggapanUrl, suratTanggapanTgl, status, isCompleted, actionReport, actionReportAt, picName, picContact, evidenceUrl, suratLaporanNo, suratLaporanUrl, suratLaporanTgl, progressPercent } = req.body;
    let calculatedProgress = progressPercent;
    if (calculatedProgress === undefined || calculatedProgress === null) {
        let count = 0;
        if (isShared || suratDisposisiUrl || suratDisposisiNo)
            count += 25;
        if (isViewed)
            count += 25;
        if (hasComment || (recipientComment && recipientComment.trim().length > 0) || suratTanggapanUrl || suratTanggapanNo)
            count += 25;
        if (isCompleted || status === 'selesai' || (actionReport && actionReport.trim().length > 0) || suratLaporanUrl || suratLaporanNo)
            count += 25;
        calculatedProgress = count;
    }
    const payload = {
        scheduleId,
        isShared: Boolean(isShared || suratDisposisiUrl || suratDisposisiNo),
        sharedTo: sharedTo || null,
        sharedToEmail: sharedToEmail || null,
        sharedBy: sharedBy || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.email) || null,
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
        let result = null;
        try {
            const existing = yield prisma_1.prisma.followUp.findFirst({
                where: { scheduleId }
            });
            if (existing) {
                result = yield prisma_1.prisma.followUp.update({
                    where: { id: existing.id },
                    data: payload
                });
            }
            else {
                result = yield prisma_1.prisma.followUp.create({
                    data: payload
                });
            }
        }
        catch (dbErr) {
            console.warn(`[FOLLOW-UP] DB write fallback: ${dbErr.message}`);
            result = Object.assign(Object.assign({ id: ((_b = exports.memoryFollowUps[scheduleId]) === null || _b === void 0 ? void 0 : _b.id) || Math.floor(Math.random() * 100000) + 1 }, payload), { updatedAt: new Date(), createdAt: ((_c = exports.memoryFollowUps[scheduleId]) === null || _c === void 0 ? void 0 : _c.createdAt) || new Date() });
        }
        exports.memoryFollowUps[scheduleId] = result;
        const io = req.app.get('io');
        if (io) {
            io.emit('followup:updated', { scheduleId, followUp: result });
        }
        res.json({ message: "Data tindak lanjut berhasil diperbarui", followUp: result });
    }
    catch (err) {
        console.error("Error saving follow-up:", err);
        res.status(500).json({ error: "Gagal menyimpan data tindak lanjut" });
    }
}));
// PATCH /api/schedules/:id/follow-up
router.patch('/schedules/:id/follow-up', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const scheduleId = parseInt(req.params.id);
    if (isNaN(scheduleId)) {
        return res.status(400).json({ error: "ID Jadwal tidak valid" });
    }
    try {
        let existing = null;
        try {
            existing = yield prisma_1.prisma.followUp.findFirst({ where: { scheduleId } });
        }
        catch (dbErr) {
            existing = exports.memoryFollowUps[scheduleId];
        }
        if (!existing && exports.memoryFollowUps[scheduleId]) {
            existing = exports.memoryFollowUps[scheduleId];
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
        const updatedData = Object.assign(Object.assign({}, current), req.body);
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
        if (updatedData.isShared || updatedData.suratDisposisiUrl || updatedData.suratDisposisiNo)
            count += 25;
        if (updatedData.isViewed)
            count += 25;
        if (updatedData.hasComment || updatedData.recipientComment || updatedData.suratTanggapanUrl || updatedData.suratTanggapanNo)
            count += 25;
        if (updatedData.isCompleted || updatedData.status === 'selesai' || updatedData.actionReport || updatedData.suratLaporanUrl || updatedData.suratLaporanNo)
            count += 25;
        updatedData.progressPercent = count;
        let result = null;
        try {
            if (existing && existing.id) {
                result = yield prisma_1.prisma.followUp.update({
                    where: { id: existing.id },
                    data: updatedData
                });
            }
            else {
                result = yield prisma_1.prisma.followUp.create({
                    data: Object.assign(Object.assign({}, updatedData), { scheduleId })
                });
            }
        }
        catch (dbErr) {
            result = Object.assign(Object.assign({ id: current.id || Math.floor(Math.random() * 100000) + 1 }, updatedData), { updatedAt: new Date() });
        }
        exports.memoryFollowUps[scheduleId] = result;
        const io = req.app.get('io');
        if (io) {
            io.emit('followup:updated', { scheduleId, followUp: result });
        }
        res.json({ message: "Status tindak lanjut berhasil diperbarui", followUp: result });
    }
    catch (err) {
        console.error("Error patching follow-up:", err);
        res.status(500).json({ error: "Gagal memperbarui status tindak lanjut" });
    }
}));
exports.default = router;
