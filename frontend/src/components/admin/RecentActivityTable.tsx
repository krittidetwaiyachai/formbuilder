import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import type { StatsResponse } from "@/lib/adminApi";
import { formatDistanceToNow } from "date-fns";
import { enUS, th } from "date-fns/locale";
import { useTranslation } from "react-i18next";
export default function RecentActivityTable() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const relativeTimeLocale = useMemo(
    () => i18n.language.startsWith("th") ? th : enUS,
    [i18n.language]
  );
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats();
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      form_created: t("admin.activity.form_created"),
      form_updated: t("admin.activity.form_updated"),
      form_published: t("admin.activity.form_published"),
      form_deleted: t("admin.activity.form_deleted"),
      field_added: t("admin.activity.field_added"),
      field_updated: t("admin.activity.field_updated"),
      field_deleted: t("admin.activity.field_deleted")
    };
    return labels[action] || action;
  };
  const getActionColor = (action: string) => {
    if (action.includes("delete")) return "bg-gray-900 text-white";
    if (action.includes("create") || action.includes("add")) return "bg-gray-100 text-gray-800";
    if (action.includes("publish")) return "bg-gray-200 text-gray-700";
    return "bg-gray-50 text-gray-600";
  };
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-5">{t("admin.activity.title")}</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) =>
          <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-9 h-9 bg-gray-100 rounded-full" />
              <div className="flex-1">
                <div className="h-3.5 bg-gray-100 rounded w-48 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-32" />
              </div>
            </div>
          )}
        </div>
      </div>);
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-5">{t("admin.activity.title")}</h3>
      {stats?.recentActivity?.length === 0 ?
      <p className="text-gray-400 text-center py-8 text-sm">{t("admin.activity.no_activity")}</p> :
      <div className="space-y-1">
          {stats?.recentActivity?.map((activity) =>
        <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
              {activity.user?.photoUrl ?
          <img src={activity.user.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> :
          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-500">
                  {activity.user?.firstName?.[0] || activity.user?.email?.[0]?.toUpperCase()}
                </div>
          }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900">{activity.user?.firstName || activity.user?.email}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${getActionColor(activity.action)}`}>
                    {getActionLabel(activity.action)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{activity.form?.title || t("admin.activity.deleted_form")}</p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
                locale: relativeTimeLocale
              })}
                </p>
              </div>
            </div>
        )}
        </div>
      }
    </div>);
}