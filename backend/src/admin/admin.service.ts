import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, RoleType } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { SystemSettingsService } from '../system-settings/system-settings.service';
@Injectable()export class
AdminService {
  constructor(
  private prisma: PrismaService,
  private readonly mailService: MailService,
  private readonly systemSettingsService: SystemSettingsService)
  {}
  async getStats() {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const [userCount, formCount, submissionCount, thisMonthUsers, lastMonthUsers, recentActivity] = await Promise.all([
    this.prisma.user.count(),
    this.prisma.form.count(),
    this.prisma.formResponse.count(),
    this.prisma.user.count({
      where: {
        createdAt: { gte: startOfThisMonth }
      }
    }),
    this.prisma.user.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfThisMonth
        }
      }
    }),
    this.prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true
          }
        },
        form: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })]
    );
    let growthRate = 0;
    if (lastMonthUsers > 0) {
      growthRate = (thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100;
    } else if (thisMonthUsers > 0) {
      growthRate = 100;
    }
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const monthlyStatsRaw = await this.prisma.formResponse.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        _all: true
      }
    });
    const monthlyStats = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${months[d.getMonth()]} ${d.getFullYear()}`;
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = monthlyStatsRaw.filter(
        (item) => item.createdAt >= monthStart && item.createdAt <= monthEnd
      ).length;
      monthlyStats.unshift({
        name: monthKey,
        submissions: count
      });
    }
    const monthlyFormsRaw = await this.prisma.form.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        _all: true
      }
    });
    const monthlyForms = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${months[d.getMonth()]} ${d.getFullYear()}`;
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = monthlyFormsRaw.filter(
        (item) => item.createdAt >= monthStart && item.createdAt <= monthEnd
      ).length;
      monthlyForms.unshift({
        name: monthKey,
        value: count
      });
    }
    const popularFormsRaw = await this.prisma.formResponse.groupBy({
      by: ['formId'],
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          formId: 'desc'
        }
      },
      take: 5
    });
    const popularForms = await Promise.all(
      popularFormsRaw.map(async (item) => {
        const form = await this.prisma.form.findUnique({
          where: { id: item.formId },
          select: { title: true }
        });
        return {
          id: item.formId,
          title: form?.title || 'Unknown Form',
          submissions: item._count._all
        };
      })
    );
    return {
      totalUsers: userCount,
      totalForms: formCount,
      totalSubmissions: submissionCount,
      growthRate,
      recentActivity,
      monthlyStats,
      monthlyForms,
      popularForms
    };
  }
  async findAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    const { page = 1, limit = 10, search, role } = params;
    const searchTerm = search?.trim();
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};
    if (searchTerm) {
      where.OR = [
      { id: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
      { firstName: { contains: searchTerm, mode: 'insensitive' } },
      { lastName: { contains: searchTerm, mode: 'insensitive' } }];
    }
    if (role) {
      where.role = { name: role as RoleType };
    }
    const [users, total] = await Promise.all([
    this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        provider: true,
        isActive: true,
        lastActiveAt: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    }),
    this.prisma.user.count({ where })]
    );
    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  async getSystemLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
  }) {
    const { page = 1, limit = 20, search, action } = params;
    const skip = (page - 1) * limit;
    const allowedActionFilter: Prisma.ActivityLogWhereInput = {
      OR: [
      {
        action: {
          in: [
          'CREATED',
          'DELETED',
          'PUBLISHED',
          'COLLABORATOR_INVITED',
          'COLLABORATOR_ADDED',
          'COLLABORATOR_REMOVED']
        }
      },
      {
        AND: [
        { action: 'UPDATED' },
        { details: { path: ['settingsChanges'], not: [] } },
        { details: { path: ['settingsChanges'], not: null } }]
      }]
    };
    const andFilters: Prisma.ActivityLogWhereInput[] = [allowedActionFilter];
    if (action) {
      andFilters.push({
        action: { contains: action, mode: 'insensitive' }
      });
    }
    if (search) {
      andFilters.push({
        OR: [
        { action: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { form: { title: { contains: search, mode: 'insensitive' } } }]
      });
    }
    const where: Prisma.ActivityLogWhereInput =
    andFilters.length === 1 ? andFilters[0] : { AND: andFilters };
    const [logs, total] = await Promise.all([
    this.prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true
          }
        },
        form: {
          select: {
            id: true,
            title: true
          }
        }
      }
    }),
    this.prisma.activityLog.count({ where })]
    );
    const sanitizedLogs = logs.map((log) => ({
      ...log,
      details: this.sanitizeSystemLogDetails(log.action, log.details as Prisma.JsonValue | null)
    }));
    const filteredLogs = sanitizedLogs.filter(
      (log) => !(log.action === 'UPDATED' && !log.details)
    );
    const removerIds = Array.from(
      new Set(
        filteredLogs.
        filter((log) => log.action === 'COLLABORATOR_REMOVED').
        map((log) => {
          const details =
          log.details && typeof log.details === 'object' && !Array.isArray(log.details) ?
          log.details as Record<string, unknown> :
          null;
          return typeof details?.removedBy === 'string' ? details.removedBy : null;
        }).
        filter((value): value is string => Boolean(value))
      )
    );
    const removersById = removerIds.length > 0 ?
    new Map(
      (
      await this.prisma.user.findMany({
        where: { id: { in: removerIds } },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          photoUrl: true
        }
      })).
      map((user) => [user.id, user])
    ) :
    new Map<string, {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      photoUrl: string | null;
    }>();
    const normalizedLogs = filteredLogs.map((log) => {
      if (log.action !== 'COLLABORATOR_REMOVED') {
        return log;
      }
      const details =
      log.details && typeof log.details === 'object' && !Array.isArray(log.details) ?
      log.details as Record<string, unknown> :
      null;
      const removedBy = typeof details?.removedBy === 'string' ? details.removedBy : null;
      if (!removedBy) {
        return log;
      }
      const remover = removersById.get(removedBy);
      if (!remover) {
        return log;
      }
      const removedUserName =
      log.user && (log.user.firstName || log.user.lastName) ?
      `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() :
      null;
      const normalizedDetails: Record<string, unknown> = details ? { ...details } : {};
      if (typeof normalizedDetails.removedUserId !== 'string' || normalizedDetails.removedUserId.length === 0) {
        normalizedDetails.removedUserId = log.user.id;
      }
      if (
      typeof normalizedDetails.removedUserEmail !== 'string' ||
      normalizedDetails.removedUserEmail.length === 0)
      {
        normalizedDetails.removedUserEmail = log.user.email;
      }
      if (
      typeof normalizedDetails.removedUserName !== 'string' ||
      normalizedDetails.removedUserName.length === 0)
      {
        normalizedDetails.removedUserName = removedUserName;
      }
      return {
        ...log,
        user: remover,
        details: normalizedDetails as Prisma.JsonValue
      };
    });
    const adjustedTotal = Math.max(0, total - (sanitizedLogs.length - filteredLogs.length));
    return {
      data: normalizedLogs,
      meta: {
        total: adjustedTotal,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(adjustedTotal / limit))
      }
    };
  }
  async getSystemSettings() {
    return this.systemSettingsService.getPublicSettings();
  }
  async updateSystemEmailSettings(payload: {
    smtpHost?: string | null;
    smtpPort?: number | string | null;
    smtpSecure?: boolean | null;
    smtpUser?: string | null;
    smtpPass?: string | null;
    clearSmtpPass?: boolean;
    smtpFrom?: string | null;
    smtpFromName?: string | null;
  }) {
    return this.systemSettingsService.updateEmailSettings(payload);
  }
  async updateSystemInviteSettings(payload: {expiryDays?: number | string | null;}) {
    return this.systemSettingsService.updateInviteSettings(payload);
  }
  async updateSystemContactSettings(payload: {
    supportEmail?: string | null;
    supportLineId?: string | null;
  }) {
    return this.systemSettingsService.updateContactSettings(payload);
  }
  async updateSystemBrandingSettings(payload: {
    appName?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
  }) {
    return this.systemSettingsService.updateBrandingSettings(payload);
  }
  async updateSystemAuthPolicySettings(payload: {
    sessionIdleTimeoutMinutes?: number | string | null;
    maxFailedLoginAttempts?: number | string | null;
    lockoutMinutes?: number | string | null;
  }) {
    return this.systemSettingsService.updateAuthPolicySettings(payload);
  }
  async updateSystemPasswordPolicySettings(payload: {
    minLength?: number | string | null;
    requireUppercase?: boolean | null;
    requireLowercase?: boolean | null;
    requireNumber?: boolean | null;
    requireSymbol?: boolean | null;
  }) {
    return this.systemSettingsService.updatePasswordPolicySettings(payload);
  }
  async updateSystemRateLimitSettings(payload: {
    authLoginLimit?: number | string | null;
    authLoginWindowSeconds?: number | string | null;
    publicVerifySessionLimit?: number | string | null;
    publicVerifyIpLimit?: number | string | null;
    publicVerifyWindowSeconds?: number | string | null;
    publicSubmitSessionLimit?: number | string | null;
    publicSubmitIpLimit?: number | string | null;
    publicSubmitWindowSeconds?: number | string | null;
    verificationCooldownSeconds?: number | string | null;
  }) {
    return this.systemSettingsService.updateRateLimitSettings(payload);
  }
  async updateSystemRetentionSettings(payload: {
    autoCleanupEnabled?: boolean | null;
    responsesDays?: number | string | null;
    auditLogsDays?: number | string | null;
    invitationsDays?: number | string | null;
    cleanupIntervalHours?: number | string | null;
  }) {
    return this.systemSettingsService.updateRetentionSettings(payload);
  }
  async runSystemRetentionCleanup() {
    return this.systemSettingsService.runRetentionCleanupNow();
  }
  async updateSystemBackupSettings(payload: {
    autoEnabled?: boolean | null;
    intervalHours?: number | string | null;
    retentionDays?: number | string | null;
    directory?: string | null;
  }) {
    return this.systemSettingsService.updateBackupSettings(payload);
  }
  async runSystemBackupNow() {
    return this.systemSettingsService.runBackupNow();
  }
  async restoreSystemBackupLatest() {
    return this.systemSettingsService.restoreLatestBackup();
  }
  async sendSystemTestEmail(to: string) {
    return this.mailService.sendTestEmail({ to });
  }
  private sanitizeSystemLogDetails(action: string, details: Prisma.JsonValue | null) {
    if (!details || action !== 'UPDATED' || typeof details !== 'object' || Array.isArray(details)) {
      return details;
    }
    const record = details as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    if (Array.isArray(record.settingsChanges)) {
      const settingsChanges = record.settingsChanges.filter((change) => {
        if (!change || typeof change !== 'object' || Array.isArray(change)) {
          return false;
        }
        const property = (change as Record<string, unknown>).property;
        return String(property || '').toLowerCase() !== 'pagesettings';
      });
      if (settingsChanges.length > 0) {
        sanitized.settingsChanges = settingsChanges;
      }
    }
    if (Array.isArray(record.changes)) {
      const filteredChanges = record.changes.filter((change) => {
        const normalized = String(change || '').toLowerCase();
        return normalized !== 'fields' && normalized !== 'pagesettings';
      });
      if (filteredChanges.length > 0) {
        sanitized.changes = filteredChanges;
      }
    }
    return Object.keys(sanitized).length > 0 ? sanitized as Prisma.JsonValue : null;
  }
  async toggleUserBan(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true }
    });
    if (!user) {
      throw new Error('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        isActive: true
      }
    });
  }
  async updateUserRole(userId: string, roleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
      select: {
        id: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }
  async getAllRoles() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });
  }
  async getRoleById(roleId: string) {
    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });
  }
  async updateRoleDescription(roleId: string, description: string) {
    return this.prisma.role.update({
      where: { id: roleId },
      data: { description }
    });
  }
}