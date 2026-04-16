import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, ShieldCheck } from "lucide-react";
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
  SelectValue
} from "@/components/ui/select";

const ACTION_FILTERS = [
  "CREATED",
  "DELETED",
  "PUBLISHED",
  "COLLABORATOR_ADDED",
  "COLLABORATOR_REMOVED"
];
const ALL_ACTION_VALUE = "__ALL_ACTIONS__";

type Severity = "low" | "medium" | "high";
type BeforeAfterDiff = {
  property?: string;
  before: unknown;
  after: unknown;
};

function formatActionLabel(action: string) {
  return action
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function resolveSeverity(action: string): Severity {
  const normalized = action.toLowerCase();
  if (normalized.includes("delete") || normalized.includes("ban")) return "high";
  if (
    normalized.includes("update") ||
    normalized.includes("publish") ||
    normalized.includes("remove")
  ) {
    return "medium";
  }
  return "low";
}

function getSeverityStyles(severity: Severity) {
  if (severity === "high") {
    return {
      card: "border-l-red-500 bg-red-50/20",
      badge: "bg-red-50 text-red-700 border-red-200"
    };
  }
  if (severity === "medium") {
    return {
      card: "border-l-amber-500 bg-amber-50/20",
      badge: "bg-amber-50 text-amber-700 border-amber-200"
    };
  }
  return {
    card: "border-l-emerald-500 bg-emerald-50/20",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200"
  };
}

function stringifyDetails(details: unknown) {
  if (!details) return "";
  if (typeof details === "string") return details;
  try {
    return JSON.stringify(details);
  } catch {
    return "";
  }
}

function toCompactValue(value: unknown) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function toPrettyJson(details: unknown) {
  if (!details) return "";
  if (typeof details === "string") return details;
  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return String(details);
  }
}

function extractBeforeAfter(details: unknown): BeforeAfterDiff | null {
  if (!details || typeof details !== "object" || Array.isArray(details)) return null;
  const record = details as Record<string, unknown>;

  if (
    Object.prototype.hasOwnProperty.call(record, "before") &&
    Object.prototype.hasOwnProperty.call(record, "after")
  ) {
    return {
      property: typeof record.property === "string" ? record.property : undefined,
      before: record.before,
      after: record.after
    };
  }

  const settingsChanges = Array.isArray(record.settingsChanges)
    ? (record.settingsChanges as Array<Record<string, unknown>>)
    : [];
  const firstSettingsDiff = settingsChanges.find(
    (change) =>
      Object.prototype.hasOwnProperty.call(change, "before") &&
      Object.prototype.hasOwnProperty.call(change, "after")
  );
  if (firstSettingsDiff) {
    return {
      property:
        typeof firstSettingsDiff.property === "string"
          ? firstSettingsDiff.property
          : undefined,
      before: firstSettingsDiff.before,
      after: firstSettingsDiff.after
    };
  }

  const updatedFields = Array.isArray(record.updatedFields)
    ? (record.updatedFields as Array<Record<string, unknown>>)
    : [];
  for (const field of updatedFields) {
    const changes = Array.isArray(field.changes)
      ? (field.changes as Array<Record<string, unknown>>)
      : [];
    const firstFieldDiff = changes.find(
      (change) =>
        Object.prototype.hasOwnProperty.call(change, "before") &&
        Object.prototype.hasOwnProperty.call(change, "after")
    );
    if (firstFieldDiff) {
      const fieldLabel =
        typeof field.label === "string" && field.label.trim().length > 0
          ? field.label
          : undefined;
      const property =
        typeof firstFieldDiff.property === "string" ? firstFieldDiff.property : undefined;
      return {
        property: fieldLabel ? `${fieldLabel}.${property || "change"}` : property,
        before: firstFieldDiff.before,
        after: firstFieldDiff.after
      };
    }
  }

  const logicChanges =
    record.logicChanges && typeof record.logicChanges === "object"
      ? (record.logicChanges as Record<string, unknown>)
      : null;
  const logicUpdated = logicChanges && Array.isArray(logicChanges.updated)
    ? (logicChanges.updated as Array<Record<string, unknown>>)
    : [];
  for (const updated of logicUpdated) {
    const changes = Array.isArray(updated.changes)
      ? (updated.changes as Array<Record<string, unknown>>)
      : [];
    const firstLogicDiff = changes.find(
      (change) =>
        Object.prototype.hasOwnProperty.call(change, "before") &&
        Object.prototype.hasOwnProperty.call(change, "after")
    );
    if (firstLogicDiff) {
      return {
        property:
          typeof firstLogicDiff.property === "string" ? firstLogicDiff.property : "logic",
        before: firstLogicDiff.before,
        after: firstLogicDiff.after
      };
    }
  }

  return null;
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
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-gray-500">
            {t("admin.logs.no_permission")}
          </div>
        </div>
      }>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("admin.logs.title")}</h1>
          <p className="text-gray-500">{t("admin.logs.description")}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-col md:flex-row gap-3">
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
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-sm"
              />
            </div>
            <Select
              value={actionFilter || ALL_ACTION_VALUE}
              onValueChange={(value) => {
                setPage(1);
                setActionFilter(value === ALL_ACTION_VALUE ? "" : value);
              }}>
              <SelectTrigger className="w-[170px] md:w-[190px] rounded-xl border-gray-200 bg-white text-sm shadow-none focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-0">
                <SelectValue placeholder={t("admin.logs.action_all")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200 p-1">
                <SelectItem
                  value={ALL_ACTION_VALUE}
                  className="rounded-lg text-sm data-[state=checked]:bg-slate-900 data-[state=checked]:text-white">
                  {t("admin.logs.action_all")}
                </SelectItem>
                {ACTION_FILTERS.map((action) => (
                  <SelectItem
                    key={action}
                    value={action}
                    className="rounded-lg text-sm data-[state=checked]:bg-slate-900 data-[state=checked]:text-white">
                    {formatActionLabel(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-slate-50/50 space-y-3">
            {loading &&
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}

            {!loading && rows.length === 0 && (
              <div className="px-6 py-14 text-center text-gray-400 bg-white border border-slate-200 rounded-2xl">
                {t("admin.logs.empty")}
              </div>
            )}

            {!loading &&
              rows.map((log) => {
                const severity = resolveSeverity(log.action);
                const severityStyles = getSeverityStyles(severity);
                const detailsText = stringifyDetails(log.details);
                const beforeAfter = extractBeforeAfter(log.details);
                const isExpanded = expandedRows[log.id] === true;
                const toggleJson = () =>
                  setExpandedRows((prev) => ({ ...prev, [log.id]: !prev[log.id] }));
                const prettyJson = toPrettyJson(log.details);
                const userName = log.user.firstName || log.user.email;
                const userInitial = userName.trim().charAt(0).toUpperCase();

                return (
                  <Fragment key={log.id}>
                    <article
                      className={`border border-slate-200 border-l-4 rounded-2xl bg-white shadow-sm p-4 ${severityStyles.card}`}>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${severityStyles.badge}`}>
                          {severity === "low" && <ShieldCheck className="inline w-3 h-3 mr-1" />}
                          {t(`admin.logs.severity.${severity}`)}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {formatActionLabel(log.action)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            {t("admin.logs.table.user")}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center">
                              {userInitial}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">{userName}</p>
                              <p className="text-xs text-slate-500 truncate">{log.user.email}</p>
                            </div>
                          </div>
                          <p className="text-[11px] uppercase tracking-wide text-slate-500 mt-2">
                            {t("admin.logs.table.form")}
                          </p>
                          <p className="text-sm text-slate-700 truncate">
                            {log.form?.title || t("admin.activity.deleted_form")}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            {t("admin.logs.table.before_after")}
                          </p>
                          {beforeAfter ? (
                            <div className="space-y-2">
                              {beforeAfter.property && (
                                <p className="text-xs text-slate-500 truncate" title={beforeAfter.property}>
                                  {beforeAfter.property}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                <span
                                  className="px-2 py-1 rounded-md text-xs bg-red-50 text-red-700 border border-red-100 truncate max-w-[160px]"
                                  title={toCompactValue(beforeAfter.before)}>
                                  {toCompactValue(beforeAfter.before)}
                                </span>
                                <span className="text-slate-400">→</span>
                                <span
                                  className="px-2 py-1 rounded-md text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 truncate max-w-[160px]"
                                  title={toCompactValue(beforeAfter.after)}>
                                  {toCompactValue(beforeAfter.after)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400">{t("admin.logs.before_after.none")}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            {t("admin.logs.table.details")}
                          </p>
                          <p className="text-sm text-slate-700 break-words line-clamp-3">
                            {detailsText || t("admin.logs.details.none")}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                        <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {log.id.slice(0, 8)}
                        </code>
                        <button
                          onClick={toggleJson}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors">
                          {isExpanded ? t("admin.logs.json.hide") : t("admin.logs.json.view")}
                        </button>
                      </div>
                    </article>

                    {isExpanded && (
                      <div className="ml-2 mr-2 mt-[-6px] mb-2 bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <pre className="text-xs leading-5 text-emerald-300 overflow-x-auto">
                          {prettyJson || t("admin.logs.details.none")}
                        </pre>
                      </div>
                    )}
                  </Fragment>
                );
              })}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between">
            <p className="text-sm text-gray-600">{t("admin.logs.page_info", { page, total: totalPages })}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={!hasPrev}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={!hasNext}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
