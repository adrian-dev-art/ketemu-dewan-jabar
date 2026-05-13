import { PrismaClient, Prisma } from '@prisma/client';
import { transcribeVideo } from './transcriptionService';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();
let isProcessing = false;

export async function processTranscriptionQueue() {
    if (isProcessing) return;
    
    try {
        isProcessing = true;

        // Cari satu jadwal yang ada videonya tapi belum dianalisis, dan tidak sedang diproses
        const pendingJob = await prisma.schedule.findFirst({
            where: {
                recordingUrl: { not: null },
                analysis: { equals: Prisma.AnyNull },
                OR: [
                    { transcriptionStatus: { equals: null } },
                    { transcriptionStatus: { notIn: ['Selesai', 'Gagal', 'Gagal: File Video Hilang'] } }
                ],
                isTranscribing: false

            },
            orderBy: { id: 'asc' } // Kerjakan yang paling lama antre
        });

        if (pendingJob) {
            console.log(`[QUEUE] Menemukan tugas tertunda: ID #${pendingJob.id}. Memulai pemrosesan...`);
            
            // Tandai sedang diproses agar tidak diambil oleh siklus berikutnya
            await prisma.schedule.update({
                where: { id: pendingJob.id },
                data: { isTranscribing: true, transcriptionProgress: 0 }
            });

            const fileName = path.basename(pendingJob.recordingUrl!);
            let videoPath = path.join(process.cwd(), '..', 'recordings', fileName);
            
            if (!fs.existsSync(videoPath)) {
                videoPath = path.join(process.cwd(), 'recordings', fileName);
            }
            
            if (fs.existsSync(videoPath)) {
                // Jalankan proses secara langsung (native), tidak pakai spawn worker baru
                await transcribeVideo(pendingJob.id, videoPath);
            } else {
                console.error(`[QUEUE] File video hilang untuk ID #${pendingJob.id}: ${videoPath}`);
                await prisma.schedule.update({
                    where: { id: pendingJob.id },
                    data: { isTranscribing: false, transcriptionStatus: 'Gagal: File Video Hilang' }
                });
            }
        }
    } catch (error) {
        console.error("[QUEUE] Error di sistem antrean:", error);
    } finally {
        isProcessing = false;
    }
}

// Mulai sistem antrean yang akan mengecek setiap 15 detik
export function startQueueDaemon() {
    console.log("[QUEUE] Daemon antrean transkripsi AI diaktifkan.");
    setInterval(processTranscriptionQueue, 15000);
}
