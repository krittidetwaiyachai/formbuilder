import { FileText, Clock, Plus, Users, Maximize2, Trash2, Eye, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from '@/components/common/UserAvatar';
import type { Form } from '@/types';

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
  const allEditors = [form.createdBy, ...(form.collaborators || [])].filter(Boolean);

  return (
    <div
      onClick={onCardClick}
      onContextMenu={onContextMenu}
      className={`group bg-white rounded-2xl border border-gray-200 relative overflow-hidden flex flex-col hover:border-gray-300 hover:shadow-xl transition-all duration-300 cursor-pointer ${
        compact ? 'text-sm' : ''
      }`}
    >
      <div className={`${compact ? 'h-20' : 'h-28'} bg-gray-50 border-b border-gray-100 relative overflow-hidden group-hover:bg-gray-100/50 transition-colors`}>
        {!compact && (
          <div className="absolute inset-0 opacity-10" 
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
          />
        )}
        
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
              form.status === 'PUBLISHED' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : form.status === 'ARCHIVED'
                ? 'bg-gray-200 text-gray-600 border border-gray-300'
                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }`}>
              {form.status}
            </span>
            
            {currentUserId !== form.createdById && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-100 text-indigo-700 border border-indigo-200">
                <Users className="w-3 h-3" />
                Shared
              </span>
            )}
          </div>
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1">
          <button
            onClick={onViewDetails}
            className="p-1.5 bg-white rounded-full shadow-sm text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
            title="View Details"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 bg-white rounded-full shadow-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete Form"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={`absolute ${compact ? '-bottom-6 -right-6 text-gray-100/50' : '-bottom-4 -right-4 text-gray-100'} transform rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
          <FileText className={`${compact ? 'w-20 h-20' : 'w-24 h-24'}`} />
        </div>
      </div>

      <div className={`${compact ? 'p-3' : 'p-5'} flex-1 flex flex-col`}>
        <div className="mb-2">
          <h3 className={`${compact ? 'text-base' : 'text-xl'} font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-black transition-colors break-words leading-tight`}>
            {form.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] break-all">
            {form.description || 'No description provided.'}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div 
            className="flex items-center gap-2 cursor-pointer p-1 -m-1 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onCollaboratorsClick(e, allEditors, form.title, form.id);
            }}
          >
            <div className={`flex -space-x-2 overflow-hidden pointer-events-none items-center ${compact ? 'scale-90 origin-left' : ''}`}>
              {allEditors.slice(0, 3).map((editor: any, index) => (
                <div key={index} className="relative z-10 transition-transform hover:scale-110 hover:z-20">
                  <UserAvatar 
                    user={editor} 
                    className="h-8 w-8 ring-2 ring-white shadow-sm"
                  />
                </div>
              ))}
              <div className="relative z-0 flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 ring-2 ring-white shadow-sm text-gray-500">
                {allEditors.length > 3 ? (
                  <span className="text-xs font-bold">+{allEditors.length - 3}</span>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(form.updatedAt)}
          </div>
        </div>

        {/* Stats Row */}
        {!compact && (
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium border-t border-gray-50 pt-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md">
            <Users className="w-3.5 h-3.5" />
            {(form.responseCount || form._count?.responses || 0)}
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md" title="Total Views">
             {/* Note: View count icon was Eye in original, but FileText in intermediate. Restoring Eye for consistency if available, otherwise FileText is fine but logic implies restoring buttons */}
             {/* Actually, let's restore the buttons section that was present in the original Dashboard.tsx before refactoring */}
          </div>
        </div>
        )}
      </div>

      {/* Actions Overlay / Footer - Restoring this section */}
      <div className="p-3 bg-gray-50/50 border-t border-gray-100 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCardClick(); // Use onCardClick which navigates to builder or handles login
          }}
          className="flex items-center justify-center px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          <FileText className="w-4 h-4 mr-1.5" />
          Edit
        </button>
        <Link
          to={`/forms/${form.id}/preview`}
          className="flex items-center justify-center px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
          target="_blank"
          onClick={(e) => e.stopPropagation()}
        >
          <Eye className="w-4 h-4 mr-1.5" />
          Preview
        </Link>
        <button
          onClick={(e) => {
             e.stopPropagation();
             // Since we don't have direct props for these, we'll use window.location or navigate via props if we add them. 
             // Actually, the original code used navigate. I should probably add specific handlers or just use the passed props if flexible enough.
             // But to keep it simple and working within this component:
             window.location.href = `/forms/${form.id}/analytics`;
          }}
          className="flex items-center justify-center px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          <BarChart3 className="w-4 h-4 mr-1.5" />
          Analytics
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/forms/${form.id}/activity`;
          }}
          className="flex items-center justify-center px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          <Clock className="w-4 h-4 mr-1.5" />
          Activity
        </button>
      </div>
    </div>
  );
}
