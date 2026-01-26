import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MobileFormCard from './MobileFormCard';
import MobileActionSheet from './MobileActionSheet';
import { Form } from '@/types';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCcw, FileX } from 'lucide-react';

interface MobileFormsSectionProps {
  forms: (Form & { responseCount?: number; viewCount?: number; _count?: { responses: number } })[];
  onCreateForm: () => void;
  isCreating: boolean;
  loading?: boolean;
  onRefresh?: () => Promise<void>;
  onDelete: (id: string) => void;
  onMove: (id: string) => void;
}

export default function MobileFormsSection({
  forms,
  onCreateForm,
  isCreating,
  loading = false,
  onRefresh,
  onDelete,
  onMove
}: MobileFormsSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedForm, setSelectedForm] = useState<{ id: string; title: string } | null>(null);
  
  
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY > 0 && containerRef.current && containerRef.current.scrollTop <= 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      if (diff > 0) {
        
        
        setPullDistance(Math.min(diff * 0.4, 80)); 
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && onRefresh) {
      setIsRefreshing(true);
      setPullDistance(0); 
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setStartY(0);
      }
    } else {
      setPullDistance(0);
      setStartY(0);
    }
  };

  return (
    <div 
      className="md:hidden flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24 overscroll-y-contain"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      { }
      <div 
        className="flex justify-center items-center overflow-hidden transition-all duration-200"
        style={{ height: isRefreshing ? 50 : pullDistance, opacity: pullDistance / 60 }}
      >
        <div className={`p-2 rounded-full bg-white shadow-md ${isRefreshing ? 'animate-spin' : ''}`}>
           <RefreshCcw className="w-5 h-5 text-black" style={{ transform: `rotate(${pullDistance * 2}deg)` }} />
        </div>
      </div>

      <button
        onClick={onCreateForm}
        disabled={isCreating}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-black text-white font-semibold text-base active:scale-[0.98] active:bg-gray-900 transition-all disabled:opacity-50 shadow-lg shadow-black/10"
      >
        <Plus className="w-5 h-5" />
        {t('dashboard.create_form')}
      </button>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
             <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                   <div className="w-11 h-11 bg-gray-100 rounded-xl flex-shrink-0"></div>
                   <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                   </div>
                </div>
             </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {forms.map((form, index) => (
            <motion.div
              key={form.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <MobileFormCard
                form={form}
                onCardClick={() => setSelectedForm({ id: form.id, title: form.title })}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {!loading && forms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mb-5">
             <FileX className="w-9 h-9 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-800 text-base mb-1.5">{t('dashboard.empty.no_forms')}</p>
          <p className="text-sm text-gray-400 px-8 leading-relaxed">{t('dashboard.empty.description')}</p>
        </div>
      )}

      <MobileActionSheet
        isOpen={!!selectedForm}
        onClose={() => setSelectedForm(null)}
        formId={selectedForm?.id || ''}
        formTitle={selectedForm?.title || ''}
        onEdit={() => navigate(`/forms/${selectedForm?.id}/builder`)}
        onPreview={() => window.open(`/forms/${selectedForm?.id}/preview`, '_blank')}
        onAnalytics={() => navigate(`/forms/${selectedForm?.id}/analytics`)}
        onActivity={() => navigate(`/forms/${selectedForm?.id}/activity`)}
        onDelete={() => selectedForm && onDelete(selectedForm.id)}
        onMove={() => selectedForm && onMove(selectedForm.id)}
      />
    </div>
  );
}

