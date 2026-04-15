import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting definitive duplicate cleanup with relation handling...");

  const centreId = 'dc8625c9-e952-4722-b619-c850ea8d9e93';

  // 1. Identify all candidates
  const candidates = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'Dedi Aroza', mode: 'insensitive' } },
        { email: 'dedi@dewan.id' },
        { centreId: centreId }
      ]
    }
  });

  console.log(`Found ${candidates.length} candidates.`);

  const primary = candidates.find(u => u.centreId === centreId);
  if (!primary) {
    console.error("CRITICAL ERROR: Primary account (centreId: dc8625c9...) not found.");
    return;
  }

  console.log(`Primary ID: ${primary.id}`);

  // 2. Handle secondaries
  const secondaries = candidates.filter(u => u.id !== primary.id);
  
  for (const s of secondaries) {
    console.log(`Processing secondary ID: ${s.id} (${s.email})`);

    // Delete simple relations that don't need merging
    await prisma.availability.deleteMany({ where: { dewanId: s.id } });
    await prisma.aKDMember.deleteMany({ where: { dewanId: s.id } });

    // Merge relations that might have data we want to keep
    const schedCount = await prisma.scheduleParticipant.count({ where: { dewanId: s.id } });
    if (schedCount > 0) {
        console.log(`Merging ${schedCount} schedules...`);
        // Use executeRaw or updateMany to handle potential unique constraint on (scheduleId, dewanId)
        // If primary already has it, we just delete the secondary one.
        const sParticipants = await prisma.scheduleParticipant.findMany({ where: { dewanId: s.id } });
        for (const p of sParticipants) {
            try {
                await prisma.scheduleParticipant.update({
                    where: { id: p.id },
                    data: { dewanId: primary.id }
                });
            } catch (e) {
                // Already exists for primary, just delete
                await prisma.scheduleParticipant.delete({ where: { id: p.id } });
            }
        }
    }

    const ratingCount = await prisma.rating.count({ where: { dewanId: s.id } });
    if (ratingCount > 0) {
        console.log(`Merging ${ratingCount} ratings...`);
        const pRatings = await prisma.rating.findMany({ where: { dewanId: s.id } });
        for (const r of pRatings) {
            try {
                await prisma.rating.update({
                    where: { id: r.id },
                    data: { dewanId: primary.id }
                });
            } catch (e) {
                await prisma.rating.delete({ where: { id: r.id } });
            }
        }
    }

    // Finally delete the user
    await prisma.user.delete({ where: { id: s.id } });
    console.log(`Deleted user ID ${s.id}`);
  }

  console.log("Database cleaned successfully.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
