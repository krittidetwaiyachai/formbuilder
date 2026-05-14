import { useAuthStore } from '@/store/authStore';
import type { Permission } from '@/lib/permissions';
const ROLE_PERMISSION_FALLBACK: Record<string, string[]> = {
  SUPER_ADMIN: [
  'MANAGE_USERS',
  'MANAGE_BUNDLES',
  'MANAGE_ROLES',
  'MANAGE_FORMS',
  'MANAGE_TEMPLATES',
  'MANAGE_SETTINGS',
  'VIEW_SYSTEM_LOGS',
  'VIEW_ANALYTICS',
  'VIEW_RESPONSES',
  'VIEW_USER_DATA',
  'VIEW_AUDIT_LOG',
  'EXPORT_DATA',
  'DELETE_RESPONSES',
  'BYPASS_PDPA'],
  ADMIN: [
  'MANAGE_FORMS',
  'VIEW_RESPONSES',
  'EXPORT_DATA',
  'MANAGE_BUNDLES',
  'MANAGE_USERS',
  'VIEW_ANALYTICS',
  'VIEW_SYSTEM_LOGS',
  'VIEW_USER_DATA',
  'VIEW_AUDIT_LOG',
  'DELETE_RESPONSES'],
  EDITOR: ['VIEW_RESPONSES', 'MANAGE_FORMS', 'EXPORT_DATA', 'MANAGE_TEMPLATES'],
  VIEWER: ['VIEW_RESPONSES'],
  USER: []
};
function getEffectivePermissions(user: {role?: string;permissions?: string[];} | null): string[] {
  if (!user) {
    return [];
  }
  return ROLE_PERMISSION_FALLBACK[user.role || ''] || [];
}
export function useHasPermission(permission: Permission | Permission[]): boolean {
  const user = useAuthStore((state) => state.user);
  if (!user) return false;
  const userPermissions = getEffectivePermissions(user);
  if (Array.isArray(permission)) {
    return permission.some((p) => userPermissions.includes(p));
  }
  return userPermissions.includes(permission);
}
export function useHasAllPermissions(permissions: Permission[]): boolean {
  const user = useAuthStore((state) => state.user);
  if (!user) return false;
  const userPermissions = getEffectivePermissions(user);
  return permissions.every((p) => userPermissions.includes(p));
}
export function useIsAdmin(): boolean {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
}
export function useIsSuperAdmin(): boolean {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'SUPER_ADMIN';
}