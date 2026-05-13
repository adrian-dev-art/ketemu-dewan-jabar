import { spawn } from 'child_process';
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { processMeetingAudio } from './analysisService';

const prisma = new PrismaClient();

export async function transcribeVideo(scheduleId: number, videoPath: string) {
    try {
        console.log(`[PIPELINE] Starting for schedule: ${scheduleId}, path: ${videoPath}`);
        
        if (!fs.existsSync(videoPath)) {
            throw new Error(`Video file not found: ${videoPath}`);
        }

        // 1. Mark as processing
        await prisma.schedule.update({
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
        await new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', [
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
                if (code === 0) resolve(true);
                else {
                    console.error(`[FFMPEG ERROR]: ${stderr}`);
                    reject(new Error(`ffmpeg failed with code ${code}`));
                }
            });
        });

        await prisma.schedule.update({
            where: { id: scheduleId },
            data: { 
                transcriptionProgress: 40,
                transcriptionStatus: "Mengunggah audio ke AI..."
            }
        });

        // 3. Delegate to Gemini Multimodal (Transcription + Analysis)
        console.log(`[PIPELINE] Sending audio to Gemini for Transcription & Analysis...`);
        await processMeetingAudio(scheduleId, audioPath);

        // 4. Cleanup audio file
        if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
        }

        await prisma.schedule.update({
            where: { id: scheduleId },
            data: { 
                isTranscribing: false,
                isAnalyzing: false,
                transcriptionProgress: 100,
                transcriptionStatus: "Selesai"
            }
        });

        console.log(`[PIPELINE] Fully completed for schedule: ${scheduleId}`);
    } catch (err) {
        console.error(`[PIPELINE] Error for schedule ${scheduleId}:`, err);
        await prisma.schedule.update({
            where: { id: scheduleId },
            data: { isTranscribing: false, isAnalyzing: false }
        });
    }
}
