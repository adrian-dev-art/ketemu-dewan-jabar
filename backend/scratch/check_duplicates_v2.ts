import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const usersByName = await prisma.user.findMany({
    where: { name: { contains: 'Dedi', mode: 'insensitive' } },
  });
  const usersByEmail = await prisma.user.findMany({
    where: { email: 'dedi@dewan.id' },
  });
  
  console.log("Users by Name:", JSON.stringify(usersByName, null, 2));
  console.log("Users by Email:", JSON.stringify(usersByEmail, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
