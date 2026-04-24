import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const csvPath = path.join(__dirname, 'akd_membership.csv');
    if (!fs.existsSync(csvPath)) {
        console.error("CSV file not found at", csvPath);
        return;
    }

    const data = fs.readFileSync(csvPath, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    
    // Remove header if it exists
    if (lines[0].startsWith('akd,nama')) {
        lines.shift();
    }

    console.log(`Processing ${lines.length} lines from CSV...`);

    // Clean up existing memberships to avoid duplicates if re-running
    console.log("Cleaning up existing AKD memberships...");
    await prisma.aKDMember.deleteMany({});

    let akdCreated = 0;
    let membersLinked = 0;
    let membersNotFound = 0;

    for (const line of lines) {
        // Simple CSV parser that handles quotes
        const parts = line.match(/(".*?"|[^,]+)/g);
        
        if (!parts || parts.length < 2) continue;

        const akdName = parts[0].replace(/"/g, '').trim();
        const memberName = parts[1].replace(/"/g, '').trim();
        const jabatan = parts[2] ? parts[2].replace(/"/g, '').trim() : '';

        const akdId = akdName.toLowerCase().replace(/\s+/g, '-');

        // 1. Upsert AKD
        await prisma.aKD.upsert({
            where: { id: akdId },
            update: { nama: akdName },
            create: { 
                id: akdId, 
                nama: akdName, 
                tipe: akdName.toLowerCase().includes('komisi') ? 'KOMISI' : 'BADAN' 
            }
        });
        akdCreated++;

        // 2. Find User - Try exact match first, then partial
        let user = await prisma.user.findFirst({
            where: { name: memberName }
        });

        if (!user) {
            // Try matching without titles if possible, but let's try contains first
            user = await prisma.user.findFirst({
                where: { name: { contains: memberName.split(',')[0].trim() } }
            });
        }

        if (user) {
            // 3. Create Membership
            await prisma.aKDMember.create({
                data: {
                    akdId: akdId,
                    dewanId: user.id,
                    jabatan: jabatan
                }
            });
            membersLinked++;
        } else {
            console.warn(`[WARN] Member not found in database: ${memberName}`);
            membersNotFound++;
        }
    }

    console.log(`\n--- Sync Summary ---`);
    console.log(`AKD Units Processed: ${akdCreated}`);
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
