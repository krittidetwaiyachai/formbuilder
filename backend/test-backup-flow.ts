import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { SystemSettingsService } from './src/system-settings/system-settings.service';
import { PrismaService } from './src/prisma/prisma.service';

async function runTest() {
  console.log('🔄 Initializing NestJS application context...');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const prisma = app.get(PrismaService);
  const settingsSvc = app.get(SystemSettingsService);

  try {
    console.log('\n📊 1. Checking Current Database State...');
    const userCount = await prisma.user.count();
    const formCount = await prisma.form.count();
    const responseCount = await prisma.formResponse.count();
    console.log(`- Users: ${userCount}`);
    console.log(`- Forms: ${formCount}`);
    console.log(`- Responses: ${responseCount}`);

    console.log('\n💾 2. Running Backup...');
    const backupRes = await settingsSvc.runBackupNow();
    console.log('Backup generated:', backupRes);

    if (backupRes.status !== 'success') {
      throw new Error('Backup failed!');
    }

    console.log('\n🗑️ 3. WIPING DATABASE (DROP SCHEMA public CASCADE)...');
    await prisma.$executeRawUnsafe(`DROP SCHEMA public CASCADE;`);
    await prisma.$executeRawUnsafe(`CREATE SCHEMA public;`);
    
    // Disconnect Prisma temporarily because schema changed abruptly
    await prisma.$disconnect();

    console.log('Database wiped completely. Simulating zero-state.');

    console.log('\n♻️ 4. Restoring Database from Backup...');
    // We expect the custom pg_restore command to recreate the public schema's contents
    const restoreRes = await settingsSvc.restoreLatestBackup();
    console.log('Restore result:', restoreRes);

    if (restoreRes.status !== 'success') {
      throw new Error('Restore failed!');
    }

    console.log('\n📊 5. Validating Restored Database State...');
    // Connect again to test new tables
    await prisma.$connect();
    
    const userCountAfter = await prisma.user.count();
    const formCountAfter = await prisma.form.count();
    const responseCountAfter = await prisma.formResponse.count();
    console.log(`- Users: ${userCountAfter}`);
    console.log(`- Forms: ${formCountAfter}`);
    console.log(`- Responses: ${responseCountAfter}`);

    if (userCount === userCountAfter && formCount === formCountAfter && responseCount === responseCountAfter) {
      console.log('\n✅ TEST PASSED: Data restored fully and matches perfectly!');
    } else {
      console.log('\n❌ TEST FAILED: Data mismatch!');
    }

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await app.close();
  }
}

runTest();
