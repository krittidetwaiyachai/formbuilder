import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.systemSetting.update({
    where: { id: 'default' },
    data: { smtpSecure: false }
  });
  console.log('Fixed smtpSecure properly');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
