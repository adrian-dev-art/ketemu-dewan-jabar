import { PrismaClient } from '@prisma/client';

async function testSync() {
    console.log("--- STARTING SYNC TEST ---");
    const prisma = new PrismaClient();

    try {
        // 1. LOGIN to get token
        console.log("1. Logging in as admin...");
        const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@dewan.id', password: 'password' })
        });
        
        if (!loginRes.ok) {
            const err = await loginRes.json();
            console.error("Login failed:", err);
            return;
        }
        
        const { token } = await loginRes.json() as { token: string };
        console.log("   Login success. Token acquired.");

        // 2. TRIGGER SYNC
        console.log("2. Triggering Master Hub Sync...");
        const syncRes = await fetch('http://127.0.0.1:5000/api/admin/sync-centre', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-API-Key': 'c1547650-291c-4ce7-a78d-e889a4f9b767' // For the sync logic inside server.ts to work
            }
        });

        if (!syncRes.ok) {
            const err = await syncRes.json();
            console.error("Sync failed:", err);
            return;
        }

        const syncResult = await syncRes.json();
        console.log("   Sync result:", syncResult);

        // 3. VERIFY DATA
        console.log("3. Verifying data in database...");
        const dewanCount = await prisma.user.count({ where: { role: 'dewan' } });
        console.log(`   Total Dewan in MEETDEWAN: ${dewanCount}`);
        
        if (dewanCount > 0) {
            console.log("--- SUCCESS: Hub data has been synchronized! ---");
        } else {
            console.log("--- FAIL: No dewan users found in database after sync. ---");
        }

    } catch (error) {
        console.error("Error during test:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testSync();
