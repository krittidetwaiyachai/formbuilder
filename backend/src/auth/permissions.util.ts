import { DEFAULT_ROLE_PERMISSIONS } from './permissions.constants';

type PermissionOverrideRecord = {
  permissions?: unknown;
  allow?: unknown;
  add?: unknown;
  grant?: unknown;
  deny?: unknown;
  remove?: unknown;
  revoke?: unknown;
  replace?: unknown;
  mode?: unknown;
};

function normalizePermissionArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = value
    .filter(
      (permission): permission is string => typeof permission === 'string',
    )
    .map((permission) => permission.trim())
    .filter((permission) => permission.length > 0);

  return [...new Set(normalized)];
}

function addPermissions(target: Set<string>, value: unknown) {
  for (const permission of normalizePermissionArray(value)) {
    target.add(permission);
  }
}

function removePermissions(target: Set<string>, value: unknown) {
  for (const permission of normalizePermissionArray(value)) {
    target.delete(permission);
  }
}

export function resolveRolePermissions(
  roleName: string,
  rolePermissionsFromDb: unknown,
): string[] {
  const dbPermissions = normalizePermissionArray(rolePermissionsFromDb);
  if (dbPermissions.length > 0) {
    return dbPermissions;
  }

  return [...(DEFAULT_ROLE_PERMISSIONS[roleName] || [])];
}

export function resolveEffectivePermissions(
  roleName: string,
  resolvedRolePermissions: string[],
  permissionOverrides: unknown,
): string[] {
  const baselinePermissions =
    resolvedRolePermissions.length > 0
      ? resolvedRolePermissions
      : resolveRolePermissions(roleName, null);
  const effective = new Set<string>(baselinePermissions);

  if (Array.isArray(permissionOverrides)) {
    addPermissions(effective, permissionOverrides);
    return [...effective];
  }

  if (!permissionOverrides || typeof permissionOverrides !== 'object') {
    return [...effective];
  }

  const overrides = permissionOverrides as PermissionOverrideRecord;
  const shouldReplace =
    overrides.replace === true ||
    (typeof overrides.mode === 'string' &&
      overrides.mode.toLowerCase() === 'replace');

  if (shouldReplace) {
    effective.clear();
  }

  addPermissions(effective, overrides.permissions);
  addPermissions(effective, overrides.allow);
  addPermissions(effective, overrides.add);
  addPermissions(effective, overrides.grant);

  removePermissions(effective, overrides.deny);
  removePermissions(effective, overrides.remove);
  removePermissions(effective, overrides.revoke);

  return [...effective];
}
