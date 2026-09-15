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
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// 1. List all Dewan with Availability (Public)
router.get(['/dewan', '/users/dewan'], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_1.prisma.user.findMany({
            where: { role: 'dewan' },
            include: {
                availabilities: true,
                ratingsAsDewan: true,
                akdMemberships: {
                    include: { akd: true }
                }
            }
        });
        const dewanWithDetails = result.map((d) => {
            let avg = 4.5;
            if (d.ratingsAsDewan && d.ratingsAsDewan.length > 0) {
                const totalScores = d.ratingsAsDewan.reduce((acc, r) => acc + (r.speakingScore + r.contextScore + r.timeScore) / 3, 0);
                avg = totalScores / d.ratingsAsDewan.length;
            }
            let komisi = null;
            if (d.akdMemberships && Array.isArray(d.akdMemberships)) {
                const komisiMembership = d.akdMemberships.find((m) => {
                    const isTipeKomisi = m.akd && m.akd.tipe && m.akd.tipe.toLowerCase() === 'komisi';
                    const isNamaKomisi = m.akd && m.akd.nama && m.akd.nama.toLowerCase().includes('komisi');
                    return isTipeKomisi || isNamaKomisi;
                });
                if (komisiMembership) {
                    komisi = komisiMembership.akd.nama;
                }
            }
            if (!komisi) {
                const komisiMatch = d.jabatan ? d.jabatan.match(/Komisi\s+[A-VIX]+/) : null;
                komisi = komisiMatch ? komisiMatch[0] : "Lainnya";
            }
            return {
                id: d.id,
                name: d.name,
                bio: d.bio || "Tidak ada biodata.",
                rating: avg,
                availabilities: d.availabilities,
                fraksi: d.fraksi,
                jabatan: d.jabatan,
                komisi: komisi,
                dapil: d.dapil,
                akdMemberships: d.akdMemberships
            };
        });
        res.json(dewanWithDetails);
    }
    catch (err) {
        console.error("Error fetching dewan:", err);
        res.status(500).json({ error: "Gagal mengambil daftar dewan" });
    }
}));
// 2. Set Availability (Admin only)
router.post('/availability', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['dewan', 'admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { start_time, end_time, startTime, endTime, dewan_id, dewanId } = req.body;
    let targetDewanId = req.user.id;
    if (req.user.role === 'admin') {
        const adminDewanId = dewan_id || dewanId;
        if (!adminDewanId) {
            return res.status(400).json({ error: "Admin harus menyertakan dewan_id" });
        }
        targetDewanId = Number(adminDewanId);
    }
    else {
        return res.status(403).json({ error: "Hanya Admin yang dapat mengelola jadwal ketersediaan saat ini." });
    }
    const start = start_time || startTime;
    const end = end_time || endTime;
    if (!start || !end) {
        return res.status(400).json({ error: "Waktu mulai dan selesai wajib diisi" });
    }
    try {
        const result = yield prisma_1.prisma.availability.create({
            data: {
                dewanId: targetDewanId,
                startTime: new Date(start),
                endTime: new Date(end),
            }
        });
        res.status(201).json(result);
    }
    catch (err) {
        console.error("Error creating availability:", err);
        res.status(500).json({ error: "Gagal membuat ketersediaan waktu" });
    }
}));
// 3. Schedule a meeting (Protected)
router.post('/schedules', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dewan_ids, dewanIds, dewanId, start_time, startTime, title } = req.body;
    const masyarakat_id = req.user.id;
    const requestedTime = new Date(start_time || startTime);
    let rawIds = dewan_ids || dewanIds;
    if (!rawIds && dewanId) {
        rawIds = [dewanId];
    }
    if (!rawIds || !Array.isArray(rawIds) || rawIds.length === 0) {
        return res.status(400).json({ error: "Harus memilih minimal satu Anggota Dewan" });
    }
    try {
        const result = yield prisma_1.prisma.schedule.create({
            data: {
                title: title || "Diskusi Aspirasi",
                masyarakatId: masyarakat_id,
                startTime: requestedTime,
                participants: {
                    create: rawIds.map((id) => ({
                        dewanId: Number(id),
                        status: 'pending'
                    }))
                }
            },
            include: { participants: true }
        });
        // Trigger Socket.io notification if available on app
        const io = req.app.get('io');
        if (io) {
            io.emit('schedule:created', { scheduleId: result.id, title: result.title });
        }
        res.status(201).json(result);
    }
    catch (err) {
        console.error("Error creating schedule:", err);
        res.status(500).json({ error: "Gagal membuat jadwal pertemuan" });
    }
}));
// 4. Get Schedules (Protected - Context sensitive)
router.get('/schedules', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role, id: userId } = req.user;
    try {
        const where = {};
        if (role === 'dewan')
            where.participants = { some: { dewanId: Number(userId) } };
        if (role === 'masyarakat')
            where.masyarakatId = Number(userId);
        const result = yield prisma_1.prisma.schedule.findMany({
            where,
            orderBy: { startTime: 'desc' },
            include: {
                masyarakat: { select: { name: true } },
                participants: {
                    include: { dewan: { select: { id: true, name: true, fraksi: true } } }
                },
                ratings: true,
                followUps: true
            }
        });
        const formatted = result.map((s) => {
            var _a;
            let myStatus = 'pending';
            if (role === 'dewan') {
                const myParticipant = s.participants.find((p) => p.dewanId === Number(userId));
                if (myParticipant)
                    myStatus = myParticipant.status;
            }
            else {
                myStatus = s.participants.some((p) => p.status === 'confirmed')
                    ? 'confirmed'
                    : s.participants.every((p) => p.status === 'rejected')
                        ? 'rejected'
                        : 'pending';
            }
            return Object.assign(Object.assign({}, s), { status: myStatus, followUp: ((_a = s.followUps) === null || _a === void 0 ? void 0 : _a[0]) || null });
        });
        res.json(formatted);
    }
    catch (err) {
        console.error("Error fetching schedules:", err);
        res.status(500).json({ error: "Gagal mengambil data jadwal" });
    }
}));
// 5. Update Schedule Status (Dewan/Admin only)
router.patch('/schedules/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['dewan', 'admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status, dewan_id, dewanId } = req.body;
    let targetDewanId = req.user.id;
    const adminTargetId = dewan_id || dewanId;
    if (req.user.role === 'admin' && adminTargetId) {
        targetDewanId = Number(adminTargetId);
    }
    try {
        if (req.user.role === 'admin' && !adminTargetId) {
            const participant = yield prisma_1.prisma.scheduleParticipant.findFirst({
                where: { scheduleId: Number(id) }
            });
            if (participant) {
                targetDewanId = participant.dewanId;
            }
        }
        const result = yield prisma_1.prisma.scheduleParticipant.update({
            where: {
                scheduleId_dewanId: {
                    scheduleId: Number(id),
                    dewanId: targetDewanId
                }
            },
            data: { status }
        });
        const io = req.app.get('io');
        if (io) {
            io.emit('schedule:updated', { scheduleId: Number(id), status, dewanId: targetDewanId });
        }
        res.json(result);
    }
    catch (err) {
        console.error("Error updating schedule participant:", err);
        res.status(500).json({ error: "Gagal memperbarui status. Mungkin Anda bukan partisipan di jadwal ini." });
    }
}));
// 6. Submit Multi-Aspect Rating
router.post('/ratings', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['masyarakat', 'admin', 'dewan']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { schedule_id, scheduleId, dewan_id, dewanId, speaking_score, speakingScore, context_score, contextScore, time_score, timeScore, responsiveness_score, responsivenessScore, solution_score, solutionScore, comment } = req.body;
    const sId = Number(schedule_id || scheduleId);
    const dId = Number(dewan_id || dewanId);
    const speak = Number(speaking_score || speakingScore || 5);
    const ctx = Number(context_score || contextScore || 5);
    const time = Number(time_score || timeScore || 5);
    const resp = Number(responsiveness_score || responsivenessScore || 5);
    const sol = Number(solution_score || solutionScore || 5);
    if (!sId || !dId) {
        return res.status(400).json({ error: "scheduleId dan dewanId wajib diisi" });
    }
    try {
        const result = yield prisma_1.prisma.rating.create({
            data: {
                schedule: { connect: { id: sId } },
                dewan: { connect: { id: dId } },
                speakingScore: speak,
                contextScore: ctx,
                timeScore: time,
                responsivenessScore: resp,
                solutionScore: sol,
                comment: comment || null
            }
        });
        const io = req.app.get('io');
        if (io) {
            io.emit('rating:created', { scheduleId: sId, dewanId: dId });
        }
        res.status(201).json(result);
    }
    catch (err) {
        console.error("Error submitting rating:", err);
        res.status(500).json({ error: "Gagal mengirim penilaian" });
    }
}));
exports.default = router;
