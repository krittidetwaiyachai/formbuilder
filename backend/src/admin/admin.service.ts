import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalForms, totalSubmissions, recentActivity] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.form.count(),
        this.prisma.formResponse.count(),
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

    return {
      totalUsers,
      totalForms,
      totalSubmissions,
      recentActivity,
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
