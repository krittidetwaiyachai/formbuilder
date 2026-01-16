import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

const COLORS = [
  { value: '#6366f1', name: 'indigo' },
  { value: '#ec4899', name: 'pink' },
  { value: '#8b5cf6', name: 'purple' },
  { value: '#10b981', name: 'green' },
  { value: '#f59e0b', name: 'amber' },
  { value: '#ef4444', name: 'red' },
  { value: '#3b82f6', name: 'blue' },
  { value: '#14b8a6', name: 'teal' },
];

export default function CreateFolderModal({ isOpen, onClose, onCreate }: CreateFolderModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setSelectedColor(COLORS[0].value);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onCreate(name.trim(), selectedColor);
        onClose();
      } catch (error) {
        console.error('Failed to create folder:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors group z-10"
                aria-label={t('dashboard.modal.close')}
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pr-8">
                  {t('dashboard.new_folder')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.modal.folder_name')}
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all outline-none text-base"
                      placeholder={t('dashboard.modal.folder_placeholder')}
                      required
                      autoFocus
                      maxLength={100}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {name.length}/100
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t('dashboard.modal.folder_color')}
                    </label>
                    <div className="grid grid-cols-8 gap-3">
                      {COLORS.map((color) => (
                        <motion.button
                          key={color.value}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedColor(color.value)}
                          disabled={isSubmitting}
                          className={`w-12 h-12 rounded-xl transition-all ${
                            selectedColor === color.value
                              ? 'ring-2 ring-offset-2 ring-gray-900 scale-110 shadow-md'
                              : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300'
                          }`}
                          style={{ backgroundColor: color.value }}
                          aria-label={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                      {t('dashboard.modal.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={!name.trim() || isSubmitting}
                      className="flex-1 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? t('dashboard.modal.creating') : t('dashboard.modal.create')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
