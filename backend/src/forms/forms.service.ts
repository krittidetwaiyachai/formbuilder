import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  OnModuleDestroy,
  OnModuleInit,
  Logger } from
'@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, CollaboratorInvitationStatus } from '@prisma/client';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EncryptionService } from '../common/encryption.service';
import { CreateFormDto, CreateLogicConditionDto, CreateLogicActionDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FormStatus, RoleType } from '@prisma/client';
import { FormDiffHelper } from './helpers/form-diff.helper';
import { FieldUpdateHelper } from './helpers/field-update.helper';
import { MailService } from '../mail/mail.service';
import { createHash, randomBytes } from 'crypto';
import { SystemSettingsService } from '../system-settings/system-settings.service';
@Injectable()export class
FormsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FormsService.name);
  private invitationCleanupTimer: NodeJS.Timeout | null = null;
  private isCleaningExpiredInvitations = false;
  private invitationCompatFields: {
    normalizedEmailField: 'normalizedInvitedEmail' | 'invitedEmailNormalized';
    invitedByField: 'invitedByUserId' | 'invitedById';
  } | null = null;
  constructor(
  private prisma: PrismaService,
  private activityLog: ActivityLogService,
  private encryptionService: EncryptionService,
  private mailService: MailService,
  private systemSettingsService: SystemSettingsService) {}
  onModuleInit() {
    void this.cleanupExpiredInvitations();
    this.invitationCleanupTimer = setInterval(() => {
      void this.cleanupExpiredInvitations();
    }, 30 * 60 * 1000);
  }
  onModuleDestroy() {
    if (this.invitationCleanupTimer) {
      clearInterval(this.invitationCleanupTimer);
      this.invitationCleanupTimer = null;
    }
  }
  async create(userId: string, createFormDto: CreateFormDto) {
    const { fields, conditions, logicRules, folderId, ...formData } = createFormDto;
    const form = await this.prisma.form.create({
      data: {
        ...formData,
        folder: folderId ? { connect: { id: folderId } } : undefined,
        createdBy: {
          connect: { id: userId }
        },
        fields: fields ?
        {
          create: fields.map((field) => ({
            ...field,
            order: field.order ?? 0
          }))
        } :
        undefined,
        conditions: conditions ?
        {
          create: conditions
        } :
        undefined,
        logicRules: logicRules ?
        {
          create: logicRules.map((rule) => ({
            name: rule.name,
            logicType: rule.logicType,
            conditions: {
              create: rule.conditions
            },
            actions: {
              create: rule.actions
            }
          }))
        } :
        undefined
      },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        conditions: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    await this.activityLog.log(form.id, userId, 'CREATED', { title: form.title });
    return form;
  }
  async findAll(userId: string, userRole: RoleType) {
    const where: Prisma.FormWhereInput = {};
    where.OR = [
    { createdById: userId },
    { collaborators: { some: { id: userId } } }];
    const forms = await this.prisma.form.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { responses: true }
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true
          }
        },
        collaborators: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true
          }
        }
      }
    });
    return forms.map((form) => {
      const { _count, ...formData } = form;
      return {
        ...formData,
        responseCount: _count.responses,
        viewCount: form.viewCount || 0
      };
    });
  }
  async findOne(id: string, userId: string, userRole: RoleType) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        conditions: {
          include: {
            sourceField: true,
            targetField: true
          }
        },
        logicRules: {
          include: {
            conditions: true,
            actions: true
          }
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true
          }
        },
        collaborators: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true
          }
        }
      }
    });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (userRole === RoleType.VIEWER && form.status !== FormStatus.PUBLISHED) {
      throw new ForbiddenException('You can only view published forms');
    }
    const isCreator = form.createdById === userId;
    const isCollaborator = form.collaborators?.some((c) => c.id === userId);
    if (
    userRole !== RoleType.SUPER_ADMIN &&
    userRole !== RoleType.ADMIN &&
    !isCreator &&
    !isCollaborator) {
      throw new ForbiddenException('You can only access your own forms or forms shared with you');
    }
    return form;
  }
  async findPublic(id: string, fingerprint?: string, ipAddress?: string, userAgent?: string) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          select: {
            id: true,
            type: true,
            label: true,
            placeholder: true,
            required: true,
            validation: true,
            order: true,
            options: true,
            groupId: true,
            shrink: true,
            isPII: true,
            imageUrl: true,
            imageWidth: true,
            videoUrl: true,
            formId: true
          },
          orderBy: { order: 'asc' }
        },
        conditions: {
          include: {
            sourceField: true,
            targetField: true
          }
        },
        logicRules: {
          include: {
            conditions: true,
            actions: true
          }
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
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
              fingerprint: fingerprint
            }
          }
        });
        if (!existingView) {
          await this.prisma.$transaction([
          this.prisma.formView.create({
            data: {
              formId: id,
              fingerprint: fingerprint,
              ipAddress: ipAddress ? this.encryptionService.hashIpAddress(ipAddress) : null,
              userAgent: userAgent || null
            }
          }),
          this.prisma.form.update({
            where: { id },
            data: {
              viewCount: {
                increment: 1
              }
            }
          })]
          );
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
  updateFormDto: UpdateFormDto) {
    const originalForm = await this.findOne(id, userId, userRole);
    const isCollaborator = originalForm.collaborators?.some((c) => c.id === userId);
    if (originalForm.createdById !== userId && !isCollaborator) {
      throw new ForbiddenException('You can only edit your own forms or forms shared with you');
    }
    const { fields, conditions, logicRules, folderId, ...formData } = updateFormDto;
    const existingSettings =
    originalForm.settings &&
    typeof originalForm.settings === 'object' &&
    !Array.isArray(originalForm.settings) ?
    originalForm.settings as Record<string, unknown> :
    {};
    const incomingSettings =
    formData.settings &&
    typeof formData.settings === 'object' &&
    !Array.isArray(formData.settings) ?
    formData.settings as Record<string, unknown> :
    undefined;
    if (incomingSettings) {
      const existingSecurity =
      existingSettings.security &&
      typeof existingSettings.security === 'object' &&
      !Array.isArray(existingSettings.security) ?
      existingSettings.security as Record<string, unknown> :
      {};
      const incomingSecurity =
      incomingSettings.security &&
      typeof incomingSettings.security === 'object' &&
      !Array.isArray(incomingSettings.security) ?
      incomingSettings.security as Record<string, unknown> :
      undefined;
      formData.settings = {
        ...existingSettings,
        ...incomingSettings,
        security: incomingSecurity ?
        {
          ...existingSecurity,
          ...incomingSecurity
        } :
        existingSettings.security
      } as Prisma.InputJsonValue;
    }
    const activityDetails = FormDiffHelper.calculateDiff(originalForm as unknown as Record<string, unknown>, { fields: fields as any, logicRules: logicRules as any, ...formData } as any);
    try {
      await this.prisma.$transaction(async (prisma) => {
        if (Object.keys(formData).length > 0 || folderId !== undefined) {
          const updateData: Prisma.FormUpdateInput = { ...formData };
          if (folderId !== undefined) {
            updateData.folder = folderId ? { connect: { id: folderId } } : { disconnect: true };
          }
          await prisma.form.update({ where: { id }, data: updateData });
        }
        if (logicRules) await prisma.logicRule.deleteMany({ where: { formId: id } });
        if (fields || conditions) await prisma.fieldCondition.deleteMany({ where: { formId: id } });
        if (fields) {
          const existingFields = await prisma.field.findMany({ where: { formId: id }, select: { id: true } });
          const { toDelete, toCreate, toUpdate } = FieldUpdateHelper.identifyFieldOperations(existingFields, fields);
          if (toDelete.length > 0) {
            await prisma.field.deleteMany({ where: { id: { in: toDelete.map((f) => f.id) } } });
          }
          if (toUpdate.length > 0) {
            await Promise.all(toUpdate.map((field) =>
            prisma.field.update({
              where: { id: field.id },
              data: FieldUpdateHelper.prepareFieldForUpdate(field) as Prisma.FieldUpdateInput
            })
            ));
          }
          if (toCreate.length > 0) {
            await prisma.field.createMany({
              data: toCreate.map((field) => FieldUpdateHelper.prepareFieldForCreate(field, id)) as Prisma.FieldCreateManyInput[]
            });
          }
          const fieldsWithGroups = fields.filter((f) => f.groupId);
          if (fieldsWithGroups.length > 0) {
            await Promise.all(fieldsWithGroups.map((field) =>
            prisma.field.update({ where: { id: field.id }, data: { groupId: field.groupId } })
            ));
          }
        }
        if (logicRules) {
          let validFieldIds: Set<string>;
          if (fields) {
            validFieldIds = new Set(fields.map((f) => f.id));
          } else {
            const currentFields = await prisma.field.findMany({ where: { formId: id }, select: { id: true } });
            validFieldIds = new Set(currentFields.map((f) => f.id));
          }
          for (const rule of logicRules) {
            const validConditions = FieldUpdateHelper.filterValidLogicItems(rule.conditions || [], validFieldIds) as CreateLogicConditionDto[];
            const validActions = FieldUpdateHelper.filterValidLogicItems(rule.actions || [], validFieldIds) as CreateLogicActionDto[];
            await prisma.logicRule.create({
              data: {
                id: rule.id,
                formId: id,
                name: rule.name,
                logicType: rule.logicType,
                conditions: {
                  create: validConditions.map((c) => ({
                    fieldId: c.fieldId || null,
                    operator: c.operator,
                    value: c.value
                  }))
                },
                actions: {
                  create: validActions.map((a) => ({
                    type: a.type,
                    fieldId: a.fieldId || null
                  }))
                }
              }
            });
          }
        }
        if (conditions && conditions.length > 0) {
          await prisma.fieldCondition.createMany({
            data: conditions.map((c) => ({
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
          logicRules: { include: { conditions: true, actions: true } }
        }
      });
      if (activityDetails.changes.length > 0) {
        await this.activityLog.log(id, userId, 'UPDATED', activityDetails as unknown as Prisma.InputJsonValue);
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
      where: { id }
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
      }
    });
    if (!originalForm) {
      throw new NotFoundException('Form not found');
    }
    const isCreator = originalForm.createdById === userId;
    const isCollaborator = originalForm.collaborators?.some((c) => c.id === userId);
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
            score: field.score
          }))
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
          orderBy: { order: 'asc' }
        },
        conditions: true
      }
    });
    return newForm;
  }
  async getCollaboratorAccess(formId: string, requestingUserId: string, requestingUserRole: RoleType) {
    await this.cleanupExpiredInvitations();
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true
          }
        },
        collaborators: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true
          }
        },
        collaboratorInvitations: {
          where: {
            status: CollaboratorInvitationStatus.PENDING,
            expiresAt: { gt: new Date() }
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            invitedEmail: true,
            status: true,
            createdAt: true,
            expiresAt: true
          }
        }
      }
    });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    const isCreator = form.createdById === requestingUserId;
    const isCollaborator = form.collaborators.some((c) => c.id === requestingUserId);
    const isAdmin =
      requestingUserRole === RoleType.SUPER_ADMIN || requestingUserRole === RoleType.ADMIN;
    if (!isCreator && !isCollaborator && !isAdmin) {
      throw new ForbiddenException('You can only access your own forms or forms shared with you');
    }

    return {
      owner: form.createdBy,
      collaborators: form.collaborators,
      pendingInvitations: form.collaboratorInvitations,
      canManage: isCreator || isAdmin
    };
  }
  async addCollaborator(formId: string, email: string, requestingUserId: string, requestingUserRole: RoleType) {
    await this.cleanupExpiredInvitations();
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail) {
      throw new BadRequestException('Email is required');
    }

    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        createdBy: {
          select: { id: true, email: true }
        },
        collaborators: {
          select: { id: true, email: true }
        }
      }
    });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (
      requestingUserRole !== RoleType.SUPER_ADMIN &&
      requestingUserRole !== RoleType.ADMIN &&
      form.createdById !== requestingUserId
    ) {
      throw new ForbiddenException('Only the form owner can add collaborators');
    }
    if (this.normalizeEmail(form.createdBy.email) === normalizedEmail) {
      throw new BadRequestException('User is the owner of the form');
    }
    if (form.collaborators.some((c) => this.normalizeEmail(c.email) === normalizedEmail)) {
      throw new ConflictException('User is already a collaborator');
    }

    const invitedUser = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        photoUrl: true
      }
    });

    const requester = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
      select: { email: true, firstName: true, lastName: true }
    });
    const requesterName =
      requester && (requester.firstName || requester.lastName)
        ? `${requester.firstName || ''} ${requester.lastName || ''}`.trim()
        : undefined;

    await this.prisma.formCollaboratorInvitation.updateMany({
      where: {
        formId,
        [this.getInvitationCompatFields().normalizedEmailField]: normalizedEmail,
        status: CollaboratorInvitationStatus.PENDING
      } as Prisma.FormCollaboratorInvitationWhereInput,
      data: {
        status: CollaboratorInvitationStatus.REVOKED,
        revokedAt: new Date()
      }
    });

    const invitationToken = this.generateInvitationToken();
    const inviteExpiryDays = await this.systemSettingsService.getInviteExpiryDays();
    const invitationData: Record<string, unknown> = {
      formId,
      invitedEmail: email.trim(),
      invitedUserId: invitedUser?.id,
      tokenHash: this.hashInvitationToken(invitationToken),
      status: CollaboratorInvitationStatus.PENDING,
      expiresAt: this.getInvitationExpiryDate(inviteExpiryDays)
    };
    invitationData[this.getInvitationCompatFields().normalizedEmailField] = normalizedEmail;
    invitationData[this.getInvitationCompatFields().invitedByField] = requestingUserId;
    const invitation = await this.prisma.formCollaboratorInvitation.create({
      data: invitationData as Prisma.FormCollaboratorInvitationCreateInput,
      select: {
        id: true,
        invitedEmail: true,
        status: true,
        createdAt: true,
        expiresAt: true
      }
    });

    const inviteResult = await this.mailService.sendCollaboratorInviteEmail({
      to: normalizedEmail,
      formTitle: form.title,
      acceptUrl: this.buildInvitationAcceptUrl(invitationToken),
      invitedByName: requesterName,
      invitedByEmail: requester?.email,
      expiresInDays: inviteExpiryDays
    });
    if (!inviteResult.sent) {
      this.logger.warn(
        `Invitation created for form ${form.id}, but invite email was not sent (mode=${inviteResult.mode})`,
      );
    }

    await this.activityLog.log(formId, requestingUserId, 'COLLABORATOR_INVITED', {
      email: normalizedEmail
    });
    return {
      message: 'Invitation sent successfully',
      invitationEmailSent: inviteResult.sent,
      invitationEmailMode: inviteResult.mode,
      invitation
    };
  }
  async resendCollaboratorInvitation(
    formId: string,
    invitationId: string,
    requestingUserId: string,
    requestingUserRole: RoleType,
  ) {
    await this.cleanupExpiredInvitations();
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      select: { id: true, title: true, createdById: true }
    });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (
      requestingUserRole !== RoleType.SUPER_ADMIN &&
      requestingUserRole !== RoleType.ADMIN &&
      form.createdById !== requestingUserId
    ) {
      throw new ForbiddenException('Only the form owner can add collaborators');
    }

    const invitation = await this.prisma.formCollaboratorInvitation.findFirst({
      where: {
        id: invitationId,
        formId,
        status: CollaboratorInvitationStatus.PENDING
      },
      select: {
        id: true,
        invitedEmail: true
      }
    });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const invitationToken = this.generateInvitationToken();
    const inviteExpiryDays = await this.systemSettingsService.getInviteExpiryDays();
    const invitationUpdateData: Record<string, unknown> = {
      tokenHash: this.hashInvitationToken(invitationToken),
      lastSentAt: new Date(),
      resendCount: { increment: 1 },
      expiresAt: this.getInvitationExpiryDate(inviteExpiryDays)
    };
    invitationUpdateData[this.getInvitationCompatFields().invitedByField] = requestingUserId;
    const updatedInvitation = await this.prisma.formCollaboratorInvitation.update({
      where: { id: invitation.id },
      data: invitationUpdateData as Prisma.FormCollaboratorInvitationUpdateInput,
      select: {
        id: true,
        invitedEmail: true,
        status: true,
        createdAt: true,
        expiresAt: true
      }
    });

    const requester = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
      select: { email: true, firstName: true, lastName: true }
    });
    const requesterName =
      requester && (requester.firstName || requester.lastName)
        ? `${requester.firstName || ''} ${requester.lastName || ''}`.trim()
        : undefined;

    const inviteResult = await this.mailService.sendCollaboratorInviteEmail({
      to: invitation.invitedEmail,
      formTitle: form.title,
      acceptUrl: this.buildInvitationAcceptUrl(invitationToken),
      invitedByName: requesterName,
      invitedByEmail: requester?.email,
      expiresInDays: inviteExpiryDays
    });

    return {
      message: 'Invitation resent successfully',
      invitationEmailSent: inviteResult.sent,
      invitationEmailMode: inviteResult.mode,
      invitation: updatedInvitation
    };
  }
  async revokeCollaboratorInvitation(
    formId: string,
    invitationId: string,
    requestingUserId: string,
    requestingUserRole: RoleType,
  ) {
    await this.cleanupExpiredInvitations();
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      select: { id: true, createdById: true }
    });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (
      requestingUserRole !== RoleType.SUPER_ADMIN &&
      requestingUserRole !== RoleType.ADMIN &&
      form.createdById !== requestingUserId
    ) {
      throw new ForbiddenException('Only the form owner can add collaborators');
    }

    const invitation = await this.prisma.formCollaboratorInvitation.findFirst({
      where: {
        id: invitationId,
        formId,
        status: CollaboratorInvitationStatus.PENDING
      },
      select: { id: true }
    });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.prisma.formCollaboratorInvitation.update({
      where: { id: invitation.id },
      data: {
        status: CollaboratorInvitationStatus.REVOKED,
        revokedAt: new Date()
      }
    });

    return { message: 'Invitation revoked successfully' };
  }
  async acceptCollaboratorInvitation(token: string, userId: string, userEmail: string) {
    const normalizedEmail = this.normalizeEmail(userEmail);
    if (!token || token.trim().length === 0) {
      throw new BadRequestException('Invitation token is required');
    }
    const tokenHash = this.hashInvitationToken(token);

    const invitation = await this.prisma.formCollaboratorInvitation.findUnique({
      where: { tokenHash },
      include: {
        form: {
          select: {
            id: true,
            createdById: true,
            createdBy: { select: { email: true } },
            collaborators: { select: { id: true, email: true } }
          }
        }
      }
    });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.revokedAt || invitation.status === CollaboratorInvitationStatus.REVOKED) {
      throw new BadRequestException('Invitation was revoked');
    }
    if (invitation.status === CollaboratorInvitationStatus.EXPIRED) {
      throw new BadRequestException('Invitation has expired');
    }
    if (invitation.status === CollaboratorInvitationStatus.ACCEPTED) {
      throw new BadRequestException('Invitation has already been accepted');
    }
    if (invitation.status !== CollaboratorInvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is no longer valid');
    }
    if (invitation.expiresAt <= new Date()) {
      await this.prisma.formCollaboratorInvitation.update({
        where: { id: invitation.id },
        data: { status: CollaboratorInvitationStatus.EXPIRED }
      });
      throw new BadRequestException('Invitation has expired');
    }
    const invitedEmailNormalized = (
      invitation as unknown as Record<string, unknown>
    )[this.getInvitationCompatFields().normalizedEmailField];
    if (this.normalizeEmail(String(invitedEmailNormalized || '')) !== normalizedEmail) {
      throw new ForbiddenException('This invitation was sent to a different email');
    }

    if (this.normalizeEmail(invitation.form.createdBy.email) === normalizedEmail) {
      throw new BadRequestException('User is the owner of the form');
    }

    const isAlreadyCollaborator = invitation.form.collaborators.some(
      (collaborator) => collaborator.id === userId || this.normalizeEmail(collaborator.email) === normalizedEmail,
    );
    if (!isAlreadyCollaborator) {
      await this.prisma.form.update({
        where: { id: invitation.formId },
        data: {
          collaborators: {
            connect: { id: userId }
          }
        }
      });
      await this.activityLog.log(invitation.formId, userId, 'COLLABORATOR_ADDED', {
        acceptedFromInvitation: true
      });
    }

    await this.prisma.formCollaboratorInvitation.update({
      where: { id: invitation.id },
      data: {
        status: CollaboratorInvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
        invitedUserId: userId
      }
    });

    return {
      message: 'Invitation accepted successfully',
      formId: invitation.formId
    };
  }
  async removeCollaborator(formId: string, userIdToRemove: string, requestingUserId: string, userRole: RoleType) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { collaborators: true }
    });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (
    userRole !== RoleType.SUPER_ADMIN &&
    userRole !== RoleType.ADMIN &&
    form.createdById !== requestingUserId &&
    userIdToRemove !== requestingUserId) {
      throw new ForbiddenException('You do not have permission to remove collaborators');
    }
    const removedCollaborator = form.collaborators.find((collaborator) => collaborator.id === userIdToRemove);
    await this.prisma.form.update({
      where: { id: formId },
      data: {
        collaborators: {
          disconnect: { id: userIdToRemove }
        }
      }
    });
    await this.activityLog.log(formId, requestingUserId, 'COLLABORATOR_REMOVED', {
      removedBy: requestingUserId,
      removedUserId: userIdToRemove,
      removedUserEmail: removedCollaborator?.email ?? null,
      removedUserName:
        removedCollaborator && (removedCollaborator.firstName || removedCollaborator.lastName)
          ? `${removedCollaborator.firstName || ''} ${removedCollaborator.lastName || ''}`.trim()
          : null
    });
    return { message: 'Collaborator removed successfully' };
  }
  private normalizeEmail(email?: string | null) {
    return email?.trim().toLowerCase() || '';
  }
  private hashInvitationToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
  private generateInvitationToken() {
    return randomBytes(32).toString('hex');
  }
  private getInvitationExpiryDate(expiryDays: number) {
    const safeDays = Number.isFinite(expiryDays) && expiryDays > 0 ? expiryDays : 3;
    return new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000);
  }
  private async cleanupExpiredInvitations() {
    if (this.isCleaningExpiredInvitations) {
      return;
    }
    this.isCleaningExpiredInvitations = true;
    try {
      const result = await this.prisma.formCollaboratorInvitation.deleteMany({
        where: {
          expiresAt: { lte: new Date() },
          status: {
            in: [
            CollaboratorInvitationStatus.PENDING,
            CollaboratorInvitationStatus.EXPIRED,
            CollaboratorInvitationStatus.REVOKED]
          }
        }
      });
      if (result.count > 0) {
        this.logger.log(`Deleted ${result.count} expired collaborator invitations`);
      }
    } catch (error) {
      this.logger.error('Failed to clean up expired collaborator invitations', error as Error);
    } finally {
      this.isCleaningExpiredInvitations = false;
    }
  }
  private buildInvitationAcceptUrl(token: string) {
    const frontendUrl = this.getPrimaryFrontendUrl();
    const encodedToken = encodeURIComponent(token);
    return `${frontendUrl}/dashboard?inviteToken=${encodedToken}`;
  }
  private getPrimaryFrontendUrl() {
    const raw = process.env.FRONTEND_URL;
    if (!raw) {
      return 'http://localhost:5173';
    }
    return raw.
    split(',').
    map((value) => value.trim().replace(/^"(.*)"$/, '$1')).
    find(Boolean) || 'http://localhost:5173';
  }
  private getInvitationCompatFields() {
    if (this.invitationCompatFields) {
      return this.invitationCompatFields;
    }
    const models = (
      Prisma as unknown as {
        dmmf?: {datamodel?: {models?: Array<{name: string;fields?: Array<{name: string}>}>};};
      }
    ).dmmf?.
    datamodel?.
    models || [];
    const invitationModel = models.find((model) => model.name === 'FormCollaboratorInvitation');
    const fieldNames = new Set((invitationModel?.fields || []).map((field) => field.name));
    this.invitationCompatFields = {
      normalizedEmailField:
      fieldNames.has('normalizedInvitedEmail') ?
      'normalizedInvitedEmail' :
      'invitedEmailNormalized',
      invitedByField:
      fieldNames.has('invitedByUserId') ?
      'invitedByUserId' :
      'invitedById'
    };
    return this.invitationCompatFields;
  }
}
