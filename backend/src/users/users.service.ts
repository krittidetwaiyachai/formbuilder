import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deleteUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.$transaction([
      this.prisma.responseAnswer.deleteMany({
        where: {
          response: {
            userId: userId,
          },
        },
      }),
      this.prisma.formResponse.deleteMany({
        where: { userId: userId },
      }),
      this.prisma.activityLog.deleteMany({
        where: { userId: userId },
      }),
    ]);

    return { message: 'User data has been deleted successfully' };
  }
}
