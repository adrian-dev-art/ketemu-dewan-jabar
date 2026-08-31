# Rencana Implementasi: Modularisasi Backend & Frontend serta Penguatan Keamanan Sistem

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memecah berkas monolitik `server.ts` dan `admin/page.tsx`, mengeliminasi celah keamanan hardcoded fallback key, menerapkan validasi skema Zod, menambahkan indeks database PostgreSQL, serta mengintegrasikan sinkronisasi real-time Socket.io.

**Architecture:** Menerapkan *Modular Layered Architecture* pada backend Express (config, lib, middlewares, schemas, routes terisolasi) dan dekomposisi komponen tab pada frontend Next.js admin dashboard disertai integrasi Socket.io hook.

**Tech Stack:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Zod, LiveKit SFU Server SDK, Socket.io, Next.js, React, Tailwind CSS.

**Spec:** [docs/superpowers/specs/2026-08-31-backend-frontend-modularization-and-security-design.md](file:///e:/project/DPRD/MEETDEWAN/docs/superpowers/specs/2026-08-31-backend-frontend-modularization-and-security-design.md)

## Global Constraints

- Standar penulisan: Dilarang menggunakan emoji dalam kode, antarmuka pengguna (UI), maupun dokumentasi.
- Seluruh teks antarmuka dan respon API harus menggunakan bahasa formal dan lugas.
- Tidak boleh merusak API contract eksisting yang digunakan oleh frontend web dan aplikasi mobile.
- Semua modul harus lolos kompilasi TypeScript (`tsc` dan `next build`) tanpa error.

---

### Task 1: Backend Dependencies, Config, & Database Schema Indexing

**Files:**
- Modify: `backend/package.json`
- Create: `backend/src/config/env.ts`
- Create: `backend/src/config/livekit.ts`
- Create: `backend/src/lib/prisma.ts`
- Modify: `backend/prisma/schema.prisma`

**Interfaces:**
- Produces: `envConfig` (dari `env.ts`), `prisma` (singleton instance dari `lib/prisma.ts`), `egressClient`, `createLiveKitToken` (dari `config/livekit.ts`).

- [ ] **Step 1: Install zod pada backend**

Jalankan instalasi pustaka `zod`:
```bash
cd e:\project\DPRD\MEETDEWAN\backend; npm install zod
```

- [ ] **Step 2: Buat berkas singleton Prisma (`backend/src/lib/prisma.ts`)**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: Buat modul konfigurasi terpusat (`backend/src/config/env.ts`)**

```typescript
import * as dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error("FATAL: JWT_SECRET must be set in production environment.");
    process.exit(1);
}

export const envConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT) || 5000,
    JWT_SECRET: JWT_SECRET || 'dev-secret-key-only',
    LIVEKIT_URL: process.env.LIVEKIT_URL || 'http://localhost:7880',
    LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY || 'devkey',
    LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET || 'secretkey',
    MOBILE_API_KEY: process.env.MOBILE_API_KEY || null,
    FRONTEND_URLS: process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
        : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
};
```

- [ ] **Step 4: Buat modul helper LiveKit (`backend/src/config/livekit.ts`)**

```typescript
import { EgressClient, AccessToken } from 'livekit-server-sdk';
import { envConfig } from './env';

export const egressClient = new EgressClient(
    envConfig.LIVEKIT_URL,
    envConfig.LIVEKIT_API_KEY,
    envConfig.LIVEKIT_API_SECRET
);

export const generateLiveKitToken = async (identity: string, name: string, roomName: string) => {
    const at = new AccessToken(
        envConfig.LIVEKIT_API_KEY,
        envConfig.LIVEKIT_API_SECRET,
        { identity, name }
    );
    at.addGrant({ roomJoin: true, room: roomName });
    return await at.toJwt();
};
```

- [ ] **Step 5: Perbarui indeks database pada `backend/prisma/schema.prisma` dan sinkronisasi**

Tambahkan `@@index` pada model User, Schedule, ScheduleParticipant, FollowUp, dan Rating:
```prisma
model User {
  ...
  @@index([role])
  @@index([email])
}

model Schedule {
  ...
  @@index([startTime])
  @@index([masyarakatId])
  @@index([isTranscribing])
}

model ScheduleParticipant {
  ...
  @@index([dewanId, status])
}

model FollowUp {
  ...
  @@index([status])
  @@index([scheduleId])
}

model Rating {
  ...
  @@index([dewanId])
  @@index([scheduleId])
}
```

Jalankan perintah sinkronisasi:
```bash
cd e:\project\DPRD\MEETDEWAN\backend; npx prisma generate; npx prisma db push
```

- [ ] **Step 6: Commit Task 1**

```bash
git add backend/package.json backend/package-lock.json backend/src/config backend/src/lib backend/prisma/schema.prisma; git commit -m "feat(backend): add central config, prisma singleton, and schema indexes"
```

---

### Task 2: Middlewares & Zod Validation Schemas

**Files:**
- Create: `backend/src/schemas/auth.schema.ts`
- Create: `backend/src/schemas/schedule.schema.ts`
- Create: `backend/src/schemas/followup.schema.ts`
- Create: `backend/src/schemas/admin.schema.ts`
- Create: `backend/src/middlewares/auth.middleware.ts`
- Create: `backend/src/middlewares/apiKey.middleware.ts`
- Create: `backend/src/middlewares/validate.middleware.ts`
- Create: `backend/src/middlewares/upload.middleware.ts`

**Interfaces:**
- Produces: `authenticateToken`, `authorizeRole`, `apiKeyMiddleware`, `validateBody`, `validateQuery`.

- [ ] **Step 1: Buat skema validasi Zod (`src/schemas/`)**

Buat `auth.schema.ts`, `schedule.schema.ts`, `followup.schema.ts`, dan `admin.schema.ts` dengan aturan tipe data ketat (email, min length, number ranges).

- [ ] **Step 2: Buat middleware validasi Zod (`src/middlewares/validate.middleware.ts`)**

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: "Validasi data gagal",
                    details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
                });
            }
            return res.status(400).json({ error: "Permintaan tidak valid" });
        }
    };
};
```

- [ ] **Step 3: Buat middleware otentikasi JWT bersih (`src/middlewares/auth.middleware.ts`)**

Hapus hardcoded fallback string. Hanya izinkan otentikasi JWT valid atau validasi API Key yang sah dari environment.

- [ ] **Step 4: Buat middleware API Key & upload berkas terproteksi (`src/middlewares/apiKey.middleware.ts` dan `src/middlewares/upload.middleware.ts`)**

Validasi ekstensi berkas (.pdf, .png, .jpg, .jpeg) dan batas ukuran berkas maksimum 10MB.

- [ ] **Step 5: Commit Task 2**

```bash
git add backend/src/schemas backend/src/middlewares; git commit -m "feat(backend): add zod schemas, clean auth middleware, and upload validator"
```

---

### Task 3: Backend Route Modularization

**Files:**
- Create: `backend/src/routes/health.routes.ts`
- Create: `backend/src/routes/auth.routes.ts`
- Create: `backend/src/routes/schedule.routes.ts`
- Create: `backend/src/routes/followup.routes.ts`
- Create: `backend/src/routes/public.routes.ts`
- Create: `backend/src/routes/gis.routes.ts`
- Create: `backend/src/routes/livekit.routes.ts`
- Create: `backend/src/routes/admin.routes.ts`

**Interfaces:**
- Produces: Router Express untuk setiap domain sistem.

- [ ] **Step 1: Buat rute health check (`backend/src/routes/health.routes.ts`)**
- [ ] **Step 2: Buat rute auth & profile (`backend/src/routes/auth.routes.ts`)**
- [ ] **Step 3: Buat rute jadwal & ketersediaan (`backend/src/routes/schedule.routes.ts`)**
- [ ] **Step 4: Buat rute tindak lanjut internal (`backend/src/routes/followup.routes.ts`)**
- [ ] **Step 5: Buat rute portal publik & disposisi (`backend/src/routes/public.routes.ts`)**
- [ ] **Step 6: Buat rute GIS & perjalanan dinas (`backend/src/routes/gis.routes.ts`)**
- [ ] **Step 7: Buat rute LiveKit token & egress (`backend/src/routes/livekit.routes.ts`)**
- [ ] **Step 8: Buat rute admin panel (`backend/src/routes/admin.routes.ts`)**
- [ ] **Step 9: Commit Task 3**

```bash
git add backend/src/routes; git commit -m "feat(backend): split monolithic server into modular domain routes"
```

---

### Task 4: Slim Server Ingress & Socket.io Real-Time Integration

**Files:**
- Modify: `backend/src/server.ts`
- Test: `backend/src/__tests__/record.test.ts`

- [ ] **Step 1: Refaktor `backend/src/server.ts` menjadi ramping**

Pasang middleware CORS, Helmet, JSON body parser, rate limiters, static folders, dan daftarkan seluruh router dari `src/routes/`.
Inisialisasi server HTTP dan Socket.io exportable.

- [ ] **Step 2: Jalankan pengujian TypeScript build backend**

```bash
cd e:\project\DPRD\MEETDEWAN\backend; npm run build
```
Pastikan kompilasi `tsc` berhasil tanpa error.

- [ ] **Step 3: Jalankan pengujian otomatis backend**

```bash
cd e:\project\DPRD\MEETDEWAN\backend; npm test
```

- [ ] **Step 4: Commit Task 4**

```bash
git add backend/src/server.ts; git commit -m "refactor(backend): slim down server.ts entry point with modular router mounting"
```

---

### Task 5: Frontend Socket Updates Hook

**Files:**
- Create: `frontend/hooks/useSocketUpdates.ts`

- [ ] **Step 1: Buat hook `useSocketUpdates.ts`**

Mengelola listener `schedule:updated`, `followup:updated`, dan `transcription:progress` dengan auto-reconnect.

- [ ] **Step 2: Commit Task 5**

```bash
git add frontend/hooks/useSocketUpdates.ts; git commit -m "feat(frontend): add real-time socket updates hook"
```

---

### Task 6: Frontend Admin Dashboard Modularization

**Files:**
- Create: `frontend/components/admin/AdminStatsCard.tsx`
- Create: `frontend/components/admin/AdminOverviewTab.tsx`
- Create: `frontend/components/admin/AdminUsersTab.tsx`
- Create: `frontend/components/admin/AdminSchedulesTab.tsx`
- Create: `frontend/components/admin/AdminFollowUpTab.tsx`
- Create: `frontend/components/admin/AdminRatingsTab.tsx`
- Create: `frontend/components/admin/AdminAkdTab.tsx`
- Modify: `frontend/app/admin/page.tsx`

- [ ] **Step 1: Buat subkomponen tab admin dalam `frontend/components/admin/`**
- [ ] **Step 2: Refaktor `frontend/app/admin/page.tsx` menjadi tab controller ringan (< 200 baris)**
- [ ] **Step 3: Jalankan pemeriksaan build frontend**

```bash
cd e:\project\DPRD\MEETDEWAN\frontend; npm run build
```
Pastikan `next build` selesai dengan sukses.

- [ ] **Step 4: Commit Task 6**

```bash
git add frontend/components/admin frontend/app/admin/page.tsx; git commit -m "refactor(frontend): modularize admin dashboard into dedicated tab components"
```

---

### Task 7: Verifikasi Menyeluruh & Laporan Hasil

**Files:**
- Test: Verifikasi endpoint `/api/health`, `/api/auth/login`, `/api/schedules`, dan build status.

- [ ] **Step 1: Verifikasi build backend dan frontend**
- [ ] **Step 2: Uji endpoint `/api/health`**
- [ ] **Step 3: Buat laporan Walkthrough hasil implementasi**
