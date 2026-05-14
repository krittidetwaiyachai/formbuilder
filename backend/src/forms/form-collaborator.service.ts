import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
  OnModuleDestroy } from
'@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, CollaboratorInvitationStatus, RoleType } from '@prisma/client';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { MailService } from '../mail/mail.service';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { createHash, randomBytes } from 'crypto';
@Injectable()export class
FormCollaboratorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FormCollaboratorService.name);
  private invitationCleanupTimer: NodeJS.Timeout | null = null;
  private isCleaningExpiredInvitations = false;
  private invitationCompatFields: {
    normalizedEmailField: 'normalizedInvitedEmail' | 'invitedEmailNormalized';
    invitedByField: 'invitedByUserId' | 'invitedById';
  } | null = null;
  constructor(
  private prisma: PrismaService,
  private activityLog: ActivityLogService,
  private mailService: MailService,
  private systemSettingsService: SystemSettingsService)
  {}
  onModuleInit() {
    void this.cleanupExpiredInvitations();
    this.invitationCleanupTimer = setInterval(
      () => {
        void this.cleanupExpiredInvitations();
      },
      30 * 60 * 1000
    );
  }
  onModuleDestroy() {
    if (this.invitationCleanupTimer) {
      clearInterval(this.invitationCleanupTimer);
      this.invitationCleanupTimer = null;
    }
  }
  async getCollaboratorAccess(
  formId: string,
  requestingUserId: string,
  requestingUserRole: RoleType)
  {
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
    const isCollaborator = form.collaborators.some(
      (c) => c.id === requestingUserId
    );
    const isAdmin =
    requestingUserRole === RoleType.SUPER_ADMIN ||
    requestingUserRole === RoleType.ADMIN;
    if (!isCreator && !isCollaborator && !isAdmin) {
      throw new ForbiddenException(
        'You can only access your own forms or forms shared with you'
      );
    }
    return {
      owner: form.createdBy,
      collaborators: form.collaborators,
      pendingInvitations: form.collaboratorInvitations,
      canManage: isCreator || isAdmin
    };
  }
  async addCollaborator(
  formId: string,
  email: string,
  requestingUserId: string,
  requestingUserRole: RoleType)
  {
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
    form.createdById !== requestingUserId)
    {
      throw new ForbiddenException('Only the form owner can add collaborators');
    }
    if (this.normalizeEmail(form.createdBy.email) === normalizedEmail) {
      throw new BadRequestException('User is the owner of the form');
    }
    if (
    form.collaborators.some(
      (c) => this.normalizeEmail(c.email) === normalizedEmail
    ))
    {
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
    requester && (requester.firstName || requester.lastName) ?
    `${requester.firstName || ''} ${requester.lastName || ''}`.trim() :
    undefined;
    await this.prisma.formCollaboratorInvitation.updateMany({
      where: {
        formId,
        [this.getInvitationCompatFields().normalizedEmailField]:
        normalizedEmail,
        status: CollaboratorInvitationStatus.PENDING
      } as Prisma.FormCollaboratorInvitationWhereInput,
      data: {
        status: CollaboratorInvitationStatus.REVOKED,
        revokedAt: new Date()
      }
    });
    const invitationToken = this.generateInvitationToken();
    const inviteExpiryDays =
    await this.systemSettingsService.getInviteExpiryDays();
    const invitationData: Record<string, unknown> = {
      formId,
      invitedEmail: email.trim(),
      invitedUserId: invitedUser?.id,
      tokenHash: this.hashInvitationToken(invitationToken),
      status: CollaboratorInvitationStatus.PENDING,
      expiresAt: this.getInvitationExpiryDate(inviteExpiryDays)
    };
    invitationData[this.getInvitationCompatFields().normalizedEmailField] =
    normalizedEmail;
    invitationData[this.getInvitationCompatFields().invitedByField] =
    requestingUserId;
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
        `Invitation created for form ${form.id}, but invite email was not sent (mode=${inviteResult.mode})`
      );
    }
    await this.activityLog.log(
      formId,
      requestingUserId,
      'COLLABORATOR_INVITED',
      {
        email: normalizedEmail
      }
    );
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
  requestingUserRole: RoleType)
  {
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
    form.createdById !== requestingUserId)
    {
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
    const inviteExpiryDays =
    await this.systemSettingsService.getInviteExpiryDays();
    const invitationUpdateData: Record<string, unknown> = {
      tokenHash: this.hashInvitationToken(invitationToken),
      lastSentAt: new Date(),
      resendCount: { increment: 1 },
      expiresAt: this.getInvitationExpiryDate(inviteExpiryDays)
    };
    invitationUpdateData[this.getInvitationCompatFields().invitedByField] =
    requestingUserId;
    const updatedInvitation =
    await this.prisma.formCollaboratorInvitation.update({
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
    requester && (requester.firstName || requester.lastName) ?
    `${requester.firstName || ''} ${requester.lastName || ''}`.trim() :
    undefined;
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
  requestingUserRole: RoleType)
  {
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
    form.createdById !== requestingUserId)
    {
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
  async acceptCollaboratorInvitation(
  token: string,
  userId: string,
  userEmail: string)
  {
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
    if (
    invitation.revokedAt ||
    invitation.status === CollaboratorInvitationStatus.REVOKED)
    {
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
    invitation as unknown as Record<string, unknown>)[
    this.getInvitationCompatFields().normalizedEmailField];
    if (
    this.normalizeEmail(String(invitedEmailNormalized || '')) !==
    normalizedEmail)
    {
      throw new ForbiddenException(
        'This invitation was sent to a different email'
      );
    }
    if (
    this.normalizeEmail(invitation.form.createdBy.email) === normalizedEmail)
    {
      throw new BadRequestException('User is the owner of the form');
    }
    const isAlreadyCollaborator = invitation.form.collaborators.some(
      (collaborator) =>
      collaborator.id === userId ||
      this.normalizeEmail(collaborator.email) === normalizedEmail
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
      await this.activityLog.log(
        invitation.formId,
        userId,
        'COLLABORATOR_ADDED',
        {
          acceptedFromInvitation: true
        }
      );
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
  async removeCollaborator(
  formId: string,
  userIdToRemove: string,
  requestingUserId: string,
  userRole: RoleType)
  {
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
    userIdToRemove !== requestingUserId)
    {
      throw new ForbiddenException(
        'You do not have permission to remove collaborators'
      );
    }
    const removedCollaborator = form.collaborators.find(
      (collaborator) => collaborator.id === userIdToRemove
    );
    await this.prisma.form.update({
      where: { id: formId },
      data: {
        collaborators: {
          disconnect: { id: userIdToRemove }
        }
      }
    });
    await this.activityLog.log(
      formId,
      requestingUserId,
      'COLLABORATOR_REMOVED',
      {
        removedBy: requestingUserId,
        removedUserId: userIdToRemove,
        removedUserEmail: removedCollaborator?.email ?? null,
        removedUserName:
        removedCollaborator && (
        removedCollaborator.firstName || removedCollaborator.lastName) ?
        `${removedCollaborator.firstName || ''} ${removedCollaborator.lastName || ''}`.trim() :
        null
      }
    );
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
    const safeDays =
    Number.isFinite(expiryDays) && expiryDays > 0 ? expiryDays : 3;
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
        this.logger.log(
          `Deleted ${result.count} expired collaborator invitations`
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to clean up expired collaborator invitations',
        error as Error
      );
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
    return (
      raw.
      split(',').
      map((value) => value.trim().replace(/^"(.*)"$/, '$1')).
      find(Boolean) || 'http://localhost:5173');
  }
  private getInvitationCompatFields() {
    if (this.invitationCompatFields) {
      return this.invitationCompatFields;
    }
    const models =
    (
    Prisma as unknown as {
      dmmf?: {
        datamodel?: {
          models?: Array<{
            name: string;
            fields?: Array<{name: string;}>;
          }>;
        };
      };
    }).
    dmmf?.datamodel?.models || [];
    const invitationModel = models.find(
      (model) => model.name === 'FormCollaboratorInvitation'
    );
    const fieldNames = new Set(
      (invitationModel?.fields || []).map((field) => field.name)
    );
    this.invitationCompatFields = {
      normalizedEmailField: fieldNames.has('normalizedInvitedEmail') ?
      'normalizedInvitedEmail' :
      'invitedEmailNormalized',
      invitedByField: fieldNames.has('invitedByUserId') ?
      'invitedByUserId' :
      'invitedById'
    };
    return this.invitationCompatFields;
  }
}