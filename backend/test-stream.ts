import { RoomServiceClient, EgressClient } from 'livekit-server-sdk';

const host = 'http://localhost:7880';
const apiKey = 'devkey';
const apiSecret = 'secretkey';

const roomClient = new RoomServiceClient(host, apiKey, apiSecret);
const egressClient = new EgressClient(host, apiKey, apiSecret);

async function startTest() {
    try {
        console.log("Membuat Room simulasi...");
        // This forces LiveKit to instantiate the room regardless of participants
        await roomClient.createRoom({ name: 'test-room', emptyTimeout: 10 * 60 });
        
        console.log("Menghubungkan ke LiveKit Egress Client...");
        const url = "rtmp://a.rtmp.youtube.com/live2/qvea-7529-23dc-16xj-e8yw";
        const info = await egressClient.startRoomCompositeEgress("test-room", {
            stream: {
                urls: [url]
            }
        } as any);
        console.log("SUCCESS! Egress ID:", info.egressId);
        console.log("Status:", info.status);
    } catch (err) {
        console.error("Egress Error:", err);
    }
}

startTest();
