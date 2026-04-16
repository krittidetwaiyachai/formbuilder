import {
  Injectable,
  NotFoundException,
  ForbiddenException } from
'@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBundleDto, CreateBundleFieldDto } from './dto/create-bundle.dto';
import { RoleType, Prisma } from '@prisma/client';
interface BundleOptions {
  deleted?: boolean;
}
@Injectable()export class
BundlesService {
  constructor(private prisma: PrismaService) {}
  async create(userId: string, createBundleDto: CreateBundleDto) {
    const { fields, ...bundleData } = createBundleDto;
    const latestBundle = await this.prisma.bundle.findFirst({
      where: { name: bundleData.name },
      orderBy: { version: 'desc' }
    });
    const version = latestBundle ? latestBundle.version + 1 : 1;
    const bundle = await this.prisma.bundle.create({
      data: {
        ...bundleData,
        version,
        createdBy: { connect: { id: userId } },
        options: bundleData.options as Prisma.InputJsonValue,
        fields: {
          create: fields.map((field) => ({
            ...field,
            validation: field.validation as Prisma.InputJsonValue,
            options: field.options as Prisma.InputJsonValue,
            order: field.order ?? 0
          }))
        }
      },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    });
    return bundle;
  }
  async findAll(isActive?: boolean) {
    const bundles = await this.prisma.bundle.findMany({
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            fields: true
          }
        }
      },
      orderBy: [
      { name: 'asc' },
      { version: 'desc' }]
    });
    let allBundles = bundles.filter((b) => !(b.options as unknown as BundleOptions)?.deleted);
    const latestBundlesMap = new Map<string, typeof bundles[0]>();
    allBundles.forEach((bundle) => {
      const existing = latestBundlesMap.get(bundle.name);
      if (!existing || bundle.version > existing.version) {
        latestBundlesMap.set(bundle.name, bundle);
      }
    });
    const finalBundles = Array.from(latestBundlesMap.values()).sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    if (isActive !== undefined) {
      return finalBundles.filter((b) => b.isActive === isActive);
    }
    return finalBundles;
  }
  async findOne(id: string) {
    const bundle = await this.prisma.bundle.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        }
      }
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
  userRole: RoleType)
  {
    if (userRole === RoleType.VIEWER) {
      throw new ForbiddenException('Viewers cannot apply bundles');
    }
    const bundle = await this.findOne(bundleId);
    const form = await this.prisma.form.findUnique({
      where: { id: formId }
    });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (
    userRole !== RoleType.SUPER_ADMIN &&
    userRole !== RoleType.ADMIN &&
    form.createdById !== userId)
    {
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
          isPII: field.isPII ?? false
        }
      })
      )
    );
    return bundleFields;
  }
  async update(id: string, _userId: string, updateData: Partial<CreateBundleDto>) {
    const bundle = await this.findOne(id);
    const { fields, ...bundleData } = updateData;
    const nextName = bundleData.name ?? bundle.name;

    const latestBundle = await this.prisma.bundle.findFirst({
      where: {
        name: nextName,
        id: { not: id }
      },
      orderBy: { version: 'desc' }
    });

    const version = latestBundle ? latestBundle.version + 1 : bundle.version + 1;

    type UpsertBundleField = CreateBundleFieldDto & { id?: string };
    const incomingFields = (fields as UpsertBundleField[] | undefined)?.map((field, index) => ({
      ...field,
      order: field.order ?? index
    }));

    const updatedBundle = await this.prisma.$transaction(async (tx) => {
      await tx.bundle.update({
        where: { id },
        data: {
          name: nextName,
          description: bundleData.description ?? bundle.description,
          isPII: bundleData.isPII ?? bundle.isPII,
          isActive: bundleData.isActive ?? bundle.isActive,
          options: (bundleData.options as Prisma.InputJsonValue) ?? (bundle.options as Prisma.InputJsonValue),
          version
        }
      });

      if (incomingFields) {
        const existingFieldIds = new Set(bundle.fields.map((field) => field.id));
        const retainedFieldIds = new Set<string>();

        for (const field of incomingFields) {
          const data = {
            type: field.type,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required ?? false,
            validation: field.validation as Prisma.InputJsonValue,
            order: field.order ?? 0,
            options: field.options as Prisma.InputJsonValue,
            isPII: field.isPII ?? false,
            imageUrl: field.imageUrl,
            imageWidth: field.imageWidth,
            videoUrl: field.videoUrl
          };

          if (field.id && existingFieldIds.has(field.id)) {
            retainedFieldIds.add(field.id);
            await tx.bundleField.update({
              where: { id: field.id },
              data
            });
            continue;
          }

          await tx.bundleField.create({
            data: {
              ...(field.id ? { id: field.id } : {}),
              bundleId: id,
              ...data
            }
          });
        }

        const deletedFieldIds = bundle.fields.
        filter((field) => !retainedFieldIds.has(field.id)).
        map((field) => field.id);

        if (deletedFieldIds.length > 0) {
          await tx.bundleField.deleteMany({
            where: {
              bundleId: id,
              id: { in: deletedFieldIds }
            }
          });
        }
      }

      return tx.bundle.findUnique({
        where: { id },
        include: {
          fields: {
            orderBy: { order: 'asc' }
          }
        }
      });
    });

    if (!updatedBundle) {
      throw new NotFoundException('Bundle not found');
    }

    return updatedBundle;
  }
  async remove(id: string) {
    const bundle = await this.findOne(id);
    const relatedBundles = await this.prisma.bundle.findMany({
      where: { name: bundle.name },
      select: { id: true, options: true },
    });

    await this.prisma.$transaction(
      relatedBundles.map((item) => {
        const currentOptions = (item.options as unknown as BundleOptions) || {};
        return this.prisma.bundle.update({
          where: { id: item.id },
          data: {
            isActive: false,
            options: { ...currentOptions, deleted: true } as Prisma.InputJsonValue,
          },
        });
      }),
    );

    return { message: 'Bundle deactivated successfully' };
  }
}
