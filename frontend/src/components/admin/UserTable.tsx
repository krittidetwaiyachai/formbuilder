import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper } from
"@tanstack/react-table";
import { adminApi } from "@/lib/adminApi";
import type { AdminUser, Role } from "@/lib/adminApi";
import { Search, ChevronLeft, ChevronRight, Ban, CheckCircle, UserCog, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, th } from "date-fns/locale";
import { useHasPermission } from "@/hooks/usePermissions";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const columnHelper = createColumnHelper<AdminUser>();
interface UserTableProps {
  onRefresh?: () => void;
}
const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-gray-900 text-white",
  ADMIN: "bg-gray-700 text-white",
  EDITOR: "bg-gray-200 text-gray-800",
  VIEWER: "bg-gray-100 text-gray-600",
  USER: "bg-gray-50 text-gray-500"
};
export default function UserTable({ onRefresh }: UserTableProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const hasManageUsers = useHasPermission("MANAGE_USERS");
  const { t, i18n } = useTranslation();
  const relativeTimeLocale = useMemo(
    () => i18n.language.startsWith("th") ? th : enUS,
    [i18n.language]
  );
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
      adminApi.getUsers({ page, limit: 10, search: globalFilter }),
      adminApi.getRoles()]
      );
      setUsers(usersRes.data.data);
      setTotalPages(usersRes.data.meta.totalPages);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
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
      console.error("Failed to toggle ban:", error);
    }
  };
  const handleUpdateRole = async (userId: string, roleId: string) => {
    try {
      await adminApi.updateUserRole(userId, roleId);
      setEditingRole(null);
      fetchUsers();
      onRefresh?.();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };
  const columns = useMemo(
    () => [
    columnHelper.accessor("email", {
      header: t("admin.users.table.user"),
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="flex items-center gap-3">
              {user.photoUrl ?
            <img src={user.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> :
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-500">
                  {user.firstName?.[0] || user.email[0].toUpperCase()}
                </div>
            }
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                </p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>);
      }
    }),
    columnHelper.accessor("role.name", {
      header: t("admin.users.table.role"),
      cell: (info) => {
        const user = info.row.original;
        return (
          <span
            className={`inline-flex px-2.5 py-1 rounded text-[11px] font-semibold tracking-wide ${ROLE_BADGE[user.role.name] || ROLE_BADGE.USER}`}>
              {user.role.name}
            </span>);
      }
    }),
    columnHelper.accessor("provider", {
      header: t("admin.users.table.provider"),
      cell: (info) => <span className="text-xs text-gray-500 capitalize">{info.getValue()}</span>
    }),
    columnHelper.accessor("isActive", {
      header: t("admin.users.table.status"),
      cell: (info) =>
      <span
        className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
        info.getValue() ? "bg-gray-100 text-gray-700" : "bg-gray-900 text-white"}`
        }>
            {info.getValue() ? t("admin.users.status.active") : t("admin.users.status.banned")}
          </span>
    }),
    columnHelper.accessor("lastActiveAt", {
      header: t("admin.users.table.last_active"),
      cell: (info) => {
        const value = info.getValue();
        if (!value) {
          return <span className="text-xs text-gray-300">{t("admin.users.status.unknown")}</span>;
        }
        return (
          <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(value), {
              addSuffix: true,
              locale: relativeTimeLocale
            })}
            </span>);
      }
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const user = info.row.original;
        const isEditing = editingRole === user.id;
        if (!hasManageUsers) return null;
        return (
          <div className="flex items-center justify-end gap-1.5">
              {isEditing ?
            <div className="flex items-center gap-1.5">
                  <Select
                value={user.role.id}
                onValueChange={(value) => void handleUpdateRole(user.id, value)}
                onOpenChange={(open) => {
                  if (!open) {
                    setEditingRole(null);
                  }
                }}>
                    <SelectTrigger className="h-8 w-[160px] rounded-lg border-gray-300 bg-gray-50 text-gray-900 text-xs font-medium shadow-none focus:ring-2 focus:ring-gray-900/10 focus:ring-offset-0">
                      <SelectValue placeholder={t("admin.users.action.select_role")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-gray-200 p-1 shadow-lg">
                      {roles.map((role) =>
                  <SelectItem
                    key={role.id}
                    value={role.id}
                    className="rounded-md text-xs font-medium data-[state=checked]:bg-gray-900 data-[state=checked]:text-white">
                          {role.name}
                        </SelectItem>
                  )}
                    </SelectContent>
                  </Select>
                  <button
                onClick={() => setEditingRole(null)}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div> :
            <button
              onClick={() => setEditingRole(user.id)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title={t("admin.users.action.change_role")}>
                  <UserCog className="w-4 h-4" />
                </button>
            }
              <button
              onClick={() => handleToggleBan(user.id)}
              className={`p-2 rounded-md transition-colors ${
              user.isActive ? "text-gray-400 hover:text-gray-900 hover:bg-gray-100" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`
              }
              title={user.isActive ? t("admin.users.action.ban") : t("admin.users.action.unban")}>
                {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </button>
            </div>);
      }
    })],
    [editingRole, hasManageUsers, relativeTimeLocale, roles, t]
  );
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages
  });
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("admin.users.search_placeholder")}
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            {table.getHeaderGroups().map((headerGroup) =>
            <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) =>
              <th
                key={header.id}
                className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
              )}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ?
            Array.from({ length: 5 }).map((_, i) =>
            <tr key={i}>
                  {columns.map((_, j) =>
              <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
              )}
                </tr>
            ) :
            users.length === 0 ?
            <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-400">
                  {t("admin.users.no_users")}
                </td>
              </tr> :
            table.getRowModel().rows.map((row) =>
            <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) =>
              <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
              )}
                </tr>
            )
            }
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400">{t("admin.users.page_info", { page, total: totalPages })}</p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>);
}