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
  contact: {
    supportEmail: string;
    supportLineId: string;
  };
  branding: {
    appName: string;
    logoUrl: string;
    primaryColor: string;
  };
  authPolicy: {
    sessionIdleTimeoutMinutes: number;
    maxFailedLoginAttempts: number;
    lockoutMinutes: number;
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSymbol: boolean;
  };
  rateLimit: {
    authLoginLimit: number;
    authLoginWindowSeconds: number;
    publicVerifySessionLimit: number;
    publicVerifyIpLimit: number;
    publicVerifyWindowSeconds: number;
    publicSubmitSessionLimit: number;
    publicSubmitIpLimit: number;
    publicSubmitWindowSeconds: number;
    verificationCooldownSeconds: number;
  };
  retention: {
    autoCleanupEnabled: boolean;
    responsesDays: number | null;
    auditLogsDays: number;
    invitationsDays: number;
    cleanupIntervalHours: number;
    lastCleanupAt: string | null;
  };
  backup: {
    autoEnabled: boolean;
    intervalHours: number;
    retentionDays: number;
    directory: string;
    lastRunAt: string | null;
    lastStatus: string;
    lastFile: string;
    lastError: string;
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
export interface AdminUpdateSystemContactSettingsPayload {
  supportEmail?: string | null;
  supportLineId?: string | null;
}
export interface AdminUpdateSystemBrandingSettingsPayload {
  appName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
}
export interface AdminUpdateSystemAuthPolicySettingsPayload {
  sessionIdleTimeoutMinutes?: number | null;
  maxFailedLoginAttempts?: number | null;
  lockoutMinutes?: number | null;
}
export interface AdminUpdateSystemPasswordPolicySettingsPayload {
  minLength?: number | null;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSymbol?: boolean;
}
export interface AdminUpdateSystemRateLimitSettingsPayload {
  authLoginLimit?: number | null;
  authLoginWindowSeconds?: number | null;
  publicVerifySessionLimit?: number | null;
  publicVerifyIpLimit?: number | null;
  publicVerifyWindowSeconds?: number | null;
  publicSubmitSessionLimit?: number | null;
  publicSubmitIpLimit?: number | null;
  publicSubmitWindowSeconds?: number | null;
  verificationCooldownSeconds?: number | null;
}
export interface AdminUpdateSystemRetentionSettingsPayload {
  autoCleanupEnabled?: boolean;
  responsesDays?: number | null;
  auditLogsDays?: number | null;
  invitationsDays?: number | null;
  cleanupIntervalHours?: number | null;
}
export interface AdminUpdateSystemBackupSettingsPayload {
  autoEnabled?: boolean;
  intervalHours?: number | null;
  retentionDays?: number | null;
  directory?: string | null;
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
  getRoles: () => api.get<Role[]>('/admin/roles'),
  getRole: (roleId: string) => api.get<Role>(`/admin/roles/${roleId}`),
  updateRoleDescription: (roleId: string, description: string) =>
  api.patch(`/admin/roles/${roleId}/description`, { description }),
  getSystemSettings: () =>
  api.get<AdminSystemSettingsResponse>('/admin/settings/system'),
  updateSystemEmailSettings: (payload: AdminUpdateSystemEmailSettingsPayload) =>
  api.patch<AdminSystemSettingsResponse>('/admin/settings/system/email', payload),
  updateSystemInviteSettings: (payload: AdminUpdateSystemInviteSettingsPayload) =>
  api.patch<AdminSystemSettingsResponse>('/admin/settings/system/invite', payload),
  updateSystemContactSettings: (payload: AdminUpdateSystemContactSettingsPayload) =>
  api.patch<AdminSystemSettingsResponse>('/admin/settings/system/contact', payload),
  updateSystemBrandingSettings: (payload: AdminUpdateSystemBrandingSettingsPayload) =>
  api.patch<AdminSystemSettingsResponse>('/admin/settings/system/branding', payload),
  updateSystemAuthPolicySettings: (payload: AdminUpdateSystemAuthPolicySettingsPayload) =>
  api.patch<AdminSystemSettingsResponse>('/admin/settings/system/auth-policy', payload),
  updateSystemPasswordPolicySettings: (payload: AdminUpdateSystemPasswordPolicySettingsPayload) =>
  api.patch<AdminSystemSettingsResponse>('/admin/settings/system/password-policy', payload),
  updateSystemRateLimitSettings: (payload: AdminUpdateSystemRateLimitSettingsPayload) =>
  api.patch<AdminSystemSettingsResponse>('/admin/settings/system/rate-limit', payload),
  updateSystemRetentionSettings: (payload: AdminUpdateSystemRetentionSettingsPayload) =>
  api.patch<AdminSystemSettingsResponse>('/admin/settings/system/retention', payload),
  runSystemRetentionCleanup: () =>
  api.post('/admin/settings/system/retention/run-cleanup'),
  updateSystemBackupSettings: (payload: AdminUpdateSystemBackupSettingsPayload) =>
  api.patch<AdminSystemSettingsResponse>('/admin/settings/system/backup', payload),
  runSystemBackupNow: () =>
  api.post('/admin/settings/system/backup/run'),
  restoreSystemBackupLatest: () =>
  api.post('/admin/settings/system/backup/restore-latest'),
  sendSystemTestEmail: (to: string) =>
  api.post<{sent: boolean;mode: 'smtp' | 'mock' | 'failed';reason?: string;}>('/admin/settings/system/email/test', { to })
};
export default adminApi;