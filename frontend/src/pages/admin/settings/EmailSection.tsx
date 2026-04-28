import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { adminApi } from "@/lib/adminApi";
import { useSettings } from "./SettingsProvider";
import { SettingsField, SettingsCheckbox, ActionButton } from "./SettingsFormField";
import { parseIntegerInput } from "./settingsUtils";

export default function EmailSection() {
  const { t } = useTranslation();
  const { snapshot, loadingSystem, applySettings, setSuccess, setError, setNotice } = useSettings();

  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPortInput, setSmtpPortInput] = useState("587");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("");
  const [smtpPassInput, setSmtpPassInput] = useState("");
  const [clearSmtpPass, setClearSmtpPass] = useState(false);
  const [hasSmtpPassword, setHasSmtpPassword] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState("");

  useEffect(() => {
    if (!snapshot) return;
    setSmtpHost(snapshot.email.smtpHost || "");
    setSmtpPortInput(String(snapshot.email.smtpPort || 587));
    setSmtpSecure(snapshot.email.smtpSecure);
    setSmtpUser(snapshot.email.smtpUser || "");
    setSmtpFrom(snapshot.email.smtpFrom || "");
    setSmtpFromName(snapshot.email.smtpFromName || "");
    setHasSmtpPassword(snapshot.email.hasPassword);
    setSmtpPassInput("");
    setClearSmtpPass(false);
  }, [snapshot]);

  const parsedPort = useMemo(() => parseIntegerInput(smtpPortInput), [smtpPortInput]);

  const hasChanges = useMemo(() => {
    if (!snapshot) return false;
    const emailSnap = snapshot.email;
    return (
      smtpHost !== (emailSnap.smtpHost || "") ||
      parsedPort !== emailSnap.smtpPort ||
      smtpSecure !== emailSnap.smtpSecure ||
      smtpUser !== (emailSnap.smtpUser || "") ||
      smtpFrom !== (emailSnap.smtpFrom || "") ||
      smtpFromName !== (emailSnap.smtpFromName || "") ||
      smtpPassInput.trim().length > 0 ||
      clearSmtpPass
    );
  }, [smtpHost, parsedPort, smtpSecure, smtpUser, smtpFrom, smtpFromName, smtpPassInput, clearSmtpPass, snapshot]);

  const handleSave = async () => {
    if (!hasChanges || Number.isNaN(parsedPort)) return;
    try {
      setSaving(true);
      setNotice(null);
      const response = await adminApi.updateSystemEmailSettings({
        smtpHost: smtpHost.trim() || null,
        smtpPort: parsedPort,
        smtpSecure,
        smtpUser: smtpUser.trim() || null,
        smtpFrom: smtpFrom.trim() || null,
        smtpFromName: smtpFromName.trim() || null,
        smtpPass: smtpPassInput.trim() || undefined,
        clearSmtpPass,
      });
      applySettings(response.data);
      setSuccess(t("admin.settings.system.email_saved"));
    } catch (error) {
      console.error("Failed to update email settings:", error);
      setError(t("admin.settings.system.email_save_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmailTo.trim()) {
      setError(t("admin.settings.system.test_email_required"));
      return;
    }
    try {
      setSendingTest(true);
      setNotice(null);
      const response = await adminApi.sendSystemTestEmail(testEmailTo.trim());
      if (response.data.sent) {
        setSuccess(t("admin.settings.system.test_email_sent"));
      } else {
        const reasonText = response.data.mode === "failed" ? response.data.reason?.trim() : "";
        const key =
          response.data.mode === "mock"
            ? "admin.settings.system.test_email_mock"
            : reasonText
              ? "admin.settings.system.test_email_failed_with_reason"
              : "admin.settings.system.test_email_failed";
        setNotice({
          type: response.data.mode === "failed" ? "error" : "success",
          text: t(key, { reason: reasonText }),
        });
      }
    } catch (error) {
      console.error("Failed to send test email:", error);
      const reasonText = axios.isAxiosError(error)
        ? typeof error.response?.data?.reason === "string"
          ? error.response.data.reason
          : typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : ""
        : "";
      setError(
        reasonText
          ? t("admin.settings.system.test_email_failed_with_reason", { reason: reasonText })
          : t("admin.settings.system.test_email_failed")
      );
    } finally {
      setSendingTest(false);
    }
  };

  const savingLabel = t("admin.settings.saving");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t("admin.settings.system.email_title")}</h3>
        <ActionButton
          onClick={handleSave}
          disabled={loadingSystem || saving || Number.isNaN(parsedPort) || !hasChanges}
          loading={saving}
          loadingLabel={savingLabel}
          label={t("admin.settings.system.save_email")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsField label={t("admin.settings.system.smtp_host")} value={smtpHost} onChange={setSmtpHost} />
        <SettingsField label={t("admin.settings.system.smtp_port")} value={smtpPortInput} onChange={setSmtpPortInput} />
        <SettingsField label={t("admin.settings.system.smtp_user")} value={smtpUser} onChange={setSmtpUser} />
        <SettingsField label={t("admin.settings.system.smtp_from")} value={smtpFrom} onChange={setSmtpFrom} />
        <SettingsField label={t("admin.settings.system.smtp_from_name")} value={smtpFromName} onChange={setSmtpFromName} />
        <SettingsField
          label={t("admin.settings.system.smtp_password")}
          value={smtpPassInput}
          onChange={setSmtpPassInput}
          type="password"
          placeholder={hasSmtpPassword ? t("admin.settings.system.smtp_password_keep") : "••••••••"}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SettingsCheckbox checked={smtpSecure} onChange={setSmtpSecure} label={t("admin.settings.system.smtp_secure")} />
        <SettingsCheckbox checked={clearSmtpPass} onChange={setClearSmtpPass} label={t("admin.settings.system.clear_password")} />
      </div>

      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-medium text-gray-900 mb-3">{t("admin.settings.system.test_email_title")}</p>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            value={testEmailTo}
            onChange={(e) => setTestEmailTo(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50/50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all"
            placeholder={t("admin.settings.system.test_email_placeholder")}
          />
          <ActionButton
            onClick={handleSendTest}
            disabled={sendingTest}
            loading={sendingTest}
            loadingLabel={savingLabel}
            label={t("admin.settings.system.send_test_email")}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}
