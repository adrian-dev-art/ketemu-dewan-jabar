import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Synchronizes DPRD Member data from the Master Hub (DPRD Centre).
 * Upserts users based on their Hub UUID (centreId).
 */
export async function syncHubData() {
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
        const response = await fetch(HUB_URL, {
            headers: {
                'X-API-Key': API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Hub Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const members = await response.json() as any[];
        console.log(`Received ${members.length} members from Hub.`);

        let processed = 0;
        for (const member of members) {
            if (processed === 0) {
                console.log("DEBUG: First member to sync:", member.nama, "ID:", member.id);
            }
            
            try {
                const updatedUser = await prisma.user.upsert({
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
                        email: member.email || `${member.id}@dprd.go.id`,
                        role: 'dewan',
                        nip: member.nip,
                        fraksi: member.fraksi,
                        jabatan: member.jabatan,
                        dapil: member.dapil,
                        passwordHash: '',
                        isSync: true
                    }
                });

                // Sync AKD relationships
                await prisma.aKDMember.deleteMany({ where: { dewanId: updatedUser.id } });

                if (member.memberships && Array.isArray(member.memberships)) {
                    for (const ms of member.memberships) {
                        if (!ms.akd) continue;
                        
                        // Ensure AKD exists
                        await prisma.aKD.upsert({
                            where: { id: ms.akd.id },
                            update: { nama: ms.akd.nama, tipe: ms.akd.tipe },
                            create: { id: ms.akd.id, nama: ms.akd.nama, tipe: ms.akd.tipe }
                        });
                        
                        // Create relationship
                        await prisma.aKDMember.create({
                            data: {
                                akdId: ms.akd.id,
                                dewanId: updatedUser.id,
                                jabatan: ms.jabatan
                            }
                        });
                    }
                }

                processed++;
            } catch (err: any) {
                console.error(`ERROR Syncing member ${member.nama}:`, err.message);
            }
        }

        console.log(`--- HUB SYNC COMPLETE: ${processed} users processed ---`);
        return { success: true, processed };
    } catch (error: any) {
        console.error("--- HUB SYNC FAILED ---");
        console.error(error.message);
        return { success: false, error: error.message };
    }
}
