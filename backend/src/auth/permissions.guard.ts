import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from './permissions.constants';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    const userPermissions = this.getUserPermissions(user);

    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }

  private getUserPermissions(user: any): string[] {
    if (user.permissionOverrides && Array.isArray(user.permissionOverrides)) {
      return user.permissionOverrides;
    }

    if (user.rolePermissions && Array.isArray(user.rolePermissions)) {
      return user.rolePermissions;
    }

    return [];
  }
}
