
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying DB Data...');

  // 1. Get the IT Quiz Form
  const forms = await prisma.form.findMany({
    where: { title: { contains: 'IT Knowledge Quiz' } },
    include: { fields: true }
  });

  if (forms.length === 0) {
    console.log('❌ Form not found');
    return;
  }

  const form = forms[0];
  console.log(`✅ Form Found: ${form.title} (${form.id})`);
  console.log(`   Fields: ${form.fields.length}`);
  form.fields.forEach(f => console.log(`   - Field: ${f.label} (${f.id})`));

  // 2. Get Responses (latest first)
  const responses = await prisma.formResponse.findMany({
    where: { formId: form.id },
    include: { answers: true },
    orderBy: { submittedAt: 'desc' },
    take: 5
  });

  console.log(`\nFound ${responses.length} latest responses (newest first):`);

  responses.forEach((r, i) => {
    console.log(`\nResponse ${i+1} ID: ${r.id}`);
    console.log(`   SubmittedAt: ${r.submittedAt}`);
    
    if (r.answers.length === 0) {
        console.log('   ❌ Answers: EMPTY array');
    } else {
        console.log(`   ✅ Answers found: ${r.answers.length}`);
        r.answers.forEach(a => {
            const field = form.fields.find(f => f.id === a.fieldId);
            const matchStatus = field ? '✅ MATCH' : '❌ MISMATCH';
            console.log(`      - FieldId: ${a.fieldId} [${matchStatus}] Value: ${a.value}`);
        });
    }
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
