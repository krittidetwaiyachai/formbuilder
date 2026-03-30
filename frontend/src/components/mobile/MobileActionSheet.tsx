import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  BarChart3,
  Clock,
  Eye,
  FileText,
  FolderInput,
  Trash2
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  formTitle: string;
  onEdit: () => void;
  onPreview: () => void;
  onAnalytics: () => void;
  onActivity: () => void;
  onDelete: () => void;
  onMove: () => void;
}

export default function MobileActionSheet({
  isOpen,
  onClose,
  formTitle,
  onEdit,
  onPreview,
  onAnalytics,
  onActivity,
  onDelete,
  onMove
}: MobileActionSheetProps) {
  const { t } = useTranslation();
  const mountNode = typeof document !== "undefined" ? document.body : null;

  if (!mountNode) {
    return null;
  }

  const actions = [
    { icon: FileText, label: t("dashboard.context.edit"), onClick: onEdit },
    { icon: Eye, label: t("dashboard.context.preview"), onClick: onPreview },
    {
      icon: BarChart3,
      label: t("dashboard.context.analytics"),
      onClick: onAnalytics
    },
    {
      icon: Clock,
      label: t("dashboard.context.activity"),
      onClick: onActivity
    }
  ];

  const secondaryActions = [
    {
      icon: FolderInput,
      label: t("dashboard.move_to_folder"),
      onClick: onMove
    },
    {
      icon: Trash2,
      label: t("dashboard.context.delete"),
      onClick: onDelete,
      danger: true
    }
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/55 backdrop-blur-[1px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 380, bounce: 0 }}
            className="fixed inset-x-0 bottom-0 z-[9999] overflow-hidden rounded-t-3xl bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="p-4">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />
              <h3 className="mb-4 truncate px-4 text-center text-lg font-bold text-black">
                {formTitle}
              </h3>

              <div className="mb-4 grid grid-cols-4 gap-2">
                {actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      action.onClick();
                      onClose();
                    }}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-gray-100 p-3 transition-colors active:bg-gray-200"
                  >
                    <div className="rounded-full bg-black p-3 text-white">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-center text-[11px] font-medium leading-tight text-gray-700">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3">
                {secondaryActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      action.onClick();
                      onClose();
                    }}
                    className={`flex items-center justify-center gap-2 rounded-2xl p-4 transition-colors ${
                      action.danger
                        ? "bg-red-50 text-red-600 active:bg-red-100"
                        : "bg-gray-50 text-gray-700 active:bg-gray-100"
                    }`}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-sm font-semibold">{action.label}</span>
                  </button>
                ))}
              </div>

            </div>
            <div
              className="bg-white px-4 pt-0"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
            >
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-gray-100 py-4 text-center text-base font-semibold text-black transition-colors active:bg-gray-200"
              >
                {t("dashboard.modal.cancel")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    mountNode
  );
}
