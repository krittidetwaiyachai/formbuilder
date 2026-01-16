import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filterStatus: string;
  onFilterChange: (status: string) => void;
  sortOrder: string;
  onSortChange: (sort: string) => void;
}

export default function MobileFilterSheet({
  isOpen,
  onClose,
  filterStatus,
  onFilterChange,
  sortOrder,
  onSortChange,
}: MobileFilterSheetProps) {
  const { t } = useTranslation();

  const STATUS_OPTIONS = [
    { key: 'All', label: t('dashboard.filters.all') },
    { key: 'PUBLISHED', label: t('dashboard.filters.published') },
    { key: 'DRAFT', label: t('dashboard.filters.draft') },
    { key: 'ARCHIVED', label: t('dashboard.filters.archived') }
  ];

  const SORT_OPTIONS = [
    { key: 'newest', label: t('dashboard.sort.newest') || 'Newest' },
    { key: 'oldest', label: t('dashboard.sort.oldest') || 'Oldest' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[61] overflow-hidden flex flex-col max-h-[85vh] safe-area-pb"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{t('dashboard.filters.title') || 'Filter & Sort'}</h3>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full active:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 overflow-y-auto">
              
              {/* Sort Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('dashboard.sort.title') || 'Sort By'}</h4>
                <div className="grid grid-cols-1 gap-3">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => onSortChange(option.key)}
                      className={`flex items-center justify-between w-full px-5 py-4 rounded-xl text-left transition-all ${
                        sortOrder === option.key
                          ? 'bg-black text-white shadow-lg shadow-black/10 ring-2 ring-black ring-offset-2'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="font-semibold">{option.label}</span>
                      {sortOrder === option.key && <Check className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('dashboard.filters.status') || 'Status'}</h4>
                <div className="flex flex-wrap gap-3">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => onFilterChange(option.key)}
                      className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                        filterStatus === option.key
                          ? 'bg-black text-white shadow-md ring-2 ring-black ring-offset-2'
                          : 'bg-gray-50 text-gray-700 border border-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
