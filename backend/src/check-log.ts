
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const lastLog = await prisma.activityLog.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  console.log('Last Log Action:', lastLog?.action);
  console.log('Last Log Details:', JSON.stringify(lastLog?.details, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
