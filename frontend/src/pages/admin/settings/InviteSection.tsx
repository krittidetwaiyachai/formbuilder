import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "@/lib/adminApi";
import { useSettings } from "./SettingsProvider";
import { SettingsField, ActionButton } from "./SettingsFormField";
import { parseIntegerInput } from "./settingsUtils";

export default function InviteSection() {
  const { t } = useTranslation();
  const { snapshot, loadingSystem, applySettings, setSuccess, setError, setNotice } = useSettings();

  const [saving, setSaving] = useState(false);
  const [expiryDaysInput, setExpiryDaysInput] = useState("3");

  useEffect(() => {
    if (!snapshot) return;
    setExpiryDaysInput(String(snapshot.invite.expiryDays || 3));
  }, [snapshot]);

  const parsedExpiry = useMemo(() => parseIntegerInput(expiryDaysInput), [expiryDaysInput]);

  const hasChanges = useMemo(() => {
    if (!snapshot) return false;
    return parsedExpiry !== snapshot.invite.expiryDays;
  }, [parsedExpiry, snapshot]);

  const handleSave = async () => {
    if (!hasChanges || Number.isNaN(parsedExpiry)) return;
    try {
      setSaving(true);
      setNotice(null);
      const response = await adminApi.updateSystemInviteSettings({ expiryDays: parsedExpiry });
      applySettings(response.data);
      setSuccess(t("admin.settings.system.invite_saved"));
    } catch (error) {
      console.error("Failed to update invite settings:", error);
      setError(t("admin.settings.system.invite_save_error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t("admin.settings.system.invite_title")}</h3>
        <ActionButton
          onClick={handleSave}
          disabled={
            loadingSystem || saving ||
            Number.isNaN(parsedExpiry) || parsedExpiry < 1 || parsedExpiry > 30 ||
            !hasChanges
          }
          loading={saving}
          loadingLabel={t("admin.settings.saving")}
          label={t("admin.settings.system.save_invite")}
        />
      </div>
      <div className="max-w-xs">
        <SettingsField label={t("admin.settings.system.invite_expiry_days")} value={expiryDaysInput} onChange={setExpiryDaysInput} />
        <p className="mt-2 text-xs text-gray-500">{t("admin.settings.system.invite_expiry_hint")}</p>
      </div>
    </div>
  );
}
