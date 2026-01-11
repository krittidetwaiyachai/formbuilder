import { useState } from 'react';
import { Folder as FolderIcon, ChevronDown, ChevronRight, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import type { Folder } from '@/types/folder';
import type { Form } from '@/types';
import DashboardFormCard from './DashboardFormCard';
import DraggableFormCard from './DraggableFormCard';


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
  const [showMenu, setShowMenu] = useState(false);
  
  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
    data: { type: 'folder', folderId: folder.id },
  });



  return (
    <div>
      <div
        ref={setNodeRef}
        className={`relative bg-white rounded-xl border-2 transition-all ${
          isOver
            ? 'border-black bg-gray-50 shadow-lg'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <div className="p-4 flex items-center gap-3 group relative z-10">
          <button
            onClick={onToggleExpand}
            className="flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>

          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${folder.color}20` }}
          >
            <FolderIcon className="w-5 h-5" style={{ color: folder.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
            <p className="text-sm text-gray-500">{folder._count.forms} forms</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      const newName = prompt('New folder name:', folder.name);
                      if (newName && newName.trim()) {
                        onUpdate(folder.id, newName.trim(), folder.color);
                      }
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      onDelete(folder.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {isExpanded && forms.length > 0 && (
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
        )}
      </div>
    </div>
  );
}
