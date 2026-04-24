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
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Seeding Asep Suherman...");
        const dewan = yield prisma.user.findFirst({
            where: { name: { contains: 'Asep Suherman' } }
        });
        if (!dewan) {
            console.log("Asep Suherman not found!");
            return;
        }
        // Find or create a masyarakat user
        let masyarakat = yield prisma.user.findFirst({
            where: { role: 'masyarakat' }
        });
        if (!masyarakat) {
            const passwordHash = yield bcryptjs_1.default.hash('password', 10);
            masyarakat = yield prisma.user.create({
                data: {
                    name: 'Warga Tester',
                    email: 'warga.asep@test.com',
                    role: 'masyarakat',
                    passwordHash
                }
            });
        }
        // Create a schedule
        const schedule = yield prisma.schedule.create({
            data: {
                title: 'Diskusi Aspirasi Pembangunan',
                startTime: new Date(),
                status: 'completed',
                dewanId: dewan.id,
                masyarakatId: masyarakat.id
            }
        });
        // Create a rating
        yield prisma.rating.create({
            data: {
                scheduleId: schedule.id,
                dewanId: dewan.id,
                speakingScore: 5,
                contextScore: 4,
                timeScore: 5,
                responsivenessScore: 4,
                solutionScore: 5,
                comment: "Pak Asep sangat inspiratif dan solutif."
            }
        });
        console.log(`Successfully seeded rating for ${dewan.name}!`);
    });
}
main()
    .catch((e) => console.error(e))
    .finally(() => __awaiter(void 0, void 0, void 0, function* () { return yield prisma.$disconnect(); }));
