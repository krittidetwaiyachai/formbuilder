import { useEffect, useState } from 'react';
import StatsGrid from '@/components/admin/StatsGrid';
import RecentActivityTable from '@/components/admin/RecentActivityTable';
import MonthlyChart from '@/components/admin/MonthlyChart';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { adminApi, StatsResponse } from '@/lib/adminApi';
import { FileText, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.dashboard.title')}</h1>
        <p className="text-gray-500">{t('admin.dashboard.subtitle')}</p>
      </div>
      
      <PermissionGate permission="VIEW_ANALYTICS">
        <StatsGrid stats={stats} loading={loading} />
      </PermissionGate>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PermissionGate permission="VIEW_ANALYTICS">
          <div className="space-y-8">
            <MonthlyChart 
              title={t('admin.dashboard.monthly_submissions')}
              data={stats?.monthlyStats || []}
              dataKey="submissions"
              color="#6366f1"
            />
            
            <MonthlyChart 
              title={t('admin.dashboard.monthly_forms')}
              data={stats?.monthlyForms || []}
              dataKey="value"
              color="#10b981"
            />
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('admin.dashboard.popular_forms')}</h3>
                  <p className="text-sm text-gray-500">{t('admin.dashboard.popular_forms_desc')}</p>
                </div>
              </div>

              <div className="space-y-4">
                {stats?.popularForms.map((form, index) => (
                  <div key={form.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                        ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          index === 1 ? 'bg-gray-200 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{form.title}</p>
                        <p className="text-xs text-gray-500">ID: {form.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm border border-gray-100">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">{form.submissions}</span>
                    </div>
                  </div>
                ))}
                {(!stats?.popularForms || stats.popularForms.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    {t('admin.dashboard.no_data')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </PermissionGate>

        <PermissionGate permission="VIEW_SYSTEM_LOGS">
          <RecentActivityTable />
        </PermissionGate>
      </div>
    </div>
  );
}
