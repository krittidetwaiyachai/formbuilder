import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'destructive',
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Dialog Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden z-20"
          >
            {/* Header/Banner Logic - Optional visual flair */}
            <div className={`h-2 w-full ${variant === 'destructive' ? 'bg-red-500' : 'bg-black'}`} />



            <div className="p-6 pt-6">
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    ...(variant === 'destructive' ? {
                      scale: [1, 1.1, 1],
                      transition: {
                        scale: {
                          repeat: Infinity,
                          duration: 2,
                          ease: "easeInOut",
                          delay: 0.5
                        },
                        rotate: { duration: 0.5, type: "spring" }
                      }
                    } : {})
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`mb-4 w-12 h-12 rounded-full flex items-center justify-center ${
                  variant === 'destructive' 
                    ? 'bg-red-50 text-red-500' 
                    : 'bg-gray-100 text-black'
                }`}>
                  {variant === 'destructive' ? (
                    <AlertTriangle className="w-6 h-6 border-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </motion.div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {title}
                </h2>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {description}
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={() => {
                      onConfirm();
                      onOpenChange(false);
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:scale-105 active:scale-95 text-sm ${
                      variant === 'destructive' 
                        ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                        : 'bg-black hover:bg-gray-800 shadow-gray-200'
                    }`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
