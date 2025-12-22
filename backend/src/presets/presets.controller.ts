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
import { PresetsService } from './presets.service';
import { CreatePresetDto } from './dto/create-preset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType } from '@prisma/client';

@Controller('presets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PresetsController {
  constructor(private readonly presetsService: PresetsService) {}

  @Post()
  @Roles(RoleType.SUPER_ADMIN)
  create(@CurrentUser() user: any, @Body() createPresetDto: CreatePresetDto) {
    return this.presetsService.create(user.id, createPresetDto);
  }

  @Get()
  findAll() {
    return this.presetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.presetsService.findOne(id);
  }

  @Post(':id/apply/:formId')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  applyPreset(
    @Param('id') presetId: string,
    @Param('formId') formId: string,
    @CurrentUser() user: any,
  ) {
    return this.presetsService.applyPresetToForm(
      presetId,
      formId,
      user.id,
      user.role,
    );
  }

  @Patch(':id')
  @Roles(RoleType.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateData: Partial<CreatePresetDto>,
  ) {
    return this.presetsService.update(id, user.id, updateData);
  }

  @Delete(':id')
  @Roles(RoleType.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.presetsService.remove(id);
  }
}

