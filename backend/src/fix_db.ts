import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Mencoba sinkronisasi kolom database secara manual...");
    try {
        await prisma.$connect();
        
        // Add columns to Rating table if they don't exist
        await prisma.$executeRawUnsafe(`ALTER TABLE "Rating" ADD COLUMN IF NOT EXISTS "responsivenessScore" INTEGER DEFAULT 0;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Rating" ADD COLUMN IF NOT EXISTS "solutionScore" INTEGER DEFAULT 0;`);
        
        console.log("Kolom Rating berhasil ditambahkan (atau sudah ada).");

        // Add columns to User table just in case any were missed in sync
        const userColumns = [
            'bio', 'centreId', 'nip', 'fraksi', 'jabatan', 'dapil'
        ];
        
        for (const col of userColumns) {
            try {
                await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "${col}" TEXT;`);
                console.log(`Kolom User "${col}" ditambahkan/dicek.`);
            } catch (e) {
                console.error(`Gagal menambah kolom User "${col}":`, e);
            }
        }
        
        // isSync is boolean
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isSync" BOOLEAN DEFAULT false;`);

        console.log("Database sync manual selesai.");
    } catch (err) {
        console.error("Gagal sinkronisasi manual:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
