import { FileText, ChevronRight, Inbox, Eye } from 'lucide-react';
import type { Form } from '@/types';
import { useTranslation } from 'react-i18next';

interface MobileFormCardProps {
  form: Form & {
    responseCount?: number;
    viewCount?: number;
    _count?: { responses: number };
  };
  onCardClick: () => void;
}

export default function MobileFormCard({
  form,
  onCardClick,
}: MobileFormCardProps) {
  const { t } = useTranslation();
  const responseCount = form.responseCount || form._count?.responses || 0;

  return (
    <div
      onClick={onCardClick}
      className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 active:scale-[0.98] active:bg-gray-50/50 transition-all duration-150 cursor-pointer shadow-sm"
    >
      <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-gray-400" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-gray-900 truncate leading-snug">
          {form.title}
        </h3>
        <div className="flex items-center gap-2.5 mt-1.5">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
            form.status === 'PUBLISHED' 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
              : form.status === 'ARCHIVED'
              ? 'bg-gray-100 text-gray-500 border border-gray-200'
              : 'bg-amber-50 text-amber-600 border border-amber-100'
          }`}>
            {form.status === 'PUBLISHED' 
              ? t('dashboard.filters.published') 
              : form.status === 'ARCHIVED' 
                ? t('dashboard.filters.archived') 
                : t('dashboard.filters.draft')}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
            <Inbox className="w-3 h-3" />
            {responseCount}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
            <Eye className="w-3 h-3" />
            {form.viewCount || 0}
          </span>
        </div>
      </div>

      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
    </div>
  );
}
