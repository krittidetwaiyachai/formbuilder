import { useState } from 'react';
import { Folder as FolderIcon, ChevronRight, MoreVertical, Edit2, Trash2, X } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import type { Folder } from '@/types/folder';
import type { Form } from '@/types';
import { useTranslation } from 'react-i18next';
import DashboardFormCard from './DashboardFormCard';
import DraggableFormCard from './DraggableFormCard';
import { motion, AnimatePresence } from 'framer-motion';

interface FolderCardProps {
  folder: Folder;
  forms: Form[];
  onUpdate: (id: string, name: string, color: string) => void;
  onDelete: (id: string) => void;
  onFormClick: (formId: string) => void;
  currentUserId?: string;
  formatDate: (date: string) => string;
  onContextMenu: (e: React.MouseEvent, formId: string) => void;
  onViewDetails: (e: React.MouseEvent, form: any) => void;
  onDeleteForm: (formId: string, e: React.MouseEvent) => void;
  onCollaboratorsClick: (e: React.MouseEvent, collaborators: any[], title: string, formId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function FolderCard({ 
  folder, 
  forms, 
  onUpdate, 
  onDelete, 
  onFormClick,
  currentUserId,
  formatDate,
  onContextMenu,
  onViewDetails,
  onDeleteForm,
  onCollaboratorsClick,
  isExpanded,
  onToggleExpand
}: FolderCardProps) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  
  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
    data: { type: 'folder', folderId: folder.id },
  });

  const handleEdit = () => {
    if (editName.trim() && editName !== folder.name) {
      onUpdate(folder.id, editName.trim(), folder.color);
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete(folder.id);
    setShowMenu(false);
  };

  const formCount = folder._count?.forms || forms.length;

  return (
    <div className="relative">
      <motion.div
        ref={setNodeRef}
        initial={false}
        animate={{
          borderColor: isOver ? folder.color : 'rgb(229, 231, 235)',
          backgroundColor: isOver ? `${folder.color}08` : 'white',
        }}
        className={`relative bg-white rounded-xl border-2 transition-all duration-200 ${
          isOver
            ? 'shadow-lg scale-[1.02]'
            : 'hover:border-gray-300 hover:shadow-md'
        }`}
      >
        {/* Main Folder Card */}
        <div className="p-4 flex items-center gap-3 group relative">
          {/* Expand/Collapse Arrow */}
          <button
            onClick={onToggleExpand}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors group/arrow relative"
            aria-label={isExpanded ? t('dashboard.folder.collapse') : t('dashboard.folder.expand')}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover/arrow:text-gray-700" />
            </motion.div>
          </button>

          {/* Folder Icon */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ 
              backgroundColor: `${folder.color}15`,
              border: `2px solid ${folder.color}30`
            }}
          >
            <FolderIcon 
              className="w-6 h-6" 
              style={{ color: folder.color }}
              fill={folder.color}
              fillOpacity={0.2}
            />
          </div>

          {/* Folder Info */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEdit();
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditName(folder.name);
                    }
                  }}
                  onBlur={handleEdit}
                  className="flex-1 px-2 py-1 text-sm font-semibold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  autoFocus
                />
                <button
                  onClick={handleEdit}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ) : (
              <>
                <h3 
                  className="font-semibold text-gray-900 truncate text-base"
                  onClick={() => onToggleExpand()}
                >
                  {folder.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {formCount} {t('dashboard.forms_count')}
                </p>
              </>
            )}
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-all ${
                showMenu ? 'opacity-100 bg-gray-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              aria-label={t('dashboard.folder.actions')}
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20"
                  >
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                      <span>{t('dashboard.context.rename')}</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{t('dashboard.context.delete')}</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Expanded Forms Grid */}
        <AnimatePresence>
          {isExpanded && forms.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {forms.map((form) => (
                    <DraggableFormCard key={form.id} formId={form.id}>
                      <DashboardFormCard
                        form={form as any}
                        currentUserId={currentUserId}
                        onCardClick={() => onFormClick(form.id)}
                        onContextMenu={(e) => onContextMenu(e, form.id)}
                        onViewDetails={(e) => onViewDetails(e, form)}
                        onDelete={(e) => onDeleteForm(form.id, e)}
                        onCollaboratorsClick={(e, collaborators, title, formId) => onCollaboratorsClick(e, collaborators, title, formId)}
                        formatDate={formatDate}
                        compact={true}
                      />
                    </DraggableFormCard>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {isExpanded && forms.length === 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 p-8 bg-gray-50/50"
          >
            <div className="text-center text-gray-400">
              <FolderIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('dashboard.folder.empty')}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
