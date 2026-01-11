
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting debug...');

  // Find the form that contains field 'itq_1'
  const form = await prisma.form.findFirst({
    where: {
      fields: {
        some: {
          id: 'itq_1'
        }
      }
    },
    include: {
        fields: true
    }
  });

  if (!form) {
    console.log('Form with field "itq_1" not found!');
    return;
  }

  console.log(`Found Form: ${form.title} (${form.id})`);
  console.log(`Fields count: ${form.fields.length}`);

  // Get responses for this form
  const responses = await prisma.formResponse.findMany({
    where: {
      formId: form.id
    },
    include: {
      answers: true
    },
    orderBy: {
        submittedAt: 'desc'
    },
    take: 5
  });

  console.log(`Found ${responses.length} responses (showing top 5)`);

  responses.forEach((r, i) => {
    console.log(`\nResponse #${i + 1} ID: ${r.id}`);
    console.log(`Submitted At: ${r.submittedAt}`);
    console.log(`Respondent Email: ${r.respondentEmail}`);
    console.log(`Answers Count: ${r.answers.length}`);
    if (r.answers.length > 0) {
        console.log('Answers:', r.answers.map(a => `${a.fieldId}: ${a.value}`));
    } else {
        console.log('Answers: [] (EMPTY)');
    }
  });
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
