import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '@prisma/client';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  const createExecutionContext = (user: Record<string, unknown> | undefined) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as any;

  it('allows when no permissions are required', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);

    expect(guard.canActivate(createExecutionContext(undefined))).toBe(true);
  });

  it('allows super admin regardless of permission list', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['MANAGE_SETTINGS']),
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);

    expect(
      guard.canActivate(
        createExecutionContext({
          role: RoleType.SUPER_ADMIN,
          permissions: [],
        }),
      ),
    ).toBe(true);
  });

  it('denies when required permission is missing', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['MANAGE_SETTINGS']),
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);

    expect(() =>
      guard.canActivate(
        createExecutionContext({
          role: RoleType.ADMIN,
          permissions: ['VIEW_RESPONSES'],
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('allows when all required permissions exist', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValue(['MANAGE_SETTINGS', 'VIEW_SYSTEM_LOGS']),
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);

    expect(
      guard.canActivate(
        createExecutionContext({
          role: RoleType.ADMIN,
          permissions: ['MANAGE_SETTINGS', 'VIEW_SYSTEM_LOGS'],
        }),
      ),
    ).toBe(true);
  });
});
