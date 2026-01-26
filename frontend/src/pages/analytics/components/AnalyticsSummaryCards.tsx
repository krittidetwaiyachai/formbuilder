import React from 'react';
import { motion } from 'framer-motion';
import { Eye, FileText, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Form } from '@/types';

interface AnalyticsSummaryCardsProps {
  form: Form | null;
  totalResponses: number;
}

export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({ form, totalResponses }) => {
  const { t } = useTranslation();

  const conversionRate = form?.viewCount && form.viewCount > 0
    ? ((totalResponses / form.viewCount) * 100).toFixed(1)
    : '0';

  return (
    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 min-w-[200px] md:min-w-0 group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-100 md:border-white shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 group-hover:from-blue-500/10 group-hover:to-indigo-500/20 transition-all"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('analytics.total_views')}</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {form?.viewCount || 0}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {t('analytics.unique_visitors')}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-shrink-0 min-w-[200px] md:min-w-0 group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-100 md:border-white shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/10 group-hover:from-emerald-500/10 group-hover:to-green-500/20 transition-all"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('analytics.total_responses')}</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {totalResponses.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {t('analytics.form_submissions')}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-shrink-0 min-w-[200px] md:min-w-0 group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-100 md:border-white shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/10 group-hover:from-purple-500/10 group-hover:to-pink-500/20 transition-all"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('analytics.conversion_rate')}</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {conversionRate}%
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {t('analytics.responses_views')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
