import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Mulai seeding data...');

    // Hash password for all users
    const passwordHash = await bcrypt.hash('password', 10);

    // 1. Seed Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@dewan.id' },
        update: { passwordHash },
        create: {
            name: 'Super Admin',
            role: 'admin',
            email: 'admin@dewan.id',
            passwordHash,
        },
    });

    // 2. Seed Dewan
    const dewan1 = await prisma.user.upsert({
        where: { email: 'ahmad@dewan.id' },
        update: { passwordHash },
        create: {
            name: 'Ahmad Kurniawan',
            role: 'dewan',
            email: 'ahmad@dewan.id',
            passwordHash,
            bio: 'Wakil Rakyat Dapil A - Fokus pada infrastruktur.',
        },
    });

    const dewan2 = await prisma.user.upsert({
        where: { email: 'siti@dewan.id' },
        update: { passwordHash },
        create: {
            name: 'Siti Aminah',
            role: 'dewan',
            email: 'siti@dewan.id',
            passwordHash,
            bio: 'Wakil Rakyat Dapil B - Fokus pada pendidikan dan kesehatan.',
        },
    });

    // 3. Seed Masyarakat Demo
    const masyarakat = await prisma.user.upsert({
        where: { email: 'masyarakat@demo.id' },
        update: { passwordHash },
        create: {
            name: 'User Demo Masyarakat',
            role: 'masyarakat',
            email: 'masyarakat@demo.id',
            passwordHash,
        },
    });

    // 4. Seed Availability
    const now = new Date();
    
    // Clean up existing availabilities to avoid duplicates in this simple seeder
    await prisma.availability.deleteMany({});
    
    await prisma.availability.createMany({
        data: [
            { dewanId: dewan1.id, startTime: new Date(now.getTime() + 60 * 60 * 1000), endTime: new Date(now.getTime() + 120 * 60 * 1000) },
            { dewanId: dewan1.id, startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), endTime: new Date(now.getTime() + 25 * 60 * 60 * 1000) },
            { dewanId: dewan2.id, startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000) },
        ]
    });

    // 5. Seed Schedules (Meetings) for Dashboard Verification
    // Clean up existing schedules
    await prisma.schedule.deleteMany({});
    
    // ACTIVE: Confirmed, starting now (with a bit of buffer into the past to be "ongoing")
    await prisma.schedule.create({
        data: {
            title: 'Diskusi Jalan Rusak di Cibiru',
            masyarakatId: masyarakat.id,
            dewanId: dewan1.id,
            startTime: new Date(now.getTime() - 5 * 60 * 1000), // Started 5 mins ago
            status: 'confirmed'
        }
    });

    // INCOMING: Confirmed, starting in 2 hours
    await prisma.schedule.create({
        data: {
            title: 'Pemerataan Fasilitas Sekolah Dasar',
            masyarakatId: masyarakat.id,
            dewanId: dewan2.id,
            startTime: new Date(now.getTime() + 120 * 60 * 1000),
            status: 'confirmed'
        }
    });

    // PENDING: Waiting for approval, in 1 day
    await prisma.schedule.create({
        data: {
            title: 'Rekomendasi Penyaluran Pupuk Subsidi',
            masyarakatId: masyarakat.id,
            dewanId: dewan1.id,
            startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            status: 'pending'
        }
    });

    // REJECTED: Past or future
    await prisma.schedule.create({
        data: {
            title: 'Izin Pembangunan Lapangan Basket',
            masyarakatId: masyarakat.id,
            dewanId: dewan2.id,
            startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
            status: 'rejected'
        }
    });

    // DONE: Past confirmed session
    await prisma.schedule.create({
        data: {
            title: 'Evaluasi Penanganan Banjir Musiman',
            masyarakatId: masyarakat.id,
            dewanId: dewan1.id,
            startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            status: 'confirmed'
        }
    });

    console.log('Seeding selesai!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
