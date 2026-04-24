import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up duplicate Dedi Aroza accounts...");
  
  // IDs to delete: 201 (seed), 38 (old/inactive)
  // We will keep 192 (hub) but update it.
  
  const idsToDelete = [201, 38];
  
  // First, verify they exist before deleting
  for (const id of idsToDelete) {
     try {
       await prisma.user.delete({ where: { id } });
       console.log(`Deleted user ID ${id}`);
     } catch (e) {
       console.log(`User ID ${id} already gone or not found.`);
     }
  }

  // Update the remaining one (192) to be the "official" test account
  const passwordHash = await bcrypt.hash('password', 10);
  
  await prisma.user.update({
    where: { id: 192 },
    data: {
      name: "H. Dedi Aroza, S.Ag., M.Si.",
      email: "dedi@dewan.id",
      jabatan: "Anggota Komisi I",
      passwordHash: passwordHash,
      isSync: true
    }
  });
  console.log("Updated user ID 192 with correct details.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
