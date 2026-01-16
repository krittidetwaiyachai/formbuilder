import { FileText, Clock, Users, Maximize2, Trash2, Eye, BarChart3, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from '@/components/common/UserAvatar';
import type { Form } from '@/types';
import { useTranslation } from 'react-i18next';

interface DashboardFormCardProps {
  form: Form & {
    responseCount?: number;
    viewCount?: number;
    _count?: { responses: number };
    collaborators?: any[];
    createdBy?: any;
  };
  currentUserId?: string;
  onCardClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onViewDetails: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onCollaboratorsClick: (e: React.MouseEvent, collaborators: any[], title: string, formId: string) => void;
  formatDate: (date: string) => string;
  compact?: boolean;
}

export default function DashboardFormCard({
  form,
  currentUserId,
  onCardClick,
  onContextMenu,
  onViewDetails,
  onDelete,
  onCollaboratorsClick,
  formatDate,
  compact = false,
}: DashboardFormCardProps) {
  const { t } = useTranslation();
  const allEditors = [form.createdBy, ...(form.collaborators || [])].filter(Boolean);

  return (
    <div
      onClick={onCardClick}
      onContextMenu={onContextMenu}
      className={`group bg-white rounded-2xl border border-gray-100 relative overflow-hidden flex flex-col hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 cursor-pointer ${
        compact ? 'text-sm' : ''
      }`}
    >
      {/* Clean Header */}
      <div className={`${compact ? 'h-16' : 'h-24'} bg-gray-50/50 border-b border-gray-100 relative overflow-hidden group-hover:bg-gray-50 transition-colors`}>
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${
              form.status === 'PUBLISHED' 
                ? 'bg-emerald-100/50 text-emerald-700 border border-emerald-100' 
                : form.status === 'ARCHIVED'
                ? 'bg-gray-100 text-gray-500 border border-gray-200'
                : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}>
               {form.status === 'PUBLISHED' 
                 ? t('dashboard.filters.published') 
                 : form.status === 'ARCHIVED' 
                   ? t('dashboard.filters.archived') 
                   : t('dashboard.filters.draft')}
            </span>
            
            {currentUserId !== form.createdById && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Users className="w-3 h-3" />
                {t('dashboard.form.shared')}
              </span>
            )}
          </div>
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1">
          <button
            onClick={onViewDetails}
            className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all transform hover:scale-105"
            title="View Details"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 transition-all transform hover:scale-105"
            title="Delete Form"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={`absolute ${compact ? '-bottom-6 -right-6 text-gray-100' : '-bottom-4 -right-4 text-gray-100'} transform rotate-12 group-hover:scale-105 group-hover:rotate-6 transition-all duration-500`}>
          <FileText className={`${compact ? 'w-20 h-20' : 'w-24 h-24'} opacity-50`} />
        </div>
      </div>

      <div className={`${compact ? 'p-3' : 'p-5'} flex-1 flex flex-col`}>
        <div className="mb-3">
          <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-black transition-colors leading-snug tracking-tight`}>
            {form.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] leading-relaxed">
            {form.description || t('dashboard.form.no_description')}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div 
            className="flex items-center gap-2 cursor-pointer -ml-1 p-1 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onCollaboratorsClick(e, allEditors, form.title, form.id);
            }}
          >
            <div className={`flex -space-x-2 overflow-hidden pointer-events-none items-center ${compact ? 'scale-90 origin-left' : ''}`}>
              {allEditors.slice(0, 3).map((editor: any, index) => (
                <div key={index} className="relative ring-2 ring-white rounded-full">
                  <UserAvatar 
                    user={editor} 
                    className="h-6 w-6"
                  />
                </div>
              ))}
              {allEditors.length > 3 && (
                <div className="relative flex items-center justify-center h-6 w-6 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-medium text-gray-500 ring-2 ring-white">
                  +{allEditors.length - 3}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
            <Clock className="w-3 h-3" />
            {formatDate(form.updatedAt)}
          </div>
        </div>

        {/* Stats Row */}
        {!compact && (
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
           <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
             <Inbox className="w-3.5 h-3.5 text-gray-400" />
             <span>{form.responseCount || form._count?.responses || 0} Responses</span>
           </div>
           <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
             <Eye className="w-3.5 h-3.5 text-gray-400" />
             <span>{form.viewCount || 0} Views</span>
           </div>
        </div>
        )}
      </div>

      {/* Modern Actions Footer */}
      <div className="p-3 bg-gray-50/30 border-t border-gray-100 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCardClick();
          }}
          className="flex items-center justify-center px-2 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-all shadow-sm active:scale-95"
          title="Edit Form"
        >
          <FileText className="w-3.5 h-3.5 mr-1" />
          {t('dashboard.context.edit')}
        </button>
        
        <Link
          to={`/forms/${form.id}/preview`}
          className="flex items-center justify-center px-2 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-black transition-all shadow-sm text-xs font-medium"
          target="_blank"
          title="Preview"
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          {t('dashboard.context.preview')}
        </Link>

        <button
          onClick={() => window.location.href = `/forms/${form.id}/analytics`}
          className="flex items-center justify-center px-2 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-indigo-600 transition-all shadow-sm text-xs font-medium"
          title="Analytics"
        >
          <BarChart3 className="w-3.5 h-3.5 mr-1" />
          {t('dashboard.context.analytics')}
        </button>

        <button
          onClick={() => window.location.href = `/forms/${form.id}/activity`}
          className="flex items-center justify-center px-2 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-amber-600 transition-all shadow-sm text-xs font-medium"
          title="Activity"
        >
          <Clock className="w-3.5 h-3.5 mr-1" />
          {t('dashboard.context.activity')}
        </button>
      </div>
    </div>
  );
}
