import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { PermissionGate } from "@/components/auth/PermissionGate";
import {
  adminApi,
  type AdminSystemSettingsResponse,
  type Role
} from "@/lib/adminApi";
import {
  ALL_PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  PERMISSION_LABELS
} from "@/lib/permissions";
import type { Permission } from "@/lib/permissions";
import { useTranslation } from "react-i18next";
import { useHasPermission } from "@/hooks/usePermissions";

type SettingsNotice = {
  type: "success" | "error";
  text: string;
};

export default function AdminSettings() {
  const { t } = useTranslation();
  const canManageRoles = useHasPermission("MANAGE_ROLES");
  const canManageSettings = useHasPermission("MANAGE_SETTINGS");

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [savingDescription, setSavingDescription] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const [loadingSystem, setLoadingSystem] = useState(true);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingInvite, setSavingInvite] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState<SettingsNotice | null>(
    null
  );
  const [systemSnapshot, setSystemSnapshot] =
    useState<AdminSystemSettingsResponse | null>(null);

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPortInput, setSmtpPortInput] = useState("587");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("");
  const [smtpPassInput, setSmtpPassInput] = useState("");
  const [clearSmtpPass, setClearSmtpPass] = useState(false);
  const [hasSmtpPassword, setHasSmtpPassword] = useState(false);
  const [inviteExpiryInput, setInviteExpiryInput] = useState("3");
  const [testEmailTo, setTestEmailTo] = useState("");

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  const parsedSmtpPort = useMemo(() => {
    const parsed = Number.parseInt(smtpPortInput, 10);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [smtpPortInput]);

  const parsedInviteExpiry = useMemo(() => {
    const parsed = Number.parseInt(inviteExpiryInput, 10);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [inviteExpiryInput]);

  const hydrateRoleState = (role: Role) => {
    setDescription(role.description || "");
    setSelectedPermissions(new Set(role.permissions || []));
  };

  const applySystemSettings = (settings: AdminSystemSettingsResponse) => {
    setSystemSnapshot(settings);
    setSmtpHost(settings.email.smtpHost || "");
    setSmtpPortInput(String(settings.email.smtpPort || 587));
    setSmtpSecure(settings.email.smtpSecure);
    setSmtpUser(settings.email.smtpUser || "");
    setSmtpFrom(settings.email.smtpFrom || "");
    setSmtpFromName(settings.email.smtpFromName || "");
    setHasSmtpPassword(settings.email.hasPassword);
    setSmtpPassInput("");
    setClearSmtpPass(false);
    setInviteExpiryInput(String(settings.invite.expiryDays || 3));
  };

  const fetchRoles = async () => {
    if (!canManageRoles) {
      setLoadingRoles(false);
      return;
    }
    try {
      setLoadingRoles(true);
      const response = await adminApi.getRoles();
      const nextRoles = response.data;
      setRoles(nextRoles);
      if (!nextRoles.length) {
        setSelectedRoleId(null);
        return;
      }
      const currentRole =
        nextRoles.find((role) => role.id === selectedRoleId) || nextRoles[0];
      setSelectedRoleId(currentRole.id);
      hydrateRoleState(currentRole);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setRoles([]);
      setSelectedRoleId(null);
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchSystemSettings = async () => {
    if (!canManageSettings) {
      setLoadingSystem(false);
      return;
    }
    try {
      setLoadingSystem(true);
      const response = await adminApi.getSystemSettings();
      applySystemSettings(response.data);
    } catch (error) {
      console.error("Failed to fetch system settings:", error);
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const messageKey =
        status === 403
          ? "admin.settings.system.fetch_forbidden"
          : status === 404
            ? "admin.settings.system.fetch_not_found"
            : "admin.settings.system.fetch_error";
      setSettingsNotice({
        type: "error",
        text: t(messageKey)
      });
    } finally {
      setLoadingSystem(false);
    }
  };

  useEffect(() => {
    void fetchRoles();
  }, [canManageRoles]);

  useEffect(() => {
    void fetchSystemSettings();
  }, [canManageSettings]);

  useEffect(() => {
    if (!selectedRole) return;
    hydrateRoleState(selectedRole);
  }, [selectedRole]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
  };

  const handleTogglePermission = (permission: Permission) => {
    setSelectedPermissions((current) => {
      const next = new Set(current);
      if (next.has(permission)) {
        next.delete(permission);
      } else {
        next.add(permission);
      }
      return next;
    });
  };

  const hasDescriptionChanges =
    selectedRole && (selectedRole.description || "") !== description;
  const hasPermissionChanges =
    selectedRole &&
    JSON.stringify([...(selectedRole.permissions || [])].sort()) !==
      JSON.stringify([...selectedPermissions].sort());

  const hasEmailChanges = useMemo(() => {
    if (!systemSnapshot) return false;
    const snapshot = systemSnapshot.email;
    return (
      smtpHost !== (snapshot.smtpHost || "") ||
      parsedSmtpPort !== snapshot.smtpPort ||
      smtpSecure !== snapshot.smtpSecure ||
      smtpUser !== (snapshot.smtpUser || "") ||
      smtpFrom !== (snapshot.smtpFrom || "") ||
      smtpFromName !== (snapshot.smtpFromName || "") ||
      smtpPassInput.trim().length > 0 ||
      clearSmtpPass
    );
  }, [
    clearSmtpPass,
    parsedSmtpPort,
    smtpFrom,
    smtpFromName,
    smtpHost,
    smtpPassInput,
    smtpSecure,
    smtpUser,
    systemSnapshot
  ]);

  const hasInviteChanges = useMemo(() => {
    if (!systemSnapshot) return false;
    return parsedInviteExpiry !== systemSnapshot.invite.expiryDays;
  }, [parsedInviteExpiry, systemSnapshot]);

  const saveDescription = async () => {
    if (!selectedRole || !hasDescriptionChanges) return;
    try {
      setSavingDescription(true);
      await adminApi.updateRoleDescription(selectedRole.id, description.trim());
      await fetchRoles();
    } catch (error) {
      console.error("Failed to update role description:", error);
    } finally {
      setSavingDescription(false);
    }
  };

  const savePermissions = async () => {
    if (!selectedRole || !hasPermissionChanges) return;
    try {
      setSavingPermissions(true);
      await adminApi.updateRolePermissions(selectedRole.id, [
        ...selectedPermissions
      ]);
      await fetchRoles();
    } catch (error) {
      console.error("Failed to update role permissions:", error);
    } finally {
      setSavingPermissions(false);
    }
  };

  const saveEmailSettings = async () => {
    if (!hasEmailChanges || Number.isNaN(parsedSmtpPort)) {
      return;
    }
    try {
      setSavingEmail(true);
      setSettingsNotice(null);
      const response = await adminApi.updateSystemEmailSettings({
        smtpHost: smtpHost.trim() || null,
        smtpPort: parsedSmtpPort,
        smtpSecure,
        smtpUser: smtpUser.trim() || null,
        smtpFrom: smtpFrom.trim() || null,
        smtpFromName: smtpFromName.trim() || null,
        smtpPass: smtpPassInput.trim() || undefined,
        clearSmtpPass
      });
      applySystemSettings(response.data);
      setSettingsNotice({
        type: "success",
        text: t("admin.settings.system.email_saved")
      });
    } catch (error) {
      console.error("Failed to update email settings:", error);
      setSettingsNotice({
        type: "error",
        text: t("admin.settings.system.email_save_error")
      });
    } finally {
      setSavingEmail(false);
    }
  };

  const saveInviteSettings = async () => {
    if (!hasInviteChanges || Number.isNaN(parsedInviteExpiry)) {
      return;
    }
    try {
      setSavingInvite(true);
      setSettingsNotice(null);
      const response = await adminApi.updateSystemInviteSettings({
        expiryDays: parsedInviteExpiry
      });
      applySystemSettings(response.data);
      setSettingsNotice({
        type: "success",
        text: t("admin.settings.system.invite_saved")
      });
    } catch (error) {
      console.error("Failed to update invite settings:", error);
      setSettingsNotice({
        type: "error",
        text: t("admin.settings.system.invite_save_error")
      });
    } finally {
      setSavingInvite(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmailTo.trim()) {
      setSettingsNotice({
        type: "error",
        text: t("admin.settings.system.test_email_required")
      });
      return;
    }
    try {
      setSendingTestEmail(true);
      setSettingsNotice(null);
      const response = await adminApi.sendSystemTestEmail(testEmailTo.trim());
      if (response.data.sent) {
        setSettingsNotice({
          type: "success",
          text: t("admin.settings.system.test_email_sent")
        });
      } else {
        const reasonText =
          response.data.mode === "failed" ? response.data.reason?.trim() : "";
        const key =
          response.data.mode === "mock"
            ? "admin.settings.system.test_email_mock"
            : reasonText
              ? "admin.settings.system.test_email_failed_with_reason"
              : "admin.settings.system.test_email_failed";
        setSettingsNotice({
          type: response.data.mode === "failed" ? "error" : "success",
          text: t(key, { reason: reasonText })
        });
      }
    } catch (error) {
      console.error("Failed to send test email:", error);
      const reasonText = axios.isAxiosError(error)
        ? (typeof error.response?.data?.reason === "string"
            ? error.response.data.reason
            : typeof error.response?.data?.message === "string"
              ? error.response.data.message
              : "")
        : "";
      setSettingsNotice({
        type: "error",
        text: reasonText
          ? t("admin.settings.system.test_email_failed_with_reason", {
              reason: reasonText
            })
          : t("admin.settings.system.test_email_failed")
      });
    } finally {
      setSendingTestEmail(false);
    }
  };

  return (
    <PermissionGate
      permission={["MANAGE_ROLES", "MANAGE_SETTINGS"]}
      fallback={
        <div className="p-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-gray-500">
            {t("admin.settings.no_permission")}
          </div>
        </div>
      }>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("admin.settings.title")}
          </h1>
          <p className="text-gray-500">{t("admin.settings.description")}</p>
        </div>

        {canManageRoles && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                {t("admin.settings.roles_title")}
              </h2>
              {loadingRoles && (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-14 bg-gray-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              )}
              {!loadingRoles && roles.length === 0 && (
                <p className="text-sm text-gray-400">
                  {t("admin.settings.empty_roles")}
                </p>
              )}
              {!loadingRoles && roles.length > 0 && (
                <div className="space-y-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleChange(role.id)}
                      className={`w-full text-left rounded-xl border p-3 transition-colors ${
                        role.id === selectedRoleId
                          ? "border-black bg-black text-white"
                          : "border-gray-200 hover:bg-gray-50 text-gray-900"
                      }`}>
                      <p className="font-medium">{role.name}</p>
                      <p
                        className={`text-xs mt-1 ${
                          role.id === selectedRoleId
                            ? "text-gray-200"
                            : "text-gray-500"
                        }`}>
                        {t("admin.settings.role_users", {
                          count: role._count?.users || 0
                        })}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t("admin.settings.role_profile")}
                  </h2>
                  <button
                    onClick={saveDescription}
                    disabled={
                      !hasDescriptionChanges ||
                      savingDescription ||
                      !selectedRole
                    }
                    className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors">
                    {savingDescription
                      ? t("admin.settings.saving")
                      : t("admin.settings.save_description")}
                  </button>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("admin.settings.description_label")}
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={!selectedRole}
                  rows={4}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black disabled:opacity-60"
                  placeholder={t("admin.settings.description_placeholder")}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t("admin.settings.permissions_title")}
                  </h2>
                  <button
                    onClick={savePermissions}
                    disabled={
                      !hasPermissionChanges ||
                      savingPermissions ||
                      !selectedRole
                    }
                    className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors">
                    {savingPermissions
                      ? t("admin.settings.saving")
                      : t("admin.settings.save_permissions")}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(ALL_PERMISSIONS as Permission[]).map((permission) => {
                    const isChecked = selectedPermissions.has(permission);
                    const permissionLabel = t(
                      `admin.settings.permissions.${permission}.label`,
                      { defaultValue: PERMISSION_LABELS[permission] }
                    );
                    const permissionDescription = t(
                      `admin.settings.permissions.${permission}.description`,
                      { defaultValue: PERMISSION_DESCRIPTIONS[permission] }
                    );
                    return (
                      <label
                        key={permission}
                        className={`rounded-xl border p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                          isChecked
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={!selectedRole}
                          onChange={() => handleTogglePermission(permission)}
                          className="mt-1"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {permissionLabel}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {permissionDescription}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {canManageSettings && (
          <div className="space-y-6">
            {settingsNotice && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  settingsNotice.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}>
                {settingsNotice.text}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("admin.settings.system.email_title")}
                </h2>
                <button
                  onClick={saveEmailSettings}
                  disabled={
                    loadingSystem ||
                    savingEmail ||
                    Number.isNaN(parsedSmtpPort) ||
                    !hasEmailChanges
                  }
                  className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors">
                  {savingEmail
                    ? t("admin.settings.saving")
                    : t("admin.settings.system.save_email")}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("admin.settings.system.smtp_host")}
                  </label>
                  <input
                    value={smtpHost}
                    onChange={(event) => setSmtpHost(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="smtp.example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("admin.settings.system.smtp_port")}
                  </label>
                  <input
                    value={smtpPortInput}
                    onChange={(event) => setSmtpPortInput(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("admin.settings.system.smtp_user")}
                  </label>
                  <input
                    value={smtpUser}
                    onChange={(event) => setSmtpUser(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="smtp-user"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("admin.settings.system.smtp_from")}
                  </label>
                  <input
                    value={smtpFrom}
                    onChange={(event) => setSmtpFrom(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="noreply@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("admin.settings.system.smtp_from_name")}
                  </label>
                  <input
                    value={smtpFromName}
                    onChange={(event) => setSmtpFromName(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Form Builder"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("admin.settings.system.smtp_password")}
                  </label>
                  <input
                    type="password"
                    value={smtpPassInput}
                    onChange={(event) => setSmtpPassInput(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder={
                      hasSmtpPassword
                        ? t("admin.settings.system.smtp_password_keep")
                        : "••••••••"
                    }
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={smtpSecure}
                    onChange={(event) => setSmtpSecure(event.target.checked)}
                  />
                  {t("admin.settings.system.smtp_secure")}
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={clearSmtpPass}
                    onChange={(event) => setClearSmtpPass(event.target.checked)}
                  />
                  {t("admin.settings.system.clear_password")}
                </label>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {t("admin.settings.system.test_email_title")}
                </p>
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    value={testEmailTo}
                    onChange={(event) => setTestEmailTo(event.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder={t("admin.settings.system.test_email_placeholder")}
                  />
                  <button
                    onClick={sendTestEmail}
                    disabled={sendingTestEmail}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    {sendingTestEmail
                      ? t("admin.settings.saving")
                      : t("admin.settings.system.send_test_email")}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("admin.settings.system.invite_title")}
                </h2>
                <button
                  onClick={saveInviteSettings}
                  disabled={
                    loadingSystem ||
                    savingInvite ||
                    Number.isNaN(parsedInviteExpiry) ||
                    parsedInviteExpiry < 1 ||
                    parsedInviteExpiry > 30 ||
                    !hasInviteChanges
                  }
                  className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors">
                  {savingInvite
                    ? t("admin.settings.saving")
                    : t("admin.settings.system.save_invite")}
                </button>
              </div>
              <div className="max-w-xs">
                <label className="block text-sm text-gray-700 mb-1">
                  {t("admin.settings.system.invite_expiry_days")}
                </label>
                <input
                  value={inviteExpiryInput}
                  onChange={(event) => setInviteExpiryInput(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="3"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {t("admin.settings.system.invite_expiry_hint")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
