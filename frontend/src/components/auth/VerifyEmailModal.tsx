import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { X, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_VERIFY_ATTEMPTS = 3;

function isInvalidVerificationCode(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("invalid verification code") || message.includes("รหัสไม่ถูกต้อง");
}

export function VerifyEmailModal({ isOpen, onClose }: VerifyEmailModalProps) {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_VERIFY_ATTEMPTS);
  
  // Timer for resend
  const [timeLeft, setTimeLeft] = useState(0);

  const translateVerificationError = (message: string | undefined, fallbackKey = "auth.email_verify.invalid_or_expired") => {
    if (!message) return t(fallbackKey);
    const normalized = message.toLowerCase();
    if (isInvalidVerificationCode(message)) return t("auth.email_verify.invalid_or_expired");
    if (normalized.includes("expired")) return t("auth.email_verify.invalid_or_expired");
    if (normalized.includes("no pending")) return t("auth.email_verify.invalid_or_expired");
    return message;
  };

  useEffect(() => {
    if (isOpen) {
      setStep("request");
      setEmail(user?.realEmail || (user?.email && user.email.includes("@") ? user.email : ""));
      setCode("");
      setError(null);
      setSuccessMessage(null);
      setAttemptsRemaining(MAX_VERIFY_ATTEMPTS);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await api.post("/auth/email/request-verification", { email });
      setStep("verify");
      setCode("");
      setAttemptsRemaining(MAX_VERIFY_ATTEMPTS);
      setTimeLeft(60); // 60 seconds cooldown for resend
      setSuccessMessage(t("auth.email_verify.sent", { email }));
    } catch (err: any) {
      console.error(err);
      setError(translateVerificationError(err.response?.data?.message, "auth.email_verify.send_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError(t("auth.email_verify.code_required"));
      return;
    }
    if (attemptsRemaining <= 0) {
      setError(t("auth.email_verify.max_attempts"));
      return;
    }
    setError(null);
    setLoading(true);
    
    try {
      const res = await api.post("/auth/email/verify", { code });
      updateUser(res.data.user);
      onClose();
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || "";
      if (isInvalidVerificationCode(String(message))) {
        const nextAttemptsRemaining = Math.max(0, attemptsRemaining - 1);
        setAttemptsRemaining(nextAttemptsRemaining);
        setCode("");
        setError(
          nextAttemptsRemaining > 0
            ? t("auth.email_verify.invalid_code_remaining", { count: nextAttemptsRemaining })
            : t("auth.email_verify.max_attempts")
        );
      } else {
        setError(translateVerificationError(message));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("auth.email_verify.title")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm text-gray-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successMessage}
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-700">
                  <Mail className="w-8 h-8" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auth.email_verify.email_label")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {t("auth.email_verify.email_help")}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full mt-4 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? t("auth.email_verify.sending") : t("auth.email_verify.send_code")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-700">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">
                  {t("auth.email_verify.code_prompt", { email })}
                </label>
                <p className="mb-2 text-center text-xs text-gray-500">
                  {t("auth.email_verify.attempts_remaining", { count: attemptsRemaining })}
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                  disabled={attemptsRemaining <= 0}
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl rounded-xl border border-gray-300 px-4 py-4 bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6 || attemptsRemaining <= 0}
                className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? t("auth.email_verify.verifying") : t("auth.email_verify.verify_code")}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={timeLeft > 0 || loading}
                  className="text-xs text-gray-600 hover:text-gray-900 disabled:text-gray-400 underline transition-colors"
                >
                  {timeLeft > 0
                    ? t("auth.email_verify.resend_countdown", { seconds: timeLeft })
                    : t("auth.email_verify.resend")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
