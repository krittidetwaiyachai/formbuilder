import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '@prisma/client';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  findAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.adminService.findAllUsers({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      role,
    });
  }

  @Patch('users/:id/ban')
  @Roles(RoleType.SUPER_ADMIN)
  @UseGuards(PermissionsGuard)
  @Permissions('MANAGE_USERS')
  async toggleBan(@Param('id') id: string) {
    try {
      return await this.adminService.toggleUserBan(id);
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  @Patch('users/:id/role')
  @Roles(RoleType.SUPER_ADMIN)
  @UseGuards(PermissionsGuard)
  @Permissions('MANAGE_USERS')
  updateRole(@Param('id') id: string, @Body('roleId') roleId: string) {
    return this.adminService.updateUserRole(id, roleId);
  }

  @Get('users/:id/permissions')
  @Roles(RoleType.SUPER_ADMIN)
  getUserPermissions(@Param('id') id: string) {
    return this.adminService.getUserWithPermissions(id);
  }

  @Patch('users/:id/permissions')
  @Roles(RoleType.SUPER_ADMIN)
  @UseGuards(PermissionsGuard)
  @Permissions('MANAGE_USERS')
  setUserPermissions(
    @Param('id') id: string,
    @Body('permissions') permissions: string[] | null,
  ) {
    return this.adminService.setUserPermissionOverrides(id, permissions);
  }

  @Get('roles')
  getAllRoles() {
    return this.adminService.getAllRoles();
  }

  @Get('roles/:id')
  @Roles(RoleType.SUPER_ADMIN)
  getRoleById(@Param('id') id: string) {
    return this.adminService.getRoleById(id);
  }

  @Patch('roles/:id/permissions')
  @Roles(RoleType.SUPER_ADMIN)
  @UseGuards(PermissionsGuard)
  @Permissions('MANAGE_ROLES')
  updateRolePermissions(
    @Param('id') id: string,
    @Body('permissions') permissions: string[],
  ) {
    return this.adminService.updateRolePermissions(id, permissions);
  }

  @Patch('roles/:id/description')
  @Roles(RoleType.SUPER_ADMIN)
  @UseGuards(PermissionsGuard)
  @Permissions('MANAGE_ROLES')
  updateRoleDescription(
    @Param('id') id: string,
    @Body('description') description: string,
  ) {
    return this.adminService.updateRoleDescription(id, description);
  }
}

