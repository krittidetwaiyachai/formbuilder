import { PrismaClient } from '@prisma/client';

async function clearLocks() {
  const prisma = new PrismaClient();
  await prisma.$connect();
  const query = `
    SELECT pg_terminate_backend(pid) 
    FROM pg_stat_activity 
    WHERE datname = 'formbuilder' 
      AND pid <> pg_backend_pid()
      AND state IN ('idle in transaction', 'idle', 'active');
  `;
  try {
    await prisma.$executeRawUnsafe(query);
    console.log('✅ Cleared stuck connections!');
  } catch (e) {
    console.log('Note: Terminating self or others.', e.message);
  }
  await prisma.$disconnect();
}

clearLocks().then(() => process.exit(0));
