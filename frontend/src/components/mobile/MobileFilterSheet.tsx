import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filterStatus: string;
  onFilterChange: (status: string) => void;
  sortOrder: string;
  onSortChange: (sort: string) => void;
}

export default function MobileFilterSheet({
  isOpen,
  onClose,
  filterStatus,
  onFilterChange,
  sortOrder,
  onSortChange
}: MobileFilterSheetProps) {
  const { t } = useTranslation();
  const mountNode = typeof document !== "undefined" ? document.body : null;

  const statusOptions = [
    { key: "All", label: t("dashboard.filters.all") },
    { key: "PUBLISHED", label: t("dashboard.filters.published") },
    { key: "DRAFT", label: t("dashboard.filters.draft") },
    { key: "ARCHIVED", label: t("dashboard.filters.archived") }
  ];

  const sortOptions = [
    { key: "newest", label: t("dashboard.sort.newest") || "Newest" },
    { key: "oldest", label: t("dashboard.sort.oldest") || "Oldest" }
  ];

  if (!mountNode) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 380, bounce: 0 }}
            className="fixed inset-x-0 bottom-0 z-[61]"
          >
            <div className="overflow-hidden rounded-t-3xl bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.12)]">
              <div className="flex max-h-[85vh] flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <h3 className="text-lg font-bold text-gray-900">
                    {t("dashboard.filters.title") || "Filter & Sort"}
                  </h3>
                  <button
                    onClick={onClose}
                    className="-mr-2 rounded-full p-2 text-gray-400 hover:text-gray-600 active:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-8 overflow-y-auto p-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                      {t("dashboard.sort.title") || "Sort By"}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {sortOptions.map((option) => (
                        <button
                          key={option.key}
                          onClick={() => onSortChange(option.key)}
                          className={`flex w-full items-center justify-between rounded-xl px-5 py-4 text-left transition-all ${
                            sortOrder === option.key
                              ? "bg-black text-white shadow-lg shadow-black/10 ring-2 ring-black ring-offset-2"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span className="font-semibold">{option.label}</span>
                          {sortOrder === option.key && <Check className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                      {t("dashboard.filters.status") || "Status"}
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {statusOptions.map((option) => (
                        <button
                          key={option.key}
                          onClick={() => onFilterChange(option.key)}
                          className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                            filterStatus === option.key
                              ? "bg-black text-white shadow-md ring-2 ring-black ring-offset-2"
                              : "border border-gray-100 bg-gray-50 text-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[max(env(safe-area-inset-bottom),12px)] bg-white" />
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    mountNode
  );
}
