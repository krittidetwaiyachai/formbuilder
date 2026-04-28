import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import axios from "axios";
import { adminApi, type AdminSystemSettingsResponse } from "@/lib/adminApi";
import { useTranslation } from "react-i18next";

type SettingsNotice = {
  type: "success" | "error";
  text: string;
};

interface SettingsContextValue {
  snapshot: AdminSystemSettingsResponse | null;
  loadingSystem: boolean;
  notice: SettingsNotice | null;
  applySettings: (settings: AdminSystemSettingsResponse) => void;
  setNotice: (notice: SettingsNotice | null) => void;
  setSuccess: (text: string) => void;
  setError: (text: string) => void;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be within SettingsProvider");
  return ctx;
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [loadingSystem, setLoadingSystem] = useState(true);
  const [notice, setNotice] = useState<SettingsNotice | null>(null);
  const [snapshot, setSnapshot] = useState<AdminSystemSettingsResponse | null>(null);

  const applySettings = useCallback((settings: AdminSystemSettingsResponse) => {
    setSnapshot(settings);
  }, []);

  const setSuccess = useCallback((text: string) => setNotice({ type: "success", text }), []);
  const setError = useCallback((text: string) => setNotice({ type: "error", text }), []);

  const refreshSettings = useCallback(async () => {
    try {
      setLoadingSystem(true);
      const response = await adminApi.getSystemSettings();
      setSnapshot(response.data);
    } catch (error) {
      console.error("Failed to fetch system settings:", error);
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const messageKey =
        status === 403 ? "admin.settings.system.fetch_forbidden" :
        status === 404 ? "admin.settings.system.fetch_not_found" :
        "admin.settings.system.fetch_error";
      setNotice({ type: "error", text: t(messageKey) });
    } finally {
      setLoadingSystem(false);
    }
  }, [t]);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  return (
    <SettingsContext.Provider value={{
      snapshot,
      loadingSystem,
      notice,
      applySettings,
      setNotice,
      setSuccess,
      setError,
      refreshSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}
