import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { FormStatus, RoleType } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
interface FormSettings {
  allowMultipleSubmissions?: boolean;
  collectEmail?: boolean;
}
interface QuizSettings {
  startTime?: string | Date;
  endTime?: string | Date;
  showAnswer?: boolean;
  showDetail?: boolean;
}
export interface ExportJob {
  id: string;
  formId: string;
  status: 'processing' | 'completed' | 'failed';
  loaded: number;
  total: number;
  fileUrl?: string;
  filename?: string;
  error?: string;
}

@Injectable() export class
  ResponsesService {
  private exportJobs = new Map<string, ExportJob>();

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private eventEmitter: EventEmitter2) { }
  async create(createResponseDto: CreateResponseDto) {
    try {
      const { formId, answers, userId, respondentEmail, fingerprint, ipAddress } = createResponseDto;
      const form = await this.prisma.form.findUnique({
        where: { id: formId },
        select: {
          id: true,
          status: true,
          isQuiz: true,
          settings: true,
          fields: true,
          quizSettings: true
        }
      });
      if (!form) {
        throw new NotFoundException('Form not found');
      }
      if (form.status !== FormStatus.PUBLISHED) {
        throw new ForbiddenException('Form is not published');
      }
      if (form.isQuiz && form.quizSettings) {
        const quizSettings = form.quizSettings as unknown as QuizSettings;
        const now = new Date();
        if (quizSettings.startTime) {
          const startTime = new Date(quizSettings.startTime);
          if (now < startTime) {
            throw new ForbiddenException(`This quiz will be available starting ${startTime.toLocaleString()}`);
          }
        }
        if (quizSettings.endTime) {
          const endTime = new Date(quizSettings.endTime);
          if (now > endTime) {
            throw new ForbiddenException(`This quiz closed on ${endTime.toLocaleString()}`);
          }
        }
      }
      const settings = form.settings as unknown as FormSettings;
      const allowMultipleSubmissions = settings?.allowMultipleSubmissions === true;
      if (!allowMultipleSubmissions) {
        const whereConditions = [];
        if (userId) {
          whereConditions.push({ userId });
        }
        if (respondentEmail) {
          whereConditions.push({ respondentEmail });
        }
        if (fingerprint) {
          whereConditions.push({ fingerprint });
        }
        if (whereConditions.length > 0) {
          const existingResponse = await this.prisma.formResponse.findFirst({
            where: {
              formId,
              OR: whereConditions
            }
          });
          if (existingResponse) {
            throw new ForbiddenException('You have already submitted this form. Multiple submissions are not allowed.');
          }
        }
      }
      let score = 0;
      let totalScore = 0;
      const answerResults: { fieldId: string; value: string; isCorrect: boolean; }[] = [];
      if (form.isQuiz) {
        for (const answer of answers) {
          const field = form.fields.find((f) => f.id === answer.fieldId);
          if (field) {
            totalScore += field.score || 0;
            const isCorrect = field.correctAnswer === answer.value;
            if (isCorrect) {
              score += field.score || 0;
            }
            answerResults.push({
              fieldId: answer.fieldId,
              value: answer.value,
              isCorrect
            });
          }
        }
      }
      const response = await this.prisma.formResponse.create({
        data: {
          formId,
          userId: userId || null,
          respondentEmail: createResponseDto.respondentEmail || null,
          fingerprint: fingerprint || null,
          ipAddress: ipAddress ? this.encryptionService.hashIpAddress(ipAddress) : null,
          score: form.isQuiz ? score : null,
          totalScore: form.isQuiz ? totalScore : null,
          answers: {
            create: answers.map((answer) => {
              const result = answerResults.find((r) => r.fieldId === answer.fieldId);
              const field = form.fields.find((f) => f.id === answer.fieldId);
              const valueToStore = field?.isPII && answer.value ?
                this.encryptionService.encrypt(answer.value) :
                answer.value;
              return {
                fieldId: answer.fieldId,
                value: valueToStore,
                isCorrect: result?.isCorrect || null
              };
            })
          }
        },
        include: {
          answers: {
            include: {
              field: true
            }
          },
          form: {
            select: {
              id: true,
              title: true,
              isQuiz: true,
              quizSettings: true
            }
          }
        }
      });
      if (form.isQuiz && totalScore > 0) {
        const percentage = score / totalScore * 100;
        await this.prisma.quizScore.create({
          data: {
            responseId: response.id,
            score,
            totalScore,
            percentage
          }
        });
      }
      return {
        ...response,
        score: form.isQuiz ? score : undefined,
        totalScore: form.isQuiz ? totalScore : undefined,
        quizReview: form.isQuiz ? {
          answers: response.answers.map((ans) => ({
            fieldId: ans.fieldId,
            fieldLabel: ans.field.label,
            userAnswer: ans.value,
            correctAnswer: (form.quizSettings as unknown as QuizSettings)?.showAnswer ? ans.field.correctAnswer : null,
            isCorrect: ans.isCorrect,
            score: ans.field.score || 0
          })),
          showAnswer: (form.quizSettings as unknown as QuizSettings)?.showAnswer || false,
          showDetail: (form.quizSettings as unknown as QuizSettings)?.showDetail || false
        } : undefined
      };
    } catch (error) {
      console.error('FAILED TO CREATE RESPONSE:', error);
      throw error;
    }
  }
  async checkSubmissionStatus(
    formId: string,
    userId?: string,
    respondentEmail?: string,
    fingerprint?: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      select: {
        settings: true
      }
    });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    const settings = form.settings as unknown as FormSettings;
    const allowMultipleSubmissions = settings?.allowMultipleSubmissions === true;
    if (allowMultipleSubmissions) {
      return { hasSubmitted: false };
    }
    const whereConditions = [];
    if (userId) {
      whereConditions.push({ userId });
    }
    if (respondentEmail) {
      whereConditions.push({ respondentEmail });
    }
    if (fingerprint) {
      whereConditions.push({ fingerprint });
    }
    if (whereConditions.length > 0) {
      const existingResponse = await this.prisma.formResponse.findFirst({
        where: {
          formId,
          OR: whereConditions
        }
      });
      return { hasSubmitted: !!existingResponse };
    }
    return { hasSubmitted: false };
  }
  async findAll(
    formId: string,
    userId: string,
    userRole: RoleType,
    page: number = 1,
    limit: number = 50,
    sort: 'asc' | 'desc' = 'desc') {
    const form = await this.prisma.form.findUnique({
      where: { id: formId }
    });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (userRole === RoleType.VIEWER && form.status !== FormStatus.PUBLISHED) {
      throw new ForbiddenException('You can only view responses for published forms');
    }
    const skip = (page - 1) * limit;
    const [responses, total] = await Promise.all([
      this.prisma.formResponse.findMany({
        where: { formId },
        include: {
          answers: {
            include: {
              field: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          submittedAt: sort
        },
        take: limit,
        skip: skip
      }),
      this.prisma.formResponse.count({ where: { formId } })]
    );
    const decryptedResponses = responses.map((response) => ({
      ...response,
      answers: response.answers.map((answer) => {
        let value = answer.value;
        if (answer.field?.isPII && answer.value) {
          try {
            value = this.encryptionService.decrypt(answer.value);
          } catch {
            value = '[Error: Data Encrypted]';
          }
        }
        return { ...answer, value };
      })
    }));
    return {
      data: decryptedResponses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  async findOne(id: string, userId: string, userRole: RoleType) {
    const response = await this.prisma.formResponse.findUnique({
      where: { id },
      include: {
        form: true,
        answers: {
          include: {
            field: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    if (!response) {
      throw new NotFoundException('Response not found');
    }
    const form = response.form;
    if (userRole === RoleType.VIEWER && form.status !== FormStatus.PUBLISHED) {
      throw new ForbiddenException('You can only view responses for published forms');
    }
    return {
      ...response,
      answers: response.answers.map((answer) => {
        let value = answer.value;
        if (answer.field?.isPII && answer.value) {
          try {
            value = this.encryptionService.decrypt(answer.value);
          } catch (error) {
            value = '[Error: Data Encrypted]';
          }
        }
        return {
          ...answer,
          value
        };
      })
    };
  }
  async startExportJob(formId: string, userId: string, userRole: RoleType) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { fields: { orderBy: { order: 'asc' } } }
    });
    if (!form) throw new NotFoundException('Form not found');
    if (userRole === RoleType.VIEWER && form.status !== FormStatus.PUBLISHED) {
      throw new ForbiddenException('You can only view responses for published forms');
    }

    const totalResponses = await this.prisma.formResponse.count({ where: { formId } });
    if (totalResponses === 0) {
      throw new NotFoundException('No responses to export');
    }

    const jobId = uuidv4();
    const filename = `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses_${new Date().toISOString().split('T')[0]}.csv`;
    const exportPath = path.join(process.cwd(), 'uploads', 'exports');
    if (!fs.existsSync(exportPath)) {
      fs.mkdirSync(exportPath, { recursive: true });
    }
    const filePath = path.join(exportPath, `${jobId}.csv`);

    const newJob: ExportJob = {
      id: jobId,
      formId,
      status: 'processing',
      loaded: 0,
      total: totalResponses,
      filename
    };
    this.exportJobs.set(jobId, newJob);

    // Run background job without await
    this.processExportJobInBackground(form, jobId, filePath).catch(err => {
      console.error(`Export Job ${jobId} failed:`, err);
      const job = this.exportJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = err.message;
        this.eventEmitter.emit(`export.progress.${jobId}`, job);
      }
    });

    return newJob;
  }

  getExportJob(jobId: string): ExportJob {
    const job = this.exportJobs.get(jobId);
    if (!job) throw new NotFoundException('Export job not found or expired');
    return job;
  }

  getJobResultFilePath(jobId: string): { filePath: string; filename: string } {
    const job = this.exportJobs.get(jobId);
    if (!job) throw new NotFoundException('Export job not found');
    if (job.status !== 'completed') throw new ForbiddenException('Export job is not ready yet');
    const filePath = path.join(process.cwd(), 'uploads', 'exports', `${jobId}.csv`);
    if (!fs.existsSync(filePath)) throw new NotFoundException('Export file not found, it might have been deleted.');
    return { filePath, filename: job.filename || 'export.csv' };
  }

  private async processExportJobInBackground(form: any, jobId: string, filePath: string) {
    const job = this.exportJobs.get(jobId)!;
    const writeStream = fs.createWriteStream(filePath, { encoding: 'utf8' });

    // Write BOM
    writeStream.write('\uFEFF');

    // Headers logic
    const headers = ['Submitted At'];
    const safeSettings = form.settings as unknown as FormSettings;
    if (safeSettings?.collectEmail) headers.push('Respondent Email');

    const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

    form.fields.forEach((f) => {
      if (['HEADER', 'PARAGRAPH', 'DIVIDER', 'PAGE_BREAK', 'SUBMIT'].includes(f.type)) return;
      if (f.type === 'MATRIX') {
        const matrixOptions = f.options as unknown as { rows?: { id: string; label: string }[] };
        if (matrixOptions?.rows && Array.isArray(matrixOptions.rows)) {
          matrixOptions.rows.forEach((row) => headers.push(`${stripHtml(f.label)} - ${stripHtml(row.label)}`));
        } else {
          headers.push(stripHtml(f.label));
        }
      } else {
        headers.push(stripHtml(f.label));
      }
    });

    if (form.isQuiz) headers.push('Score', 'Total Score', 'Percentage');

    const escapeCsv = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const s = String(value);
      return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    writeStream.write(headers.map(escapeCsv).join(',') + '\n');

    // Rows Logic
    const piiFieldIds = new Set(form.fields.filter((f) => f.isPII).map((f) => f.id));
    const BATCH_SIZE = 5000;
    let cursor: string | undefined = undefined;

    while (true) {
      const batch = await this.prisma.formResponse.findMany({
        where: { formId: form.id },
        include: { answers: true },
        orderBy: { submittedAt: 'desc' },
        take: BATCH_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
      });

      if (batch.length === 0) break;

      let batchCsv = '';
      for (const response of batch) {
        const date = new Date(response.submittedAt);
        const formattedDate = date.toLocaleString('th-TH', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        const row: string[] = [escapeCsv(formattedDate)];
        if (safeSettings?.collectEmail) row.push(escapeCsv(response.respondentEmail || ''));

        form.fields.forEach((field) => {
          if (['HEADER', 'PARAGRAPH', 'DIVIDER', 'PAGE_BREAK', 'SUBMIT'].includes(field.type)) return;
          const answer = response.answers.find((a) => a.fieldId === field.id);
          let value = answer?.value || '';
          if (piiFieldIds.has(field.id) && answer?.value) {
            try { value = this.encryptionService.decrypt(answer.value); }
            catch { value = '[Encrypted]'; }
          }
          if (field.type === 'MATRIX') {
            const matrixOptions = field.options as unknown as { rows?: { id: string; label: string }[]; columns?: { id: string; label: string }[] };
            if (matrixOptions?.rows && Array.isArray(matrixOptions.rows)) {
              let parsedValue: Record<string, unknown> = {};
              try {
                parsedValue = typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))
                  ? JSON.parse(value)
                  : typeof value === 'object' ? value as Record<string, unknown> : {};
              } catch { parsedValue = {}; }
              if (value === '[object Object]') {
                matrixOptions.rows.forEach(() => row.push(escapeCsv('Error: Invalid Data')));
              } else {
                const colMap = new Map((matrixOptions.columns || []).map((c) => [c.id, c.label]));
                matrixOptions.rows.forEach((matrixRow) => {
                  const cellValue = parsedValue[matrixRow.id];
                  let displayValue = '';
                  if (cellValue) {
                    displayValue = Array.isArray(cellValue)
                      ? cellValue.map((v) => colMap.get(String(v)) || v).join(', ')
                      : (colMap.get(String(cellValue)) || cellValue) as string;
                  }
                  row.push(escapeCsv(displayValue));
                });
              }
            } else {
              row.push(escapeCsv(value));
            }
          } else if (field.type === 'TABLE') {
            try {
              const parsed = typeof value === 'string' && value.startsWith('[') ? JSON.parse(value) : value;
              if (Array.isArray(parsed)) {
                const tableOptions = field.options as unknown as { columns?: { id: string; label: string }[] };
                const cols = tableOptions?.columns || [];
                const formattedTable = parsed.map((r: Record<string, unknown>, i: number) => {
                  const cells = cols.map((c) => `${c.label}: ${r[c.id] || ''}`).join(', ');
                  return `[Row ${i + 1}] ${cells}`;
                }).join(' | ');
                row.push(escapeCsv(formattedTable));
              } else {
                row.push(escapeCsv(value));
              }
            } catch { row.push(escapeCsv(value)); }
          } else {
            row.push(escapeCsv(value));
          }
        });

        if (form.isQuiz) {
          const percentage = response.totalScore
            ? ((response.score || 0) / response.totalScore * 100).toFixed(2)
            : '0';
          row.push(escapeCsv(response.score || 0), escapeCsv(response.totalScore || 0), escapeCsv(percentage));
        }
        batchCsv += row.join(',') + '\n';
      }

      writeStream.write(batchCsv);

      job.loaded += batch.length;
      this.eventEmitter.emit(`export.progress.${jobId}`, job);

      cursor = batch[batch.length - 1].id;
      if (batch.length < BATCH_SIZE) break;
    }

    writeStream.end();

    // Cleanup old jobs if needed (e.g. older than 1 day) or just update status
    job.status = 'completed';
    job.fileUrl = `/responses/form/${form.id}/export/download/${jobId}`;
    this.eventEmitter.emit(`export.progress.${jobId}`, job);

    // We optionally can auto-delete the file after some time (e.g. 15 minutes)
    setTimeout(() => {
      this.exportJobs.delete(jobId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }, 15 * 60 * 1000); // 15 mins Expiry
  }
  async remove(id: string) {
    const response = await this.prisma.formResponse.findUnique({
      where: { id }
    });
    if (!response) {
      throw new NotFoundException('Response not found');
    }
    await this.prisma.responseAnswer.deleteMany({
      where: { responseId: id }
    });
    await this.prisma.formResponse.delete({
      where: { id }
    });
    return { success: true, message: 'Response deleted successfully' };
  }
}