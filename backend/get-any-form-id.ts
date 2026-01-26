
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const form = await prisma.form.findFirst({
    where: { status: 'PUBLISHED' },
  });

  if (form) {
    console.log(form.id);
  } else {
    console.log('NO_FORM_FOUND');
  }
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
