
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching latest response...');
  
  const latestResponse = await prisma.formResponse.findFirst({
    orderBy: {
      submittedAt: 'desc',
    },
    include: {
      answers: {
        include: {
          field: true
        }
      },
      form: true
    }
  });

  if (!latestResponse) {
    console.log('No responses found.');
    return;
  }

  console.log('\n=== Form Configuration ===');
  const form = await prisma.form.findUnique({
      where: { id: latestResponse.formId },
      include: { fields: true }
  });
  
  if (form) {
      console.log('Fields in Form Definition:');
      form.fields.forEach(f => {
          console.log(`- [${f.label}]: isPII = ${f.isPII}`);
      });
  }

  console.log('\n=== Latest Form Response ===');
  console.log(`Form: ${latestResponse.form.title}`);
  console.log(`Submitted At: ${latestResponse.submittedAt}`);
  console.log('--------------------------------');
  console.log('Answers stored in DB:');
  
  latestResponse.answers.forEach(answer => {
    const isPII = answer.field.isPII;
    console.log(`\nField: ${answer.field.label} (Type: ${answer.field.type})`);
    console.log(`PDPA Enabled (isPII in Response): ${isPII}`);
    console.log(`Stored Value (Raw): ${answer.value}`);
    
    if (isPII) {
       if (answer.value && answer.value.includes(':') && answer.value.length > 32) {
           console.log('✅ STATUS: ENCRYPTED (Looks like an encrypted string)');
       } else {
           console.log('❌ STATUS: NOT ENCRYPTED (Warning: Should be encrypted)');
       }
    } else {
        console.log('ℹ️ STATUS: Normal Text');
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
