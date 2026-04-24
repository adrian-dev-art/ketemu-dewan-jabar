import { RoomServiceClient } from 'livekit-server-sdk';

const host = 'http://localhost:7880';
const apiKey = 'devkey';
const apiSecret = 'secretkey';

const roomClient = new RoomServiceClient(host, apiKey, apiSecret);

async function checkRoom() {
    try {
        const participants = await roomClient.listParticipants('52');
        console.log(`\n---ROOM 52 PARTICIPANTS---`);
        if (participants.length === 0) {
             console.log("Room is completely empty. No one is connected.");
        }
        for (const p of participants) {
            console.log(`Participant ${p.identity} (State: ${p.state})`);
            const tracks = p.tracks;
            if (tracks.length === 0) {
                 console.log(`  -> NO TRACKS PUBLISHED (Camera/Mic is OFF)`);
            } else {
                 tracks.forEach(t => console.log(`  -> Track Published: ${t.type} (Muted: ${t.muted})`));
            }
        }
        console.log("--------------------------\n");
    } catch (err) {
        console.error("Error fetching room info:", err.message);
    }
}

checkRoom();
