import { LayoutGrid, Folder as FolderIcon, FileX, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Folder } from '@/types/folder';
import { motion } from 'framer-motion';

interface FolderFiltersProps {
  folders: Folder[];
  activeFolderId: string | null;
  onFolderSelect: (id: string | null) => void;
  onCreateFolder?: () => void;
  showIndividualFolders?: boolean;
  isAuthenticated?: boolean;
  onLoginRequired?: () => void;
}

export default function FolderFilters({
  folders,
  activeFolderId,
  onFolderSelect,
  onCreateFolder,
  showIndividualFolders = true,
  isAuthenticated = true,
  onLoginRequired,
}: FolderFiltersProps) {
  const { t } = useTranslation();

  const handleFolderAction = (action: () => void) => {
    if (!isAuthenticated && onLoginRequired) {
      onLoginRequired();
      return;
    }
    action();
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide pt-2 -mx-1 px-1">
      {/* Create Folder Button */}
      {onCreateFolder && (
        <>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleFolderAction(onCreateFolder)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-dashed border-gray-300 text-xs font-medium text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all flex-shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('dashboard.new_folder')}
          </motion.button>
          <div className="w-[1px] h-6 bg-gray-200 mx-1 flex-shrink-0" />
        </>
      )}

      {/* All Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleFolderAction(() => onFolderSelect(null))}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0 ${
          activeFolderId === null 
            ? 'bg-black text-white border-black shadow-sm' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        {t('dashboard.folder.all')}
      </motion.button>
      
      {/* Ungrouped Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleFolderAction(() => onFolderSelect('ungrouped'))}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0 ${
          activeFolderId === 'ungrouped' 
            ? 'bg-black text-white border-black shadow-sm' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }`}
      >
        <FileX className="w-3.5 h-3.5" />
        {t('dashboard.folder.ungrouped')}
      </motion.button>

      {/* Folder Buttons - Only show when showIndividualFolders is true */}
      {showIndividualFolders && folders.map((folder, index) => (
        <motion.button
          key={folder.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleFolderAction(() => onFolderSelect(folder.id))}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0 ${
            activeFolderId === folder.id
              ? 'bg-black text-white border-black shadow-sm' 
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <FolderIcon 
            className="w-3.5 h-3.5 flex-shrink-0" 
            style={{ 
              color: activeFolderId === folder.id ? 'currentColor' : folder.color,
              fill: activeFolderId === folder.id ? 'currentColor' : folder.color,
              fillOpacity: activeFolderId === folder.id ? 1 : 0.2
            }} 
          />
          <span className="truncate max-w-[120px]">{folder.name}</span>
        </motion.button>
      ))}
    </div>
  );
}

