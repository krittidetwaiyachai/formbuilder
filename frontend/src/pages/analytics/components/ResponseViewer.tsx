import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Form, FormResponse } from '@/types';
import Loader from '@/components/common/Loader';
import { useHasPermission } from '@/hooks/usePermissions';

interface ResponseViewerProps {
  isOpen: boolean;
  onClose: () => void;
  responses: FormResponse[];
  form: Form | null;
  totalResponses: number;
  responsePage: number;
  totalPages: number;
  responseSort: 'asc' | 'desc';
  loadingResponses: boolean;
  onPageChange: (page: number, sort: 'asc' | 'desc') => void;
  onDeleteResponse: (responseId: string) => void;
}

const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  isOpen,
  onClose,
  responses,
  form,
  totalResponses,
  responsePage,
  totalPages,
  responseSort,
  loadingResponses,
  onPageChange,
  onDeleteResponse
}) => {
  const { t } = useTranslation();
  const canDelete = useHasPermission('DELETE_RESPONSES');
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 bg-opacity-90 backdrop-blur-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('analytics.individual_responses')}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {t('analytics.page')} {responsePage} / {totalPages} ({totalResponses.toLocaleString()} total)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onPageChange(1, 'desc')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${responseSort === 'desc' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {t('analytics.sort_newest')}
                </button>
                <button
                  onClick={() => onPageChange(1, 'asc')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${responseSort === 'asc' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {t('analytics.sort_oldest')}
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 scrollbar-visible">
            <div className="space-y-4">
              {responses.map((response, index) => {
                const nameField = form?.fields?.find(f => f.label.toLowerCase().includes('name') || f.label.includes('ชื่อ'));
                const emailField = form?.fields?.find(f => f.type === 'EMAIL' || f.label.toLowerCase().includes('email') || f.label.includes('อีเมล'));
                
                const nameValue = nameField ? response.answers?.find(a => a.fieldId === nameField.id)?.value : null;
                const emailValue = (response as any).respondentEmail || (emailField ? response.answers?.find(a => a.fieldId === emailField.id)?.value : null);

                return (
                <div
                  key={response.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => setSelectedResponse(selectedResponse?.id === response.id ? null : response)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="min-w-[2.5rem] h-7 px-2 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-xs">
                        #{responseSort === 'desc'
                          ? (totalResponses - ((responsePage - 1) * 10) - index).toLocaleString()
                          : (((responsePage - 1) * 10) + index + 1).toLocaleString()}
                      </div>
                      <div className="text-left">
                        {(nameValue || emailValue) && (
                          <div className="text-sm font-medium text-gray-900 mb-0.5">
                            {nameValue}
                            {nameValue && emailValue && <span className="text-gray-300 mx-2">|</span>}
                            {emailValue && <span className="text-gray-500 font-normal">{emailValue}</span>}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {form?.isQuiz && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              (response.score || 0) / (response.totalScore || 1) >= 0.5 
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {t('analytics.score')}: {response.score}/{response.totalScore}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(response.submittedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteResponse(response.id);
                          }}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {selectedResponse?.id === response.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {selectedResponse?.id === response.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-4">
                            {form?.fields?.map((field) => {
                              if (['HEADER', 'PARAGRAPH', 'DIVIDER', 'PAGE_BREAK', 'SUBMIT'].includes(field.type)) return null;

                              const answer = response.answers?.find(a => a.fieldId === field.id);
                              const isCorrect = form.isQuiz && field.correctAnswer ? answer?.isCorrect : undefined;

                              return (
                                <div key={field.id} className="space-y-1">
                                  <p className="text-sm font-medium text-gray-500">{stripHtml(field.label)}</p>
                                  <div className={`p-3 rounded-lg border ${
                                    isCorrect === true ? 'bg-green-50 border-green-200' :
                                    isCorrect === false ? 'bg-red-50 border-red-200' :
                                    'bg-gray-50 border-gray-200'
                                  }`}>
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-gray-900 text-sm whitespace-pre-wrap">
                                        {answer?.value || <span className="text-gray-400 italic">{t('analytics.no_answer')}</span>}
                                      </p>
                                      {isCorrect !== undefined && (
                                        isCorrect ? (
                                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        ) : (
                                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );})}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-center gap-4">
              <button
                onClick={() => onPageChange(responsePage - 1, responseSort)}
                disabled={responsePage <= 1 || loadingResponses}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('analytics.prev_page')}
              </button>
              <span className="text-sm text-gray-600">
                {t('analytics.page_of', { current: responsePage, total: totalPages })}
              </span>
              <button
                onClick={() => onPageChange(responsePage + 1, responseSort)}
                disabled={responsePage >= totalPages || loadingResponses}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('analytics.next_page')}
              </button>
              {loadingResponses && (
                <Loader size={20} />
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
