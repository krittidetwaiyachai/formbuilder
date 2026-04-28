import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RequestContext } from '../common/request-context';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(private prisma: PrismaService) {}

  private buildDeviceInfo(userAgent?: string) {
    const ua = (userAgent || '').trim();
    if (!ua) return null;
    const uaLower = ua.toLowerCase();
    const os =
      uaLower.includes('windows') ? 'Windows' :
      uaLower.includes('mac os x') || uaLower.includes('macintosh') ? 'macOS' :
      uaLower.includes('android') ? 'Android' :
      uaLower.includes('iphone') || uaLower.includes('ipad') ? 'iOS' :
      uaLower.includes('linux') ? 'Linux' :
      'Unknown';

    const browser =
      uaLower.includes('edg/') || uaLower.includes('edge/') ? 'Edge' :
      uaLower.includes('chrome/') && !uaLower.includes('chromium') ? 'Chrome' :
      uaLower.includes('firefox/') ? 'Firefox' :
      uaLower.includes('safari/') && !uaLower.includes('chrome/') ? 'Safari' :
      'Unknown';

    const deviceType = uaLower.includes('mobile') || os === 'Android' || os === 'iOS' ? 'mobile' : 'desktop';

    return {
      type: deviceType,
      os,
      browser,
      userAgent: ua
    };
  }

  private mergeDetails(details: Prisma.InputJsonValue | undefined, extras: Record<string, unknown>): Prisma.InputJsonValue {
    if (!details) {
      return extras as Prisma.InputJsonValue;
    }
    if (typeof details === 'object' && details !== null && !Array.isArray(details)) {
      return { ...(details as Record<string, unknown>), ...extras } as Prisma.InputJsonValue;
    }
    return { value: details, ...extras } as Prisma.InputJsonValue;
  }

  async log(formId: string, userId: string, action: string, details?: Prisma.InputJsonValue) {
    const ctx = RequestContext.getStore();
    const device = this.buildDeviceInfo(ctx?.userAgent);
    const requestId = ctx?.requestId;
    const enrichedDetails = this.mergeDetails(details, {
      requestId,
      device
    });

    await this.prisma.activityLog.create({
      data: {
        formId,
        userId,
        action,
        details: enrichedDetails
      }
    });
  }

  async getFormActivity(
    formId: string,
    page: number = 1,
    limit: number = 20,
    sort: 'asc' | 'desc' = 'desc',
    action?: string,
    userId?: string
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.ActivityLogWhereInput = { formId };
    if (action && action !== 'ALL') {
      if (action === 'CREATED') {
        where.OR = [
        { action: 'CREATED' },
        {
          AND: [
          { action: 'UPDATED' },
          { details: { path: ['addedFields'], not: [] } },
          { details: { path: ['addedFields'], not: null } }]
        }];
      } else if (action === 'UPDATED') {
        where.action = 'UPDATED';
        where.OR = [
        { AND: [{ details: { path: ['updatedFields'], not: [] } }, { details: { path: ['updatedFields'], not: null } }] },
        { AND: [{ details: { path: ['settingsChanges'], not: [] } }, { details: { path: ['settingsChanges'], not: null } }] },
        { AND: [{ details: { path: ['changes'], not: [] } }, { details: { path: ['changes'], not: null } }] }];
      } else if (action === 'DELETED') {
        where.OR = [
        { action: 'DELETED' },
        {
          AND: [
          { action: 'UPDATED' },
          { details: { path: ['deletedFields'], not: [] } },
          { details: { path: ['deletedFields'], not: null } }]
        }];
      } else {
        where.action = action;
      }
    }
    if (userId) {
      where.userId = userId;
    }
    const [data, total] = await Promise.all([
    this.prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            photoUrl: true
          }
        }
      },
      orderBy: {
        createdAt: sort
      },
      take: limit,
      skip: skip
    }),
    this.prisma.activityLog.count({ where })]
    );
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  async getFormEditors(formId: string) {
    const editors = await this.prisma.$queryRaw<Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      photoUrl: string | null;
    }>>`
      SELECT DISTINCT u.id, u."firstName", u."lastName", u.email, u."photoUrl"
      FROM "activity_logs" al
      JOIN "users" u ON al."userId" = u.id
      WHERE al."formId" = ${formId}
      LIMIT 50
    `;
    return editors;
  }
}