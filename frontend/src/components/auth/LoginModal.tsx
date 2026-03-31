import React, { useEffect, useMemo, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { X, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "../ui/toaster";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
function parseAllowedOrigins(rawValue: string | undefined) {
  return (rawValue || "http://localhost:5173").
  split(",").
  map((origin) => origin.trim()).
  filter(Boolean);
}
export default function LoginModal({
  isOpen,
  onClose,
  onSuccess
}: LoginModalProps) {
  const { login } = useAuthStore();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  const googleAllowedOrigins = useMemo(
    () => parseAllowedOrigins(import.meta.env.VITE_GOOGLE_ALLOWED_ORIGINS),
    []
  );
  const isGoogleOriginAllowed = googleAllowedOrigins.includes(window.location.origin);
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user, res.data.access_token);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Login failed", error);
      toast({
        title: t("auth.login_failed"),
        description: t("auth.invalid_credentials"),
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSuccess = async (credentialResponse: {credential?: string;}) => {
    try {
      const res = await api.post("/auth/google/login", {
        token: credentialResponse.credential
      });
      login(res.data.user, res.data.access_token);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Login failed", error);
      toast({
        title: t("auth.google_failed"),
        description: t("auth.google_error"),
        variant: "error"
      });
    }
  };
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
    useOneTap={isDesktop}
    theme="outline"
    shape="pill"
    size="large"
    width={isDesktop ? 350 : 320}
    logo_alignment={isDesktop ? "left" : undefined} /> :
  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Google Sign-In is disabled on this origin.
      Add <span className="font-semibold">{window.location.origin}</span> to the Google OAuth
      allowed origins, then update <span className="font-semibold">VITE_GOOGLE_ALLOWED_ORIGINS</span>.
    </div>;
  const formFields =
  <form onSubmit={handleEmailLogin} className={isDesktop ? "space-y-6" : "space-y-5"}>
      <div>
        <label
        className={
        isDesktop ?
        "block text-xs font-bold text-black/60 mb-3 uppercase tracking-wider" :
        "block text-sm font-medium text-gray-700 mb-2"
        }>
          {t("auth.email")}
        </label>
        <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={
        isDesktop ?
        "w-full px-0 py-3 border-0 border-b-2 border-black/20 focus:border-black transition-all outline-none bg-transparent text-black placeholder-black/30 text-lg" :
        "w-full px-4 py-4 bg-gray-100 border-0 rounded-xl text-base text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none"
        }
        placeholder={t("auth.email_placeholder")}
        required />
      </div>
      <div>
        <label
        className={
        isDesktop ?
        "block text-xs font-bold text-black/60 mb-3 uppercase tracking-wider" :
        "block text-sm font-medium text-gray-700 mb-2"
        }>
          {t("auth.password")}
        </label>
        <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={
        isDesktop ?
        "w-full px-0 py-3 border-0 border-b-2 border-black/20 focus:border-black transition-all outline-none bg-transparent text-black placeholder-black/30 text-lg" :
        "w-full px-4 py-4 bg-gray-100 border-0 rounded-xl text-base text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none"
        }
        placeholder={t("auth.password_placeholder")}
        required />
      </div>
      <button
      type="submit"
      disabled={isLoading}
      className={
      isDesktop ?
      "w-full bg-black text-white py-4 rounded-2xl hover:bg-black/80 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 uppercase tracking-wider" :
      "w-full bg-black text-white py-4 rounded-full font-semibold text-base active:bg-gray-800 transition-colors disabled:opacity-50"
      }>
        {isLoading ? t("auth.signing_in") : t("auth.sign_in_button")}
      </button>
    </form>;
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
            <div className="mt-8">
              <h1 className="mb-2 text-[32px] font-bold text-black">
                {t("auth.sign_in")}
              </h1>
              <p className="mb-8 text-base text-gray-500">
                {t("auth.sign_in_subtitle")}
              </p>
              <div className="mb-6 flex justify-center">{googleAuthBlock}</div>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-400">
                    {t("auth.or_continue")}
                  </span>
                </div>
              </div>
              {formFields}
            </div>
          </div>
        </div>
      </div>);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
      <div className="relative h-[600px] w-full max-w-5xl animate-in overflow-hidden rounded-3xl bg-white shadow-2xl fade-in zoom-in duration-500">
        <button
          onClick={onClose}
          className="group absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200">
          <X className="h-5 w-5 text-gray-600 transition-all duration-300 group-hover:rotate-90 group-hover:text-black" />
        </button>
        <div className="flex h-full">
          <div className="relative w-1/2 overflow-hidden bg-black">
            <div className="absolute -right-24 top-0 bottom-0 z-10 w-48 skew-x-[-8deg] transform bg-black"></div>
            <div className="relative z-20 flex h-full flex-col justify-center px-16">
              <div className="space-y-8">
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
                  <h1 className="mb-3 text-6xl font-black leading-none text-white">
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
                <p className="text-lg font-medium text-gray-400">
                  {t("auth.sign_in_subtitle")}
                </p>
              </div>
            </div>
          </div>
          <div className="relative flex w-1/2 items-center bg-white p-16">
            <div className="mx-auto w-full max-w-sm">
              <h2 className="mb-8 text-3xl font-bold text-black">
                {t("auth.sign_in")}
              </h2>
              <div className="mb-8 p-4">{googleAuthBlock}</div>
              <div className="relative mb-8">
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
              <p className="mt-8 text-center text-xs leading-relaxed text-black/40">
                {t("auth.protected_by")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);
}