import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

type RequestOtpResponse = {
  success: boolean;
  message: string;
  expiresAt?: string;
  expiresInSeconds?: number;
  resendCooldownSeconds?: number;
};

export function VerifyEmailInline({
  onVerified,
}: {
  onVerified?: () => void;
}) {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();

  const defaultEmail = useMemo(() => {
    const realEmail = user?.realEmail?.trim();
    if (realEmail) return realEmail;
    const maybeEmail = user?.email?.trim();
    if (maybeEmail && maybeEmail.includes("@")) return maybeEmail;
    return "";
  }, [user?.email, user?.realEmail]);

  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
  const [resendCooldownLeft, setResendCooldownLeft] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    setEmail(defaultEmail);
  }, [defaultEmail]);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (resendCooldownLeft <= 0) return;
    const timer = setTimeout(() => setResendCooldownLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldownLeft]);

  const otpSecondsLeft = useMemo(() => {
    if (!expiresAtMs) return null;
    return Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000));
  }, [expiresAtMs, nowMs]);

  const otpExpired = otpSecondsLeft !== null && otpSecondsLeft <= 0;

  const formatSeconds = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const isEmailValid = useMemo(() => {
    const v = email.trim();
    if (!v) return false;
    if (v.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [email]);

  const translateVerificationError = (message: string | undefined) => {
    if (!message) return t("auth.email_verify.invalid_or_expired");
    const normalized = message.toLowerCase();
    if (normalized.includes("invalid verification code")) return t("auth.email_verify.invalid_or_expired");
    if (normalized.includes("expired")) return t("auth.email_verify.invalid_or_expired");
    if (normalized.includes("no pending")) return t("auth.email_verify.invalid_or_expired");
    return message;
  };

  const handleRequestOtp = async () => {
    if (!isEmailValid) {
      setError(t("auth.email_verify.invalid_email"));
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await api.post<RequestOtpResponse>("/auth/email/request-verification", {
        email: email.trim(),
      });
      const cooldown = Number(res.data?.resendCooldownSeconds) || 60;
      const expiresAt = res.data?.expiresAt ? Date.parse(res.data.expiresAt) : null;
      setResendCooldownLeft(cooldown);
      setExpiresAtMs(Number.isFinite(expiresAt || NaN) ? (expiresAt as number) : Date.now() + 15 * 60 * 1000);
      setStep("verify");
      setSuccessMessage(t("auth.email_verify.sent", { email: email.trim() }));
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 429) {
        setResendCooldownLeft(60);
        setError(t("auth.email_verify.too_many_requests"));
      } else {
        setError(msg ? translateVerificationError(msg) : t("auth.email_verify.send_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const trimmedCode = code.trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      setError(t("auth.email_verify.code_required"));
      return;
    }
    if (otpExpired) {
      setError(t("auth.email_verify.invalid_or_expired"));
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await api.post("/auth/email/verify", { code: trimmedCode });
      updateUser(res.data.user);
      setSuccessMessage(t("auth.email_verify.verified"));
      onVerified?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(translateVerificationError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
      {error && (
        <div className="mb-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="mb-2 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {step === "request" ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <Mail className="h-4 w-4" />
            <span>{t("auth.email_verify.inline_title")}</span>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
          <button
            type="button"
            onClick={handleRequestOtp}
            disabled={loading || !isEmailValid}
            className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
          >
            {loading ? t("auth.email_verify.sending") : t("auth.email_verify.send_code")}
          </button>
          <p className="text-[11px] text-gray-500">
            {t("auth.email_verify.inline_help")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">
              {t("auth.email_verify.code_prompt", { email: email.trim() })}
            </p>
            {otpSecondsLeft !== null && (
              <span
                className={`text-[11px] font-semibold ${
                  otpSecondsLeft <= 30 ? "text-red-600" : "text-gray-600"
                }`}
              >
                {t("auth.email_verify.inline_expires_in", { time: formatSeconds(otpSecondsLeft) })}
              </span>
            )}
          </div>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || code.trim().length !== 6 || otpExpired}
            className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
          >
            {loading ? t("auth.email_verify.verifying") : t("auth.email_verify.verify_code")}
          </button>

          <button
            type="button"
            onClick={handleRequestOtp}
            disabled={loading || resendCooldownLeft > 0}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {resendCooldownLeft > 0
              ? t("auth.email_verify.resend_again_countdown", { seconds: resendCooldownLeft })
              : t("auth.email_verify.resend_again")}
          </button>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                setStep("request");
                setCode("");
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-[11px] font-medium text-gray-600 underline hover:text-gray-900"
            >
              {t("auth.email_verify.change_email")}
            </button>
            {otpExpired && (
              <span className="text-[11px] font-semibold text-red-600">
                {t("auth.email_verify.invalid_or_expired")}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
