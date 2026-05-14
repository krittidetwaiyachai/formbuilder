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
  Logger } from
'@nestjs/common';
import { BundlesService } from './bundles.service';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType } from '@prisma/client';
interface User {
  id: string;
  email: string;
  role: RoleType;
}
@Controller('bundles')
@UseGuards(JwtAuthGuard, RolesGuard)export class
BundlesController {
  private readonly logger = new Logger(BundlesController.name);
  constructor(private readonly bundlesService: BundlesService) {}
  @Post()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  create(@CurrentUser()user: User, @Body()createBundleDto: CreateBundleDto) {
    return this.bundlesService.create(user.id, createBundleDto);
  }
  @Get()
  findAll(@Query('isActive')isActive?: string) {
    const isActiveBool =
    isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.bundlesService.findAll(isActiveBool);
  }
  @Get(':id')
  findOne(@Param('id')id: string) {
    return this.bundlesService.findOne(id);
  }
  @Post(':id/apply/:formId')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR)
  applyBundle(
    @Param('id')bundleId: string,
    @Param('formId')formId: string,
    @CurrentUser()user: User)
  {
    return this.bundlesService.applyBundleToForm(
      bundleId,
      formId,
      user.id,
      user.role
    );
  }
  @Patch(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  update(
    @Param('id')id: string,
    @CurrentUser()user: User,
    @Body()updateData: Partial<CreateBundleDto>)
  {
    return this.bundlesService.update(id, user.id, updateData);
  }
  @Delete(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  async remove(@Param('id')id: string, @CurrentUser()user: User) {
    this.logger.warn(
      `ADMIN_DELETE_BUNDLE | bundleId=${id} | deletedBy=${user.id}`
    );
    return this.bundlesService.remove(id);
  }
}