import { PrismaClient, RoleType, FieldType, FormStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  
  const superAdminRole = await prisma.role.upsert({
    where: { name: RoleType.SUPER_ADMIN },
    update: {
      permissions: [
        'MANAGE_USERS', 'MANAGE_BUNDLES', 'MANAGE_ROLES', 'MANAGE_FORMS', 
        'MANAGE_TEMPLATES', 'MANAGE_SETTINGS', 'VIEW_SYSTEM_LOGS', 'VIEW_ANALYTICS',
        'VIEW_RESPONSES', 'VIEW_USER_DATA', 'VIEW_AUDIT_LOG', 'EXPORT_DATA',
        'DELETE_RESPONSES', 'BYPASS_PDPA'
      ],
    },
    create: {
      name: RoleType.SUPER_ADMIN,
      description: 'Full system access',
      permissions: [
        'MANAGE_USERS', 'MANAGE_BUNDLES', 'MANAGE_ROLES', 'MANAGE_FORMS', 
        'MANAGE_TEMPLATES', 'MANAGE_SETTINGS', 'VIEW_SYSTEM_LOGS', 'VIEW_ANALYTICS',
        'VIEW_RESPONSES', 'VIEW_USER_DATA', 'VIEW_AUDIT_LOG', 'EXPORT_DATA',
        'DELETE_RESPONSES', 'BYPASS_PDPA'
      ],
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: RoleType.ADMIN },
    update: {
      permissions: [
        'MANAGE_BUNDLES', 'MANAGE_FORMS', 'VIEW_ANALYTICS', 
        'VIEW_RESPONSES', 'EXPORT_DATA', 'DELETE_RESPONSES'
      ],
    },
    create: {
      name: RoleType.ADMIN,
      description: 'Can create forms and manage responses',
      permissions: [
        'MANAGE_BUNDLES', 'MANAGE_FORMS', 'VIEW_ANALYTICS', 
        'VIEW_RESPONSES', 'EXPORT_DATA', 'DELETE_RESPONSES'
      ],
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: RoleType.EDITOR },
    update: {
      permissions: ['VIEW_ANALYTICS', 'VIEW_RESPONSES'],
    },
    create: {
      name: RoleType.EDITOR,
      description: 'Can edit forms',
      permissions: ['VIEW_ANALYTICS', 'VIEW_RESPONSES'],
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: RoleType.VIEWER },
    update: {
      permissions: ['VIEW_RESPONSES'],
    },
    create: {
      name: RoleType.VIEWER,
      description: 'Can only view responses',
      permissions: ['VIEW_RESPONSES'],
    },
  });

  
  const hashedPassword = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'super@app.com' },
    update: {},
    create: {
      email: 'super@app.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      roleId: superAdminRole.id,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@app.com' },
    update: {},
    create: {
      email: 'admin@app.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole.id,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@app.com' },
    update: {},
    create: {
      email: 'editor@app.com',
      password: hashedPassword,
      firstName: 'Editor',
      lastName: 'Main',
      roleId: editorRole.id,
    },
  });

  const editor1 = await prisma.user.upsert({
    where: { email: 'ed1@app.com' },
    update: {},
    create: {
      email: 'ed1@app.com',
      password: hashedPassword,
      firstName: 'Ed',
      lastName: 'One',
      roleId: editorRole.id,
    },
  });

  const editor2 = await prisma.user.upsert({
    where: { email: 'ed2@app.com' },
    update: {},
    create: {
      email: 'ed2@app.com',
      password: hashedPassword,
      firstName: 'Ed',
      lastName: 'Two',
      roleId: editorRole.id,
    },
  });

  const editor3 = await prisma.user.upsert({
    where: { email: 'ed3@app.com' },
    update: {},
    create: {
      email: 'ed3@app.com',
      password: hashedPassword,
      firstName: 'Ed',
      lastName: 'Three',
      roleId: editorRole.id,
    },
  });

  const editor4 = await prisma.user.upsert({
    where: { email: 'ed4@app.com' },
    update: {},
    create: {
      email: 'ed4@app.com',
      password: hashedPassword,
      firstName: 'Ed',
      lastName: 'Four',
      roleId: editorRole.id,
    },
  });

  const editor5 = await prisma.user.upsert({
    where: { email: 'ed5@app.com' },
    update: {},
    create: {
      email: 'ed5@app.com',
      password: hashedPassword,
      firstName: 'Ed',
      lastName: 'Five',
      roleId: editorRole.id,
    },
  });

  const editor6 = await prisma.user.upsert({
    where: { email: 'ed6@app.com' },
    update: {},
    create: {
      email: 'ed6@app.com',
      password: hashedPassword,
      firstName: 'Ed',
      lastName: 'Six',
      roleId: editorRole.id,
    },
  });

  const editor7 = await prisma.user.upsert({
    where: { email: 'ed7@app.com' },
    update: {},
    create: {
      email: 'ed7@app.com',
      password: hashedPassword,
      firstName: 'Ed',
      lastName: 'Seven',
      roleId: editorRole.id,
    },
  });

  const editor8 = await prisma.user.upsert({
    where: { email: 'ed8@app.com' },
    update: {},
    create: {
      email: 'ed8@app.com',
      password: hashedPassword,
      firstName: 'Ed',
      lastName: 'Eight',
      roleId: editorRole.id,
    },
  });

  const editor9 = await prisma.user.upsert({
    where: { email: 'ed9@app.com' },
    update: {},
    create: {
      email: 'ed9@app.com',
      password: hashedPassword,
      firstName: 'Ed',
      lastName: 'Nine',
      roleId: editorRole.id,
    },
  });

  const editor10 = await prisma.user.upsert({
    where: { email: 'ed10@app.com' },
    update: {},
    create: {
      email: 'ed10@app.com',
      password: hashedPassword,
      firstName: 'Ed',
      lastName: 'Ten',
      roleId: editorRole.id,
    },
  });

  
  
  

  
  console.log('Clearing existing test forms...');
  
  
  console.log('   Deleting all responses for editor test forms...');
  const deletedAllResponses = await prisma.formResponse.deleteMany({
    where: {
      form: {
        title: {
          contains: '[TEST]'
        }
      }
    }
  });
  console.log(`   ✅ Deleted ${deletedAllResponses.count} responses from test forms`);

  
  const deletedForms = await prisma.form.deleteMany({
    where: {
      title: {
        contains: '[TEST]',
      },
    },
  });
  console.log(`   ✅ Deleted ${deletedForms.count} old forms`);

  
  console.log('   Cleaning up orphaned answers...');
  const orphanedAnswers = await prisma.responseAnswer.deleteMany({
    where: {
      fieldId: null
    }
  });
  console.log(`   ✅ Deleted ${orphanedAnswers.count} orphaned answers`);

  console.log('Creating comprehensive test forms...');

  
  await prisma.form.create({
    data: {
      title: '[TEST] Quiz System - General Knowledge',
      description: 'ทดสอบระบบ Quiz: การให้คะแนน, แสดงเฉลย, คำนวณคะแนนอัตโนมัติ',
      status: FormStatus.PUBLISHED,
      isQuiz: true,
      quizSettings: {
        showScore: true,
        showAnswer: true,
        showDetail: true,
        releaseScoreMode: 'immediately',
        allowViewMissedQuestions: true,
        shuffleQuestions: false,
      },
      createdById: editor.id,
      fields: {
        create: [
          {
            type: FieldType.RADIO,
            label: 'ประเทศไทยมีกี่จังหวัด?',
            required: true,
            order: 0,
            options: [
              { label: '76 จังหวัด', value: '76' },
              { label: '77 จังหวัด', value: '77' },
              { label: '78 จังหวัด', value: '78' },
              { label: '79 จังหวัด', value: '79' },
            ],
            correctAnswer: '77',
            score: 20,
          },
          {
            type: FieldType.DROPDOWN,
            label: 'เมืองหลวงของฝรั่งเศสคือ?',
            required: true,
            order: 1,
            options: [
              { label: 'London', value: 'London' },
              { label: 'Paris', value: 'Paris' },
              { label: 'Rome', value: 'Rome' },
              { label: 'Berlin', value: 'Berlin' },
            ],
            correctAnswer: 'Paris',
            score: 20,
          },
          {
            type: FieldType.NUMBER,
            label: '1 + 1 = ?',
            required: true,
            order: 2,
            correctAnswer: '2',
            score: 10,
          },
          {
            type: FieldType.TEXT,
            label: 'สีของท้องฟ้าคือ?',
            required: true,
            order: 3,
            correctAnswer: 'ฟ้า',
            score: 15,
          },
          {
            type: FieldType.CHECKBOX,
            label: 'ภาษาโปรแกรมมิ่งใดที่ใช้สำหรับ Web? (เลือกได้หลายข้อ)',
            required: true,
            order: 4,
            options: [
              { label: 'JavaScript', value: 'JavaScript' },
              { label: 'Python', value: 'Python' },
              { label: 'TypeScript', value: 'TypeScript' },
              { label: 'Java', value: 'Java' },
            ],
            correctAnswer: 'JavaScript,TypeScript',
            score: 35,
          },
        ],
      },
    },
  });

  
  const quizForm = await prisma.form.findFirst({
    where: {
      title: '🎓 [TEST] Quiz System - General Knowledge',
      createdById: editor.id,
    },
    include: { fields: true },
  });

  if (quizForm) {
    const sampleResponses = [
      { provinces: '77', capital: 'Paris', math: '2', sky: 'ฟ้า', langs: 'JavaScript,TypeScript', score: 100 },
      { provinces: '76', capital: 'Paris', math: '2', sky: 'ฟ้า', langs: 'JavaScript', score: 65 },
      { provinces: '77', capital: 'London', math: '3', sky: 'น้ำเงิน', langs: 'Python', score: 20 },
      { provinces: '77', capital: 'Paris', math: '2', sky: 'สีฟ้า', langs: 'JavaScript,TypeScript', score: 85 },
      { provinces: '78', capital: 'Rome', math: '2', sky: 'ฟ้า', langs: 'Java', score: 25 },
      { provinces: '77', capital: 'Paris', math: '2', sky: 'ฟ้า', langs: 'JavaScript', score: 85 },
      { provinces: '76', capital: 'Paris', math: '2', sky: 'ฟ้า', langs: 'TypeScript', score: 65 },
      { provinces: '77', capital: 'Paris', math: '1', sky: 'ฟ้า', langs: 'JavaScript,TypeScript', score: 90 },
      { provinces: '77', capital: 'Berlin', math: '2', sky: 'ฟ้า', langs: 'JavaScript', score: 65 },
      { provinces: '79', capital: 'Paris', math: '2', sky: 'ฟ้า', langs: 'JavaScript,TypeScript', score: 80 },
      { provinces: '77', capital: 'Paris', math: '2', sky: 'ฟ้า', langs: 'JavaScript,TypeScript', score: 100 },
      { provinces: '77', capital: 'Paris', math: '2', sky: 'ฟ้า', langs: 'JavaScript', score: 85 },
      { provinces: '76', capital: 'London', math: '3', sky: 'เขียว', langs: 'Python,Java', score: 0 },
      { provinces: '77', capital: 'Paris', math: '2', sky: 'ฟ้า', langs: 'TypeScript', score: 70 },
      { provinces: '77', capital: 'Paris', math: '2', sky: 'ฟ้า', langs: 'JavaScript,TypeScript', score: 100 },
    ];

    const fieldMap: Record<string, string> = {};
    quizForm.fields.forEach((f) => {
      if (f.label.includes('จังหวัด')) fieldMap['provinces'] = f.id;
      if (f.label.includes('ฝรั่งเศส')) fieldMap['capital'] = f.id;
      if (f.label.includes('1 + 1')) fieldMap['math'] = f.id;
      if (f.label.includes('ท้องฟ้า')) fieldMap['sky'] = f.id;
      if (f.label.includes('Web')) fieldMap['langs'] = f.id;
    });

    for (let i = 0; i < sampleResponses.length; i++) {
      const resp = sampleResponses[i];
      const submittedAt = new Date(Date.now() - (sampleResponses.length - i) * 24 * 60 * 60 * 1000);
      
      await prisma.formResponse.create({
        data: {
          formId: quizForm.id,
          submittedAt,
          score: resp.score,
          totalScore: 100,
          answers: {
            create: [
              {
                fieldId: fieldMap['provinces'],
                value: resp.provinces,
                isCorrect: resp.provinces === '77',
              },
              {
                fieldId: fieldMap['capital'],
                value: resp.capital,
                isCorrect: resp.capital === 'Paris',
              },
              {
                fieldId: fieldMap['math'],
                value: resp.math,
                isCorrect: resp.math === '2',
              },
              {
                fieldId: fieldMap['sky'],
                value: resp.sky,
                isCorrect: resp.sky === 'ฟ้า',
              },
              {
                fieldId: fieldMap['langs'],
                value: resp.langs,
                isCorrect: resp.langs === 'JavaScript,TypeScript',
              },
            ],
          },
        },
      });
    }
    console.log(`   Added ${sampleResponses.length} sample responses to Quiz form`);
  }

  
  
  
  console.log('Creating Analytics Demo forms...');

  
  const feedbackForm = await prisma.form.create({
    data: {
      title: '[TEST] Analytics Demo - Customer Feedback',
      description: 'Form with sample responses for analytics testing',
      status: FormStatus.PUBLISHED,
      isQuiz: false,
      viewCount: 150,
      createdById: editor.id,
      fields: {
        create: [
          {
            id: 'fb_name',
            type: FieldType.TEXT,
            label: 'ชื่อ-นามสกุล',
            required: true,
            order: 0,
          },
          {
            id: 'fb_rating',
            type: FieldType.RATE,
            label: 'ความพึงพอใจโดยรวม',
            required: true,
            order: 1,
            options: { maxRating: 5 },
          },
          {
            id: 'fb_product',
            type: FieldType.DROPDOWN,
            label: 'สินค้าที่ซื้อ',
            required: true,
            order: 2,
            options: [
              { label: 'iPhone', value: 'iPhone' },
              { label: 'MacBook', value: 'MacBook' },
              { label: 'iPad', value: 'iPad' },
              { label: 'Apple Watch', value: 'Apple Watch' },
              { label: 'AirPods', value: 'AirPods' },
            ],
          },
          {
            id: 'fb_recommend',
            type: FieldType.RADIO,
            label: 'จะแนะนำให้เพื่อนไหม?',
            required: true,
            order: 3,
            options: [
              { label: 'แน่นอน', value: 'yes' },
              { label: 'อาจจะ', value: 'maybe' },
              { label: 'ไม่', value: 'no' },
            ],
          },
          {
            id: 'fb_channel',
            type: FieldType.CHECKBOX,
            label: 'ช่องทางที่รู้จักเรา',
            required: false,
            order: 4,
            options: [
              { label: 'Facebook', value: 'Facebook' },
              { label: 'Instagram', value: 'Instagram' },
              { label: 'TikTok', value: 'TikTok' },
              { label: 'เพื่อนแนะนำ', value: 'Friend' },
              { label: 'Google', value: 'Google' },
            ],
          },
          {
            id: 'fb_comment',
            type: FieldType.TEXTAREA,
            label: 'ข้อเสนอแนะเพิ่มเติม',
            required: false,
            order: 5,
          },
        ],
      },
    },
  });

  const feedbackResponses = [
    { name: 'สมชาย ใจดี', rating: '5', product: 'iPhone', recommend: 'yes', channel: 'Facebook,Instagram', comment: 'สินค้าดีมาก' },
    { name: 'สมหญิง รักษ์โลก', rating: '4', product: 'MacBook', recommend: 'yes', channel: 'Google', comment: 'ราคาแพงไปหน่อย' },
    { name: 'อนุชา พึ่งพา', rating: '5', product: 'iPhone', recommend: 'yes', channel: 'Friend', comment: '' },
    { name: 'มานี มีทอง', rating: '3', product: 'iPad', recommend: 'maybe', channel: 'TikTok', comment: 'ส่งช้า' },
    { name: 'ประยุทธ์ เก่งกล้า', rating: '4', product: 'AirPods', recommend: 'yes', channel: 'Instagram,TikTok', comment: 'เสียงดี' },
    { name: 'สุดา ใจงาม', rating: '5', product: 'MacBook', recommend: 'yes', channel: 'Facebook', comment: 'ใช้งานได้ดีมาก' },
    { name: 'วิชัย ทำดี', rating: '2', product: 'Apple Watch', recommend: 'no', channel: 'Google', comment: 'แบตเตอรี่หมดเร็ว' },
    { name: 'นิดา สวยงาม', rating: '4', product: 'iPhone', recommend: 'yes', channel: 'Friend,Facebook', comment: '' },
    { name: 'กมล ใจเย็น', rating: '5', product: 'MacBook', recommend: 'yes', channel: 'Instagram', comment: 'ยอดเยี่ยม' },
    { name: 'ศิริ พร้อมใจ', rating: '4', product: 'iPad', recommend: 'yes', channel: 'TikTok,Google', comment: '' },
    { name: 'บุญชู มั่งมี', rating: '5', product: 'iPhone', recommend: 'yes', channel: 'Facebook', comment: 'บริการดีมาก' },
    { name: 'ทวี รวย', rating: '3', product: 'AirPods', recommend: 'maybe', channel: 'Instagram', comment: '' },
    { name: 'อารี ใจกว้าง', rating: '4', product: 'MacBook', recommend: 'yes', channel: 'Friend', comment: 'แนะนำ' },
    { name: 'สมพงษ์ เข้มแข็ง', rating: '5', product: 'iPhone', recommend: 'yes', channel: 'Google,Facebook', comment: '' },
    { name: 'ชูศรี สุขใจ', rating: '4', product: 'Apple Watch', recommend: 'yes', channel: 'TikTok', comment: 'ดีไซน์สวย' },
    { name: 'วรรณา ดีใจ', rating: '5', product: 'iPhone', recommend: 'yes', channel: 'Instagram,Friend', comment: '' },
    { name: 'ประสิทธิ์ ทำได้', rating: '3', product: 'iPad', recommend: 'maybe', channel: 'Facebook', comment: '' },
    { name: 'สุพจน์ แกร่ง', rating: '4', product: 'MacBook', recommend: 'yes', channel: 'Google', comment: 'พอใช้ได้' },
    { name: 'มาลี หอมหวน', rating: '5', product: 'AirPods', recommend: 'yes', channel: 'TikTok,Instagram', comment: 'ชอบมาก' },
    { name: 'สุชาติ ใจบุญ', rating: '4', product: 'iPhone', recommend: 'yes', channel: 'Friend', comment: '' },
  ];

  for (let i = 0; i < feedbackResponses.length; i++) {
    const resp = feedbackResponses[i];
    const submittedAt = new Date(Date.now() - (feedbackResponses.length - i) * 24 * 60 * 60 * 1000);
    
    await prisma.formResponse.create({
      data: {
        formId: feedbackForm.id,
        submittedAt,
        answers: {
          create: [
            { fieldId: 'fb_name', value: resp.name },
            { fieldId: 'fb_rating', value: resp.rating },
            { fieldId: 'fb_product', value: resp.product },
            { fieldId: 'fb_recommend', value: resp.recommend },
            { fieldId: 'fb_channel', value: resp.channel },
            { fieldId: 'fb_comment', value: resp.comment },
          ],
        },
      },
    });
  }

  
  console.log('Seeding bundles...');
  const bundlesData = [
    {
      name: 'Contact Information',
      description: 'Capture lead details including Name, Email, and Phone.',
      options: { icon: 'User', color: 'text-blue-600', bg: 'bg-blue-50' },
      fields: [
        { type: FieldType.FULLNAME, label: 'Full Name', required: true, placeholder: 'John Doe', options: { subLabel: 'First and Last Name' } },
        { type: FieldType.EMAIL, label: 'Email Address', required: true, placeholder: 'name@example.com' },
        { type: FieldType.PHONE, label: 'Phone Number', placeholder: '(555) 000-0000' }
      ]
    },
    {
      name: 'Shipping Address',
      description: 'Complete address block with Street, City, State, and Zip.',
      options: { icon: 'MapPin', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      fields: [
        { type: FieldType.ADDRESS, label: 'Street Address', required: true, placeholder: '123 Main St' },
        { type: FieldType.TEXT, label: 'City', required: true, options: { width: '50%' }, placeholder: 'New York' },
        { type: FieldType.TEXT, label: 'State / Province', required: true, options: { width: '50%' }, placeholder: 'NY' },
        { type: FieldType.NUMBER, label: 'Zip / Postal Code', required: true, placeholder: '10001', options: { width: '50%' } },
        { type: FieldType.TEXT, label: 'Country', required: true, placeholder: 'United States', options: { width: '50%' } }
      ]
    },
    {
      name: 'Job Application',
      description: 'Essential fields for recruitment and hiring forms.',
      options: { icon: 'Briefcase', color: 'text-slate-600', bg: 'bg-slate-50' },
      fields: [
        { type: FieldType.FULLNAME, label: 'Applicant Name', required: true, placeholder: 'Jane Smith' },
        { type: FieldType.EMAIL, label: 'Email Address', required: true, placeholder: 'jane@example.com' },
        { type: FieldType.TEXT, label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/in/janesmith', options: { prefixIcon: 'link' } },
        { type: FieldType.TEXTAREA, label: 'Why do you want to join us?', required: true, placeholder: 'Tell us about your motivation...', options: { rows: 4 } }
      ]
    },
    {
      name: 'Event Booking',
      description: 'Registration details with date, time, and preferences.',
      options: { icon: 'CalendarCheck', color: 'text-rose-600', bg: 'bg-rose-50' },
      fields: [
        { type: FieldType.FULLNAME, label: 'Attendee Name', required: true },
        { type: FieldType.DATE, label: 'Preferred Date', required: true },
        { type: FieldType.DROPDOWN, label: 'Ticket Type', required: true, options: { items: ['General Admission', 'VIP Access', 'Student Pass'], placeholder: 'Select a ticket type' } },
        { type: FieldType.CHECKBOX, label: 'Dietary Requirements', options: { items: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Nut Allergy'] } }
      ]
    },
    {
      name: 'Product Survey',
      description: 'Gather insights on product usage and satisfaction.',
      options: { icon: 'MessageSquare', color: 'text-cyan-600', bg: 'bg-cyan-50' },
      fields: [
        { type: FieldType.DROPDOWN, label: 'Which product do you use?', required: true, options: { items: ['Basic Plan', 'Pro Plan', 'Enterprise Suite'], placeholder: 'Select product' } },
        { type: FieldType.RATE, label: 'Overall Satisfaction', required: true, options: { maxRating: 5 } },
        { type: FieldType.TEXTAREA, label: 'Share your experience', placeholder: 'What do you like most? What can we improve?', options: { rows: 3 } }
      ]
    },
    {
      name: 'Social Profile',
      description: 'Collect social media handles and preferences.',
      options: { icon: 'Share2', color: 'text-indigo-600', bg: 'bg-indigo-50' },
      fields: [
        { type: FieldType.CHECKBOX, label: 'Preferred Platforms', options: { items: ['Twitter / X', 'LinkedIn', 'Instagram', 'TikTok', 'YouTube'] } },
        { type: FieldType.TEXT, label: 'Main Handle/Username', required: true, placeholder: '@username', options: { prefix: '@' } },
        { type: FieldType.RADIO, label: 'Content Type', options: { items: ['Creator', 'Consumer', 'Business Account'] } }
      ]
    },
    {
      name: 'Education History',
      description: 'Academic background and qualifications.',
      options: { icon: 'GraduationCap', color: 'text-orange-600', bg: 'bg-orange-50' },
      fields: [
        { type: FieldType.TEXT, label: 'University / Institution', required: true, placeholder: 'Harvard University' },
        { type: FieldType.TEXT, label: 'Degree / Major', required: true, placeholder: 'Computer Science', options: { width: '70%' } },
        { type: FieldType.NUMBER, label: 'Grad Year', required: true, placeholder: '2024', options: { width: '30%' } }
      ]
    },
    {
      name: 'Customer Feedback',
      description: 'Rating and comments to gather user sentiment.',
      options: { icon: 'Star', color: 'text-amber-500', bg: 'bg-amber-50' },
      fields: [
        { type: FieldType.RATE, label: 'How would you rate us?', required: true },
        { type: FieldType.TEXTAREA, label: 'What can we improve?', placeholder: 'We value your feedback...' },
        { type: FieldType.RADIO, label: 'Would you recommend us?', options: { items: ['Yes, definitely', 'Maybe', 'No, not likely'] } }
      ]
    },
    {
      name: 'Account Cleanup',
      description: 'Standard fields for account management forms.',
      options: { icon: 'Lock', color: 'text-purple-600', bg: 'bg-purple-50' },
      fields: [
        { type: FieldType.EMAIL, label: 'Email Address', required: true, placeholder: 'user@example.com' },
        { type: FieldType.TEXT, label: 'Username', required: true, placeholder: 'username' }
      ]
    }
  ];

  for (const bundle of bundlesData) {
    const { fields, ...bundleData } = bundle;
    
    
    const existing = await prisma.bundle.findUnique({
      where: { name_version: { name: bundle.name, version: 1 } }
    });

    if (!existing) {
      await prisma.bundle.create({
        data: {
          ...bundleData,
          version: 1,
          createdById: superAdmin.id,
          isActive: true,
          fields: {
            create: fields.map((f, index) => ({
              ...f,
              order: index
            }))
          }
        }
      });
    } else {
        
        await prisma.bundle.update({
            where: { id: existing.id },
            data: { 
                options: bundleData.options,
                isActive: true
            }
        });
    }
  }

  console.log(`   Created Customer Feedback form with ${feedbackResponses.length} responses`);

  
  const itQuizForm = await prisma.form.create({
    data: {
      title: '[TEST] Analytics Demo - IT Knowledge Quiz',
      description: 'Quiz with sample responses for analytics testing',
      status: FormStatus.PUBLISHED,
      isQuiz: true,
      viewCount: 200,
      quizSettings: {
        showScore: true,
        showAnswer: true,
        showDetail: true,
      },
      createdById: editor.id,
      fields: {
        create: [
          {
            type: FieldType.RADIO,
            label: 'HTML ย่อมาจากอะไร?',
            required: true,
            order: 0,
            options: [
              { label: 'Hyper Text Markup Language', value: 'Hyper Text Markup Language' },
              { label: 'High Tech Modern Language', value: 'High Tech Modern Language' },
              { label: 'Home Tool Markup Language', value: 'Home Tool Markup Language' },
            ],
            correctAnswer: 'Hyper Text Markup Language',
            score: 25,
          },
          {
            type: FieldType.DROPDOWN,
            label: 'CSS ใช้สำหรับอะไร?',
            required: true,
            order: 1,
            options: [
              { label: 'Styling', value: 'styling' },
              { label: 'Database', value: 'database' },
              { label: 'Backend', value: 'backend' },
            ],
            correctAnswer: 'styling',
            score: 25,
          },
          {
            type: FieldType.CHECKBOX,
            label: 'JavaScript รันที่ไหน?',
            required: true,
            order: 2,
            options: [
              { label: 'Browser', value: 'browser' },
              { label: 'Server', value: 'server' },
              { label: 'Both', value: 'both' },
            ],
            correctAnswer: 'both',
            score: 25,
          },
          {
            type: FieldType.RADIO,
            label: 'React เป็นอะไร?',
            required: true,
            order: 3,
            options: [
              { label: 'Library', value: 'Library' },
              { label: 'Framework', value: 'Framework' },
              { label: 'Programming Language', value: 'Language' },
            ],
            correctAnswer: 'Library',
            score: 25,
          },
        ],
      },
    },
    include: {
      fields: true
    }
  });

  
  const q1 = itQuizForm.fields.find(f => f.label.includes('HTML'));
  const q2 = itQuizForm.fields.find(f => f.label.includes('CSS'));
  const q3 = itQuizForm.fields.find(f => f.label.includes('JavaScript'));
  const q4 = itQuizForm.fields.find(f => f.label.includes('React'));

  console.log('Quiz Fields Created:', { q1: q1?.id, q2: q2?.id, q3: q3?.id, q4: q4?.id });

  const itQuizResponses = [
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'both', q4: 'Library', score: 100 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'browser', q4: 'Library', score: 75 },
    { q1: 'High Tech Modern Language', q2: 'styling', q3: 'both', q4: 'Framework', score: 50 },
    { q1: 'Hyper Text Markup Language', q2: 'database', q3: 'both', q4: 'Library', score: 75 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'both', q4: 'Library', score: 100 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'server', q4: 'Framework', score: 50 },
    { q1: 'Home Tool Markup Language', q2: 'backend', q3: 'browser', q4: 'Language', score: 0 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'both', q4: 'Framework', score: 75 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'both', q4: 'Library', score: 100 },
    { q1: 'High Tech Modern Language', q2: 'database', q3: 'server', q4: 'Framework', score: 0 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'browser', q4: 'Library', score: 75 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'both', q4: 'Library', score: 100 },
    { q1: 'Hyper Text Markup Language', q2: 'backend', q3: 'both', q4: 'Library', score: 75 },
    { q1: 'High Tech Modern Language', q2: 'styling', q3: 'both', q4: 'Library', score: 75 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'both', q4: 'Framework', score: 75 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'both', q4: 'Library', score: 100 },
    { q1: 'Hyper Text Markup Language', q2: 'database', q3: 'browser', q4: 'Language', score: 25 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'both', q4: 'Library', score: 100 },
    { q1: 'High Tech Modern Language', q2: 'styling', q3: 'server', q4: 'Framework', score: 25 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'both', q4: 'Library', score: 100 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'browser', q4: 'Library', score: 75 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'both', q4: 'Framework', score: 75 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'both', q4: 'Library', score: 100 },
    { q1: 'Home Tool Markup Language', q2: 'styling', q3: 'both', q4: 'Library', score: 75 },
    { q1: 'Hyper Text Markup Language', q2: 'styling', q3: 'both', q4: 'Library', score: 100 },
  ];

  if (q1 && q2 && q3 && q4) {
      for (let i = 0; i < itQuizResponses.length; i++) {
        const resp = itQuizResponses[i];
        const submittedAt = new Date(Date.now() - (itQuizResponses.length - i) * 12 * 60 * 60 * 1000);
        
        try {
            const response = await prisma.formResponse.create({
              data: {
                formId: itQuizForm.id,
                submittedAt,
                score: resp.score,
                totalScore: 100,
              },
            });

            
            const answersData = [
                { fieldId: q1.id, value: resp.q1, isCorrect: resp.q1 === 'Hyper Text Markup Language' },
                { fieldId: q2.id, value: resp.q2, isCorrect: resp.q2 === 'styling' },
                { fieldId: q3.id, value: resp.q3, isCorrect: resp.q3 === 'both' },
                { fieldId: q4.id, value: resp.q4, isCorrect: resp.q4 === 'Library' },
            ];
            
            let successCount = 0;
            const createdAnswerIds: string[] = [];
            
            for (const answerData of answersData) {
                try {
                    const createdAnswer = await prisma.responseAnswer.create({
                        data: {
                            responseId: response.id,
                            ...answerData
                        }
                    });
                    createdAnswerIds.push(createdAnswer.id);
                    successCount++;
                } catch (ansError: any) {
                    console.error(`      ❌ Failed to create answer for field ${answerData.fieldId}:`, ansError.message);
                }
            }

            
            const savedAnswers = await prisma.responseAnswer.findMany({
                where: { responseId: response.id }
            });

            if (savedAnswers.length !== successCount) {
                console.error(`      ⚠️  WARNING: Created ${successCount} but only ${savedAnswers.length} saved!`);
            }

            console.log(`   ✅ Response ${i+1}/${itQuizResponses.length} created with ${savedAnswers.length}/${answersData.length} answers (verified)`);
        } catch (error: any) {
            console.error(`   ❌ Failed to create response ${i+1}:`, error.message);
        }
      }
      console.log(`   Finished creating IT Quiz with ${itQuizResponses.length} responses`);
  } else {
      console.error('FAILED TO CREATE QUIZ FIELDS - SEEDING STOPPED');
      console.error('Field IDs:', { q1: q1?.id, q2: q2?.id, q3: q3?.id, q4: q4?.id });
  }
  console.log(`   Created IT Quiz form with ${itQuizResponses.length} responses`);


  await prisma.form.create({
    data: {
      title: '[TEST] Logic System - Conditional Display',
      description: 'ทดสอบระบบ Logic: Show/Hide fields, Jump to page, Require/Unrequire',
      status: FormStatus.PUBLISHED,
      isQuiz: false,
      createdById: editor.id,
      fields: {
        create: [
          {
            id: 'field_logic_1',
            type: FieldType.RADIO,
            label: 'คุณมีประสบการณ์ทำงานหรือไม่?',
            required: true,
            order: 0,
            options: [
              { label: 'มี', value: 'yes' },
              { label: 'ไม่มี', value: 'no' },
            ],
          },
          {
            id: 'field_logic_2',
            type: FieldType.NUMBER,
            label: 'ประสบการณ์กี่ปี? (แสดงเมื่อเลือก "มี")',
            required: false,
            order: 1,
          },
          {
            id: 'field_logic_3',
            type: FieldType.TEXT,
            label: 'บริษัทล่าสุด (แสดงเมื่อเลือก "มี")',
            required: false,
            order: 2,
          },
          {
            id: 'field_logic_4',
            type: FieldType.DROPDOWN,
            label: 'คุณสนใจตำแหน่งไหน?',
            required: true,
            order: 3,
            options: [
              { label: 'Developer', value: 'dev' },
              { label: 'Designer', value: 'design' },
              { label: 'Marketing', value: 'marketing' },
            ],
          },
          {
            id: 'field_logic_5',
            type: FieldType.TEXT,
            label: 'ภาษาโปรแกรมมิ่งที่ถนัด (แสดงเมื่อเลือก Developer)',
            required: false,
            order: 4,
          },
        ],
      },
      logicRules: {
        create: [
          {
            id: 'logic_rule_1',
            name: 'แสดงฟิลด์ประสบการณ์เมื่อมีประสบการณ์',
            logicType: 'ALL',
            conditions: {
              create: [
                {
                  id: 'logic_cond_1',
                  fieldId: 'field_logic_1',
                  operator: 'equals',
                  value: 'yes',
                },
              ],
            },
            actions: {
              create: [
                {
                  id: 'logic_action_1',
                  type: 'SHOW',
                  fieldId: 'field_logic_2',
                },
                {
                  id: 'logic_action_2',
                  type: 'SHOW',
                  fieldId: 'field_logic_3',
                },
              ],
            },
          },
          {
            id: 'logic_rule_2',
            name: 'แสดงฟิลด์ภาษาโปรแกรมมิ่งเมื่อเลือก Developer',
            logicType: 'ALL',
            conditions: {
              create: [
                {
                  id: 'logic_cond_2',
                  fieldId: 'field_logic_4',
                  operator: 'equals',
                  value: 'dev',
                },
              ],
            },
            actions: {
              create: [
                {
                  id: 'logic_action_3',
                  type: 'SHOW',
                  fieldId: 'field_logic_5',
                },
              ],
            },
          },
        ],
      },
    },
  });

  
  await prisma.form.create({
    data: {
      title: '[TEST] Multi-Page Form - Comprehensive',
      description: 'ทดสอบระบบหลายหน้า: PAGE_BREAK, Welcome Screen, Thank You Screen',
      status: FormStatus.PUBLISHED,
      isQuiz: false,
      welcomeSettings: {
        enabled: true,
        title: 'ยินดีต้อนรับสู่แบบสอบถาม',
        description: 'กรุณากรอกข้อมูลให้ครบถ้วน ใช้เวลาประมาณ 5 นาที',
        buttonText: 'เริ่มกรอกข้อมูล',
      },
      thankYouSettings: {
        enabled: true,
        title: 'ขอบคุณสำหรับข้อมูล!',
        description: 'เราได้รับข้อมูลของคุณเรียบร้อยแล้ว จะติดต่อกลับภายใน 3 วันทำการ',
        showSubmitAnother: true,
      },
      createdById: editor.id,
      fields: {
        create: [
          {
            type: FieldType.HEADER,
            label: 'ข้อมูลส่วนตัว',
            required: false,
            order: 0,
          },
          {
            type: FieldType.FULLNAME,
            label: 'ชื่อ-นามสกุล',
            required: true,
            order: 1,
          },
          {
            type: FieldType.EMAIL,
            label: 'อีเมล',
            required: true,
            order: 2,
          },
          {
            type: FieldType.PHONE,
            label: 'เบอร์โทรศัพท์',
            required: true,
            order: 3,
          },
          {
            type: FieldType.PAGE_BREAK,
            label: 'Page Break 1',
            required: false,
            order: 4,
          },
          {
            type: FieldType.HEADER,
            label: 'ที่อยู่',
            required: false,
            order: 5,
          },
          {
            type: FieldType.ADDRESS,
            label: 'ที่อยู่สำหรับจัดส่ง',
            required: true,
            order: 6,
          },
          {
            type: FieldType.DROPDOWN,
            label: 'จังหวัด',
            required: true,
            order: 7,
            options: [
              { label: 'กรุงเทพมหานคร', value: 'กรุงเทพมหานคร' },
              { label: 'เชียงใหม่', value: 'เชียงใหม่' },
              { label: 'ภูเก็ต', value: 'ภูเก็ต' },
            ],
          },
          {
            type: FieldType.PAGE_BREAK,
            label: 'Page Break 2',
            required: false,
            order: 8,
          },
          {
            type: FieldType.HEADER,
            label: 'ความสนใจ',
            required: false,
            order: 9,
          },
          {
            type: FieldType.CHECKBOX,
            label: 'คุณสนใจอะไรบ้าง?',
            required: false,
            order: 10,
            options: [
              { label: 'เทคโนโลยี', value: 'tech' },
              { label: 'กีฬา', value: 'sport' },
              { label: 'ดนตรี', value: 'music' },
              { label: 'การเดินทาง', value: 'travel' },
            ],
          },
          {
            type: FieldType.TEXTAREA,
            label: 'ข้อเสนอแนะเพิ่มเติม',
            required: false,
            order: 11,
          },
        ],
      },
    },
  });

  
  await prisma.form.create({
    data: {
      title: '[TEST] All Field Types Showcase',
      description: 'ทดสอบ Field Types ทั้งหมด: Text, Number, Date, Rating, ฯลฯ',
      status: FormStatus.PUBLISHED,
      isQuiz: false,
      createdById: editor.id,
      fields: {
        create: [
          {
            type: FieldType.HEADER,
            label: 'Text Fields',
            required: false,
            order: 0,
          },
          {
            type: FieldType.TEXT,
            label: 'Short Text',
            placeholder: 'กรอกข้อความสั้นๆ',
            required: true,
            order: 1,
          },
          {
            type: FieldType.TEXTAREA,
            label: 'Long Text',
            placeholder: 'กรอกข้อความยาวๆ',
            required: false,
            order: 2,
          },
          {
            type: FieldType.EMAIL,
            label: 'Email',
            placeholder: 'example@email.com',
            required: true,
            order: 3,
          },
          {
            type: FieldType.PHONE,
            label: 'Phone',
            placeholder: '0812345678',
            required: false,
            order: 4,
          },
          {
            type: FieldType.DIVIDER,
            label: 'Divider',
            required: false,
            order: 5,
          },
          {
            type: FieldType.HEADER,
            label: 'Number & Date Fields',
            required: false,
            order: 6,
          },
          {
            type: FieldType.NUMBER,
            label: 'Number',
            placeholder: 'กรอกตัวเลข',
            required: false,
            order: 7,
          },
          {
            type: FieldType.DATE,
            label: 'Date',
            required: false,
            order: 8,
          },
          {
            type: FieldType.TIME,
            label: 'Time',
            required: false,
            order: 9,
          },
          {
            type: FieldType.DIVIDER,
            label: 'Divider',
            required: false,
            order: 10,
          },
          {
            type: FieldType.HEADER,
            label: 'Choice Fields',
            required: false,
            order: 11,
          },
          {
            type: FieldType.RADIO,
            label: 'Single Choice',
            required: false,
            order: 12,
            options: [
              { label: 'Option 1', value: 'opt1' },
              { label: 'Option 2', value: 'opt2' },
              { label: 'Option 3', value: 'opt3' },
            ],
          },
          {
            type: FieldType.CHECKBOX,
            label: 'Multiple Choice',
            required: false,
            order: 13,
            options: [
              { label: 'Choice A', value: 'a' },
              { label: 'Choice B', value: 'b' },
              { label: 'Choice C', value: 'c' },
            ],
          },
          {
            type: FieldType.DROPDOWN,
            label: 'Dropdown',
            required: false,
            order: 14,
            options: [
              { label: 'Select 1', value: 's1' },
              { label: 'Select 2', value: 's2' },
              { label: 'Select 3', value: 's3' },
            ],
          },
          {
            type: FieldType.DIVIDER,
            label: 'Divider',
            required: false,
            order: 15,
          },
          {
            type: FieldType.HEADER,
            label: 'Special Fields',
            required: false,
            order: 16,
          },
          {
            type: FieldType.RATE,
            label: 'Rating',
            required: false,
            order: 17,
            options: { maxRating: 5, icon: 'star' },
          },
          {
            type: FieldType.FULLNAME,
            label: 'Full Name',
            required: false,
            order: 18,
          },
          {
            type: FieldType.ADDRESS,
            label: 'Address',
            required: false,
            order: 19,
          },
        ],
      },
    },
  });

  
  await prisma.form.create({
    data: {
      title: '[TEST] Field Groups - Nested Fields',
      description: 'ทดสอบระบบ Field Groups: การจัดกลุ่มฟิลด์',
      status: FormStatus.PUBLISHED,
      isQuiz: false,
      createdById: editor.id,
      fields: {
        create: [
          {
            id: 'group_1',
            type: FieldType.GROUP,
            label: 'กลุ่มข้อมูลส่วนตัว',
            required: false,
            order: 0,
          },
          {
            type: FieldType.TEXT,
            label: 'ชื่อ',
            required: true,
            order: 1,
            groupId: 'group_1',
          },
          {
            type: FieldType.TEXT,
            label: 'นามสกุล',
            required: true,
            order: 2,
            groupId: 'group_1',
          },
          {
            id: 'group_2',
            type: FieldType.GROUP,
            label: 'กลุ่มข้อมูลติดต่อ',
            required: false,
            order: 3,
          },
          {
            type: FieldType.EMAIL,
            label: 'อีเมล',
            required: true,
            order: 4,
            groupId: 'group_2',
          },
          {
            type: FieldType.PHONE,
            label: 'เบอร์โทร',
            required: true,
            order: 5,
            groupId: 'group_2',
          },
        ],
      },
    },
  });

  console.log('Test forms created successfully!');
  console.log('');
  console.log('Created forms for editor@example.com:');
  console.log('   1. Quiz System Test');
  console.log('   2. Logic System Test');
  console.log('   3. Multi-Page Form Test');
  console.log('   4. All Field Types Showcase');
  console.log('   5. Field Groups Test');
  console.log('');
  console.log('Creating e-Timestamp Survey Form...');
  await prisma.form.create({
    data: {
      title: 'แบบสอบถาม เรื่อง ความพึงพอใจของลูกค้าต่อบริการ e-Timestamp (Demo)',
      description: 'แบบสอบถามฉบับนี้ แบ่งออกเป็น ๓ ส่วน ดังนี้\nส่วนที่ ๑ ข้อมูลทั่วไป\nส่วนที่ ๒ ความพึงพอใจต่อการใช้บริการ e Timestamp\nส่วนที่ ๓ ข้อเสนอแนะ/ความคิดเห็น',
      status: FormStatus.PUBLISHED,
      isQuiz: false,
      createdById: editor.id,
      fields: {
        create: [
          
          {
            type: FieldType.HEADER,
            label: 'ส่วนที่ ๑ ข้อมูลทั่วไป',
            required: false,
            order: 0,
          },
          {
            type: FieldType.PARAGRAPH,
            label: 'กรุณาทำเครื่องหมาย ✓ ลงใน ❑ หน้าคำตอบที่ตรงกับความเป็นจริง',
            required: false,
            order: 1,
          },
          
          {
            type: FieldType.RADIO,
            label: '๑. เพศ',
            required: true,
            order: 2,
            options: [
              { label: 'ชาย', value: 'male' },
              { label: 'หญิง', value: 'female' },
            ],
          },
          
          {
            type: FieldType.RADIO,
            label: '๒. อายุ',
            required: true,
            order: 3,
            options: [
              { label: 'ต่ำกว่า ๒๐ ปี', value: '<20' },
              { label: '๒๐ - ๓๐ ปี', value: '20-30' },
              { label: '๓๑ - ๔๐ ปี', value: '31-40' },
              { label: '๔๑ - ๕๐ ปี', value: '41-50' },
              { label: '๕๐ ปีขึ้นไป', value: '>50' },
            ],
          },
          
          {
            type: FieldType.RADIO,
            label: '๓. การศึกษา',
            required: true,
            order: 4,
            options: [
              { label: 'ต่ำกว่าปริญญาตรี', value: 'below_bachelor' },
              { label: 'ปริญญาตรี', value: 'bachelor' },
              { label: 'ปริญญาโท', value: 'master' },
              { label: 'ปริญญาเอก', value: 'doctorate' },
            ],
          },
          
          {
            type: FieldType.RADIO,
            label: '๔. ลูกค้า',
            required: true,
            order: 5,
            options: [
              { label: 'บุคคลทั่วไป', value: 'general' },
              { label: 'บริษัท/เอกชน', value: 'private_sector' },
              { label: 'หน่วยงานรัฐ', value: 'government' },
            ],
          },
          
          {
            type: FieldType.CHECKBOX,
            label: '๕. ประเภทเอกสารที่เข้ามารับบริการ (เลือกตอบได้มากกว่า ๑ ประเภท)',
            required: true,
            order: 6,
            options: [
              { label: 'ใบเสร็จรับเงิน/ใบกำกับภาษี', value: 'receipt' },
              { label: 'สัญญา', value: 'contract' },
              { label: 'ใบแจ้งผลการเรียน', value: 'grade_report' },
              { label: 'ใบอนุญาต/ใบรับรอง', value: 'certificate' },
              { label: 'อื่น ๆ', value: 'others' },
            ],
          },
          
          
          {
            type: FieldType.HEADER,
            label: 'ส่วนที่ ๒ ความพึงพอใจต่อการใช้บริการ e-Timestamp',
            required: false,
            order: 7,
          },
          {
            type: FieldType.PARAGRAPH,
            label: 'กรุณาทำเครื่องหมาย ✓ ลงในช่องที่ตรงกับความรู้สึกและความคิดเห็นของท่านมากที่สุด',
            required: false,
            order: 8,
          },
          
          
          {
            type: FieldType.MATRIX,
            label: '๒.๑ ความพึงพอใจต่อเจ้าหน้าที่หรือบุคลากรที่ให้บริการ e-Timestamp',
            required: true,
            order: 9,
            options: {
              inputType: 'radio',
              columns: [
                 { id: 'c5', label: 'ดีเยี่ยม (๕)' },
                 { id: 'c4', label: 'ดีมาก (๔)' },
                 { id: 'c3', label: 'ดี (๓)' },
                 { id: 'c2', label: 'พอใช้ (๒)' },
                 { id: 'c1', label: 'ควรปรับปรุง (๑)' },
              ],
              rows: [
                 { id: 'r1', label: '๑. ความพร้อมและการเต็มใจในการให้บริการอย่างสุภาพ' },
                 { id: 'r2', label: '๒. เจ้าหน้าที่ที่มีความรู้ ความสามารถ และตอบข้อสงสัยได้อย่างชัดเจน' },
                 { id: 'r3', label: '๓. มีความสามารถในการแก้ปัญหาที่เกิดขึ้นระหว่างให้บริการได้' },
              ]
            }
          },

          
          {
            type: FieldType.MATRIX,
            label: '๒.๒ ความพึงพอใจต่อกระบวนการ/ขั้นตอนการให้บริการ e-Timestamp',
            required: true,
            order: 10,
            options: {
              inputType: 'radio',
               columns: [
                 { id: 'c5', label: 'ดีเยี่ยม (๕)' },
                 { id: 'c4', label: 'ดีมาก (๔)' },
                 { id: 'c3', label: 'ดี (๓)' },
                 { id: 'c2', label: 'พอใช้ (๒)' },
                 { id: 'c1', label: 'ควรปรับปรุง (๑)' },
              ],
              rows: [
                 { id: 'r1', label: '๑. บริการอย่างเป็นระบบและเป็นขั้นตอน' },
                 { id: 'r2', label: '๒. ขั้นตอนการให้บริการไม่ซับซ้อน เข้าใจง่าย' },
                 { id: 'r3', label: '๓. ระยะเวลาการให้บริการมีความเหมาะสมกับสภาพการใช้งาน' },
              ]
            }
          },

           
          {
            type: FieldType.MATRIX,
            label: '๒.๓ ความพึงพอใจต่อสิ่งอำนวยความสะดวกบริการ e-Timestamp',
            required: true,
            order: 11,
            options: {
              inputType: 'radio',
               columns: [
                 { id: 'c5', label: 'ดีเยี่ยม (๕)' },
                 { id: 'c4', label: 'ดีมาก (๔)' },
                 { id: 'c3', label: 'ดี (๓)' },
                 { id: 'c2', label: 'พอใช้ (๒)' },
                 { id: 'c1', label: 'ควรปรับปรุง (๑)' },
              ],
              rows: [
                 { id: 'r1', label: '๑. บริการโทรศัพท์สายตรง (Hotline Service Center) สำหรับให้คำปรึกษา' },
                 { id: 'r2', label: '๒. มีระบบแจ้งเตือนปัญหาการใช้งานผ่าน ระบบจดหมายอิเล็กทรอนิกส์ (e Mail)' },
              ]
            }
          },

           
           {
            type: FieldType.MATRIX,
            label: '๒.๔ ความพึงพอใจด้านคุณภาพให้บริการ e-Timestamp',
            required: true,
            order: 12,
            options: {
              inputType: 'radio',
               columns: [
                 { id: 'c5', label: 'ดีเยี่ยม (๕)' },
                 { id: 'c4', label: 'ดีมาก (๔)' },
                 { id: 'c3', label: 'ดี (๓)' },
                 { id: 'c2', label: 'พอใช้ (๒)' },
                 { id: 'c1', label: 'ควรปรับปรุง (๑)' },
              ],
              rows: [
                 { id: 'r1', label: '๑. ได้รับบริการที่ตรงกับความต้องการ (ความถูกต้อง ครบถ้วน ไม่ผิดพลาด)' },
                 { id: 'r2', label: '๒. ได้รับบริการที่เป็นประโยชน์ เชื่อถือได้' },
                 { id: 'r3', label: '๓. การซ่อมแซมแก้ไขให้กลับมาใช้งานได้ตามปกติ ภายในระยะเวลาที่กำหนด' },
                 { id: 'r4', label: '๔. การตรวจสอบการใช้งานและคำนวณค่าบริการ' },
                 { id: 'r5', label: '๕. ความเหมาะสมด้านราคา' },
                 { id: 'r6', label: '๖. ช่องทางการใช้งานบริการ e-Timestamp' },
              ]
            }
          },

          
          {
             type: FieldType.HEADER,
             label: 'ส่วนที่ ๓ ข้อเสนอแนะ/ความคิดเห็น',
             required: false,
             order: 13,
          },
          {
             type: FieldType.TEXTAREA,
             label: '',
             required: false,
             placeholder: 'ระบุข้อเสนอแนะของท่าน...',
             order: 14,
          }
        ],
      },
    },
  });

  console.log('Creating Corrections Dept Survey Form...');
  await prisma.form.create({
    data: {
      title: 'แบบสอบถามข้อมูลสำหรับการปฏิบัติงานและตั้งค่าเริ่มต้นของระบบจดหมายราชทัณฑ์ (Demo)',
      description: 'แบบสอบถามเพื่อรวบรวมข้อมูลสำหรับตั้งค่าระบบ:\n1. ข้อมูลการปฏิบัติงาน\n2. ข้อมูลผู้ต้องขัง\n3. ข้อมูลบุคคลภายนอก',
      status: FormStatus.PUBLISHED,
      isQuiz: false,
      createdById: editor.id,
      fields: {
        create: [
          
          {
            type: FieldType.HEADER,
            label: 'ส่วนที่ ๑ ข้อมูลสำหรับการปฏิบัติงาน',
            required: false,
            order: 0,
          },
          
          {
            type: FieldType.CHECKBOX,
            label: '๑.๑ สถานที่',
            required: true,
            order: 1,
            options: [
              { label: 'เรือนจำกลางบางขวาง', value: 'BangKwang' },
              { label: 'เรือนจำจังหวัดนนทบุรี', value: 'Nonthaburi' },
              { label: 'ทัณฑสถานหญิงธนบุรี', value: 'ThonburiWomen' },
              { label: 'เรือนจำพิเศษพัทยา', value: 'Pattaya' },
              { label: 'เรือนจำกลางสมุทรปราการ', value: 'SamutPrakan' },
            ],
          },
          
          {
            type: FieldType.RADIO,
            label: '๑.๒ รูปแบบของการปฏิบัติงาน รับและนำส่งจดหมาย',
            required: true,
            order: 2,
            options: [
              { label: 'แบบที่ 1: เจ้าหน้าที่ปรษณีย์ปฏิบัติงานภายในพื้นที่ ตามเวลาที่กำหนด', value: 'Type1' },
              { label: 'แบบที่ 2: เจ้าหน้าที่ปรษณีย์เข้ามารับ-ส่งจดหมายตามรอบเวลา (ไม่มีพื้นที่ปฏิบัติงานประจำ)', value: 'Type2' },
            ],
          },
          
          {
            type: FieldType.CHECKBOX,
            label: '๑.๓ จุดติดตั้งและจำนวนตู้บริการตนเอง (Kiosk)',
            required: true,
            order: 3,
            options: [
              { label: 'ติดตั้งในบริเวณที่เจ้าหน้าที่ใช้บริการ "เท่านั้น"', value: 'StaffOnly' },
              { label: 'ติดตั้งในบริเวณที่ผู้ต้องขังเข้าใช้บริการได้', value: 'InmateAccess' },
            ],
          },
          
          {
            type: FieldType.DATE,
            label: '๑.๔ วันที่เป้าหมายในการเริ่มเปิดให้บริการ',
            required: true,
            order: 4,
          },
          
          {
            type: FieldType.HEADER,
            label: '๑.๕ เจ้าหน้าที่ผู้ประสานงาน (คนที่ 1)',
            required: false,
            order: 5,
          },
          {
            type: FieldType.FULLNAME,
            label: 'ชื่อ-สกุล',
            required: true,
            order: 6,
          },
          {
            type: FieldType.TEXT,
            label: 'ตำแหน่ง',
            required: false,
            order: 7,
          },
          {
            type: FieldType.PHONE,
            label: 'โทรศัพท์',
            required: true,
            order: 8,
          },
          
          {
            type: FieldType.HEADER,
            label: 'เจ้าหน้าที่ผู้ประสานงาน (คนที่ 2)',
            required: false,
            order: 9,
          },
          {
            type: FieldType.FULLNAME,
            label: 'ชื่อ-สกุล',
            required: false,
            order: 10,
          },
          {
            type: FieldType.TEXT,
            label: 'ตำแหน่ง',
            required: false,
            order: 11,
          },
          {
            type: FieldType.PHONE,
            label: 'โทรศัพท์',
            required: false,
            order: 12,
          },
          
          
          {
            type: FieldType.PAGE_BREAK,
            label: 'ส่วนที่ 2 - ข้อมูลผู้ต้องขัง',
            order: 13,
          },
          {
            type: FieldType.HEADER,
            label: 'ส่วนที่ ๒ ข้อมูลผู้ต้องขัง',
            required: false,
            order: 14,
          },
          {
            type: FieldType.PARAGRAPH,
            label: '(หมายเหตุ: ท่านสามารถแนบไฟล์ Excel รายชื่อผู้ต้องขังได้ หากมีจำนวนมาก)',
            required: false,
            order: 15,
          },
          
          
          
          {
             type: FieldType.TEXT,
             label: 'ผู้ต้องขังคนที่ 1: เลขหมายเลข',
             required: false,
             order: 16,
          },
          {
             type: FieldType.TEXT,
             label: 'ผู้ต้องขังคนที่ 1: แดน/เขต',
             required: false,
             order: 17,
          },
          {
             type: FieldType.FULLNAME,
             label: 'ผู้ต้องขังคนที่ 1: ชื่อ-สกุล',
             required: false,
             order: 18,
          },
          
          {
             type: FieldType.TEXT,
             label: 'ผู้ต้องขังคนที่ 2: เลขหมายเลข',
             required: false,
             order: 19,
          },
          {
             type: FieldType.TEXT,
             label: 'ผู้ต้องขังคนที่ 2: แดน/เขต',
             required: false,
             order: 20,
          },
          {
             type: FieldType.FULLNAME,
             label: 'ผู้ต้องขังคนที่ 2: ชื่อ-สกุล',
             required: false,
             order: 21,
          },

           
           {
            type: FieldType.PAGE_BREAK,
            label: 'ส่วนที่ 3 - ข้อมูลบุคคลภายนอก',
            order: 22,
          },
          {
            type: FieldType.HEADER,
            label: 'ส่วนที่ ๓ ข้อมูลบุคคลภายนอก',
            required: false,
            order: 23,
          },
          {
             type: FieldType.FULLNAME,
             label: 'บุคคลภายนอกคนที่ 1: ชื่อ-สกุล',
             required: false,
             order: 24,
          },
          {
             type: FieldType.PHONE,
             label: 'เบอร์โทรศัพท์',
             required: false,
             order: 25,
          },
          {
             type: FieldType.TEXT,
             label: 'ชื่อ-สกุล ผู้ต้องขังที่เกี่ยวข้อง',
             required: false,
             order: 26,
          },
           {
             type: FieldType.FULLNAME,
             label: 'บุคคลภายนอกคนที่ 2: ชื่อ-สกุล',
             required: false,
             order: 27,
          },
          {
             type: FieldType.PHONE,
             label: 'เบอร์โทรศัพท์',
             required: false,
             order: 28,
          },
          {
             type: FieldType.TEXT,
             label: 'ชื่อ-สกุล ผู้ต้องขังที่เกี่ยวข้อง',
             required: false,
             order: 29,
          },
        ],
      },
    },
  });

  
  
  
  console.log('Creating collaboration demo form with 10 collaborators...');

  const collaborationForm = await prisma.form.create({
    data: {
      title: '[TEST] Collaboration Demo - 10 Editors',
      description: 'ฟอร์มตัวอย่างที่มี 10 คนแก้ไขร่วมกัน',
      status: FormStatus.PUBLISHED,
      isQuiz: false,
      createdById: editor.id,
      collaborators: {
        connect: [
          { id: editor1.id },
          { id: editor2.id },
          { id: editor3.id },
          { id: editor4.id },
          { id: editor5.id },
          { id: editor6.id },
          { id: editor7.id },
          { id: editor8.id },
          { id: editor9.id },
          { id: editor10.id },
        ],
      },
      fields: {
        create: [
          {
            type: FieldType.HEADER,
            label: 'ทีมงาน 10 คน',
            required: false,
            order: 0,
          },
          {
            type: FieldType.PARAGRAPH,
            label: 'ฟอร์มนี้แก้ไขโดยทีมงาน 10 คน: Alice, Bob, Charlie, Diana, Edward, Fiona, George, Helen, Ivan, และ Julia',
            required: false,
            order: 1,
          },
          {
            type: FieldType.TEXT,
            label: 'ชื่อ',
            required: true,
            order: 2,
          },
          {
            type: FieldType.EMAIL,
            label: 'อีเมล',
            required: true,
            order: 3,
          },
          {
            type: FieldType.TEXTAREA,
            label: 'ข้อเสนอแนะ',
            required: false,
            order: 4,
          },
        ],
      },
    },
  });

  console.log(`   ✅ Created collaboration form with 10 collaborators`);

  console.log('Seeding completed!');
  console.log('Login credentials:');
  console.log('   SuperAdmin: super@app.com / password123');
  console.log('   Admin: admin@app.com / password123');
  console.log('   Editor: editor@app.com / password123');
  console.log('   Editor1-10: ed1@app.com - ed10@app.com / password123');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
