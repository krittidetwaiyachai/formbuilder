import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.update({
    where: { id: 'f0d7b1da-6207-4c4a-89ba-5b398c382484' },
    data: { realEmail: null },
    select: { id: true, email: true, realEmail: true }
  });
  console.log('Cleared realEmail for test:', JSON.stringify(updated, null, 2));
  await prisma.$disconnect();
}

main();
