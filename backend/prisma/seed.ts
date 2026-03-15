import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Mulai seeding data...');

    // 1. Seed Dewan
    const dewan1 = await prisma.user.upsert({
        where: { email: 'ahmad@dewan.id' },
        update: {},
        create: {
            name: 'Ahmad Kurniawan',
            role: 'dewan',
            email: 'ahmad@dewan.id',
            bio: 'Wakil Rakyat Dapil A - Fokus pada infrastruktur.',
        },
    });

    const dewan2 = await prisma.user.upsert({
        where: { email: 'siti@dewan.id' },
        update: {},
        create: {
            name: 'Siti Aminah',
            role: 'dewan',
            email: 'siti@dewan.id',
            bio: 'Wakil Rakyat Dapil B - Fokus pada pendidikan dan kesehatan.',
        },
    });

    // 2. Seed Masyarakat Demo
    const masyarakat = await prisma.user.upsert({
        where: { email: 'masyarakat@demo.id' },
        update: {},
        create: {
            id: 101,
            name: 'User Demo Masyarakat',
            role: 'masyarakat',
            email: 'masyarakat@demo.id',
        },
    });

    // 3. Seed Availability
    const now = new Date();
    await prisma.availability.createMany({
        data: [
            { dewanId: dewan1.id, startTime: new Date(now.getTime() + 60 * 60 * 1000), endTime: new Date(now.getTime() + 120 * 60 * 1000) },
            { dewanId: dewan1.id, startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), endTime: new Date(now.getTime() + 25 * 60 * 60 * 1000) },
            { dewanId: dewan2.id, startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000) },
        ]
    });

    // 4. Seed Schedules (Meetings) for Dashboard Verification
    
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
