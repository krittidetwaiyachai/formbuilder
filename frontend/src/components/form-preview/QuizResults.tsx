import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { useState } from 'react';
import { sanitize } from '@/utils/sanitization';
import { stripHtml } from '@/lib/ui/utils';
import { useTranslation } from 'react-i18next';

interface QuizAnswer {
  fieldId: string;
  fieldLabel: string;
  userAnswer: string;
  correctAnswer: string | null;
  isCorrect: boolean;
  score: number;
}

interface QuizResultsProps {
  quizReview: {
    answers: QuizAnswer[];
    showAnswer: boolean;
    showDetail: boolean;
  };
  score: { score: number; totalScore: number };
  showScore?: boolean; 
  allowViewMissedQuestions?: boolean;
  showExplanation?: boolean;
}

export default function QuizResults({ quizReview, score, showScore = true, allowViewMissedQuestions = true, showExplanation = false }: QuizResultsProps) {
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  
  const { answers, showAnswer, showDetail } = quizReview;
  const scoredAnswers = answers.filter((a) => (a.score ?? 0) > 0);
  const percentage = score.totalScore > 0 ? (score.score / score.totalScore) * 100 : 0;
  const correctCount = scoredAnswers.filter((a) => a.isCorrect).length;
  const incorrectCount = scoredAnswers.length - correctCount;

  
  
  const visibleAnswers = scoredAnswers.filter(answer => {
      
      if (answer.isCorrect) return true;
      
      return allowViewMissedQuestions;
  });

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8 space-y-6"
    >
      { }
      {showScore && (
        <div
          className="rounded-2xl p-6 border backdrop-blur"
          style={{
            background: 'color-mix(in srgb, var(--primary) 8%, var(--card-bg, rgba(255,255,255,0.9))',
            borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6" style={{ color: 'var(--primary)' }} />
            <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{t('public.quiz.summary')}</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg p-4 text-center backdrop-blur" style={{ background: 'color-mix(in srgb, var(--primary) 12%, var(--card-bg, rgba(255,255,255,0.9))' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--quiz-correct, var(--primary))' }}>{correctCount}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text)', opacity: 0.7 }}>{t('public.quiz.correct')}</div>
            </div>
            <div className="rounded-lg p-4 text-center backdrop-blur" style={{ background: 'color-mix(in srgb, var(--primary) 12%, var(--card-bg, rgba(255,255,255,0.9))' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--quiz-incorrect)' }}>{incorrectCount}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text)', opacity: 0.7 }}>{t('public.quiz.incorrect')}</div>
            </div>
            <div className="rounded-lg p-4 text-center backdrop-blur" style={{ background: 'color-mix(in srgb, var(--primary) 12%, var(--card-bg, rgba(255,255,255,0.9))' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{percentage.toFixed(0)}%</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text)', opacity: 0.7 }}>{t('public.quiz.percentage')}</div>
            </div>
            <div className="rounded-lg p-4 text-center backdrop-blur" style={{ background: 'color-mix(in srgb, var(--primary) 12%, var(--card-bg, rgba(255,255,255,0.9))' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{score.score}/{score.totalScore}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text)', opacity: 0.7 }}>{t('public.quiz.score')}</div>
            </div>
          </div>
        </div>
      )}

      { }
      {visibleAnswers.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <span>{t('public.quiz.answer_details')}</span>
          <span className="text-sm font-normal" style={{ color: 'var(--text)', opacity: 0.7 }}>
            {t('public.quiz.questions_count', { count: visibleAnswers.length })}
          </span>
        </h4>

        <div className="space-y-2">
          {visibleAnswers.map((answer, index) => {
            const isExpanded = expandedItems.has(index);
            const correctColor = 'var(--quiz-correct, var(--primary))';
            const incorrectColor = 'var(--quiz-incorrect)';

            
            
            
            
            return (
              <motion.div
                key={answer.fieldId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border-2 overflow-hidden transition-all"
                style={{
                  background: 'var(--card-bg, rgba(255,255,255,0.9))',
                  borderColor: answer.isCorrect
                    ? 'color-mix(in srgb, var(--quiz-correct, var(--primary)) 40%, transparent)'
                    : 'color-mix(in srgb, var(--quiz-incorrect) 40%, transparent)',
                }}
              >
                { }
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full p-4 flex items-center gap-3 transition-colors hover:opacity-90"
                  style={{ background: 'transparent' }}
                >
                  { }
                  <div className="flex-shrink-0">
                    {answer.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6" style={{ color: correctColor }} />
                    ) : (
                      <XCircle className="w-6 h-6" style={{ color: incorrectColor }} />
                    )}
                  </div>

                  { }
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--text)', opacity: 0.7 }}>Q{index + 1}</span>
                      {showDetail && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: answer.isCorrect
                              ? 'color-mix(in srgb, var(--quiz-correct, var(--primary)) 20%, transparent)'
                              : 'color-mix(in srgb, var(--text) 10%, transparent)',
                            color: answer.isCorrect ? correctColor : 'var(--text)',
                          }}
                        >
                          {answer.isCorrect ? `+${answer.score}` : '0'} {t('public.quiz.points')}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium mt-1" style={{ color: 'var(--text)' }} dangerouslySetInnerHTML={{ __html: sanitize(answer.fieldLabel || t('public.quiz.unnamed_question')) }} />
                  </div>

                  { }
                  <div className="flex-shrink-0" style={{ color: 'var(--text)', opacity: 0.5 }}>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                { }
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ borderTop: '1px solid color-mix(in srgb, var(--text) 10%, transparent)' }}
                    >
                      <div
                        className="p-4 space-y-3"
                        style={{ background: 'color-mix(in srgb, var(--text) 4%, transparent)' }}
                      >
                        { }
                        <div>
                          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text)', opacity: 0.7 }}>{t('public.quiz.your_answer')}</div>
                          <div
                            className="p-3 rounded-lg border"
                            style={{
                              background: answer.isCorrect
                                ? 'color-mix(in srgb, var(--quiz-correct, var(--primary)) 12%, transparent)'
                                : 'color-mix(in srgb, var(--quiz-incorrect) 12%, transparent)',
                              borderColor: answer.isCorrect
                                ? 'color-mix(in srgb, var(--quiz-correct, var(--primary)) 30%, transparent)'
                                : 'color-mix(in srgb, var(--quiz-incorrect) 30%, transparent)',
                              color: 'var(--text)',
                            }}
                          >
                            <p className="text-sm font-medium">{stripHtml(answer.userAnswer || '') || t('public.quiz.no_answer', '(No answer)')}</p>
                          </div>
                        </div>

                        { }
                        {showAnswer && !answer.isCorrect && answer.correctAnswer && (
                          <div>
                            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text)', opacity: 0.7 }}>{t('public.quiz.correct_answer')}</div>
                            <div
                              className="p-3 rounded-lg border"
                              style={{
                                background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                                borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)',
                                color: 'var(--text)',
                              }}
                            >
                              <p className="text-sm font-medium">{stripHtml(String(answer.correctAnswer))}</p>
                            </div>
                          </div>
                        )}
                        
                        { }
                        {showExplanation && (answer as any).explanation && (
                           <div className="mt-3 p-3 rounded-lg border bg-blue-50 border-blue-100">
                              <div className="flex items-center gap-2 mb-1">
                                 <div className="bg-blue-100 p-1 rounded-full">
                                   <div className="i-lucide-info w-3 h-3 text-blue-600" />
                                 </div>
                                 <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">{t('public.quiz.explanation', 'Explanation')}</span>
                              </div>
                              <p className="text-sm text-blue-900 leading-relaxed">{(answer as any).explanation}</p>
                           </div>
                        )}

                        { }
                        {answer.isCorrect ? (
                          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: correctColor }}>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t('public.quiz.correct_badge')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: incorrectColor }}>
                            <XCircle className="w-4 h-4" />
                            <span>{t('public.quiz.incorrect_badge')}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
      )}

      { }
      {visibleAnswers.length > 0 && (
      <div className="flex justify-center pb-8">
        <button
          onClick={() => {
            if (expandedItems.size === visibleAnswers.length) {
              setExpandedItems(new Set());
            } else {
              setExpandedItems(new Set(visibleAnswers.map((_, i) => i)));
            }
          }}
          className="group relative px-6 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--background)',
            border: '1px solid color-mix(in srgb, var(--primary) 80%, black)',
          }}
        >
          <span className="flex items-center gap-2">
            {expandedItems.size === visibleAnswers.length ? (
              <>
                <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                {t('public.quiz.collapse_all')}
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                {t('public.quiz.expand_all')}
              </>
            )}
          </span>
        </button>
      </div>
      )}
    </motion.div>
  );
}
