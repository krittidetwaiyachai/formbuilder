import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  searchTerm: string;
  onCreateForm: () => void;
}

export default function EmptyState({ searchTerm, onCreateForm }: EmptyStateProps) {
  const { t } = useTranslation();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 mt-4"
    >
      <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{t('dashboard.empty.title')}</h3>
      <p className="text-gray-500 mt-2 max-w-sm mx-auto">
        {searchTerm 
          ? t('dashboard.empty.no_search')
          : t('dashboard.empty.no_forms')}
      </p>
      {!searchTerm && (
        <button
          onClick={onCreateForm}
          className="mt-6 text-black font-semibold hover:underline"
        >
          {t('dashboard.empty.create_first')} &rarr;
        </button>
      )}
    </motion.div>
  );
}
