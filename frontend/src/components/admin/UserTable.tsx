import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { adminApi, AdminUser, Role } from '@/lib/adminApi';
import { Search, ChevronLeft, ChevronRight, Ban, CheckCircle, UserCog, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import PermissionOverrideDialog from './PermissionOverrideDialog';
import { useHasPermission } from '@/hooks/usePermissions';

const columnHelper = createColumnHelper<AdminUser>();

interface UserTableProps {
  onRefresh?: () => void;
}

export default function UserTable({ onRefresh }: UserTableProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [permissionOverrideUserId, setPermissionOverrideUserId] = useState<string | null>(null);
  
  const hasManageUsers = useHasPermission('MANAGE_USERS');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        adminApi.getUsers({ page, limit: 10, search: globalFilter }),
        adminApi.getRoles(),
      ]);
      setUsers(usersRes.data.data);
      setTotalPages(usersRes.data.meta.totalPages);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, globalFilter]);

  const handleToggleBan = async (userId: string) => {
    try {
      await adminApi.toggleBan(userId);
      fetchUsers();
      onRefresh?.();
    } catch (error) {
      console.error('Failed to toggle ban:', error);
    }
  };

  const handleUpdateRole = async (userId: string, roleId: string) => {
    try {
      await adminApi.updateUserRole(userId, roleId);
      setEditingRole(null);
      fetchUsers();
      onRefresh?.();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: 'bg-red-100 text-red-700 border-red-200',
      ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
      EDITOR: 'bg-blue-100 text-blue-700 border-blue-200',
      VIEWER: 'bg-gray-100 text-gray-700 border-gray-200',
      USER: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return colors[roleName] || colors.USER;
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('email', {
        header: 'ผู้ใช้',
        cell: (info) => {
          const user = info.row.original;
          return (
            <div className="flex items-center gap-3">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                  {user.firstName?.[0] || user.email[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('role.name', {
        header: 'Role',
        cell: (info) => {
          const user = info.row.original;
          const isEditing = editingRole === user.id;

          if (isEditing) {
            return (
              <select
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue={user.role.id}
                onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                onBlur={() => setEditingRole(null)}
                autoFocus
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            );
          }

          return (
            <button
              onClick={() => setEditingRole(user.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role.name)} hover:opacity-80 transition-opacity`}
            >
              {user.role.name}
            </button>
          );
        },
      }),
      columnHelper.accessor('provider', {
        header: 'Provider',
        cell: (info) => (
          <span className="text-sm text-gray-600 capitalize">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('isActive', {
        header: 'สถานะ',
        cell: (info) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              info.getValue()
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {info.getValue() ? 'Active' : 'Banned'}
          </span>
        ),
      }),
      columnHelper.accessor('lastActiveAt', {
        header: 'เข้าใช้งานล่าสุด',
        cell: (info) => {
          const value = info.getValue();
          if (!value) return <span className="text-gray-400">ไม่ทราบ</span>;
          return (
            <span className="text-sm text-gray-600">
              {formatDistanceToNow(new Date(value), { addSuffix: true, locale: th })}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => {
          const user = info.row.original;
          if (!hasManageUsers) return null;
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleBan(user.id)}
                className={`p-2 rounded-lg transition-colors ${
                  user.isActive
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
                title={user.isActive ? 'แบนผู้ใช้' : 'ปลดแบน'}
              >
                {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setEditingRole(user.id)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                title="เปลี่ยน Role"
              >
                <UserCog className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPermissionOverrideUserId(user.id)}
                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                title="Override Permissions"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
          );
        },
      }),
    ],
    [editingRole, roles]
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาผู้ใช้..."
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                  ไม่พบผู้ใช้
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          หน้า {page} จาก {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

      {permissionOverrideUserId && (
        <PermissionOverrideDialog
          userId={permissionOverrideUserId}
          onClose={() => setPermissionOverrideUserId(null)}
          onSave={() => {
            fetchUsers();
            onRefresh?.();
          }}
        />
      )}
    </>
  );
}
