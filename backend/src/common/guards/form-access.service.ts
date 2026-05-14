import {
  Injectable,
  NotFoundException,
  ForbiddenException } from
'@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleType, FormStatus } from '@prisma/client';
@Injectable()export class
FormAccessService {
  constructor(private readonly prisma: PrismaService) {}
  async assertReadAccess(formId: string, userId: string, userRole: RoleType) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        status: true,
        createdById: true,
        collaborators: { select: { id: true } }
      }
    });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (userRole === RoleType.SUPER_ADMIN || userRole === RoleType.ADMIN) {
      return form;
    }
    const isCreator = form.createdById === userId;
    const isCollaborator = form.collaborators.some((c) => c.id === userId);
    if (!isCreator && !isCollaborator) {
      throw new ForbiddenException('You do not have access to this form');
    }
    if (userRole === RoleType.VIEWER && form.status !== FormStatus.PUBLISHED) {
      throw new ForbiddenException('You can only view published forms');
    }
    return form;
  }
}