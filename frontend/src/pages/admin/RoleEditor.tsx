import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Loader2, Users, AlertTriangle, 
  FileText, Eye, Download, Settings, ShieldAlert 
} from 'lucide-react';
import { adminApi, Role } from '@/lib/adminApi';
import { PERMISSION_LABELS, PERMISSION_DESCRIPTIONS, Permission } from '@/lib/permissions';

interface PermissionCategory {
  name: string;
  icon: React.ReactNode;
  permissions: Permission[];
  isDanger?: boolean;
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    name: 'การจัดการผู้ใช้',
    icon: <Users className="w-5 h-5" />,
    permissions: ['MANAGE_USERS', 'MANAGE_ROLES', 'VIEW_USER_DATA'],
  },
  {
    name: 'การจัดการฟอร์ม',
    icon: <FileText className="w-5 h-5" />,
    permissions: ['MANAGE_FORMS', 'MANAGE_TEMPLATES', 'MANAGE_BUNDLES'],
  },
  {
    name: 'การดูข้อมูล',
    icon: <Eye className="w-5 h-5" />,
    permissions: ['VIEW_RESPONSES', 'VIEW_ANALYTICS', 'VIEW_SYSTEM_LOGS', 'VIEW_AUDIT_LOG'],
  },
  {
    name: 'การนำออกข้อมูล',
    icon: <Download className="w-5 h-5" />,
    permissions: ['EXPORT_DATA'],
  },
  {
    name: 'การตั้งค่าระบบ',
    icon: <Settings className="w-5 h-5" />,
    permissions: ['MANAGE_SETTINGS'],
  },
  {
    name: 'สิทธิ์อันตราย',
    icon: <ShieldAlert className="w-5 h-5" />,
    permissions: ['DELETE_RESPONSES', 'BYPASS_PDPA'],
    isDanger: true,
  },
];

export default function RoleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadRole = async () => {
      if (!id) return;
      try {
        const response = await adminApi.getRole(id);
        setRole(response.data);
        const perms = response.data.permissions;
        setSelectedPermissions(Array.isArray(perms) ? perms : []);
        setDescription(response.data.description || '');
      } catch (error) {
        console.error('Failed to load role:', error);
        navigate('/admin/settings');
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [id, navigate]);

  const handleTogglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = async () => {
    if (!id || !role) return;
    setSaving(true);
    try {
      await Promise.all([
        adminApi.updateRolePermissions(id, selectedPermissions),
        description !== role.description && adminApi.updateRoleDescription(id, description),
      ]);
      navigate('/admin/settings');
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Role not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/settings')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Edit Role: {role.name}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {role._count?.users || 0} users
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </header>

      <div className="max-w-3xl mx-auto p-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="คำอธิบาย Role..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {PERMISSION_CATEGORIES.map((category) => (
          <div
            key={category.name}
            className={`bg-white rounded-2xl shadow-sm border p-6 ${
              category.isDanger ? 'border-red-200' : 'border-gray-100'
            }`}
          >
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${
              category.isDanger ? 'text-red-700' : 'text-gray-900'
            }`}>
              <span className={category.isDanger ? 'text-red-500' : 'text-gray-600'}>
                {category.icon}
              </span>
              {category.name}
            </h2>
            <div className="space-y-3">
              {category.permissions.map((permission) => {
                const isChecked = selectedPermissions.includes(permission);
                const isDangerous = permission === 'BYPASS_PDPA' || permission === 'DELETE_RESPONSES';

                return (
                  <label
                    key={permission}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isChecked
                        ? isDangerous
                          ? 'border-red-300 bg-red-50'
                          : 'border-blue-300 bg-blue-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePermission(permission)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {PERMISSION_LABELS[permission]}
                        </span>
                        {isDangerous && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {PERMISSION_DESCRIPTIONS[permission]}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
