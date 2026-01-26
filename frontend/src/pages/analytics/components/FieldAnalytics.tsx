import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { CheckCircle2, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/custom-select';
import { FieldStats } from '../types';
import { Form } from '@/types';

interface FieldAnalyticsProps {
  form: Form | null;
  fieldStats: FieldStats[];
  totalResponses: number;
  initialSelectedField: string;
  onCopy: (id: string) => void;
  copySuccess: string | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

export const FieldAnalytics: React.FC<FieldAnalyticsProps> = ({
  form,
  fieldStats,
  totalResponses,
  initialSelectedField,
  onCopy,
  copySuccess
}) => {
  const { t } = useTranslation();
  const [selectedField, setSelectedField] = useState(initialSelectedField);

  useEffect(() => {
     if (initialSelectedField && initialSelectedField !== 'all') {
         setSelectedField(initialSelectedField);
     }
  }, [initialSelectedField]);

  const selectedFieldStats = fieldStats.find((f) => f.fieldId === selectedField);

  if (form?.isQuiz) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('analytics.field_selection')}</h3>
        <Select value={selectedField} onValueChange={setSelectedField}>
          <SelectTrigger className="w-full mb-4 h-12">
            <SelectValue placeholder={t('analytics.select_field')} />
          </SelectTrigger>
          <SelectContent>
            {fieldStats.map((field) => (
              <SelectItem key={field.fieldId} value={field.fieldId}>
                {field.fieldLabel} ({field.totalResponses} {t('analytics.view_responses').toLowerCase()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedFieldStats && (
          <div className="relative">
            <div className="absolute top-0 right-0 z-10">
              <button
                onClick={() => onCopy('field-analytics-pie')}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white/80 rounded-lg transition-colors backdrop-blur-sm"
                title={t('analytics.copy_chart')}
              >
                {copySuccess === 'field-analytics-pie' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <div id="field-analytics-pie" className="p-2 bg-white rounded-lg">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={selectedFieldStats.valueCounts.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(name || '').slice(0, 10)}${(name || '').length > 10 ? '...' : ''} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="value"
                  >
                    {selectedFieldStats.valueCounts.slice(0, 8).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm col-span-1 lg:col-span-2"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{t('analytics.field_analytics')}</h3>
        </div>

        <Select value={selectedField} onValueChange={setSelectedField}>
            <SelectTrigger className="w-full mb-8 h-14 text-base font-medium border-2 hover:border-gray-300 transition-colors">
                <SelectValue placeholder={t('analytics.select_field_analyze')} />
            </SelectTrigger>
            <SelectContent>
                {fieldStats.map((field) => (
                <SelectItem key={field.fieldId} value={field.fieldId} className="text-base">
                    <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{stripHtml(field.fieldLabel)}</span>
                    <span className="text-sm text-gray-500 ml-3">({totalResponses.toLocaleString()} responses)</span>
                    </div>
                </SelectItem>
                ))}
            </SelectContent>
        </Select>

        {selectedFieldStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-5">
                    <h4 className="text-lg font-bold text-gray-900">{t('analytics.response_ranking')}</h4>
                    <button
                        onClick={() => onCopy('response-ranking-list')}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                        title={t('analytics.copy_list')}
                    >
                    {copySuccess === 'response-ranking-list' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                        <Copy className="w-4 h-4" />
                    )}
                    </button>
                </div>
                <div id="response-ranking-list" className="space-y-3">
                    {selectedFieldStats.valueCounts.slice(0, 10).map((item, i) => (
                    <div key={item.value} className="group flex items-center gap-4 py-3 px-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-black to-gray-700 text-white font-bold text-sm shadow-md">
                        {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.value}</p>
                        </div>
                        <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">{item.count}</span>
                        <div className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <span className="text-sm font-bold text-indigo-700">{item.percentage.toFixed(1)}%</span>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-5">
                        <h4 className="text-lg font-bold text-gray-900">{t('analytics.distribution_chart')}</h4>
                        <button
                            onClick={() => onCopy('distribution-chart')}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                            title={t('analytics.copy_chart')}
                        >
                            {copySuccess === 'distribution-chart' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    <div id="distribution-chart" className="p-4 bg-white rounded-lg border border-gray-200">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={selectedFieldStats.distributionCounts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis
                                    type="category"
                                    dataKey="value"
                                    width={100}
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + '...' : value}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Bar dataKey="count" fill="#000000" name={t('analytics.count')} radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        )}
      </motion.div>
    </div>
  );
};
