import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus } from 'lucide-react';
import FolderCard from './FolderCard';
import type { Folder } from '@/types/folder';
import type { Form } from '@/types';

interface FoldersSectionProps {
  folders: Folder[];
  forms: Form[];
  onCreateFolder: () => void;
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
  onCreateFolder,
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
  const getFormsInFolder = (folderId: string) => {
    return forms.filter(f => (f as any).folderId === folderId);
  };

  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolderId(current => current === folderId ? null : folderId);
  };



  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Folders</h2>
        <button
          onClick={onCreateFolder}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all font-medium"
        >
          <FolderPlus className="w-4 h-4" />
          New Folder
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {folders.map((folder) => (
            <motion.div
              layout
              key={folder.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`transition-all duration-300 ${
                expandedFolderId === folder.id ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''
              }`}
            >
              <FolderCard
                folder={folder}
                forms={getFormsInFolder(folder.id)}
                isExpanded={expandedFolderId === folder.id}
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
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
