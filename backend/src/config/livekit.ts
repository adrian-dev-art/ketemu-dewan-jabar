import { EgressClient, AccessToken } from 'livekit-server-sdk';
import { envConfig } from './env';

export const egressClient = new EgressClient(
    envConfig.LIVEKIT_URL,
    envConfig.LIVEKIT_API_KEY,
    envConfig.LIVEKIT_API_SECRET
);

export const generateLiveKitToken = async (identity: string, name: string, roomName: string) => {
    const at = new AccessToken(
        envConfig.LIVEKIT_API_KEY,
        envConfig.LIVEKIT_API_SECRET,
        {
            identity,
            name,
        }
    );
    at.addGrant({ roomJoin: true, room: roomName });
    return await at.toJwt();
};
