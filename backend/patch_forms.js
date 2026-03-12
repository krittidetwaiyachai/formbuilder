const fs = require('fs');
let s = fs.readFileSync('src/forms/forms.service.ts', 'utf8');
s = s.replace(/\r\n/g, '\n');

const oldCheck = '    if (\n      userRole !== RoleType.VIEWER &&\n      !isCreator &&\n      !isCollaborator\n    ) {\n      throw new ForbiddenException(\'You can only access your own forms or forms shared with you\');\n    }';
const newCheck = '    if (\n      userRole !== RoleType.SUPER_ADMIN &&\n      !isCreator &&\n      !isCollaborator\n    ) {\n      throw new ForbiddenException(\'You can only access your own forms or forms shared with you\');\n    }';

s = s.split(oldCheck).join(newCheck);
fs.writeFileSync('src/forms/forms.service.ts', s);
console.log('Finished forms patch');
