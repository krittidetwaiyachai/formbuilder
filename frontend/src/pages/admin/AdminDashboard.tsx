import StatsGrid from '@/components/admin/StatsGrid';
import RecentActivityTable from '@/components/admin/RecentActivityTable';
import { PermissionGate } from '@/components/auth/PermissionGate';

export default function AdminDashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500">ภาพรวมระบบ Form Builder</p>
      </div>
      
      <PermissionGate permission="VIEW_ANALYTICS">
        <StatsGrid />
      </PermissionGate>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PermissionGate permission="VIEW_SYSTEM_LOGS">
          <RecentActivityTable />
        </PermissionGate>
        <PermissionGate permission="VIEW_ANALYTICS">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">สถิติรายเดือน</h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              Coming soon...
            </div>
          </div>
        </PermissionGate>
      </div>
    </div>
  );
}
