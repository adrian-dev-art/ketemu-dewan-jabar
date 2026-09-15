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
const livekit_server_sdk_1 = require("livekit-server-sdk");
const prisma_1 = require("../lib/prisma");
const livekit_1 = require("../config/livekit");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// POST /api/livekit/token
router.post('/livekit/token', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomName, scheduleId } = req.body;
    const participantName = req.user.email;
    try {
        const parsedScheduleId = Number(scheduleId);
        if (isNaN(parsedScheduleId)) {
            return res.status(400).json({ error: "scheduleId is required and must be a number" });
        }
        const isParticipant = yield prisma_1.prisma.scheduleParticipant.findFirst({
            where: {
                scheduleId: parsedScheduleId,
                dewanId: req.user.role === 'dewan' ? req.user.id : undefined,
            }
        });
        const isMasyarakat = yield prisma_1.prisma.schedule.findFirst({
            where: {
                id: parsedScheduleId,
                masyarakatId: req.user.id
            }
        });
        if (!isParticipant && !isMasyarakat && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Anda bukan partisipan resmi untuk pertemuan ini." });
        }
        const displayName = req.user.role.toUpperCase() + ": " + participantName.split('@')[0];
        const token = yield (0, livekit_1.generateLiveKitToken)(participantName, displayName, roomName);
        // Check if we should auto-start streaming
        if (scheduleId && !isNaN(parsedScheduleId)) {
            const autoStream = yield prisma_1.prisma.systemSetting.findUnique({ where: { key: 'is_auto_stream' } });
            if ((autoStream === null || autoStream === void 0 ? void 0 : autoStream.value) === 'true') {
                const schedule = yield prisma_1.prisma.schedule.findUnique({ where: { id: parsedScheduleId } });
                if (schedule && !schedule.isStreaming) {
                    const url = yield prisma_1.prisma.systemSetting.findUnique({ where: { key: 'stream_url' } });
                    const key = yield prisma_1.prisma.systemSetting.findUnique({ where: { key: 'stream_key' } });
                    if ((url === null || url === void 0 ? void 0 : url.value) && (key === null || key === void 0 ? void 0 : key.value)) {
                        const fullStreamUrl = `${url.value}/${key.value}`;
                        try {
                            console.log(`[STREAM API] Starting auto-egress for room: ${roomName} to ${url.value}`);
                            const info = yield livekit_1.egressClient.startRoomCompositeEgress(roomName, {
                                stream: { urls: [fullStreamUrl] },
                                options: { preset: livekit_server_sdk_1.EncodingOptionsPreset.H264_1080P_30 }
                            });
                            yield prisma_1.prisma.schedule.update({
                                where: { id: parsedScheduleId },
                                data: { isStreaming: true, egressId: info.egressId }
                            });
                            console.log(`[STREAM API] Auto-streaming started successfully for room ${roomName}, egressId: ${info.egressId}`);
                        }
                        catch (egressErr) {
                            console.error("[STREAM API] Failed to auto-start egress:", egressErr);
                        }
                    }
                }
            }
        }
        res.json({ token });
    }
    catch (error) {
        console.error("Error generating LiveKit token:", error);
        res.status(500).json({ error: "Failed to generate token" });
    }
}));
// POST /api/livekit/record/start
router.post('/livekit/record/start', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['admin', 'dewan']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { scheduleId, roomName } = req.body;
    try {
        console.log(`[RECORD API] Record start requested for room: ${roomName}`);
        const parsedScheduleId = Number(scheduleId);
        if (isNaN(parsedScheduleId)) {
            return res.status(400).json({ error: "ID Jadwal tidak valid" });
        }
        const schedule = yield prisma_1.prisma.schedule.findUnique({ where: { id: parsedScheduleId } });
        if (schedule && !schedule.isRecording) {
            const timestamp = new Date().getTime();
            const fileName = `recording_${parsedScheduleId}_${timestamp}.mp4`;
            const filePath = `/recordings/${fileName}`;
            const recordingUrl = `/recordings/${fileName}`;
            const info = yield livekit_1.egressClient.startRoomCompositeEgress(roomName, {
                file: { filepath: filePath },
                options: { preset: livekit_server_sdk_1.EncodingOptionsPreset.H264_1080P_30 }
            });
            yield prisma_1.prisma.schedule.update({
                where: { id: parsedScheduleId },
                data: { isRecording: true, egressId: info.egressId, recordingUrl }
            });
            console.log(`[RECORD API] Recording started. egressId: ${info.egressId}`);
            res.json({ message: "Rekaman dimulai", egressId: info.egressId });
        }
        else {
            res.status(400).json({ error: "Sesi sudah merekam atau tidak ditemukan" });
        }
    }
    catch (err) {
        console.error("[RECORD API] Error starting recording:", err);
        res.status(500).json({ error: "Gagal memulai rekaman" });
    }
}));
// POST /api/livekit/record/stop
router.post('/livekit/record/stop', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['admin', 'dewan']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { scheduleId } = req.body;
    try {
        console.log(`[RECORD API] Record stop requested for scheduleId: ${scheduleId}`);
        const parsedScheduleId = Number(scheduleId);
        if (isNaN(parsedScheduleId)) {
            return res.status(400).json({ error: "ID Jadwal tidak valid" });
        }
        const schedule = yield prisma_1.prisma.schedule.findUnique({ where: { id: parsedScheduleId } });
        if ((schedule === null || schedule === void 0 ? void 0 : schedule.egressId) && schedule.isRecording) {
            try {
                yield livekit_1.egressClient.stopEgress(schedule.egressId);
            }
            catch (egressErr) {
                console.warn(`[RECORD API] LiveKit stopEgress warned: ${egressErr.message}`);
                if (egressErr.status !== 412 && !((_a = egressErr.message) === null || _a === void 0 ? void 0 : _a.includes("cannot be stopped"))) {
                    throw egressErr;
                }
            }
            yield prisma_1.prisma.schedule.update({
                where: { id: parsedScheduleId },
                data: {
                    isRecording: false,
                    egressId: null,
                }
            });
            console.log(`[RECORD API] Recording stopped successfully for scheduleId: ${parsedScheduleId}`);
            res.json({ message: "Rekaman dihentikan" });
        }
        else {
            console.warn(`[RECORD API] No active recording found for scheduleId: ${parsedScheduleId}`);
            res.status(404).json({ error: "Tidak ada sesi rekaman aktif" });
        }
    }
    catch (err) {
        console.error("[RECORD API] Error stopping recording:", err);
        res.status(500).json({ error: "Gagal menghentikan rekaman: " + (err.message || "Unknown error") });
    }
}));
// POST /api/livekit/egress/start
router.post('/livekit/egress/start', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['admin', 'dewan']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { scheduleId, roomName } = req.body;
    try {
        console.log(`[STREAM API] Manual stream start requested for room: ${roomName}`);
        const parsedScheduleId = Number(scheduleId);
        if (isNaN(parsedScheduleId)) {
            return res.status(400).json({ error: "ID Jadwal tidak valid" });
        }
        const schedule = yield prisma_1.prisma.schedule.findUnique({ where: { id: parsedScheduleId } });
        if (schedule && !schedule.isStreaming) {
            const url = yield prisma_1.prisma.systemSetting.findUnique({ where: { key: 'stream_url' } });
            const key = yield prisma_1.prisma.systemSetting.findUnique({ where: { key: 'stream_key' } });
            if ((url === null || url === void 0 ? void 0 : url.value) && (key === null || key === void 0 ? void 0 : key.value)) {
                const fullStreamUrl = `${url.value}/${key.value}`;
                console.log(`[STREAM API] Streaming destination: ${url.value}`);
                const info = yield livekit_1.egressClient.startRoomCompositeEgress(roomName, {
                    stream: { urls: [fullStreamUrl] },
                    options: { preset: livekit_server_sdk_1.EncodingOptionsPreset.H264_1080P_30 }
                });
                yield prisma_1.prisma.schedule.update({
                    where: { id: parsedScheduleId },
                    data: { isStreaming: true, egressId: info.egressId }
                });
                console.log(`[STREAM API] Manual streaming started successfully! egressId: ${info.egressId}`);
                res.json({ message: "Streaming dimulai", egressId: info.egressId });
            }
            else {
                console.error(`[STREAM API] Manual start failed: Missing stream keys in database!`);
                res.status(400).json({ error: "Stream URL / Key kosong di pengaturan" });
            }
        }
        else {
            res.status(400).json({ error: "Sesi sudah streaming atau tidak ditemukan" });
        }
    }
    catch (err) {
        console.error("[STREAM API] Error starting egress manually:", err);
        res.status(500).json({ error: "Gagal memulai streaming" });
    }
}));
// POST /api/livekit/egress/stop
router.post('/livekit/egress/stop', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['admin', 'dewan']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { scheduleId } = req.body;
    try {
        console.log(`[STREAM API] Manual stream stop requested for scheduleId: ${scheduleId}`);
        const parsedScheduleId = Number(scheduleId);
        if (isNaN(parsedScheduleId)) {
            return res.status(400).json({ error: "ID Jadwal tidak valid" });
        }
        const schedule = yield prisma_1.prisma.schedule.findUnique({ where: { id: parsedScheduleId } });
        if (schedule === null || schedule === void 0 ? void 0 : schedule.egressId) {
            try {
                yield livekit_1.egressClient.stopEgress(schedule.egressId);
            }
            catch (egressErr) {
                console.warn(`[STREAM API] LiveKit stopEgress warned: ${egressErr.message}`);
                if (egressErr.status !== 412 && !((_a = egressErr.message) === null || _a === void 0 ? void 0 : _a.includes("cannot be stopped"))) {
                    throw egressErr;
                }
            }
            yield prisma_1.prisma.schedule.update({
                where: { id: parsedScheduleId },
                data: { isStreaming: false, egressId: null }
            });
            res.json({ message: "Streaming dihentikan" });
        }
        else {
            res.status(404).json({ error: "Tidak ada session streaming aktif" });
        }
    }
    catch (err) {
        console.error("[STREAM API] Error stopping egress:", err);
        res.status(500).json({ error: "Gagal menghentikan streaming" });
    }
}));
exports.default = router;
