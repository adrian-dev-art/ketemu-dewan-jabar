import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Pre-seed cleanup...");
  
  // Delete the duplicate that was a result of the first seed attempt
  try {
    await prisma.user.delete({ where: { id: 554 } });
    console.log("Deleted user ID 554");
  } catch (e) {
    console.log("User 554 not found.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
