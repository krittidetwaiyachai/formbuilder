import UserTable from "@/components/admin/UserTable";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import CreateLocalUserModal from "@/components/admin/CreateLocalUserModal";
import type { AdminCreateLocalUserResponse } from "@/lib/adminApi";
import { Plus } from "lucide-react";
export default function AdminUsers() {
  const { t } = useTranslation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="max-w-7xl mx-auto px-8 py-10 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {t("admin.users.title")}
          </h1>
          <p className="text-sm text-gray-400 mt-1">{t("admin.users.description")}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition-colors">
          <Plus className="w-4 h-4" />
          {t("admin.users.create_local_user")}
        </button>
      </div>
      <UserTable key={refreshKey} onRefresh={() => setRefreshKey((v) => v + 1)} />
      <CreateLocalUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(_user: AdminCreateLocalUserResponse) => {
          setRefreshKey((v) => v + 1);
        }} />
    </div>);
}