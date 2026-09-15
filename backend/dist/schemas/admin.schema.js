"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminStreamingSettingsSchema = exports.adminCleanupSchema = exports.adminUserUpdateSchema = void 0;
const zod_1 = require("zod");
exports.adminUserUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    email: zod_1.z.string().email().optional(),
    role: zod_1.z.enum(['masyarakat', 'dewan', 'admin']).optional(),
    fraksi: zod_1.z.string().optional().nullable(),
    jabatan: zod_1.z.string().optional().nullable(),
    dapil: zod_1.z.string().optional().nullable(),
    nip: zod_1.z.string().optional().nullable(),
    centreId: zod_1.z.string().optional().nullable(),
    instansi: zod_1.z.string().optional().nullable(),
    kategoriInstansi: zod_1.z.string().optional().nullable(),
    noWhatsapp: zod_1.z.string().optional().nullable(),
    kabupaten: zod_1.z.string().optional().nullable(),
    kecamatan: zod_1.z.string().optional().nullable(),
    alamat: zod_1.z.string().optional().nullable(),
    password: zod_1.z.string().min(6).optional(),
});
exports.adminCleanupSchema = zod_1.z.object({
    daysOld: zod_1.z.union([zod_1.z.number(), zod_1.z.string().regex(/^\d+$/).transform(Number)]),
    type: zod_1.z.enum(['schedules', 'all']).default('schedules'),
});
exports.adminStreamingSettingsSchema = zod_1.z.object({
    streamUrl: zod_1.z.string().optional().default(''),
    streamKey: zod_1.z.string().optional().default(''),
    isAutoStream: zod_1.z.boolean().optional().default(false),
    resolution: zod_1.z.string().optional().default('1080p'),
});
