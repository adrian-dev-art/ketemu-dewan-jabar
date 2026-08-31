import { z } from 'zod';

export const adminUserUpdateSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(['masyarakat', 'dewan', 'admin']).optional(),
    fraksi: z.string().optional().nullable(),
    jabatan: z.string().optional().nullable(),
    dapil: z.string().optional().nullable(),
    nip: z.string().optional().nullable(),
    centreId: z.string().optional().nullable(),
    instansi: z.string().optional().nullable(),
    kategoriInstansi: z.string().optional().nullable(),
    noWhatsapp: z.string().optional().nullable(),
    kabupaten: z.string().optional().nullable(),
    kecamatan: z.string().optional().nullable(),
    alamat: z.string().optional().nullable(),
    password: z.string().min(6).optional(),
});

export const adminCleanupSchema = z.object({
    daysOld: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]),
    type: z.enum(['schedules', 'all']).default('schedules'),
});

export const adminStreamingSettingsSchema = z.object({
    streamUrl: z.string().optional().default(''),
    streamKey: z.string().optional().default(''),
    isAutoStream: z.boolean().optional().default(false),
    resolution: z.string().optional().default('1080p'),
});
