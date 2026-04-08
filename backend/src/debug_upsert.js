const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugSync() {
    console.log("--- DEBUG SYNC START ---");
    const testMember = {
        id: "debug-id-123",
        nama: "Debug Member",
        email: "debug@dprd.go.id",
        role: "dewan",
        nip: "123456789",
        fraksi: "Debug Fraksi"
    };

    try {
        console.log("Attempting upsert...");
        const res = await prisma.user.upsert({
            where: { centreId: testMember.id },
            update: { name: testMember.nama },
            create: {
                centreId: testMember.id,
                name: testMember.nama,
                email: testMember.email,
                role: 'dewan',
                nip: testMember.nip,
                fraksi: testMember.fraksi,
                passwordHash: ''
            }
        });
        console.log("Upsert Success:", res.id, res.name);
        
        const count = await prisma.user.count({ where: { role: 'dewan' } });
        console.log("New Dewan Count:", count);
    } catch (err) {
        console.error("UPSERT ERROR:", err);
    } finally {
        await prisma.$disconnect();
    }
}

debugSync();
