import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { Form } from '@/types';
import { FileQuestion } from 'lucide-react';
import PublicFormRenderer from '@/components/public-form/PublicFormRenderer';
import Loader from '@/components/common/Loader';

export default function PublicForm() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (form?.settings?.backgroundColor) {
      const bgColor = form.settings.backgroundColor;
      document.documentElement.style.backgroundColor = bgColor;
      document.body.style.backgroundColor = bgColor;
    }
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, [form?.settings?.backgroundColor]);

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  const generateFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('fingerprint', 2, 2);
    }
    const canvasData = canvas.toDataURL();
    
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvasData.slice(0, 50),
    ].join('|');
    
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  const loadForm = async () => {
    try {
      const fingerprint = generateFingerprint();
      const ua = encodeURIComponent(navigator.userAgent);
      const response = await api.get(`/forms/${id}/public?fingerprint=${fingerprint}&ua=${ua}`);
      setForm(response.data.form);
    } catch (error) {
      console.error('Failed to load form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader className="mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t('public.loading')}</p>
        </motion.div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FileQuestion className="h-8 w-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('public.form_not_found_title')}</h2>
          <p className="text-gray-600">{t('public.form_not_found_desc')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-0 transition-colors duration-500"
        style={{ 
          backgroundColor: form.settings?.backgroundColor || '#ffffff',
          backgroundImage: form.settings?.backgroundType === 'image' && form.settings?.backgroundImage ? `url(${form.settings.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div 
        className="relative z-10 min-h-screen w-full overflow-y-auto overflow-x-hidden"
        style={{ fontFamily: form.settings?.fontFamily || 'inherit' }}
      >
        <PublicFormRenderer form={form} loading={loading} />
      </div>
    </>
  );
}
