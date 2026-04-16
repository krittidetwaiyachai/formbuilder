import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  variant = "destructive",
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const finalConfirmText = confirmText || t("common.confirm");
  const finalCancelText = cancelText || t("common.cancel");

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[9998] cursor-pointer bg-black/60 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative z-20 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl pointer-events-auto"
            >
              <div className={`h-2 w-full ${variant === "destructive" ? "bg-red-500" : "bg-black"}`} />

              <div className="p-6 pt-6">
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                      ...(variant === "destructive"
                        ? {
                            scale: [1, 1.1, 1],
                            transition: {
                              scale: {
                                repeat: Infinity,
                                duration: 2,
                                ease: "easeInOut",
                                delay: 0.5,
                              },
                              rotate: { duration: 0.5, type: "spring" },
                            },
                          }
                        : {}),
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                      variant === "destructive" ? "bg-red-50 text-red-500" : "bg-gray-100 text-black"
                    }`}
                  >
                    {variant === "destructive" ? (
                      <AlertTriangle className="h-6 w-6 border-0" />
                    ) : (
                      <AlertCircle className="h-6 w-6" />
                    )}
                  </motion.div>

                  <h2 className="mb-2 text-xl font-bold text-gray-900">{title}</h2>
                  <p className="mb-6 text-sm leading-relaxed text-gray-500">{description}</p>

                  <div className="flex w-full gap-3">
                    <button
                      onClick={() => onOpenChange(false)}
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                    >
                      {finalCancelText}
                    </button>
                    <button
                      onClick={() => {
                        onConfirm();
                        onOpenChange(false);
                      }}
                      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all active:scale-95 hover:scale-105 ${
                        variant === "destructive"
                          ? "bg-red-600 shadow-red-200 hover:bg-red-700"
                          : "bg-black shadow-gray-200 hover:bg-gray-800"
                      }`}
                    >
                      {finalConfirmText}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
