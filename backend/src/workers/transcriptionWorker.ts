import { transcribeVideo } from '../services/transcriptionService';

const scheduleId = parseInt(process.argv[2]);
const videoPath = process.argv[3];

if (!scheduleId || !videoPath) {
    console.error("[WORKER] Missing arguments: scheduleId or videoPath");
    process.exit(1);
}

console.log(`[WORKER] Starting transcription worker for schedule ${scheduleId}`);

transcribeVideo(scheduleId, videoPath)
    .then(() => {
        console.log(`[WORKER] Successfully finished for schedule ${scheduleId}`);
        process.exit(0);
    })
    .catch(err => {
        console.error(`[WORKER] Failed for schedule ${scheduleId}:`, err);
        process.exit(1);
    });
