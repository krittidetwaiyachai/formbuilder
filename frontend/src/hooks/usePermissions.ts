import { useAuthStore } from '@/store/authStore';
import { Permission } from '@/lib/permissions';

export function useHasPermission(permission: Permission | Permission[]): boolean {
  const user = useAuthStore((state) => state.user);

  if (!user) return false;

  const userPermissions = user.permissions || [];
  
  if (Array.isArray(permission)) {
    return permission.some((p) => userPermissions.includes(p));
  }

  return userPermissions.includes(permission);
}

export function useHasAllPermissions(permissions: Permission[]): boolean {
  const user = useAuthStore((state) => state.user);

  if (!user) return false;

  const userPermissions = user.permissions || [];
  
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
