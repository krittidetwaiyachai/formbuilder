import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createFolderDto: CreateFolderDto) {
    return this.prisma.folder.create({
      data: {
        ...createFolderDto,
        userId,
      },
      include: {
        _count: {
          select: { forms: true },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.folder.findMany({
      where: { userId },
      include: {
        _count: {
          select: { forms: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id, userId },
      include: {
        forms: {
          select: {
            id: true,
            title: true,
            status: true,
            viewCount: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: { forms: true },
        },
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

  async update(id: string, userId: string, updateFolderDto: UpdateFolderDto) {
    const folder = await this.prisma.folder.findFirst({
      where: { id, userId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return this.prisma.folder.update({
      where: { id },
      data: updateFolderDto,
      include: {
        _count: {
          select: { forms: true },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id, userId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    // Unlink forms before deleting folder
    await this.prisma.form.updateMany({
      where: { folderId: id },
      data: { folderId: null },
    });

    return this.prisma.folder.delete({
      where: { id },
    });
  }

  async moveFormToFolder(formId: string, folderId: string | null, userId: string) {
    const form = await this.prisma.form.findFirst({
      where: { 
        id: formId,
        createdById: userId,
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (folderId) {
      const folder = await this.prisma.folder.findFirst({
        where: { id: folderId, userId },
      });

      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
    }

    return this.prisma.form.update({
      where: { id: formId },
      data: { folderId },
    });
  }
}
