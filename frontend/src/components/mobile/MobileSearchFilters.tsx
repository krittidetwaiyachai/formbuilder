import { Search, SlidersHorizontal, LayoutGrid, Folder as FolderIcon, FileX, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Folder } from '@/types/folder';

interface MobileSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  activeFiltersCount?: number;
  folders?: Folder[];
  activeFolderId?: string | null;
  onFolderSelect?: (id: string | null) => void;
  onCreateFolder?: () => void;
}

export default function MobileSearchFilters({
  searchTerm,
  onSearchChange,
  onFilterClick,
  activeFiltersCount = 0,
  folders = [],
  activeFolderId = null,
  onFolderSelect,
  onCreateFolder,
}: MobileSearchFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="md:hidden sticky top-[0px] z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 space-y-3 shadow-sm">
      <div className="flex gap-2.5">
        <div className="flex-1 relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('dashboard.search_placeholder')}
            className="w-full h-11 pl-10 pr-4 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-200 outline-none placeholder:text-gray-400 transition-all"
          />
        </div>
        <button
          onClick={onFilterClick}
          className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all active:scale-95 ${
            activeFiltersCount > 0 ? 'bg-black text-white shadow-md' : 'bg-gray-50 border border-gray-100 text-gray-500 active:bg-gray-100'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Folder Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {onCreateFolder && (
          <button
            onClick={onCreateFolder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-dashed border-gray-300 text-xs font-medium text-gray-500 active:bg-gray-50 active:border-gray-400 flex-shrink-0 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('dashboard.new_folder')}
          </button>
        )}

         <div className="w-[1px] h-4 bg-gray-200 mx-1 flex-shrink-0" />

        <button
          onClick={() => onFolderSelect?.(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
            activeFolderId === null 
              ? 'bg-black text-white border-black' 
              : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          {t('dashboard.folder.all')}
        </button>
        
        <button
          onClick={() => onFolderSelect?.('ungrouped')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
            activeFolderId === 'ungrouped' 
              ? 'bg-black text-white border-black' 
              : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          <FileX className="w-3.5 h-3.5" />
          {t('dashboard.folder.ungrouped')}
        </button>

        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onFolderSelect?.(folder.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              activeFolderId === folder.id 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {folder.color ? (
              <FolderIcon 
                className="w-3.5 h-3.5" 
                style={{ 
                    color: activeFolderId === folder.id ? 'currentColor' : folder.color,
                    fill: activeFolderId === folder.id ? 'currentColor' : folder.color,
                    fillOpacity: 0.2
                }} 
              />
            ) : (
              <FolderIcon className="w-3.5 h-3.5" />
            )}
            {folder.name}
          </button>
        ))}
      </div>
    </div>
  );
}
