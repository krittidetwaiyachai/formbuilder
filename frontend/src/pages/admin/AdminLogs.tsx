import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Monitor, Code2, Smartphone, Laptop } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { adminApi } from "@/lib/adminApi";
import type { AdminActivityLog } from "@/lib/adminApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription } from
"@/components/ui/dialog";
const ACTION_FILTERS = [
"CREATED",
"UPDATED",
"DELETED",
"PUBLISHED",
"COLLABORATOR_INVITED",
"COLLABORATOR_ADDED",
"COLLABORATOR_REMOVED"];
const ALL_ACTION_VALUE = "__ALL_ACTIONS__";
type BeforeAfterDiff = {
  property?: string;
  before: unknown;
  after: unknown;
};
type DeviceInfo = {
  type?: string;
  os?: string;
  browser?: string;
  userAgent?: string;
};
function decodeBasicHtmlEntities(value: string) {
  return value.
  replaceAll("&nbsp;", " ").
  replaceAll("&amp;", "&").
  replaceAll("&lt;", "<").
  replaceAll("&gt;", ">").
  replaceAll("&quot;", '"').
  replaceAll("&#39;", "'");
}
function normalizeAuditText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const hasHtmlTag = /<\/?[a-z][^>]*>/i.test(trimmed);
  if (!hasHtmlTag) return decodeBasicHtmlEntities(trimmed);
  return decodeBasicHtmlEntities(trimmed).
  replace(/<[^>]+>/g, " ").
  replace(/\s+/g, " ").
  trim() || "(empty)";
}
function formatActionLabel(action: string) {
  return action.
  toLowerCase().
  replaceAll("_", " ").
  replace(/\b\w/g, (char) => char.toUpperCase());
}
function normalizeDetails(details: unknown): unknown {
  if (typeof details !== "string") return details;
  const trimmed = details.trim();
  if (!trimmed) return "";
  try {
    return JSON.parse(trimmed);
  } catch {
    return details;
  }
}
function flattenObjectToReadable(obj: Record<string, unknown>): string {
  return Object.entries(obj).
  filter(([key]) => !['device', 'requestId', 'ip'].includes(key)).
  map(([key, val]) => {
    if (val === null || val === undefined) return `${key}: -`;
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return `${key}: ${val}`;
    if (typeof val === 'object' && !Array.isArray(val)) {
      const nested = val as Record<string, unknown>;
      const inner = Object.entries(nested).
      map(([k, v]) => `${k}: ${v}`).
      join(', ');
      return inner;
    }
    return `${key}: ${val}`;
  }).
  join(', ');
}
function toCompactValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return normalizeAuditText(value) || "-";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    return flattenObjectToReadable(record) || "-";
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? "-" : `${value.length} items`;
  }
  return String(value);
}
function toPrettyJson(details: unknown) {
  const normalized = normalizeDetails(details);
  if (!normalized) return "";
  if (typeof normalized === "string") return normalized;
  try {
    return JSON.stringify(normalized, null, 2);
  } catch {
    return String(normalized);
  }
}
function extractThemeName(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.themeName === "string" && record.themeName.trim().length > 0) {
    return record.themeName.trim();
  }
  return null;
}
function extractBeforeAfter(details: unknown): BeforeAfterDiff | null {
  const normalized = normalizeDetails(details);
  if (!normalized || typeof normalized !== "object" || Array.isArray(normalized)) return null;
  const record = normalized as Record<string, unknown>;
  if (
  Object.prototype.hasOwnProperty.call(record, "before") &&
  Object.prototype.hasOwnProperty.call(record, "after"))
  {
    return {
      property: typeof record.property === "string" ? record.property : undefined,
      before: record.before,
      after: record.after
    };
  }
  const settingsChanges = Array.isArray(record.settingsChanges) ?
  record.settingsChanges as Array<Record<string, unknown>> :
  [];
  const firstSettingsDiff = settingsChanges.find(
    (change) =>
    Object.prototype.hasOwnProperty.call(change, "before") &&
    Object.prototype.hasOwnProperty.call(change, "after")
  );
  if (firstSettingsDiff) {
    const rawProperty =
    typeof firstSettingsDiff.property === "string" ? firstSettingsDiff.property.toLowerCase() : "";
    const themeBefore = extractThemeName(firstSettingsDiff.before);
    const themeAfter = extractThemeName(firstSettingsDiff.after);
    if (rawProperty === "settings" && (themeBefore !== null || themeAfter !== null)) {
      return { property: "themeName", before: themeBefore ?? "none", after: themeAfter ?? "none" };
    }
    return {
      property: typeof firstSettingsDiff.property === "string" ? firstSettingsDiff.property : undefined,
      before: firstSettingsDiff.before,
      after: firstSettingsDiff.after
    };
  }
  const updatedFields = Array.isArray(record.updatedFields) ?
  record.updatedFields as Array<Record<string, unknown>> :
  [];
  for (const field of updatedFields) {
    const changes = Array.isArray(field.changes) ?
    field.changes as Array<Record<string, unknown>> :
    [];
    const firstFieldDiff = changes.find(
      (change) =>
      Object.prototype.hasOwnProperty.call(change, "before") &&
      Object.prototype.hasOwnProperty.call(change, "after")
    );
    if (firstFieldDiff) {
      const fieldLabel =
      typeof field.label === "string" && field.label.trim().length > 0 ?
      normalizeAuditText(field.label) :
      undefined;
      const property =
      typeof firstFieldDiff.property === "string" ?
      normalizeAuditText(firstFieldDiff.property) :
      undefined;
      return {
        property: fieldLabel ? `${fieldLabel}.${property || "change"}` : property,
        before: firstFieldDiff.before,
        after: firstFieldDiff.after
      };
    }
  }
  const logicChanges =
  record.logicChanges && typeof record.logicChanges === "object" ?
  record.logicChanges as Record<string, unknown> :
  null;
  const logicUpdated = logicChanges && Array.isArray(logicChanges.updated) ?
  logicChanges.updated as Array<Record<string, unknown>> :
  [];
  for (const updated of logicUpdated) {
    const changes = Array.isArray(updated.changes) ?
    updated.changes as Array<Record<string, unknown>> :
    [];
    const firstLogicDiff = changes.find(
      (change) =>
      Object.prototype.hasOwnProperty.call(change, "before") &&
      Object.prototype.hasOwnProperty.call(change, "after")
    );
    if (firstLogicDiff) {
      return {
        property: typeof firstLogicDiff.property === "string" ? firstLogicDiff.property : "logic",
        before: firstLogicDiff.before,
        after: firstLogicDiff.after
      };
    }
  }
  return null;
}
function extractDeviceInfo(details: unknown): DeviceInfo | null {
  const normalized = normalizeDetails(details);
  if (!normalized || typeof normalized !== "object" || Array.isArray(normalized)) return null;
  const record = normalized as Record<string, unknown>;
  const device = record.device;
  if (!device || typeof device !== "object" || Array.isArray(device)) return null;
  const deviceRecord = device as Record<string, unknown>;
  const userAgent = typeof deviceRecord.userAgent === "string" ? deviceRecord.userAgent : undefined;
  const os = typeof deviceRecord.os === "string" ? deviceRecord.os : undefined;
  const browser = typeof deviceRecord.browser === "string" ? deviceRecord.browser : undefined;
  const type = typeof deviceRecord.type === "string" ? deviceRecord.type : undefined;
  if (!userAgent && !os && !browser && !type) return null;
  return { userAgent, os, browser, type };
}
function formatHumanDetails(
log: AdminActivityLog,
t: (key: string, options?: Record<string, unknown>) => string)
{
  const details = normalizeDetails(log.details);
  const detailRecord =
  details && typeof details === "object" && !Array.isArray(details) ?
  details as Record<string, unknown> :
  {};
  switch (log.action) {
    case "COLLABORATOR_INVITED":{
        const invitedEmail =
        typeof detailRecord.email === "string" && detailRecord.email.trim().length > 0 ?
        detailRecord.email.trim() :
        null;
        if (invitedEmail) return t("admin.logs.details_text.collaborator_invited", { email: invitedEmail });
        return t("admin.logs.details_text.collaborator_invited_generic");
      }
    case "COLLABORATOR_ADDED":{
        const acceptedFromInvitation = detailRecord.acceptedFromInvitation === true;
        if (acceptedFromInvitation) return t("admin.logs.details_text.collaborator_added_from_invite");
        return t("admin.logs.details_text.collaborator_added");
      }
    case "COLLABORATOR_REMOVED":{
        const removedUserNameFromDetails =
        typeof detailRecord.removedUserName === "string" && detailRecord.removedUserName.trim().length > 0 ?
        detailRecord.removedUserName.trim() :
        null;
        const removedUserEmailFromDetails =
        typeof detailRecord.removedUserEmail === "string" && detailRecord.removedUserEmail.trim().length > 0 ?
        detailRecord.removedUserEmail.trim() :
        null;
        const removedFallbackFullName = log.user ? [log.user.firstName, log.user.lastName].
        filter((value): value is string => typeof value === "string" && value.trim().length > 0).
        join(" ").
        trim() : "";
        const removedName = removedUserNameFromDetails || removedFallbackFullName || log.user?.email || "System";
        const removedEmail = removedUserEmailFromDetails || log.user?.email || "system@local";
        const removedBy =
        typeof detailRecord.removedBy === "string" && detailRecord.removedBy.trim().length > 0 ?
        detailRecord.removedBy.trim() :
        null;
        if (removedBy) {
          return t("admin.logs.details_text.collaborator_removed_target_by", { name: removedName, email: removedEmail });
        }
        return t("admin.logs.details_text.collaborator_removed_target", { name: removedName, email: removedEmail });
      }
    case "CREATED":
      return t("admin.logs.details_text.created");
    case "DELETED":
      return t("admin.logs.details_text.deleted");
    case "PUBLISHED":
      return t("admin.logs.details_text.published");
    case "UPDATED":{
        const diff = extractBeforeAfter(log.details);
        if (diff?.property) {
          return t("admin.logs.details_text.updated_property", {
            property: diff.property
          });
        }
        return t("admin.logs.details_text.updated");
      }
    default:
      return t("admin.logs.details_text.generic");
  }
}
function getActionStyle(action: string) {
  const normalized = action.toLowerCase();
  if (normalized.includes("delete") || normalized.includes("ban"))
  return "bg-gray-900 text-white";
  if (normalized.includes("update") || normalized.includes("publish") || normalized.includes("remove"))
  return "bg-gray-200 text-gray-800";
  return "bg-gray-100 text-gray-600";
}
function DeviceIcon({ type }: {type?: string;}) {
  if (type === "mobile" || type === "tablet") return <Smartphone className="w-3.5 h-3.5" />;
  return <Laptop className="w-3.5 h-3.5" />;
}
export default function AdminLogs() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await adminApi.getLogs({
          page,
          limit: 20,
          search: searchQuery || undefined,
          action: actionFilter || undefined
        });
        setLogs(response.data.data);
        setTotalPages(response.data.meta.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        setLogs([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [actionFilter, page, searchQuery]);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const rows = useMemo(() => logs, [logs]);
  return (
    <PermissionGate
      permission="VIEW_SYSTEM_LOGS"
      fallback={
      <div className="p-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-400">
            {t("admin.logs.no_permission")}
          </div>
        </div>
      }>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t("admin.logs.title")}</h1>
          <p className="text-sm text-gray-400 mt-1">{t("admin.logs.description")}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setPage(1);
                  setSearchQuery(event.target.value);
                }}
                placeholder={t("admin.logs.search_placeholder")}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all" />
            </div>
            <Select
              value={actionFilter || ALL_ACTION_VALUE}
              onValueChange={(value) => {
                setPage(1);
                setActionFilter(value === ALL_ACTION_VALUE ? "" : value);
              }}>
              <SelectTrigger className="w-[170px] md:w-[190px] rounded-lg border-gray-200 text-sm shadow-none focus:ring-2 focus:ring-gray-900/10 focus:ring-offset-0">
                <SelectValue placeholder={t("admin.logs.action_all")} />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-200 p-1">
                <SelectItem
                  value={ALL_ACTION_VALUE}
                  className="rounded-md text-sm data-[state=checked]:bg-gray-900 data-[state=checked]:text-white">
                  {t("admin.logs.action_all")}
                </SelectItem>
                {ACTION_FILTERS.map((action) =>
                <SelectItem
                  key={action}
                  value={action}
                  className="rounded-md text-sm data-[state=checked]:bg-gray-900 data-[state=checked]:text-white">
                    {formatActionLabel(action)}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="divide-y divide-gray-100">
            {loading &&
            Array.from({ length: 6 }).map((_, index) =>
            <div key={index} className="p-5 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-1/4 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
            )}
            {!loading && rows.length === 0 &&
            <div className="px-6 py-14 text-center text-sm text-gray-400">
                {t("admin.logs.empty")}
              </div>
            }
            {!loading &&
            rows.map((log) => {
              const detailsText = formatHumanDetails(log, t);
              const beforeAfter = extractBeforeAfter(log.details);
              const isExpanded = expandedRows[log.id] === true;
              const toggleJson = () =>
              setExpandedRows((prev) => ({ ...prev, [log.id]: !prev[log.id] }));
              const prettyJson = toPrettyJson(log.details);
              const device = extractDeviceInfo(log.details);
              const detailsRecord = (typeof log.details === 'object' && log.details !== null && !Array.isArray(log.details) ? log.details : {}) as Record<string, any>;
              const fallbackTitle = detailsRecord.title || detailsRecord.formTitle || t("admin.activity.deleted_form");
              const formTitle = log.form?.title || fallbackTitle;
              const userName = log.user?.firstName || log.user?.email || "System";
              const userInitial = userName.trim().charAt(0).toUpperCase() || "S";
              const userEmail = log.user?.email || "system@local";
              return (
                <Fragment key={log.id}>
                    <div className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-1 whitespace-nowrap rounded text-xs font-semibold ${getActionStyle(log.action)}`}>
                            {formatActionLabel(log.action)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                          </span>
                        </div>
                        <code className="text-xs text-gray-300 font-mono shrink-0">
                          {log.id.slice(0, 8)}
                        </code>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 text-sm font-semibold flex items-center justify-center shrink-0">
                            {userInitial}
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-medium text-gray-900 truncate">{userName}</p>
                            <p className="text-sm text-gray-400 truncate">{userEmail}</p>
                          </div>
                        </div>
                        <div className="md:col-span-3">
                          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">{t("admin.logs.table.form")}</p>
                          <p className="text-base text-gray-700 truncate">
                            {formTitle}
                          </p>
                        </div>
                        <div className="md:col-span-3">
                          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">{t("admin.logs.table.details")}</p>
                          <p className="text-base text-gray-600 line-clamp-2">{detailsText}</p>
                          {beforeAfter &&
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              {beforeAfter.property &&
                          <span className="text-xs text-gray-400">{beforeAfter.property}:</span>
                          }
                              <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500 truncate max-w-[250px]" title={toCompactValue(beforeAfter.before)}>
                                {toCompactValue(beforeAfter.before)}
                              </span>
                              <span className="text-gray-300 text-xs">→</span>
                              <span className="px-1.5 py-0.5 rounded text-xs bg-gray-900 text-white truncate max-w-[250px]" title={toCompactValue(beforeAfter.after)}>
                                {toCompactValue(beforeAfter.after)}
                              </span>
                            </div>
                        }
                        </div>
                        <div className="md:col-span-3">
                          <div className="mb-2">
                            <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">{t("admin.logs.device")}</p>
                            <button
                            type="button"
                            onClick={() => device && setSelectedDevice(device)}
                            disabled={!device}
                            className={`flex items-center gap-1.5 ${device ? 'cursor-pointer hover:bg-gray-50 px-1.5 -ml-1.5 py-0.5 rounded transition-colors' : ''}`}>
                              {device ?
                            <>
                                  <DeviceIcon type={device.type} />
                                  <span className="text-sm text-gray-600 truncate text-left">
                                    {[device.browser, device.os].filter(Boolean).join(" · ") || "Unknown"}
                                  </span>
                                </> :
                            <>
                                  <Monitor className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-400">Unknown</span>
                                </>
                            }
                            </button>
                          </div>
                          <button
                          onClick={toggleJson}
                          className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                            <Code2 className="w-3.5 h-3.5" />
                            {isExpanded ? t("admin.logs.json.hide") : t("admin.logs.json.view")}
                          </button>
                        </div>
                      </div>
                      {isExpanded &&
                    <div className="mt-3 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm leading-6 text-gray-300">
                            {prettyJson || t("admin.logs.details.none")}
                          </pre>
                        </div>
                    }
                    </div>
                  </Fragment>);
            })}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">{t("admin.logs.page_info", { page, total: totalPages })}</p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={!hasPrev}
                className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={!hasNext}
                className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={!!selectedDevice} onOpenChange={(open) => !open && setSelectedDevice(null)}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>รายละเอียดอุปกรณ์</DialogTitle>
            <DialogDescription>
              ข้อมูลอุปกรณ์ที่ใช้ในการทำรายการนี้
            </DialogDescription>
          </DialogHeader>
          {selectedDevice &&
          <div className="space-y-4 mt-2">
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="text-sm text-gray-500 font-medium">อุปกรณ์</span>
                <span className="text-sm text-gray-900 col-span-2 capitalize">{selectedDevice.type || "-"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="text-sm text-gray-500 font-medium">ระบบปฏิบัติการ</span>
                <span className="text-sm text-gray-900 col-span-2">{selectedDevice.os || "-"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="text-sm text-gray-500 font-medium">เบราว์เซอร์</span>
                <span className="text-sm text-gray-900 col-span-2">{selectedDevice.browser || "-"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500 font-medium">User Agent</span>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-600 break-all leading-relaxed font-mono">
                    {selectedDevice.userAgent || "-"}
                  </p>
                </div>
              </div>
            </div>
          }
        </DialogContent>
      </Dialog>
    </PermissionGate>);
}