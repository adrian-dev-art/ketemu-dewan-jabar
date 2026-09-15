"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Format email tidak valid"),
    password: zod_1.z.string().min(1, "Password tidak boleh kosong"),
});
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Nama minimal 2 karakter"),
    email: zod_1.z.string().email("Format email tidak valid"),
    password: zod_1.z.string().min(6, "Password minimal 6 karakter"),
    role: zod_1.z.enum(['masyarakat', 'dewan', 'admin']).default('masyarakat'),
    noKtp: zod_1.z.string().optional(),
    instansi: zod_1.z.string().optional(),
    kategoriInstansi: zod_1.z.string().optional(),
    noWhatsapp: zod_1.z.string().optional(),
    daftarPeserta: zod_1.z.string().optional(),
    kabupaten: zod_1.z.string().optional(),
    kecamatan: zod_1.z.string().optional(),
    alamat: zod_1.z.string().optional(),
    provinsi: zod_1.z.string().optional(),
    fraksi: zod_1.z.string().optional(),
    jabatan: zod_1.z.string().optional(),
    dapil: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    bio: zod_1.z.string().optional(),
    noWhatsapp: zod_1.z.string().optional(),
    instansi: zod_1.z.string().optional(),
    kategoriInstansi: zod_1.z.string().optional(),
    noKtp: zod_1.z.string().optional(),
    kabupaten: zod_1.z.string().optional(),
    kecamatan: zod_1.z.string().optional(),
    alamat: zod_1.z.string().optional(),
    provinsi: zod_1.z.string().optional(),
    fraksi: zod_1.z.string().optional(),
    jabatan: zod_1.z.string().optional(),
    dapil: zod_1.z.string().optional(),
    nip: zod_1.z.string().optional(),
    currentPassword: zod_1.z.string().optional(),
    newPassword: zod_1.z.string().min(6).optional(),
});
