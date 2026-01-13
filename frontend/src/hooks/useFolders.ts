import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Folder } from '@/types/folder';
import { useAuthStore } from '@/store/authStore';

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  const loadFolders = async () => {
    if (!isAuthenticated) {
        setLoading(false);
        return;
    }
    
    try {
      const response = await api.get('/folders');
      setFolders(response.data || []);
    } catch (error) {
      console.error('Failed to load folders:', error);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        loadFolders();
    } else {
        setLoading(false);
        setFolders([]);
    }
  }, [isAuthenticated]);

  const createFolder = async (name: string, color: string) => {
    try {
      const response = await api.post('/folders', { name, color });
      setFolders(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  };

  const updateFolder = async (id: string, name?: string, color?: string) => {
    try {
      const response = await api.patch(`/folders/${id}`, { name, color });
      setFolders(prev => prev.map(f => f.id === id ? response.data : f));
      return response.data;
    } catch (error) {
      console.error('Failed to update folder:', error);
      throw error;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      await api.delete(`/folders/${id}`);
      setFolders(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    }
  };

  const moveFormToFolder = async (formId: string, folderId: string | null) => {
    try {
      await api.put(`/folders/move-form/${formId}`, { folderId });
    } catch (error) {
      console.error('Failed to move form:', error);
      throw error;
    }
  };

  return {
    folders,
    loading,
    createFolder,
    updateFolder,
    deleteFolder,
    moveFormToFolder,
    refreshFolders: loadFolders,
  };
}
