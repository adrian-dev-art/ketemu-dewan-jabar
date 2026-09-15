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
exports.transcribeVideo = transcribeVideo;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const client_1 = require("@prisma/client");
const analysisService_1 = require("./analysisService");
const prisma = new client_1.PrismaClient();
function transcribeVideo(scheduleId, videoPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[PIPELINE] Starting for schedule: ${scheduleId}, path: ${videoPath}`);
            if (!fs.existsSync(videoPath)) {
                throw new Error(`Video file not found: ${videoPath}`);
            }
            // 1. Mark as processing
            yield prisma.schedule.update({
                where: { id: scheduleId },
                data: {
                    isTranscribing: true,
                    isAnalyzing: true,
                    transcriptionProgress: 10,
                    transcriptionStatus: "Mengekstrak audio dari video..."
                }
            });
            const audioPath = videoPath.replace('.mp4', `_${Date.now()}.wav`);
            // 2. Extract audio using ffmpeg (necessary for Gemini File API)
            console.log(`[PIPELINE] Extracting audio to: ${audioPath}`);
            yield new Promise((resolve, reject) => {
                const ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
                    '-y',
                    '-i', videoPath,
                    '-ar', '16000',
                    '-ac', '1',
                    '-c:a', 'pcm_s16le',
                    audioPath
                ]);
                let stderr = "";
                ffmpeg.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
                ffmpeg.on('close', (code) => {
                    if (code === 0)
                        resolve(true);
                    else {
                        console.error(`[FFMPEG ERROR]: ${stderr}`);
                        reject(new Error(`ffmpeg failed with code ${code}`));
                    }
                });
            });
            yield prisma.schedule.update({
                where: { id: scheduleId },
                data: {
                    transcriptionProgress: 40,
                    transcriptionStatus: "Mengunggah audio ke AI..."
                }
            });
            // 3. Delegate to Gemini Multimodal (Transcription + Analysis)
            console.log(`[PIPELINE] Sending audio to Gemini for Transcription & Analysis...`);
            yield (0, analysisService_1.processMeetingAudio)(scheduleId, audioPath);
            // 4. Cleanup audio file
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
            }
            yield prisma.schedule.update({
                where: { id: scheduleId },
                data: {
                    isTranscribing: false,
                    isAnalyzing: false,
                    transcriptionProgress: 100,
                    transcriptionStatus: "Selesai"
                }
            });
            console.log(`[PIPELINE] Fully completed for schedule: ${scheduleId}`);
        }
        catch (err) {
            console.error(`[PIPELINE] Error for schedule ${scheduleId}:`, err);
            yield prisma.schedule.update({
                where: { id: scheduleId },
                data: {
                    isTranscribing: false,
                    isAnalyzing: false,
                    transcriptionStatus: `Gagal: ${err.message || 'Terjadi kesalahan internal'}`
                }
            });
        }
    });
}
