import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, LogOut, Mail, Copy, ExternalLink, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import LoginModal from "@/components/auth/LoginModal";
import UserAvatar from "@/components/common/UserAvatar";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";
const normalizeSupportEmail = (value: string) =>
String(value || "").trim().replace(/^mailto:/i, "").replace(/^['"]|['"]$/g, "");
const normalizeSupportLine = (value: string) =>
String(value || "").trim().replace(/^['"]|['"]$/g, "");
export default function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fallbackSupportEmail = normalizeSupportEmail(
    String(import.meta.env.VITE_SUPPORT_EMAIL || "support@formbuilder.com")
  );
  const fallbackSupportLine = normalizeSupportLine(
    String(import.meta.env.VITE_SUPPORT_LINE || "@formbuilder")
  );
  const fallbackAppName = String(import.meta.env.VITE_APP_NAME || "Form Builder").trim() || "Form Builder";
  const [supportEmail, setSupportEmail] = useState(fallbackSupportEmail);
  const [supportLine, setSupportLine] = useState(fallbackSupportLine);
  const [appName, setAppName] = useState(fallbackAppName);
  const [brandingLogoUrl, setBrandingLogoUrl] = useState("");
  const [brandingPrimaryColor, setBrandingPrimaryColor] = useState("#111827");
  const supportWebmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    supportEmail
  )}`;
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSupportEmailCopied, setIsSupportEmailCopied] = useState(false);
  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [isAuthenticated, user]);
  useEffect(() => {
    let mounted = true;
    const fetchPublicSettings = async () => {
      try {
        const response = await api.get<{
          contact?: {
            supportEmail?: string;
            supportLineId?: string;
          };
          branding?: {
            appName?: string;
            logoUrl?: string;
            primaryColor?: string;
          };
        }>("/system/public-settings");
        if (!mounted) return;
        setSupportEmail(
          normalizeSupportEmail(response.data?.contact?.supportEmail || fallbackSupportEmail) || fallbackSupportEmail
        );
        setSupportLine(
          normalizeSupportLine(response.data?.contact?.supportLineId || fallbackSupportLine) || fallbackSupportLine
        );
        setAppName(String(response.data?.branding?.appName || fallbackAppName).trim() || fallbackAppName);
        setBrandingLogoUrl(String(response.data?.branding?.logoUrl || "").trim());
        setBrandingPrimaryColor(String(response.data?.branding?.primaryColor || "#111827").trim() || "#111827");
      } catch (error) {
        console.error("Failed to fetch public settings:", error);
        if (!mounted) return;
        setSupportEmail(fallbackSupportEmail);
        setSupportLine(fallbackSupportLine);
        setAppName(fallbackAppName);
        setBrandingLogoUrl("");
        setBrandingPrimaryColor("#111827");
      }
    };
    void fetchPublicSettings();
    return () => {
      mounted = false;
    };
  }, []);
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleCopySupportEmail = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(supportEmail);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = supportEmail;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setIsSupportEmailCopied(true);
      setTimeout(() => setIsSupportEmailCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy support email:", error);
    }
  };
  return (
    <nav className="bg-white border-b border-gray-300 flex-shrink-0 relative z-50">      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        <div className="flex justify-between h-16">          <div className="flex">            <Link
              to={isAuthenticated ? "/dashboard" : "/"}
              className="flex items-center">
              {brandingLogoUrl ?
              <img src={brandingLogoUrl} alt={appName} className="h-8 w-8 object-contain" /> :
              <FileText className="h-8 w-8" style={{ color: brandingPrimaryColor }} />
              }
              <span className="ml-2 text-xl font-bold text-black">{appName}</span>
            </Link>
          </div>          <div className="flex items-center">            {isAuthenticated ?
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 relative">              <LanguageSwitcher />              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                title={t("admin.layout.contact")}
                aria-label={t("admin.layout.contact")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                <Mail className="h-4 w-4" />
              </button>
              <div
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 pr-2 pl-1 py-1 rounded-full transition-all duration-300 border border-gray-200 group cursor-pointer relative z-40">                  <UserAvatar
                  user={user || {}}
                  className="h-8 w-8 group-hover:scale-105 transition-transform duration-300 border-2 border-white shadow-sm" />                  <div className="hidden md:block text-left mr-1">                  <p className="text-sm font-bold text-gray-800 leading-none">                    {user?.firstName || user?.email?.split("@")[0]}                  </p>                  <p className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 mt-0.5">                    {user?.role}                  </p>                </div>              </div>              {}              {isProfileMenuOpen &&
              <>                <div
                  className="fixed inset-0 z-30 bg-transparent"
                  onClick={() => setIsProfileMenuOpen(false)} />                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-40 origin-top-right animate-in fade-in zoom-in-95 duration-200">                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50">                    <UserAvatar
                      user={user || {}}
                      className="h-10 w-10 shadow-sm" />                        <div className="overflow-hidden">                      <p className="text-sm font-bold text-gray-900 truncate">                        {user?.firstName} {user?.lastName}                      </p>                      <p className="text-xs text-gray-500 truncate">                        {user?.email}                      </p>                    </div>                  </div>                  <div className="space-y-1">                    {user?.role === "SUPER_ADMIN" &&
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate("/admin");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium mb-1">                        <FileText className="h-4 w-4" />                        {t("admin.admin_console", "Admin Console")}                      </button>
                    }                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">                          <LogOut className="h-4 w-4" />                      {t("sign_out")}                    </button>                  </div>                </div>              </>
              }              {}              {}            </div> :
            <div className="flex items-center gap-3">              <LanguageSwitcher />              <div className="relative group/btn">                {}                <div className="absolute -inset-10 pointer-events-none overflow-hidden z-20">                  {}                  <svg
                    className="absolute w-4 h-4 text-yellow-300 opacity-60 group-hover/btn:opacity-100 transition-all duration-500"
                    style={{
                      top: "30%",
                      left: "75%",
                      animation:
                      "float-1 3s ease-in-out infinite, twinkle 2s ease-in-out infinite"
                    }}
                    viewBox="0 0 24 24"
                    fill="currentColor">                      <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />                  </svg>                  {}                  <svg
                    className="absolute w-3.5 h-3.5 text-pink-300 opacity-50 group-hover/btn:opacity-100 transition-all duration-500"
                    style={{
                      top: "25%",
                      left: "25%",
                      animation:
                      "float-2 4s ease-in-out infinite, spin-slow 6s linear infinite"
                    }}
                    viewBox="0 0 24 24"
                    fill="currentColor">                      <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />                  </svg>                  {}                  <svg
                    className="absolute w-3 h-3 text-purple-300 opacity-60 group-hover/btn:opacity-100 transition-all duration-500"
                    style={{
                      top: "65%",
                      left: "20%",
                      animation:
                      "float-3 5s ease-in-out infinite, pulse 3s ease-in-out infinite"
                    }}
                    viewBox="0 0 24 24"
                    fill="currentColor">                      <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />                  </svg>                  {}                  <svg
                    className="absolute w-3.5 h-3.5 text-blue-300 opacity-50 group-hover/btn:opacity-100 transition-all duration-500"
                    style={{
                      top: "70%",
                      left: "80%",
                      animation:
                      "float-4 4s ease-in-out infinite, spin-reverse 8s linear infinite"
                    }}
                    viewBox="0 0 24 24"
                    fill="currentColor">                      <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />                  </svg>                  {}                  <svg
                    className="absolute w-2.5 h-2.5 text-white opacity-70 group-hover/btn:opacity-100 transition-all duration-500"
                    style={{
                      top: "10%",
                      left: "50%",
                      filter: "drop-shadow(0 0 2px white)",
                      animation:
                      "float-2 3s ease-in-out infinite, twinkle 1s ease-in-out infinite"
                    }}
                    viewBox="0 0 24 24"
                    fill="currentColor">                      <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />                  </svg>                  <style>                    {`
                      @keyframes float-1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-5px, -8px); } }
                      @keyframes float-2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(5px, -5px); } }
                      @keyframes float-3 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-8px, 5px); } }
                      @keyframes float-4 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(8px, 8px); } }
                      @keyframes twinkle { 
                        0%, 100% { opacity: 0.4; transform: scale(0.8); } 
                        50% { opacity: 1; transform: scale(1.2); } 
                      }
                      @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                      @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                      @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }
                      @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        50% { transform: translateX(100%); }
                        100% { transform: translateX(100%); }
                      }
                      @keyframes pulse-ring {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2); }
                        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
                      }
                    `}                  </style>                </div>                {}                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="relative z-10 overflow-hidden inline-flex items-center justify-center px-6 py-2.5 font-bold text-white transition-all duration-300 bg-gray-900 rounded-full focus:outline-none hover:bg-black hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    animation:
                    "pulse-ring 3s infinite cubic-bezier(0.4, 0, 0.6, 1)"
                  }}>                    {}                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                      transform: "translateX(-100%)",
                      animation: "shimmer 3s infinite"
                    }} />                    <span className="relative flex items-center gap-2 z-10">                    {t("sign_in")}                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6" />                      </svg>                  </span>                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                title={t("admin.layout.contact")}
                aria-label={t("admin.layout.contact")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                <Mail className="h-4 w-4" />
              </button>
            </div>
            }
          </div>        </div>      </div>      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onContactClick={() => {
          setIsLoginModalOpen(false);
          setIsContactModalOpen(true);
        }}
        onSuccess={() => navigate("/dashboard")} />
      <Dialog
        open={isContactModalOpen}
        onOpenChange={(open) => {
          setIsContactModalOpen(open);
          if (!open) {
            setIsSupportEmailCopied(false);
          }
        }}>
        <DialogContent className="!fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 w-[calc(100vw-1.5rem)] max-w-[420px] rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.16)] sm:p-6">
          <button
            type="button"
            onClick={() => setIsContactModalOpen(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label={t("dashboard.modal.close", "Close")}>
            <X className="h-4 w-4" />
            <span className="sr-only">{t("dashboard.modal.close", "Close")}</span>
          </button>
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {t("admin.layout.contact_dialog_title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {t("admin.layout.contact_dialog_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t("admin.layout.contact_email_label")}
              </p>
              <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                {supportEmail}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t("admin.layout.contact_line_label")}
              </p>
              <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                {supportLine}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopySupportEmail}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Copy className="h-4 w-4" />
                <span>
                  {isSupportEmailCopied ? t("common.copied") : t("admin.layout.copy_email")}
                </span>
              </button>
              <a
                href={supportWebmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsContactModalOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
                <ExternalLink className="h-4 w-4" />
                <span>{t("admin.layout.open_mail_app")}</span>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </nav>);
}