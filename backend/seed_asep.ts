import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Asep Suherman...");

  const dewan = await prisma.user.findFirst({
    where: { name: { contains: 'Asep Suherman' } }
  });

  if (!dewan) {
    console.log("Asep Suherman not found!");
    return;
  }

  // Find or create a masyarakat user
  let masyarakat = await prisma.user.findFirst({
    where: { role: 'masyarakat' }
  });

  if (!masyarakat) {
    const passwordHash = await bcrypt.hash('password', 10);
    masyarakat = await prisma.user.create({
      data: {
        name: 'Warga Tester',
        email: 'warga.asep@test.com',
        role: 'masyarakat',
        passwordHash
      }
    });
  }

  // Create a schedule
  const schedule = await prisma.schedule.create({
    data: {
      title: 'Diskusi Aspirasi Pembangunan',
      startTime: new Date(),
      status: 'completed',
      dewanId: dewan.id,
      masyarakatId: masyarakat.id
    }
  });

  // Create a rating
  await prisma.rating.create({
    data: {
      scheduleId: schedule.id,
      dewanId: dewan.id,
      speakingScore: 5,
      contextScore: 4,
      timeScore: 5,
      responsivenessScore: 4,
      solutionScore: 5,
      comment: "Pak Asep sangat inspiratif dan solutif."
    }
  });

  console.log(`Successfully seeded rating for ${dewan.name}!`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
