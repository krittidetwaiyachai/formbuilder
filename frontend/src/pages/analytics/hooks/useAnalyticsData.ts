import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Form, FormResponse } from '@/types';

const PAGE_SIZE = 10;

export const useAnalyticsData = (id: string | undefined) => {
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]); 
  const [viewResponses, setViewResponses] = useState<FormResponse[]>([]); 
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [responsePage, setResponsePage] = useState(1);
  const [responseSort, setResponseSort] = useState<'desc' | 'asc'>('desc');

  const updateViewResponses = (allResponses: FormResponse[], page: number, sort: 'asc' | 'desc') => {
      const sorted = [...allResponses].sort((a, b) => {
          const dateA = new Date(a.submittedAt).getTime();
          const dateB = new Date(b.submittedAt).getTime();
          return sort === 'desc' ? dateB - dateA : dateA - dateB;
      });

      const total = sorted.length;
      const pages = Math.ceil(total / PAGE_SIZE) || 1;
      
      const startIndex = (page - 1) * PAGE_SIZE;
      const sliced = sorted.slice(startIndex, startIndex + PAGE_SIZE);

      setViewResponses(sliced);
      setTotalPages(pages);
  };

  const loadData = async () => {
    if (!id) return;
    try {
      
      const formRes = await api.get(`/forms/${id}`);
      const formData = formRes.data.form;
      setForm(formData);

      
      
      const responsesRes = await api.get(`/responses/form/${id}?limit=1000&sort=desc`);
      const responsesData = responsesRes.data?.data || responsesRes.data || [];
      const total = responsesRes.data?.meta?.total || responsesData.length;

      setResponses(responsesData);
      setTotalResponses(total);
      
      
      setResponsePage(1);
      setResponseSort('desc');
      updateViewResponses(responsesData, 1, 'desc');

      return { formData, responsesData };
    } catch (error) {
      console.error('Failed to load data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async (page: number, sort: 'asc' | 'desc') => {
    
    setLoadingResponses(true);
    
    
    await new Promise(resolve => setTimeout(resolve, 300));

    setResponsePage(page);
    setResponseSort(sort);
    updateViewResponses(responses, page, sort);
    
    setLoadingResponses(false);
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  return {
    form,
    responses, 
    viewResponses, 
    totalResponses,
    loading,
    loadingResponses,
    totalPages,
    responsePage,
    responseSort,
    setResponses, 
    setTotalResponses, 
    loadData,
    loadResponses,
  };
};
