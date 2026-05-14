import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFormStore } from '@/store/formStore';
import { FormStatus } from '@/types';
import { generateUUID } from '@/utils/uuid';
export const useFormLoad = (id: string | undefined) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const isNewForm = searchParams.get('new') === 'true';
  const { loadForm, setCurrentForm } = useFormStore();
  const [loadingError, setLoadingError] = useState<string | null>(null);
  useEffect(() => {
    if (id) {
      if (isNewForm && id.startsWith('temp-')) {
        setCurrentForm({
          id: id,
          title: 'Untitled Form',
          description: '',
          status: FormStatus.DRAFT,
          isQuiz: false,
          fields: [],
          conditions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdById: '',
          pageSettings: [{ id: generateUUID(), title: 'Page 1' }]
        });
      } else {
        loadForm(id).catch((error: unknown) => {
          console.error('Error loading form:', error);
          const err = error as {code?: string;message?: string;response?: {status: number;};};
          if (err.code === 'ERR_NETWORK' || err.message?.includes('CONNECTION_REFUSED')) {
            setLoadingError(t('builder.toast.load_error') + ' (Network Error)');
          } else if (err.response?.status === 403) {
            setLoadingError(t('builder.access_denied_msg'));
          } else {
            setLoadingError(t('builder.toast.load_error'));
          }
        });
      }
    }
  }, [id, isNewForm, loadForm, setCurrentForm, t]);
  return { loadingError };
};