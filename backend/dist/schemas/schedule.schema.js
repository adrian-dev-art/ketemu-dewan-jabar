"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRatingSchema = exports.createAvailabilitySchema = exports.updateScheduleStatusSchema = exports.createScheduleSchema = void 0;
const zod_1 = require("zod");
exports.createScheduleSchema = zod_1.z.object({
    dewanId: zod_1.z.union([zod_1.z.number(), zod_1.z.array(zod_1.z.number())]),
    startTime: zod_1.z.string().min(1, "Waktu mulai harus diisi"),
    title: zod_1.z.string().optional().default("Diskusi Aspirasi"),
});
exports.updateScheduleStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'confirmed', 'rejected', 'completed', 'cancelled']),
});
exports.createAvailabilitySchema = zod_1.z.object({
    startTime: zod_1.z.string().min(1, "Waktu mulai harus diisi"),
    endTime: zod_1.z.string().min(1, "Waktu selesai harus diisi"),
});
exports.createRatingSchema = zod_1.z.object({
    scheduleId: zod_1.z.number().int().positive(),
    dewanId: zod_1.z.number().int().positive(),
    speakingScore: zod_1.z.number().min(1).max(5),
    contextScore: zod_1.z.number().min(1).max(5),
    timeScore: zod_1.z.number().min(1).max(5),
    responsivenessScore: zod_1.z.number().min(1).max(5).default(5),
    solutionScore: zod_1.z.number().min(1).max(5).default(5),
    comment: zod_1.z.string().optional(),
});
