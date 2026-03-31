import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  Post,
  UseGuards,
  Query } from
'@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType } from '@prisma/client';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { FormAccessService } from '../common/guards/form-access.service';
interface User {
  id: string;
  email: string;
  role: RoleType;
}
@Controller('forms')
@UseGuards(JwtAuthGuard, RolesGuard)export class
FormsController {
  constructor(
  private readonly formsService: FormsService,
  private readonly activityLogService: ActivityLogService,
  private readonly formAccessService: FormAccessService)
  {}
  @Post()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  create(
    @CurrentUser()user: User,
    @Body()createFormDto: CreateFormDto)
  {
    return this.formsService.create(user.id, createFormDto).then((form) => ({ form }));
  }
  @Get()
  findAll(@CurrentUser()user: User) {
    return this.formsService.findAll(user.id, user.role).then((forms) => ({ forms }));
  }
  @Get(':id')
  findOne(
    @Param('id')id: string,
    @CurrentUser()user: User)
  {
    return this.formsService.findOne(id, user.id, user.role).then((form) => ({ form }));
  }
  @Patch(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  update(
    @Param('id')id: string,
    @CurrentUser()user: User,
    @Body()updateFormDto: UpdateFormDto)
  {
    return this.formsService.update(id, user.id, user.role, updateFormDto);
  }
  @Delete(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  remove(@Param('id')id: string, @CurrentUser()user: User) {
    return this.formsService.remove(id, user.id, user.role).then((result) => ({ ...result }));
  }
  @Post(':id/clone')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  clone(@Param('id')id: string, @CurrentUser()user: User) {
    return this.formsService.clone(id, user.id);
  }
  @Get(':id/activity')
  async getFormActivity(
    @Param('id')id: string,
    @CurrentUser()user: User,
  page: string = '1',
  limit: string = '20',
  sort: 'asc' | 'desc' = 'desc',
    @Query('action')action?: string,
    @Query('userId')userId?: string)
  {
    await this.formAccessService.assertReadAccess(id, user.id, user.role);
    return this.activityLogService.getFormActivity(
      id,
      parseInt(page),
      parseInt(limit),
      sort,
      action,
      userId
    );
  }
  @Get(':id/activity/editors')
  async getFormEditors(
    @Param('id')id: string,
    @CurrentUser()user: User)
  {
    await this.formAccessService.assertReadAccess(id, user.id, user.role);
    return this.activityLogService.getFormEditors(id);
  }
  @Post(':id/collaborators')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  async addCollaborator(
    @Param('id')id: string,
    @CurrentUser()user: User,
    @Body('email')email: string)
  {
    return this.formsService.addCollaborator(id, email, user.id, user.role);
  }
  @Delete(':id/collaborators/:userId')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  async removeCollaborator(
    @Param('id')id: string,
    @Param('userId')userIdToRemove: string,
    @CurrentUser()user: User)
  {
    return this.formsService.removeCollaborator(id, userIdToRemove, user.id, user.role);
  }
}