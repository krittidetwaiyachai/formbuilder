import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import DraggableFormCard from './DraggableFormCard';
import DashboardFormCard from './DashboardFormCard';
import { Form } from '@/types';
import { useTranslation } from 'react-i18next';

interface UngroupedFormsSectionProps {
  forms: any[]; // Using any to avoid type complexity with FormWithStats for now, or import properly
  foldersCount: number;
  user: any;
  navigate: (path: string) => void;
  handleContextMenu: (e: React.MouseEvent, formId: string) => void;
  setSelectedForm: (form: any) => void;
  handleDeleteForm: (formId: string, e: React.MouseEvent) => void;
  setCollaboratorModalData: (data: any) => void;
  formatDate: (date: string) => string;
}

export default function UngroupedFormsSection({
  forms,
  foldersCount,
  user,
  navigate,
  handleContextMenu,
  setSelectedForm,
  handleDeleteForm,
  setCollaboratorModalData,
  formatDate
}: UngroupedFormsSectionProps) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({
    id: 'ungrouped',
  });

  return (
    <div 
      ref={setNodeRef}
      className={`rounded-xl transition-colors duration-200 min-h-[200px] ${
        isOver ? 'bg-indigo-50/50 ring-2 ring-indigo-200 ring-dashed' : ''
      }`}
    >
      {foldersCount > 0 && <h2 className="text-xl font-bold text-gray-900 mb-4 px-2 pt-2">{t('dashboard.all_forms')}</h2>}
      
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2"
      >
        <AnimatePresence mode="popLayout">
        {forms.map((form) => (
          <motion.div
            layout
            key={form.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <DraggableFormCard formId={form.id}>
              <DashboardFormCard
                form={form}
                currentUserId={user?.id}
                onCardClick={() => navigate(`/forms/${form.id}/builder`)}
                onContextMenu={(e) => handleContextMenu(e, form.id)}
                onViewDetails={(e) => {
                  e.stopPropagation();
                  setSelectedForm(form);
                }}
                onDelete={(e) => handleDeleteForm(form.id, e)}
                onCollaboratorsClick={(e, collaborators, title, formId) => {
                  e.stopPropagation();
                  setCollaboratorModalData({
                    isOpen: true,
                    collaborators,
                    formTitle: title,
                    formId
                  });
                }}
                formatDate={formatDate}
              />
            </DraggableFormCard>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
      
      {forms.length === 0 && isOver && (
        <div className="h-40 flex items-center justify-center text-indigo-400 font-medium">
          {t('dashboard.drop_ungroup')}
        </div>
      )}
    </div>
  );
}
