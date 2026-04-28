import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "@/lib/adminApi";
import { useSettings } from "./SettingsProvider";
import { SettingsField, ActionButton } from "./SettingsFormField";
import { parseIntegerInput } from "./settingsUtils";

export default function RateLimitSection() {
  const { t } = useTranslation();
  const { snapshot, loadingSystem, applySettings, setSuccess, setError, setNotice } = useSettings();

  const [saving, setSaving] = useState(false);
  const [authLoginLimit, setAuthLoginLimit] = useState("10");
  const [authLoginWindowSeconds, setAuthLoginWindowSeconds] = useState("60");
  const [publicVerifySessionLimit, setPublicVerifySessionLimit] = useState("5");
  const [publicVerifyIpLimit, setPublicVerifyIpLimit] = useState("20");
  const [publicVerifyWindowSeconds, setPublicVerifyWindowSeconds] = useState("600");
  const [publicSubmitSessionLimit, setPublicSubmitSessionLimit] = useState("10");
  const [publicSubmitIpLimit, setPublicSubmitIpLimit] = useState("20");
  const [publicSubmitWindowSeconds, setPublicSubmitWindowSeconds] = useState("600");
  const [verificationCooldownSeconds, setVerificationCooldownSeconds] = useState("60");

  useEffect(() => {
    if (!snapshot) return;
    const rl = snapshot.rateLimit;
    setAuthLoginLimit(String(rl.authLoginLimit || 10));
    setAuthLoginWindowSeconds(String(rl.authLoginWindowSeconds || 60));
    setPublicVerifySessionLimit(String(rl.publicVerifySessionLimit || 5));
    setPublicVerifyIpLimit(String(rl.publicVerifyIpLimit || 20));
    setPublicVerifyWindowSeconds(String(rl.publicVerifyWindowSeconds || 600));
    setPublicSubmitSessionLimit(String(rl.publicSubmitSessionLimit || 10));
    setPublicSubmitIpLimit(String(rl.publicSubmitIpLimit || 20));
    setPublicSubmitWindowSeconds(String(rl.publicSubmitWindowSeconds || 600));
    setVerificationCooldownSeconds(String(rl.verificationCooldownSeconds || 60));
  }, [snapshot]);

  const parsed = useMemo(() => ({
    authLoginLimit: parseIntegerInput(authLoginLimit),
    authLoginWindowSeconds: parseIntegerInput(authLoginWindowSeconds),
    publicVerifySessionLimit: parseIntegerInput(publicVerifySessionLimit),
    publicVerifyIpLimit: parseIntegerInput(publicVerifyIpLimit),
    publicVerifyWindowSeconds: parseIntegerInput(publicVerifyWindowSeconds),
    publicSubmitSessionLimit: parseIntegerInput(publicSubmitSessionLimit),
    publicSubmitIpLimit: parseIntegerInput(publicSubmitIpLimit),
    publicSubmitWindowSeconds: parseIntegerInput(publicSubmitWindowSeconds),
    verificationCooldownSeconds: parseIntegerInput(verificationCooldownSeconds),
  }), [
    authLoginLimit, authLoginWindowSeconds,
    publicVerifySessionLimit, publicVerifyIpLimit, publicVerifyWindowSeconds,
    publicSubmitSessionLimit, publicSubmitIpLimit, publicSubmitWindowSeconds,
    verificationCooldownSeconds,
  ]);

  const hasAnyNaN = Object.values(parsed).some(Number.isNaN);

  const hasChanges = useMemo(() => {
    if (!snapshot) return false;
    const rl = snapshot.rateLimit;
    return (
      parsed.authLoginLimit !== rl.authLoginLimit ||
      parsed.authLoginWindowSeconds !== rl.authLoginWindowSeconds ||
      parsed.publicVerifySessionLimit !== rl.publicVerifySessionLimit ||
      parsed.publicVerifyIpLimit !== rl.publicVerifyIpLimit ||
      parsed.publicVerifyWindowSeconds !== rl.publicVerifyWindowSeconds ||
      parsed.publicSubmitSessionLimit !== rl.publicSubmitSessionLimit ||
      parsed.publicSubmitIpLimit !== rl.publicSubmitIpLimit ||
      parsed.publicSubmitWindowSeconds !== rl.publicSubmitWindowSeconds ||
      parsed.verificationCooldownSeconds !== rl.verificationCooldownSeconds
    );
  }, [parsed, snapshot]);

  const handleSave = async () => {
    if (!hasChanges || hasAnyNaN) return;
    try {
      setSaving(true);
      setNotice(null);
      const response = await adminApi.updateSystemRateLimitSettings(parsed);
      applySettings(response.data);
      setSuccess(t("admin.settings.system.rate_limit_saved"));
    } catch (error) {
      console.error("Failed to update rate limit settings:", error);
      setError(t("admin.settings.system.rate_limit_save_error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t("admin.settings.system.rate_limit_title")}</h3>
        <ActionButton
          onClick={handleSave}
          disabled={loadingSystem || saving || !hasChanges || hasAnyNaN}
          loading={saving}
          loadingLabel={t("admin.settings.saving")}
          label={t("admin.settings.system.save_rate_limit")}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SettingsField label={t("admin.settings.system.auth_login_limit")} value={authLoginLimit} onChange={setAuthLoginLimit} />
        <SettingsField label={t("admin.settings.system.auth_login_window_seconds")} value={authLoginWindowSeconds} onChange={setAuthLoginWindowSeconds} />
        <SettingsField label={t("admin.settings.system.verify_cooldown_seconds")} value={verificationCooldownSeconds} onChange={setVerificationCooldownSeconds} />
        <SettingsField label={t("admin.settings.system.public_verify_session_limit")} value={publicVerifySessionLimit} onChange={setPublicVerifySessionLimit} />
        <SettingsField label={t("admin.settings.system.public_verify_ip_limit")} value={publicVerifyIpLimit} onChange={setPublicVerifyIpLimit} />
        <SettingsField label={t("admin.settings.system.public_verify_window_seconds")} value={publicVerifyWindowSeconds} onChange={setPublicVerifyWindowSeconds} />
        <SettingsField label={t("admin.settings.system.public_submit_session_limit")} value={publicSubmitSessionLimit} onChange={setPublicSubmitSessionLimit} />
        <SettingsField label={t("admin.settings.system.public_submit_ip_limit")} value={publicSubmitIpLimit} onChange={setPublicSubmitIpLimit} />
        <SettingsField label={t("admin.settings.system.public_submit_window_seconds")} value={publicSubmitWindowSeconds} onChange={setPublicSubmitWindowSeconds} />
      </div>
    </div>
  );
}
