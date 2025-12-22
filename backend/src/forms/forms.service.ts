import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FormStatus, RoleType } from '@prisma/client';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createFormDto: CreateFormDto) {
    const { fields, conditions, ...formData } = createFormDto;

    const form = await this.prisma.form.create({
      data: {
        ...formData,
        createdById: userId,
        fields: fields
          ? {
              create: fields.map((field) => ({
                ...field,
                order: field.order ?? 0,
              })),
            }
          : undefined,
        conditions: conditions
          ? {
              create: conditions,
            }
          : undefined,
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        conditions: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return form;
  }

  async findAll(userId: string, userRole: RoleType) {
    const where: any = {};

    // VIEWER can only see published forms
    if (userRole === RoleType.VIEWER) {
      where.status = FormStatus.PUBLISHED;
    } else {
      // Others can see their own forms or all if ADMIN/SUPER_ADMIN
      if (userRole !== RoleType.SUPER_ADMIN && userRole !== RoleType.ADMIN) {
        where.createdById = userId;
      }
    }

    const forms = await this.prisma.form.findMany({
      where,
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Add responseCount and viewCount to each form
    return forms.map((form) => {
      const { _count, ...formData } = form;
      return {
        ...formData,
        responseCount: _count.responses,
        viewCount: 0, // TODO: Implement view tracking
      };
    });
  }

  async findOne(id: string, userId: string, userRole: RoleType) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        conditions: {
          include: {
            sourceField: true,
            targetField: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        presetFields: {
          include: {
            preset: true,
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Check permissions
    if (
      userRole === RoleType.VIEWER &&
      form.status !== FormStatus.PUBLISHED
    ) {
      throw new ForbiddenException('You can only view published forms');
    }

    if (
      userRole === RoleType.EDITOR &&
      form.createdById !== userId &&
      form.status !== FormStatus.PUBLISHED
    ) {
      throw new ForbiddenException('You can only edit your own forms');
    }

    return form;
  }

  async update(
    id: string,
    userId: string,
    userRole: RoleType,
    updateFormDto: UpdateFormDto,
  ) {
    const form = await this.findOne(id, userId, userRole);

    // Check edit permissions
    if (
      userRole !== RoleType.SUPER_ADMIN &&
      userRole !== RoleType.ADMIN &&
      form.createdById !== userId
    ) {
      throw new ForbiddenException('You can only edit your own forms');
    }

    const { fields, conditions, ...formData } = updateFormDto;

    // Handle fields update
    if (fields) {
      // Delete existing fields
      await this.prisma.field.deleteMany({
        where: { formId: id },
      });

      // Create new fields
      await this.prisma.field.createMany({
        data: fields.map((field) => ({
          ...field,
          formId: id,
          order: field.order ?? 0,
        })),
      });
    }

    // Handle conditions update
    if (conditions) {
      await this.prisma.fieldCondition.deleteMany({
        where: { formId: id },
      });

      await this.prisma.fieldCondition.createMany({
        data: conditions.map((condition) => ({
          ...condition,
          formId: id,
        })),
      });
    }

    return this.prisma.form.update({
      where: { id },
      data: formData,
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        conditions: true,
      },
    });
  }

  async remove(id: string, userId: string, userRole: RoleType) {
    const form = await this.findOne(id, userId, userRole);

    // Check delete permissions
    if (
      userRole !== RoleType.SUPER_ADMIN &&
      userRole !== RoleType.ADMIN &&
      form.createdById !== userId
    ) {
      throw new ForbiddenException('You can only delete your own forms');
    }

    await this.prisma.form.delete({
      where: { id },
    });

    return { message: 'Form deleted successfully' };
  }

  async clone(id: string, userId: string) {
    const originalForm = await this.prisma.form.findUnique({
      where: { id },
      include: {
        fields: true,
        conditions: true,
      },
    });

    if (!originalForm) {
      throw new NotFoundException('Form not found');
    }

    const clonedForm = await this.prisma.form.create({
      data: {
        title: `${originalForm.title} (Copy)`,
        description: originalForm.description,
        status: FormStatus.DRAFT,
        isQuiz: originalForm.isQuiz,
        quizSettings: originalForm.quizSettings,
        createdById: userId,
        fields: {
          create: originalForm.fields.map((field) => ({
            type: field.type,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            validation: field.validation,
            order: field.order,
            options: field.options,
            correctAnswer: field.correctAnswer,
            score: field.score,
          })),
        },
        conditions: {
          create: originalForm.conditions.map((condition) => ({
            sourceFieldId: condition.sourceFieldId,
            targetFieldId: condition.targetFieldId,
            operator: condition.operator,
            value: condition.value,
            action: condition.action,
          })),
        },
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        conditions: true,
      },
    });

    return clonedForm;
  }
}

