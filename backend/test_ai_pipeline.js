const { spawn } = require('child_process');
const path = require('path');

// Ganti ID dan Path sesuai data Anda
const scheduleId = "51";
const videoPath = "/app/recordings/recording_51_1778637827005.mp4";

console.log(`[TEST] Menjalankan test pipeline AI untuk Schedule ID: ${scheduleId}`);
console.log(`[TEST] Video Path: ${videoPath}`);

const worker = spawn('npx', ['ts-node', 'src/workers/transcriptionWorker.ts', scheduleId, videoPath], {
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'development' }
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
