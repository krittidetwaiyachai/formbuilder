import { useEffect, useMemo, useState } from "react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { adminApi } from "@/lib/adminApi";
import type { Role } from "@/lib/adminApi";
import {
  ALL_PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  PERMISSION_LABELS
} from "@/lib/permissions";
import type { Permission } from "@/lib/permissions";
import { useTranslation } from "react-i18next";

export default function AdminSettings() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [savingDescription, setSavingDescription] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  const hydrateRoleState = (role: Role) => {
    setDescription(role.description || "");
    setSelectedPermissions(new Set(role.permissions || []));
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

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

  return (
    <PermissionGate
      permission="MANAGE_ROLES"
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              {t("admin.settings.roles_title")}
            </h2>
            {loading && (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            )}
            {!loading && roles.length === 0 && (
              <p className="text-sm text-gray-400">{t("admin.settings.empty_roles")}</p>
            )}
            {!loading && roles.length > 0 && (
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
                        role.id === selectedRoleId ? "text-gray-200" : "text-gray-500"
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
                  disabled={!hasDescriptionChanges || savingDescription || !selectedRole}
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
                  disabled={!hasPermissionChanges || savingPermissions || !selectedRole}
                  className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors">
                  {savingPermissions
                    ? t("admin.settings.saving")
                    : t("admin.settings.save_permissions")}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(ALL_PERMISSIONS as Permission[]).map((permission) => {
                  const isChecked = selectedPermissions.has(permission);
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
                          {PERMISSION_LABELS[permission]}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {PERMISSION_DESCRIPTIONS[permission]}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
