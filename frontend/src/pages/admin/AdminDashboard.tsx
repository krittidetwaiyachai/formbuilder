import { useEffect, useState } from "react";
import StatsGrid from "@/components/admin/StatsGrid";
import RecentActivityTable from "@/components/admin/RecentActivityTable";
import MonthlyChart from "@/components/admin/MonthlyChart";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { adminApi } from "@/lib/adminApi";
import type { StatsResponse } from "@/lib/adminApi";
import { FileText, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
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
  return (
    <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
      <div className="pb-2">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t("admin.dashboard.title")}</h1>
        <p className="text-sm text-gray-400 mt-1">{t("admin.dashboard.subtitle")}</p>
      </div>
      <PermissionGate permission="VIEW_ANALYTICS">
        <StatsGrid stats={stats} loading={loading} />
      </PermissionGate>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PermissionGate permission="VIEW_ANALYTICS">
          <div className="space-y-6">
            <MonthlyChart
              title={t("admin.dashboard.monthly_submissions")}
              data={stats?.monthlyStats || []}
              dataKey="submissions"
              color="#000" />
            <MonthlyChart
              title={t("admin.dashboard.monthly_forms")}
              data={stats?.monthlyForms || []}
              dataKey="value"
              color="#666" />
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{t("admin.dashboard.popular_forms")}</h3>
                  <p className="text-xs text-gray-400">{t("admin.dashboard.popular_forms_desc")}</p>
                </div>
              </div>
              <div className="space-y-2">
                {stats?.popularForms.map((form, index) =>
                <div
                  key={form.id}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                      index === 0 ?
                      "bg-gray-900 text-white" :
                      index === 1 ?
                      "bg-gray-200 text-gray-700" :
                      index === 2 ?
                      "bg-gray-100 text-gray-600" :
                      "bg-gray-50 text-gray-400"}`
                      }>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{form.title}</p>
                        <p className="text-[11px] text-gray-400">
                          {t("admin.dashboard.form_id")}: {form.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-md border border-gray-100">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-700">{form.submissions}</span>
                    </div>
                  </div>
                )}
                {(!stats?.popularForms || stats.popularForms.length === 0) &&
                <div className="text-center py-8 text-sm text-gray-400">{t("admin.dashboard.no_data")}</div>
                }
              </div>
            </div>
          </div>
        </PermissionGate>
        <PermissionGate permission="VIEW_SYSTEM_LOGS">
          <RecentActivityTable />
        </PermissionGate>
      </div>
    </div>);
}