const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  try {
    // 1. List all forms to see what's there
    console.log('--- Forms in DB ---');
    const forms = await prisma.form.findMany({
      include: {
        fields: true,
      }
    });
    
    forms.forEach(f => {
      console.log(`ID: ${f.id}`);
      console.log(`Title: ${f.title}`);
      console.log(`Fields Count: ${f.fields.length}`);
      console.log('-------------------');
    });

    // 2. Check Activity Logs for the last edited form
    if (forms.length > 0) {
       // Sort by updated at desc
       const lastForm = forms.sort((a,b) => b.updatedAt - a.updatedAt)[0];
       console.log(`\n--- Activity Logs for Form ${lastForm.id} (${lastForm.title}) ---`);
       
       const logs = await prisma.activityLog.findMany({
         where: { formId: lastForm.id },
         orderBy: { createdAt: 'desc' },
         take: 5
       });
       
       logs.forEach(log => {
         console.log(`[${log.createdAt.toISOString()}] ${log.action}`);
         console.log(JSON.stringify(log.details, null, 2));
         console.log('---');
       });
    }

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

inspect();
