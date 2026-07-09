const fs = require('fs');
const axios = require('axios');

// Simulate Expo loading the .env.production file
const envFile = fs.readFileSync('.env.production', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    if (line.includes('=')) {
        const [key, val] = line.split('=');
        env[key.trim()] = val.trim();
    }
});

const BASE_URL = env['EXPO_PUBLIC_BACKEND_URL'];
const API_KEY = env['EXPO_PUBLIC_API_KEY'];

console.log("Simulating Mobile App Fetch...");
console.log("------------------------------");
console.log("Using BASE_URL:", BASE_URL);
console.log("Using API_KEY:", API_KEY);
console.log("------------------------------\n");

// This is the exact code from mobile/services/api.ts
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
  },
});

async function runTest() {
    try {
        console.log("Fetching /api/users/dewan...");
        const response = await api.get('/api/users/dewan');
        console.log("✅ SUCCESS! The mobile app successfully bypassed the security.");
        console.log("Status Code:", response.status);
        console.log(`Received ${response.data.length} records.`);
        console.log("First record name:", response.data[0].name);
    } catch (err) {
        console.error("❌ FAILED!");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

runTest();
