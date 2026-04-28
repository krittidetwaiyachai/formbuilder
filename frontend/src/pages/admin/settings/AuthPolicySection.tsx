import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "@/lib/adminApi";
import { useSettings } from "./SettingsProvider";
import { SettingsField, ActionButton } from "./SettingsFormField";
import { parseIntegerInput } from "./settingsUtils";

export default function AuthPolicySection() {
  const { t } = useTranslation();
  const { snapshot, loadingSystem, applySettings, setSuccess, setError, setNotice } = useSettings();

  const [saving, setSaving] = useState(false);
  const [sessionIdleTimeout, setSessionIdleTimeout] = useState("30");
  const [maxFailedAttempts, setMaxFailedAttempts] = useState("5");
  const [lockoutMinutes, setLockoutMinutes] = useState("15");

  useEffect(() => {
    if (!snapshot) return;
    setSessionIdleTimeout(String(snapshot.authPolicy.sessionIdleTimeoutMinutes || 30));
    setMaxFailedAttempts(String(snapshot.authPolicy.maxFailedLoginAttempts || 5));
    setLockoutMinutes(String(snapshot.authPolicy.lockoutMinutes || 15));
  }, [snapshot]);

  const parsedTimeout = useMemo(() => parseIntegerInput(sessionIdleTimeout), [sessionIdleTimeout]);
  const parsedMaxFailed = useMemo(() => parseIntegerInput(maxFailedAttempts), [maxFailedAttempts]);
  const parsedLockout = useMemo(() => parseIntegerInput(lockoutMinutes), [lockoutMinutes]);

  const hasChanges = useMemo(() => {
    if (!snapshot) return false;
    return (
      parsedTimeout !== snapshot.authPolicy.sessionIdleTimeoutMinutes ||
      parsedMaxFailed !== snapshot.authPolicy.maxFailedLoginAttempts ||
      parsedLockout !== snapshot.authPolicy.lockoutMinutes
    );
  }, [parsedTimeout, parsedMaxFailed, parsedLockout, snapshot]);

  const handleSave = async () => {
    if (!hasChanges || Number.isNaN(parsedTimeout) || Number.isNaN(parsedMaxFailed) || Number.isNaN(parsedLockout)) return;
    try {
      setSaving(true);
      setNotice(null);
      const response = await adminApi.updateSystemAuthPolicySettings({
        sessionIdleTimeoutMinutes: parsedTimeout,
        maxFailedLoginAttempts: parsedMaxFailed,
        lockoutMinutes: parsedLockout,
      });
      applySettings(response.data);
      setSuccess(t("admin.settings.system.auth_policy_saved"));
    } catch (error) {
      console.error("Failed to update auth policy settings:", error);
      setError(t("admin.settings.system.auth_policy_save_error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t("admin.settings.system.auth_policy_title")}</h3>
        <ActionButton
          onClick={handleSave}
          disabled={
            loadingSystem || saving || !hasChanges ||
            Number.isNaN(parsedTimeout) || Number.isNaN(parsedMaxFailed) || Number.isNaN(parsedLockout)
          }
          loading={saving}
          loadingLabel={t("admin.settings.saving")}
          label={t("admin.settings.system.save_auth_policy")}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SettingsField label={t("admin.settings.system.session_idle_timeout")} value={sessionIdleTimeout} onChange={setSessionIdleTimeout} />
        <SettingsField label={t("admin.settings.system.max_failed_login_attempts")} value={maxFailedAttempts} onChange={setMaxFailedAttempts} />
        <SettingsField label={t("admin.settings.system.lockout_minutes")} value={lockoutMinutes} onChange={setLockoutMinutes} />
      </div>
    </div>
  );
}
