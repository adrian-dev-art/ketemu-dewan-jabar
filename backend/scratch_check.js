const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const s = await prisma.schedule.findUnique({ where: { id: 51 } });
  console.log(JSON.stringify(s, null, 2));
  process.exit(0);
}

check();
