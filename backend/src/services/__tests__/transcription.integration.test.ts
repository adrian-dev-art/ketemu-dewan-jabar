import { transcribeVideo } from '../transcriptionService';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Integration test for real video file
describe('transcribeVideo Integration', () => {
    const prisma = new PrismaClient();
    const videoPath = path.resolve(__dirname, '../../../../recordings/recording_31_1778131620103.mp4');
    const scheduleId = 31;

    beforeAll(async () => {
        // Ensure schedule exists in DB
        const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
        if (!schedule) {
            await prisma.schedule.create({
                data: {
                    id: scheduleId,
                    title: "Test Integration",
                    startTime: new Date(),
                    masyarakatId: 1,
                    recordingUrl: "/recordings/recording_31_1778131620103.mp4"
                }
            });
        }
    });

    it('should process a real video file successfully', async () => {
        if (!fs.existsSync(videoPath)) {
            console.warn(`Skipping integration test: ${videoPath} not found`);
            return;
        }

        console.log(`Testing with real file: ${videoPath}`);
        await transcribeVideo(scheduleId, videoPath);

        const updated = await prisma.schedule.findUnique({ where: { id: scheduleId } });
        expect(updated?.transcription).toBeDefined();
        expect(updated?.isTranscribing).toBe(false);
    }, 60000); // 60s timeout for AI
});
