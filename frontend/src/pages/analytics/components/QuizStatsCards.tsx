import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Copy, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QuizStats } from '../types';

interface QuizStatsCardsProps {
  stats: QuizStats | null;
  onCopy: (id: string) => void;
  copySuccess: string | null;
}

export const QuizStatsCards: React.FC<QuizStatsCardsProps> = ({ stats, onCopy, copySuccess }) => {
  const { t } = useTranslation();

  if (!stats) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('analytics.score_distribution')}</h3>
          <button
            onClick={() => onCopy('score-dist-chart')}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('analytics.copy_chart')}
          >
            {copySuccess === 'score-dist-chart' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <div id="score-dist-chart" className="p-2 bg-white rounded-lg">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#10b981" name={t('analytics.count')} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">{t('analytics.quiz_summary')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>
            <div className="relative">
              <div className="text-3xl font-bold text-white mb-1">{stats.averageScore.toFixed(1)}</div>
              <div className="text-xs font-semibold text-blue-100 uppercase tracking-wide">{t('analytics.average_score')}</div>
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>
            <div className="relative">
              <div className="text-3xl font-bold text-white mb-1">{stats.averagePercentage.toFixed(1)}%</div>
              <div className="text-xs font-semibold text-green-100 uppercase tracking-wide">{t('analytics.average_percentage')}</div>
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>
            <div className="relative">
              <div className="text-3xl font-bold text-white mb-1">{stats.passRate.toFixed(1)}%</div>
              <div className="text-xs font-semibold text-purple-100 uppercase tracking-wide">{t('analytics.pass_rate')}</div>
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>
            <div className="relative">
              <div className="text-3xl font-bold text-white mb-1">{stats.highestScore}</div>
              <div className="text-xs font-semibold text-amber-100 uppercase tracking-wide">{t('analytics.highest_score')}</div>
            </div>
          </div>
        </div>

        <h4 className="text-base font-bold text-gray-900 mb-4">{t('analytics.question_analysis')}</h4>
        <div className="space-y-3">
          {stats.questionStats.slice(0, 5).map((q, i) => (
            <div key={q.fieldId} className="group bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-md">
                  <span className="text-base font-bold text-white">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 mb-2 truncate">{q.label}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          q.correctRate > 70 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                            : q.correctRate > 40 
                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500' 
                            : 'bg-gradient-to-r from-red-400 to-rose-500'
                        }`}
                        style={{ width: `${q.correctRate}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-12 text-right">{q.correctRate.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-md border border-green-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-700">{q.correctCount}</span>
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 rounded-md border border-red-200">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="font-bold text-red-700">{q.incorrectCount}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};
