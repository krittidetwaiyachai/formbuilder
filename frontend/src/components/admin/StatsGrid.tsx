import { Users, FileText, ClipboardList, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StatsResponse } from '@/lib/adminApi';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  stats: StatsResponse | null;
  loading: boolean;
}

export default function StatsGrid({ stats, loading }: StatsGridProps) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title={t('admin.stats.total_users')}
        value={stats?.totalUsers ?? 0}
        icon={<Users className="w-6 h-6 text-blue-600" />}
        color="bg-blue-50"
      />
      <StatCard
        title={t('admin.stats.total_forms')}
        value={stats?.totalForms ?? 0}
        icon={<FileText className="w-6 h-6 text-emerald-600" />}
        color="bg-emerald-50"
      />
      <StatCard
        title={t('admin.stats.total_submissions')}
        value={stats?.totalSubmissions ?? 0}
        icon={<ClipboardList className="w-6 h-6 text-purple-600" />}
        color="bg-purple-50"
      />
      <StatCard
        title={t('admin.stats.growth_rate')}
        value={`${stats?.growthRate && stats.growthRate > 0 ? '+' : ''}${stats?.growthRate?.toFixed(1) ?? '0'}%`}
        icon={
          (stats?.growthRate || 0) > 0 ? (
            <TrendingUp className="w-6 h-6 text-orange-600" />
          ) : (stats?.growthRate || 0) < 0 ? (
            <TrendingDown className="w-6 h-6 text-red-600" />
          ) : (
            <Minus className="w-6 h-6 text-gray-400" />
          )
        }
        color={
          (stats?.growthRate || 0) > 0 
            ? "bg-orange-50" 
            : (stats?.growthRate || 0) < 0 
              ? "bg-red-50" 
              : "bg-gray-50"
        }
      />
    </div>
  );
}

