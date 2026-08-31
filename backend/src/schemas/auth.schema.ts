import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(1, "Password tidak boleh kosong"),
});

export const registerSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    role: z.enum(['masyarakat', 'dewan', 'admin']).default('masyarakat'),
    noKtp: z.string().optional(),
    instansi: z.string().optional(),
    kategoriInstansi: z.string().optional(),
    noWhatsapp: z.string().optional(),
    daftarPeserta: z.string().optional(),
    kabupaten: z.string().optional(),
    kecamatan: z.string().optional(),
    alamat: z.string().optional(),
    provinsi: z.string().optional(),
    fraksi: z.string().optional(),
    jabatan: z.string().optional(),
    dapil: z.string().optional(),
    bio: z.string().optional(),
});

export const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    bio: z.string().optional(),
    noWhatsapp: z.string().optional(),
    instansi: z.string().optional(),
    kategoriInstansi: z.string().optional(),
    noKtp: z.string().optional(),
    kabupaten: z.string().optional(),
    kecamatan: z.string().optional(),
    alamat: z.string().optional(),
    provinsi: z.string().optional(),
    fraksi: z.string().optional(),
    jabatan: z.string().optional(),
    dapil: z.string().optional(),
    nip: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6).optional(),
});
