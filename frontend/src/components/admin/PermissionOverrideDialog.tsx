import { useState, useEffect } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { adminApi, AdminUser } from '@/lib/adminApi';
import { ALL_PERMISSIONS, PERMISSION_LABELS, Permission } from '@/lib/permissions';

interface PermissionOverrideDialogProps {
  userId: string;
  onClose: () => void;
  onSave?: () => void;
}

export default function PermissionOverrideDialog({ userId, onClose, onSave }: PermissionOverrideDialogProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [useCustom, setUseCustom] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await adminApi.getUserPermissions(userId);
        setUser(response.data);
        
        if (response.data.permissionOverrides && Array.isArray(response.data.permissionOverrides)) {
          setUseCustom(true);
          setSelectedPermissions(response.data.permissionOverrides);
        } else {
          setUseCustom(false);
          setSelectedPermissions(response.data.role.permissions || []);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  const handleTogglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleToggleCustom = () => {
    if (useCustom) {
      setSelectedPermissions(user?.role.permissions || []);
    }
    setUseCustom(!useCustom);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.setUserPermissions(userId, useCustom ? selectedPermissions : null);
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Permission Override</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100">
            <input
              type="checkbox"
              checked={useCustom}
              onChange={handleToggleCustom}
              className="w-5 h-5 rounded border-gray-300"
            />
            <div>
              <p className="font-medium text-gray-900">Use Custom Permissions</p>
              <p className="text-sm text-gray-500">
                {useCustom ? 'Override role permissions' : `Using ${user.role.name} role permissions`}
              </p>
            </div>
          </div>

          {useCustom && (
            <div className="space-y-2">
              {ALL_PERMISSIONS.map((permission) => {
                const isChecked = selectedPermissions.includes(permission);
                const isDangerous = permission === 'BYPASS_PDPA';

                return (
                  <label
                    key={permission}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
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
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {PERMISSION_LABELS[permission as Permission]}
                      {isDangerous && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
