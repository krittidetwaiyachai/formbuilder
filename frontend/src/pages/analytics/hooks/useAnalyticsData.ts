import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Form, FormResponse } from '@/types';
const PAGE_SIZE = 10;

const compareResponsesBySort = (
  a: FormResponse,
  b: FormResponse,
  sort: 'asc' | 'desc'
) => {
  const submittedDiff =
    new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  if (submittedDiff !== 0) {
    return sort === 'asc' ? submittedDiff : -submittedDiff;
  }

  const createdDiff =
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  if (createdDiff !== 0) {
    return sort === 'asc' ? createdDiff : -createdDiff;
  }

  return sort === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
};

const sortResponsesForView = (
  responses: FormResponse[],
  sort: 'asc' | 'desc'
) => [...responses].sort((a, b) => compareResponsesBySort(a, b, sort));

export const useAnalyticsData = (id: string | undefined) => {
  const [form, setForm] = useState<Form | null>(null);
  const [viewResponses, setViewResponses] = useState<FormResponse[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [responsePage, setResponsePage] = useState(1);
  const [responseSort, setResponseSort] = useState<'desc' | 'asc'>('desc');
  const updateViewResponses = (
    data: FormResponse[],
    total: number,
    sort: 'asc' | 'desc'
  ) => {
    setViewResponses(sortResponsesForView(data, sort));
    setTotalPages(Math.ceil(total / PAGE_SIZE) || 1);
  };
  const loadData = async () => {
    if (!id) return;
    try {
      const formRes = await api.get(`/forms/${id}`);
      const formData = formRes.data.form;
      setForm(formData);
      setResponsePage(1);
      setResponseSort('desc');
      const firstPageRes = await api.get(`/responses/form/${id}?page=1&limit=${PAGE_SIZE}&sort=desc`);
      const viewData = firstPageRes.data?.data || firstPageRes.data || [];
      const total = firstPageRes.data?.meta?.total || 0;
      setTotalResponses(total);
      updateViewResponses(viewData, total, 'desc');
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
      updateViewResponses(viewData, total, sort);
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
