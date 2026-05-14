import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
"recharts";
import { CheckCircle2, Copy, XCircle, X, ListChecks } from "lucide-react";
import Loader from "@/components/common/Loader";
import { useTranslation } from "react-i18next";
import type { QuizStats } from "../types";
import type { Form, FormResponse } from "@/types";
import api from "@/lib/api";
import { Pagination } from "@/components/common/Pagination";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
const stripHtmlTags = (html: string): string =>
html.replace(/<[^>]*>/g, "").trim();
interface QuizStatsCardsProps {
  stats: QuizStats | null;
  onCopy: (id: string) => void;
  copySuccess: string | null;
  formId?: string;
  form?: Form | null;
  onModalOpenChange?: (isOpen: boolean) => void;
}
export const QuizStatsCards: React.FC<QuizStatsCardsProps> = ({
  stats,
  onCopy,
  copySuccess,
  formId,
  form,
  onModalOpenChange
}) => {
  const { t } = useTranslation();
  const [selectedQuestion, setSelectedQuestion] = useState<{fieldId: string;label: string;} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    if (isModalOpen && selectedQuestion && formId) {
      const fetchResponses = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/responses/form/${formId}?page=${page}&limit=5&sort=desc`);
          setResponses(res.data?.data || res.data || []);
          setTotalPages(Math.ceil((res.data?.meta?.total || 0) / 5) || 1);
        } catch (error) {
          console.error("Failed to load question responses:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchResponses();
    }
  }, [isModalOpen, selectedQuestion, page, formId]);
  const handleOpenModal = (q: {fieldId: string;label: string;}) => {
    setSelectedQuestion(q);
    setPage(1);
    setIsModalOpen(true);
    if (onModalOpenChange) onModalOpenChange(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onModalOpenChange) onModalOpenChange(false);
  };
  useEffect(() => {
    if (!isModalOpen) return;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isModalOpen]);
  useSmoothScroll("quiz-modal-body", { enabled: isModalOpen });
  if (!stats) return null;
  return (
    <>      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">        <div className="flex items-center justify-between mb-4">          <h3 className="text-lg font-semibold text-gray-900">            {t("analytics.score_distribution")}          </h3>          <button
            onClick={() => onCopy("score-dist-chart")}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={t("analytics.copy_chart")}>            {copySuccess === "score-dist-chart" ?
            <CheckCircle2 className="w-4 h-4 text-green-600" /> :
            <Copy className="w-4 h-4" />
            }          </button>        </div>        <div id="score-dist-chart" className="p-2 bg-white rounded-lg">          <ResponsiveContainer width="100%" height={300}>            <BarChart data={stats.scoreDistribution}>              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />              <XAxis dataKey="range" tick={{ fontSize: 12 }} />              <YAxis tick={{ fontSize: 12 }} />              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }} />              <Bar
                dataKey="count"
                fill="#10b981"
                name={t("analytics.count")}
                radius={[4, 4, 0, 0]} />            </BarChart>          </ResponsiveContainer>        </div>      </motion.div>      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-8">        <h3 className="text-lg font-bold text-gray-900 mb-6">          {t("analytics.quiz_summary")}        </h3>        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>            <div className="relative">              <div className="text-3xl font-bold text-white mb-1">                {stats.averageScore.toFixed(1)}              </div>              <div className="text-xs font-semibold text-blue-100 uppercase tracking-wide">                {t("analytics.average_score")}              </div>            </div>          </div>          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>            <div className="relative">              <div className="text-3xl font-bold text-white mb-1">                {stats.averagePercentage.toFixed(1)}%              </div>              <div className="text-xs font-semibold text-green-100 uppercase tracking-wide">                {t("analytics.average_percentage")}              </div>            </div>          </div>          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>            <div className="relative">              <div className="text-3xl font-bold text-white mb-1">                {stats.passRate.toFixed(1)}%              </div>              <div className="text-xs font-semibold text-purple-100 uppercase tracking-wide">                {t("analytics.pass_rate")}              </div>            </div>          </div>          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>            <div className="relative">              <div className="text-3xl font-bold text-white mb-1">                {stats.highestScore}              </div>              <div className="text-xs font-semibold text-amber-100 uppercase tracking-wide">                {t("analytics.highest_score")}              </div>            </div>          </div>        </div>        <h4 className="text-base font-bold text-gray-900 mb-4">          {t("analytics.question_analysis")}        </h4>        <div className="space-y-3">          {stats.questionStats.slice(0, 5).map((q, i) =>
          <button
            key={q.fieldId}
            onClick={() => handleOpenModal(q)}
            className="group w-full text-left bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md cursor-pointer block">            <div className="flex items-center gap-4">              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-md">                <span className="text-base font-bold text-white">                  {i + 1}                </span>              </div>              <div className="flex-1 min-w-0">                <p className="text-sm font-semibold text-gray-900 mb-2 truncate">                  {stripHtmlTags(q.label)}                </p>                <div className="flex items-center gap-2">                  <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                      q.correctRate > 70 ?
                      "bg-gradient-to-r from-green-400 to-emerald-500" :
                      q.correctRate > 40 ?
                      "bg-gradient-to-r from-yellow-400 to-amber-500" :
                      "bg-gradient-to-r from-red-400 to-rose-500"}`
                      }
                      style={{ width: `${q.correctRate}%` }} />                  </div>                  <span className="text-xs font-bold text-gray-700 w-12 text-right">                    {q.correctRate.toFixed(0)}%                  </span>                </div>              </div>              <div className="flex items-center gap-3 text-sm">                <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-md border border-green-200">                  <CheckCircle2 className="w-4 h-4 text-green-600" />                  <span className="font-bold text-green-700">                    {q.correctCount}                  </span>                </span>                <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 rounded-md border border-red-200">                  <XCircle className="w-4 h-4 text-red-600" />                  <span className="font-bold text-red-700">                    {q.incorrectCount}                  </span>                </span>              </div>            </div>          </button>
          )}        </div>      </motion.div>      {}      <AnimatePresence>        {isModalOpen && selectedQuestion &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden ring-1 ring-slate-900/5 relative">            {}            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">              <div className="flex items-center gap-4">                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 ring-4 ring-white shadow-sm border border-indigo-100">                  <ListChecks className="w-5 h-5" />                </div>                <div>                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">                    {t("analytics.responses_for") || "Responses"}                  </div>                  <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">                    <span className="truncate max-w-[200px] sm:max-w-md md:max-w-xl block">{stripHtmlTags(selectedQuestion.label)}</span>                  </h3>                </div>              </div>              <button
                onClick={handleCloseModal}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-slate-200">                <X className="w-5 h-5" />              </button>            </div>            {}            <div id="quiz-modal-body" className="p-4 sm:p-5 bg-slate-50/50 relative overflow-y-auto flex-1">              {loading &&
              <div className="absolute inset-0 bg-white/60 flex justify-center items-center z-10 backdrop-blur-[2px]">                <Loader size={32} />              </div>
              }              {responses.length > 0 ?
              <div className="space-y-3 flex-1">                {responses.map((response, index) => {
                  const answer = response.answers?.find((a) => a.fieldId === selectedQuestion.fieldId);
                  const isCorrect = answer?.isCorrect;
                  const respondentName = response.answers?.find((a) => {
                    const f = form?.fields?.find((fld) => fld.id === a.fieldId);
                    return f?.label?.toLowerCase().includes("name") || f?.label?.includes("ชื่อ");
                  })?.value;
                  const emailValue = response.respondentEmail || response.answers?.find((a) => {
                    const f = form?.fields?.find((fld) => fld.id === a.fieldId);
                    return f?.type === "EMAIL" || f?.label?.toLowerCase().includes("email") || f?.label?.includes("อีเมล");
                  })?.value;
                  let displayAnswer = answer?.value;
                  if (typeof displayAnswer === 'object' && displayAnswer !== null) {
                    displayAnswer = JSON.stringify(displayAnswer);
                  }
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={response.id}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)] transition-all duration-300">                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">                        <div className="flex-1 w-full flex flex-col sm:flex-row gap-3 sm:gap-4">                          {}                          <div className="flex items-start gap-3 sm:w-[30%] flex-shrink-0">                            <div className="w-7 h-7 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center font-bold text-xs ring-1 ring-inset ring-indigo-500/10 shadow-sm">                                      #
                              {(page - 1) * 5 + index + 1}                            </div>                            <div className="min-w-0 pt-0.5">                              {respondentName || emailValue ?
                              <>                                <div className="text-[13px] font-bold text-slate-800 truncate leading-snug">                                  {respondentName || emailValue}                                </div>                                {respondentName && emailValue &&
                                <div className="text-xs text-slate-500 truncate mt-0.5">                                  {emailValue}                                </div>
                                }                              </> :
                              <div className="text-sm font-medium text-slate-500 italic">                                {t("analytics.anonymous_user", "Anonymous")}                              </div>
                              }                              <div className="text-[11px] font-medium text-slate-400 mt-1.5 uppercase tracking-wider">                                {new Date(response.submittedAt).toLocaleString(undefined, {
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}                              </div>                            </div>                          </div>                          {}                          <div className={`flex-1 rounded-[14px] p-3.5 flex items-start gap-3 border ${
                          isCorrect === true ? "bg-emerald-50/50 border-emerald-100/80 text-emerald-950" :
                          isCorrect === false ? "bg-rose-50/50 border-rose-100/80 text-rose-950" :
                          "bg-slate-50/50 border-slate-200/60 text-slate-900"}`
                          }>                            <div className="flex-1 min-w-0">                              <div className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${
                              isCorrect === true ? "text-emerald-600" :
                              isCorrect === false ? "text-rose-600" :
                              "text-slate-500"}`
                              }>                                {t("analytics.answer", "Answer")}                              </div>                              <div className="text-sm font-semibold whitespace-pre-wrap break-words leading-relaxed">                                {displayAnswer && displayAnswer !== "" ? String(displayAnswer) : <span className="italic opacity-50">({t("analytics.no_answer") || "No answer"})</span>}                              </div>                            </div>                            <div className={`flex-shrink-0 mt-0.5 flex items-center justify-center w-7 h-7 rounded-full shadow-sm ring-1 ring-inset bg-white ${
                            isCorrect === true ? "ring-emerald-200" :
                            isCorrect === false ? "ring-rose-200" :
                            "ring-slate-200"}`
                            }>                              {isCorrect === true && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}                              {isCorrect === false && <XCircle className="w-4 h-4 text-rose-500" />}                              {isCorrect === undefined && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}                            </div>                          </div>                        </div>                      </div>                    </motion.div>);
                })}              </div> :
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm flex-1 flex flex-col items-center justify-center">                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">                  <XCircle className="w-8 h-8 text-slate-300" />                </div>                <p className="text-slate-600 font-medium text-lg mb-1">{t("analytics.no_responses") || "No responses found"}</p>                <p className="text-slate-400 text-sm">There are no responses available for this question block.</p>              </div>
              }            </div>            {}            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              loading={loading}
              className="rounded-b-3xl" />          </motion.div>        </motion.div>
        }      </AnimatePresence>    </>);
};