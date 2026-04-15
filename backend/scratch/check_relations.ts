import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dediIds = [201, 192, 38];
  
  for (const id of dediIds) {
    const schedules = await prisma.scheduleParticipant.findMany({
      where: { dewanId: id },
    });
    const ratings = await prisma.rating.findMany({
      where: { dewanId: id },
    });
    console.log(`User ID ${id} has ${schedules.length} schedules and ${ratings.length} ratings.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
