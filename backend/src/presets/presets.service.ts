import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePresetDto } from './dto/create-preset.dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class PresetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPresetDto: CreatePresetDto) {
    const { fields, ...presetData } = createPresetDto;

    // Get latest version of preset with same name
    const latestPreset = await this.prisma.preset.findFirst({
      where: { name: presetData.name, isActive: true },
      orderBy: { version: 'desc' },
    });

    const version = latestPreset ? latestPreset.version + 1 : 1;

    const preset = await this.prisma.preset.create({
      data: {
        ...presetData,
        version,
        createdById: userId,
        fields: {
          create: fields.map((field) => ({
            ...field,
            order: field.order ?? 0,
          })),
        },
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return preset;
  }

  async findAll() {
    return this.prisma.preset.findMany({
      where: { isActive: true },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            fields: true,
          },
        },
      },
      orderBy: [
        { name: 'asc' },
        { version: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const preset = await this.prisma.preset.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!preset) {
      throw new NotFoundException('Preset not found');
    }

    return preset;
  }

  async applyPresetToForm(
    presetId: string,
    formId: string,
    userId: string,
    userRole: RoleType,
  ) {
    // Check if user can apply presets
    if (userRole === RoleType.VIEWER) {
      throw new ForbiddenException('Viewers cannot apply presets');
    }

    const preset = await this.findOne(presetId);
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Check form edit permissions
    if (
      userRole !== RoleType.SUPER_ADMIN &&
      userRole !== RoleType.ADMIN &&
      form.createdById !== userId
    ) {
      throw new ForbiddenException('You can only edit your own forms');
    }

    // Create preset fields linked to form
    const presetFields = await Promise.all(
      preset.fields.map((field) =>
        this.prisma.presetField.create({
          data: {
            presetId: preset.id,
            formId: form.id,
            type: field.type,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            validation: field.validation,
            order: field.order,
            options: field.options,
          },
        }),
      ),
    );

    return presetFields;
  }

  async update(id: string, userId: string, updateData: Partial<CreatePresetDto>) {
    const preset = await this.findOne(id);

    // Create new version instead of updating (versioning)
    const { fields, ...presetData } = updateData;

    const latestPreset = await this.prisma.preset.findFirst({
      where: { name: preset.name, isActive: true },
      orderBy: { version: 'desc' },
    });

    const version = latestPreset ? latestPreset.version + 1 : preset.version + 1;

    // Deactivate old version
    await this.prisma.preset.update({
      where: { id },
      data: { isActive: false },
    });

    // Create new version
    const newPreset = await this.prisma.preset.create({
      data: {
        name: preset.name,
        description: presetData.description ?? preset.description,
        isPII: presetData.isPII ?? preset.isPII,
        sensitivityLevel: presetData.sensitivityLevel ?? preset.sensitivityLevel,
        version,
        createdById: userId,
        fields: {
          create: (fields || preset.fields).map((field: any) => ({
            type: field.type,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            validation: field.validation,
            order: field.order ?? 0,
            options: field.options,
          })),
        },
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return newPreset;
  }

  async remove(id: string) {
    // Soft delete - just deactivate
    const preset = await this.findOne(id);
    
    await this.prisma.preset.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Preset deactivated successfully' };
  }
}

