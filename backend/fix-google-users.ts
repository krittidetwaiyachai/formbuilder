import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: { provider: 'google' },
    data: { isEmailVerified: true }
  });
  
  // also set realEmail to email for google users if it is null
  const googleUsers = await prisma.user.findMany({
    where: { provider: 'google' }
  });
  
  for (const user of googleUsers) {
    if (!user.realEmail) {
      await prisma.user.update({
        where: { id: user.id },
        data: { realEmail: user.email }
      });
    }
  }

  console.log(`Updated ${result.count} Google users to verified`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
