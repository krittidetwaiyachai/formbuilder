import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class BundlesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBundleDto: CreateBundleDto) {
    const { fields, ...bundleData } = createBundleDto;

    const latestBundle = await this.prisma.bundle.findFirst({
      where: { name: bundleData.name },
      orderBy: { version: 'desc' },
    });

    const version = latestBundle ? latestBundle.version + 1 : 1;

    const bundle = await this.prisma.bundle.create({
      data: {
        ...bundleData,
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

    return bundle;
  }

  async findAll(isActive?: boolean) {
    const bundles = await this.prisma.bundle.findMany({
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

    // Soft delete filter and Get Latest Versions only
    let allBundles = bundles.filter(b => !(b.options as any)?.deleted);
    
    // Group by name and pick the one with highest version
    const latestBundlesMap = new Map<string, typeof bundles[0]>();
    
    allBundles.forEach(bundle => {
      const existing = latestBundlesMap.get(bundle.name);
      if (!existing || bundle.version > existing.version) {
        latestBundlesMap.set(bundle.name, bundle);
      }
    });

    const finalBundles = Array.from(latestBundlesMap.values()).sort((a, b) => {
        // Sort by updated at desc (most recent first)
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    if (isActive !== undefined) {
        return finalBundles.filter(b => b.isActive === isActive);
    }

    return finalBundles;
  }

  async findOne(id: string) {
    const bundle = await this.prisma.bundle.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }

    return bundle;
  }

  async applyBundleToForm(
    bundleId: string,
    formId: string,
    userId: string,
    userRole: RoleType,
  ) {
    if (userRole === RoleType.VIEWER) {
      throw new ForbiddenException('Viewers cannot apply bundles');
    }

    const bundle = await this.findOne(bundleId);
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (
      userRole !== RoleType.SUPER_ADMIN &&
      userRole !== RoleType.ADMIN &&
      form.createdById !== userId
    ) {
      throw new ForbiddenException('You can only edit your own forms');
    }

    const bundleFields = await Promise.all(
      bundle.fields.map((field) =>
        this.prisma.bundleField.create({
          data: {
            bundleId: bundle.id,
            formId: form.id,
            type: field.type,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            validation: field.validation,
            order: field.order,
            options: field.options,
            isPII: field.isPII ?? false, // PDPA flag
          },
        }),
      ),
    );

    return bundleFields;
  }

  async update(id: string, userId: string, updateData: Partial<CreateBundleDto>) {
    const bundle = await this.findOne(id);

    const { fields, ...bundleData } = updateData;

    const latestBundle = await this.prisma.bundle.findFirst({
      where: { name: bundleData.name },
      orderBy: { version: 'desc' },
    });

    const version = latestBundle ? latestBundle.version + 1 : bundle.version + 1;

    const nameChanged = bundleData.name && bundleData.name !== bundle.name;
    const currentOptions = (bundle.options as any) || {};

    await this.prisma.bundle.update({
      where: { id },
      data: { 
        isActive: false,
        options: nameChanged ? { ...currentOptions, deleted: true } : currentOptions,
      },
    });

    const newBundle = await this.prisma.bundle.create({
      data: {
        name: bundleData.name ?? bundle.name,
        description: bundleData.description ?? bundle.description,
        isPII: bundleData.isPII ?? bundle.isPII,
        isActive: bundleData.isActive ?? bundle.isActive,
        options: (bundleData.options as any) ?? bundle.options,

        version,
        createdById: userId,
        fields: {
          create: (fields || bundle.fields).map((field: any) => ({
            type: field.type,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            validation: field.validation,
            order: field.order ?? 0,
            options: field.options,
            isPII: field.isPII ?? false,
          })),
        },
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return newBundle;
  }

  async remove(id: string) {
    const bundle = await this.findOne(id);
    const currentOptions = (bundle.options as any) || {};
    
    await this.prisma.bundle.update({
      where: { id },
      data: { 
        isActive: false,
        options: { ...currentOptions, deleted: true } 
      },
    });

    return { message: 'Bundle deactivated successfully' };
  }
}
