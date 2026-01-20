import { useEffect, useState } from 'react';
import { Users, FileText, ClipboardList, TrendingUp } from 'lucide-react';
import { adminApi, StatsResponse } from '@/lib/adminApi';

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

export default function StatsGrid() {
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
        title="ผู้ใช้ทั้งหมด"
        value={stats?.totalUsers ?? 0}
        icon={<Users className="w-6 h-6 text-blue-600" />}
        color="bg-blue-50"
      />
      <StatCard
        title="ฟอร์มทั้งหมด"
        value={stats?.totalForms ?? 0}
        icon={<FileText className="w-6 h-6 text-emerald-600" />}
        color="bg-emerald-50"
      />
      <StatCard
        title="การตอบกลับทั้งหมด"
        value={stats?.totalSubmissions ?? 0}
        icon={<ClipboardList className="w-6 h-6 text-purple-600" />}
        color="bg-purple-50"
      />
      <StatCard
        title="อัตราการเติบโต"
        value="+12%"
        icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
        color="bg-orange-50"
      />
    </div>
  );
}
