import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
interface MobileProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}
export default function MobileProfileSheet({
  isOpen,
  onClose,
  username
}: MobileProfileSheetProps) {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const mountNode = typeof document !== "undefined" ? document.body : null;
  const handleLogout = () => {
    logout();
    onClose();
    window.location.href = "/";
  };
  if (!mountNode) {
    return null;
  }
  return createPortal(
    <AnimatePresence>      {isOpen &&
      <>        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/50"
          onClick={onClose} />        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 34, stiffness: 380, bounce: 0 }}
          className="fixed inset-x-0 bottom-0 z-[201]">          <div className="overflow-hidden rounded-t-3xl bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.12)]">            <div className="p-4">              <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-gray-300" />              <div className="mb-6 flex flex-col items-center">                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">                  <User className="h-8 w-8 text-gray-400" />                </div>                <h3 className="text-center text-xl font-bold text-black">{username}</h3>                <p className="text-sm text-gray-500">{t("dashboard.welcome_back")}</p>              </div>              <div className="space-y-3">                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-4 text-base font-semibold text-red-600 transition-colors active:bg-red-100">                  <LogOut className="h-5 w-5" />                  {t("auth.logout")}                </button>              </div>            </div>            <div
              className="bg-white px-4 pt-0"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}>              <button
                onClick={onClose}
                className="w-full rounded-xl bg-gray-100 py-4 text-center text-base font-semibold text-black transition-colors active:bg-gray-200">                {t("dashboard.modal.cancel")}              </button>            </div>          </div>        </motion.div>      </>
      }    </AnimatePresence>,
    mountNode
  );
}