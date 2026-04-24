const { syncHubData } = require('./dist/services/hubSync');
require('dotenv').config();

process.env.CENTRE_HUB_URL = 'http://127.0.0.1:8000/api/v1/members';

async function run() {
    console.log("Staring sync manually...");
    try {
        await syncHubData();
        console.log("Success");
        process.exit(0);
    } catch(e) {
        console.error("Error", e);
        process.exit(1);
    }
}
run();
