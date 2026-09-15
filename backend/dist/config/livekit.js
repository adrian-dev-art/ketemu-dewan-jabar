"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLiveKitToken = exports.egressClient = void 0;
const livekit_server_sdk_1 = require("livekit-server-sdk");
const env_1 = require("./env");
exports.egressClient = new livekit_server_sdk_1.EgressClient(env_1.envConfig.LIVEKIT_URL, env_1.envConfig.LIVEKIT_API_KEY, env_1.envConfig.LIVEKIT_API_SECRET);
const generateLiveKitToken = (identity, name, roomName) => __awaiter(void 0, void 0, void 0, function* () {
    const at = new livekit_server_sdk_1.AccessToken(env_1.envConfig.LIVEKIT_API_KEY, env_1.envConfig.LIVEKIT_API_SECRET, {
        identity,
        name,
    });
    at.addGrant({ roomJoin: true, room: roomName });
    return yield at.toJwt();
});
exports.generateLiveKitToken = generateLiveKitToken;
