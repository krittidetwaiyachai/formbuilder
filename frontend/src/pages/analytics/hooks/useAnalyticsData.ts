import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Form, FormResponse } from '@/types';
const PAGE_SIZE = 10;
export const useAnalyticsData = (id: string | undefined) => {
  const [form, setForm] = useState<Form | null>(null);
  const [viewResponses, setViewResponses] = useState<FormResponse[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [responsePage, setResponsePage] = useState(1);
  const [responseSort, setResponseSort] = useState<'desc' | 'asc'>('desc');
  const updateViewResponses = (data: FormResponse[], total: number) => {
    setViewResponses(data);
    setTotalPages(Math.ceil(total / PAGE_SIZE) || 1);
  };

  const loadData = async () => {
    if (!id) return;
    try {
      const formRes = await api.get(`/forms/${id}`);
      const formData = formRes.data.form;
      setForm(formData);

      // Load distinct page 1
      setResponsePage(1);
      setResponseSort('desc');

      const firstPageRes = await api.get(`/responses/form/${id}?page=1&limit=${PAGE_SIZE}&sort=desc`);
      const viewData = firstPageRes.data?.data || firstPageRes.data || [];
      const total = firstPageRes.data?.meta?.total || 0;

      setTotalResponses(total);
      updateViewResponses(viewData, total);

      return { formData };
    } catch (error) {
      console.error('Failed to load data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const loadResponses = async (page: number, sort: 'asc' | 'desc') => {
    if (!id) return;
    setLoadingResponses(true);
    setResponsePage(page);
    setResponseSort(sort);

    try {
      const pageRes = await api.get(`/responses/form/${id}?page=${page}&limit=${PAGE_SIZE}&sort=${sort}`);
      const viewData = pageRes.data?.data || pageRes.data || [];
      const total = pageRes.data?.meta?.total || totalResponses;

      setTotalResponses(total);
      updateViewResponses(viewData, total);
    } catch (error) {
      console.error('Failed to fetch page', error);
    } finally {
      setLoadingResponses(false);
    }
  };
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);
  return {
    form,
    viewResponses,
    totalResponses,
    loading,
    loadingResponses,
    totalPages,
    responsePage,
    responseSort,
    setTotalResponses,
    loadData,
    loadResponses
  };
};