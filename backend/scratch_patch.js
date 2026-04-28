const fs = require('fs');

// Patch Controller
let cnt = fs.readFileSync('./src/admin/admin.controller.ts', 'utf-8');
if(!cnt.includes('CurrentUser')) {
  cnt = cnt.replace("import { Roles } from '../auth/decorators/roles.decorator';", "import { Roles } from '../auth/decorators/roles.decorator';\nimport { CurrentUser } from '../auth/decorators/current-user.decorator';");
}

const methodsToPatch = [
  { name: 'createLocalUser', s1: '(@Body() dto: AdminCreateLocalUserDto)', s2: '(dto)' },
  { name: 'deleteForm', s1: "(@Param('id') id: string)", s2: '(id)' },
  { name: 'toggleBan', s1: "(@Param('id')id: string)", s2: '(id)' },
  { name: 'updateRole', s1: "(@Param('id')id: string, @Body('roleId')roleId: string)", s2: '(id, roleId)' },
  { name: 'updateSystemEmailSettings', s1: '(@Body()dto: AdminUpdateSystemEmailSettingsDto)', s2: '(dto)' },
  { name: 'updateSystemInviteSettings', s1: '(@Body()dto: AdminUpdateSystemInviteSettingsDto)', s2: '(dto)' },
  { name: 'updateSystemContactSettings', s1: '(@Body()dto: AdminUpdateSystemContactSettingsDto)', s2: '(dto)' },
  { name: 'updateSystemBrandingSettings', s1: '(@Body()dto: AdminUpdateSystemBrandingSettingsDto)', s2: '(dto)' },
  { name: 'updateSystemAuthPolicySettings', s1: '(@Body()dto: AdminUpdateSystemAuthPolicySettingsDto)', s2: '(dto)' },
  { name: 'updateSystemPasswordPolicySettings', s1: '(@Body()dto: AdminUpdateSystemPasswordPolicySettingsDto)', s2: '(dto)' },
  { name: 'updateSystemRateLimitSettings', s1: '(@Body()dto: AdminUpdateSystemRateLimitSettingsDto)', s2: '(dto)' },
  { name: 'updateSystemRetentionSettings', s1: '(@Body()dto: AdminUpdateSystemRetentionSettingsDto)', s2: '(dto)' },
  { name: 'runSystemRetentionCleanup', s1: '()', s2: '()' },
  { name: 'updateSystemBackupSettings', s1: '(@Body()dto: AdminUpdateSystemBackupSettingsDto)', s2: '(dto)' },
  { name: 'runSystemBackupNow', s1: '()', s2: '()' },
  { name: 'restoreSystemBackupLatest', s1: '()', s2: '()' },
  { name: 'restoreBackupFile', s1: "(@Param('fileName') fileName: string)", s2: '(fileName)' },
  { name: 'deleteBackupFile', s1: "(@Param('fileName') fileName: string)", s2: '(fileName)' },
  { name: 'sendSystemTestEmail', s1: '(@Body()dto: AdminSendTestEmailDto)', s2: '(dto.to)' }
];

methodsToPatch.forEach(m => {
  let searchRaw;
  searchRaw = new RegExp(m.name + '\\s*\\' + m.s1.replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\?/g, '\\?') + '\\s*\\{');

  let replaceSig = m.s1;
  if(m.s1 === '()') {
      replaceSig = '(@CurrentUser() user: any)';
  } else {
      replaceSig = m.s1.replace('(', '(@CurrentUser() user: any, ');
  }

  let methodCallRegex = new RegExp('this\\.adminService\\.' + m.name + '\\(' + m.s2.replace(/\(/g, '\\(').replace(/\)/g, '\\)') + '\\)');
  let replaceCall = 'this.adminService.' + m.name + (m.s2 === '()' ? '(user.id)' : m.s2.replace(')', ', user.id)'));
  
  cnt = cnt.replace(searchRaw, (match) => {
    return match.replace(m.s1, replaceSig);
  });
  
  cnt = cnt.replace(methodCallRegex, replaceCall);
});

// manual fix for updateRoleDescription cause signature formatted in multiline
cnt = cnt.replace(/updateRoleDescription\(\s*@Param\('id'\)id: string,\s*@Body\('description'\)description: string\)\s*\{/s, "updateRoleDescription(@CurrentUser() user: any, @Param('id')id: string, @Body('description')description: string) {");
cnt = cnt.replace(/this\.adminService\.updateRoleDescription\(id, description\)/, "this.adminService.updateRoleDescription(id, description, user.id)");

fs.writeFileSync('./src/admin/admin.controller.ts', cnt);

// Patch Service
let srv = fs.readFileSync('./src/admin/admin.service.ts', 'utf-8');

const srvMethods = [
  { name: 'deleteForm', sig: '(id: string)', newSig: '(id: string, adminResId: string)', logCall: "await this.activityLogService.log(null, adminResId, 'FORM_DELETED', { formId: id });" },
  { name: 'toggleUserBan', sig: '(userId: string)', newSig: '(userId: string, adminResId: string)', logCall: "await this.activityLogService.log(null, adminResId, user.isActive ? 'USER_BANNED' : 'USER_UNBANNED', { targetUserId: userId });" },
  { name: 'updateUserRole', sig: '(userId: string, roleId: string)', newSig: '(userId: string, roleId: string, adminResId: string)', logCall: "await this.activityLogService.log(null, adminResId, 'USER_ROLE_UPDATED', { targetUserId: userId, newRoleId: roleId });" },
  { name: 'updateRoleDescription', sig: '(roleId: string, description: string)', newSig: '(roleId: string, description: string, adminResId: string)', logCall: "await this.activityLogService.log(null, adminResId, 'ROLE_DESCRIPTION_UPDATED', { roleId, description });" },
  
  { name: 'updateSystemEmailSettings', sig: '}(\n  ) {', newSig: '}, adminResId: string) {', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_EMAIL_SETTINGS_UPDATED', payload as any);", isPayload: true, matchType: 1 },
  { name: 'updateSystemInviteSettings', sig: '}) {', newSig: '}, adminResId: string) {', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_INVITE_SETTINGS_UPDATED', payload as any);", isPayload: true },
  { name: 'updateSystemContactSettings', sig: '}) {', newSig: '}, adminResId: string) {', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_CONTACT_SETTINGS_UPDATED', payload as any);", isPayload: true },
  { name: 'updateSystemBrandingSettings', sig: '}) {', newSig: '}, adminResId: string) {', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_BRANDING_SETTINGS_UPDATED', payload as any);", isPayload: true },
  { name: 'updateSystemAuthPolicySettings', sig: '}) {', newSig: '}, adminResId: string) {', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_AUTH_POLICY_SETTINGS_UPDATED', payload as any);", isPayload: true },
  { name: 'updateSystemPasswordPolicySettings', sig: '}) {', newSig: '}, adminResId: string) {', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_PASSWORD_POLICY_SETTINGS_UPDATED', payload as any);", isPayload: true },
  { name: 'updateSystemRateLimitSettings', sig: '}) {', newSig: '}, adminResId: string) {', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_RATE_LIMIT_SETTINGS_UPDATED', payload as any);", isPayload: true },
  { name: 'updateSystemRetentionSettings', sig: '}) {', newSig: '}, adminResId: string) {', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_RETENTION_SETTINGS_UPDATED', payload as any);", isPayload: true },
  
  { name: 'runSystemRetentionCleanup', sig: '() {', newSig: '(adminResId: string) {', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_RETENTION_CLEANUP_RUN');" },
  
  { name: 'updateSystemBackupSettings', sig: '}) {', newSig: '}, adminResId: string) {', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_BACKUP_SETTINGS_UPDATED', payload as any);", isPayload: true },
  { name: 'runSystemBackupNow', sig: '() {', newSig: '(adminResId: string) {', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_BACKUP_RUN');" },
  { name: 'restoreSystemBackupLatest', sig: '() {', newSig: '(adminResId: string) {', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_BACKUP_RESTORED', { type: 'latest' });" },
  { name: 'deleteBackupFile', sig: '(fileName: string)', newSig: '(fileName: string, adminResId: string)', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_BACKUP_DELETED', { fileName });" },
  { name: 'restoreBackupFile', sig: '(fileName: string)', newSig: '(fileName: string, adminResId: string)', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_BACKUP_RESTORED', { fileName });" },
  { name: 'sendSystemTestEmail', sig: '(to: string)', newSig: '(to: string, adminResId: string)', logCall: "await this.activityLogService.log(null, adminResId, 'SYSTEM_TEST_EMAIL_SENT', { to });" }
];

srvMethods.forEach(m => {
  if (m.isPayload) {
      let regex = new RegExp(`async ${m.name}\\(payload:\\s*\\{.*?\\}\\)\\s*\\{`, 's');
      srv = srv.replace(regex, (match) => {
          if (m.matchType === 1) return match.replace('}(\n  ) {', m.newSig);
          return match.replace('}) {', m.newSig);
      });
  } else {
      srv = srv.replace(`async ${m.name}${m.sig} {`, `async ${m.name}${m.newSig} {`);
  }
  
  let targetReturn = `return this.systemSettingsService`;
  if (m.name === 'deleteForm') {
      srv = srv.replace(`await this.prisma.form.delete({\n        where: { id }\n      });`, `await this.prisma.form.delete({\n        where: { id }\n      });\n      ${m.logCall}`);
  } else if (m.name === 'toggleUserBan') {
      srv = srv.replace("    return this.prisma.user.update({", `    ${m.logCall}\n    return this.prisma.user.update({`);
  } else if (m.name === 'updateUserRole') {
      srv = srv.replace("    return this.prisma.user.update({", `    ${m.logCall}\n    return this.prisma.user.update({`);
  } else if (m.name === 'updateRoleDescription') {
      srv = srv.replace("    return this.prisma.role.update({", `    ${m.logCall}\n    return this.prisma.role.update({`);
  } else if (m.name === 'sendSystemTestEmail') {
      srv = srv.replace("    return this.mailService.sendTestEmail({ to });", `    ${m.logCall}\n    return this.mailService.sendTestEmail({ to });`);
  } else if (m.name === 'deleteBackupFile') {
     srv = srv.replace("    return this.systemSettingsService.deleteBackupFile(fileName);", `    ${m.logCall}\n    return this.systemSettingsService.deleteBackupFile(fileName);`);
  } else if (m.name === 'restoreBackupFile') {
     srv = srv.replace("    return this.systemSettingsService.restoreBackupFile(fileName);", `    ${m.logCall}\n    return this.systemSettingsService.restoreBackupFile(fileName);`);
  } else {
      let rx = new RegExp(`(async ${m.name}.*?\\{.*?)(return this.systemSettingsService.*?;)`, 's');
      srv = srv.replace(rx, `$1${m.logCall}\n    $2`);
  }
});

// createLocalUser
srv = srv.replace(`roleId: string;\n  }) {`, `roleId: string;\n  }, adminResId: string) {`);
srv = srv.replace(`    return {\n      ...user,`, `    await this.activityLogService.log(null, adminResId, 'LOCAL_USER_CREATED', { createdUserId: user.id, email: user.email });\n    return {\n      ...user,`);

fs.writeFileSync('./src/admin/admin.service.ts', srv);
