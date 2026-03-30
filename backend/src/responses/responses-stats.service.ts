import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleType, FormStatus, Prisma } from '@prisma/client';
export interface ValueCount {
  value: string;
  count: number;
  percentage: number;
}
export interface FieldStatResult {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  totalResponses: number;
  uniqueValues: number;
  valueCounts: ValueCount[];
  distributionCounts: ValueCount[];
}
export interface TrendItem {
  date: string;
  count: number;
}
export interface QuizStatsResult {
  averageScore: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  scoreDistribution: {range: string;count: number;}[];
  questionStats: {
    fieldId: string;
    label: string;
    correctCount: number;
    incorrectCount: number;
    correctRate: number;
  }[];
}
interface MatrixOptions {
  rows?: {id: string;label: string;}[];
  columns?: {id: string;label: string;}[];
}
interface FieldOption {
  label: string;
  value: string;
}
@Injectable()export class
ResponsesStatsService {
  constructor(private prisma: PrismaService) {}
  async getStats(
  formId: string,
  userId: string,
  userRole: RoleType,
  opts?: {month?: string;})
  {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { fields: { orderBy: { order: 'asc' } } }
    });
    if (!form) throw new NotFoundException('Form not found');
    if (userRole === RoleType.VIEWER && form.status !== FormStatus.PUBLISHED) {
      throw new ForbiddenException('You can only view stats for published forms');
    }
    const [responseTrend, fieldStats, quizStats] = await Promise.all([
    this.getResponseTrend(formId, opts?.month),
    this.getFieldStats(formId, form),
    form.isQuiz ? this.getQuizStats(formId, form) : null]
    );
    return { responseTrend, fieldStats, quizStats };
  }
  private async getResponseTrend(formId: string, month?: string): Promise<TrendItem[]> {
    const parsed = this.parseMonth(month);
    if (parsed) {
      const { year, monthIndex } = parsed;
      const startUtc = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
      const endUtc = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0));
      const rawTrend = await this.prisma.$queryRaw<{day: Date;count: bigint;}[]>`
        SELECT DATE("submittedAt") as day, COUNT(*)::bigint as count
        FROM "form_responses"
        WHERE "formId" = ${formId}
          AND "submittedAt" >= ${startUtc}
          AND "submittedAt" < ${endUtc}
        GROUP BY DATE("submittedAt")
        ORDER BY day ASC
      `;
      const trendMap = new Map<string, number>();
      rawTrend.forEach((r) => {
        const key = new Date(r.day).toISOString().split('T')[0];
        trendMap.set(key, Number(r.count));
      });
      const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
      const days: TrendItem[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(Date.UTC(year, monthIndex, day));
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
        days.push({ date: label, count: trendMap.get(key) || 0 });
      }
      return days;
    }
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 13);
    startDate.setHours(0, 0, 0, 0);
    const rawTrend = await this.prisma.$queryRaw<{day: Date;count: bigint;}[]>`
      SELECT DATE("submittedAt") as day, COUNT(*)::bigint as count
      FROM "form_responses"
      WHERE "formId" = ${formId} AND "submittedAt" >= ${startDate}
      GROUP BY DATE("submittedAt")
      ORDER BY day ASC
    `;
    const trendMap = new Map<string, number>();
    rawTrend.forEach((r) => {
      const key = new Date(r.day).toISOString().split('T')[0];
      trendMap.set(key, Number(r.count));
    });
    const days: TrendItem[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
      days.push({ date: label, count: trendMap.get(key) || 0 });
    }
    return days;
  }
  private parseMonth(month?: string): {year: number;monthIndex: number;} | null {
    if (!month) return null;
    const normalized = String(month).trim();
    const m = /^(\d{4})-(\d{2})$/.exec(normalized);
    if (!m) return null;
    const year = Number(m[1]);
    const monthNum = Number(m[2]);
    if (!Number.isFinite(year) || !Number.isFinite(monthNum)) return null;
    if (monthNum < 1 || monthNum > 12) return null;
    return { year, monthIndex: monthNum - 1 };
  }
  private async getFieldStats(
  formId: string,
  form: {fields: {id: string;type: string;label: string;options: unknown;}[];})
  : Promise<FieldStatResult[]> {
    const skipTypes = ['HEADER', 'PARAGRAPH', 'DIVIDER', 'PAGE_BREAK', 'SUBMIT'];
    const analyzableFields = form.fields.filter((f) => !skipTypes.includes(f.type));
    if (analyzableFields.length === 0) return [];
    const simpleFields = analyzableFields.filter((f) => !['MATRIX', 'TABLE'].includes(f.type));
    const complexFields = analyzableFields.filter((f) => ['MATRIX', 'TABLE'].includes(f.type));
    const stats: FieldStatResult[] = [];
    if (simpleFields.length > 0) {
      const fieldIds = simpleFields.map((f) => f.id);
      const rawCounts = await this.prisma.$queryRaw<{fieldId: string;value: string;count: bigint;}[]>`
        SELECT ra."fieldId", ra."value", COUNT(*)::bigint as count
        FROM "response_answers" ra
        INNER JOIN (
          SELECT "id" FROM "form_responses"
          WHERE "formId" = ${formId}
          ORDER BY "submittedAt" DESC
          LIMIT 1000
        ) fr ON ra."responseId" = fr."id"
        WHERE ra."fieldId" IN (${Prisma.join(fieldIds)})
        GROUP BY ra."fieldId", ra."value"
        ORDER BY count DESC
      `;
      const byField = new Map<string, {value: string;count: number;}[]>();
      rawCounts.forEach((r) => {
        const existing = byField.get(r.fieldId) || [];
        existing.push({ value: r.value || '(Empty)', count: Number(r.count) });
        byField.set(r.fieldId, existing);
      });
      simpleFields.forEach((field) => {
        const fieldLabel = this.stripHtml(field.label);
        const entries = byField.get(field.id) || [];
        const expandedCounts: Record<string, number> = {};
        entries.forEach(({ value, count }) => {
          if (value.startsWith('[') && value.endsWith(']')) {
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed)) {
                parsed.forEach((v: string) => {
                  expandedCounts[v] = (expandedCounts[v] || 0) + count;
                });
                return;
              }
            } catch {}
          }
          expandedCounts[value] = (expandedCounts[value] || 0) + count;
        });
        const total = Object.values(expandedCounts).reduce((s, c) => s + c, 0);
        const sorted = this.sortValues(expandedCounts, total);
        let distributionValues = [...sorted];
        const fieldOptions = field.options as FieldOption[] | null;
        if (Array.isArray(fieldOptions) && fieldOptions.length > 0) {
          const allOptionStats: ValueCount[] = [];
          const processedValues = new Set<string>();
          fieldOptions.forEach((opt) => {
            const optValue = typeof opt === 'string' ? opt : opt.value || opt.label;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            const count = expandedCounts[optValue] || 0;
            allOptionStats.push({
              value: optLabel,
              count,
              percentage: total > 0 ? count / total * 100 : 0
            });
            processedValues.add(optValue);
          });
          Object.entries(expandedCounts).forEach(([val, count]) => {
            if (!processedValues.has(val)) {
              allOptionStats.push({
                value: val,
                count,
                percentage: total > 0 ? count / total * 100 : 0
              });
            }
          });
          distributionValues = allOptionStats;
        }
        stats.push({
          fieldId: field.id,
          fieldLabel,
          fieldType: field.type,
          totalResponses: total,
          uniqueValues: Object.keys(expandedCounts).length,
          valueCounts: sorted,
          distributionCounts: distributionValues
        });
      });
    }
    for (const field of complexFields) {
      const fieldLabel = this.stripHtml(field.label);
      const sampleAnswers = await this.prisma.responseAnswer.findMany({
        where: {
          fieldId: field.id,
          response: { formId }
        },
        select: { value: true },
        take: 5000
      });
      if (field.type === 'MATRIX') {
        const matrixOpts = field.options as MatrixOptions | null;
        const rows = matrixOpts?.rows || [];
        rows.forEach((row) => {
          const rowResponses: string[] = [];
          sampleAnswers.forEach(({ value }) => {
            try {
              const parsed = JSON.parse(value);
              if (typeof parsed === 'object' && parsed !== null) {
                const rowVal = parsed[row.id];
                if (rowVal) {
                  if (Array.isArray(rowVal)) rowResponses.push(...rowVal.map(String));else
                  rowResponses.push(String(rowVal));
                }
              }
            } catch {}
          });
          const counts = this.countValues(rowResponses);
          const total = rowResponses.length;
          stats.push({
            fieldId: `${field.id}_${row.id}`,
            fieldLabel: `${fieldLabel} - ${row.label}`,
            fieldType: 'MATRIX_ROW',
            totalResponses: total,
            uniqueValues: Object.keys(counts).length,
            valueCounts: this.sortValues(counts, total),
            distributionCounts: this.sortValues(counts, total)
          });
        });
      }
      if (field.type === 'TABLE') {
        const tableOpts = field.options as MatrixOptions | null;
        const columns = tableOpts?.columns || [];
        columns.forEach((col) => {
          const colResponses: string[] = [];
          sampleAnswers.forEach(({ value }) => {
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed)) {
                parsed.forEach((row: Record<string, unknown>) => {
                  const cellVal = row[col.id] || row[col.label];
                  if (cellVal) colResponses.push(String(cellVal));
                });
              }
            } catch {}
          });
          const counts = this.countValues(colResponses);
          const total = colResponses.length;
          stats.push({
            fieldId: `${field.id}_${col.id}`,
            fieldLabel: `${fieldLabel} - ${col.label}`,
            fieldType: 'TABLE_COLUMN',
            totalResponses: total,
            uniqueValues: Object.keys(counts).length,
            valueCounts: this.sortValues(counts, total, 10),
            distributionCounts: this.sortValues(counts, total, 10)
          });
        });
      }
    }
    return stats;
  }
  private async getQuizStats(
  formId: string,
  form: {fields: {id: string;correctAnswer: string | null;label: string;score: number | null;}[];quizSettings?: any;})
  : Promise<QuizStatsResult | null> {
    const passPercentage = form.quizSettings?.passPercentage ?? 50;
    const aggregated = await this.prisma.$queryRaw<{
      avg_score: number;
      avg_pct: number;
      max_score: number;
      min_score: number;
      total: bigint;
      pass_count: bigint;
    }[]>`
      SELECT
        AVG("score")::float as avg_score,
        AVG("score" * 100.0 / NULLIF("totalScore", 0))::float as avg_pct,
        MAX("score") as max_score,
        MIN("score") as min_score,
        COUNT("score")::bigint as total,
        COUNT(*) FILTER (WHERE ("score" * 100.0 / NULLIF("totalScore", 0)) >= ${passPercentage})::bigint as pass_count
      FROM "form_responses"
      WHERE "formId" = ${formId} AND "score" IS NOT NULL
    `;
    if (!aggregated[0] || Number(aggregated[0].total) === 0) return null;
    const row = aggregated[0];
    const totalCount = Number(row.total);
    const distRaw = await this.prisma.$queryRaw<{bucket: number;count: bigint;}[]>`
      SELECT
        FLOOR(("score" * 100.0 / NULLIF("totalScore", 0)) / 20)::int as bucket,
        COUNT(*)::bigint as count
      FROM "form_responses"
      WHERE "formId" = ${formId} AND "score" IS NOT NULL
      GROUP BY bucket
      ORDER BY bucket
    `;
    const scoreRanges = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
    const distribution = scoreRanges.map((range, i) => {
      const found = distRaw.find((d) => d.bucket === i);
      return { range, count: found ? Number(found.count) : 0 };
    });
    const quizFields = form.fields.filter((f) => f.correctAnswer);
    const questionStatsRaw = quizFields.length > 0 ?
    await this.prisma.$queryRaw<{fieldId: string;correct: bigint;incorrect: bigint;}[]>`
          SELECT
            ra."fieldId",
            COUNT(*) FILTER (WHERE ra."isCorrect" = true)::bigint as correct,
            COUNT(*) FILTER (WHERE ra."isCorrect" = false)::bigint as incorrect
          FROM "response_answers" ra
          INNER JOIN "form_responses" fr ON ra."responseId" = fr."id"
          WHERE fr."formId" = ${formId} AND ra."fieldId" IN (${Prisma.join(quizFields.map((f) => f.id))})
          GROUP BY ra."fieldId"
        ` :
    [];
    const questionStats = quizFields.map((field) => {
      const found = questionStatsRaw.find((r) => r.fieldId === field.id);
      const correctCount = found ? Number(found.correct) : 0;
      const incorrectCount = found ? Number(found.incorrect) : 0;
      const total = correctCount + incorrectCount;
      return {
        fieldId: field.id,
        label: field.label,
        correctCount,
        incorrectCount,
        correctRate: total > 0 ? correctCount / total * 100 : 0
      };
    });
    questionStats.sort((a, b) => a.correctRate - b.correctRate);
    return {
      averageScore: row.avg_score || 0,
      averagePercentage: row.avg_pct || 0,
      highestScore: row.max_score || 0,
      lowestScore: row.min_score || 0,
      passRate: totalCount > 0 ? Number(row.pass_count) / totalCount * 100 : 0,
      scoreDistribution: distribution,
      questionStats
    };
  }
  private stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  }
  private countValues(values: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    values.forEach((v) => {
      counts[v] = (counts[v] || 0) + 1;
    });
    return counts;
  }
  private sortValues(
  counts: Record<string, number>,
  total: number,
  limit?: number)
  : ValueCount[] {
    const sorted = Object.entries(counts).
    map(([value, count]) => ({
      value,
      count,
      percentage: total > 0 ? count / total * 100 : 0
    })).
    sort((a, b) => b.count - a.count);
    if (limit && sorted.length > limit) {
      const limited = sorted.slice(0, limit);
      limited.push({
        value: `... ${sorted.length - limit} more`,
        count: 0,
        percentage: 0
      });
      return limited;
    }
    return sorted;
  }
}