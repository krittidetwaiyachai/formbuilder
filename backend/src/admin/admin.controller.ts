import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  NotFoundException } from
'@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '@prisma/client';
import { AdminUpdateSystemEmailSettingsDto } from './dto/admin-update-system-email-settings.dto';
import { AdminUpdateSystemInviteSettingsDto } from './dto/admin-update-system-invite-settings.dto';
import { AdminSendTestEmailDto } from './dto/admin-send-test-email.dto';
import { AdminUpdateSystemContactSettingsDto } from './dto/admin-update-system-contact-settings.dto';
import { AdminUpdateSystemBrandingSettingsDto } from './dto/admin-update-system-branding-settings.dto';
import { AdminUpdateSystemAuthPolicySettingsDto } from './dto/admin-update-system-auth-policy-settings.dto';
import { AdminUpdateSystemPasswordPolicySettingsDto } from './dto/admin-update-system-password-policy-settings.dto';
import { AdminUpdateSystemRateLimitSettingsDto } from './dto/admin-update-system-rate-limit-settings.dto';
import { AdminUpdateSystemRetentionSettingsDto } from './dto/admin-update-system-retention-settings.dto';
import { AdminUpdateSystemBackupSettingsDto } from './dto/admin-update-system-backup-settings.dto';
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)export class
AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }
  @Get('users')
  findAllUsers(
    @Query('page')page?: string,
    @Query('limit')limit?: string,
    @Query('search')search?: string,
    @Query('role')role?: string)
  {
    return this.adminService.findAllUsers({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      role
    });
  }
  @Get('logs')
  getSystemLogs(
    @Query('page')page?: string,
    @Query('limit')limit?: string,
    @Query('search')search?: string,
    @Query('action')action?: string)
  {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const safeLimit =
    Number.isFinite(parsedLimit) && parsedLimit > 0 ?
    Math.min(parsedLimit, 100) :
    20;
    return this.adminService.getSystemLogs({
      page: safePage,
      limit: safeLimit,
      search,
      action
    });
  }
  @Patch('users/:id/ban')
  @Roles(RoleType.SUPER_ADMIN)
  async toggleBan(@Param('id')id: string) {
    try {
      return await this.adminService.toggleUserBan(id);
    } catch {
      throw new NotFoundException('User not found');
    }
  }
  @Patch('users/:id/role')
  @Roles(RoleType.SUPER_ADMIN)
  updateRole(@Param('id')id: string, @Body('roleId')roleId: string) {
    return this.adminService.updateUserRole(id, roleId);
  }
  @Get('roles')
  getAllRoles() {
    return this.adminService.getAllRoles();
  }
  @Get('roles/:id')
  @Roles(RoleType.SUPER_ADMIN)
  getRoleById(@Param('id')id: string) {
    return this.adminService.getRoleById(id);
  }
  @Patch('roles/:id/description')
  @Roles(RoleType.SUPER_ADMIN)
  updateRoleDescription(
    @Param('id')id: string,
    @Body('description')description: string)
  {
    return this.adminService.updateRoleDescription(id, description);
  }
  @Get('settings/system')
  getSystemSettings() {
    return this.adminService.getSystemSettings();
  }
  @Patch('settings/system/email')
  updateSystemEmailSettings(@Body()dto: AdminUpdateSystemEmailSettingsDto) {
    return this.adminService.updateSystemEmailSettings(dto);
  }
  @Patch('settings/system/invite')
  updateSystemInviteSettings(@Body()dto: AdminUpdateSystemInviteSettingsDto) {
    return this.adminService.updateSystemInviteSettings(dto);
  }
  @Patch('settings/system/contact')
  updateSystemContactSettings(@Body()dto: AdminUpdateSystemContactSettingsDto) {
    return this.adminService.updateSystemContactSettings(dto);
  }
  @Patch('settings/system/branding')
  updateSystemBrandingSettings(@Body()dto: AdminUpdateSystemBrandingSettingsDto) {
    return this.adminService.updateSystemBrandingSettings(dto);
  }
  @Patch('settings/system/auth-policy')
  updateSystemAuthPolicySettings(@Body()dto: AdminUpdateSystemAuthPolicySettingsDto) {
    return this.adminService.updateSystemAuthPolicySettings(dto);
  }
  @Patch('settings/system/password-policy')
  updateSystemPasswordPolicySettings(@Body()dto: AdminUpdateSystemPasswordPolicySettingsDto) {
    return this.adminService.updateSystemPasswordPolicySettings(dto);
  }
  @Patch('settings/system/rate-limit')
  updateSystemRateLimitSettings(@Body()dto: AdminUpdateSystemRateLimitSettingsDto) {
    return this.adminService.updateSystemRateLimitSettings(dto);
  }
  @Patch('settings/system/retention')
  updateSystemRetentionSettings(@Body()dto: AdminUpdateSystemRetentionSettingsDto) {
    return this.adminService.updateSystemRetentionSettings(dto);
  }
  @Post('settings/system/retention/run-cleanup')
  runSystemRetentionCleanup() {
    return this.adminService.runSystemRetentionCleanup();
  }
  @Patch('settings/system/backup')
  updateSystemBackupSettings(@Body()dto: AdminUpdateSystemBackupSettingsDto) {
    return this.adminService.updateSystemBackupSettings(dto);
  }
  @Post('settings/system/backup/run')
  runSystemBackupNow() {
    return this.adminService.runSystemBackupNow();
  }
  @Post('settings/system/backup/restore-latest')
  restoreSystemBackupLatest() {
    return this.adminService.restoreSystemBackupLatest();
  }
  @Post('settings/system/email/test')
  sendSystemTestEmail(@Body()dto: AdminSendTestEmailDto) {
    return this.adminService.sendSystemTestEmail(dto.to);
  }
}