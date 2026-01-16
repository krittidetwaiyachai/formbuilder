import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  create(@Request() req, @Body() createFolderDto: CreateFolderDto) {
    return this.foldersService.create(req.user.id, createFolderDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.foldersService.findAll(req.user.id);
  }

  @Put('move-form/:formId')
  moveForm(
    @Param('formId') formId: string,
    @Body('folderId') folderId: string | null,
    @Request() req,
  ) {
    return this.foldersService.moveFormToFolder(formId, folderId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.foldersService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.foldersService.update(id, req.user.id, updateFolderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.foldersService.remove(id, req.user.id);
  }
}

