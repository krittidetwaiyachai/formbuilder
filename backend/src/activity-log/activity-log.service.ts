import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(private prisma: PrismaService) {}

  async log(formId: string, userId: string, action: string, details?: any) {
    await this.prisma.activityLog.create({
      data: {
        formId,
        userId,
        action,
        details,
      },
    });
  }

  async getFormActivity(
    formId: string,
    page: number = 1,
    limit: number = 20,
    sort: 'asc' | 'desc' = 'desc',
    action?: string,
    userId?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = { formId };
    
    
    if (action && action !== 'ALL') {
      if (action === 'CREATED') {
        where.OR = [
          { action: 'CREATED' },
          { 
            AND: [
              { action: 'UPDATED' },
              { details: { path: ['addedFields'], not: [] } },
              { details: { path: ['addedFields'], not: null } }
            ]
          }
        ];
      } else if (action === 'UPDATED') {
         where.action = 'UPDATED';
         where.OR = [
             { AND: [ { details: { path: ['updatedFields'], not: [] } }, { details: { path: ['updatedFields'], not: null } } ] },
             { AND: [ { details: { path: ['settingsChanges'], not: [] } }, { details: { path: ['settingsChanges'], not: null } } ] },
             { AND: [ { details: { path: ['changes'], not: [] } }, { details: { path: ['changes'], not: null } } ] }
         ];
      } else if (action === 'DELETED') {
         where.OR = [
          { action: 'DELETED' },
          { 
             AND: [
               { action: 'UPDATED' },
               { details: { path: ['deletedFields'], not: [] } },
               { details: { path: ['deletedFields'], not: null } }
             ]
          }
         ];
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
              photoUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: sort,
        },
        take: limit,
        skip: skip,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
      FROM "ActivityLog" al
      JOIN "User" u ON al."userId" = u.id
      WHERE al."formId" = ${formId}
      LIMIT 50
    `;
    return editors;
  }
}
