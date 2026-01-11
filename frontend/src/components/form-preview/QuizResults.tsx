import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { useState } from 'react';

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
}

export default function QuizResults({ quizReview, score }: QuizResultsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  
  const { answers, showAnswer, showDetail } = quizReview;
  const percentage = score.totalScore > 0 ? (score.score / score.totalScore) * 100 : 0;
  const correctCount = answers.filter(a => a.isCorrect).length;

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
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">Quiz Results Summary</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/60 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{correctCount}</div>
            <div className="text-xs text-gray-600 mt-1">Correct</div>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-rose-600">{answers.length - correctCount}</div>
            <div className="text-xs text-gray-600 mt-1">Incorrect</div>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{percentage.toFixed(0)}%</div>
            <div className="text-xs text-gray-600 mt-1">Percentage</div>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{score.score}/{score.totalScore}</div>
            <div className="text-xs text-gray-600 mt-1">Score</div>
          </div>
        </div>
      </div>

      {/* Answer Review List */}
      <div className="space-y-3">
        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>Answer Details</span>
          <span className="text-sm font-normal text-gray-500">({answers.length} questions)</span>
        </h4>

        <div className="space-y-2">
          {answers.map((answer, index) => {
            const isExpanded = expandedItems.has(index);
            
            return (
              <motion.div
                key={answer.fieldId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                  answer.isCorrect 
                    ? 'border-emerald-200 hover:border-emerald-300' 
                    : 'border-rose-200 hover:border-rose-300'
                }`}
              >
                {/* Header - Always visible */}
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {answer.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-600" />
                    )}
                  </div>

                  {/* Question Label */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">Q{index + 1}</span>
                      {showDetail && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          answer.isCorrect 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {answer.isCorrect ? `+${answer.score}` : '0'} pts
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">{answer.fieldLabel}</p>
                  </div>

                  {/* Expand Icon */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Content - Expandable */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-4 space-y-3 bg-gray-50/50">
                        {/* User's Answer */}
                        <div>
                          <div className="text-xs font-semibold text-gray-500 mb-1">Your Answer:</div>
                          <div className={`p-3 rounded-lg border ${
                            answer.isCorrect 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}>
                            <p className="text-sm font-medium">{answer.userAnswer || '(No answer)'}</p>
                          </div>
                        </div>

                        {/* Correct Answer - Show only if showAnswer is true and answer is wrong */}
                        {showAnswer && !answer.isCorrect && answer.correctAnswer && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 mb-1">Correct Answer:</div>
                            <div className="p-3 rounded-lg border bg-indigo-50 border-indigo-200 text-indigo-900">
                              <p className="text-sm font-medium">{answer.correctAnswer}</p>
                            </div>
                          </div>
                        )}

                        {/* Feedback */}
                        {answer.isCorrect ? (
                          <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Correct</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-rose-700 text-sm font-medium">
                            <XCircle className="w-4 h-4" />
                            <span>Incorrect answer</span>
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

      {/* Expand All / Collapse All */}
      <div className="flex justify-center pb-8">
        <button
          onClick={() => {
            if (expandedItems.size === answers.length) {
              setExpandedItems(new Set());
            } else {
              setExpandedItems(new Set(answers.map((_, i) => i)));
            }
          }}
          className="group relative px-6 py-3 bg-black text-white font-semibold rounded-xl shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:bg-gray-800 transition-all duration-300 hover:scale-105 active:scale-95 border border-gray-800"
        >
          <span className="flex items-center gap-2">
            {expandedItems.size === answers.length ? (
              <>
                <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                Expand All
              </>
            )}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
