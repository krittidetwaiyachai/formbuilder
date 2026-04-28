import { useEffect, useState } from "react";
import api from "@/lib/api";

export interface PublicSettings {
  contact?: {
    supportEmail?: string;
    supportLineId?: string;
  };
  branding?: {
    appName?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
  passwordPolicy?: {
    minLength?: number;
  };
  authPolicy?: {
    sessionIdleTimeoutMinutes?: number;
  };
}

let publicSettingsCache: PublicSettings | null = null;
let publicSettingsPromise: Promise<PublicSettings> | null = null;
let publicSettingsFetchedAt = 0;
const PUBLIC_SETTINGS_TTL_MS = 5 * 60 * 1000;

async function fetchPublicSettings(): Promise<PublicSettings> {
  const response = await api.get<PublicSettings>("/system/public-settings");
  return response.data || {};
}

export async function getPublicSettings(forceRefresh = false): Promise<PublicSettings> {
  const isCacheFresh =
    publicSettingsCache !== null && Date.now() - publicSettingsFetchedAt < PUBLIC_SETTINGS_TTL_MS;

  if (!forceRefresh && isCacheFresh) {
    return publicSettingsCache;
  }
  if (!forceRefresh && publicSettingsPromise) {
    return publicSettingsPromise;
  }

  publicSettingsPromise = fetchPublicSettings()
    .then((data) => {
      publicSettingsCache = data;
      publicSettingsFetchedAt = Date.now();
      return data;
    })
    .finally(() => {
      publicSettingsPromise = null;
    });

  return publicSettingsPromise;
}

export function invalidatePublicSettingsCache() {
  publicSettingsCache = null;
  publicSettingsFetchedAt = 0;
}

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(publicSettingsCache);
  const [loading, setLoading] = useState<boolean>(!publicSettingsCache);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    void getPublicSettings()
      .then((data) => {
        if (!active) return;
        setSettings(data);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { settings, loading, error };
}
