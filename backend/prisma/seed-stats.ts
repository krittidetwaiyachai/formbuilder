
import { PrismaClient, FormStatus, FieldType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding statistics data...');

  
  const getRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@app.com' },
  });

  if (!admin) {
    console.error('❌ Admin user not found. Please run main seed first.');
    return;
  }

  
  console.log('🧹 Clearing existing responses and forms...');
  await prisma.responseAnswer.deleteMany({});
  await prisma.formResponse.deleteMany({});
  
  
  await prisma.form.deleteMany({
    where: {
      description: 'Historical form created for stats testing'
    }
  });

  
  console.log('Creating historical forms...');
  const formTitles = [
    'Customer Satisfaction Survey Q3',
    'Employee Engagement Survey 2024',
    'Product Launch Feedback',
    'Website Usability Test',
    'Event Registration: Tech Talk',
    'Workshop Feedback: React 101',
    'Annual General Meeting Registration',
    'IT Support Ticket',
    'Leave Request Form',
    'Expense Reimbursement',
    'New Year Party RSVP',
    'Training Needs Assessment',
    'Client Onboarding Checklist',
    'Bug Report Template',
    'Feature Request Form'
  ];

  const createdForms = [];

  for (const title of formTitles) {
    
    const createdAt = getRandomDate(sixMonthsAgo, now);
    
    
    const form = await prisma.form.create({
      data: {
        title: title,
        description: `Historical form created for stats testing`,
        status: FormStatus.PUBLISHED,
        createdById: admin.id,
        createdAt: createdAt,
        updatedAt: createdAt,
        fields: {
          create: [
            { type: FieldType.TEXT, label: 'Name', required: true, order: 0 },
            { type: FieldType.RATE, label: 'Rating', required: true, order: 1, options: { maxRating: 5 } },
            { type: FieldType.TEXTAREA, label: 'Comments', order: 2 }
          ]
        }
      },
      include: {
        fields: true
      }
    });

    createdForms.push(form);
    console.log(`   Created form: ${title} (${createdAt.toISOString().split('T')[0]})`);
  }

  
  console.log('Creating historical responses...');
  
  
  const monthlyWeights = [0.3, 0.5, 0.8, 1.2, 0.9, 1.1]; 
  
  for (let i = 0; i < 6; i++) {
    const monthDate = new Date();
    monthDate.setMonth(now.getMonth() - (5 - i));
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    
    const baseCount = 150 + Math.floor(Math.random() * 100); 
    const count = Math.floor(baseCount * monthlyWeights[i]);

    console.log(`   Generating ${count} responses for ${monthStart.toLocaleString('default', { month: 'long' })}...`);

    const batchSize = 50;
    const batches = Math.ceil(count / batchSize);

    for (let b = 0; b < batches; b++) {
      const currentBatchSize = Math.min(batchSize, count - b * batchSize);
      const promises = [];

      for (let j = 0; j < currentBatchSize; j++) {
        const form = createdForms[Math.floor(Math.random() * createdForms.length)];
        const submittedAt = getRandomDate(monthStart, monthEnd);
        
        if (submittedAt > now) continue;

        promises.push(
          prisma.formResponse.create({
            data: {
              formId: form.id,
              submittedAt: submittedAt,
              createdAt: submittedAt,
              answers: {
                 create: [
                   { fieldId: form.fields[0].id, value: `User ${b}-${j}` },
                   { fieldId: form.fields[1].id, value: Math.floor(1 + Math.random() * 5).toString() },
                   { fieldId: form.fields[2].id, value: 'Sample comment' }
                 ]
              }
            }
          })
        );
      }
      
      await prisma.$transaction(promises);
    }
  }

  console.log('✅ Statistics seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
