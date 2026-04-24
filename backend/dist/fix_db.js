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
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Mencoba sinkronisasi kolom database secara manual...");
        try {
            yield prisma.$connect();
            // Add columns to Rating table if they don't exist
            yield prisma.$executeRawUnsafe(`ALTER TABLE "Rating" ADD COLUMN IF NOT EXISTS "responsivenessScore" INTEGER DEFAULT 0;`);
            yield prisma.$executeRawUnsafe(`ALTER TABLE "Rating" ADD COLUMN IF NOT EXISTS "solutionScore" INTEGER DEFAULT 0;`);
            console.log("Kolom Rating berhasil ditambahkan (atau sudah ada).");
            // Add columns to User table just in case any were missed in sync
            const userColumns = [
                'bio', 'centreId', 'nip', 'fraksi', 'jabatan', 'dapil'
            ];
            for (const col of userColumns) {
                try {
                    yield prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "${col}" TEXT;`);
                    console.log(`Kolom User "${col}" ditambahkan/dicek.`);
                }
                catch (e) {
                    console.error(`Gagal menambah kolom User "${col}":`, e);
                }
            }
            // isSync is boolean
            yield prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isSync" BOOLEAN DEFAULT false;`);
            console.log("Database sync manual selesai.");
        }
        catch (err) {
            console.error("Gagal sinkronisasi manual:", err);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
main();
