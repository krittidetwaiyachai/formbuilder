import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, List, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Form } from '@/types';

interface AnalyticsHeaderProps {
  form: Form | null;
  id: string | undefined;
  onViewResponses: () => void;
  onExport: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  form,
  id,
  onViewResponses,
  onExport
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative bg-white md:border-b md:border-gray-200">
      { }
      <div className="md:hidden px-5 pt-12 pb-4 safe-area-pt border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Link
            to={`/forms/${id}/builder`}
            className="p-2 rounded-xl bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div className="flex gap-2">
            <button
              onClick={onViewResponses}
              className="p-2.5 bg-gray-100 rounded-xl active:bg-gray-200 transition-colors"
            >
              <List className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={onExport}
              className="p-2.5 bg-black rounded-xl active:bg-gray-800 transition-colors"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        <h1 className="text-[28px] font-bold text-black tracking-tight">{t('analytics.title')}</h1>
        <p className="text-sm text-gray-500 truncate">{form?.title}</p>
      </div>

      { }
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
            <Link
              to={`/forms/${id}/builder`}
              className="group p-2 md:p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate">{form?.title || t('analytics.title')}</h1>
                <span className="hidden sm:inline px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold uppercase tracking-wide text-gray-700 border border-gray-200 flex-shrink-0">
                  {form?.status === 'PUBLISHED' ? t('analytics.status.published') : t('analytics.status.draft')}
                </span>
              </div>
              <p className="text-gray-600 text-sm hidden sm:flex items-center gap-2 truncate">
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                {t('analytics.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3 self-end sm:self-center flex-shrink-0">
            <button
              onClick={onViewResponses}
              className="group inline-flex items-center px-3 md:px-5 py-2 md:py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
            >
              <List className="w-4 h-4 md:mr-2 group-hover:rotate-12 transition-transform" />
              <span className="hidden md:inline font-medium">{t('analytics.view_responses')}</span>
            </button>
            <button
              onClick={onExport}
              className="group inline-flex items-center px-3 md:px-5 py-2 md:py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg font-medium"
            >
              <Download className="w-4 h-4 md:mr-2 group-hover:translate-y-0.5 transition-transform" />
              <span className="hidden md:inline">{t('analytics.export')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
