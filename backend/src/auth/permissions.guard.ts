import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSIONS_KEY } from './decorators/permissions.decorator';
import { RoleType } from '@prisma/client';

type AuthenticatedUser = {
  role?: string;
  permissions?: string[];
  rolePermissions?: string[];
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Authentication required.');
    }

    if (user.role === RoleType.SUPER_ADMIN) {
      return true;
    }

    const effectivePermissions = new Set<string>([
      ...(Array.isArray(user.permissions) ? user.permissions : []),
      ...(Array.isArray(user.rolePermissions) ? user.rolePermissions : []),
    ]);

    const hasAllRequiredPermissions = requiredPermissions.every((permission) =>
      effectivePermissions.has(permission),
    );

    if (!hasAllRequiredPermissions) {
      throw new ForbiddenException('Insufficient permissions.');
    }

    return true;
  }
}
