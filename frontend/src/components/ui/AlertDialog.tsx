import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText?: string;
  variant?: "default" | "error";
}
export default function AlertDialog({
  open,
  onClose,
  title,
  description,
  buttonText,
  variant = "default"
}: AlertDialogProps) {
  const { t } = useTranslation();
  const finalButtonText = buttonText || t("common.ok");
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open ?
      <>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[9998] cursor-pointer bg-black/60 backdrop-blur-sm" />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative z-20 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl pointer-events-auto">
              <div className={`h-2 w-full ${variant === "error" ? "bg-red-500" : "bg-black"}`} />
              <div className="p-6 pt-6">
                <div className="flex flex-col items-center text-center">
                  <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                  variant === "error" ? "bg-red-50 text-red-500" : "bg-gray-100 text-black"}`
                  }>
                    <AlertCircle className="h-6 w-6" />
                  </motion.div>
                  <h2 className="mb-2 text-xl font-bold text-gray-900">{title}</h2>
                  <p className="mb-6 text-sm leading-relaxed text-gray-500">{description}</p>
                  <button
                  onClick={onClose}
                  className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all active:scale-95 hover:bg-gray-800">
                    {finalButtonText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </> :
      null}
    </AnimatePresence>,
    document.body
  );
}