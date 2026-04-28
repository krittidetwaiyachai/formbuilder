import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { contains: 'kaijiieow' } },
    select: { id: true, email: true, realEmail: true, isEmailVerified: true, provider: true }
  });
  console.log('User from DB:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
