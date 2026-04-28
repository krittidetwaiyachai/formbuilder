import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { adminApi, type BackupFileInfo } from "@/lib/adminApi";
import { SettingsField, SettingsCheckbox, ActionButton } from "./settings/SettingsFormField";
import { parseIntegerInput } from "./settings/settingsUtils";
import { Download, RotateCcw, Trash2, Database, FileText, Loader2, HardDrive } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDateThai = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export default function AdminBackupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningBackup, setRunningBackup] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [intervalHoursInput, setIntervalHoursInput] = useState("24");
  const [retentionDaysInput, setRetentionDaysInput] = useState("14");
  const [directoryInput, setDirectoryInput] = useState("");

  const [backupFiles, setBackupFiles] = useState<BackupFileInfo[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [actionTarget, setActionTarget] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ fileName: string; action: "restore" | "delete" } | null>(null);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupStep, setBackupStep] = useState("");
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [systemSettings, setSystemSettings] = useState<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await adminApi.getSystemSettings();
        setSystemSettings(response.data);
        
        // Initialize form values from system settings
        setAutoEnabled(response.data.backup.autoEnabled);
        setIntervalHoursInput(String(response.data.backup.intervalHours || 24));
        setRetentionDaysInput(String(response.data.backup.retentionDays || 14));
        setDirectoryInput(response.data.backup.directory || "");
      } catch (error: any) {
        console.error("Failed to load system settings:", error);
        // Don't show error if it's an auth error (will redirect)
        if (error?.response?.status !== 401) {
          setNotice({
            type: "error",
            text: t("admin.settings.system.backup_load_error") || "Error loading settings"
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      void loadSettings();
    }
  }, [t, isAuthenticated]);

  const loadBackupFiles = useCallback(async () => {
    try {
      setLoadingFiles(true);
      const response = await adminApi.listBackups();
      setBackupFiles(response.data);
    } catch (error: any) {
      console.error("Failed to load backup files:", error);
      setBackupFiles([]);
      // Don't show error if it's an auth error (will redirect)
      if (error?.response?.status !== 401) {
        setNotice({
          type: "error",
          text: t("admin.settings.system.backup_load_files_error") || "Error loading backup files"
        });
      }
    } finally {
      setLoadingFiles(false);
    }
  }, [t]);

  useEffect(() => {
    if (isAuthenticated) {
      void loadBackupFiles();
    }
  }, [loadBackupFiles, isAuthenticated]);

  const parsedIntervalHours = useMemo(() => parseIntegerInput(intervalHoursInput), [intervalHoursInput]);
  const parsedRetentionDays = useMemo(() => parseIntegerInput(retentionDaysInput), [retentionDaysInput]);

  const hasChanges = useMemo(() => {
    if (!systemSettings) return false;
    return (
      autoEnabled !== systemSettings.backup.autoEnabled ||
      parsedIntervalHours !== systemSettings.backup.intervalHours ||
      parsedRetentionDays !== systemSettings.backup.retentionDays ||
      directoryInput !== (systemSettings.backup.directory || "")
    );
  }, [autoEnabled, parsedIntervalHours, parsedRetentionDays, directoryInput, systemSettings]);

  const handleSave = async () => {
    if (!hasChanges || Number.isNaN(parsedIntervalHours) || Number.isNaN(parsedRetentionDays)) return;
    try {
      setSaving(true);
      setNotice(null);
      const response = await adminApi.updateSystemBackupSettings({
        autoEnabled,
        intervalHours: parsedIntervalHours,
        retentionDays: parsedRetentionDays,
        directory: directoryInput.trim() || null,
      });
      setSystemSettings(response.data);
      
      setNotice({
        type: "success",
        text: t("admin.settings.system.backup_saved") || "Backup settings updated"
      });
    } catch (error: any) {
      console.error("Failed to update backup settings:", error);
      if (error?.response?.status !== 401) {
        setNotice({
          type: "error",
          text: t("admin.settings.system.backup_save_error") || "Failed to update backup settings"
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startProgressTimer = useCallback(() => {
    setBackupProgress(0);
    setBackupStep("Preparing data...");
    stopProgressTimer();
    let current = 0;
    const steps = [
      { at: 5, label: "Starting database dump..." },
      { at: 30, label: "Backing up all tables..." },
      { at: 60, label: "Compressing data..." },
      { at: 80, label: "Writing backup file..." },
      { at: 90, label: "Organizing old backup files..." },
    ];
    progressTimerRef.current = setInterval(() => {
      current += Math.random() * 3 + 0.5;
      if (current > 92) current = 92;
      const activeStep = [...steps].reverse().find((s) => current >= s.at);
      if (activeStep) setBackupStep(activeStep.label);
      setBackupProgress(Math.round(current));
    }, 300);
  }, [stopProgressTimer]);

  const handleRunBackup = async () => {
    try {
      setRunningBackup(true);
      setNotice(null);
      startProgressTimer();
      
      const response = await adminApi.runSystemBackupNow();
      const result = response.data as { 
        status?: string; 
        databaseFile?: string; 
        error?: string;
      };
      
      if (result?.status === "success") {
        setNotice({
          type: "success",
          text: t("admin.settings.system.backup_now_success", {
            fileName: result.databaseFile || "backup"
          }) || `Backup completed: ${result.databaseFile || "backup"}`
        });
      } else if (result?.status === "failed") {
        setNotice({
          type: "error",
          text: t("admin.settings.system.backup_now_failed") || "Backup failed",
        });
      } else {
        setNotice({
          type: "error",
          text: t("admin.settings.system.backup_now_skipped") || "Backup skipped",
        });
      }
      
      await loadBackupFiles(); // Refresh the file list
    } catch (error: any) {
      console.error("Failed to run backup:", error);
      if (error?.response?.status !== 401) {
        setNotice({
          type: "error",
          text: t("admin.settings.system.backup_now_failed") || "Backup failed"
        });
      }
    } finally {
      setRunningBackup(false);
      setBackupProgress(0);
      setBackupStep("");
      stopProgressTimer();
    }
  };

  const handleRestore = async (fileName: string) => {
    try {
      setActionTarget(fileName);
      setNotice(null);
      const response = await adminApi.restoreBackup(fileName);
      const result = response.data as { status?: string; error?: string; type?: string };
      
      if (result?.status === "success") {
        setNotice({
          type: "success",
          text: t("admin.settings.system.backup_restore_success", {
            fileName
          }) || `Restored from backup: ${fileName}`
        });
      } else {
        setNotice({
          type: "error",
          text: t("admin.settings.system.backup_restore_failed") || "Restore failed",
        });
      }
    } catch (error: any) {
      console.error("Failed to restore backup:", error);
      if (error?.response?.status !== 401) {
        setNotice({
          type: "error",
          text: t("admin.settings.system.backup_restore_failed") || "Restore failed"
        });
      }
    } finally {
      setActionTarget(null);
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      setActionTarget(fileName);
      setNotice(null);
      await adminApi.deleteBackup(fileName);
      setNotice({
        type: "success",
        text: t("admin.settings.system.backup_delete_success") || "Backup deleted"
      });
      await loadBackupFiles(); // Refresh the file list
    } catch (error: any) {
      console.error("Failed to delete backup:", error);
      if (error?.response?.status !== 401) {
        setNotice({
          type: "error",
          text: t("admin.settings.system.backup_delete_failed") || "Delete failed"
        });
      }
    } finally {
      setActionTarget(null);
    }
  };

  const handleRestoreLatest = async () => {
    try {
      setRunningBackup(true);
      setNotice(null);
      const response = await adminApi.restoreSystemBackupLatest();
      const result = response.data as { status?: string; error?: string; type?: string };
      
      if (result?.status === "success") {
        setNotice({
          type: "success",
          text: t("admin.settings.system.backup_restore_success", {
            fileName: "latest backup"
          }) || "Restored from latest backup"
        });
      } else {
        setNotice({
          type: "error",
          text: t("admin.settings.system.backup_restore_failed") || "Restore failed",
        });
      }
    } catch (error: any) {
      console.error("Failed to restore latest backup:", error);
      if (error?.response?.status !== 401) {
        setNotice({
          type: "error",
          text: t("admin.settings.system.backup_restore_failed") || "Restore failed"
        });
      }
    } finally {
      setRunningBackup(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const savingLabel = t("admin.settings.saving") || "Saving...";

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <HardDrive className="w-7 h-7 text-gray-700" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t("admin.settings.system.backup_title") || "Backup & Restore"}
          </h1>
        </div>
        <p className="text-gray-500 text-sm">
          {t("admin.settings.system.backup_description") || "Configure automatic backups and manage backup files"}
        </p>
      </div>

      {notice && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm flex items-center justify-between animate-in fade-in duration-200 ${
            notice.type === "success"
              ? "border-gray-300 bg-gray-50 text-gray-700"
              : "border-gray-300 bg-gray-50 text-gray-700"
          }`}
        >
          <span>{notice.text}</span>
          <button
            onClick={() => setNotice(null)}
            className="ml-3 text-current opacity-50 hover:opacity-100 transition-opacity text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Backup Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("admin.settings.system.backup_settings") || "Backup Settings"}
          </h2>
          <div className="flex flex-wrap gap-2">
            <ActionButton
              onClick={handleRunBackup}
              disabled={runningBackup}
              loading={runningBackup}
              loadingLabel="Backing up..."
              label={t("admin.settings.system.backup_now") || "Backup Now"}
              variant="secondary"
            />
            <ActionButton
              onClick={handleRestoreLatest}
              disabled={runningBackup}
              loading={runningBackup}
              loadingLabel="Restoring..."
              label={t("admin.settings.system.restore_latest_backup") || "Restore Latest"}
              variant="secondary"
            />
            <ActionButton
              onClick={handleSave}
              disabled={saving || !hasChanges}
              loading={saving}
              loadingLabel={savingLabel}
              label={t("admin.settings.system.save_backup") || "Save Settings"}
            />
          </div>
        </div>

        {(runningBackup || backupProgress > 0) && (
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-2.5 animate-in fade-in duration-200 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium flex items-center gap-2">
                {backupProgress < 100 && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
                {backupStep}
              </span>
              <span className="text-gray-500 font-mono text-xs">{backupProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  backupProgress >= 100 ? "bg-gray-900" : "bg-gray-600"
                }`}
                style={{ width: `${backupProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <SettingsCheckbox 
              checked={autoEnabled} 
              onChange={setAutoEnabled} 
              label={t("admin.settings.system.backup_auto_enabled") || "Enable Auto Backup"} 
            />
          </div>
          <SettingsField 
            label={t("admin.settings.system.backup_interval_hours") || "Backup Interval (hours)"} 
            value={intervalHoursInput} 
            onChange={setIntervalHoursInput} 
          />
          <SettingsField 
            label={t("admin.settings.system.backup_retention_days") || "Backup Retention (days)"} 
            value={retentionDaysInput} 
            onChange={setRetentionDaysInput} 
          />
          <SettingsField 
            label={t("admin.settings.system.backup_directory") || "Backup Directory"} 
            value={directoryInput} 
            onChange={setDirectoryInput} 
          />
        </div>

        {systemSettings?.backup && (
          <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              systemSettings.backup.lastStatus === "success" ? "bg-green-500" :
              systemSettings.backup.lastStatus === "failed" ? "bg-red-500" :
              systemSettings.backup.lastStatus === "restore_failed" ? "bg-red-500" :
              "bg-gray-400"
            }`} />
            <span>
              {t("admin.settings.system.backup_last_status", {
                status: systemSettings.backup.lastStatus || "none",
                file: systemSettings.backup.lastFile || "none",
                time: systemSettings.backup.lastRunAt ? formatDateThai(systemSettings.backup.lastRunAt) : "never"
              }) || `Status: ${systemSettings.backup.lastStatus || "none"} | File: ${systemSettings.backup.lastFile || "none"} | Time: ${systemSettings.backup.lastRunAt || "never"}`}
            </span>
          </div>
        )}
      </div>

      {/* Backup Files */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("admin.settings.system.backup_files") || "Backup Files"}
        </h2>
        
        {loadingFiles ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : backupFiles.length === 0 ? (
          <p className="text-gray-500 italic">
            {t("admin.settings.system.no_backups") || "No backup files found"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin.settings.system.file_name") || "File Name"}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin.settings.system.type") || "Type"}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin.settings.system.size") || "Size"}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin.settings.system.created") || "Created"}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin.settings.system.actions") || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backupFiles.map((file) => (
                  <tr key={file.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-5 w-5">
                          {file.type === 'database' ? <Database className="h-5 w-5 text-blue-500" /> : <FileText className="h-5 w-5 text-green-500" />}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${file.type === 'database' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'}`}>
                        {file.type === 'database' 
                          ? t("admin.settings.system.database") || "Database" 
                          : t("admin.settings.system.settings") || "Settings"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.sizeBytes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateThai(file.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setConfirmAction({ fileName: file.name, action: "restore" });
                          }}
                          disabled={actionTarget === file.name}
                          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                        <a
                          href={`/api/admin/backups/${encodeURIComponent(file.name)}`}
                          download
                          className="text-green-600 hover:text-green-900"
                        >
                          <Download className="h-5 w-5" />
                        </a>
                        <button
                          onClick={() => {
                            setConfirmAction({ fileName: file.name, action: "delete" });
                          }}
                          disabled={actionTarget === file.name}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {confirmAction.action === "restore" 
                ? t("admin.settings.system.confirm_restore_title") 
                : t("admin.settings.system.confirm_delete_title")}
            </h3>
            <p className="text-sm text-gray-500">
              {confirmAction.action === "restore"
                ? t("admin.settings.system.confirm_restore_desc", { fileName: confirmAction.fileName })
                : t("admin.settings.system.confirm_delete_desc", { fileName: confirmAction.fileName })}
            </p>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                {t("admin.settings.system.cancel") || "Cancel"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (confirmAction.action === "restore") {
                    await handleRestore(confirmAction.fileName);
                  } else {
                    await handleDelete(confirmAction.fileName);
                  }
                  setConfirmAction(null);
                }}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  confirmAction.action === "restore"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirmAction.action === "restore"
                  ? t("admin.settings.system.restore") || "Restore"
                  : t("admin.settings.system.delete") || "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}