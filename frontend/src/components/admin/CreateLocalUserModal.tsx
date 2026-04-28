import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { X, Copy, Check, RefreshCw, Eye, EyeOff, ChevronDown, Clock } from "lucide-react";
import { adminApi, type Role, type AdminCreateLocalUserResponse } from "@/lib/adminApi";

interface CreateLocalUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (user: AdminCreateLocalUserResponse) => void;
}

const generateSecurePassword = (length = 12): string => {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*_+-=";
  const allChars = uppercase + lowercase + digits + symbols;

  const required = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  const cryptoArray = new Uint8Array(length - required.length);
  crypto.getRandomValues(cryptoArray);
  const remaining = Array.from(cryptoArray).map(
    (byte) => allChars[byte % allChars.length]
  );

  const combined = [...required, ...remaining];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join("");
};

export default function CreateLocalUserModal({
  isOpen,
  onClose,
  onCreated,
}: CreateLocalUserModalProps) {
  const { t } = useTranslation();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [realEmail, setRealEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [password, setPassword] = useState(() => generateSecurePassword(12));
  const [confirmPassword, setConfirmPassword] = useState(() => generateSecurePassword(12));
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const [createdUser, setCreatedUser] = useState<AdminCreateLocalUserResponse | null>(null);
  const [createdPassword, setCreatedPassword] = useState("");
  const [emailVerificationId, setEmailVerificationId] = useState("");
  const [verifiedRealEmail, setVerifiedRealEmail] = useState("");
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [emailOtpExpiresAtMs, setEmailOtpExpiresAtMs] = useState<number | null>(null);
  const [emailOtpCooldownLeft, setEmailOtpCooldownLeft] = useState(0);
  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
  const [emailVerificationMessage, setEmailVerificationMessage] = useState<string | null>(null);
  const [emailVerificationError, setEmailVerificationError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    if (isRoleDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isRoleDropdownOpen]);

  useEffect(() => {
    const container = document.getElementById("admin-scroll-container") || document.body;
    if (isOpen) {
      container.style.overflow = "hidden";
    } else {
      container.style.overflow = "";
    }
    return () => {
      container.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setUsername("");
    setRealEmail("");
    setFirstName("");
    setLastName("");
    setRoleId("");
    const nextPassword = generateSecurePassword(12);
    setPassword(nextPassword);
    setConfirmPassword(nextPassword);
    setShowPassword(false);
    setCopied(false);
    setError(null);
    setCreatedUser(null);
    setCreatedPassword("");
    setEmailVerificationId("");
    setVerifiedRealEmail("");
    setEmailOtpCode("");
    setEmailOtpExpiresAtMs(null);
    setEmailOtpCooldownLeft(0);
    setEmailVerificationLoading(false);
    setEmailVerificationMessage(null);
    setEmailVerificationError(null);

    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await adminApi.getRoles();
        setRoles(response.data);
      } catch {
        console.error("Failed to load roles");
      } finally {
        setLoadingRoles(false);
      }
    };
    void loadRoles();
  }, [isOpen]);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (emailOtpCooldownLeft <= 0) return;
    const timer = setTimeout(
      () => setEmailOtpCooldownLeft((value) => Math.max(0, value - 1)),
      1000
    );
    return () => clearTimeout(timer);
  }, [emailOtpCooldownLeft]);

  const normalizedRealEmail = realEmail.trim().toLowerCase();
  const isRealEmailValid = useMemo(() => {
    if (!normalizedRealEmail) return false;
    if (normalizedRealEmail.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedRealEmail);
  }, [normalizedRealEmail]);

  const emailOtpSecondsLeft = useMemo(() => {
    if (!emailOtpExpiresAtMs) return null;
    return Math.max(0, Math.floor((emailOtpExpiresAtMs - nowMs) / 1000));
  }, [emailOtpExpiresAtMs, nowMs]);

  const emailOtpExpired = emailOtpSecondsLeft !== null && emailOtpSecondsLeft <= 0;
  const isRealEmailVerified =
    normalizedRealEmail.length > 0 &&
    verifiedRealEmail === normalizedRealEmail &&
    emailVerificationId.length > 0;

  useEffect(() => {
    if (!normalizedRealEmail || normalizedRealEmail === verifiedRealEmail) return;
    setEmailVerificationId("");
    setVerifiedRealEmail("");
    setEmailOtpCode("");
    setEmailOtpExpiresAtMs(null);
    setEmailVerificationMessage(null);
    setEmailVerificationError(null);
  }, [normalizedRealEmail, verifiedRealEmail]);

  const formatSeconds = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const translateAdminUserError = (message: string | undefined, fallbackKey: string) => {
    if (!message) return t(fallbackKey);
    const normalized = message.toLowerCase();
    if (normalized.includes("invalid verification code")) {
      return t("admin.users.email_verification.invalid_or_expired");
    }
    if (normalized.includes("expired")) {
      return t("admin.users.email_verification.expired_resend");
    }
    if (normalized.includes("no pending")) {
      return t("admin.users.email_verification.no_pending");
    }
    if (normalized.includes("email verification is required")) {
      return t("admin.users.email_verification.required");
    }
    if (normalized.includes("username already exists") || message.includes("อีเมลนี้ถูกใช้งานแล้ว")) {
      return t("admin.users.create_user_exists");
    }
    return message;
  };

  const handleRequestEmailVerification = async () => {
    if (!isRealEmailValid) {
      setEmailVerificationError(t("admin.users.email_verification.invalid_email"));
      return;
    }
    try {
      setEmailVerificationLoading(true);
      setEmailVerificationError(null);
      setEmailVerificationMessage(null);
      const response = await adminApi.requestLocalUserEmailVerification(normalizedRealEmail);
      const expiresAt = Date.parse(response.data.expiresAt);
      setEmailVerificationId(response.data.verificationId);
      setEmailOtpExpiresAtMs(Number.isFinite(expiresAt) ? expiresAt : Date.now() + 15 * 60 * 1000);
      setEmailOtpCooldownLeft(Number(response.data.resendCooldownSeconds) || 60);
      setEmailOtpCode("");
      setVerifiedRealEmail("");
      setEmailVerificationMessage(t("admin.users.email_verification.sent", { email: normalizedRealEmail }));
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setEmailVerificationError(
        translateAdminUserError(axiosErr.response?.data?.message, "admin.users.email_verification.send_failed")
      );
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!emailVerificationId) {
      setEmailVerificationError(t("admin.users.email_verification.send_first"));
      return;
    }
    if (emailOtpExpired) {
      setEmailVerificationError(t("admin.users.email_verification.expired_resend"));
      return;
    }
    if (!/^\d{6}$/.test(emailOtpCode)) {
      setEmailVerificationError(t("admin.users.email_verification.code_required"));
      return;
    }
    try {
      setEmailVerificationLoading(true);
      setEmailVerificationError(null);
      const response = await adminApi.verifyLocalUserEmail({
        verificationId: emailVerificationId,
        email: normalizedRealEmail,
        code: emailOtpCode,
      });
      setVerifiedRealEmail(response.data.email);
      setEmailVerificationMessage(t("admin.users.email_verification.verified"));
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setEmailVerificationError(
        translateAdminUserError(axiosErr.response?.data?.message, "admin.users.email_verification.invalid_or_expired")
      );
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  const handleRegenPassword = () => {
    const nextPassword = generateSecurePassword(12);
    setPassword(nextPassword);
    setConfirmPassword(nextPassword);
    setCopied(false);
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  const passwordsMatch = password === confirmPassword;
  const passwordStrength = useMemo(() => {
    const value = password;
    if (!value) {
      return { score: 0, label: t("admin.users.password_strength.very_low") };
    }
    let score = 0;
    const length = value.length;
    if (length >= 8) score += 1;
    if (length >= 10) score += 1;
    if (length >= 12) score += 1;
    if (/[a-z]/.test(value)) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    if (score <= 2) return { score, label: t("admin.users.password_strength.very_low") };
    if (score <= 4) return { score, label: t("admin.users.password_strength.low") };
    if (score <= 5) return { score, label: t("admin.users.password_strength.medium") };
    if (score <= 6) return { score, label: t("admin.users.password_strength.high") };
    return { score, label: t("admin.users.password_strength.very_high") };
  }, [password, t]);

  const canSubmit = useMemo(
    () =>
      username.trim().length > 0 &&
      roleId.length > 0 &&
      password.length >= 8 &&
      passwordsMatch &&
      isRealEmailVerified,
    [username, roleId, password, passwordsMatch, isRealEmailVerified]
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setSaving(true);
      setError(null);
      if (password !== confirmPassword) {
        setError(t("admin.users.create_password_mismatch"));
        return;
      }
      const response = await adminApi.createLocalUser({
        username: username.trim(),
        realEmail: normalizedRealEmail,
        emailVerificationId: emailVerificationId,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        roleId,
      });
      setCreatedPassword(password);
      setCreatedUser(response.data);
      onCreated(response.data);
    } catch (err) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr.response?.data?.message) {
        setError(translateAdminUserError(axiosErr.response.data.message, "admin.users.create_user_failed"));
      } else if (axiosErr.response?.status === 409) {
        setError(t("admin.users.create_user_exists"));
      } else {
        setError(t("admin.users.create_user_failed"));
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-visible animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-900">
                {createdUser
                  ? t("admin.users.create_user_success_title")
                  : t("admin.users.create_local_user")}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-visible">
              {createdUser ? (
                <SuccessView
                  user={createdUser}
                  createdPassword={createdPassword}
                  onCopy={handleCopyPassword}
                  copied={copied}
                  showPassword={showPassword}
                  onToggleShow={() => setShowPassword((val) => !val)}
                />
              ) : (
                <>
                  {error && (
                    <div className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                      {error}
                    </div>
                  )}
                  <FormField label={t("admin.users.create_username")} required>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t("admin.users.create_username_placeholder")}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50/50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all"
                    />
                  </FormField>

                  <FormField label={t("admin.users.create_real_email")} required>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={realEmail}
                        onChange={(e) => setRealEmail(e.target.value)}
                        placeholder={t("admin.users.create_real_email_placeholder")}
                        className={`flex-1 rounded-xl border px-4 py-2.5 text-sm bg-gray-50/50 focus:bg-white focus:ring-2 outline-none transition-all ${
                          isRealEmailVerified
                            ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
                            : "border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleRequestEmailVerification}
                        disabled={!isRealEmailValid || emailVerificationLoading || isRealEmailVerified || emailOtpCooldownLeft > 0}
                        className="shrink-0 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {emailVerificationLoading
                          ? t("admin.users.email_verification.sending")
                          : isRealEmailVerified
                            ? t("admin.users.email_verification.verified_button")
                            : emailOtpCooldownLeft > 0
                              ? `${emailOtpCooldownLeft}s`
                              : t("admin.users.email_verification.verify_button")}
                      </button>
                    </div>
                    {normalizedRealEmail && !isRealEmailVerified && (
                      <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                        {emailVerificationMessage && (
                          <p className="text-xs font-medium text-emerald-700">
                            {emailVerificationMessage}
                          </p>
                        )}
                        {emailVerificationError && (
                          <p className="text-xs font-medium text-red-600">
                            {emailVerificationError}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {emailOtpSecondsLeft !== null
                              ? emailOtpExpired
                                ? t("admin.users.email_verification.expired")
                                : t("admin.users.email_verification.expires_in", { time: formatSeconds(emailOtpSecondsLeft) })
                              : t("admin.users.email_verification.prompt_send")}
                          </span>
                          {emailVerificationId && (
                            <button
                              type="button"
                              onClick={handleRequestEmailVerification}
                              disabled={emailVerificationLoading || emailOtpCooldownLeft > 0}
                              className="font-medium text-gray-700 underline disabled:text-gray-400"
                            >
                              {emailOtpCooldownLeft > 0
                                ? t("admin.users.email_verification.resend_countdown", { seconds: emailOtpCooldownLeft })
                                : t("admin.users.email_verification.resend")}
                            </button>
                          )}
                        </div>
                        {emailVerificationId && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={emailOtpCode}
                              onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ""))}
                              placeholder="000000"
                              disabled={emailOtpExpired || emailVerificationLoading}
                              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-center font-mono text-sm tracking-[0.35em] outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:opacity-50"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyEmailCode}
                              disabled={emailVerificationLoading || emailOtpExpired || emailOtpCode.length !== 6}
                              className="shrink-0 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-medium text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {t("admin.users.email_verification.check_code")}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {isRealEmailVerified && (
                      <p className="mt-1.5 text-xs font-medium text-emerald-700">
                        {t("admin.users.email_verification.verified_status")}
                      </p>
                    )}
                  </FormField>

                  <FormField label={t("admin.users.create_role")} required>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        disabled={loadingRoles}
                        onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50/50 hover:bg-white focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all flex items-center justify-between text-left disabled:opacity-50"
                      >
                        <span className={roleId ? "text-gray-900 font-medium" : "text-gray-500"}>
                          {roleId ? roles.find((r) => r.id === roleId)?.name : t("admin.users.create_select_role")}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isRoleDropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg shadow-black/5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                          <div className="max-h-60 overflow-y-auto py-1">
                            <button
                              type="button"
                              onClick={() => { setRoleId(""); setIsRoleDropdownOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors hover:bg-gray-50 ${roleId === "" ? "text-gray-900 bg-gray-50/50 font-medium" : "text-gray-500"}`}
                            >
                              {t("admin.users.create_select_role")}
                              {roleId === "" && <Check className="w-4 h-4 text-gray-900" />}
                            </button>
                            {roles.map((role) => (
                              <button
                                key={role.id}
                                type="button"
                                onClick={() => { setRoleId(role.id); setIsRoleDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors hover:bg-gray-50 ${roleId === role.id ? "text-gray-900 bg-gray-50/50 font-medium" : "text-gray-700"}`}
                              >
                                <span>
                                  {role.name}
                                  {role._count?.users ? (
                                    <span className="ml-2 text-xs text-gray-400 font-normal">
                                      ({role._count.users})
                                    </span>
                                  ) : null}
                                </span>
                                {roleId === role.id && <Check className="w-4 h-4 text-gray-900" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </FormField>

                  <FormField label={t("admin.users.create_password")} required>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type={showPassword ? "text" : "password"}
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm font-mono bg-gray-50/50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((val) => !val)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleRegenPassword}
                        title={t("admin.users.create_regenerate")}
                        className="shrink-0 rounded-xl border border-gray-200 px-3 py-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        title={t("admin.users.create_copy")}
                        className="shrink-0 rounded-xl border border-gray-200 px-3 py-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-gray-700" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-gray-600">
                      {passwordStrength.label}
                    </p>
                    <p className="mt-1.5 text-xs text-gray-400">
                      {t("admin.users.create_password_hint")}
                    </p>
                  </FormField>

                  <FormField label={t("admin.users.create_confirm_password")} required>
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm font-mono outline-none transition-all ${
                        confirmPassword.length === 0
                          ? "border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                          : passwordsMatch
                            ? "border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                            : "border-red-300 bg-red-50/50 focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      }`}
                    />
                    {!passwordsMatch && confirmPassword.length > 0 && (
                      <p className="mt-1.5 text-xs text-red-600">{t("admin.users.create_password_mismatch")}</p>
                    )}
                  </FormField>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              {createdUser ? (
                <button
                  onClick={onClose}
                  className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black transition-colors ring-1 ring-inset ring-gray-900/10"
                >
                  {t("admin.users.create_done")}
                </button>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    {t("admin.users.create_cancel")}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || saving}
                    className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors ring-1 ring-inset ring-gray-900/10"
                  >
                    {saving ? t("admin.users.create_saving") : t("admin.users.create_submit")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function SuccessView({
  user,
  createdPassword,
  onCopy,
  copied,
  showPassword,
  onToggleShow,
}: {
  user: AdminCreateLocalUserResponse;
  createdPassword: string;
  onCopy: () => void;
  copied: boolean;
  showPassword: boolean;
  onToggleShow: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {t("admin.users.create_user_success_message")}
      </div>
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm">
        <InfoRow label={t("admin.users.create_username")} value={user.username || ""} />
        <InfoRow label={t("admin.users.create_real_email")} value={user.email} />
        <InfoRow label={t("admin.users.create_role")} value={user.role.name} />
        <div className="flex items-center justify-between">
          <span className="text-gray-500">{t("admin.users.create_password")}:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-gray-900">
              {showPassword ? createdPassword : "••••••••••••"}
            </span>
            <button
              type="button"
              onClick={onToggleShow}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={onCopy}
              className="text-gray-400 hover:text-gray-600"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-amber-600">
        {t("admin.users.create_password_warning")}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
