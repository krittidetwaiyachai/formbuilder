import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "@/lib/adminApi";
import { useSettings } from "./SettingsProvider";
import { SettingsField, SettingsCheckbox, ActionButton } from "./SettingsFormField";
import { parseIntegerInput } from "./settingsUtils";

export default function RetentionSection() {
  const { t } = useTranslation();
  const { snapshot, loadingSystem, applySettings, setSuccess, setError, setNotice, refreshSettings } = useSettings();

  const [saving, setSaving] = useState(false);
  const [runningCleanup, setRunningCleanup] = useState(false);
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(false);
  const [responsesDaysInput, setResponsesDaysInput] = useState("");
  const [auditLogsDaysInput, setAuditLogsDaysInput] = useState("180");
  const [invitationsDaysInput, setInvitationsDaysInput] = useState("90");
  const [cleanupIntervalHoursInput, setCleanupIntervalHoursInput] = useState("24");

  useEffect(() => {
    if (!snapshot) return;
    setAutoCleanupEnabled(snapshot.retention.autoCleanupEnabled);
    setResponsesDaysInput(snapshot.retention.responsesDays ? String(snapshot.retention.responsesDays) : "");
    setAuditLogsDaysInput(String(snapshot.retention.auditLogsDays || 180));
    setInvitationsDaysInput(String(snapshot.retention.invitationsDays || 90));
    setCleanupIntervalHoursInput(String(snapshot.retention.cleanupIntervalHours || 24));
  }, [snapshot]);

  const parsedResponsesDays = useMemo(() => {
    if (!responsesDaysInput.trim()) return null;
    const parsed = parseIntegerInput(responsesDaysInput);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [responsesDaysInput]);
  const parsedAuditLogsDays = useMemo(() => parseIntegerInput(auditLogsDaysInput), [auditLogsDaysInput]);
  const parsedInvitationsDays = useMemo(() => parseIntegerInput(invitationsDaysInput), [invitationsDaysInput]);
  const parsedCleanupIntervalHours = useMemo(() => parseIntegerInput(cleanupIntervalHoursInput), [cleanupIntervalHoursInput]);

  const hasChanges = useMemo(() => {
    if (!snapshot) return false;
    return (
      autoCleanupEnabled !== snapshot.retention.autoCleanupEnabled ||
      parsedResponsesDays !== snapshot.retention.responsesDays ||
      parsedAuditLogsDays !== snapshot.retention.auditLogsDays ||
      parsedInvitationsDays !== snapshot.retention.invitationsDays ||
      parsedCleanupIntervalHours !== snapshot.retention.cleanupIntervalHours
    );
  }, [autoCleanupEnabled, parsedResponsesDays, parsedAuditLogsDays, parsedInvitationsDays, parsedCleanupIntervalHours, snapshot]);

  const handleSave = async () => {
    if (
      !hasChanges ||
      Number.isNaN(parsedResponsesDays as number) ||
      Number.isNaN(parsedAuditLogsDays) ||
      Number.isNaN(parsedInvitationsDays) ||
      Number.isNaN(parsedCleanupIntervalHours)
    ) return;
    try {
      setSaving(true);
      setNotice(null);
      const response = await adminApi.updateSystemRetentionSettings({
        autoCleanupEnabled,
        responsesDays: parsedResponsesDays,
        auditLogsDays: parsedAuditLogsDays,
        invitationsDays: parsedInvitationsDays,
        cleanupIntervalHours: parsedCleanupIntervalHours,
      });
      applySettings(response.data);
      setSuccess(t("admin.settings.system.retention_saved"));
    } catch (error) {
      console.error("Failed to update retention settings:", error);
      setError(t("admin.settings.system.retention_save_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleRunCleanup = async () => {
    try {
      setRunningCleanup(true);
      setNotice(null);
      const response = await adminApi.runSystemRetentionCleanup();
      await refreshSettings();
      const result = response.data as {
        status?: string;
        deletedResponses?: number;
        deletedAuditLogs?: number;
        deletedInvitations?: number;
      };
      if (result?.status === "success") {
        setSuccess(
          t("admin.settings.system.retention_cleanup_success", {
            responses: result.deletedResponses ?? 0,
            logs: result.deletedAuditLogs ?? 0,
            invitations: result.deletedInvitations ?? 0,
          })
        );
      } else {
        setError(t("admin.settings.system.retention_cleanup_failed"));
      }
    } catch (error) {
      console.error("Failed to run retention cleanup:", error);
      setError(t("admin.settings.system.retention_cleanup_failed"));
    } finally {
      setRunningCleanup(false);
    }
  };

  const savingLabel = t("admin.settings.saving");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{t("admin.settings.system.retention_title")}</h3>
        <div className="flex gap-2">
          <ActionButton onClick={handleRunCleanup} disabled={runningCleanup} loading={runningCleanup} loadingLabel={savingLabel} label={t("admin.settings.system.run_cleanup_now")} variant="secondary" />
          <ActionButton onClick={handleSave} disabled={loadingSystem || saving || !hasChanges} loading={saving} loadingLabel={savingLabel} label={t("admin.settings.system.save_retention")} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <SettingsCheckbox checked={autoCleanupEnabled} onChange={setAutoCleanupEnabled} label={t("admin.settings.system.retention_auto_cleanup_enabled")} />
        </div>
        <SettingsField label={t("admin.settings.system.retention_responses_days")} value={responsesDaysInput} onChange={setResponsesDaysInput} />
        <SettingsField label={t("admin.settings.system.retention_audit_logs_days")} value={auditLogsDaysInput} onChange={setAuditLogsDaysInput} />
        <SettingsField label={t("admin.settings.system.retention_invitations_days")} value={invitationsDaysInput} onChange={setInvitationsDaysInput} />
        <SettingsField label={t("admin.settings.system.retention_cleanup_interval_hours")} value={cleanupIntervalHoursInput} onChange={setCleanupIntervalHoursInput} />
        <div className="text-xs text-gray-500 md:col-span-2 flex items-end">
          {t("admin.settings.system.retention_last_cleanup_at", {
            value: snapshot?.retention.lastCleanupAt || "-",
          })}
        </div>
      </div>
    </div>
  );
}
