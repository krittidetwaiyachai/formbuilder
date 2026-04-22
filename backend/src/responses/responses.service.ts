import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException } from
'@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption.service';
import { FormAccessService } from '../common/guards/form-access.service';
import { RoleType } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResponsePersistenceService } from '../form-security/response-persistence.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { RedisService } from '../common/redis/redis.service';
interface FormSettings {
  allowMultipleSubmissions?: boolean;
  collectEmail?: boolean;
}
interface ExportLockEntry {
  token: string;
  expiresAt: number;
}
interface ExportIdempotencyEntry {
  jobId: string;
  expiresAt: number;
}
export interface ExportJob {
  id: string;
  formId: string;
  ownerId: string;
  status: 'processing' | 'completed' | 'failed';
  loaded: number;
  total: number;
  fileUrl?: string;
  filename?: string;
  error?: string;
}
@Injectable()export class
ResponsesService {
  private readonly logger = new Logger(ResponsesService.name);
  private exportJobs = new Map<string, ExportJob>();
  private exportLocks = new Map<string, ExportLockEntry>();
  private exportIdempotency = new Map<string, ExportIdempotencyEntry>();
  constructor(
  private prisma: PrismaService,
  private encryptionService: EncryptionService,
  private formAccessService: FormAccessService,
  private responsePersistenceService: ResponsePersistenceService,
  private eventEmitter: EventEmitter2,
  private redisService: RedisService,
  private configService: ConfigService)
  {}
  private isDistributedExportRequired() {
    const explicit = this.configService.get<string>('EXPORT_DISTRIBUTED_ONLY');
    if (explicit === 'true') {
      return true;
    }
    if (explicit === 'false') {
      return false;
    }
    return process.env.NODE_ENV === 'production';
  }
  private getExportRedisClient() {
    const redis = this.redisService.getClient();
    if (!redis && this.isDistributedExportRequired()) {
      throw new ServiceUnavailableException(
        'Export job orchestration requires Redis in this environment.'
      );
    }
    return redis;
  }
  private getExportLockTtlSeconds() {
    const parsed = Number.parseInt(this.configService.get<string>('EXPORT_LOCK_TTL_SECONDS') || '', 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 1800;
    }
    return Math.min(parsed, 24 * 60 * 60);
  }
  private getExportResultTtlSeconds() {
    const parsed = Number.parseInt(this.configService.get<string>('EXPORT_RESULT_TTL_SECONDS') || '', 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 900;
    }
    return Math.min(parsed, 24 * 60 * 60);
  }
  private getExportIdempotencyTtlSeconds() {
    const parsed = Number.parseInt(
      this.configService.get<string>('EXPORT_IDEMPOTENCY_TTL_SECONDS') || '',
      10
    );
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 24 * 60 * 60;
    }
    return Math.min(parsed, 7 * 24 * 60 * 60);
  }
  private getExportJobRedisKey(jobId: string) {
    return `responses:export:job:${jobId}`;
  }
  private getExportLockRedisKey(ownerId: string, formId: string) {
    return `responses:export:lock:${ownerId}:${formId}`;
  }
  private getExportIdempotencyRedisKey(ownerId: string, formId: string, idempotencyKey: string) {
    return `responses:export:idempotency:${ownerId}:${formId}:${idempotencyKey}`;
  }
  private normalizeIdempotencyKey(value?: string) {
    if (!value) {
      return null;
    }
    const normalized = value.trim();
    if (!normalized) {
      return null;
    }
    if (normalized.length > 256 || !/^[A-Za-z0-9._:-]+$/.test(normalized)) {
      throw new ForbiddenException('Invalid idempotency key.');
    }
    return normalized;
  }
  private purgeExpiredInMemoryExportEntries() {
    const now = Date.now();
    for (const [key, entry] of this.exportLocks.entries()) {
      if (entry.expiresAt <= now) {
        this.exportLocks.delete(key);
      }
    }
    for (const [key, entry] of this.exportIdempotency.entries()) {
      if (entry.expiresAt <= now) {
        this.exportIdempotency.delete(key);
      }
    }
  }
  private parseStoredExportJob(raw: string) {
    try {
      const parsed = JSON.parse(raw) as ExportJob;
      if (
      !parsed ||
      typeof parsed.id !== 'string' ||
      typeof parsed.formId !== 'string' ||
      typeof parsed.ownerId !== 'string' ||
      typeof parsed.status !== 'string')
      {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
  private async readJob(jobId: string) {
    const redis = this.getExportRedisClient();
    if (redis) {
      const raw = await redis.get(this.getExportJobRedisKey(jobId));
      if (!raw) {
        return null;
      }
      return this.parseStoredExportJob(raw);
    }
    return this.exportJobs.get(jobId) || null;
  }
  private async writeJob(job: ExportJob) {
    const redis = this.getExportRedisClient();
    if (redis) {
      await redis.set(
        this.getExportJobRedisKey(job.id),
        JSON.stringify(job),
        'EX',
        this.getExportResultTtlSeconds()
      );
      return;
    }
    this.exportJobs.set(job.id, job);
  }
  private async removeJob(jobId: string) {
    const redis = this.getExportRedisClient();
    if (redis) {
      await redis.del(this.getExportJobRedisKey(jobId));
      return;
    }
    this.exportJobs.delete(jobId);
  }
  private async readExportIdempotencyJobId(ownerId: string, formId: string, idempotencyKey: string) {
    const redis = this.getExportRedisClient();
    if (redis) {
      return redis.get(this.getExportIdempotencyRedisKey(ownerId, formId, idempotencyKey));
    }
    this.purgeExpiredInMemoryExportEntries();
    const entry = this.exportIdempotency.get(
      this.getExportIdempotencyRedisKey(ownerId, formId, idempotencyKey)
    );
    return entry?.jobId || null;
  }
  private async writeExportIdempotencyJobId(
  ownerId: string,
  formId: string,
  idempotencyKey: string,
  jobId: string)
  {
    const redis = this.getExportRedisClient();
    const key = this.getExportIdempotencyRedisKey(ownerId, formId, idempotencyKey);
    const ttlSeconds = this.getExportIdempotencyTtlSeconds();
    if (redis) {
      await redis.set(key, jobId, 'EX', ttlSeconds);
      return;
    }
    this.purgeExpiredInMemoryExportEntries();
    this.exportIdempotency.set(key, {
      jobId,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }
  private async acquireExportLock(ownerId: string, formId: string, token: string) {
    const redis = this.getExportRedisClient();
    const key = this.getExportLockRedisKey(ownerId, formId);
    const ttlSeconds = this.getExportLockTtlSeconds();
    if (redis) {
      const response = await redis.set(key, token, 'EX', ttlSeconds, 'NX');
      if (response !== 'OK') {
        throw new ConflictException('An export is already processing for this form.');
      }
      return;
    }
    this.purgeExpiredInMemoryExportEntries();
    if (this.exportLocks.has(key)) {
      throw new ConflictException('An export is already processing for this form.');
    }
    this.exportLocks.set(key, {
      token,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }
  private async releaseExportLock(ownerId: string, formId: string, token: string) {
    const redis = this.getExportRedisClient();
    const key = this.getExportLockRedisKey(ownerId, formId);
    if (redis) {
      const currentToken = await redis.get(key);
      if (currentToken === token) {
        await redis.del(key);
      }
      return;
    }
    this.purgeExpiredInMemoryExportEntries();
    const entry = this.exportLocks.get(key);
    if (entry?.token === token) {
      this.exportLocks.delete(key);
    }
  }
  async checkSubmissionStatus(
  formId: string,
  userId?: string,
  respondentEmail?: string,
  fingerprint?: string)
  {
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
  canViewPii: boolean,
  page: number = 1,
  limit: number = 50,
  sort: 'asc' | 'desc' = 'desc')
  {
    await this.formAccessService.assertReadAccess(formId, userId, userRole);
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
      orderBy: [{ submittedAt: sort }, { createdAt: sort }, { id: sort }],
      take: limit,
      skip
    }),
    this.prisma.formResponse.count({ where: { formId } })]
    );
    const decryptedResponses = responses.map((response) => ({
      ...response,
      respondentEmail:
      canViewPii || !response.respondentEmail ?
      response.respondentEmail :
      '[Redacted: Respondent Email]',
      normalizedRespondentEmail: canViewPii ? response.normalizedRespondentEmail : null,
      answers: response.answers.map((answer) => {
        let value = answer.value;
        if (answer.field?.isPII && answer.value) {
          if (!canViewPii) {
            value = '[Redacted: PII]';
          } else {
            try {
              value = this.encryptionService.decrypt(answer.value);
            } catch {
              value = '[Error: Data Encrypted]';
            }
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
  async findOne(id: string, userId: string, userRole: RoleType, canViewPii: boolean) {
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
    await this.formAccessService.assertReadAccess(response.formId, userId, userRole);
    return {
      ...response,
      respondentEmail:
      canViewPii || !response.respondentEmail ?
      response.respondentEmail :
      '[Redacted: Respondent Email]',
      normalizedRespondentEmail: canViewPii ? response.normalizedRespondentEmail : null,
      answers: response.answers.map((answer) => {
        let value = answer.value;
        if (answer.field?.isPII && answer.value) {
          if (!canViewPii) {
            value = '[Redacted: PII]';
          } else {
            try {
              value = this.encryptionService.decrypt(answer.value);
            } catch {
              value = '[Error: Data Encrypted]';
            }
          }
        }
        return {
          ...answer,
          value
        };
      })
    };
  }
  async startExportJob(
  formId: string,
  userId: string,
  userRole: RoleType,
  idempotencyKey?: string,
  canViewPii: boolean = false)
  {
    await this.formAccessService.assertReadAccess(formId, userId, userRole);
    const normalizedIdempotencyKey = this.normalizeIdempotencyKey(idempotencyKey);
    if (normalizedIdempotencyKey) {
      const replayJobId = await this.readExportIdempotencyJobId(
        userId,
        formId,
        normalizedIdempotencyKey
      );
      if (replayJobId) {
        const replayJob = await this.readJob(replayJobId);
        if (replayJob) {
          return replayJob;
        }
      }
    }
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { fields: { orderBy: { order: 'asc' } } }
    });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    const totalResponses = await this.prisma.formResponse.count({ where: { formId } });
    if (totalResponses === 0) {
      throw new NotFoundException('No responses to export');
    }
    const jobId = uuidv4();
    const lockToken = uuidv4();
    const filename = `${form.title.
    replace(/[^a-z0-9]/gi, '_').
    toLowerCase()}_responses_${new Date().toISOString().split('T')[0]}.csv`;
    const exportPath = path.join(process.cwd(), 'uploads', 'exports');
    if (!fs.existsSync(exportPath)) {
      fs.mkdirSync(exportPath, { recursive: true });
    }
    const filePath = path.join(exportPath, `${jobId}.csv`);
    const newJob: ExportJob = {
      id: jobId,
      formId,
      ownerId: userId,
      status: 'processing',
      loaded: 0,
      total: totalResponses,
      filename
    };
    await this.acquireExportLock(userId, formId, lockToken);
    try {
      if (normalizedIdempotencyKey) {
        const replayJobId = await this.readExportIdempotencyJobId(
          userId,
          formId,
          normalizedIdempotencyKey
        );
        if (replayJobId) {
          const replayJob = await this.readJob(replayJobId);
          if (replayJob) {
            await this.releaseExportLock(userId, formId, lockToken);
            return replayJob;
          }
        }
      }
      await this.writeJob(newJob);
      if (normalizedIdempotencyKey) {
        await this.writeExportIdempotencyJobId(userId, formId, normalizedIdempotencyKey, jobId);
      }
      this.processExportJobInBackground(form, jobId, filePath, {
        ownerId: userId,
        formId,
        lockToken,
        canViewPii
      }).catch(async (err) => {
        this.logger.error(`Export Job ${jobId} failed: ${String(err)}`);
        const latestJob = (await this.readJob(jobId)) || newJob;
        latestJob.status = 'failed';
        latestJob.error = err instanceof Error ? err.message : String(err);
        await this.writeJob(latestJob);
        this.eventEmitter.emit(`export.progress.${jobId}`, latestJob);
      });
      return newJob;
    } catch (error) {
      await this.releaseExportLock(userId, formId, lockToken).catch(() => undefined);
      throw error;
    }
  }
  async assertJobOwner(jobId: string, userId: string, userRole: RoleType) {
    const job = await this.readJob(jobId);
    if (!job) {
      throw new NotFoundException('Export job not found or expired');
    }
    if (userRole === RoleType.SUPER_ADMIN || userRole === RoleType.ADMIN) {
      return job;
    }
    if (job.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this export job');
    }
    return job;
  }
  async getJobResultFilePath(
  jobId: string,
  userId: string,
  userRole: RoleType)
  : Promise<{filePath: string;filename: string;}> {
    const job = await this.assertJobOwner(jobId, userId, userRole);
    if (job.status !== 'completed') {
      throw new ForbiddenException('Export job is not ready yet');
    }
    const filePath = path.join(process.cwd(), 'uploads', 'exports', `${jobId}.csv`);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Export file not found, it might have been deleted.');
    }
    return { filePath, filename: job.filename || 'export.csv' };
  }
  private async processExportJobInBackground(
  form: Record<string, unknown> & {
    id: string;
    title: string;
    isQuiz: boolean;
    settings: unknown;
    fields: Array<
      Record<string, unknown> & {
        id: string;
        type: string;
        label: string;
        isPII?: boolean;
        score?: number;
        options?: unknown;
      }>;
  },
  jobId: string,
  filePath: string,
  lock: {ownerId: string;formId: string;lockToken: string;canViewPii: boolean;})
  {
    const job = await this.readJob(jobId);
    if (!job) {
      await this.releaseExportLock(lock.ownerId, lock.formId, lock.lockToken).catch(() => undefined);
      return;
    }
    const writeStream = fs.createWriteStream(filePath, { encoding: 'utf8' });
    writeStream.write('\uFEFF');
    const headers = ['Submitted At'];
    const safeSettings = form.settings as unknown as FormSettings;
    if (safeSettings?.collectEmail) {
      headers.push('Respondent Email');
    }
    const stripHtml = (html: string): string =>
    html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    form.fields.forEach((f) => {
      if (['HEADER', 'PARAGRAPH', 'DIVIDER', 'PAGE_BREAK', 'SUBMIT'].includes(f.type)) {
        return;
      }
      if (f.type === 'MATRIX') {
        const matrixOptions = f.options as unknown as {rows?: {id: string;label: string;}[];};
        if (matrixOptions?.rows && Array.isArray(matrixOptions.rows)) {
          matrixOptions.rows.forEach((row) => headers.push(`${stripHtml(f.label)} - ${stripHtml(row.label)}`));
        } else {
          headers.push(stripHtml(f.label));
        }
      } else {
        headers.push(stripHtml(f.label));
      }
    });
    if (form.isQuiz) {
      headers.push('Score', 'Total Score', 'Percentage');
    }
    const escapeCsv = (value: unknown): string => {
      if (value === null || value === undefined) {
        return '';
      }
      const s = String(value);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    writeStream.write(headers.map(escapeCsv).join(',') + '\n');
    const piiFieldIds = new Set(form.fields.filter((f) => f.isPII).map((f) => f.id));
    const batchSize = 5000;
    let cursor: string | undefined;
    try {
      while (true) {
        const batch = await this.prisma.formResponse.findMany({
          where: { formId: form.id },
          include: { answers: true },
          orderBy: { submittedAt: 'desc' },
          take: batchSize,
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
        });
        if (batch.length === 0) {
          break;
        }
        let batchCsv = '';
        for (const response of batch) {
          const date = new Date(response.submittedAt);
          const formattedDate = date.toLocaleString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          const row: string[] = [escapeCsv(formattedDate)];
          if (safeSettings?.collectEmail) {
            const emailCell =
            lock.canViewPii || !response.respondentEmail ?
            response.respondentEmail || '' :
            '[Redacted: Respondent Email]';
            row.push(escapeCsv(emailCell));
          }
          form.fields.forEach((field) => {
            if (['HEADER', 'PARAGRAPH', 'DIVIDER', 'PAGE_BREAK', 'SUBMIT'].includes(field.type)) {
              return;
            }
            const answer = response.answers.find((a) => a.fieldId === field.id);
            let value: unknown = answer?.value || '';
            if (piiFieldIds.has(field.id) && answer?.value) {
              if (!lock.canViewPii) {
                value = '[Redacted: PII]';
              } else {
                try {
                  value = this.encryptionService.decrypt(answer.value);
                } catch {
                  value = '[Encrypted]';
                }
              }
            }
            if (field.type === 'MATRIX') {
              const matrixOptions = field.options as unknown as {
                rows?: {id: string;label: string;}[];
                columns?: {id: string;label: string;}[];
              };
              if (matrixOptions?.rows && Array.isArray(matrixOptions.rows)) {
                let parsedValue: Record<string, unknown> = {};
                try {
                  parsedValue =
                  typeof value === 'string' && (value.startsWith('{') || value.startsWith('[')) ?
                  JSON.parse(value) :
                  typeof value === 'object' ?
                  value as Record<string, unknown> :
                  {};
                } catch {
                  parsedValue = {};
                }
                if (value === '[object Object]') {
                  matrixOptions.rows.forEach(() => row.push(escapeCsv('Error: Invalid Data')));
                } else {
                  const colMap = new Map((matrixOptions.columns || []).map((c) => [c.id, c.label]));
                  matrixOptions.rows.forEach((matrixRow) => {
                    const cellValue = parsedValue[matrixRow.id];
                    let displayValue = '';
                    if (cellValue) {
                      displayValue = Array.isArray(cellValue) ?
                      cellValue.map((v) => colMap.get(String(v)) || v).join(', ') :
                      (colMap.get(String(cellValue)) || cellValue) as string;
                    }
                    row.push(escapeCsv(displayValue));
                  });
                }
              } else {
                row.push(escapeCsv(value));
              }
            } else if (field.type === 'TABLE') {
              try {
                const parsed =
                typeof value === 'string' && value.startsWith('[') ? JSON.parse(value) : value;
                if (Array.isArray(parsed)) {
                  const tableOptions = field.options as unknown as {
                    columns?: {id: string;label: string;}[];
                  };
                  const cols = tableOptions?.columns || [];
                  const formattedTable = parsed.
                  map((r: Record<string, unknown>, i: number) => {
                    const cells = cols.map((c) => `${c.label}: ${r[c.id] || ''}`).join(', ');
                    return `[Row ${i + 1}] ${cells}`;
                  }).
                  join(' | ');
                  row.push(escapeCsv(formattedTable));
                } else {
                  row.push(escapeCsv(value));
                }
              } catch {
                row.push(escapeCsv(value));
              }
            } else {
              row.push(escapeCsv(value));
            }
          });
          if (form.isQuiz) {
            const percentage = response.totalScore ?
            ((response.score || 0) / response.totalScore * 100).toFixed(2) :
            '0';
            row.push(escapeCsv(response.score || 0), escapeCsv(response.totalScore || 0), escapeCsv(percentage));
          }
          batchCsv += row.join(',') + '\n';
        }
        writeStream.write(batchCsv);
        job.loaded += batch.length;
        await this.writeJob(job);
        this.eventEmitter.emit(`export.progress.${jobId}`, job);
        cursor = batch[batch.length - 1].id;
        if (batch.length < batchSize) {
          break;
        }
      }
      writeStream.end();
      job.status = 'completed';
      job.fileUrl = `/responses/form/${form.id}/export/download/${jobId}`;
      await this.writeJob(job);
      this.eventEmitter.emit(`export.progress.${jobId}`, job);
      const resultTtlMs = this.getExportResultTtlSeconds() * 1000;
      setTimeout(() => {
        this.removeJob(jobId).catch(() => undefined);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, resultTtlMs);
    } finally {
      await this.releaseExportLock(lock.ownerId, lock.formId, lock.lockToken).catch(() => undefined);
    }
  }
  async remove(id: string, userId: string, userRole: RoleType) {
    const response = await this.prisma.formResponse.findUnique({
      where: { id }
    });
    if (!response) {
      throw new NotFoundException('Response not found');
    }
    await this.formAccessService.assertReadAccess(response.formId, userId, userRole);
    await this.prisma.responseAnswer.deleteMany({
      where: { responseId: id }
    });
    await this.prisma.formResponse.delete({
      where: { id }
    });
    return { success: true, message: 'Response deleted successfully' };
  }
}