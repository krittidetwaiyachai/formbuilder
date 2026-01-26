import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Package, Search } from 'lucide-react';
import api from '@/lib/api';
import { PermissionGate } from '@/components/auth/PermissionGate';
import Loader from '@/components/common/Loader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';

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
  const [searchQuery, setSearchQuery] = useState('');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchBundles = async () => {
    try {
      const response = await api.get('/bundles');
      setBundles(response.data);
    } catch (error) {
      console.error('Failed to fetch bundles:', error);
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
      console.error('Failed to delete bundle:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await api.post('/bundles', {
        name: 'Untitled Bundle',
        fields: [],
        isActive: false, 
      });
      navigate(`/admin/bundles/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create bundle:', error);
    }
  };

  const filteredBundles = bundles.filter(bundle => 
    bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bundle.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.bundles.title')}</h1>
          <p className="text-gray-500">{t('admin.bundles.description')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder={t('admin.bundles.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all w-64 text-sm"
            />
          </div>
          <PermissionGate permission="MANAGE_BUNDLES">
            <button 
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              {t('admin.bundles.create')}
            </button>
          </PermissionGate>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader />
          </div>
        ) : filteredBundles.length === 0 ? (
          <div className="p-12 text-center">
            {searchQuery ? (
               <>
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('admin.bundles.empty_search')}</p>
               </>
            ) : (
               <>
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('admin.bundles.empty_all')}</p>
               </>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.bundles.table.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.bundles.table.fields')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.bundles.table.updated')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.bundles.table.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBundles.map((bundle) => (
                <tr key={bundle.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{bundle.name}</p>
                      {bundle.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">{bundle.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {bundle._count?.fields || 0} fields
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {new Date(bundle.updatedAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bundle.isActive 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {bundle.isActive ? t('admin.bundles.status.published') : t('admin.bundles.status.draft')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <PermissionGate permission="MANAGE_BUNDLES">
                        <button 
                          onClick={() => navigate(`/admin/bundles/${bundle.id}`)}
                          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(bundle.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

       <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('admin.bundles.delete_confirm')}
        description={t('admin.bundles.delete_confirm_desc')}
        onConfirm={confirmDelete}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
      />
    </div>
  );
}
