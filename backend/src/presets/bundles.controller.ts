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
import { BundlesService } from './bundles.service';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType } from '@prisma/client';

@Controller('bundles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('MANAGE_BUNDLES')
  create(@CurrentUser() user: any, @Body() createBundleDto: CreateBundleDto) {
    return this.bundlesService.create(user.id, createBundleDto);
  }

  @Get()
  findAll(@Query('isActive') isActive?: string) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.bundlesService.findAll(isActiveBool);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bundlesService.findOne(id);
  }

  @Post(':id/apply/:formId')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  applyBundle(
    @Param('id') bundleId: string,
    @Param('formId') formId: string,
    @CurrentUser() user: any,
  ) {
    return this.bundlesService.applyBundleToForm(
      bundleId,
      formId,
      user.id,
      user.role,
    );
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('MANAGE_BUNDLES')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateData: Partial<CreateBundleDto>,
  ) {
    return this.bundlesService.update(id, user.id, updateData);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('MANAGE_BUNDLES')
  remove(@Param('id') id: string) {
    return this.bundlesService.remove(id);
  }
}
