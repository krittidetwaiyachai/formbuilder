import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EncryptionService } from '../common/encryption.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FormStatus, RoleType } from '@prisma/client';
import { FormDiffHelper } from './helpers/form-diff.helper';
import { FieldUpdateHelper } from './helpers/field-update.helper';

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
    private encryptionService: EncryptionService,
  ) {}

  async create(userId: string, createFormDto: CreateFormDto) {
    const { fields, conditions, logicRules, folderId, ...formData } = createFormDto;

    const form = await this.prisma.form.create({
      data: {
        ...formData,
        folder: folderId ? { connect: { id: folderId } } : undefined,
        createdBy: {
          connect: { id: userId },
        },
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
        logicRules: logicRules
          ? {
              create: logicRules.map((rule) => ({
                name: rule.name,
                logicType: rule.logicType,
                conditions: {
                  create: rule.conditions,
                },
                actions: {
                  create: rule.actions,
                },
              })),
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


    await this.activityLog.log(form.id, userId, 'CREATED', { title: form.title });

    return form;
  }

  async findAll(userId: string, userRole: RoleType) {
    const where: any = {};

    
    where.OR = [
      { createdById: userId },
      { collaborators: { some: { id: userId } } }
    ];

    const forms = await this.prisma.form.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { responses: true },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          }
        },
        collaborators: {
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                photoUrl: true,
            }
        }
      },
    });

    
    return forms.map((form) => {
      const { _count, ...formData } = form;
      return {
        ...formData,
        responseCount: _count.responses,
        viewCount: (form as any).viewCount || 0,
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
        logicRules: {
          include: {
            conditions: true,
            actions: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        collaborators: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          }
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    

    
    
    if (
      userRole === RoleType.VIEWER &&
      form.status !== FormStatus.PUBLISHED
    ) {
      throw new ForbiddenException('You can only view published forms');
    }

    
    
    
    

    const isCreator = form.createdById === userId;
    const isCollaborator = form.collaborators?.some(c => c.id === userId);

    
    
    
    
    
    
    
    

    if (
      userRole !== RoleType.VIEWER &&
      !isCreator &&
      !isCollaborator
    ) {
      throw new ForbiddenException('You can only access your own forms or forms shared with you');
    }

    return form;
  }

  async findPublic(id: string, fingerprint?: string, ipAddress?: string, userAgent?: string) {
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
        logicRules: {
          include: {
            conditions: true,
            actions: true,
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

      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.status !== FormStatus.PUBLISHED) {
      throw new ForbiddenException('Form is not published');
    }

    
    if (fingerprint) {
      try {
        
        const existingView = await this.prisma.formView.findUnique({
          where: {
            formId_fingerprint: {
              formId: id,
              fingerprint: fingerprint,
            },
          },
        });

        
        if (!existingView) {
          await this.prisma.$transaction([
            this.prisma.formView.create({
              data: {
                formId: id,
                fingerprint: fingerprint,
                ipAddress: ipAddress ? this.encryptionService.hashIpAddress(ipAddress) : null,
                userAgent: userAgent || null,
              },
            }),
            this.prisma.form.update({
              where: { id },
              data: {
                viewCount: {
                  increment: 1,
                },
              },
            }),
          ]);
        }
      } catch {
        
      }
    }

    return form;
  }

  async update(
    id: string,
    userId: string,
    userRole: RoleType,
    updateFormDto: UpdateFormDto,
  ) {
    const originalForm = await this.findOne(id, userId, userRole);
    const isCollaborator = originalForm.collaborators?.some(c => c.id === userId);

    if (originalForm.createdById !== userId && !isCollaborator) {
      throw new ForbiddenException('You can only edit your own forms or forms shared with you');
    }

    const { fields, conditions, logicRules, ...formData } = updateFormDto as any;

    
    const activityDetails = FormDiffHelper.calculateDiff(originalForm, { fields, logicRules, ...formData });

    
    try {
        await this.prisma.$transaction(async (prisma) => {
            
            if (Object.keys(formData).length > 0) {
                 await prisma.form.update({ where: { id }, data: formData });
            }

            
            if (logicRules) await prisma.logicRule.deleteMany({ where: { formId: id } });
            if (fields || conditions) await prisma.fieldCondition.deleteMany({ where: { formId: id } });

            
            if (fields) {
                const existingFields = await prisma.field.findMany({ where: { formId: id }, select: { id: true } });
                const { toDelete, toCreate, toUpdate } = FieldUpdateHelper.identifyFieldOperations(existingFields, fields);

                if (toDelete.length > 0) {
                    await prisma.field.deleteMany({ where: { id: { in: toDelete.map(f => f.id) } } });
                }

                if (toUpdate.length > 0) {
                    await Promise.all(toUpdate.map(field => 
                        prisma.field.update({
                            where: { id: field.id },
                            data: FieldUpdateHelper.prepareFieldForUpdate(field)
                        })
                    ));
                }

                if (toCreate.length > 0) {
                    await prisma.field.createMany({
                        data: toCreate.map(field => FieldUpdateHelper.prepareFieldForCreate(field, id)) as any
                    });
                }

                
                const fieldsWithGroups = fields.filter((f) => f.groupId);
                if (fieldsWithGroups.length > 0) {
                    await Promise.all(fieldsWithGroups.map(field => 
                        prisma.field.update({ where: { id: field.id }, data: { groupId: field.groupId } })
                    ));
                }
            }

            
            if (logicRules) {
                let validFieldIds: Set<string>;
                if (fields) {
                    validFieldIds = new Set(fields.map((f: any) => f.id));
                } else {
                    const currentFields = await prisma.field.findMany({ where: { formId: id }, select: { id: true } });
                    validFieldIds = new Set(currentFields.map(f => f.id));
                }

                for (const rule of logicRules) {
                    const validConditions = FieldUpdateHelper.filterValidLogicItems(rule.conditions, validFieldIds);
                    const validActions = FieldUpdateHelper.filterValidLogicItems(rule.actions, validFieldIds);

                    await prisma.logicRule.create({
                        data: {
                            id: rule.id,
                            formId: id,
                            name: rule.name,
                            logicType: rule.logicType,
                            conditions: {
                                create: validConditions.map((c: any) => ({
                                    id: c.id,
                                    fieldId: c.fieldId || null,
                                    operator: c.operator,
                                    value: c.value,
                                })),
                            },
                            actions: {
                                create: validActions.map((a: any) => ({
                                    id: a.id,
                                    type: a.type,
                                    fieldId: a.fieldId || null,
                                })),
                            },
                        },
                    });
                }
            }

            
            if (conditions && conditions.length > 0) {
                await prisma.fieldCondition.createMany({
                    data: conditions.map((c: any) => ({
                        sourceFieldId: c.sourceFieldId,
                        targetFieldId: c.targetFieldId,
                        operator: c.operator,
                        value: c.value,
                        action: c.action,
                        formId: id
                    }))
                });
            }
        });

        
        const updatedForm = await this.prisma.form.findUnique({
             where: { id },
             include: {
                 fields: { orderBy: { order: 'asc' } },
                 conditions: true,
                 logicRules: { include: { conditions: true, actions: true } },
             }
        });

        
        if (activityDetails.changes.length > 0) {
            await this.activityLog.log(id, userId, 'UPDATED', activityDetails);
        }

        return updatedForm;

    } catch (error) {
      this.logger.error('Error updating form:', error);
      throw error;
    }
  }

  async remove(id: string, userId: string, userRole: RoleType) {
    const form = await this.findOne(id, userId, userRole);

    
    
    
    
    
    
    if (form.createdById !== userId) {
      throw new ForbiddenException('You can only delete your own forms');
    }

    await this.activityLog.log(id, userId, 'DELETED', { formId: id });

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
        collaborators: { select: { id: true } } 
      },
      
    });

    if (!originalForm) {
      throw new NotFoundException('Form not found');
    }

    
    const isCreator = originalForm.createdById === userId;
    const isCollaborator = originalForm.collaborators?.some(c => c.id === userId);

    if (!isCreator && !isCollaborator) {
         throw new ForbiddenException('You can only clone your own forms or forms shared with you');
    }



    const newForm = await this.prisma.form.create({
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
            validation: field.validation || undefined,
            order: field.order,
            options: field.options || undefined,
            correctAnswer: field.correctAnswer,
            score: field.score,
          })),
        },
        conditions: {
          create: originalForm.conditions.map((condition) => ({
            sourceFieldId: '', 
            targetFieldId: '', 
            operator: condition.operator,
            value: condition.value,
            action: condition.action
          })) 
          
          
          
        }
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        conditions: true,
      },
    });

    return newForm;
  }

  async addCollaborator(formId: string, email: string) {
    
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { collaborators: true },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    
    const isAlreadyCollaborator = form.collaborators.some(c => c.id === user.id);
    if (isAlreadyCollaborator) {
      return { message: 'User is already a collaborator' };
    }

    
    if (form.createdById === user.id) {
        return { message: 'User is the owner of the form' };
    }

    
    await this.prisma.form.update({
      where: { id: formId },
      data: {
        collaborators: {
          connect: { id: user.id },
        },
      },
    });

    await this.activityLog.log(formId, user.id, 'COLLABORATOR_ADDED', { email });

    return { message: 'Collaborator added successfully', user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, photoUrl: user.photoUrl } };
  }

  async removeCollaborator(formId: string, userIdToRemove: string, requestingUserId: string, userRole: RoleType) {
    const form = await this.prisma.form.findUnique({
        where: { id: formId },
        include: { collaborators: true },
    });

    if (!form) {
        throw new NotFoundException('Form not found');
    }

    
    
    if (
        userRole !== RoleType.SUPER_ADMIN && 
        userRole !== RoleType.ADMIN && 
        form.createdById !== requestingUserId &&
        userIdToRemove !== requestingUserId 
    ) {
        throw new ForbiddenException('You do not have permission to remove collaborators');
    }

    await this.prisma.form.update({
        where: { id: formId },
        data: {
            collaborators: {
                disconnect: { id: userIdToRemove },
            },
        },
    });

    await this.activityLog.log(formId, userIdToRemove, 'COLLABORATOR_REMOVED', { removedBy: requestingUserId });

    return { message: 'Collaborator removed successfully' };
  }
}
