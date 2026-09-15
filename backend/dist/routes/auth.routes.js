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
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const env_1 = require("../config/env");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_schema_1 = require("../schemas/auth.schema");
const express_rate_limit_1 = require("express-rate-limit");
const router = (0, express_1.Router)();
const authLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    message: { error: "Terlalu banyak percobaan login. Silakan coba lagi nanti." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
// POST /api/auth/login
router.post('/auth/login', authLimiter, (0, validate_middleware_1.validateBody)(auth_schema_1.loginSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: "Pengguna tidak ditemukan." });
        if (user.passwordHash) {
            const validPassword = yield bcryptjs_1.default.compare(password, user.passwordHash);
            if (!validPassword)
                return res.status(401).json({ error: "Password salah." });
        }
        else {
            return res.status(403).json({ error: "Akun Anda memerlukan reset password demi keamanan. Hubungi Admin." });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, env_1.envConfig.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Gagal memproses login." });
    }
}));
// POST /api/auth/register
router.post('/auth/register', (0, validate_middleware_1.validateBody)(auth_schema_1.registerSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, noKtp, instansi, kategoriInstansi, noWhatsapp, daftarPeserta, kabupaten, kecamatan, alamat, provinsi, role } = req.body;
    try {
        const salt = yield bcryptjs_1.default.genSalt(10);
        const passwordHash = yield bcryptjs_1.default.hash(password, salt);
        const user = yield prisma_1.prisma.user.create({
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
    }
    catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Gagal mendaftarkan pengguna (Email mungkin sudah terdaftar)." });
    }
}));
// GET /api/user/profile
router.get('/user/profile', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
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
    }
    catch (err) {
        res.status(500).json({ error: "Gagal mengambil profil" });
    }
}));
// PATCH /api/user/profile
router.patch('/user/profile', auth_middleware_1.authenticateToken, (0, validate_middleware_1.validateBody)(auth_schema_1.updateProfileSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, bio, nip, fraksi, jabatan, dapil, noKtp, instansi, kategoriInstansi, noWhatsapp, kabupaten, kecamatan, alamat, provinsi, currentPassword, newPassword } = req.body;
    try {
        let passwordHashUpdate = undefined;
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: "Password saat ini wajib diisi untuk mengubah password." });
            }
            const user = yield prisma_1.prisma.user.findUnique({ where: { id: req.user.id } });
            if (!user || !user.passwordHash) {
                return res.status(400).json({ error: "Pengguna tidak valid." });
            }
            const valid = yield bcryptjs_1.default.compare(currentPassword, user.passwordHash);
            if (!valid) {
                return res.status(401).json({ error: "Password saat ini tidak sesuai." });
            }
            const salt = yield bcryptjs_1.default.genSalt(10);
            passwordHashUpdate = yield bcryptjs_1.default.hash(newPassword, salt);
        }
        const updated = yield prisma_1.prisma.user.update({
            where: { id: req.user.id },
            data: Object.assign({ name,
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
                provinsi }, (passwordHashUpdate ? { passwordHash: passwordHashUpdate } : {}))
        });
        res.json({ message: "Profil berhasil diperbarui", user: { id: updated.id, name: updated.name } });
    }
    catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ error: "Gagal memperbarui profil" });
    }
}));
exports.default = router;
