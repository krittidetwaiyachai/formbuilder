import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

import Loader from '@/components/common/Loader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/toaster';
import { useHasPermission } from '@/hooks/usePermissions';
import api from '@/lib/api';

import { useAnalyticsData } from './analytics/hooks/useAnalyticsData';
import { useAnalyticsStats } from './analytics/hooks/useAnalyticsStats';
import { useChartExport } from './analytics/hooks/useChartExport';

import { AnalyticsHeader } from './analytics/components/AnalyticsHeader';
import { AnalyticsSummaryCards } from './analytics/components/AnalyticsSummaryCards';
import { ResponseTrendChart } from './analytics/components/ResponseTrendChart';
import { QuizStatsCards } from './analytics/components/QuizStatsCards';
import { FieldAnalytics } from './analytics/components/FieldAnalytics';
import { ResponseViewer } from './analytics/components/ResponseViewer';

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const canDelete = useHasPermission('DELETE_RESPONSES');

  
  const {
      form,
      responses,
      viewResponses,
      totalResponses,
      loading,
      loadingResponses,
      totalPages,
      responsePage,
      responseSort,
      setResponses,
      setTotalResponses,
      loadResponses
  } = useAnalyticsData(id);

  const {
      fieldStats,
      quizStats,
      responseTrend,
      calculateFieldStats,
      calculateResponseTrend,
      calculateQuizStats
  } = useAnalyticsStats();

  const { copyChartToClipboard, copySuccess } = useChartExport();

  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null);
  const [showResponseViewer, setShowResponseViewer] = useState(false);
  const [selectedField, setSelectedField] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  
  useEffect(() => {
    if (form && responses.length > 0) {
      calculateFieldStats(form, responses);
      calculateResponseTrend(responses);

      if (form.isQuiz) {
        calculateQuizStats(form, responses);
      }

      if (form.fields && form.fields.length > 0) {
          const firstAnalyzableField = form.fields.find(
            (f) => !['HEADER', 'PARAGRAPH', 'DIVIDER', 'PAGE_BREAK', 'SUBMIT'].includes(f.type)
          );
          if (firstAnalyzableField) {
            setSelectedField(firstAnalyzableField.id);
          }
      }
    }
  }, [form, responses, calculateFieldStats, calculateResponseTrend, calculateQuizStats]);


  
  const confirmDeleteResponse = async () => {
    if (!responseToDelete) return;

    try {
      await api.delete(`/responses/${responseToDelete}`);
      setResponses((prev) => prev.filter((r) => r.id !== responseToDelete));
      setTotalResponses((prev) => prev - 1);
      
      toast({
        title: t('analytics.delete_success'),
        description: t('analytics.delete_response_success'),
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to delete response:', error);
      toast({
        title: t('auth.error'),
        description: t('analytics.delete_failed'),
        variant: 'error',
      });
    } finally {
      setResponseToDelete(null);
    }
  };

  const handleDeleteClick = (responseId: string) => {
    if (!canDelete) {
      toast({
        title: t('auth.error'),
        description: t('analytics.no_delete_permission'),
        variant: 'error',
      });
      return;
    }

    setResponseToDelete(responseId);
    setDeleteConfirmOpen(true);
  };

  const handleExport = async () => {
    if (exporting || !id) return;
    setExporting(true);
    setExportProgress(0);

    const progressInterval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 99) return 99;
        const remaining = 99 - prev;
        const increment = remaining * 0.015;
        return prev + Math.max(increment, 0.02);
      });
    }, 200);

    try {
      const response = await api.get(`/responses/form/${id}/export/csv`, {
        responseType: 'blob',
        timeout: 300000,
      });
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = (form?.title || 'form').replace(/[^a-z0-9\u0E00-\u0E7F-_ ]/gi, '_');
      link.setAttribute('download', `${safeTitle}_responses.csv`);
      document.body.appendChild(link);
      
      setExporting(false);
      setExportProgress(0);
      
      link.click();
      link.remove();
      
      toast({
        title: t('analytics.export_success'),
        description: t('analytics.export_success_desc'),
        variant: 'success',
      });
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Failed to export CSV:', error);
      toast({
        title: t('analytics.export_failed'),
        description: t('analytics.export_failed_desc'),
        variant: "error"
      });
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader className="mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t('analytics.loading')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 md:pb-12">
      <AnalyticsHeader 
        form={form} 
        id={id} 
        onViewResponses={() => setShowResponseViewer(true)} 
        onExport={handleExport} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-8">
        <AnalyticsSummaryCards form={form} totalResponses={totalResponses} />

        {responses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 border border-gray-200 text-center"
          >
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('analytics.no_responses')}</h3>
            <p className="text-gray-500">{t('analytics.no_responses_desc')}</p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ResponseTrendChart 
                data={responseTrend} 
                onCopy={copyChartToClipboard} 
                copySuccess={copySuccess} 
              />
              { }
            </div>

             {form?.isQuiz && (
                <QuizStatsCards 
                    stats={quizStats} 
                    onCopy={copyChartToClipboard} 
                    copySuccess={copySuccess} 
                />
             )}

            <FieldAnalytics 
                form={form} 
                fieldStats={fieldStats} 
                totalResponses={totalResponses}
                initialSelectedField={selectedField}
                onCopy={copyChartToClipboard}
                copySuccess={copySuccess}
            />
          </>
        )}
      </div>

      <ResponseViewer
        isOpen={showResponseViewer}
        onClose={() => setShowResponseViewer(false)}
        responses={viewResponses}
        form={form}
        totalResponses={totalResponses}
        responsePage={responsePage}
        totalPages={totalPages}
        responseSort={responseSort}
        loadingResponses={loadingResponses}
        onPageChange={loadResponses}
        onDeleteResponse={handleDeleteClick}
      />

      <AnimatePresence>
        {exporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-6 max-w-sm mx-4 w-80"
            >
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">{t('analytics.exporting')}</p>
                <p className="text-5xl font-bold text-gray-900">
                  {Math.round(exportProgress)}%
                </p>
              </div>
              <div className="w-full">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gray-900 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(exportProgress)}%` }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">{t('analytics.exporting_desc')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('analytics.confirm_delete_title')}
        description={t('analytics.confirm_delete_desc')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
        onConfirm={confirmDeleteResponse}
      />
    </div>
  );
}
