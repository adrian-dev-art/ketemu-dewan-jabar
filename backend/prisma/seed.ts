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

    console.log('Seeding selesai!');
    console.log({ dewan1, dewan2, masyarakat });
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
