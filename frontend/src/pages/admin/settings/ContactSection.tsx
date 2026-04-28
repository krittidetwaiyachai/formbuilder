import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "@/lib/adminApi";
import { useSettings } from "./SettingsProvider";
import { SettingsField, ActionButton } from "./SettingsFormField";

export default function ContactSection() {
  const { t } = useTranslation();
  const { snapshot, loadingSystem, applySettings, setSuccess, setError, setNotice } = useSettings();

  const [saving, setSaving] = useState(false);
  const [supportEmail, setSupportEmail] = useState("");
  const [supportLineId, setSupportLineId] = useState("");

  useEffect(() => {
    if (!snapshot) return;
    setSupportEmail(snapshot.contact.supportEmail || "");
    setSupportLineId(snapshot.contact.supportLineId || "");
  }, [snapshot]);

  const hasChanges = useMemo(() => {
    if (!snapshot) return false;
    return (
      supportEmail !== (snapshot.contact.supportEmail || "") ||
      supportLineId !== (snapshot.contact.supportLineId || "")
    );
  }, [supportEmail, supportLineId, snapshot]);

  const handleSave = async () => {
    if (!hasChanges) return;
    try {
      setSaving(true);
      setNotice(null);
      const response = await adminApi.updateSystemContactSettings({
        supportEmail: supportEmail.trim() || null,
        supportLineId: supportLineId.trim() || null,
      });
      applySettings(response.data);
      setSuccess(t("admin.settings.system.contact_saved"));
    } catch (error) {
      console.error("Failed to update contact settings:", error);
      setError(t("admin.settings.system.contact_save_error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t("admin.settings.system.contact_title")}</h3>
        <ActionButton
          onClick={handleSave}
          disabled={loadingSystem || saving || !hasChanges}
          loading={saving}
          loadingLabel={t("admin.settings.saving")}
          label={t("admin.settings.system.save_contact")}
        />
      </div>
      <p className="text-sm text-gray-500">{t("admin.settings.system.contact_hint")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsField label={t("admin.settings.system.support_email")} value={supportEmail} onChange={setSupportEmail} />
        <SettingsField label={t("admin.settings.system.support_line_id")} value={supportLineId} onChange={setSupportLineId} />
      </div>
    </div>
  );
}
