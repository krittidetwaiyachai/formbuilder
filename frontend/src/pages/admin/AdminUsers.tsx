import UserTable from "@/components/admin/UserTable";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import CreateLocalUserModal from "@/components/admin/CreateLocalUserModal";
import type { AdminCreateLocalUserResponse } from "@/lib/adminApi";

export default function AdminUsers() {
  const { t } = useTranslation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("admin.users.title")}
        </h1>
        <p className="text-gray-500">{t("admin.users.description")}</p>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black transition-colors ring-1 ring-inset ring-gray-900/10"
        >
          {t("admin.users.create_local_user")}
        </button>
      </div>
      <UserTable key={refreshKey} onRefresh={() => setRefreshKey((v) => v + 1)} />
      <CreateLocalUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(_user: AdminCreateLocalUserResponse) => {
          setRefreshKey((v) => v + 1);
        }}
      />
    </div>
  );
}