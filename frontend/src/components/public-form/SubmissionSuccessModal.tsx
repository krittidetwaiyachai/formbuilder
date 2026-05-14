import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
interface SubmissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export default function SubmissionSuccessModal({
  isOpen,
  onClose
}: SubmissionSuccessModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <AnimatePresence>      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">        {}        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        {}        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden z-20">
          <div className="p-8 flex flex-col items-center text-center">            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1
              }}
              className="mb-6 w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" strokeWidth={3} />            </motion.div>            <h2 className="text-xl font-bold text-gray-900 mb-2">              {t("public.thank_you.title", "Thank you!")}            </h2>            <p className="text-gray-500 mb-8 leading-relaxed">              {t(
                "public.thank_you.message",
                "Your submission has been received."
              )}            </p>            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-gray-200">
              {t("common.ok", "OK")}            </button>          </div>        </motion.div>      </div>    </AnimatePresence>);
}