import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting final duplicate cleanup for Dedi Aroza...");

  // 1. Identify all candidates
  const candidates = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'Dedi Aroza', mode: 'insensitive' } },
        { email: 'dedi@dewan.id' },
        { centreId: 'dc8625c9-e952-4722-b619-c850ea8d9e93' }
      ]
    }
  });

  console.log(`Found ${candidates.length} candidates.`);

  // 2. Identify the "Primary" account (the one with the correct centreId)
  const primary = candidates.find(u => u.centreId === 'dc8625c9-e952-4722-b619-c850ea8d9e93');
  
  if (!primary) {
    console.error("CRITICAL ERROR: Could not find the primary synced account (centreId: dc8625c9...). Manual intervention may be needed.");
    return;
  }

  console.log(`Primary Account identified: ID ${primary.id} (${primary.email})`);

  // 3. Delete all other candidates
  const secondaries = candidates.filter(u => u.id !== primary.id);
  for (const s of secondaries) {
    // Check for relations first to be safe (though previous check said 0)
    const count = await prisma.scheduleParticipant.count({ where: { dewanId: s.id } });
    if (count > 0) {
        console.warn(`WARNING: User ID ${s.id} has ${count} schedules. Merging relations to Primary...`);
        await prisma.scheduleParticipant.updateMany({
            where: { dewanId: s.id },
            data: { dewanId: primary.id }
        });
    }
    
    await prisma.user.delete({ where: { id: s.id } });
    console.log(`Deleted duplicate User ID ${s.id} (${s.email})`);
  }

  // 4. Ensure Primary has temporary email cleared if it conflicts with what we want to set
  // (In this case, we want to set it to dedi@dewan.id).
  // If another user had it, they are already deleted by now.
  
  console.log("Cleanup phase complete.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
