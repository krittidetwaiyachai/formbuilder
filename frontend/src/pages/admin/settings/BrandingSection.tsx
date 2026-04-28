import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "@/lib/adminApi";
import { useSettings } from "./SettingsProvider";
import { SettingsField, ActionButton } from "./SettingsFormField";

export default function BrandingSection() {
  const { t } = useTranslation();
  const { snapshot, loadingSystem, applySettings, setSuccess, setError, setNotice } = useSettings();

  const [saving, setSaving] = useState(false);
  const [appName, setAppName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#111827");

  useEffect(() => {
    if (!snapshot) return;
    setAppName(snapshot.branding.appName || "");
    setLogoUrl(snapshot.branding.logoUrl || "");
    setPrimaryColor(snapshot.branding.primaryColor || "#111827");
  }, [snapshot]);

  const hasChanges = useMemo(() => {
    if (!snapshot) return false;
    return (
      appName !== (snapshot.branding.appName || "") ||
      logoUrl !== (snapshot.branding.logoUrl || "") ||
      primaryColor !== (snapshot.branding.primaryColor || "#111827")
    );
  }, [appName, logoUrl, primaryColor, snapshot]);

  const handleSave = async () => {
    if (!hasChanges) return;
    try {
      setSaving(true);
      setNotice(null);
      const response = await adminApi.updateSystemBrandingSettings({
        appName: appName.trim() || null,
        logoUrl: logoUrl.trim() || null,
        primaryColor: primaryColor.trim() || "#111827",
      });
      applySettings(response.data);
      setSuccess(t("admin.settings.system.branding_saved"));
    } catch (error) {
      console.error("Failed to update branding settings:", error);
      setError(t("admin.settings.system.branding_save_error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t("admin.settings.system.branding_title")}</h3>
        <ActionButton
          onClick={handleSave}
          disabled={loadingSystem || saving || !hasChanges}
          loading={saving}
          loadingLabel={t("admin.settings.saving")}
          label={t("admin.settings.system.save_branding")}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SettingsField label={t("admin.settings.system.branding_app_name")} value={appName} onChange={setAppName} />
        <SettingsField label={t("admin.settings.system.branding_logo_url")} value={logoUrl} onChange={setLogoUrl} />
        <SettingsField label={t("admin.settings.system.branding_primary_color")} value={primaryColor} onChange={setPrimaryColor} />
      </div>
    </div>
  );
}
