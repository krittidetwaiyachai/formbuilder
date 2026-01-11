import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Controller('forms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FormsController {
  constructor(
    private readonly formsService: FormsService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Post()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  create(
    @CurrentUser() user: any,
    @Body() createFormDto: CreateFormDto,
  ) {
    return this.formsService.create(user.id, createFormDto).then(form => ({ form }));
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.formsService.findAll(user.id, user.role).then(forms => ({ forms }));
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.formsService.findOne(id, user.id, user.role).then(form => ({ form }));
  }

  @Patch(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateFormDto: UpdateFormDto,
  ) {
    return this.formsService.update(id, user.id, user.role, updateFormDto);
  }

  @Delete(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.formsService.remove(id, user.id, user.role).then(result => ({ ...result }));
  }

  @Post(':id/clone')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  clone(@Param('id') id: string, @CurrentUser() user: any) {
    return this.formsService.clone(id, user.id);
  }

  @Get(':id/activity')
  async getFormActivity(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
    @Query('action') action?: string,
    @Query('userId') userId?: string,
  ) {
    return this.activityLogService.getFormActivity(
      id,
      parseInt(page),
      parseInt(limit),
      sort,
      action,
      userId,
    );
  }

  @Get(':id/activity/editors')
  async getFormEditors(@Param('id') id: string) {
    return this.activityLogService.getFormEditors(id);
  }

  @Get(':id/public')
  @Public()
  findPublic(
    @Param('id') id: string,
    @Query('fingerprint') fingerprint?: string,
    @Query('ip') ipAddress?: string,
    @Query('ua') userAgent?: string,
  ) {
    return this.formsService.findPublic(id, fingerprint, ipAddress, userAgent).then(form => ({ form }));
  }

  @Post(':id/collaborators')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  async addCollaborator(
    @Param('id') id: string,
    @Body('email') email: string,
  ) {
    return this.formsService.addCollaborator(id, email);
  }

  @Delete(':id/collaborators/:userId')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  async removeCollaborator(
    @Param('id') id: string,
    @Param('userId') userIdToRemove: string,
    @CurrentUser() user: any,
  ) {
    return this.formsService.removeCollaborator(id, userIdToRemove, user.id, user.role);
  }
}
