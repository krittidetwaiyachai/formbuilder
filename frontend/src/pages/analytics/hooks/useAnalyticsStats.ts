import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, FormResponse } from '@/types';
import { FieldStats, QuizStats } from '../types';

const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

export const useAnalyticsStats = () => {
  const { t } = useTranslation();
  const [fieldStats, setFieldStats] = useState<FieldStats[]>([]);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [responseTrend, setResponseTrend] = useState<{ date: string; count: number }[]>([]);

  const calculateFieldStats = useCallback((formData: Form, responsesData: FormResponse[]) => {
    const stats: FieldStats[] = [];

    formData.fields?.forEach((field) => {
      if (['HEADER', 'PARAGRAPH', 'DIVIDER', 'PAGE_BREAK', 'SUBMIT'].includes(field.type)) return;

      if (field.type === 'MATRIX') {
        const rows = field.options?.rows || [];
        rows.forEach((row: any) => {
          const rowLabel = row.label || row.id;
          const virtualFieldLabel = `${stripHtml(field.label)} - ${rowLabel}`;
          
          const rowResponses: string[] = [];
          responsesData.forEach((r) => {
             const answer = r.answers?.find((a) => a.fieldId === field.id);
             if (answer && answer.value) {
                try {
                   const parsedValue = typeof answer.value === 'string' && (answer.value.startsWith('{') || answer.value.startsWith('[')) 
                      ? JSON.parse(answer.value) 
                      : answer.value;
                   
                   if (typeof parsedValue === 'object' && parsedValue !== null) {
                      const val = parsedValue[row.id];
                      if (val) {
                         if (Array.isArray(val)) {
                            rowResponses.push(...val);
                         } else {
                            rowResponses.push(String(val));
                         }
                      }
                   }
                } catch (e) {
                   console.warn('Failed to parse matrix answer', e);
                }
             }
          });

          const valueCounts = countValues(rowResponses);
          const total = rowResponses.length;
          const sortedValues = sortValues(valueCounts, total, t);

           stats.push({
            fieldId: `${field.id}_${row.id}`,
            fieldLabel: virtualFieldLabel,
            fieldType: 'MATRIX_ROW',
            totalResponses: total,
            uniqueValues: Object.keys(valueCounts).length,
            valueCounts: sortedValues,
            distributionCounts: sortedValues, 
          });
        });
        return;
      }

      if (field.type === 'TABLE') {
        const columns = field.options?.columns || [];
        columns.forEach((col: any) => {
            const colLabel = col.label || col.id;
            const virtualFieldLabel = `${stripHtml(field.label)} - ${colLabel}`;
            const colResponses: string[] = [];
            
            responsesData.forEach((r) => {
                const answer = r.answers?.find((a) => a.fieldId === field.id);
                if (answer && answer.value) {
                    try {
                        const parsedValue = typeof answer.value === 'string' && (answer.value.startsWith('{') || answer.value.startsWith('['))
                            ? JSON.parse(answer.value) 
                            : answer.value;

                        if (Array.isArray(parsedValue)) {
                            parsedValue.forEach((row: any) => {
                                const val = row[col.id] || row[colLabel];
                                if (row && val) {
                                    colResponses.push(String(val));
                                }
                            });
                        }
                    } catch (e) {
                         console.warn('Failed to parse table answer', e);
                    }
                }
            });

            const valueCounts = countValues(colResponses);
            const total = colResponses.length;
            const sortedValues = sortValues(valueCounts, total, t, 10);
            
            stats.push({
                fieldId: `${field.id}_${col.id}`,
                fieldLabel: virtualFieldLabel,
                fieldType: 'TABLE_COLUMN',
                totalResponses: total,
                uniqueValues: Object.keys(valueCounts).length,
                valueCounts: sortedValues,
                distributionCounts: sortedValues,
            });
        });
        return;
      }

      const fieldResponses = responsesData.flatMap(
        (r) => r.answers?.filter((a) => a.fieldId === field.id).map((a) => a.value) || []
      );

      const valueCounts: Record<string, number> = {};
      fieldResponses.forEach((value) => {
        const key = value || t('analytics.empty', '(Empty)');
        if (typeof key === 'string' && key.startsWith('[') && key.endsWith(']')) {
             try {
                 const parsed = JSON.parse(key);
                 if (Array.isArray(parsed)) {
                     parsed.forEach(v => {
                         valueCounts[v] = (valueCounts[v] || 0) + 1;
                     });
                     return;
                 }
             } catch {}
        }
        valueCounts[key] = (valueCounts[key] || 0) + 1;
      });

      const total = fieldResponses.length;
      const sortedValues = sortValues(valueCounts, total, t);
      let distributionValues = [...sortedValues];
      
      if (field.options && Array.isArray(field.options) && field.options.length > 0) {
        const valueToLabelMap = new Map<string, string>();
        field.options.forEach((opt: any) => {
          if (typeof opt === 'string') {
            valueToLabelMap.set(opt, opt);
          } else {
            valueToLabelMap.set(opt.value || opt.label, opt.label);
          }
        });

        const allOptionStats: { value: string; count: number; percentage: number }[] = [];
        const processedValues = new Set<string>();

        field.options.forEach((opt: any) => {
          const optValue = typeof opt === 'string' ? opt : (opt.value || opt.label);
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          const count = valueCounts[optValue] || 0;
          allOptionStats.push({
            value: optLabel,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
          });
          processedValues.add(optValue);
        });

        Object.entries(valueCounts).forEach(([val, count]) => {
          if (!processedValues.has(val)) {
            const displayLabel = valueToLabelMap.get(val) || val;
            allOptionStats.push({
              value: displayLabel,
              count,
              percentage: total > 0 ? (count / total) * 100 : 0,
            });
          }
        });

        distributionValues = allOptionStats;
      }

      stats.push({
        fieldId: field.id,
        fieldLabel: stripHtml(field.label),
        fieldType: field.type,
        totalResponses: total,
        uniqueValues: Object.keys(valueCounts).length,
        valueCounts: sortedValues,
        distributionCounts: distributionValues,
      });
    });

    setFieldStats(stats);
  }, [t]);

  const calculateResponseTrend = useCallback((responsesData: FormResponse[]) => {
    const days: { date: Date; label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d,
        label: d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
        count: 0
      });
    }

    responsesData.forEach((r) => {
      const responseDate = new Date(r.submittedAt);
      const normalizedResponseDate = new Date(responseDate.getFullYear(), responseDate.getMonth(), responseDate.getDate());
      
      const dayEntry = days.find(d => {
        const normalizedDay = new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate());
        return normalizedDay.getTime() === normalizedResponseDate.getTime();
      });

      if (dayEntry) {
        dayEntry.count++;
      }
    });

    setResponseTrend(days.map(d => ({ date: d.label, count: d.count })));
  }, []);

  const calculateQuizStats = useCallback((formData: Form, responsesData: FormResponse[]) => {
    const scores = responsesData.map((r) => ({
      score: r.score || 0,
      totalScore: r.totalScore || 0,
      percentage: r.totalScore ? ((r.score || 0) / r.totalScore) * 100 : 0,
    }));

    if (scores.length === 0) return;

    const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    const avgPercentage = scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length;
    const passRate = (scores.filter((s) => s.percentage >= 50).length / scores.length) * 100;

    const scoreRanges = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
    const distribution = scoreRanges.map((range, i) => {
      const min = i * 20;
      const max = (i + 1) * 20;
      const count = scores.filter((s) => s.percentage >= min && s.percentage < max).length;
      return { range, count };
    });

    const questionStats: QuizStats['questionStats'] = [];
    formData.fields?.forEach((field) => {
      if (!field.correctAnswer) return;

      let correctCount = 0;
      let incorrectCount = 0;

      responsesData.forEach((r) => {
        const answer = r.answers?.find((a) => a.fieldId === field.id);
        if (answer) {
          if (answer.isCorrect) {
            correctCount++;
          } else {
            incorrectCount++;
          }
        }
      });

      const total = correctCount + incorrectCount;
      questionStats.push({
        fieldId: field.id,
        label: field.label,
        correctCount,
        incorrectCount,
        correctRate: total > 0 ? (correctCount / total) * 100 : 0,
      });
    });

    questionStats.sort((a, b) => a.correctRate - b.correctRate);

    setQuizStats({
      averageScore: avgScore,
      averagePercentage: avgPercentage,
      highestScore: Math.max(...scores.map((s) => s.score)),
      lowestScore: Math.min(...scores.map((s) => s.score)),
      passRate,
      scoreDistribution: distribution,
      questionStats,
    });
  }, []);

  return {
    fieldStats,
    quizStats,
    responseTrend,
    calculateFieldStats,
    calculateResponseTrend,
    calculateQuizStats,
  };
};

function countValues(values: string[]) {
  const counts: Record<string, number> = {};
  values.forEach((v) => {
    counts[v] = (counts[v] || 0) + 1;
  });
  return counts;
}

function sortValues(counts: Record<string, number>, total: number, t: any, limit?: number) {
  const sorted = Object.entries(counts)
    .map(([value, count]) => ({
      value,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
  
  if (limit && sorted.length > limit) {
      const limited = sorted.slice(0, limit);
      limited.push({ 
        value: t('analytics.more_items', { count: sorted.length - limit, defaultValue: `... ${sorted.length - limit} more` }), 
        count: 0, 
        percentage: 0 
      });
      return limited;
  }
  return sorted;
}
