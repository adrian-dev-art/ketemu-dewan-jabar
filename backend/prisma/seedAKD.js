const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const csvPath = path.join(__dirname, 'akd_membership.csv');
    if (!fs.existsSync(csvPath)) {
        console.error("CSV file not found at", csvPath);
        return;
    }

    const data = fs.readFileSync(csvPath, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    
    if (lines[0].startsWith('akd,nama')) {
        lines.shift();
    }

    console.log(`Processing ${lines.length} lines from CSV...`);

    console.log("Cleaning up existing AKD memberships...");
    await prisma.aKDMember.deleteMany({});

    let akdCreated = 0;
    let membersLinked = 0;
    let membersNotFound = 0;

    const akds = new Set();

    for (const line of lines) {
        const parts = line.match(/(".*?"|[^,]+)/g);
        
        if (!parts || parts.length < 2) continue;

        const akdName = parts[0].replace(/"/g, '').trim();
        const memberName = parts[1].replace(/"/g, '').trim();
        const jabatan = parts[2] ? parts[2].replace(/"/g, '').trim() : '';

        const akdId = akdName.toLowerCase().replace(/\s+/g, '-');

        if (!akds.has(akdId)) {
            await prisma.aKD.upsert({
                where: { id: akdId },
                update: { nama: akdName },
                create: { 
                    id: akdId, 
                    nama: akdName, 
                    tipe: akdName.toLowerCase().includes('komisi') ? 'KOMISI' : 'BADAN' 
                }
            });
            akds.add(akdId);
            akdCreated++;
        }

        let user = await prisma.user.findFirst({
            where: { name: memberName }
        });

        if (!user) {
            user = await prisma.user.findFirst({
                where: { name: { contains: memberName.split(',')[0].trim() } }
            });
        }

        if (user) {
            await prisma.aKDMember.create({
                data: {
                    akdId: akdId,
                    dewanId: user.id,
                    jabatan: jabatan
                }
            });
            membersLinked++;
        } else {
            console.warn(`[WARN] Member not found: ${memberName}`);
            membersNotFound++;
        }
    }

    console.log(`\n--- Sync Summary ---`);
    console.log(`AKD Units Created/Updated: ${akdCreated}`);
    console.log(`Members Linked: ${membersLinked}`);
    console.log(`Members Not Found: ${membersNotFound}`);
    console.log(`--------------------\n`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
