import { z } from 'zod';

export const createScheduleSchema = z.object({
    dewanId: z.union([z.number(), z.array(z.number())]),
    startTime: z.string().min(1, "Waktu mulai harus diisi"),
    title: z.string().optional().default("Diskusi Aspirasi"),
});

export const updateScheduleStatusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'rejected', 'completed', 'cancelled']),
});

export const createAvailabilitySchema = z.object({
    startTime: z.string().min(1, "Waktu mulai harus diisi"),
    endTime: z.string().min(1, "Waktu selesai harus diisi"),
});

export const createRatingSchema = z.object({
    scheduleId: z.number().int().positive(),
    dewanId: z.number().int().positive(),
    speakingScore: z.number().min(1).max(5),
    contextScore: z.number().min(1).max(5),
    timeScore: z.number().min(1).max(5),
    responsivenessScore: z.number().min(1).max(5).default(5),
    solutionScore: z.number().min(1).max(5).default(5),
    comment: z.string().optional(),
});
