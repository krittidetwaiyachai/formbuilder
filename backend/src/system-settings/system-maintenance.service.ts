import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit } from
'@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CollaboratorInvitationStatus } from '@prisma/client';
import { promises as fs } from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import * as fsNative from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { SystemSettingsService } from './system-settings.service';
const SYSTEM_SETTINGS_ID = 'default';
const DEFAULT_MAINTENANCE_TICK_MS = 30 * 60 * 1000;
@Injectable()export class
SystemMaintenanceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SystemMaintenanceService.name);
  private maintenanceTimer: NodeJS.Timeout | null = null;
  private runningMaintenance = false;
  private runningBackup = false;
  private runningCleanup = false;
  constructor(
  private readonly prisma: PrismaService,
  private readonly configService: ConfigService,
  private readonly systemSettingsService: SystemSettingsService)
  {}
  onModuleInit() {
    void this.runScheduledMaintenance();
    this.maintenanceTimer = setInterval(() => {
      void this.runScheduledMaintenance();
    }, DEFAULT_MAINTENANCE_TICK_MS);
  }
  onModuleDestroy() {
    if (this.maintenanceTimer) {
      clearInterval(this.maintenanceTimer);
      this.maintenanceTimer = null;
    }
  }
  private shouldRunByHours(lastRun: Date | null | undefined, intervalHours: number) {
    if (!lastRun) {
      return true;
    }
    const diffMs = Date.now() - lastRun.getTime();
    return diffMs >= intervalHours * 60 * 60 * 1000;
  }
  private getTimestampSuffix(now = new Date()) {
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}-${hour}${minute}${second}`;
  }
  private async ensureDirectory(targetDirectory: string) {
    await fs.mkdir(targetDirectory, { recursive: true });
  }
  private async listBackupFiles(targetDirectory: string) {
    try {
      const files = await fs.readdir(targetDirectory, { withFileTypes: true });
      const backupFiles = await Promise.all(
        files.
        filter(
          (entry) =>
          entry.isFile() &&
          /^system-backup-(auto-)?\d{8}-\d{6}\.enc$/i.test(entry.name)
        ).
        map(async (entry) => {
          const fullPath = path.join(targetDirectory, entry.name);
          const stats = await fs.stat(fullPath);
          return {
            name: entry.name,
            fullPath,
            sizeBytes: stats.size,
            mtimeMs: stats.mtimeMs,
            type: 'database',
            createdAt: new Date(stats.mtimeMs).toISOString()
          };
        })
      );
      backupFiles.sort((a, b) => b.mtimeMs - a.mtimeMs);
      return backupFiles;
    } catch {
      return [];
    }
  }
  async getBackupFilesList() {
    const settings = await this.systemSettingsService.getPublicSettings();
    const targetDirectory = settings.backup.directory;
    await this.ensureDirectory(targetDirectory);
    const files = await this.listBackupFiles(targetDirectory);
    return files.map((f) => ({
      name: f.name,
      type: f.type,
      sizeBytes: f.sizeBytes,
      createdAt: f.createdAt
    }));
  }
  async deleteBackupFile(fileName: string) {
    const settings = await this.systemSettingsService.getPublicSettings();
    const targetDirectory = settings.backup.directory;
    const fullPath = path.join(targetDirectory, fileName);
    if (!/^system-backup-(auto-)?\d{8}-\d{6}\.enc$/i.test(fileName)) {
      throw new Error('Invalid backup file name');
    }
    try {
      await fs.unlink(fullPath);
      return { status: 'success' };
    } catch (err: unknown) {
      return { status: 'failed', error: err instanceof Error ? err.message : String(err) };
    }
  }
  async getBackupFilePath(fileName: string) {
    const settings = await this.systemSettingsService.getPublicSettings();
    const targetDirectory = settings.backup.directory;
    const fullPath = path.join(targetDirectory, fileName);
    if (!/^system-backup-(auto-)?\d{8}-\d{6}\.enc$/i.test(fileName)) {
      throw new Error('Invalid backup file name');
    }
    try {
      await fs.stat(fullPath);
      return fullPath;
    } catch {
      throw new Error('File not found');
    }
  }
  private async pruneBackupFiles(targetDirectory: string, retentionDays: number) {
    const files = await this.listBackupFiles(targetDirectory);
    const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    await Promise.all(
      files.
      filter((file) => file.mtimeMs < cutoffMs).
      map((file) =>
      fs.unlink(file.fullPath).catch(() => {
        return;
      })
      )
    );
  }
  private getBackupEncryptionKey() {
    const rawKey =
    this.configService.get<string>('BACKUP_ENCRYPTION_KEY') ||
    'default-insecure-backup-key-32b!';
    return rawKey.startsWith('base64:') ?
    Buffer.from(rawKey.slice(7), 'base64') :
    Buffer.from(rawKey.padEnd(32, '0').slice(0, 32), 'utf8');
  }
  async runBackupNow(isAutoBackup = false) {
    if (this.runningBackup) {
      return { status: 'skipped', reason: 'Backup is already running.' };
    }
    this.runningBackup = true;
    try {
      const settings = await this.systemSettingsService.getPublicSettings();
      const targetDirectory = settings.backup.directory;
      await this.ensureDirectory(targetDirectory);
      const timestamp = this.getTimestampSuffix();
      const prefix = isAutoBackup ? 'auto-' : '';
      const fileName = `system-backup-${prefix}${timestamp}.enc`;
      const fullPath = path.join(targetDirectory, fileName);
      const dbUrl = this.configService.get<string>('DATABASE_URL');
      if (!dbUrl) throw new Error('DATABASE_URL is not configured');
      const key = this.getBackupEncryptionKey();
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      const gzip = zlib.createGzip();
      const outStream = fsNative.createWriteStream(fullPath);
      outStream.write(iv);
      await new Promise<void>((resolve, reject) => {
        const pgDump = spawn('pg_dump', [
        '--clean',
        '--if-exists',
        '--no-owner',
        '--no-privileges',
        dbUrl]
        );
        let errorOutput = '';
        pgDump.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        pgDump.stdout.pipe(gzip).pipe(cipher).pipe(outStream, { end: false });
        pgDump.on('close', (code) => {
          if (code !== 0)
          return reject(new Error(`pg_dump failed: ${errorOutput}`));
          cipher.end();
        });
        cipher.on('end', () => {
          const authTag = cipher.getAuthTag();
          outStream.write(authTag);
          outStream.end();
        });
        outStream.on('finish', () => resolve());
        outStream.on('error', reject);
        pgDump.on('error', reject);
        gzip.on('error', reject);
        cipher.on('error', reject);
      });
      if (!isAutoBackup) {
        await this.pruneBackupFiles(targetDirectory, settings.backup.retentionDays);
      }
      await this.prisma.systemSetting.update({
        where: { id: SYSTEM_SETTINGS_ID },
        data: {
          backupLastRunAt: new Date(),
          backupLastStatus: 'success',
          backupLastFile: fileName,
          backupLastError: null
        }
      });
      return { status: 'success', fileName, directory: targetDirectory };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown backup error';
      this.logger.error(`Backup failed: ${message}`);
      await this.prisma.systemSetting.update({
        where: { id: SYSTEM_SETTINGS_ID },
        data: {
          backupLastRunAt: new Date(),
          backupLastStatus: 'failed',
          backupLastError: message
        }
      });
      return { status: 'failed', error: message };
    } finally {
      this.runningBackup = false;
    }
  }
  async restoreLatestBackup(confirm?: boolean, targetFileName?: string) {
    if (!confirm) {
      return {
        status: 'requires_confirmation',
        message: 'กรุณายืนยันการ Restore เนื่องจากข้อมูลปัจจุบันจะถูกเขียนทับทั้งหมด'
      };
    }
    const settings = await this.systemSettingsService.getPublicSettings();
    const targetDirectory = settings.backup.directory;
    await this.ensureDirectory(targetDirectory);
    const files = await this.listBackupFiles(targetDirectory);
    if (files.length === 0) {
      return { status: 'failed', error: 'No backup file found.' };
    }
    const latest = targetFileName ? files.find((f) => f.name === targetFileName) : files[0];
    if (!latest) {
      return { status: 'failed', error: 'Target backup file not found.' };
    }
    try {
      await this.runBackupNow(true);
      const dbUrl = this.configService.get<string>('DATABASE_URL');
      if (!dbUrl) throw new Error('DATABASE_URL is not configured');
      const key = this.getBackupEncryptionKey();
      const fd = await fs.open(latest.fullPath, 'r');
      const iv = Buffer.alloc(16);
      await fd.read(iv, 0, 16, 0);
      const stats = await fd.stat();
      const authTag = Buffer.alloc(16);
      await fd.read(authTag, 0, 16, stats.size - 16);
      await fd.close();
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);
      const gunzip = zlib.createGunzip();
      const inStream = fsNative.createReadStream(latest.fullPath, {
        start: 16,
        end: stats.size - 17
      });
      await new Promise<void>((resolve, reject) => {
        const psql = spawn('psql', [dbUrl]);
        let errorOutput = '';
        psql.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        inStream.pipe(decipher).pipe(gunzip).pipe(psql.stdin);
        psql.on('close', (code) => {
          if (code !== 0) return reject(new Error(`psql failed: ${errorOutput}`));
          resolve();
        });
        inStream.on('error', reject);
        decipher.on('error', reject);
        gunzip.on('error', reject);
        psql.on('error', reject);
      });
      await this.prisma.systemSetting.update({
        where: { id: SYSTEM_SETTINGS_ID },
        data: {
          backupLastStatus: 'restored',
          backupLastFile: latest.name,
          backupLastError: null
        }
      });
      return { status: 'success', fileName: latest.name };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown restore error';
      this.logger.error(`Restore failed: ${message}`);
      await this.prisma.systemSetting.update({
        where: { id: SYSTEM_SETTINGS_ID },
        data: { backupLastStatus: 'failed', backupLastError: message }
      });
      return { status: 'failed', error: message };
    }
  }
  async runRetentionCleanupNow() {
    if (this.runningCleanup) {
      return {
        status: 'skipped',
        reason: 'Cleanup is already running.'
      };
    }
    this.runningCleanup = true;
    try {
      const settings = await this.systemSettingsService.getPublicSettings();
      const now = new Date();
      let deletedResponses = 0;
      let deletedAuditLogs = 0;
      let deletedInvitations = 0;
      if (settings.retention.responsesDays && settings.retention.responsesDays > 0) {
        const cutoff = new Date(now.getTime() - settings.retention.responsesDays * 24 * 60 * 60 * 1000);
        const result = await this.prisma.formResponse.deleteMany({
          where: { createdAt: { lt: cutoff } }
        });
        deletedResponses = result.count;
      }
      if (settings.retention.auditLogsDays > 0) {
        const cutoff = new Date(now.getTime() - settings.retention.auditLogsDays * 24 * 60 * 60 * 1000);
        const result = await this.prisma.activityLog.deleteMany({
          where: { createdAt: { lt: cutoff } }
        });
        deletedAuditLogs = result.count;
      }
      if (settings.retention.invitationsDays > 0) {
        const cutoff = new Date(now.getTime() - settings.retention.invitationsDays * 24 * 60 * 60 * 1000);
        const result = await this.prisma.formCollaboratorInvitation.deleteMany({
          where: {
            createdAt: { lt: cutoff },
            OR: [
            { status: { not: CollaboratorInvitationStatus.PENDING } },
            { expiresAt: { lte: now } }]
          }
        });
        deletedInvitations = result.count;
      }
      await this.prisma.systemSetting.update({
        where: { id: SYSTEM_SETTINGS_ID },
        data: { retentionLastCleanupAt: now }
      });
      return {
        status: 'success',
        deletedResponses,
        deletedAuditLogs,
        deletedInvitations
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown cleanup error';
      this.logger.error(`Retention cleanup failed: ${message}`);
      return { status: 'failed', error: message };
    } finally {
      this.runningCleanup = false;
    }
  }
  private async runScheduledMaintenance() {
    if (this.runningMaintenance) {
      return;
    }
    this.runningMaintenance = true;
    try {
      const settings = await this.systemSettingsService.getPublicSettings();
      if (
      settings.retention.autoCleanupEnabled &&
      this.shouldRunByHours(settings.retention.lastCleanupAt, settings.retention.cleanupIntervalHours))
      {
        await this.runRetentionCleanupNow();
      }
      if (
      settings.backup.autoEnabled &&
      this.shouldRunByHours(settings.backup.lastRunAt, settings.backup.intervalHours))
      {
        await this.runBackupNow();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown maintenance error';
      this.logger.error(`Scheduled maintenance failed: ${message}`);
    } finally {
      this.runningMaintenance = false;
    }
  }
}