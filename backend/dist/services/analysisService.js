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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMeetingAudio = processMeetingAudio;
exports.analyzeTranscript = analyzeTranscript;
const generative_ai_1 = require("@google/generative-ai");
const server_1 = require("@google/generative-ai/server");
const client_1 = require("@prisma/client");
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
dotenv.config();
const prisma = new client_1.PrismaClient();
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
const fileManager = new server_1.GoogleAIFileManager(apiKey);
/**
 * Process audio file using Gemini Multimodal
 * Transcribes and Analyzes in one request to save tokens/RPM
 */
function processMeetingAudio(scheduleId, audioPath) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        try {
            console.log(`[AI-PIPELINE] Processing audio for schedule: ${scheduleId}`);
            if (!apiKey) {
                console.warn("[AI-PIPELINE] GEMINI_API_KEY not found. Skipping AI process.");
                return;
            }
            if (!fs.existsSync(audioPath)) {
                throw new Error(`Audio file not found: ${audioPath}`);
            }
            // 1. Mark as processing
            yield prisma.schedule.update({
                where: { id: scheduleId },
                data: { isTranscribing: true, isAnalyzing: true }
            });
            // 2. Upload file to Gemini File API
            console.log(`[AI-PIPELINE] Uploading audio to Gemini File API...`);
            const uploadResult = yield fileManager.uploadFile(audioPath, {
                mimeType: "audio/wav",
                displayName: `Meeting_${scheduleId}`,
            });
            console.log(`[AI-PIPELINE] File uploaded: ${uploadResult.file.uri}`);
            yield prisma.schedule.update({
                where: { id: scheduleId },
                data: {
                    transcriptionProgress: 60,
                    transcriptionStatus: "AI sedang mendengarkan & menganalisis..."
                }
            });
            // 3. Generate Transcription + Analysis
            const model = genAI.getGenerativeModel({
                model: "gemini-flash-latest",
                generationConfig: {
                    temperature: 0,
                    responseMimeType: "application/json"
                }
            });
            const prompt = `
        Anda adalah asisten cerdas untuk DPRD Jawa Barat. Dengarkan audio rekaman pertemuan ini dengan sangat teliti.
        
        Tugas Anda:
        1. Berikan transkripsi lengkap yang **SANGAT VERBATIM** (kata demi kata) sesuai dengan apa yang **AKTUAL** terdengar di dalam audio.
           * **PERINGATAN KERAS**: JANGAN PERNAH berimprovisasi, menebak, mengasumsikan, atau menambahkan dialog, kalimat, kata, atau pembicara yang tidak benar-benar terdengar di dalam rekaman audio.
           * Jika audio selesai atau berhenti, hentikan transkripsi Anda seketika itu juga. Jangan pernah memperpanjang atau melengkapi percakapan secara kreatif.
           * Jika audio hanya berisi satu kalimat pendek, maka hasil transkripsi Anda harus berupa **satu kalimat pendek itu saja**.
           * Gunakan format percakapan yang rapi:
             [Nama/Peran Pembicara]: [Isi Pembicaraan]
             
             Jika nama tidak diketahui secara pasti, gunakan "Pembicara 1", "Pembicara 2", dst.
             Jika nama/peran disebutkan dalam percakapan, gunakan identitas tersebut (misal: [Dewan Ratih], [Warga Joko]).
             Tambahkan label waktu kasar di awal setiap paragraf jika memungkinkan (misal [00:15]).

        2. Analisis kualitas diskusi secara objektif dan berikan ringkasan yang sesuai dengan konten riil yang dibahas. Jika audio sangat pendek atau tidak memiliki diskusi yang substantif, berikan analisis minimalis yang jujur apa adanya.
        
        Berikan respons dalam format JSON murni:
        {
            "transcription": "Teks transkripsi verbatim riil...",
            "analysis": {
                "summary": "Ringkasan singkat riil pertemuan dalam 1-3 kalimat",
                "sentiment": "Positif/Netral/Negatif",
                "topics": ["Topik riil 1", "Topik riil 2"],
                "actionItems": ["Tindakan riil 1", "Tindakan riil 2"],
                "citizenSatisfaction": 1-10,
                "dewanResponsiveness": 1-10,
                "discussionQuality": 1-10,
                "problemSolving": 1-10
            }
        }
        `;
            console.log(`[AI-PIPELINE] Calling Gemini API (Streaming Mode)...`);
            let result;
            let retries = 3;
            while (retries > 0) {
                try {
                    result = yield model.generateContentStream([
                        {
                            fileData: {
                                mimeType: uploadResult.file.mimeType,
                                fileUri: uploadResult.file.uri
                            }
                        },
                        { text: prompt }
                    ]);
                    break; // Success!
                }
                catch (err) {
                    if ((err.status === 503 || err.status === 429) && retries > 1) {
                        console.warn(`[AI-PIPELINE] Gemini busy (503/429). Retrying in 10s... (${retries - 1} left)`);
                        yield new Promise(resolve => setTimeout(resolve, 10000));
                        retries--;
                    }
                    else {
                        throw err;
                    }
                }
            }
            if (!result)
                throw new Error("Failed to get response from Gemini after retries");
            let fullText = "";
            try {
                for (var _d = true, _e = __asyncValues(result.stream), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const chunk = _c;
                    const chunkText = chunk.text();
                    fullText += chunkText;
                    process.stdout.write("."); // Simple visual indicator in console
                    if (fullText.length % 500 < 50) { // Log every ~500 chars
                        console.log(`[AI-PIPELINE] Received ${fullText.length} characters of response...`);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            console.log("\n[AI-PIPELINE] Full AI response received.");
            yield prisma.schedule.update({
                where: { id: scheduleId },
                data: {
                    transcriptionProgress: 95,
                    transcriptionStatus: "Menyimpan hasil analisis..."
                }
            });
            console.log("[AI-PIPELINE] Raw AI Response:\n", fullText);
            // Extract JSON safely
            let parsedData;
            try {
                parsedData = JSON.parse(fullText.trim());
            }
            catch (e) {
                console.log("[AI-PIPELINE] Direct JSON.parse failed, attempting regex fallback...");
                const jsonMatch = fullText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error("Failed to parse AI response: No JSON found in output");
                }
                parsedData = JSON.parse(jsonMatch[0]);
            }
            const data = parsedData;
            // 4. Update Database
            yield prisma.schedule.update({
                where: { id: scheduleId },
                data: {
                    transcription: data.transcription,
                    analysis: data.analysis,
                    isTranscribing: false,
                    isAnalyzing: false,
                    transcriptionProgress: 100,
                    transcriptionStatus: "Selesai"
                }
            });
            // 5. Cleanup: Delete from Gemini storage
            try {
                yield fileManager.deleteFile(uploadResult.file.name);
            }
            catch (e) {
                console.warn("[AI-PIPELINE] Cleanup failed, but proceeding:", e);
            }
            console.log(`[AI-PIPELINE] Success for schedule: ${scheduleId}`);
        }
        catch (err) {
            console.error(`[AI-PIPELINE] Error for schedule ${scheduleId}:`, err);
            yield prisma.schedule.update({
                where: { id: scheduleId },
                data: {
                    isTranscribing: false,
                    isAnalyzing: false,
                    transcriptionStatus: "Gagal: " + (err instanceof Error ? err.message : "AI Error")
                }
            });
            throw err; // Re-throw so the parent knows it failed
        }
    });
}
function analyzeTranscript(scheduleId, transcript) {
    return __awaiter(this, void 0, void 0, function* () {
        // Keep existing function for fallback or manual text analysis
        try {
            console.log(`[ANALYSIS] Starting text analysis for schedule: ${scheduleId}`);
            if (!apiKey)
                return;
            yield prisma.schedule.update({
                where: { id: scheduleId },
                data: { isAnalyzing: true }
            });
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const prompt = `Analisis transkrip berikut dan berikan JSON: ${transcript}`;
            const result = yield model.generateContent(prompt);
            const text = (yield result.response).text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                yield prisma.schedule.update({
                    where: { id: scheduleId },
                    data: { analysis: JSON.parse(jsonMatch[0]), isAnalyzing: false }
                });
            }
        }
        catch (err) {
            console.error(err);
            yield prisma.schedule.update({ where: { id: scheduleId }, data: { isAnalyzing: false } });
        }
    });
}
