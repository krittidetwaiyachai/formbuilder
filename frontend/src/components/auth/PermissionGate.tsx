import { ReactNode } from 'react';
import { useHasPermission } from '@/hooks/usePermissions';
import { Permission } from '@/lib/permissions';

interface PermissionGateProps {
  permission: Permission | Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const hasPermission = useHasPermission(permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <PermissionGate 
      permission={['MANAGE_USERS', 'MANAGE_ROLES', 'VIEW_SYSTEM_LOGS', 'VIEW_ANALYTICS']} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function SuperAdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <PermissionGate 
      permission={['MANAGE_ROLES', 'BYPASS_PDPA']} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}
