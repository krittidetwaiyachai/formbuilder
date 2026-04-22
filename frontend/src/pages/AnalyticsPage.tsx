import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
  useTransform } from
"framer-motion";
import { BarChart3 } from "lucide-react";
import Loader from "@/components/common/Loader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/toaster";
import { useHasPermission } from "@/hooks/usePermissions";
import api from "@/lib/api";
import { useAnalyticsData } from "./analytics/hooks/useAnalyticsData";
import { useAnalyticsStats } from "./analytics/hooks/useAnalyticsStats";
import { useChartExport } from "./analytics/hooks/useChartExport";
import { useExportCSV } from "./analytics/hooks/useExportCSV";
import { AnalyticsHeader } from "./analytics/components/AnalyticsHeader";
import { AnalyticsSummaryCards } from "./analytics/components/AnalyticsSummaryCards";
import { ResponseTrendChart } from "./analytics/components/ResponseTrendChart";
import { QuizStatsCards } from "./analytics/components/QuizStatsCards";
import {
  FieldDistributionWidget,
  FieldDetailedAnalysis } from
"./analytics/components/FieldAnalytics";
import { ResponseViewer } from "./analytics/components/ResponseViewer";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{id: string;}>();
  const { toast } = useToast();
  const canDelete = useHasPermission("DELETE_RESPONSES");
  const {
    form,
    viewResponses,
    totalResponses,
    loading,
    loadingResponses,
    totalPages,
    responsePage,
    responseSort,
    setTotalResponses,
    loadResponses
  } = useAnalyticsData(id);
  const { fieldStats, quizStats, responseTrend, loadStats } =
  useAnalyticsStats();
  const { copyChartToClipboard, copySuccess } = useChartExport();
  const [selectedTrendMonth, setSelectedTrendMonth] = useState(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `${now.getFullYear()}-${mm}`;
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null);
  const [showResponseViewer, setShowResponseViewer] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string>("all");
  const {
    isExporting,
    progress: exportState,
    startExport
  } = useExportCSV(id || "");
  const countMotion = useMotionValue(0);
  const displayPercentage = useTransform(
    countMotion,
    (latest: any) =>
    `${Math.round(latest / (exportState?.total || 1) * 100)}%`
  );
  const displayLoadedCount = useTransform(countMotion, (latest: any) =>
  Math.round(latest).toLocaleString()
  );
  const lastUpdateRef = useRef<number>(Date.now());
  const initialLoadRef = useRef(true);
  useEffect(() => {
    if (exportState?.loaded !== undefined) {
      if (initialLoadRef.current) {
        animate(countMotion, exportState.loaded, {
          duration: 0.8,
          ease: "linear"
        });
        initialLoadRef.current = false;
        lastUpdateRef.current = Date.now();
      } else {
        const now = Date.now();
        const timeDiff = (now - lastUpdateRef.current) / 1000;
        lastUpdateRef.current = now;
        const dynamicDuration = Math.max(1.0, timeDiff + 0.3);
        animate(countMotion, exportState.loaded, {
          duration: dynamicDuration,
          ease: "easeInOut"
        });
      }
    }
  }, [exportState?.loaded, countMotion]);
  useSmoothScroll(undefined, { enabled: !showResponseViewer && !quizModalOpen });
  useEffect(() => {
    if (form && id) {
      loadStats(id, selectedTrendMonth);
      if (form.fields && form.fields.length > 0) {
        const firstAnalyzableField = form.fields.find(
          (f) =>
          ![
          "HEADER",
          "PARAGRAPH",
          "DIVIDER",
          "PAGE_BREAK",
          "SUBMIT"].
          includes(f.type)
        );
        if (firstAnalyzableField) {
          setSelectedField(firstAnalyzableField.id);
        }
      }
    }
  }, [form, id, loadStats, selectedTrendMonth]);
  const confirmDeleteResponse = async () => {
    if (!responseToDelete) return;
    try {
      await api.delete(`/responses/${responseToDelete}`);
      setTotalResponses((prev: number) => prev - 1);
      loadResponses(responsePage, responseSort);
      toast({
        title: t("analytics.delete_success"),
        description: t("analytics.delete_response_success"),
        variant: "success"
      });
    } catch (error) {
      console.error("Failed to delete response:", error);
      toast({
        title: t("auth.error"),
        description: t("analytics.delete_failed"),
        variant: "error"
      });
    } finally {
      setResponseToDelete(null);
    }
  };
  const handleDeleteClick = (responseId: string) => {
    if (!canDelete) {
      toast({
        title: t("auth.error"),
        description: t("analytics.no_delete_permission"),
        variant: "error"
      });
      return;
    }
    setResponseToDelete(responseId);
    setDeleteConfirmOpen(true);
  };
  const handleExport = async () => {
    if (isExporting || !id) return;
    await startExport();
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center">          <Loader className="mx-auto mb-4" />          <p className="text-gray-500 font-medium">{t("analytics.loading")}</p>        </motion.div>      </div>);
  }
  return (
    <div className="min-h-screen bg-white pb-32 md:pb-12">      <AnalyticsHeader
        form={form}
        id={id}
        onViewResponses={() => setShowResponseViewer(true)}
        onExport={handleExport} />      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-8">        <AnalyticsSummaryCards form={form} totalResponses={totalResponses} />        {totalResponses === 0 ?
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-12 border border-gray-200 text-center">          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />          <h3 className="text-lg font-semibold text-gray-900 mb-2">            {t("analytics.no_responses")}          </h3>          <p className="text-gray-500">{t("analytics.no_responses_desc")}</p>        </motion.div> :
        <>          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">            <ResponseTrendChart
              data={responseTrend}
              selectedMonth={selectedTrendMonth}
              onMonthChange={setSelectedTrendMonth}
              onCopy={copyChartToClipboard}
              copySuccess={copySuccess} />            <FieldDistributionWidget
              form={form}
              fieldStats={fieldStats}
              totalResponses={totalResponses}
              selectedField={selectedField}
              onFieldChange={setSelectedField}
              initialSelectedField={selectedField}
              onCopy={copyChartToClipboard}
              copySuccess={copySuccess} />          </div>          {form?.isQuiz &&
          <QuizStatsCards
            stats={quizStats}
            onCopy={copyChartToClipboard}
            copySuccess={copySuccess}
            formId={id}
            form={form}
            onModalOpenChange={setQuizModalOpen} />
          }          <FieldDetailedAnalysis
            form={form}
            fieldStats={fieldStats}
            totalResponses={totalResponses}
            selectedField={selectedField}
            onFieldChange={setSelectedField}
            initialSelectedField={selectedField}
            onCopy={copyChartToClipboard}
            copySuccess={copySuccess} />        </>
        }      </div>      <ResponseViewer
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
        onDeleteResponse={handleDeleteClick} />      <AnimatePresence>        {isExporting && exportState &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-white/80 backdrop-blur-sm">          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center mx-4">            <div className="mb-6 relative w-16 h-16 flex items-center justify-center">              <Loader className="w-12 h-12 text-blue-600 animate-spin absolute" />              <BarChart3 className="w-5 h-5 text-blue-600 absolute" />            </div>            <h3 className="text-xl font-bold text-gray-900 mb-2">              {exportState.status === "processing" ?
              t("analytics.exporting_csv", "Exporting CSV...") :
              t("analytics.export_success", "Export Ready")}            </h3>            <p className="text-gray-500 mb-6 font-medium text-sm">              {exportState.status === "processing" ?
              t(
                "analytics.export_dont_close",
                "Please don't close this page"
              ) :
              t(
                "analytics.downloading_now",
                "Your download will start automatically..."
              )}            </p>            <div className="w-full">              <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">                <motion.span>{displayLoadedCount}</motion.span>                <span>{exportState.total.toLocaleString()} rows</span>              </div>              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">                <motion.div
                  style={{ width: displayPercentage }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />              </div>              <div className="mt-3 text-2xl font-bold text-gray-900">                <motion.span>{displayPercentage}</motion.span>              </div>            </div>          </motion.div>        </motion.div>
        }      </AnimatePresence>      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t("analytics.confirm_delete_title")}
        description={t("analytics.confirm_delete_desc")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
        onConfirm={confirmDeleteResponse} />    </div>);
}