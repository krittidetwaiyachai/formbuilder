import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
  Ip,
} from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RoleType } from '@prisma/client';
import { Response } from 'express';

@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post()
  @Public()
  create(@Body() createResponseDto: CreateResponseDto, @Ip() ip: string) {
    createResponseDto.ipAddress = ip;
    return this.responsesService.create(createResponseDto);
  }

  @Get('check/:formId')
  @Public()
  checkSubmissionStatus(
    @Param('formId') formId: string,
    @Query('userId') userId?: string,
    @Query('respondentEmail') respondentEmail?: string,
    @Query('fingerprint') fingerprint?: string,
  ) {
    return this.responsesService.checkSubmissionStatus(
      formId,
      userId,
      respondentEmail,
      fingerprint,
    );
  }

  @Get('form/:formId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.VIEWER)
  findAll(
    @Param('formId') formId: string,
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const sortOrder = sort === 'asc' ? 'asc' : 'desc';
    return this.responsesService.findAll(formId, user.id, user.role, pageNum, limitNum, sortOrder);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.VIEWER)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.responsesService.findOne(id, user.id, user.role);
  }

  @Get('form/:formId/export/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.VIEWER)
  async exportCSV(
    @Param('formId') formId: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const { csv, filename } = await this.responsesService.exportToCSV(
      formId,
      user.id,
      user.role,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
    res.send(csv);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('DELETE_RESPONSES')
  async remove(@Param('id') id: string) {
    return this.responsesService.remove(id);
  }
}
