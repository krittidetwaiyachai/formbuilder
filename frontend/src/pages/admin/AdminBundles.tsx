import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Package, Search } from "lucide-react";
import api from "@/lib/api";
import { PermissionGate } from "@/components/auth/PermissionGate";
import Loader from "@/components/common/Loader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useTranslation } from "react-i18next";
interface Bundle {
  id: string;
  name: string;
  description?: string;
  isPII: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    fields: number;
  };
}
export default function AdminBundles() {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const fetchBundles = async () => {
    try {
      const response = await api.get("/bundles");
      setBundles(response.data);
    } catch (error) {
      console.error("Failed to fetch bundles:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBundles();
  }, []);
  const handleDeleteClick = (id: string) => {
    setBundleToDelete(id);
    setDeleteConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!bundleToDelete) return;
    try {
      await api.delete(`/bundles/${bundleToDelete}`);
      fetchBundles();
    } catch (error) {
      console.error("Failed to delete bundle:", error);
    }
  };
  const handleCreate = async () => {
    try {
      const response = await api.post("/bundles", {
        name: t("admin.bundles.new_bundle_name"),
        fields: [],
        isActive: false
      });
      navigate(`/admin/bundles/${response.data.id}`);
    } catch (error) {
      console.error("Failed to create bundle:", error);
    }
  };
  const filteredBundles = bundles.filter(
    (bundle) =>
    bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bundle.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const dateLocale = i18n.language.startsWith("th") ? "th-TH" : "en-US";
  return (
    <div className="max-w-7xl mx-auto px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t("admin.bundles.title")}</h1>
          <p className="text-sm text-gray-400 mt-1">{t("admin.bundles.description")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("admin.bundles.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all w-56 text-sm" />
          </div>
          <PermissionGate permission="MANAGE_BUNDLES">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors whitespace-nowrap">
              <Plus className="w-4 h-4" />
              {t("admin.bundles.create")}
            </button>
          </PermissionGate>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ?
        <div className="flex items-center justify-center p-12">
            <Loader />
          </div> :
        filteredBundles.length === 0 ?
        <div className="p-12 text-center">
            {searchQuery ?
          <>
                <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">{t("admin.bundles.empty_search")}</p>
              </> :
          <>
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">{t("admin.bundles.empty_all")}</p>
              </>
          }
          </div> :
        <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {t("admin.bundles.table.name")}
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {t("admin.bundles.table.fields")}
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {t("admin.bundles.table.updated")}
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {t("admin.bundles.table.status")}
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBundles.map((bundle) =>
            <tr key={bundle.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bundle.name}</p>
                      {bundle.description &&
                  <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{bundle.description}</p>
                  }
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {t("admin.bundles.table.fields_count", {
                  count: bundle._count?.fields || 0
                })}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(bundle.updatedAt).toLocaleDateString(dateLocale, {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                  bundle.isActive ? "bg-gray-100 text-gray-700" : "bg-gray-50 text-gray-400"}`
                  }>
                      {bundle.isActive ? t("admin.bundles.status.published") : t("admin.bundles.status.draft")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <PermissionGate permission="MANAGE_BUNDLES">
                        <button
                      onClick={() => navigate(`/admin/bundles/${bundle.id}`)}
                      className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                      onClick={() => handleDeleteClick(bundle.id)}
                      className="p-2 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        }
      </div>
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t("admin.bundles.delete_confirm")}
        description={t("admin.bundles.delete_confirm_desc")}
        onConfirm={confirmDelete}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive" />
    </div>);
}