import {
  Users,
  FileText,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Minus } from
"lucide-react";
import type { StatsResponse } from "@/lib/adminApi";
import { useTranslation } from "react-i18next";
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}
function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>);
}
interface StatsGridProps {
  stats: StatsResponse | null;
  loading: boolean;
}
export default function StatsGrid({ stats, loading }: StatsGridProps) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) =>
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="h-3 bg-gray-100 rounded w-20 mb-4" />
          <div className="h-8 bg-gray-100 rounded w-16" />
        </div>
        )}
      </div>);
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={t("admin.stats.total_users")}
        value={stats?.totalUsers ?? 0}
        icon={<Users className="w-5 h-5 text-gray-600" />} />
      <StatCard
        title={t("admin.stats.total_forms")}
        value={stats?.totalForms ?? 0}
        icon={<FileText className="w-5 h-5 text-gray-600" />} />
      <StatCard
        title={t("admin.stats.total_submissions")}
        value={stats?.totalSubmissions ?? 0}
        icon={<ClipboardList className="w-5 h-5 text-gray-600" />} />
      <StatCard
        title={t("admin.stats.growth_rate")}
        value={`${stats?.growthRate && stats.growthRate > 0 ? "+" : ""}${stats?.growthRate?.toFixed(1) ?? "0"}%`}
        icon={
        (stats?.growthRate || 0) > 0 ?
        <TrendingUp className="w-5 h-5 text-gray-600" /> :
        (stats?.growthRate || 0) < 0 ?
        <TrendingDown className="w-5 h-5 text-gray-600" /> :
        <Minus className="w-5 h-5 text-gray-400" />
        } />
    </div>);
}