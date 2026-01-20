import api from './api';

export interface StatsResponse {
  totalUsers: number;
  totalForms: number;
  totalSubmissions: number;
  recentActivity: Array<{
    id: string;
    action: string;
    createdAt: string;
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      photoUrl?: string;
    };
    form: {
      id: string;
      title: string;
    };
    details?: Record<string, unknown>;
  }>;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  provider: string;
  isActive: boolean;
  lastActiveAt?: string;
  createdAt: string;
  permissionOverrides?: string[] | null;
  role: {
    id: string;
    name: string;
    permissions?: string[];
  };
}

export interface UsersResponse {
  data: AdminUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  _count?: {
    users: number;
  };
}

export const adminApi = {
  getStats: () => api.get<StatsResponse>('/admin/stats'),

  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    api.get<UsersResponse>('/admin/users', { params }),

  toggleBan: (userId: string) => 
    api.patch<{ id: string; email: string; isActive: boolean }>(`/admin/users/${userId}/ban`),

  updateUserRole: (userId: string, roleId: string) =>
    api.patch(`/admin/users/${userId}/role`, { roleId }),

  getUserPermissions: (userId: string) =>
    api.get<AdminUser>(`/admin/users/${userId}/permissions`),

  setUserPermissions: (userId: string, permissions: string[] | null) =>
    api.patch(`/admin/users/${userId}/permissions`, { permissions }),

  getRoles: () => api.get<Role[]>('/admin/roles'),

  getRole: (roleId: string) => api.get<Role>(`/admin/roles/${roleId}`),

  updateRolePermissions: (roleId: string, permissions: string[]) =>
    api.patch(`/admin/roles/${roleId}/permissions`, { permissions }),

  updateRoleDescription: (roleId: string, description: string) =>
    api.patch(`/admin/roles/${roleId}/description`, { description }),
};

export default adminApi;

