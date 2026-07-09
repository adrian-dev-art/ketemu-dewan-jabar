const crypto = require('crypto');

function generateApiKey() {
    const key = crypto.randomBytes(32).toString('hex');
    console.log("=========================================");
    console.log("API Key Generated Successfully!");
    console.log("=========================================");
    console.log(`MOBILE_API_KEY=${key}`);
    console.log("=========================================");
    console.log("Add the above line to your production .env file in the backend.");
    console.log("And add this to your mobile app .env file:");
    console.log(`EXPO_PUBLIC_API_KEY=${key}`);
}

generateApiKey();
