import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { Folder } from '@/types/folder';
import { useAuthStore } from '@/store/authStore';

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const loadFolders = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setFolders([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/folders');
      setFolders(response.data || []);
    } catch (error: any) {
      console.error('Failed to load folders:', error);
      setError(error?.response?.data?.message || 'Failed to load folders');
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const createFolder = async (name: string, color: string) => {
    try {
      setError(null);
      const response = await api.post('/folders', { name, color });
      const newFolder = response.data;
      setFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (error: any) {
      console.error('Failed to create folder:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to create folder';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateFolder = async (id: string, name?: string, color?: string) => {
    try {
      setError(null);
      const response = await api.patch(`/folders/${id}`, { name, color });
      const updatedFolder = response.data;
      setFolders(prev => prev.map(f => f.id === id ? updatedFolder : f));
      return updatedFolder;
    } catch (error: any) {
      console.error('Failed to update folder:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to update folder';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      setError(null);
      await api.delete(`/folders/${id}`);
      setFolders(prev => prev.filter(f => f.id !== id));
    } catch (error: any) {
      console.error('Failed to delete folder:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to delete folder';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const moveFormToFolder = async (formId: string, folderId: string | null) => {
    try {
      setError(null);
      await api.put(`/folders/move-form/${formId}`, { folderId });
      // Refresh folders to update form counts
      await loadFolders();
    } catch (error: any) {
      console.error('Failed to move form:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to move form';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    folders,
    loading,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
    moveFormToFolder,
    refreshFolders: loadFolders,
  };
}
