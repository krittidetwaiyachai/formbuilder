import React, { useState } from "react";
import { useTranslation } from "react-i18next";
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  className?: string;
}
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  className = ""
}) => {
  const { t } = useTranslation();
  const [jumpPage, setJumpPage] = useState("");
  if (totalPages <= 1) return null;
  return (
    <div className={`px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 w-full ${className}`}>
      <div className="text-sm font-medium text-slate-500">
        {t("analytics.page_of", { current: currentPage, total: totalPages })}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || loading}
          className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm flex items-center gap-1">
          ← <span className="hidden sm:inline">{t("analytics.prev_page")}</span>
        </button>
        <div className="flex items-center gap-2 mx-1 px-3 border-x border-slate-100">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const p = parseInt(jumpPage, 10);
                if (p >= 1 && p <= totalPages) {
                  onPageChange(p);
                  setJumpPage("");
                }
              }
            }}
            placeholder={`1-${totalPages}`}
            className="w-[4.5rem] px-2 py-1.5 text-sm font-medium border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" />
          <button
            onClick={() => {
              const p = parseInt(jumpPage, 10);
              if (p >= 1 && p <= totalPages) {
                onPageChange(p);
                setJumpPage("");
              }
            }}
            disabled={
            !jumpPage ||
            parseInt(jumpPage, 10) < 1 ||
            parseInt(jumpPage, 10) > totalPages || loading
            }
            className="px-3 py-1.5 text-sm font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-all shadow-sm">
            Go
          </button>
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages || loading}
          className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm flex items-center gap-1">
          <span className="hidden sm:inline">{t("analytics.next_page")}</span> →
        </button>
      </div>
    </div>);
};