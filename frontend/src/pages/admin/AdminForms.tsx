import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper } from
"@tanstack/react-table";
import { adminApi, type AdminForm } from "@/lib/adminApi";
import { Search, ChevronLeft, ChevronRight, Eye, Edit, BarChart, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, th } from "date-fns/locale";
import { useHasPermission } from "@/hooks/usePermissions";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
const columnHelper = createColumnHelper<AdminForm>();
export default function AdminForms() {
  const [forms, setForms] = useState<AdminForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const hasManageForms = useHasPermission("MANAGE_FORMS");
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const relativeTimeLocale = useMemo(
    () => i18n.language.startsWith("th") ? th : enUS,
    [i18n.language]
  );
  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getForms({ page, limit: 10, search: globalFilter });
      setForms(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (error) {
      console.error("Failed to fetch forms:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchForms();
  }, [page, globalFilter]);
  const handleDeleteForm = async (id: string, title: string) => {
    if (!window.confirm(`${t("admin.forms.delete_confirm")}\n\n${title}\n\n${t("admin.forms.delete_confirm_desc")}`)) {
      return;
    }
    try {
      setDeletingId(id);
      await adminApi.deleteForm(id);
      fetchForms();
    } catch (error) {
      console.error("Failed to delete form:", error);
      alert(t("admin.forms.delete_failed"));
    } finally {
      setDeletingId(null);
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <span className="inline-flex px-3 py-1 whitespace-nowrap rounded text-xs font-semibold bg-gray-100 text-gray-700">{t("admin.forms.status.published")}</span>;
      case "ARCHIVED":
        return <span className="inline-flex px-3 py-1 whitespace-nowrap rounded text-xs font-semibold bg-gray-900 text-white">{t("admin.forms.status.archived")}</span>;
      default:
        return <span className="inline-flex px-3 py-1 whitespace-nowrap rounded text-xs font-semibold bg-gray-50 text-gray-400">{t("admin.forms.status.draft")}</span>;
    }
  };
  const columns = useMemo(
    () => [
    columnHelper.accessor("title", {
      header: t("admin.forms.table.title"),
      cell: (info) =>
      <div className="flex flex-col gap-1">
            <span className="text-base font-medium text-gray-900">{info.getValue() || t("admin.forms.untitled")}</span>
            <span className="text-sm text-gray-400 font-mono">ID: {info.row.original.id}</span>
          </div>
    }),
    columnHelper.accessor("createdBy.email", {
      header: t("admin.forms.table.owner"),
      cell: (info) => {
        const user = info.row.original.createdBy;
        return (
          <div className="flex flex-col gap-1">
              <span className="text-base font-medium text-gray-700">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}` : t("admin.forms.unknown_user")}
              </span>
              <span className="text-sm text-gray-400">{user.email}</span>
            </div>);
      }
    }),
    columnHelper.accessor("status", {
      header: t("admin.forms.table.status"),
      cell: (info) => getStatusBadge(info.getValue())
    }),
    columnHelper.accessor("_count.responses", {
      header: t("admin.forms.table.responses"),
      cell: (info) => <span className="text-base font-medium text-gray-600">{info.getValue()}</span>
    }),
    columnHelper.accessor("createdAt", {
      header: t("admin.forms.table.created"),
      cell: (info) =>
      <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(info.getValue()), {
          addSuffix: true,
          locale: relativeTimeLocale
        })}
          </span>
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const form = info.row.original;
        const isDeleting = deletingId === form.id;
        return (
          <div className="flex items-center justify-end gap-1">
              <button
              onClick={() => navigate(`/forms/${form.id}/preview`)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title={t("admin.forms.table.action_preview")}>
                <Eye className="w-4 h-4" />
              </button>
              {hasManageForms &&
            <>
                  <button
                onClick={() => navigate(`/forms/${form.id}/builder`)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title={t("admin.forms.table.action_edit")}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                onClick={() => navigate(`/forms/${form.id}/analytics`)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title={t("admin.forms.table.action_analytics")}>
                    <BarChart className="w-4 h-4" />
                  </button>
                  <button
                disabled={isDeleting}
                onClick={() => handleDeleteForm(form.id, form.title)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-30"
                title={t("admin.forms.table.action_delete")}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
            }
            </div>);
      }
    })],
    [deletingId, hasManageForms, relativeTimeLocale, t, navigate]
  );
  const table = useReactTable({
    data: forms,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages
  });
  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {t("admin.forms.title")}
        </h1>
        <p className="text-sm text-gray-400 mt-1">{t("admin.forms.description")}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("admin.forms.search_placeholder")}
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
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
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
                <td key={j} className="px-6 py-5">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                )}
                  </tr>
              ) :
              forms.length === 0 ?
              <tr>
                  <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-base text-gray-400">
                    {t("admin.forms.empty")}
                  </td>
                </tr> :
              table.getRowModel().rows.map((row) =>
              <tr
                key={row.id}
                className="hover:bg-gray-50/50 transition-colors">
                    {row.getVisibleCells().map((cell) =>
                <td key={cell.id} className="px-6 py-5">
                        {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                      </td>
                )}
                  </tr>
              )
              }
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {t("admin.users.page_info", { page, total: totalPages })}
          </p>
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
      </div>
    </div>);
}