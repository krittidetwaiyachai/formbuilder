import { PrismaClient, RoleType, FieldType, SensitivityLevel, FormStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: RoleType.SUPER_ADMIN },
    update: {},
    create: {
      name: RoleType.SUPER_ADMIN,
      description: 'Full system access',
      permissions: {
        presets: ['create', 'read', 'update', 'delete'],
        forms: ['create', 'read', 'update', 'delete'],
        responses: ['read', 'export'],
        users: ['create', 'read', 'update', 'delete'],
      },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: RoleType.ADMIN },
    update: {},
    create: {
      name: RoleType.ADMIN,
      description: 'Can create forms and manage responses',
      permissions: {
        presets: ['read', 'apply'],
        forms: ['create', 'read', 'update', 'delete'],
        responses: ['read', 'export'],
      },
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: RoleType.EDITOR },
    update: {},
    create: {
      name: RoleType.EDITOR,
      description: 'Can edit forms',
      permissions: {
        presets: ['read', 'apply'],
        forms: ['read', 'update'],
        responses: ['read'],
      },
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: RoleType.VIEWER },
    update: {},
    create: {
      name: RoleType.VIEWER,
      description: 'Can only view responses',
      permissions: {
        presets: ['read'],
        forms: ['read'],
        responses: ['read'],
      },
    },
  });

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      roleId: superAdminRole.id,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole.id,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      password: hashedPassword,
      firstName: 'Editor',
      lastName: 'User',
      roleId: editorRole.id,
    },
  });

  // Create Preset - Personal Information
  const personalInfoPreset = await prisma.preset.create({
    data: {
      name: 'Personal Information',
      description: 'Standard personal information fields',
      isPII: true,
      sensitivityLevel: SensitivityLevel.HIGH,
      createdById: superAdmin.id,
      fields: {
        create: [
          {
            type: FieldType.TEXT,
            label: 'First Name',
            required: true,
            order: 0,
            validation: { minLength: 2, maxLength: 50 },
          },
          {
            type: FieldType.TEXT,
            label: 'Last Name',
            required: true,
            order: 1,
            validation: { minLength: 2, maxLength: 50 },
          },
          {
            type: FieldType.EMAIL,
            label: 'Email Address',
            required: true,
            order: 2,
            validation: { email: true },
          },
          {
            type: FieldType.PHONE,
            label: 'Phone Number',
            required: false,
            order: 3,
            validation: { pattern: '^[0-9]{10}$' },
          },
        ],
      },
    },
  });

  // Create Sample Form
  const sampleForm = await prisma.form.create({
    data: {
      title: 'Customer Feedback Survey',
      description: 'Help us improve our service',
      status: FormStatus.PUBLISHED,
      isQuiz: false,
      createdById: admin.id,
      fields: {
        create: [
          {
            type: FieldType.TEXT,
            label: 'Full Name',
            required: true,
            order: 0,
            validation: { minLength: 2 },
          },
          {
            type: FieldType.EMAIL,
            label: 'Email',
            required: true,
            order: 1,
          },
          {
            type: FieldType.RADIO,
            label: 'How satisfied are you?',
            required: true,
            order: 2,
            options: [
              { label: 'Very Satisfied', value: '5' },
              { label: 'Satisfied', value: '4' },
              { label: 'Neutral', value: '3' },
              { label: 'Dissatisfied', value: '2' },
              { label: 'Very Dissatisfied', value: '1' },
            ],
          },
          {
            type: FieldType.TEXTAREA,
            label: 'Additional Comments',
            required: false,
            order: 3,
          },
        ],
      },
    },
  });

  // Create Quiz Form
  const quizForm = await prisma.form.create({
    data: {
      title: 'Math Quiz',
      description: 'Test your math skills',
      status: FormStatus.PUBLISHED,
      isQuiz: true,
      quizSettings: {
        showScore: true,
        showAnswer: true,
        showDetail: true,
      },
      createdById: admin.id,
      fields: {
        create: [
          {
            type: FieldType.NUMBER,
            label: 'What is 2 + 2?',
            required: true,
            order: 0,
            correctAnswer: '4',
            score: 10,
          },
          {
            type: FieldType.NUMBER,
            label: 'What is 5 × 3?',
            required: true,
            order: 1,
            correctAnswer: '15',
            score: 10,
          },
          {
            type: FieldType.DROPDOWN,
            label: 'What is 10 ÷ 2?',
            required: true,
            order: 2,
            options: [
              { label: '3', value: '3' },
              { label: '4', value: '4' },
              { label: '5', value: '5' },
              { label: '6', value: '6' },
            ],
            correctAnswer: '5',
            score: 10,
          },
        ],
      },
    },
  });

  console.log('✅ Seeding completed!');
  console.log('📧 Login credentials:');
  console.log('   SuperAdmin: superadmin@example.com / password123');
  console.log('   Admin: admin@example.com / password123');
  console.log('   Editor: editor@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

