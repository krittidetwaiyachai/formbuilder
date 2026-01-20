import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Edit2, Loader2 } from 'lucide-react';
import { adminApi, Role } from '@/lib/adminApi';
import { PermissionGate } from '@/components/auth/PermissionGate';

export default function AdminSettings() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await adminApi.getRoles();
        setRoles(response.data);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ตั้งค่าระบบ</h1>
        <p className="text-gray-500">จัดการ Roles และ Permissions</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Roles</h2>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Users</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{role.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{role.description || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{role._count?.users || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {Array.isArray(role.permissions) ? role.permissions.length : 0} permissions
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <PermissionGate permission="MANAGE_ROLES">
                      <button
                        onClick={() => navigate(`/admin/roles/${role.id}`)}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
