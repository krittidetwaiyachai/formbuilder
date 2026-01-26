import UserTable from '@/components/admin/UserTable';
import { useTranslation } from 'react-i18next';

export default function AdminUsers() {
  const { t } = useTranslation();
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.users.title')}</h1>
        <p className="text-gray-500">{t('admin.users.description')}</p>
      </div>
      
      <UserTable />
    </div>
  );
}
