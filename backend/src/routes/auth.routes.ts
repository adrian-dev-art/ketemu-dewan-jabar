import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { envConfig } from '../config/env';
import { authenticateToken, AuthRequest } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema, updateProfileSchema } from '../schemas/auth.schema';
import { rateLimit } from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    message: { error: "Terlalu banyak percobaan login. Silakan coba lagi nanti." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

// POST /api/auth/login
router.post('/auth/login', authLimiter, validateBody(loginSchema), async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "Pengguna tidak ditemukan." });

        if (user.passwordHash) {
            const validPassword = await bcrypt.compare(password, user.passwordHash);
            if (!validPassword) return res.status(401).json({ error: "Password salah." });
        } else {
            return res.status(403).json({ error: "Akun Anda memerlukan reset password demi keamanan. Hubungi Admin." });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            envConfig.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Gagal memproses login." });
    }
});

// POST /api/auth/register
router.post('/auth/register', validateBody(registerSchema), async (req: Request, res: Response) => {
    const {
        name,
        email,
        password,
        noKtp,
        instansi,
        kategoriInstansi,
        noWhatsapp,
        daftarPeserta,
        kabupaten,
        kecamatan,
        alamat,
        provinsi,
        role
    } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: role || 'masyarakat',
                noKtp,
                instansi: instansi || name,
                kategoriInstansi: kategoriInstansi || 'Organisasi Kemasyarakatan (Ormas)',
                noWhatsapp,
                daftarPeserta,
                kabupaten,
                kecamatan,
                alamat,
                provinsi: provinsi || 'Jawa Barat'
            }
        });

        res.status(201).json({ message: "Registrasi berhasil", userId: user.id, user });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Gagal mendaftarkan pengguna (Email mungkin sudah terdaftar)." });
    }
});

// GET /api/user/profile
router.get('/user/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                bio: true,
                nip: true,
                fraksi: true,
                jabatan: true,
                dapil: true,
                noKtp: true,
                instansi: true,
                kategoriInstansi: true,
                noWhatsapp: true,
                kabupaten: true,
                kecamatan: true,
                alamat: true,
                provinsi: true
            }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Gagal mengambil profil" });
    }
});

// PATCH /api/user/profile
router.patch('/user/profile', authenticateToken, validateBody(updateProfileSchema), async (req: AuthRequest, res: Response) => {
    const {
        name,
        bio,
        nip,
        fraksi,
        jabatan,
        dapil,
        noKtp,
        instansi,
        kategoriInstansi,
        noWhatsapp,
        kabupaten,
        kecamatan,
        alamat,
        provinsi,
        currentPassword,
        newPassword
    } = req.body;

    try {
        let passwordHashUpdate = undefined;
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: "Password saat ini wajib diisi untuk mengubah password." });
            }
            const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
            if (!user || !user.passwordHash) {
                return res.status(400).json({ error: "Pengguna tidak valid." });
            }
            const valid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!valid) {
                return res.status(401).json({ error: "Password saat ini tidak sesuai." });
            }
            const salt = await bcrypt.genSalt(10);
            passwordHashUpdate = await bcrypt.hash(newPassword, salt);
        }

        const updated = await prisma.user.update({
            where: { id: req.user!.id },
            data: {
                name,
                bio,
                nip,
                fraksi,
                jabatan,
                dapil,
                noKtp,
                instansi,
                kategoriInstansi,
                noWhatsapp,
                kabupaten,
                kecamatan,
                alamat,
                provinsi,
                ...(passwordHashUpdate ? { passwordHash: passwordHashUpdate } : {})
            }
        });

        res.json({ message: "Profil berhasil diperbarui", user: { id: updated.id, name: updated.name } });
    } catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ error: "Gagal memperbarui profil" });
    }
});

export default router;
