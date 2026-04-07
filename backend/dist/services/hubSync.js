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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncHubData = syncHubData;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
/**
 * Synchronizes DPRD Member data from the Master Hub (DPRD Centre).
 * Upserts users based on their Hub UUID (centreId).
 */
function syncHubData() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("--- HUB SYNC STARTING ---");
        const HUB_URL = process.env.CENTRE_HUB_URL || 'http://127.0.0.1:8000/api/v1/members';
        const API_KEY = process.env.CENTRE_API_KEY || '';
        if (!API_KEY) {
            console.warn("WARNING: CENTRE_API_KEY is not defined in .env");
        }
        try {
            console.log(`Connecting to Master Hub: ${HUB_URL}`);
            // In Node 18+, fetch is global. If using older Node, this might need node-fetch.
            // server.ts already uses global fetch, so we assume it's available.
            const response = yield fetch(HUB_URL, {
                headers: {
                    'X-API-Key': API_KEY,
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                const errorText = yield response.text();
                throw new Error(`Hub Error: ${response.status} ${response.statusText} - ${errorText}`);
            }
            const members = yield response.json();
            console.log(`Received ${members.length} members from Hub.`);
            let processed = 0;
            for (const member of members) {
                // Fallback email if Hub doesn't provide one
                const fallbackEmail = `${member.id}@dprd.go.id`;
                yield prisma.user.upsert({
                    where: { centreId: member.id },
                    update: {
                        name: member.nama,
                        nip: member.nip,
                        fraksi: member.fraksi,
                        jabatan: member.jabatan,
                        dapil: member.dapil,
                        isSync: true
                    },
                    create: {
                        centreId: member.id,
                        name: member.nama,
                        email: member.email || fallbackEmail,
                        role: 'dewan',
                        nip: member.nip,
                        fraksi: member.fraksi,
                        jabatan: member.jabatan,
                        dapil: member.dapil,
                        passwordHash: '', // server.ts handles empty hash by allowing 'password' in dev
                        isSync: true
                    }
                });
                processed++;
            }
            console.log(`--- HUB SYNC COMPLETE: ${processed} users processed ---`);
            return { success: true, processed };
        }
        catch (error) {
            console.error("--- HUB SYNC FAILED ---");
            console.error(error.message);
            return { success: false, error: error.message };
        }
    });
}
