import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, BarChart3, Clock, FolderInput, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  formTitle: string;
  onEdit: () => void;
  onPreview: () => void;
  onAnalytics: () => void;
  onActivity: () => void;
  onDelete: () => void;
  onMove: () => void;
}

export default function MobileActionSheet({
  isOpen,
  onClose,
  formTitle,
  onEdit,
  onPreview,
  onAnalytics,
  onActivity,
  onDelete,
  onMove,
}: MobileActionSheetProps) {
  const { t } = useTranslation();

  const actions = [
    { icon: FileText, label: t('dashboard.context.edit'), onClick: onEdit },
    { icon: Eye, label: t('dashboard.context.preview'), onClick: onPreview },
    { icon: BarChart3, label: t('dashboard.context.analytics'), onClick: onAnalytics },
    { icon: Clock, label: t('dashboard.context.activity'), onClick: onActivity },
  ];

  const secondaryActions = [
      { icon: FolderInput, label: t('dashboard.move_to_folder'), onClick: onMove },
      { icon: Trash2, label: t('dashboard.context.delete'), onClick: onDelete, danger: true },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[200]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[201] pb-safe"
          >
            <div className="p-4">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              
              <h3 className="text-lg font-bold text-black text-center mb-4 truncate px-4">{formTitle}</h3>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      action.onClick();
                      onClose();
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <div className="p-3 rounded-full bg-black text-white">
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>

               <div className="grid grid-cols-2 gap-3 mb-6">
                {secondaryActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      action.onClick();
                      onClose();
                    }}
                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl transition-colors ${
                        action.danger 
                            ? 'bg-red-50 text-red-600 active:bg-red-100' 
                            : 'bg-gray-50 text-gray-700 active:bg-gray-100'
                    }`}
                  >
                     <action.icon className="w-5 h-5" />
                    <span className="text-sm font-semibold">{action.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 text-center text-base font-semibold text-black bg-gray-100 rounded-xl active:bg-gray-200 transition-colors"
              >
                {t('dashboard.modal.cancel')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

