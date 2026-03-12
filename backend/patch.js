const fs = require('fs');
let s = fs.readFileSync('src/responses/responses.service.ts', 'utf8');

// Normalize newlines to \n to make replacing easier
s = s.replace(/\r\n/g, '\n');

// 1. findAll form fetch
s = s.replace(
  `const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });`,
  `const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { collaborators: { select: { id: true } } },
    });`
);

// 2. findOne form include
s = s.replace(
  `        form: true,
        answers: {`,
  `        form: {
          include: { collaborators: { select: { id: true } } },
        },
        answers: {`
);

// 3. export csv form fetch
s = s.replace(
  `        include: { fields: { orderBy: { order: 'asc' } } },
      });`,
  `        include: { 
          fields: { orderBy: { order: 'asc' } },
          collaborators: { select: { id: true } }
        },
      });`
);

// 4. Access check block
const checkStr = `    if (userRole === RoleType.VIEWER && form.status !== FormStatus.PUBLISHED) {`;
const replacementCheckStr = `    if (userRole !== RoleType.SUPER_ADMIN && form.createdById !== userId && !form.collaborators.some(c => c.id === userId)) {
      throw new ForbiddenException('You do not have permission to access responses for this form');
    }

    if (userRole === RoleType.VIEWER && form.status !== FormStatus.PUBLISHED) {`;

s = s.split(checkStr).join(replacementCheckStr);

fs.writeFileSync('src/responses/responses.service.ts', s);
console.log("Replaced successfully");
