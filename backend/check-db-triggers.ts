import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTriggers() {
  console.log('Checking for PostgreSQL triggers and constraints...\n');

  
  const triggers = await prisma.$queryRaw`
    SELECT 
      trigger_name,
      event_object_table as table_name,
      action_timing,
      event_manipulation,
      action_statement
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    ORDER BY event_object_table, trigger_name;
  `;

  console.log('=== DATABASE TRIGGERS ===');
  console.log(JSON.stringify(triggers, null, 2));
  
  
  const fkConstraints = await prisma.$queryRaw`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule,
      rc.update_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND (tc.table_name = 'response_answers' OR ccu.table_name = 'response_answers')
    ORDER BY tc.table_name;
  `;

  console.log('\n=== FOREIGN KEY CONSTRAINTS (response_answers) ===');
  console.log(JSON.stringify(fkConstraints, null, 2));

  await prisma.$disconnect();
}

checkTriggers().catch((e) => {
  console.error(e);
  process.exit(1);
});
