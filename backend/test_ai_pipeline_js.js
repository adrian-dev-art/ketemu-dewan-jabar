const { spawn } = require('child_process');
const path = require('path');

const scheduleId = "51";
const videoPath = "/app/recordings/recording_51_1778637827005.mp4";

console.log(`[TEST] Menjalankan test pipeline AI (Compiled JS) untuk Schedule ID: ${scheduleId}`);

// Menggunakan file hasil kompilasi
const workerPath = '/app/dist/workers/transcriptionWorker.js';

const worker = spawn('node', [workerPath, scheduleId, videoPath], {
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'production' }
});

worker.stdout.on('data', (data) => {
    console.log(`[WORKER LOG]: ${data}`);
});

worker.stderr.on('data', (data) => {
    console.error(`[WORKER ERROR]: ${data}`);
});

worker.on('close', (code) => {
    console.log(`[TEST] Selesai dengan exit code: ${code}`);
});
