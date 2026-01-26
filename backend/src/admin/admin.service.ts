import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const [userCount, formCount, submissionCount, thisMonthSubmissions, lastMonthSubmissions, recentActivity] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.form.count(),
      this.prisma.formResponse.count(),
      this.prisma.formResponse.count({
        where: {
          createdAt: { gte: startOfThisMonth },
        },
      }),
      this.prisma.formResponse.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lt: startOfThisMonth,
          },
        },
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
              photoUrl: true,
            },
          },
          form: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
    ]);

    let growthRate = 0;
    if (lastMonthSubmissions > 0) {
      growthRate = ((thisMonthSubmissions - lastMonthSubmissions) / lastMonthSubmissions) * 100;
    } else if (thisMonthSubmissions > 0) {
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
          gte: sixMonthsAgo,
        },
      },
      _count: {
        _all: true,
      },
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
        item => item.createdAt >= monthStart && item.createdAt <= monthEnd
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
          gte: sixMonthsAgo,
        },
      },
      _count: {
        _all: true,
      },
    });

    const monthlyForms = [];
    
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${months[d.getMonth()]} ${d.getFullYear()}`;
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      
      const count = monthlyFormsRaw.filter(
        item => item.createdAt >= monthStart && item.createdAt <= monthEnd
      ).length;

      monthlyForms.unshift({
        name: monthKey,
        value: count
      });
    }

    
    const popularFormsRaw = await this.prisma.formResponse.groupBy({
      by: ['formId'],
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          formId: 'desc',
        },
      },
      take: 5,
    });

    const popularForms = await Promise.all(
      popularFormsRaw.map(async (item) => {
        const form = await this.prisma.form.findUnique({
          where: { id: item.formId },
          select: { title: true },
        });
        return {
          id: item.formId,
          title: form?.title || 'Unknown Form',
          submissions: item._count._all,
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
      popularForms,
    };
  }

  async findAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    const { page = 1, limit = 10, search, role } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = { name: role };
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
              name: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async toggleUserBan(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
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
        isActive: true,
      },
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
            name: true,
          },
        },
      },
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async getRoleById(roleId: string) {
    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async updateRolePermissions(roleId: string, permissions: string[]) {
    return this.prisma.role.update({
      where: { id: roleId },
      data: { permissions },
    });
  }

  async updateRoleDescription(roleId: string, description: string) {
    return this.prisma.role.update({
      where: { id: roleId },
      data: { description },
    });
  }

  async setUserPermissionOverrides(userId: string, permissions: string[] | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { permissionOverrides: permissions },
      select: {
        id: true,
        email: true,
        permissionOverrides: true,
      },
    });
  }

  async getUserWithPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        permissionOverrides: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    return user;
  }
}
