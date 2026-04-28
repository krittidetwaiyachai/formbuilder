import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { adminApi, type BackupFileInfo } from "@/lib/adminApi";
import { useSettings } from "./SettingsProvider";
import { SettingsField, SettingsCheckbox, ActionButton } from "./SettingsFormField";
import { parseIntegerInput } from "./settingsUtils";
import { Download, RotateCcw, Trash2, Database, FileText, Loader2 } from "lucide-react";

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

export default function BackupSection() {
  const { t } = useTranslation();
  const { snapshot, loadingSystem, applySettings, setSuccess, setError, setNotice, refreshSettings } = useSettings();

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

  useEffect(() => {
    if (!snapshot) return;
    setAutoEnabled(snapshot.backup.autoEnabled);
    setIntervalHoursInput(String(snapshot.backup.intervalHours || 24));
    setRetentionDaysInput(String(snapshot.backup.retentionDays || 14));
    setDirectoryInput(snapshot.backup.directory || "");
  }, [snapshot]);

  const loadBackupFiles = useCallback(async () => {
    try {
      setLoadingFiles(true);
      const response = await adminApi.listBackups();
      setBackupFiles(response.data);
    } catch {
      setBackupFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    void loadBackupFiles();
  }, [loadBackupFiles]);

  const parsedIntervalHours = useMemo(() => parseIntegerInput(intervalHoursInput), [intervalHoursInput]);
  const parsedRetentionDays = useMemo(() => parseIntegerInput(retentionDaysInput), [retentionDaysInput]);

  const hasChanges = useMemo(() => {
    if (!snapshot) return false;
    return (
      autoEnabled !== snapshot.backup.autoEnabled ||
      parsedIntervalHours !== snapshot.backup.intervalHours ||
      parsedRetentionDays !== snapshot.backup.retentionDays ||
      directoryInput !== (snapshot.backup.directory || "")
    );
  }, [autoEnabled, parsedIntervalHours, parsedRetentionDays, directoryInput, snapshot]);

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
      applySettings(response.data);
      setSuccess(t("admin.settings.system.backup_saved"));
    } catch {
      setError(t("admin.settings.system.backup_save_error"));
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
    setBackupStep("เตรียมข้อมูล...");
    stopProgressTimer();
    let current = 0;
    const steps = [
      { at: 5, label: "เริ่มดึงข้อมูล (pg_dump)..." },
      { at: 30, label: "กำลังสำรอง Database และตารางทั้งหมด..." },
      { at: 60, label: "กำลังบีบอัดข้อมูล..." },
      { at: 80, label: "กำลังเขียนไฟล์สำรอง..." },
      { at: 90, label: "จัดระเบียบไฟล์สำรองเก่า..." },
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
      stopProgressTimer();
      setBackupProgress(100);
      setBackupStep("เสร็จสิ้น!");
      await refreshSettings();
      await loadBackupFiles();
      const result = response.data as { status?: string; databaseFile?: string; settingsFile?: string };
      if (result?.status === "success") {
        setSuccess(`สำรองข้อมูลสำเร็จ: ${result.databaseFile || result.settingsFile || "-"}`);
      } else {
        setError(t("admin.settings.system.backup_now_failed"));
      }
    } catch {
      stopProgressTimer();
      setBackupProgress(0);
      setBackupStep("");
      setError(t("admin.settings.system.backup_now_failed"));
    } finally {
      setRunningBackup(false);
      setTimeout(() => {
        setBackupProgress(0);
        setBackupStep("");
      }, 2000);
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      setActionTarget(fileName);
      const response = await adminApi.downloadBackup(fileName);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("ดาวน์โหลดล้มเหลว");
    } finally {
      setActionTarget(null);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { fileName, action } = confirmAction;
    try {
      setActionTarget(fileName);
      setConfirmAction(null);
      if (action === "restore") {
        const response = await adminApi.restoreBackup(fileName);
        const result = response.data as { status?: string; type?: string };
        if (result?.status === "success") {
          await refreshSettings();
          setSuccess(`กู้คืนสำเร็จ: ${fileName}`);
        } else {
          setError(`กู้คืนล้มเหลว`);
        }
      } else {
        await adminApi.deleteBackup(fileName);
        setSuccess(`ลบสำเร็จ: ${fileName}`);
      }
      await loadBackupFiles();
    } catch {
      setError(`${action === "restore" ? "กู้คืน" : "ลบ"}ล้มเหลว`);
    } finally {
      setActionTarget(null);
    }
  };

  const savingLabel = t("admin.settings.saving");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{t("admin.settings.system.backup_title")}</h3>
        <div className="flex flex-wrap gap-2">
          <ActionButton
            onClick={handleRunBackup}
            disabled={runningBackup}
            loading={runningBackup}
            loadingLabel="กำลังสำรอง..."
            label={t("admin.settings.system.backup_now")}
            variant="secondary"
          />
          <ActionButton
            onClick={handleSave}
            disabled={loadingSystem || saving || !hasChanges}
            loading={saving}
            loadingLabel={savingLabel}
            label={t("admin.settings.system.save_backup")}
          />
        </div>
      </div>

      {(runningBackup || backupProgress > 0) && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-2.5 animate-in fade-in duration-200">
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
          <SettingsCheckbox checked={autoEnabled} onChange={setAutoEnabled} label={t("admin.settings.system.backup_auto_enabled")} />
        </div>
        <SettingsField label={t("admin.settings.system.backup_interval_hours")} value={intervalHoursInput} onChange={setIntervalHoursInput} />
        <SettingsField label={t("admin.settings.system.backup_retention_days")} value={retentionDaysInput} onChange={setRetentionDaysInput} />
        <SettingsField label={t("admin.settings.system.backup_directory")} value={directoryInput} onChange={setDirectoryInput} />
      </div>

      {snapshot?.backup.lastStatus && (
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${
            snapshot.backup.lastStatus === "success" ? "bg-gray-900" :
            snapshot.backup.lastStatus === "restored" ? "bg-gray-700" :
            "bg-gray-400"
          }`} />
          <span>
            สถานะ: {snapshot.backup.lastStatus}
            {snapshot.backup.lastFile && ` | ${snapshot.backup.lastFile}`}
            {snapshot.backup.lastRunAt && ` | ${formatDateThai(snapshot.backup.lastRunAt)}`}
          </span>
        </div>
      )}

      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900">รายการไฟล์สำรอง</p>
          <button
            onClick={loadBackupFiles}
            disabled={loadingFiles}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {loadingFiles ? "กำลังโหลด..." : "รีเฟรช"}
          </button>
        </div>

        {loadingFiles && backupFiles.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            กำลังโหลดรายการ...
          </div>
        ) : backupFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">ยังไม่มีไฟล์สำรอง</div>
        ) : (
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5 font-medium">ไฟล์สำรองฐานข้อมูล</th>
                  <th className="text-right px-4 py-2.5 font-medium hidden sm:table-cell">ขนาด</th>
                  <th className="text-right px-4 py-2.5 font-medium hidden sm:table-cell">วันที่สร้าง</th>
                  <th className="text-right px-4 py-2.5 font-medium w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {backupFiles.map((file) => (
                  <tr key={file.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-mono text-xs text-gray-700 truncate max-w-[250px]">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs hidden sm:table-cell">
                      {formatFileSize(file.sizeBytes)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs hidden sm:table-cell whitespace-nowrap">
                      {formatDateThai(file.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {actionTarget === file.name ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleDownload(file.name)}
                              title="ดาวน์โหลด"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmAction({ fileName: file.name, action: "restore" })}
                              title="กู้คืน"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmAction({ fileName: file.name, action: "delete" })}
                              title="ลบ"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmAction && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-base font-semibold text-gray-900">
              {confirmAction.action === "restore" ? "ยืนยันการกู้คืน" : "ยืนยันการลบ"}
            </h4>
            <p className="text-sm text-gray-600">
              {confirmAction.action === "restore" ? (
                <>
                  ระบบจะสร้าง backup ปัจจุบันก่อนกู้คืน <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{confirmAction.fileName}</span>
                  {confirmAction.fileName.startsWith("db-backup-") && (
                    <span className="block mt-2 text-red-600 font-medium">
                      ⚠️ การกู้คืน Database จะเขียนทับข้อมูลทั้งหมด
                    </span>
                  )}
                </>
              ) : (
                <>
                  ต้องการลบ <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{confirmAction.fileName}</span> หรือไม่?
                </>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors ${
                  confirmAction.action === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-900 hover:bg-black"
                }`}
              >
                {confirmAction.action === "restore" ? "กู้คืน" : "ลบ"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
