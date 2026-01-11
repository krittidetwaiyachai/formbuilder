import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConstraints() {
  console.log('Checking Database Constraints and Triggers...\n');

  // Get total responses and answers
  const totalResponses = await prisma.formResponse.count();
  const totalAnswers = await prisma.responseAnswer.count();
  
  console.log(`Total Responses: ${totalResponses}`);
  console.log(`Total Answers: ${totalAnswers}`);
  console.log(`Average Answers per Response: ${(totalAnswers / totalResponses).toFixed(2)}\n`);

  // Check for responses without answers
  const responsesWithoutAnswers = await prisma.formResponse.findMany({
    where: {
      answers: {
        none: {}
      }
    },
    select: {
      id: true,
      submittedAt: true
    },
    take: 10
  });

  console.log(`Responses without answers: ${responsesWithoutAnswers.length}`);
  if (responsesWithoutAnswers.length > 0) {
    console.log(`First 10:`);
    responsesWithoutAnswers.forEach((r, i) => {
      console.log(`  ${i+1}. ID: ${r.id}, Submitted: ${r.submittedAt}`);
    });
  }

  await prisma.$disconnect();
}

checkConstraints().catch((e) => {
  console.error(e);
  process.exit(1);
});
