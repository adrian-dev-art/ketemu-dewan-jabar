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
const client_1 = require("@prisma/client");
function testSync() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("--- STARTING SYNC TEST ---");
        const prisma = new client_1.PrismaClient();
        try {
            // 1. LOGIN to get token
            console.log("1. Logging in as admin...");
            const loginRes = yield fetch('http://127.0.0.1:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@dewan.id', password: 'password' })
            });
            if (!loginRes.ok) {
                const err = yield loginRes.json();
                console.error("Login failed:", err);
                return;
            }
            const { token } = yield loginRes.json();
            console.log("   Login success. Token acquired.");
            // 2. TRIGGER SYNC
            console.log("2. Triggering Master Hub Sync...");
            const syncRes = yield fetch('http://127.0.0.1:5000/api/admin/sync-centre', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-API-Key': 'c1547650-291c-4ce7-a78d-e889a4f9b767' // For the sync logic inside server.ts to work
                }
            });
            if (!syncRes.ok) {
                const err = yield syncRes.json();
                console.error("Sync failed:", err);
                return;
            }
            const syncResult = yield syncRes.json();
            console.log("   Sync result:", syncResult);
            // 3. VERIFY DATA
            console.log("3. Verifying data in database...");
            const dewanCount = yield prisma.user.count({ where: { role: 'dewan' } });
            console.log(`   Total Dewan in MEETDEWAN: ${dewanCount}`);
            if (dewanCount > 0) {
                console.log("--- SUCCESS: Hub data has been synchronized! ---");
            }
            else {
                console.log("--- FAIL: No dewan users found in database after sync. ---");
            }
        }
        catch (error) {
            console.error("Error during test:", error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
testSync();
