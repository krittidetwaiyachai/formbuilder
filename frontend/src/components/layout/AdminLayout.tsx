import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import type { ComponentType } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Users,
  Package,
  LogOut,
  ChevronLeft,
  Shield,
  FileText,
  Settings,
  Database,
  Globe,
  FileBox } from
"lucide-react";
import { useTranslation } from "react-i18next";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { usePublicSettings } from "@/hooks/usePublicSettings";
type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{className?: string;}>;
};
export default function AdminLayout() {
  useSmoothScroll("admin-scroll-container");
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { settings } = usePublicSettings();
  const fallbackAppName = String(import.meta.env.VITE_APP_NAME || "Form Builder").trim() || "Form Builder";
  const appName = String(settings?.branding?.appName || fallbackAppName).trim() || fallbackAppName;
  const logoUrl = String(settings?.branding?.logoUrl || "").trim();
  const navItems: NavItem[] = [
  {
    to: "/admin/dashboard",
    label: t("admin.nav.dashboard"),
    icon: LayoutDashboard
  },
  {
    to: "/admin/users",
    label: t("admin.nav.users"),
    icon: Users
  },
  {
    to: "/admin/bundles",
    label: t("admin.nav.bundles"),
    icon: Package
  },
  {
    to: "/admin/forms",
    label: t("admin.nav.forms"),
    icon: FileBox
  },
  {
    to: "/admin/logs",
    label: t("admin.nav.logs"),
    icon: FileText
  },
  {
    to: "/admin/backup",
    label: t("admin.nav.backup"),
    icon: Database
  },
  {
    to: "/admin/settings",
    label: t("admin.nav.settings"),
    icon: Settings
  }];
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleBackToApp = () => {
    navigate("/dashboard");
  };
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 bg-black text-white flex flex-col border-r border-gray-800">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {logoUrl ?
            <img src={logoUrl} alt={appName} className="w-9 h-9 object-contain bg-white rounded-lg p-0.5" /> :
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-4.5 h-4.5 text-black" />
              </div>
            }
            <div className="min-w-0">
              <h1 className="font-semibold text-sm tracking-tight truncate">{appName}</h1>
              <p className="text-[11px] text-gray-500 truncate">{t("admin.layout.product_name")}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) =>
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
            isActive ?
            "bg-white text-black" :
            "text-gray-400 hover:text-white hover:bg-white/5"}`
            }>
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          )}
        </nav>
        <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-4">
          <div className="px-1 pb-2">
            <div className="flex items-center p-0.5 bg-white/5 rounded-lg border border-white/10">
              <button
                onClick={() => {i18n.changeLanguage('en');localStorage.setItem('i18nLng', 'en');}}
                className={`flex-1 flex items-center justify-center py-1.5 text-[11px] font-medium rounded-md transition-all ${!i18n.language.startsWith('th') ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}>
                EN
              </button>
              <button
                onClick={() => {i18n.changeLanguage('th');localStorage.setItem('i18nLng', 'th');}}
                className={`flex-1 flex items-center justify-center py-1.5 text-[11px] font-medium rounded-md transition-all ${i18n.language.startsWith('th') ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}>
                TH
              </button>
            </div>
          </div>
          <button
            onClick={handleBackToApp}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <ChevronLeft className="w-[18px] h-[18px]" />
            {t("admin.layout.back")}
          </button>
          <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-lg bg-white/5">
            {user?.photoUrl ?
            <img src={user.photoUrl} alt="" className="w-8 h-8 rounded-full" /> :
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{user?.firstName || user?.email}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut className="w-[18px] h-[18px]" />
            {t("admin.layout.logout")}
          </button>
        </div>
      </aside>
      <main id="admin-scroll-container" className="flex-1 overflow-y-auto h-screen">
        <Outlet />
      </main>
    </div>);
}