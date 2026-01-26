import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { Form } from '@/types';
import { useToast } from '@/components/ui/toaster';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export interface FormWithStats extends Form {
  responseCount: number;
  viewCount: number;
  _count?: { responses: number };
}

export function useDashboardForms() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [forms, setForms] = useState<FormWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadForms = useCallback(async () => {
    try {
      const response = await api.get('/forms');
      const formsData: FormWithStats[] =
        response.data?.forms || (Array.isArray(response.data) ? response.data : []);
      setForms(formsData);
    } catch (error) {
      console.error('Failed to load forms:', error);
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadForms();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, loadForms]);

  const createNewForm = async (onLoginRequired: () => void) => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }

    try {
      setIsCreating(true);
      const res = await api.post('/forms', {
        title: t('common.untitled_form'),
        description: '',
      });
      navigate(`/forms/${res.data.form.id}/builder`);
    } catch (error) {
      console.error('Failed to create form:', error);
      toast({
        variant: 'error',
        title: t('dashboard.toast.error'),
        description: t('dashboard.toast.error_create'),
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteForm = async (formId: string) => {
    try {
      await api.delete(`/forms/${formId}`);
      await loadForms();
      toast({
        variant: 'success',
        title: t('dashboard.toast.deleted'),
        description: t('dashboard.toast.deleted'),
      });
    } catch (error) {
      console.error('Failed to delete form:', error);
      toast({
        variant: 'error',
        title: t('dashboard.toast.error'),
        description: t('dashboard.toast.error_delete'),
      });
    }
  };

  const duplicateForm = async (formId: string) => {
    try {
      await api.post(`/forms/${formId}/clone`);
      await loadForms();
      toast({
        variant: 'success',
        title: t('dashboard.toast.duplicated'),
        description: t('dashboard.toast.duplicated'),
      });
    } catch (error) {
      console.error('Failed to clone form:', error);
      toast({
        variant: 'error',
        title: t('dashboard.toast.error'),
        description: t('dashboard.toast.error_duplicate'),
      });
    }
  };

  const copyFormLink = (formId: string) => {
    const url = `${window.location.origin}/forms/${formId}/view`;
    navigator.clipboard.writeText(url);
    toast({
      variant: 'success',
      title: t('dashboard.toast.link_copied'),
      description: t('dashboard.toast.link_copied'),
    });
  };

  return {
    forms,
    loading,
    isCreating,
    loadForms,
    createNewForm,
    deleteForm,
    duplicateForm,
    copyFormLink,
  };
}
