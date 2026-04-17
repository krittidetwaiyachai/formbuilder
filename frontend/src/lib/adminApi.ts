import api from './api';
export interface StatsResponse {
  totalUsers: number;
  totalForms: number;
  totalSubmissions: number;
  growthRate: number;
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
    details?: unknown;
  }>;
  monthlyStats: Array<{
    name: string;
    submissions: number;
  }>;
  monthlyForms: Array<{
    name: string;
    value: number;
  }>;
  popularForms: Array<{
    id: string;
    title: string;
    submissions: number;
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
export interface AdminActivityLog {
  id: string;
  action: string;
  createdAt: string;
  details?: unknown;
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
}
export interface ActivityLogsResponse {
  data: AdminActivityLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export interface AdminSystemSettingsResponse {
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
    smtpFrom: string;
    smtpFromName: string;
    hasPassword: boolean;
    isConfigured: boolean;
  };
  invite: {
    expiryDays: number;
  };
}

export interface AdminUpdateSystemEmailSettingsPayload {
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpSecure?: boolean;
  smtpUser?: string | null;
  smtpPass?: string | null;
  clearSmtpPass?: boolean;
  smtpFrom?: string | null;
  smtpFromName?: string | null;
}

export interface AdminUpdateSystemInviteSettingsPayload {
  expiryDays: number;
}

export const adminApi = {
  getStats: () => api.get<StatsResponse>('/admin/stats'),
  getLogs: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
  }) => api.get<ActivityLogsResponse>('/admin/logs', { params }),
  getUsers: (params?: {page?: number;limit?: number;search?: string;role?: string;}) =>
  api.get<UsersResponse>('/admin/users', { params }),
  toggleBan: (userId: string) =>
  api.patch<{id: string;email: string;isActive: boolean;}>(`/admin/users/${userId}/ban`),
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
  getSystemSettings: () =>
  api.get<AdminSystemSettingsResponse>('/admin/settings/system'),
  updateSystemEmailSettings: (payload: AdminUpdateSystemEmailSettingsPayload) =>
  api.patch<AdminSystemSettingsResponse>('/admin/settings/system/email', payload),
  updateSystemInviteSettings: (payload: AdminUpdateSystemInviteSettingsPayload) =>
  api.patch<AdminSystemSettingsResponse>('/admin/settings/system/invite', payload),
  sendSystemTestEmail: (to: string) =>
  api.post<{sent: boolean;mode: 'smtp' | 'mock' | 'failed';reason?: string;}>('/admin/settings/system/email/test', { to })
};
export default adminApi;
