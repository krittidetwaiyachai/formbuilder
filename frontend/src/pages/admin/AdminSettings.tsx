import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { adminApi, type AdminSystemSettingsResponse } from "@/lib/adminApi";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { parseIntegerInput } from "./settings/settingsUtils";

type SettingsNotice = {
  type: "success" | "error";
  text: string;
};

type SettingsCategory =
  | "communication"
  | "appearance"
  | "security"
  | "performance"
  | "system"
  | "email"
  | "contact"
  | "branding"
  | "auth"
  | "rateLimit"
  | "retention"
  | "invite";

export default function AdminSettings() {
  const { t } = useTranslation();
  const userRole = useAuthStore((state) => state.user?.role);
  const canManageSettings = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  const [loadingSystem, setLoadingSystem] = useState(true);
  const [settingsNotice, setSettingsNotice] = useState<SettingsNotice | null>(null);
  const [activeCategory, setActiveCategory] = useState<SettingsCategory | null>("email");
  const [systemSnapshot, setSystemSnapshot] = useState<AdminSystemSettingsResponse | null>(null);

  // Email settings
  const [savingEmail, setSavingEmail] = useState(false);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPortInput, setSmtpPortInput] = useState("587");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("");
  const [smtpPassInput, setSmtpPassInput] = useState("");
  const [clearSmtpPass, setClearSmtpPass] = useState(false);
  const [hasSmtpPassword, setHasSmtpPassword] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState("");

  // Contact settings
  const [savingContact, setSavingContact] = useState(false);
  const [supportEmailInput, setSupportEmailInput] = useState("");
  const [supportLineIdInput, setSupportLineIdInput] = useState("");

  // Branding settings
  const [savingBranding, setSavingBranding] = useState(false);
  const [appNameInput, setAppNameInput] = useState("");
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [primaryColorInput, setPrimaryColorInput] = useState("#111827");

  // Auth policy settings
  const [savingAuthPolicy, setSavingAuthPolicy] = useState(false);
  const [sessionIdleTimeoutInput, setSessionIdleTimeoutInput] = useState("30");
  const [maxFailedLoginAttemptsInput, setMaxFailedLoginAttemptsInput] = useState("5");
  const [lockoutMinutesInput, setLockoutMinutesInput] = useState("15");

  // Rate limit settings
  const [savingRateLimit, setSavingRateLimit] = useState(false);
  const [authLoginLimitInput, setAuthLoginLimitInput] = useState("10");
  const [authLoginWindowSecondsInput, setAuthLoginWindowSecondsInput] = useState("60");
  const [publicVerifySessionLimitInput, setPublicVerifySessionLimitInput] = useState("5");
  const [publicVerifyIpLimitInput, setPublicVerifyIpLimitInput] = useState("20");
  const [publicVerifyWindowSecondsInput, setPublicVerifyWindowSecondsInput] = useState("600");
  const [publicSubmitSessionLimitInput, setPublicSubmitSessionLimitInput] = useState("10");
  const [publicSubmitIpLimitInput, setPublicSubmitIpLimitInput] = useState("20");
  const [publicSubmitWindowSecondsInput, setPublicSubmitWindowSecondsInput] = useState("600");
  const [verificationCooldownSecondsInput, setVerificationCooldownSecondsInput] = useState("60");

  // Retention settings
  const [savingRetention, setSavingRetention] = useState(false);
  const [runningCleanup, setRunningCleanup] = useState(false);
  const [retentionAutoCleanupEnabled, setRetentionAutoCleanupEnabled] = useState(false);
  const [retentionResponsesDaysInput, setRetentionResponsesDaysInput] = useState("");
  const [retentionAuditLogsDaysInput, setRetentionAuditLogsDaysInput] = useState("180");
  const [retentionInvitationsDaysInput, setRetentionInvitationsDaysInput] = useState("90");
  const [retentionCleanupIntervalHoursInput, setRetentionCleanupIntervalHoursInput] = useState("24");

  // Invite settings
  const [savingInvite, setSavingInvite] = useState(false);
  const [inviteExpiryInput, setInviteExpiryInput] = useState("3");

  const parsedSmtpPort = useMemo(() => parseIntegerInput(smtpPortInput), [smtpPortInput]);
  const parsedInviteExpiry = useMemo(() => parseIntegerInput(inviteExpiryInput), [inviteExpiryInput]);
  const parsedSessionIdleTimeout = useMemo(() => parseIntegerInput(sessionIdleTimeoutInput), [sessionIdleTimeoutInput]);
  const parsedMaxFailedLoginAttempts = useMemo(
    () => parseIntegerInput(maxFailedLoginAttemptsInput),
    [maxFailedLoginAttemptsInput]
  );
  const parsedLockoutMinutes = useMemo(() => parseIntegerInput(lockoutMinutesInput), [lockoutMinutesInput]);
  const parsedAuthLoginLimit = useMemo(() => parseIntegerInput(authLoginLimitInput), [authLoginLimitInput]);
  const parsedAuthLoginWindowSeconds = useMemo(
    () => parseIntegerInput(authLoginWindowSecondsInput),
    [authLoginWindowSecondsInput]
  );
  const parsedPublicVerifySessionLimit = useMemo(
    () => parseIntegerInput(publicVerifySessionLimitInput),
    [publicVerifySessionLimitInput]
  );
  const parsedPublicVerifyIpLimit = useMemo(
    () => parseIntegerInput(publicVerifyIpLimitInput),
    [publicVerifyIpLimitInput]
  );
  const parsedPublicVerifyWindowSeconds = useMemo(
    () => parseIntegerInput(publicVerifyWindowSecondsInput),
    [publicVerifyWindowSecondsInput]
  );
  const parsedPublicSubmitSessionLimit = useMemo(
    () => parseIntegerInput(publicSubmitSessionLimitInput),
    [publicSubmitSessionLimitInput]
  );
  const parsedPublicSubmitIpLimit = useMemo(
    () => parseIntegerInput(publicSubmitIpLimitInput),
    [publicSubmitIpLimitInput]
  );
  const parsedPublicSubmitWindowSeconds = useMemo(
    () => parseIntegerInput(publicSubmitWindowSecondsInput),
    [publicSubmitWindowSecondsInput]
  );
  const parsedVerificationCooldownSeconds = useMemo(
    () => parseIntegerInput(verificationCooldownSecondsInput),
    [verificationCooldownSecondsInput]
  );
  const parsedRetentionResponsesDays = useMemo(() => {
    if (!retentionResponsesDaysInput.trim()) return null;
    const parsed = parseIntegerInput(retentionResponsesDaysInput);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [retentionResponsesDaysInput]);
  const parsedRetentionAuditLogsDays = useMemo(
    () => parseIntegerInput(retentionAuditLogsDaysInput),
    [retentionAuditLogsDaysInput]
  );
  const parsedRetentionInvitationsDays = useMemo(
    () => parseIntegerInput(retentionInvitationsDaysInput),
    [retentionInvitationsDaysInput]
  );
  const parsedRetentionCleanupIntervalHours = useMemo(
    () => parseIntegerInput(retentionCleanupIntervalHoursInput),
    [retentionCleanupIntervalHoursInput]
  );

  const applySystemSettings = (settings: AdminSystemSettingsResponse) => {
    setSmtpHost(settings.email.smtpHost || "");
    setSmtpPortInput(String(settings.email.smtpPort || 587));
    setSmtpSecure(settings.email.smtpSecure);
    setSmtpUser(settings.email.smtpUser || "");
    setSmtpFrom(settings.email.smtpFrom || "");
    setSmtpFromName(settings.email.smtpFromName || "");
    setHasSmtpPassword(settings.email.hasPassword);
    setSmtpPassInput("");
    setClearSmtpPass(false);
    setSupportEmailInput(settings.contact.supportEmail || "");
    setSupportLineIdInput(settings.contact.supportLineId || "");
    setAppNameInput(settings.branding.appName || "");
    setLogoUrlInput(settings.branding.logoUrl || "");
    setPrimaryColorInput(settings.branding.primaryColor || "#111827");
    setSessionIdleTimeoutInput(String(settings.authPolicy.sessionIdleTimeoutMinutes || 30));
    setMaxFailedLoginAttemptsInput(String(settings.authPolicy.maxFailedLoginAttempts || 5));
    setLockoutMinutesInput(String(settings.authPolicy.lockoutMinutes || 15));
    setAuthLoginLimitInput(String(settings.rateLimit.authLoginLimit || 10));
    setAuthLoginWindowSecondsInput(String(settings.rateLimit.authLoginWindowSeconds || 60));
    setPublicVerifySessionLimitInput(String(settings.rateLimit.publicVerifySessionLimit || 5));
    setPublicVerifyIpLimitInput(String(settings.rateLimit.publicVerifyIpLimit || 20));
    setPublicVerifyWindowSecondsInput(String(settings.rateLimit.publicVerifyWindowSeconds || 600));
    setPublicSubmitSessionLimitInput(String(settings.rateLimit.publicSubmitSessionLimit || 10));
    setPublicSubmitIpLimitInput(String(settings.rateLimit.publicSubmitIpLimit || 20));
    setPublicSubmitWindowSecondsInput(String(settings.rateLimit.publicSubmitWindowSeconds || 600));
    setVerificationCooldownSecondsInput(String(settings.rateLimit.verificationCooldownSeconds || 60));
    setRetentionAutoCleanupEnabled(settings.retention.autoCleanupEnabled);
    setRetentionResponsesDaysInput(settings.retention.responsesDays ? String(settings.retention.responsesDays) : "");
    setRetentionAuditLogsDaysInput(String(settings.retention.auditLogsDays || 180));
    setRetentionInvitationsDaysInput(String(settings.retention.invitationsDays || 90));
    setRetentionCleanupIntervalHoursInput(String(settings.retention.cleanupIntervalHours || 24));
    setInviteExpiryInput(String(settings.invite.expiryDays || 3));
  };

  const fetchSystemSettings = async () => {
    if (!canManageSettings) {
      setLoadingSystem(false);
      return;
    }
    try {
      setLoadingSystem(true);
      const response = await adminApi.getSystemSettings();
      setSystemSnapshot(response.data);
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
        text: t(messageKey),
      });
    } finally {
      setLoadingSystem(false);
    }
  };

  useEffect(() => {
    void fetchSystemSettings();
  }, [canManageSettings]);

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
    systemSnapshot,
  ]);

  const hasContactChanges = useMemo(() => {
    if (!systemSnapshot) return false;
    return (
      supportEmailInput !== (systemSnapshot.contact.supportEmail || "") ||
      supportLineIdInput !== (systemSnapshot.contact.supportLineId || "")
    );
  }, [supportEmailInput, supportLineIdInput, systemSnapshot]);

  const hasBrandingChanges = useMemo(() => {
    if (!systemSnapshot) return false;
    return (
      appNameInput !== (systemSnapshot.branding.appName || "") ||
      logoUrlInput !== (systemSnapshot.branding.logoUrl || "") ||
      primaryColorInput !== (systemSnapshot.branding.primaryColor || "#111827")
    );
  }, [appNameInput, logoUrlInput, primaryColorInput, systemSnapshot]);

  const hasAuthPolicyChanges = useMemo(() => {
    if (!systemSnapshot) return false;
    return (
      parsedSessionIdleTimeout !== systemSnapshot.authPolicy.sessionIdleTimeoutMinutes ||
      parsedMaxFailedLoginAttempts !== systemSnapshot.authPolicy.maxFailedLoginAttempts ||
      parsedLockoutMinutes !== systemSnapshot.authPolicy.lockoutMinutes
    );
  }, [parsedLockoutMinutes, parsedMaxFailedLoginAttempts, parsedSessionIdleTimeout, systemSnapshot]);

  const hasRateLimitChanges = useMemo(() => {
    if (!systemSnapshot) return false;
    const snapshot = systemSnapshot.rateLimit;
    return (
      parsedAuthLoginLimit !== snapshot.authLoginLimit ||
      parsedAuthLoginWindowSeconds !== snapshot.authLoginWindowSeconds ||
      parsedPublicVerifySessionLimit !== snapshot.publicVerifySessionLimit ||
      parsedPublicVerifyIpLimit !== snapshot.publicVerifyIpLimit ||
      parsedPublicVerifyWindowSeconds !== snapshot.publicVerifyWindowSeconds ||
      parsedPublicSubmitSessionLimit !== snapshot.publicSubmitSessionLimit ||
      parsedPublicSubmitIpLimit !== snapshot.publicSubmitIpLimit ||
      parsedPublicSubmitWindowSeconds !== snapshot.publicSubmitWindowSeconds ||
      parsedVerificationCooldownSeconds !== snapshot.verificationCooldownSeconds
    );
  }, [
    parsedAuthLoginLimit,
    parsedAuthLoginWindowSeconds,
    parsedPublicSubmitIpLimit,
    parsedPublicSubmitSessionLimit,
    parsedPublicSubmitWindowSeconds,
    parsedPublicVerifyIpLimit,
    parsedPublicVerifySessionLimit,
    parsedPublicVerifyWindowSeconds,
    parsedVerificationCooldownSeconds,
    systemSnapshot,
  ]);

  const hasRetentionChanges = useMemo(() => {
    if (!systemSnapshot) return false;
    return (
      retentionAutoCleanupEnabled !== systemSnapshot.retention.autoCleanupEnabled ||
      parsedRetentionResponsesDays !== systemSnapshot.retention.responsesDays ||
      parsedRetentionAuditLogsDays !== systemSnapshot.retention.auditLogsDays ||
      parsedRetentionInvitationsDays !== systemSnapshot.retention.invitationsDays ||
      parsedRetentionCleanupIntervalHours !== systemSnapshot.retention.cleanupIntervalHours
    );
  }, [
    parsedRetentionAuditLogsDays,
    parsedRetentionCleanupIntervalHours,
    parsedRetentionInvitationsDays,
    parsedRetentionResponsesDays,
    retentionAutoCleanupEnabled,
    systemSnapshot,
  ]);

  const hasInviteChanges = useMemo(() => {
    if (!systemSnapshot) return false;
    return parsedInviteExpiry !== systemSnapshot.invite.expiryDays;
  }, [parsedInviteExpiry, systemSnapshot]);

  const setSuccess = (text: string) => setSettingsNotice({ type: "success", text });
  const setError = (text: string) => setSettingsNotice({ type: "error", text });

  const saveEmailSettings = async () => {
    if (!hasEmailChanges || Number.isNaN(parsedSmtpPort)) return;
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
        clearSmtpPass,
      });
      applySystemSettings(response.data);
      setSuccess(t("admin.settings.system.email_saved"));
    } catch (error) {
      console.error("Failed to update email settings:", error);
      setError(t("admin.settings.system.email_save_error"));
    } finally {
      setSavingEmail(false);
    }
  };

  const saveContactSettings = async () => {
    if (!hasContactChanges) return;
    try {
      setSavingContact(true);
      setSettingsNotice(null);
      const response = await adminApi.updateSystemContactSettings({
        supportEmail: supportEmailInput.trim() || null,
        supportLineId: supportLineIdInput.trim() || null,
      });
      applySystemSettings(response.data);
      setSuccess(t("admin.settings.system.contact_saved"));
    } catch (error) {
      console.error("Failed to update contact settings:", error);
      setError(t("admin.settings.system.contact_save_error"));
    } finally {
      setSavingContact(false);
    }
  };

  const saveBrandingSettings = async () => {
    if (!hasBrandingChanges) return;
    try {
      setSavingBranding(true);
      setSettingsNotice(null);
      const response = await adminApi.updateSystemBrandingSettings({
        appName: appNameInput.trim() || null,
        logoUrl: logoUrlInput.trim() || null,
        primaryColor: primaryColorInput.trim() || "#111827",
      });
      applySystemSettings(response.data);
      setSuccess(t("admin.settings.system.branding_saved"));
    } catch (error) {
      console.error("Failed to update branding settings:", error);
      setError(t("admin.settings.system.branding_save_error"));
    } finally {
      setSavingBranding(false);
    }
  };

  const saveAuthPolicySettings = async () => {
    if (
      !hasAuthPolicyChanges ||
      Number.isNaN(parsedSessionIdleTimeout) ||
      Number.isNaN(parsedMaxFailedLoginAttempts) ||
      Number.isNaN(parsedLockoutMinutes)
    ) {
      return;
    }
    try {
      setSavingAuthPolicy(true);
      setSettingsNotice(null);
      const response = await adminApi.updateSystemAuthPolicySettings({
        sessionIdleTimeoutMinutes: parsedSessionIdleTimeout,
        maxFailedLoginAttempts: parsedMaxFailedLoginAttempts,
        lockoutMinutes: parsedLockoutMinutes,
      });
      applySystemSettings(response.data);
      setSuccess(t("admin.settings.system.auth_policy_saved"));
    } catch (error) {
      console.error("Failed to update auth policy settings:", error);
      setError(t("admin.settings.system.auth_policy_save_error"));
    } finally {
      setSavingAuthPolicy(false);
    }
  };

  const saveRateLimitSettings = async () => {
    if (
      !hasRateLimitChanges ||
      Number.isNaN(parsedAuthLoginLimit) ||
      Number.isNaN(parsedAuthLoginWindowSeconds) ||
      Number.isNaN(parsedPublicVerifySessionLimit) ||
      Number.isNaN(parsedPublicVerifyIpLimit) ||
      Number.isNaN(parsedPublicVerifyWindowSeconds) ||
      Number.isNaN(parsedPublicSubmitSessionLimit) ||
      Number.isNaN(parsedPublicSubmitIpLimit) ||
      Number.isNaN(parsedPublicSubmitWindowSeconds) ||
      Number.isNaN(parsedVerificationCooldownSeconds)
    ) {
      return;
    }
    try {
      setSavingRateLimit(true);
      setSettingsNotice(null);
      const response = await adminApi.updateSystemRateLimitSettings({
        authLoginLimit: parsedAuthLoginLimit,
        authLoginWindowSeconds: parsedAuthLoginWindowSeconds,
        publicVerifySessionLimit: parsedPublicVerifySessionLimit,
        publicVerifyIpLimit: parsedPublicVerifyIpLimit,
        publicVerifyWindowSeconds: parsedPublicVerifyWindowSeconds,
        publicSubmitSessionLimit: parsedPublicSubmitSessionLimit,
        publicSubmitIpLimit: parsedPublicSubmitIpLimit,
        publicSubmitWindowSeconds: parsedPublicSubmitWindowSeconds,
        verificationCooldownSeconds: parsedVerificationCooldownSeconds,
      });
      applySystemSettings(response.data);
      setSuccess(t("admin.settings.system.rate_limit_saved"));
    } catch (error) {
      console.error("Failed to update rate limit settings:", error);
      setError(t("admin.settings.system.rate_limit_save_error"));
    } finally {
      setSavingRateLimit(false);
    }
  };

  const saveRetentionSettings = async () => {
    if (
      !hasRetentionChanges ||
      Number.isNaN(parsedRetentionResponsesDays as number) ||
      Number.isNaN(parsedRetentionAuditLogsDays) ||
      Number.isNaN(parsedRetentionInvitationsDays) ||
      Number.isNaN(parsedRetentionCleanupIntervalHours)
    ) {
      return;
    }
    try {
      setSavingRetention(true);
      setSettingsNotice(null);
      const response = await adminApi.updateSystemRetentionSettings({
        autoCleanupEnabled: retentionAutoCleanupEnabled,
        responsesDays: parsedRetentionResponsesDays,
        auditLogsDays: parsedRetentionAuditLogsDays,
        invitationsDays: parsedRetentionInvitationsDays,
        cleanupIntervalHours: parsedRetentionCleanupIntervalHours,
      });
      applySystemSettings(response.data);
      setSuccess(t("admin.settings.system.retention_saved"));
    } catch (error) {
      console.error("Failed to update retention settings:", error);
      setError(t("admin.settings.system.retention_save_error"));
    } finally {
      setSavingRetention(false);
    }
  };

  const runRetentionCleanup = async () => {
    try {
      setRunningCleanup(true);
      setSettingsNotice(null);
      const response = await adminApi.runSystemRetentionCleanup();
      await fetchSystemSettings();
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

  const saveInviteSettings = async () => {
    if (!hasInviteChanges || Number.isNaN(parsedInviteExpiry)) return;
    try {
      setSavingInvite(true);
      setSettingsNotice(null);
      const response = await adminApi.updateSystemInviteSettings({ expiryDays: parsedInviteExpiry });
      applySystemSettings(response.data);
      setSuccess(t("admin.settings.system.invite_saved"));
    } catch (error) {
      console.error("Failed to update invite settings:", error);
      setError(t("admin.settings.system.invite_save_error"));
    } finally {
      setSavingInvite(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmailTo.trim()) {
      setError(t("admin.settings.system.test_email_required"));
      return;
    }

    try {
      setSendingTestEmail(true);
      setSettingsNotice(null);
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
        setSettingsNotice({
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
      setSendingTestEmail(false);
    }
  };

  const categories: Array<{ key: SettingsCategory; title: string }> = [
    { key: "email", title: t("admin.settings.system.email_title") },
    { key: "contact", title: t("admin.settings.system.contact_title") },
    { key: "branding", title: t("admin.settings.system.branding_title") },
    { key: "auth", title: t("admin.settings.system.auth_policy_title") },
    { key: "rateLimit", title: t("admin.settings.system.rate_limit_title") },
    { key: "retention", title: t("admin.settings.system.retention_title") },
    { key: "invite", title: t("admin.settings.system.invite_title") },
  ];

  const activeTitle =
    categories.find((category) => category.key === activeCategory)?.title ||
    t("admin.settings.system.select_category");

  if (!canManageSettings) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-gray-500">
          {t("admin.settings.no_permission")}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("admin.settings.title")}</h1>
        <p className="text-gray-500">{t("admin.settings.description")}</p>
      </div>

      {settingsNotice && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            settingsNotice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {settingsNotice.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          <div className="space-y-1">
            {categories.map((category) => {
              const isActive = activeCategory === category.key;
              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setActiveCategory(category.key)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-transparent hover:bg-gray-50"
                  }`}
                >
                  {category.title}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{activeTitle}</h2>
          </div>
          <div className="p-6">
            {activeCategory === "email" && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={saveEmailSettings}
                    disabled={
                      loadingSystem ||
                      savingEmail ||
                      Number.isNaN(parsedSmtpPort) ||
                      !hasEmailChanges
                    }
                    className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                  >
                    {savingEmail ? t("admin.settings.saving") : t("admin.settings.system.save_email")}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.smtp_host")}
                    </label>
                    <input
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.smtp_port")}
                    </label>
                    <input
                      value={smtpPortInput}
                      onChange={(e) => setSmtpPortInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.smtp_user")}
                    </label>
                    <input
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.smtp_from")}
                    </label>
                    <input
                      value={smtpFrom}
                      onChange={(e) => setSmtpFrom(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.smtp_from_name")}
                    </label>
                    <input
                      value={smtpFromName}
                      onChange={(e) => setSmtpFromName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.smtp_password")}
                    </label>
                    <input
                      type="password"
                      value={smtpPassInput}
                      onChange={(e) => setSmtpPassInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder={hasSmtpPassword ? t("admin.settings.system.smtp_password_keep") : "••••••••"}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={smtpSecure}
                      onChange={(e) => setSmtpSecure(e.target.checked)}
                    />
                    {t("admin.settings.system.smtp_secure")}
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={clearSmtpPass}
                      onChange={(e) => setClearSmtpPass(e.target.checked)}
                    />
                    {t("admin.settings.system.clear_password")}
                  </label>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {t("admin.settings.system.test_email_title")}
                  </p>
                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      value={testEmailTo}
                      onChange={(e) => setTestEmailTo(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder={t("admin.settings.system.test_email_placeholder")}
                    />
                    <button
                      onClick={sendTestEmail}
                      disabled={sendingTestEmail}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingTestEmail ? t("admin.settings.saving") : t("admin.settings.system.send_test_email")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "contact" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={saveContactSettings}
                    disabled={loadingSystem || savingContact || !hasContactChanges}
                    className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                  >
                    {savingContact ? t("admin.settings.saving") : t("admin.settings.system.save_contact")}
                  </button>
                </div>
                <p className="text-sm text-gray-500">{t("admin.settings.system.contact_hint")}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.support_email")}
                    </label>
                    <input
                      value={supportEmailInput}
                      onChange={(e) => setSupportEmailInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.support_line_id")}
                    </label>
                    <input
                      value={supportLineIdInput}
                      onChange={(e) => setSupportLineIdInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "branding" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={saveBrandingSettings}
                    disabled={loadingSystem || savingBranding || !hasBrandingChanges}
                    className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                  >
                    {savingBranding ? t("admin.settings.saving") : t("admin.settings.system.save_branding")}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.branding_app_name")}
                    </label>
                    <input
                      value={appNameInput}
                      onChange={(e) => setAppNameInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.branding_logo_url")}
                    </label>
                    <input
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.branding_primary_color")}
                    </label>
                    <input
                      value={primaryColorInput}
                      onChange={(e) => setPrimaryColorInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "auth" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={saveAuthPolicySettings}
                    disabled={
                      loadingSystem ||
                      savingAuthPolicy ||
                      !hasAuthPolicyChanges ||
                      Number.isNaN(parsedSessionIdleTimeout) ||
                      Number.isNaN(parsedMaxFailedLoginAttempts) ||
                      Number.isNaN(parsedLockoutMinutes)
                    }
                    className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                  >
                    {savingAuthPolicy ? t("admin.settings.saving") : t("admin.settings.system.save_auth_policy")}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.session_idle_timeout")}
                    </label>
                    <input
                      value={sessionIdleTimeoutInput}
                      onChange={(e) => setSessionIdleTimeoutInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.max_failed_login_attempts")}
                    </label>
                    <input
                      value={maxFailedLoginAttemptsInput}
                      onChange={(e) => setMaxFailedLoginAttemptsInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.lockout_minutes")}
                    </label>
                    <input
                      value={lockoutMinutesInput}
                      onChange={(e) => setLockoutMinutesInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "rateLimit" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={saveRateLimitSettings}
                    disabled={loadingSystem || savingRateLimit || !hasRateLimitChanges}
                    className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                  >
                    {savingRateLimit ? t("admin.settings.saving") : t("admin.settings.system.save_rate_limit")}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.auth_login_limit")}
                    </label>
                    <input
                      value={authLoginLimitInput}
                      onChange={(e) => setAuthLoginLimitInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.auth_login_window_seconds")}
                    </label>
                    <input
                      value={authLoginWindowSecondsInput}
                      onChange={(e) => setAuthLoginWindowSecondsInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.verify_cooldown_seconds")}
                    </label>
                    <input
                      value={verificationCooldownSecondsInput}
                      onChange={(e) => setVerificationCooldownSecondsInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.public_verify_session_limit")}
                    </label>
                    <input
                      value={publicVerifySessionLimitInput}
                      onChange={(e) => setPublicVerifySessionLimitInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.public_verify_ip_limit")}
                    </label>
                    <input
                      value={publicVerifyIpLimitInput}
                      onChange={(e) => setPublicVerifyIpLimitInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.public_verify_window_seconds")}
                    </label>
                    <input
                      value={publicVerifyWindowSecondsInput}
                      onChange={(e) => setPublicVerifyWindowSecondsInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.public_submit_session_limit")}
                    </label>
                    <input
                      value={publicSubmitSessionLimitInput}
                      onChange={(e) => setPublicSubmitSessionLimitInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.public_submit_ip_limit")}
                    </label>
                    <input
                      value={publicSubmitIpLimitInput}
                      onChange={(e) => setPublicSubmitIpLimitInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.public_submit_window_seconds")}
                    </label>
                    <input
                      value={publicSubmitWindowSecondsInput}
                      onChange={(e) => setPublicSubmitWindowSecondsInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "retention" && (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    onClick={runRetentionCleanup}
                    disabled={runningCleanup}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {runningCleanup ? t("admin.settings.saving") : t("admin.settings.system.run_cleanup_now")}
                  </button>
                  <button
                    onClick={saveRetentionSettings}
                    disabled={loadingSystem || savingRetention || !hasRetentionChanges}
                    className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                  >
                    {savingRetention ? t("admin.settings.saving") : t("admin.settings.system.save_retention")}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 md:col-span-3">
                    <input
                      type="checkbox"
                      checked={retentionAutoCleanupEnabled}
                      onChange={(e) => setRetentionAutoCleanupEnabled(e.target.checked)}
                    />
                    {t("admin.settings.system.retention_auto_cleanup_enabled")}
                  </label>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.retention_responses_days")}
                    </label>
                    <input
                      value={retentionResponsesDaysInput}
                      onChange={(e) => setRetentionResponsesDaysInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.retention_audit_logs_days")}
                    </label>
                    <input
                      value={retentionAuditLogsDaysInput}
                      onChange={(e) => setRetentionAuditLogsDaysInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.retention_invitations_days")}
                    </label>
                    <input
                      value={retentionInvitationsDaysInput}
                      onChange={(e) => setRetentionInvitationsDaysInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {t("admin.settings.system.retention_cleanup_interval_hours")}
                    </label>
                    <input
                      value={retentionCleanupIntervalHoursInput}
                      onChange={(e) => setRetentionCleanupIntervalHoursInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="text-xs text-gray-500 md:col-span-2 flex items-end">
                    {t("admin.settings.system.retention_last_cleanup_at", {
                      value: systemSnapshot?.retention.lastCleanupAt || "-",
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "invite" && (
              <div className="space-y-4">
                <div className="flex justify-end">
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
                    className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                  >
                    {savingInvite ? t("admin.settings.saving") : t("admin.settings.system.save_invite")}
                  </button>
                </div>
                <div className="max-w-xs">
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("admin.settings.system.invite_expiry_days")}
                  </label>
                  <input
                    value={inviteExpiryInput}
                    onChange={(e) => setInviteExpiryInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    {t("admin.settings.system.invite_expiry_hint")}
                  </p>
                </div>
              </div>
            )}

            {!activeCategory && (
              <div className="text-sm text-gray-500">
                {t("admin.settings.system.select_category_hint")}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}