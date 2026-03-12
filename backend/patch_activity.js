const fs = require('fs');
let s = fs.readFileSync('src/activity-log/activity-log.service.ts', 'utf8');

// Normalize newlines
s = s.replace(/\r\n/g, '\n');

// 1. getFormActivity fetch
s = s.replace(
  `  async getFormActivity(
    formId: string,
    page: number = 1,
    limit: number = 20,
    sort: 'asc' | 'desc' = 'desc',
    action?: string,
    userId?: string,
  ) {`,
  `  async getFormActivity(
    formId: string,
    page: number = 1,
    limit: number = 20,
    sort: 'asc' | 'desc' = 'desc',
    action?: string,
    userId?: string,
    requestingUserId?: string,
    requestingUserRole?: import('@prisma/client').RoleType
  ) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { collaborators: { select: { id: true } } }
    });
    
    if (!form) throw new import('@nestjs/common').NotFoundException('Form not found');
    
    if (requestingUserRole && requestingUserRole !== 'SUPER_ADMIN' && form.createdById !== requestingUserId && !form.collaborators.some(c => c.id === requestingUserId)) {
      throw new import('@nestjs/common').ForbiddenException('You do not have permission to view activity for this form');
    }
`
);

fs.writeFileSync('src/activity-log/activity-log.service.ts', s);
console.log('activity-log.service.ts patched');
