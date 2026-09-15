"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.processTranscriptionQueue = processTranscriptionQueue;
exports.startQueueDaemon = startQueueDaemon;
const client_1 = require("@prisma/client");
const transcriptionService_1 = require("./transcriptionService");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const prisma = new client_1.PrismaClient();
let isProcessing = false;
function processTranscriptionQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isProcessing)
            return;
        try {
            isProcessing = true;
            // Cari satu jadwal yang ada videonya tapi belum dianalisis, dan tidak sedang diproses
            const pendingJob = yield prisma.schedule.findFirst({
                where: {
                    recordingUrl: { not: null },
                    analysis: { equals: client_1.Prisma.AnyNull },
                    OR: [
                        { transcriptionStatus: { equals: null } },
                        { transcriptionStatus: { notIn: ['Selesai', 'Gagal', 'Gagal: File Video Hilang'] } }
                    ],
                    isTranscribing: false,
                    isRecording: false
                },
                orderBy: { id: 'asc' } // Kerjakan yang paling lama antre
            });
            if (pendingJob) {
                console.log(`[QUEUE] Menemukan tugas tertunda: ID #${pendingJob.id}. Memulai pemrosesan...`);
                // Tandai sedang diproses agar tidak diambil oleh siklus berikutnya
                yield prisma.schedule.update({
                    where: { id: pendingJob.id },
                    data: { isTranscribing: true, transcriptionProgress: 0 }
                });
                const fileName = path.basename(pendingJob.recordingUrl);
                let videoPath = path.join(process.cwd(), '..', 'recordings', fileName);
                if (!fs.existsSync(videoPath)) {
                    videoPath = path.join(process.cwd(), 'recordings', fileName);
                }
                if (fs.existsSync(videoPath)) {
                    // Jalankan proses secara langsung (native), tidak pakai spawn worker baru
                    yield (0, transcriptionService_1.transcribeVideo)(pendingJob.id, videoPath);
                }
                else {
                    const match = fileName.match(/_(\d+)\.mp4$/);
                    const fileAge = match ? Date.now() - parseInt(match[1]) : 5 * 60 * 1000; // Default to 5 mins if no timestamp found
                    if (fileAge < 5 * 60 * 1000) {
                        console.warn(`[QUEUE] File video belum ada untuk ID #${pendingJob.id}: ${videoPath}. Menunggu Egress (umur: ${Math.round(fileAge / 1000)}s)...`);
                        yield prisma.schedule.update({
                            where: { id: pendingJob.id },
                            data: { isTranscribing: false, transcriptionStatus: 'Menunggu file video...' }
                        });
                    }
                    else {
                        console.error(`[QUEUE] File video hilang untuk ID #${pendingJob.id}: ${videoPath} (sudah melebihi waktu tunggu)`);
                        yield prisma.schedule.update({
                            where: { id: pendingJob.id },
                            data: { isTranscribing: false, transcriptionStatus: 'Gagal: File Video Hilang' }
                        });
                    }
                }
            }
        }
        catch (error) {
            console.error("[QUEUE] Error di sistem antrean:", error);
        }
        finally {
            isProcessing = false;
        }
    });
}
// Mulai sistem antrean yang akan mengecek setiap 15 detik
function startQueueDaemon() {
    console.log("[QUEUE] Daemon antrean transkripsi AI diaktifkan.");
    setInterval(processTranscriptionQueue, 15000);
}
