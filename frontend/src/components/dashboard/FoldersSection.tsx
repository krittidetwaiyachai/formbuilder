import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FolderCard from './FolderCard';
import type { Folder } from '@/types/folder';
import type { Form } from '@/types';
import { useTranslation } from 'react-i18next';

interface FoldersSectionProps {
  folders: Folder[];
  forms: Form[];
  onUpdateFolder: (id: string, name: string, color: string) => void;
  onDeleteFolder: (id: string) => void;
  onFormClick: (formId: string) => void;
  currentUserId?: string;
  formatDate: (date: string) => string;
  onContextMenu: (e: React.MouseEvent, formId: string) => void;
  onViewDetails: (e: React.MouseEvent, form: any) => void;
  onDeleteForm: (formId: string, e: React.MouseEvent) => void;
  onCollaboratorsClick: (e: React.MouseEvent, collaborators: any[], title: string, formId: string) => void;
}

export default function FoldersSection({
  folders,
  forms,
  onUpdateFolder,
  onDeleteFolder,
  onFormClick,
  currentUserId,
  formatDate,
  onContextMenu,
  onViewDetails,
  onDeleteForm,
  onCollaboratorsClick,
}: FoldersSectionProps) {
  const { t } = useTranslation();
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);

  const getFormsInFolder = (folderId: string) => {
    return forms.filter(f => (f as any).folderId === folderId);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolderId(current => current === folderId ? null : folderId);
  };

  // Sort folders: folders with forms first, then by name
  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => {
      const aCount = a._count?.forms || 0;
      const bCount = b._count?.forms || 0;
      
      // Folders with forms come first
      if (aCount > 0 && bCount === 0) return -1;
      if (aCount === 0 && bCount > 0) return 1;
      
      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [folders]);

  if (folders.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {t('dashboard.folders')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {folders.length} {folders.length === 1 ? t('dashboard.folder.count') : t('dashboard.folder.count_plural')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {sortedFolders.map((folder, index) => {
            const folderForms = getFormsInFolder(folder.id);
            const isExpanded = expandedFolderId === folder.id;
            
            return (
              <motion.div
                key={folder.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.2,
                  delay: index * 0.03
                }}
                className={`${
                  isExpanded ? 'md:col-span-2 lg:col-span-3' : ''
                }`}
              >
                <FolderCard
                  folder={folder}
                  forms={folderForms}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleFolder(folder.id)}
                  onUpdate={onUpdateFolder}
                  onDelete={onDeleteFolder}
                  onFormClick={onFormClick}
                  currentUserId={currentUserId}
                  formatDate={formatDate}
                  onContextMenu={onContextMenu}
                  onViewDetails={onViewDetails}
                  onDeleteForm={onDeleteForm}
                  onCollaboratorsClick={onCollaboratorsClick}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
