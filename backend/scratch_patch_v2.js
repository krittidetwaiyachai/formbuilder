const fs = require('fs');

// Patch Controller
let cnt = fs.readFileSync('./src/admin/admin.controller.ts', 'utf-8');
if(!cnt.includes('CurrentUser')) {
  cnt = cnt.replace("import { Roles } from '../auth/decorators/roles.decorator';", "import { Roles } from '../auth/decorators/roles.decorator';\nimport { CurrentUser } from '../auth/decorators/current-user.decorator';");
}

let cReplacements = [
  ["createLocalUser(@Body() dto: AdminCreateLocalUserDto) {", "createLocalUser(@CurrentUser() user: any, @Body() dto: AdminCreateLocalUserDto) {"],
  ["this.adminService.createLocalUser(dto)", "this.adminService.createLocalUser(dto, user.id)"],
  
  ["deleteForm(@Param('id') id: string) {", "deleteForm(@CurrentUser() user: any, @Param('id') id: string) {"],
  ["this.adminService.deleteForm(id)", "this.adminService.deleteForm(id, user.id)"],

  ["async toggleBan(@Param('id')id: string) {", "async toggleBan(@CurrentUser() user: any, @Param('id')id: string) {"],
  ["await this.adminService.toggleUserBan(id)", "await this.adminService.toggleUserBan(id, user.id)"],

  ["updateRole(@Param('id')id: string, @Body('roleId')roleId: string) {", "updateRole(@CurrentUser() user: any, @Param('id')id: string, @Body('roleId')roleId: string) {"],
  ["this.adminService.updateUserRole(id, roleId)", "this.adminService.updateUserRole(id, roleId, user.id)"],

  ["updateRoleDescription(\n    @Param('id')id: string,\n    @Body('description')description: string)\n  {", "updateRoleDescription(@CurrentUser() user: any, @Param('id')id: string, @Body('description')description: string) {"],
  ["this.adminService.updateRoleDescription(id, description)", "this.adminService.updateRoleDescription(id, description, user.id)"],
  
  ["updateSystemEmailSettings(@Body()dto: AdminUpdateSystemEmailSettingsDto) {", "updateSystemEmailSettings(@CurrentUser() user: any, @Body()dto: AdminUpdateSystemEmailSettingsDto) {"],
  ["this.adminService.updateSystemEmailSettings(dto)", "this.adminService.updateSystemEmailSettings(dto, user.id)"],

  ["updateSystemInviteSettings(@Body()dto: AdminUpdateSystemInviteSettingsDto) {", "updateSystemInviteSettings(@CurrentUser() user: any, @Body()dto: AdminUpdateSystemInviteSettingsDto) {"],
  ["this.adminService.updateSystemInviteSettings(dto)", "this.adminService.updateSystemInviteSettings(dto, user.id)"],

  ["updateSystemContactSettings(@Body()dto: AdminUpdateSystemContactSettingsDto) {", "updateSystemContactSettings(@CurrentUser() user: any, @Body()dto: AdminUpdateSystemContactSettingsDto) {"],
  ["this.adminService.updateSystemContactSettings(dto)", "this.adminService.updateSystemContactSettings(dto, user.id)"],

  ["updateSystemBrandingSettings(@Body()dto: AdminUpdateSystemBrandingSettingsDto) {", "updateSystemBrandingSettings(@CurrentUser() user: any, @Body()dto: AdminUpdateSystemBrandingSettingsDto) {"],
  ["this.adminService.updateSystemBrandingSettings(dto)", "this.adminService.updateSystemBrandingSettings(dto, user.id)"],

  ["updateSystemAuthPolicySettings(@Body()dto: AdminUpdateSystemAuthPolicySettingsDto) {", "updateSystemAuthPolicySettings(@CurrentUser() user: any, @Body()dto: AdminUpdateSystemAuthPolicySettingsDto) {"],
  ["this.adminService.updateSystemAuthPolicySettings(dto)", "this.adminService.updateSystemAuthPolicySettings(dto, user.id)"],

  ["updateSystemPasswordPolicySettings(@Body()dto: AdminUpdateSystemPasswordPolicySettingsDto) {", "updateSystemPasswordPolicySettings(@CurrentUser() user: any, @Body()dto: AdminUpdateSystemPasswordPolicySettingsDto) {"],
  ["this.adminService.updateSystemPasswordPolicySettings(dto)", "this.adminService.updateSystemPasswordPolicySettings(dto, user.id)"],

  ["updateSystemRateLimitSettings(@Body()dto: AdminUpdateSystemRateLimitSettingsDto) {", "updateSystemRateLimitSettings(@CurrentUser() user: any, @Body()dto: AdminUpdateSystemRateLimitSettingsDto) {"],
  ["this.adminService.updateSystemRateLimitSettings(dto)", "this.adminService.updateSystemRateLimitSettings(dto, user.id)"],

  ["updateSystemRetentionSettings(@Body()dto: AdminUpdateSystemRetentionSettingsDto) {", "updateSystemRetentionSettings(@CurrentUser() user: any, @Body()dto: AdminUpdateSystemRetentionSettingsDto) {"],
  ["this.adminService.updateSystemRetentionSettings(dto)", "this.adminService.updateSystemRetentionSettings(dto, user.id)"],

  ["runSystemRetentionCleanup() {", "runSystemRetentionCleanup(@CurrentUser() user: any) {"],
  ["this.adminService.runSystemRetentionCleanup()", "this.adminService.runSystemRetentionCleanup(user.id)"],

  ["updateSystemBackupSettings(@Body()dto: AdminUpdateSystemBackupSettingsDto) {", "updateSystemBackupSettings(@CurrentUser() user: any, @Body()dto: AdminUpdateSystemBackupSettingsDto) {"],
  ["this.adminService.updateSystemBackupSettings(dto)", "this.adminService.updateSystemBackupSettings(dto, user.id)"],

  ["runSystemBackupNow() {", "runSystemBackupNow(@CurrentUser() user: any) {"],
  ["this.adminService.runSystemBackupNow()", "this.adminService.runSystemBackupNow(user.id)"],

  ["restoreSystemBackupLatest() {", "restoreSystemBackupLatest(@CurrentUser() user: any) {"],
  ["this.adminService.restoreSystemBackupLatest()", "this.adminService.restoreSystemBackupLatest(user.id)"],

  ["async restoreBackupFile(@Param('fileName') fileName: string) {", "async restoreBackupFile(@CurrentUser() user: any, @Param('fileName') fileName: string) {"],
  ["await this.adminService.restoreBackupFile(fileName)", "await this.adminService.restoreBackupFile(fileName, user.id)"],

  ["async deleteBackupFile(@Param('fileName') fileName: string) {", "async deleteBackupFile(@CurrentUser() user: any, @Param('fileName') fileName: string) {"],
  ["await this.adminService.deleteBackupFile(fileName)", "await this.adminService.deleteBackupFile(fileName, user.id)"],

  ["sendSystemTestEmail(@Body()dto: AdminSendTestEmailDto) {", "sendSystemTestEmail(@CurrentUser() user: any, @Body()dto: AdminSendTestEmailDto) {"],
  ["this.adminService.sendSystemTestEmail(dto.to)", "this.adminService.sendSystemTestEmail(dto.to, user.id)"]
];

for(let [find, replace] of cReplacements) {
  cnt = cnt.replace(find, replace);
}
fs.writeFileSync('./src/admin/admin.controller.ts', cnt);


// Patch Service
let srv = fs.readFileSync('./src/admin/admin.service.ts', 'utf-8');
const sReplacements = [
  // toggleUserBan
  ["async toggleUserBan(userId: string) {", "async toggleUserBan(userId: string, adminResId: string) {"],
  ["    return this.prisma.user.update({", "    await this.activityLogService.log(null, adminResId, user.isActive ? 'USER_BANNED' : 'USER_UNBANNED', { targetUserId: userId });\n    return this.prisma.user.update({"],
  
  // updateUserRole
  ["async updateUserRole(userId: string, roleId: string) {", "async updateUserRole(userId: string, roleId: string, adminResId: string) {"],
  ["    return this.prisma.user.update({", "    await this.activityLogService.log(null, adminResId, 'USER_ROLE_UPDATED', { targetUserId: userId, newRoleId: roleId });\n    return this.prisma.user.update({"],
  
  // updateRoleDescription
  ["async updateRoleDescription(roleId: string, description: string) {", "async updateRoleDescription(roleId: string, description: string, adminResId: string) {"],
  ["    return this.prisma.role.update({", "    await this.activityLogService.log(null, adminResId, 'ROLE_DESCRIPTION_UPDATED', { roleId, description });\n    return this.prisma.role.update({"],
  
  // createLocalUser
  ["    roleId: string;\n  }) {", "    roleId: string;\n  }, adminResId: string) {"],
  ["    return {\n      ...user", "    await this.activityLogService.log(null, adminResId, 'LOCAL_USER_CREATED', { createdUserId: user.id, email: user.email });\n    return {\n      ...user"],
  
  // deleteForm
  ["async deleteForm(id: string) {", "async deleteForm(id: string, adminResId: string) {"],
  ["      await this.prisma.form.delete({\n        where: { id }\n      });", "      await this.prisma.form.delete({\n        where: { id }\n      });\n      await this.activityLogService.log(null, adminResId, 'FORM_DELETED', { formId: id });"],
  
  // updateSystemEmailSettings
  ["  }) {\n    return this.systemSettingsService.updateEmailSettings(payload);", "  }, adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_EMAIL_SETTINGS_UPDATED', payload as any);\n    return this.systemSettingsService.updateEmailSettings(payload);"],
  
  // updateSystemInviteSettings
  ["  }) {\n    return this.systemSettingsService.updateInviteSettings(payload);", "  }, adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_INVITE_SETTINGS_UPDATED', payload as any);\n    return this.systemSettingsService.updateInviteSettings(payload);"],

  // updateSystemContactSettings
  ["  }) {\n    return this.systemSettingsService.updateContactSettings(payload);", "  }, adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_CONTACT_SETTINGS_UPDATED', payload as any);\n    return this.systemSettingsService.updateContactSettings(payload);"],

  // updateSystemBrandingSettings
  ["  }) {\n    return this.systemSettingsService.updateBrandingSettings(payload);", "  }, adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_BRANDING_SETTINGS_UPDATED', payload as any);\n    return this.systemSettingsService.updateBrandingSettings(payload);"],

  // updateSystemAuthPolicySettings
  ["  }) {\n    return this.systemSettingsService.updateAuthPolicySettings(payload);", "  }, adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_AUTH_POLICY_SETTINGS_UPDATED', payload as any);\n    return this.systemSettingsService.updateAuthPolicySettings(payload);"],

  // updateSystemPasswordPolicySettings
  ["  }) {\n    return this.systemSettingsService.updatePasswordPolicySettings(payload);", "  }, adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_PASSWORD_POLICY_SETTINGS_UPDATED', payload as any);\n    return this.systemSettingsService.updatePasswordPolicySettings(payload);"],

  // updateSystemRateLimitSettings
  ["  }) {\n    return this.systemSettingsService.updateRateLimitSettings(payload);", "  }, adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_RATE_LIMIT_SETTINGS_UPDATED', payload as any);\n    return this.systemSettingsService.updateRateLimitSettings(payload);"],

  // updateSystemRetentionSettings
  ["  }) {\n    return this.systemSettingsService.updateRetentionSettings(payload);", "  }, adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_RETENTION_SETTINGS_UPDATED', payload as any);\n    return this.systemSettingsService.updateRetentionSettings(payload);"],

  // runSystemRetentionCleanup
  ["async runSystemRetentionCleanup() {\n    return this.systemSettingsService.runRetentionCleanupNow();", "async runSystemRetentionCleanup(adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_RETENTION_CLEANUP_RUN');\n    return this.systemSettingsService.runRetentionCleanupNow();"],

  // updateSystemBackupSettings
  ["  }) {\n    return this.systemSettingsService.updateBackupSettings(payload);", "  }, adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_BACKUP_SETTINGS_UPDATED', payload as any);\n    return this.systemSettingsService.updateBackupSettings(payload);"],

  // runSystemBackupNow
  ["async runSystemBackupNow() {\n    return this.systemSettingsService.runBackupNow();", "async runSystemBackupNow(adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_BACKUP_RUN');\n    return this.systemSettingsService.runBackupNow();"],

  // restoreSystemBackupLatest
  ["async restoreSystemBackupLatest() {\n    return this.systemSettingsService.restoreLatestBackup();", "async restoreSystemBackupLatest(adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_BACKUP_RESTORED', { type: 'latest' });\n    return this.systemSettingsService.restoreLatestBackup();"],

  // deleteBackupFile
  ["async deleteBackupFile(fileName: string) {\n    return this.systemSettingsService.deleteBackupFile(fileName);", "async deleteBackupFile(fileName: string, adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_BACKUP_DELETED', { fileName });\n    return this.systemSettingsService.deleteBackupFile(fileName);"],

  // restoreBackupFile
  ["async restoreBackupFile(fileName: string) {\n    return this.systemSettingsService.restoreBackupFile(fileName);", "async restoreBackupFile(fileName: string, adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_BACKUP_RESTORED', { fileName });\n    return this.systemSettingsService.restoreBackupFile(fileName);"],

  // sendSystemTestEmail
  ["async sendSystemTestEmail(to: string) {\n    return this.mailService.sendTestEmail({ to });", "async sendSystemTestEmail(to: string, adminResId: string) {\n    await this.activityLogService.log(null, adminResId, 'SYSTEM_TEST_EMAIL_SENT', { to });\n    return this.mailService.sendTestEmail({ to });"]
];

for(let [find, replace] of sReplacements) {
  srv = srv.replace(find, replace);
}

fs.writeFileSync('./src/admin/admin.service.ts', srv);
