import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Eye,
  FileText,
  TrendingUp,
  ArrowLeft,
  Download,
  CheckCircle2,
  XCircle,
  BarChart3,
  Copy,
  List,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/custom-select';
import Loader from '@/components/common/Loader';
import api from '@/lib/api';
import { Form, FormResponse } from '@/types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface FieldStats {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  totalResponses: number;
  uniqueValues: number;
  valueCounts: { value: string; count: number; percentage: number }[];
  distributionCounts: { value: string; count: number; percentage: number }[];
}

interface QuizStats {
  averageScore: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  scoreDistribution: { range: string; count: number }[];
  questionStats: { fieldId: string; label: string; correctCount: number; incorrectCount: number; correctRate: number }[];
}

  import { useToast } from '@/components/ui/toaster';

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState<string>('');
  const [fieldStats, setFieldStats] = useState<FieldStats[]>([]);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [responseTrend, setResponseTrend] = useState<{ date: string; count: number }[]>([]);
  const [showResponseViewer, setShowResponseViewer] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const { toast } = useToast();

  const copyChartToClipboard = async (chartId: string) => {
    try {
      const chartElement = document.getElementById(chartId);
      if (!chartElement) return;
      
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartElement, { backgroundColor: '#ffffff' });
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setCopySuccess(chartId);
            setTimeout(() => setCopySuccess(null), 2000);
            toast({
              title: t('analytics.chart_copied'),
              description: t('analytics.chart_copied'), 
              variant: "success",
              duration: 2000
            });
          } catch {
            const link = document.createElement('a');
            link.download = `${chartId}.png`;
            link.href = canvas.toDataURL();
            link.click();
            setCopySuccess(chartId);
            setTimeout(() => setCopySuccess(null), 2000);
            toast({
              title: t('analytics.chart_downloaded'),
              description: t('analytics.chart_downloaded'),
              variant: "success",
              duration: 2000
            });
          }
        }
      }, 'image/png');
    } catch (error) {
      console.error('Failed to copy chart:', error);
      toast({
        title: t('auth.error'),
        description: t('analytics.export_failed'),
        variant: "error"
      });
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [formRes, responsesRes] = await Promise.all([
        api.get(`/forms/${id}`),
        api.get(`/responses/form/${id}`),
      ]);

      const formData = formRes.data.form;
      const responsesData = responsesRes.data || [];

      setForm(formData);
      setResponses(responsesData);

      if (responsesData.length > 0) {
        calculateFieldStats(formData, responsesData);
        calculateResponseTrend(responsesData);

        if (formData.isQuiz) {
          calculateQuizStats(formData, responsesData);
        }

        if (formData.fields?.length > 0) {
          const firstAnalyzableField = formData.fields.find(
            (f: { type: string }) => !['HEADER', 'PARAGRAPH', 'DIVIDER', 'PAGE_BREAK', 'SUBMIT'].includes(f.type)
          );
          if (firstAnalyzableField) {
            setSelectedField(firstAnalyzableField.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFieldStats = (formData: Form, responsesData: FormResponse[]) => {
    const stats: FieldStats[] = [];

    formData.fields?.forEach((field) => {
      if (['HEADER', 'PARAGRAPH', 'DIVIDER', 'PAGE_BREAK', 'SUBMIT'].includes(field.type)) return;

      if (field.type === 'MATRIX') {
        // Special handling for MATRIX: Generate stats per row
        const rows = field.options?.rows || [];
        // const columns = field.options?.columns || []; // Not used for stats aggregation but good to know

        rows.forEach((row: any) => {
          const rowLabel = row.label || row.id;
          const virtualFieldLabel = `${field.label} - ${rowLabel}`;
          
          const rowResponses: string[] = [];
          
          responsesData.forEach((r) => {
             const answer = r.answers?.find((a) => a.fieldId === field.id);
             if (answer && answer.value) {
                try {
                   // Answers are stored as JSON string of { rowId: val, ... }
                   // But wait, the backend response.answers might already be parsed if it's JSON type? 
                   // Looking at types, ResponseAnswer.value is String.
                   // So it is likely a JSON string.
                   const parsedValue = typeof answer.value === 'string' && (answer.value.startsWith('{') || answer.value.startsWith('[')) 
                      ? JSON.parse(answer.value) 
                      : answer.value;
                   
                   if (typeof parsedValue === 'object' && parsedValue !== null) {
                      const val = parsedValue[row.id];
                      if (val) {
                         if (Array.isArray(val)) {
                            // Checkbox type: add all selected options
                            rowResponses.push(...val);
                         } else {
                            // Radio type
                            rowResponses.push(String(val));
                         }
                      }
                   }
                } catch (e) {
                   console.warn('Failed to parse matrix answer', e);
                }
             }
          });

          // Standard aggregation for this row
          const valueCounts: Record<string, number> = {};
          rowResponses.forEach((value) => {
             valueCounts[value] = (valueCounts[value] || 0) + 1;
          });

          const total = rowResponses.length;
          const sortedValues = Object.entries(valueCounts)
            .map(([value, count]) => ({
              value,
              count,
              percentage: total > 0 ? (count / total) * 100 : 0,
            }))
            .sort((a, b) => b.count - a.count);

           stats.push({
            fieldId: `${field.id}_${row.id}`, // Virtual ID
            fieldLabel: virtualFieldLabel,
            fieldType: 'MATRIX_ROW', // Virtual Type
            totalResponses: total,
            uniqueValues: Object.keys(valueCounts).length,
            valueCounts: sortedValues,
            // For Matrix, currently just using sortedValues as distribution. 
            // Could map to columns if needed for perfect order.
            distributionCounts: sortedValues, 
          });
        });

        return; // Skip default processing
      }

      if (field.type === 'TABLE') {
        // Handle TABLE: Generate stats per column
        const columns = field.options?.columns || [];
        
        columns.forEach((col: any) => {
            const colLabel = col.label || col.id;
            const virtualFieldLabel = `${field.label} - ${colLabel}`; // e.g. "Employee List - Name"
            
            const colResponses: string[] = [];
            
            responsesData.forEach((r) => {
                const answer = r.answers?.find((a) => a.fieldId === field.id);
                if (answer && answer.value) {
                    try {
                        const parsedValue = typeof answer.value === 'string' && (answer.value.startsWith('{') || answer.value.startsWith('['))
                            ? JSON.parse(answer.value) 
                            : answer.value;

                        if (Array.isArray(parsedValue)) {
                            // Array of rows: [{ "c1": "Value A", "c2": "Value B" }]
                            parsedValue.forEach((row: any) => {
                                // Try ID first, then label (for backward compatibility if needed, though we just switched)
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

             // Standard aggregation for this column
            const valueCounts: Record<string, number> = {};
            colResponses.forEach((value) => {
                valueCounts[value] = (valueCounts[value] || 0) + 1;
            });

            const total = colResponses.length;
            const sortedValues = Object.entries(valueCounts)
                .map(([value, count]) => ({
                    value,
                    count,
                    percentage: total > 0 ? (count / total) * 100 : 0,
                }))
                .sort((a, b) => b.count - a.count);
            
             // Limit to top 10 values for text inputs to avoid clutter
            const limitedValues = sortedValues.slice(0, 10);
            if (sortedValues.length > 10) {
                 limitedValues.push({ value: `... ${sortedValues.length - 10} more`, count: 0, percentage: 0 });
            }

            stats.push({
                fieldId: `${field.id}_${col.id}`,
                fieldLabel: virtualFieldLabel,
                fieldType: 'TABLE_COLUMN', // Virtual Type
                totalResponses: total,
                uniqueValues: Object.keys(valueCounts).length,
                valueCounts: limitedValues,
                distributionCounts: limitedValues,
            });
        });

        return;
      }

      // Default processing for other fields
      const fieldResponses = responsesData.flatMap(
        (r) => r.answers?.filter((a) => a.fieldId === field.id).map((a) => a.value) || []
      );

      const valueCounts: Record<string, number> = {};
      fieldResponses.forEach((value) => {
        const key = value || '(Empty)';
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
      // Recalculate total for multi-select (e.g. total selections made) vs total respondents? 
      // For now keeping simple count.

      const sortedValues = Object.entries(valueCounts)
        .map(([value, count]) => ({
          value,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      let distributionValues = [...sortedValues];
      
      // @ts-ignore - field type definition might be incomplete
      if (field.options && Array.isArray(field.options) && field.options.length > 0) {
        // Create a map of predefined options
        const optionMap = new Map();
        // @ts-ignore
        field.options.forEach((opt, index) => {
          const val = typeof opt === 'string' ? opt : opt.label;
          optionMap.set(val, index);
        });

        // Re-map distribution values based on ALL available options (including 0 counts)
        const allOptionStats: { value: string; count: number; percentage: number }[] = [];
        const processedValues = new Set();

        // 1. Add all predefined options
        // @ts-ignore
        field.options.forEach((opt) => {
          const val = typeof opt === 'string' ? opt : opt.label;
          const count = valueCounts[val] || 0;
          allOptionStats.push({
            value: val,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
          });
          processedValues.add(val);
        });

        // 2. Add any other values that appeared in responses but weren't in options (e.g. "Other" or old options)
        Object.entries(valueCounts).forEach(([val, count]) => {
          if (!processedValues.has(val)) {
            allOptionStats.push({
              value: val,
              count,
              percentage: total > 0 ? (count / total) * 100 : 0,
            });
          }
        });

        distributionValues = allOptionStats;
      }

      stats.push({
        fieldId: field.id,
        fieldLabel: field.label,
        fieldType: field.type,
        totalResponses: total,
        uniqueValues: Object.keys(valueCounts).length,
        valueCounts: sortedValues,
        distributionCounts: distributionValues,
      });
    });

    setFieldStats(stats);
  };

  const calculateResponseTrend = (responsesData: FormResponse[]) => {
    // 1. Generate dates for the last 14 days
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

    // 2. Count responses for each day
    responsesData.forEach((r) => {
      const responseDate = new Date(r.submittedAt);
      // Normalize to midnight for comparison
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
  };

  const calculateQuizStats = (formData: Form, responsesData: FormResponse[]) => {
    const scores = responsesData.map((r) => ({
      score: r.score || 0,
      totalScore: r.totalScore || 0,
      percentage: r.totalScore ? ((r.score || 0) / r.totalScore) * 100 : 0,
    }));

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
  };

  const selectedFieldStats = fieldStats.find((f) => f.fieldId === selectedField);

  const conversionRate = form?.viewCount && form.viewCount > 0
    ? ((responses.length / form.viewCount) * 100).toFixed(1)
    : '0';

  const handleExport = async () => {
    try {
      const response = await api.get(`/responses/form/${id}/export/csv`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = (form?.title || 'form').replace(/[^a-z0-9\u0E00-\u0E7F-_ ]/gi, '_');
      link.setAttribute('download', `${safeTitle}_responses.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export CSV:', error);
      toast({
        title: t('analytics.export_failed'),
        description: "Failed to export data",
        variant: "error"
      });
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
      <div className="relative bg-white md:border-b md:border-gray-200">
        {/* Mobile iOS Header */}
        <div className="md:hidden px-5 pt-12 pb-4 safe-area-pt border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Link
              to={`/forms/${id}/builder`}
              className="p-2 rounded-xl bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResponseViewer(true)}
                className="p-2.5 bg-gray-100 rounded-xl active:bg-gray-200 transition-colors"
              >
                <List className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleExport}
                className="p-2.5 bg-black rounded-xl active:bg-gray-800 transition-colors"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          <h1 className="text-[28px] font-bold text-black tracking-tight">{t('analytics.title')}</h1>
          <p className="text-sm text-gray-500 truncate">{form?.title}</p>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              <Link
                to={`/forms/${id}/builder`}
                className="group p-2 md:p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div>
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate max-w-[150px] sm:max-w-none">{form?.title || t('analytics.title')}</h1>
                  <span className="hidden sm:inline px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold uppercase tracking-wide text-gray-700 border border-gray-200">
                    {form?.status === 'PUBLISHED' ? t('analytics.status.published') : t('analytics.status.draft')}
                  </span>
                </div>
                <p className="text-gray-600 text-sm hidden sm:flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t('analytics.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3 self-end sm:self-center">
              <button
                onClick={() => setShowResponseViewer(true)}
                className="group inline-flex items-center px-3 md:px-5 py-2 md:py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                <List className="w-4 h-4 md:mr-2 group-hover:rotate-12 transition-transform" />
                <span className="hidden md:inline font-medium">{t('analytics.view_responses')}</span>
              </button>
              <button
                onClick={handleExport}
                className="group inline-flex items-center px-3 md:px-5 py-2 md:py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg font-medium"
              >
                <Download className="w-4 h-4 md:mr-2 group-hover:translate-y-0.5 transition-transform" />
                <span className="hidden md:inline">{t('analytics.export')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-8">
        {/* Summary Cards - Horizontal scroll on mobile */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 min-w-[200px] md:min-w-0 group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-100 md:border-white shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 group-hover:from-blue-500/10 group-hover:to-indigo-500/20 transition-all"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('analytics.total_views')}</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {form?.viewCount || 0}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {t('analytics.unique_visitors')}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-shrink-0 min-w-[200px] md:min-w-0 group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-100 md:border-white shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/10 group-hover:from-emerald-500/10 group-hover:to-green-500/20 transition-all"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('analytics.total_responses')}</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {responses.length}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {t('analytics.form_submissions')}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0 min-w-[200px] md:min-w-0 group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-100 md:border-white shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/10 group-hover:from-purple-500/10 group-hover:to-pink-500/20 transition-all"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('analytics.conversion_rate')}</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {conversionRate}%
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {t('analytics.responses_views')}
                </p>
              </div>
            </div>
          </motion.div>

        </div>

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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t('analytics.response_trend')}</h3>
                  <button
                    onClick={() => copyChartToClipboard('response-trend-chart')}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title={t('analytics.copy_chart')}
                  >
                    {copySuccess === 'response-trend-chart' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div id="response-trend-chart" className="p-2 bg-white rounded-lg">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={responseTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        axisLine={false}
                        tickLine={false}
                        minTickGap={30}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          padding: '12px',
                        }}
                        cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }}
                        itemStyle={{ color: '#6d28d9', fontWeight: 600, fontSize: '14px' }}
                        labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorResponses)" 
                        name={t('analytics.view_responses')}
                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: '#8b5cf6' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {form?.isQuiz && quizStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{t('analytics.score_distribution')}</h3>
                    <button
                      onClick={() => copyChartToClipboard('score-dist-chart')}
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
                      <BarChart data={quizStats.scoreDistribution}>
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
              )}

              {!form?.isQuiz && (
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
                          onClick={() => copyChartToClipboard('field-analytics-pie')}
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
                      < div id="field-analytics-pie" className="p-2 bg-white rounded-lg">
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={selectedFieldStats.valueCounts.slice(0, 8)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name.slice(0, 10)}${name.length > 10 ? '...' : ''} (${(percent * 100).toFixed(0)}%)`}
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
              )}
            </div>

            {form?.isQuiz && quizStats && (
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
                      <div className="text-3xl font-bold text-white mb-1">{quizStats.averageScore.toFixed(1)}</div>
                      <div className="text-xs font-semibold text-blue-100 uppercase tracking-wide">{t('analytics.average_score')}</div>
                    </div>
                  </div>
                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>
                    <div className="relative">
                      <div className="text-3xl font-bold text-white mb-1">{quizStats.averagePercentage.toFixed(1)}%</div>
                      <div className="text-xs font-semibold text-green-100 uppercase tracking-wide">{t('analytics.average_percentage')}</div>
                    </div>
                  </div>
                  <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>
                    <div className="relative">
                      <div className="text-3xl font-bold text-white mb-1">{quizStats.passRate.toFixed(1)}%</div>
                      <div className="text-xs font-semibold text-purple-100 uppercase tracking-wide">{t('analytics.pass_rate')}</div>
                    </div>
                  </div>
                  <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>
                    <div className="relative">
                      <div className="text-3xl font-bold text-white mb-1">{quizStats.highestScore}</div>
                      <div className="text-xs font-semibold text-amber-100 uppercase tracking-wide">{t('analytics.highest_score')}</div>
                    </div>
                  </div>
                </div>

                <h4 className="text-base font-bold text-gray-900 mb-4">{t('analytics.question_analysis')}</h4>
                <div className="space-y-3">
                  {quizStats.questionStats.slice(0, 5).map((q, i) => (
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
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm"
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
                        <span className="font-medium">{field.fieldLabel}</span>
                        <span className="text-sm text-gray-500 ml-3">({field.totalResponses} {t('analytics.view_responses').toLowerCase()})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedFieldStats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Response Ranking */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="text-lg font-bold text-gray-900">{t('analytics.response_ranking')}</h4>
                      <button
                        onClick={() => copyChartToClipboard('response-ranking-list')}
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
                        onClick={() => copyChartToClipboard('distribution-chart')}
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
          </>
        )}
      </div>

      <AnimatePresence>
        {showResponseViewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowResponseViewer(false)}
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
                    {t('analytics.viewing_responses', { count: responses.length })}
                  </p>
                </div>
                <button
                  onClick={() => setShowResponseViewer(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="space-y-4">
                  {responses.map((response, index) => {
                    const nameField = form?.fields?.find(f => f.label.toLowerCase().includes('name') || f.label.includes('ชื่อ'));
                    const emailField = form?.fields?.find(f => f.type === 'EMAIL' || f.label.toLowerCase().includes('email') || f.label.includes('อีเมล'));
                    
                    const nameValue = nameField ? response.answers?.find(a => a.fieldId === nameField.id)?.value : null;
                    // Use respondentEmail if available, otherwise fallback to form field search
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
                          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                            {responses.length - index}
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
                        {selectedResponse?.id === response.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
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
                                      <p className="text-sm font-medium text-gray-500">{field.label}</p>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
