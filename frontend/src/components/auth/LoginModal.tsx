import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { X, ArrowLeft, Mail } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "../ui/toaster";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import TurnstileWidget from "@/components/public-form/TurnstileWidget";
import { useBuilderScroll } from "@/contexts/SmoothScrollContext";
import { usePublicSettings } from "@/hooks/usePublicSettings";
import { evaluatePasswordStrength, STRENGTH_COLORS } from "@/utils/passwordStrength";
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onContactClick?: () => void;
}
function parseAllowedOrigins(rawValue: string | undefined) {
  return (rawValue || "http://localhost:5173").
  split(",").
  map((origin) => origin.trim()).
  filter(Boolean);
}
export default function LoginModal({ isOpen, onClose, onSuccess, onContactClick }: LoginModalProps) {
  const { login } = useAuthStore();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { start, stop } = useBuilderScroll();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState<string | null>(null);
  const [passwordMinLength, setPasswordMinLength] = useState(6);
  const { settings } = usePublicSettings();
  const [view, setView] = useState<"login" | "forgot_password_request" | "forgot_password_verify">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resendCooldownLeft, setResendCooldownLeft] = useState(0);
  const resetPasswordStrength = useMemo(() => evaluatePasswordStrength(newPassword), [newPassword]);
  const resetPasswordsMatch = newPassword === confirmNewPassword;
  const resetPasswordValid = newPassword.length >= passwordMinLength && resetPasswordsMatch;
  const googleAllowedOrigins = useMemo(
    () => parseAllowedOrigins(import.meta.env.VITE_GOOGLE_ALLOWED_ORIGINS),
    []
  );
  const isGoogleOriginAllowed = googleAllowedOrigins.includes(window.location.origin);
  const authTurnstileRequired =
  import.meta.env.VITE_AUTH_TURNSTILE_REQUIRED as string | undefined === "true";
  const hasTurnstileSiteKey = Boolean(import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY);
  const showCaptcha = authTurnstileRequired && hasTurnstileSiteKey;
  const captchaMisconfigured = authTurnstileRequired && !hasTurnstileSiteKey;
  const handleCaptchaTokenChange = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);
  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaResetSignal((value) => value + 1);
  }, []);
  const ensureCaptchaIfRequired = useCallback(() => {
    if (!authTurnstileRequired) {
      return true;
    }
    if (captchaMisconfigured) {
      toast({
        title: t("auth.error"),
        description: t("auth.captcha_check_failed"),
        variant: "error"
      });
      return false;
    }
    if (captchaToken) {
      return true;
    }
    toast({
      title: t("auth.error"),
      description: t("auth.captcha_required_sign_in"),
      variant: "error"
    });
    return false;
  }, [authTurnstileRequired, captchaMisconfigured, captchaToken, t, toast]);
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const minLength = Number(settings?.passwordPolicy?.minLength);
    if (Number.isFinite(minLength) && minLength >= 6) {
      setPasswordMinLength(minLength);
    }
  }, [settings]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      stop();
      return () => {
        document.body.style.overflow = "";
        start();
      };
    } else {
      setCaptchaToken(null);
      setCaptchaResetSignal(0);
      setPendingGoogleCredential(null);
      setView("login");
      setResetEmail("");
      setResetCode("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  }, [isOpen, start, stop]);
  useEffect(() => {
    if (resendCooldownLeft <= 0) return;
    const timer = setTimeout(() => setResendCooldownLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldownLeft]);
  const resolveAuthErrorDescription = useCallback(
    (error: unknown, fallback: string) => {
      const code = (error as {response?: {data?: {code?: string;};};})?.response?.data?.code;
      if (code === "CAPTCHA_REQUIRED") {
        return t("auth.captcha_required_sign_in");
      }
      if (typeof code === "string" && code.startsWith("CAPTCHA_")) {
        return t("auth.captcha_check_failed");
      }
      return fallback;
    },
    [t]
  );
  const handleRequestPasswordResetOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes("@")) {
      toast({ title: t("auth.error"), description: t("auth.forgot_password.invalid_email"), variant: "error" });
      return;
    }
    setResetLoading(true);
    try {
      const res = await api.post("/auth/password-reset/request-otp", { email: resetEmail });
      const cooldown = res.data?.resendCooldownSeconds || 60;
      setResendCooldownLeft(cooldown);
      setView("forgot_password_verify");
    } catch (e) {
      const err = e as Error & {response?: {status?: number;};code?: string;};
      toast({ title: t("auth.error"), description: err?.response?.data?.message || t("auth.forgot_password.send_failed"), variant: "error" });
    } finally {
      setResetLoading(false);
    }
  };
  const handleVerifyPasswordResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode.length !== 6 || !resetPasswordValid) {
      toast({ title: t("auth.error"), description: t("auth.forgot_password.invalid_code"), variant: "error" });
      return;
    }
    setResetLoading(true);
    try {
      await api.post("/auth/password-reset/verify-otp", {
        email: resetEmail,
        code: resetCode,
        newPassword: newPassword
      });
      toast({ title: t("common.success", "Success"), description: t("auth.forgot_password.success"), variant: "default" });
      setView("login");
      setIdentifier(resetEmail);
      setPassword(newPassword);
    } catch (e) {
      const err = e as Error & {response?: {status?: number;};code?: string;};
      toast({ title: t("auth.error"), description: err?.response?.data?.message || t("auth.forgot_password.verify_failed"), variant: "error" });
    } finally {
      setResetLoading(false);
    }
  };const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureCaptchaIfRequired()) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", {
        identifier,
        password,
        captchaToken: captchaToken || undefined
      });
      login(res.data.user, res.data.access_token, res.data.refresh_token);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Login failed", error);
      toast({
        title: t("auth.login_failed"),
        description: resolveAuthErrorDescription(error, t("auth.invalid_credentials")),
        variant: "error"
      });
      if (showCaptcha) {
        resetCaptcha();
      }
    } finally {
      setIsLoading(false);
    }
  };
  const submitGoogleLogin = useCallback(
    async (credential: string, captcha: string | null) => {
      try {
        const res = await api.post("/auth/google/login", {
          token: credential,
          captchaToken: captcha || undefined
        });
        setPendingGoogleCredential(null);
        login(res.data.user, res.data.access_token, res.data.refresh_token);
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Login failed", error);
        toast({
          title: t("auth.google_failed"),
          description: resolveAuthErrorDescription(error, t("auth.google_error")),
          variant: "error"
        });
        if (showCaptcha) {
          resetCaptcha();
        }
      }
    },
    [login, onClose, onSuccess, resetCaptcha, resolveAuthErrorDescription, showCaptcha, t, toast]
  );
  const handleGoogleSuccess = async (credentialResponse: {credential?: string;}) => {
    const credential = credentialResponse.credential;
    if (!credential) {
      toast({
        title: t("auth.google_failed"),
        description: t("auth.google_error"),
        variant: "error"
      });
      return;
    }
    if (authTurnstileRequired && captchaMisconfigured) {
      toast({
        title: t("auth.error"),
        description: t("auth.captcha_check_failed"),
        variant: "error"
      });
      return;
    }
    if (authTurnstileRequired && !captchaToken) {
      setPendingGoogleCredential(credential);
      toast({
        title: t("auth.error"),
        description: t("auth.captcha_required_sign_in"),
        variant: "error"
      });
      return;
    }
    await submitGoogleLogin(credential, captchaToken);
  };
  useEffect(() => {
    if (!pendingGoogleCredential) {
      return;
    }
    if (authTurnstileRequired && !captchaToken) {
      return;
    }
    void submitGoogleLogin(pendingGoogleCredential, captchaToken);
  }, [authTurnstileRequired, captchaToken, pendingGoogleCredential, submitGoogleLogin]);
  if (!isOpen) {
    return null;
  }
  const googleAuthBlock = isGoogleOriginAllowed ?
  <GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={() => {
      toast({
        title: t("auth.google_failed"),
        description: t("auth.google_error"),
        variant: "error"
      });
    }}
    useOneTap={isDesktop && !authTurnstileRequired}
    theme="outline"
    shape="pill"
    size="large"
    width={isDesktop ? 350 : 320}
    logo_alignment={isDesktop ? "left" : undefined} /> :
  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Google Sign-In is disabled on this origin. Add{" "}
      <span className="font-semibold">{window.location.origin}</span> to the Google OAuth allowed
      origins, then update <span className="font-semibold">VITE_GOOGLE_ALLOWED_ORIGINS</span>.
    </div>;
  const captchaBlock = showCaptcha ?
  <div className={`flex flex-col items-center justify-center ${isDesktop ? "mb-5" : "mb-6"}`}>
      <TurnstileWidget onTokenChange={handleCaptchaTokenChange} resetSignal={captchaResetSignal} />
    </div> :
  null;
  const formFields =
  <form onSubmit={handleEmailLogin} className={isDesktop ? "space-y-6" : "space-y-5"}>
      <div>
        <label
        className={
        isDesktop ?
        "mb-3 block text-xs font-bold uppercase tracking-wider text-black/60" :
        "mb-2 block text-sm font-medium text-gray-700"
        }>
          {t("auth.email")}
        </label>
        <input
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className={
        isDesktop ?
        "w-full border-0 border-b-2 border-black/20 bg-transparent px-0 py-3 text-lg text-black outline-none transition-all placeholder:text-black/30 focus:border-black" :
        "w-full rounded-xl border-0 bg-gray-100 px-4 py-4 text-base text-black outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-black"
        }
        placeholder={t("auth.email_placeholder")}
        required />
      </div>
      <div>
        <label
        className={
        isDesktop ?
        "mb-3 block text-xs font-bold uppercase tracking-wider text-black/60" :
        "mb-2 block text-sm font-medium text-gray-700"
        }>
          {t("auth.password")}
        </label>
        <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={passwordMinLength}
        className={
        isDesktop ?
        "w-full border-0 border-b-2 border-black/20 bg-transparent px-0 py-3 text-lg text-black outline-none transition-all placeholder:text-black/30 focus:border-black" :
        "w-full rounded-xl border-0 bg-gray-100 px-4 py-4 text-base text-black outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-black"
        }
        placeholder={t("auth.password_placeholder")}
        required />
        <div className="mt-2 flex justify-start">
          <button
          type="button"
          onClick={() => setView("forgot_password_request")}
          className="text-xs font-medium text-gray-500 underline hover:text-black">
            {t("auth.forgot_password", "Forgot Password?")}
          </button>
        </div>
      </div>
      <button
      type="submit"
      disabled={isLoading}
      className={
      isDesktop ?
      "w-full transform rounded-2xl bg-black py-4 text-lg font-bold uppercase tracking-wider text-white shadow-xl transition-all hover:-translate-y-0.5 hover:bg-black/80 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50" :
      "w-full rounded-full bg-black py-4 text-base font-semibold text-white transition-colors active:bg-gray-800 disabled:opacity-50"
      }>
        {isLoading ? t("auth.signing_in") : t("auth.sign_in_button")}
      </button>
    </form>;
  const rightSideContent = view === "login" ?
  <div className="mx-auto w-full max-w-sm">
      <h2 className="mb-5 text-3xl font-bold text-black">{t("auth.sign_in")}</h2>
      <div className="mb-6 flex justify-center">{googleAuthBlock}</div>
      {captchaBlock}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-black/10"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm font-bold uppercase tracking-wider text-black/40">
            {t("auth.or_continue")}
          </span>
        </div>
      </div>
      {formFields}
      <p className="mt-4 text-center text-xs leading-relaxed text-black/40">
        {t("auth.protected_by")}
      </p>
    </div> :
  view === "forgot_password_request" ?
  <div className="mx-auto w-full max-w-sm animate-in fade-in slide-in-from-right-4 duration-300">
        <h2 className="mb-2 text-3xl font-bold text-black">{t("auth.forgot_password.title")}</h2>
        <p className="mb-6 text-sm text-gray-500">{t("auth.forgot_password.subtitle")}</p>
        <form onSubmit={handleRequestPasswordResetOtp} className={isDesktop ? "space-y-6" : "space-y-5"}>
          <div>
            <label className={isDesktop ? "mb-3 block text-xs font-bold uppercase tracking-wider text-black/60" : "mb-2 block text-sm font-medium text-gray-700"}>
              {t("auth.forgot_password.email_label")}
            </label>
            <input
          type="email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          className={isDesktop ? "w-full border-0 border-b-2 border-black/20 bg-transparent px-0 py-3 text-lg text-black outline-none transition-all placeholder:text-black/30 focus:border-black" : "w-full rounded-xl border-0 bg-gray-100 px-4 py-4 text-base text-black outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-black"}
          placeholder="your@email.com"
          required />
          </div>
          <button
        type="submit"
        disabled={resetLoading}
        className={isDesktop ? "w-full transform rounded-2xl bg-black py-4 text-lg font-bold uppercase tracking-wider text-white shadow-xl transition-all hover:-translate-y-0.5 hover:bg-black/80 hover:shadow-2xl disabled:opacity-50" : "w-full rounded-full bg-black py-4 text-base font-semibold text-white transition-colors active:bg-gray-800 disabled:opacity-50"}>
            {resetLoading ? t("auth.forgot_password.sending") : t("auth.forgot_password.send_code")}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setView("login")} className="text-sm font-medium text-gray-500 hover:text-black underline">
            {t("auth.forgot_password.back_to_login")}
          </button>
        </div>
      </div> :
  <div className="mx-auto w-full max-w-sm animate-in fade-in slide-in-from-right-4 duration-300">
        <h2 className="mb-2 text-3xl font-bold text-black">{t("auth.forgot_password.enter_code_title")}</h2>
        <p className="mb-6 text-sm text-gray-500">{t("auth.forgot_password.enter_code_subtitle", { email: resetEmail })}</p>
        <form onSubmit={handleVerifyPasswordResetOtp} className={isDesktop ? "space-y-6" : "space-y-5"}>
          <div>
            <label className={isDesktop ? "mb-3 block text-xs font-bold uppercase tracking-wider text-black/60" : "mb-2 block text-sm font-medium text-gray-700"}>
              {t("auth.forgot_password.code_label")}
            </label>
            <input
          type="text"
          maxLength={6}
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
          className={isDesktop ? "w-full border-0 border-b-2 border-black/20 bg-transparent px-0 py-3 text-center text-3xl tracking-[0.3em] font-mono text-black outline-none transition-all focus:border-black" : "w-full rounded-xl border-0 bg-gray-100 px-4 py-4 text-center text-2xl tracking-[0.3em] font-mono text-black outline-none transition-all focus:bg-white focus:ring-2 focus:ring-black"}
          placeholder="000000"
          required />
          </div>
          <div>
            <label className={isDesktop ? "mb-3 block text-xs font-bold uppercase tracking-wider text-black/60" : "mb-2 block text-sm font-medium text-gray-700"}>
              {t("auth.forgot_password.new_password_label")}
            </label>
            <input
          type="password"
          minLength={passwordMinLength}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={isDesktop ? "w-full border-0 border-b-2 border-black/20 bg-transparent px-0 py-3 text-lg text-black outline-none transition-all placeholder:text-black/30 focus:border-black" : "w-full rounded-xl border-0 bg-gray-100 px-4 py-4 text-base text-black outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-black"}
          placeholder={t("auth.forgot_password.new_password_placeholder")}
          required />
            {newPassword.length > 0 &&
        <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) =>
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= resetPasswordStrength.level ?
              STRENGTH_COLORS.bar[resetPasswordStrength.level - 1] :
              "bg-gray-200"}`
              } />
            )}
                </div>
                <p className={`text-[11px] font-medium ${STRENGTH_COLORS.text[resetPasswordStrength.level - 1]}`}>
                  {t(resetPasswordStrength.labelKey)}
                </p>
              </div>
        }
          </div>
          <div>
            <label className={isDesktop ? "mb-3 block text-xs font-bold uppercase tracking-wider text-black/60" : "mb-2 block text-sm font-medium text-gray-700"}>
              {t("auth.forgot_password.confirm_password_label")}
            </label>
            <input
          type="password"
          minLength={passwordMinLength}
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          className={isDesktop ? "w-full border-0 border-b-2 border-black/20 bg-transparent px-0 py-3 text-lg text-black outline-none transition-all placeholder:text-black/30 focus:border-black" : "w-full rounded-xl border-0 bg-gray-100 px-4 py-4 text-base text-black outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-black"}
          placeholder={t("auth.forgot_password.confirm_password_placeholder")}
          required />
            {confirmNewPassword.length > 0 && !resetPasswordsMatch &&
        <p className="mt-1 text-[11px] font-medium text-red-500">
                {t("auth.forgot_password.password_mismatch")}
              </p>
        }
          </div>
          <button
        type="submit"
        disabled={resetLoading || resetCode.length !== 6 || !resetPasswordValid}
        className={isDesktop ? "w-full transform rounded-2xl bg-black py-4 text-lg font-bold uppercase tracking-wider text-white shadow-xl transition-all hover:-translate-y-0.5 hover:bg-black/80 hover:shadow-2xl disabled:opacity-50" : "w-full rounded-full bg-black py-4 text-base font-semibold text-white transition-colors active:bg-gray-800 disabled:opacity-50"}>
            {resetLoading ? t("auth.forgot_password.resetting") : t("auth.forgot_password.reset_button")}
          </button>
        </form>
        <div className="mt-6 flex justify-between text-sm font-medium">
          <button type="button" onClick={() => setView("forgot_password_request")} className="text-gray-500 hover:text-black underline">
            {t("auth.forgot_password.change_email")}
          </button>
          <button type="button" onClick={handleRequestPasswordResetOtp} disabled={resendCooldownLeft > 0 || resetLoading} className="text-gray-500 hover:text-black disabled:opacity-50">
            {resendCooldownLeft > 0 ? t("auth.forgot_password.resend_countdown", { seconds: resendCooldownLeft }) : t("auth.forgot_password.resend_code")}
          </button>
        </div>
      </div>;
  if (!isDesktop) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 backdrop-blur-xl">
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          <div className="safe-area-pt safe-area-pb min-h-screen px-6 pb-10 pt-14">
            <button
              onClick={onClose}
              className="safe-area-pt absolute left-4 top-4 rounded-full bg-gray-100 p-2 transition-colors active:bg-gray-200">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            {onContactClick &&
            <button
              type="button"
              onClick={onContactClick}
              title={t("admin.layout.contact")}
              aria-label={t("admin.layout.contact")}
              className="safe-area-pt absolute right-4 top-4 rounded-full bg-gray-100 p-2 transition-colors active:bg-gray-200">
                <Mail className="h-5 w-5 text-gray-700" />
              </button>
            }
            <div className="mt-8">{rightSideContent}</div>
          </div>
        </div>
      </div>);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
      <div className="relative h-[min(88vh,640px)] w-full max-w-5xl animate-in overflow-hidden rounded-3xl bg-white shadow-2xl fade-in zoom-in duration-500">
        {onContactClick &&
        <button
          type="button"
          onClick={onContactClick}
          title={t("admin.layout.contact")}
          aria-label={t("admin.layout.contact")}
          className="group absolute right-16 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200">
            <Mail className="h-5 w-5 text-gray-600 transition-all duration-300 group-hover:text-black" />
          </button>
        }
        <button
          onClick={onClose}
          className="group absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200">
          <X className="h-5 w-5 text-gray-600 transition-all duration-300 group-hover:rotate-90 group-hover:text-black" />
        </button>
        <div className="flex h-full">
          <div className="relative w-1/2 overflow-hidden bg-black">
            <div className="absolute bottom-0 top-0 z-10 w-48 -right-24 skew-x-[-8deg] transform bg-black"></div>
            <div className="relative z-20 flex h-full flex-col justify-center px-12">
              <div className="space-y-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl">
                  <svg
                    className="h-8 w-8 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="mb-3 text-5xl font-black leading-none text-white">
                    {t("auth.welcome_back").
                    split(" ").
                    map((word, index) =>
                    <React.Fragment key={index}>
                          {word}
                          {index === 0 && <br />}
                        </React.Fragment>
                    )}
                  </h1>
                  <div className="h-1 w-20 bg-white"></div>
                </div>
                <p className="text-base font-medium text-gray-400">{t("auth.sign_in_subtitle")}</p>
              </div>
            </div>
          </div>
          <div className="relative w-1/2 bg-white">
            <div className="h-full overflow-y-auto px-8 pb-20 pt-8 lg:px-10 lg:pb-24 lg:pt-10">
              {rightSideContent}
            </div>
          </div>
        </div>
      </div>
    </div>);
}