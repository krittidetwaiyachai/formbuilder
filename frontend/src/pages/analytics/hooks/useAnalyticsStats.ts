import { useState, useCallback } from 'react';
import api from '@/lib/api';
import type { FieldStats, QuizStats } from '../types';

export const useAnalyticsStats = () => {
  const [fieldStats, setFieldStats] = useState<FieldStats[]>([]);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [responseTrend, setResponseTrend] = useState<{ date: string; count: number }[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const loadStats = useCallback(async (formId: string) => {
    setStatsLoading(true);
    try {
      const response = await api.get(`/responses/form/${formId}/stats`);
      const { responseTrend: trend, fieldStats: fields, quizStats: quiz } = response.data;

      if (trend) setResponseTrend(trend);
      if (fields) setFieldStats(fields);
      if (quiz) setQuizStats(quiz);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  return {
    fieldStats,
    quizStats,
    responseTrend,
    statsLoading,
    loadStats,
  };
};