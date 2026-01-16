import { motion, AnimatePresence } from 'framer-motion';
import { Folder as FolderIcon, FileX, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Folder } from '@/types/folder';

interface MobileMoveFolderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder?: () => void;
}

export default function MobileMoveFolderSheet({
  isOpen,
  onClose,
  folders,
  onSelectFolder,
  onCreateFolder
}: MobileMoveFolderSheetProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[202]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[203] pb-safe max-h-[85vh] flex flex-col"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-bold text-black text-center">{t('dashboard.move_to_folder')}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <button
                onClick={() => {
                  onSelectFolder(null); // Move to Ungrouped
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500">
                   <FileX className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">{t('dashboard.folder.ungrouped')}</div>
                </div>
              </button>

              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    onSelectFolder(folder.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500">
                    <FolderIcon 
                        className="w-5 h-5" 
                        style={{ 
                            color: folder.color || 'currentColor',
                            fill: folder.color || 'currentColor',
                            fillOpacity: 0.2
                        }} 
                    />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900">{folder.name}</div>
                  </div>
                </button>
              ))}

              {onCreateFolder && (
                 <button
                    onClick={() => {
                        onCreateFolder();
                        // Don't close immediately, let the modal open
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 active:bg-gray-50 transition-colors mt-2"
                  >
                    <div className="p-2.5 rounded-full bg-gray-100 text-gray-500">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-600">{t('dashboard.new_folder')}</div>
                    </div>
                  </button>
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={onClose}
                    className="w-full py-3.5 text-center text-base font-semibold text-gray-500 bg-gray-100 rounded-xl active:bg-gray-200 transition-colors"
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
