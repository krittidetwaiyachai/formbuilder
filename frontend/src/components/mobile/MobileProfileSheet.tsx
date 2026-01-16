import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';

interface MobileProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export default function MobileProfileSheet({
  isOpen,
  onClose,
  username,
}: MobileProfileSheetProps) {
  const { t } = useTranslation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    onClose();
    window.location.href = '/';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[200]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[201] pb-safe"
          >
            <div className="p-4">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
              
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-black text-center">{username}</h3>
                <p className="text-sm text-gray-500">{t('dashboard.welcome_back')}</p>
              </div>

              <div className="space-y-3">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-4 text-base font-semibold text-red-600 bg-red-50 rounded-xl active:bg-red-100 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    {t('auth.logout')}
                </button>

                <button
                    onClick={onClose}
                    className="w-full py-4 text-center text-base font-semibold text-black bg-gray-100 rounded-xl active:bg-gray-200 transition-colors"
                >
                    {t('dashboard.modal.cancel')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
