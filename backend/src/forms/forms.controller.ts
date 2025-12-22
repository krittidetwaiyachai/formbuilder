import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType } from '@prisma/client';

@Controller('forms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

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
}

