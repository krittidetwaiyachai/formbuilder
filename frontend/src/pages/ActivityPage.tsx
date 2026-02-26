import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Activity,
  User,
  ArrowDownUp,
  Filter,
  Plus,
  Edit3,
  Trash2,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";

import Loader from "@/components/common/Loader";
import ActivityLogItem from "@/components/activity/ActivityLogItem";
import type { ActivityLog } from "@/components/activity/types";
import { shouldRenderLog } from "@/components/activity/utils";

import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export default function ActivityPage() {
  useSmoothScroll();
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("");
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({});

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [editors, setEditors] = useState<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      photoUrl?: string;
    }>
  >([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUserFilterOpen, setIsUserFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchEditors = async () => {
      try {
        const res = await api.get<
          {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            photoUrl?: string;
          }[]
        >(`/forms/${id}/activity/editors`);
        setEditors(res.data || []);
      } catch (error) {
        console.error("Failed to load editors:", error);
      }
    };
    if (id) {
      fetchEditors();
    }
  }, [id]);

  useEffect(() => {
    loadActivity();
  }, [id, page, sort, actionFilter, userFilter]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const formRes = await api.get(`/forms/${id}`);
      const formData = formRes.data.form || formRes.data;
      setFormTitle(formData.title || "");

      if (formData.fields) {
        const labels: Record<string, string> = {};
        formData.fields.forEach((f: { id: string; label?: string }) => {
          labels[f.id] = f.label || "Untitled";
        });
        setFieldLabels(labels);
      }

      const res = await api.get<
        { data: ActivityLog[]; meta: { totalPages: number } } | ActivityLog[]
      >(`/forms/${id}/activity`, {
        params: {
          page,
          limit,
          sort,
          action: actionFilter,
          userId: userFilter || undefined,
        },
      });

      const responseData = res.data;
      if ("data" in responseData && "meta" in responseData) {
        setLogs(responseData.data);
        setTotalPages(responseData.meta.totalPages);
      } else if (Array.isArray(responseData)) {
        setLogs(responseData);
        setTotalPages(1);
      } else {
        setLogs([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to load activity:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !logs.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 md:pb-0">
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-5 pt-12 pb-4 safe-area-pt">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 bg-gray-100 rounded-xl active:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => {
                    setIsUserFilterOpen(!isUserFilterOpen);
                    setIsFilterOpen(false);
                  }}
                  className={`p-2.5 rounded-xl active:bg-gray-200 transition-colors ${userFilter ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-700"}`}
                >
                  <User className="w-5 h-5" />
                </button>
                {isUserFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 max-h-[60vh] overflow-y-auto">
                    <button
                      onClick={() => {
                        setUserFilter(null);
                        setIsUserFilterOpen(false);
                        setPage(1);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 ${!userFilter ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <div className="p-1 bg-gray-200 rounded-full">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <span>{t("activity.filter.all_users")}</span>
                    </button>
                    {editors.map((editor) => (
                      <button
                        key={editor.id}
                        onClick={() => {
                          setUserFilter(editor.id);
                          setIsUserFilterOpen(false);
                          setPage(1);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${userFilter === editor.id ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700"}`}
                      >
                        {editor.photoUrl ? (
                          <img
                            src={editor.photoUrl}
                            alt=""
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                            {editor.firstName?.charAt(0)}
                          </div>
                        )}
                        <span className="truncate">
                          {editor.firstName} {editor.lastName}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSort(sort === "desc" ? "asc" : "desc")}
                className="p-2.5 bg-gray-100 rounded-xl active:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                <ArrowDownUp className="w-5 h-5 text-gray-700" />
                <span className="text-[10px] font-medium text-gray-600 min-w-[30px]">
                  {sort === "desc"
                    ? t("activity.filter.newest")
                    : t("activity.filter.oldest")}
                </span>
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    setIsFilterOpen(!isFilterOpen);
                    setIsUserFilterOpen(false);
                  }}
                  className={`p-2.5 rounded-xl active:bg-gray-200 transition-colors ${actionFilter !== "ALL" ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-700"}`}
                >
                  <Filter className="w-5 h-5" />
                </button>
                {isFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-black/5 border border-gray-100 overflow-hidden z-50">
                    <div className="py-1">
                      {[
                        {
                          value: "ALL",
                          label: t("activity.filter.all"),
                          icon: Activity,
                        },
                        {
                          value: "CREATED",
                          label: t("activity.filter.created"),
                          icon: Plus,
                        },
                        {
                          value: "UPDATED",
                          label: t("activity.filter.updated"),
                          icon: Edit3,
                        },
                        {
                          value: "DELETED",
                          label: t("activity.filter.deleted"),
                          icon: Trash2,
                        },
                      ].map((f) => (
                        <button
                          key={f.value}
                          onClick={() => {
                            setActionFilter(f.value);
                            setPage(1);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${actionFilter === f.value ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          <f.icon
                            className={`w-4 h-4 ${actionFilter === f.value ? "text-indigo-600" : "text-gray-400"}`}
                          />
                          {f.label}
                          {actionFilter === f.value && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <h1 className="text-[28px] font-bold text-black tracking-tight">
            {t("activity.title")}
          </h1>
          <p className="text-sm text-gray-500 truncate">{formTitle}</p>
        </div>
      </header>

      <header className="hidden md:block sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-200">
        <div className="max-w-4xl mx-auto px-6 py-3 min-h-[64px] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-all hover:-translate-x-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {t("activity.title")}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span
                  className="font-medium text-indigo-600 max-w-[200px] sm:max-w-xs md:max-w-md truncate"
                  title={formTitle}
                >
                  {formTitle}
                </span>
                <span className="flex-shrink-0">•</span>
                <span className="flex-shrink-0 whitespace-nowrap">
                  {logs.length} events loaded
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto md:overflow-visible md:flex-wrap pb-1 md:pb-0 justify-end flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setIsUserFilterOpen(!isUserFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 whitespace-nowrap"
              >
                <span className="max-w-[100px] truncate">
                  {userFilter
                    ? editors.find((e) => e.id === userFilter)?.firstName +
                      " " +
                      editors.find((e) => e.id === userFilter)?.lastName
                    : t("activity.filter.all_users")}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${isUserFilterOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isUserFilterOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 max-h-80 overflow-y-auto">
                  <button
                    onClick={() => {
                      setUserFilter(null);
                      setIsUserFilterOpen(false);
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${!userFilter ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <User className="w-4 h-4 opacity-70" />
                    <span>{t("activity.filter.all_users")}</span>
                  </button>
                  {editors.map((editor) => (
                    <button
                      key={editor.id}
                      onClick={() => {
                        setUserFilter(editor.id);
                        setIsUserFilterOpen(false);
                        setPage(1);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${userFilter === editor.id ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700"}`}
                    >
                      {editor.photoUrl && (
                        <img
                          src={editor.photoUrl}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span>
                        {editor.firstName} {editor.lastName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                onBlur={() => setTimeout(() => setIsFilterOpen(false), 200)}
                className={`flex items-center gap-2 px-4 py-2 bg-white rounded-xl border text-sm font-medium shadow-sm transition-all duration-200 ${isFilterOpen ? "border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-700" : "border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600"}`}
              >
                <span>
                  {actionFilter === "ALL" && t("activity.filter.all")}
                  {actionFilter === "CREATED" && t("activity.filter.created")}
                  {actionFilter === "UPDATED" && t("activity.filter.updated")}
                  {actionFilter === "DELETED" && t("activity.filter.deleted")}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isFilterOpen ? "rotate-180 text-indigo-500" : ""}`}
                />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl ring-1 ring-black/5 border border-gray-100 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                  <div className="py-1">
                    {[
                      {
                        value: "ALL",
                        label: t("activity.filter.all"),
                        icon: Activity,
                      },
                      {
                        value: "CREATED",
                        label: t("activity.filter.created"),
                        icon: Plus,
                      },
                      {
                        value: "UPDATED",
                        label: t("activity.filter.updated"),
                        icon: Edit3,
                      },
                      {
                        value: "DELETED",
                        label: t("activity.filter.deleted"),
                        icon: Trash2,
                      },
                    ].map((f) => (
                      <button
                        key={f.value}
                        onClick={() => {
                          setActionFilter(f.value);
                          setPage(1);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${actionFilter === f.value ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                      >
                        <f.icon
                          className={`w-4 h-4 ${actionFilter === f.value ? "text-indigo-600" : "text-gray-400"}`}
                        />
                        {f.label}
                        {actionFilter === f.value && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                    <p className="text-[10px] text-gray-500 leading-tight">
                      *{t("activity.filter.updated")} includes settings.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setSort((s) => (s === "desc" ? "asc" : "desc"));
                setPage(1);
              }}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 whitespace-nowrap"
            >
              {sort === "desc" ? (
                <>
                  <ArrowUp className="w-4 h-4 text-indigo-500 rotate-180" />
                  <span>{t("activity.filter.newest")}</span>
                </>
              ) : (
                <>
                  <ArrowUp className="w-4 h-4 text-indigo-500" />
                  <span>{t("activity.filter.oldest")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="relative">
            <div className="absolute left-[28px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-gray-200 via-gray-200/50 to-transparent" />

            <div className="space-y-8">
              {logs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {t("activity.no_activity_title")}
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {t("activity.no_activity_desc")}
                  </p>
                  {(actionFilter !== "ALL" || userFilter) && (
                    <button
                      onClick={() => {
                        setActionFilter("ALL");
                        setUserFilter(null);
                      }}
                      className="mt-4 text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
                    >
                      {t("activity.clear_filters")}
                    </button>
                  )}
                </div>
              ) : (
                logs.map((log, index) => {
                  if (!shouldRenderLog(log, actionFilter)) return null;
                  return (
                    <ActivityLogItem
                      key={log.id}
                      log={log}
                      index={index}
                      fieldLabels={fieldLabels}
                      actionFilter={actionFilter}
                    />
                  );
                })
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Showing page{" "}
                    <span className="font-medium text-gray-900">{page}</span> of{" "}
                    <span className="font-medium text-gray-900">
                      {totalPages}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-3 bg-black text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
