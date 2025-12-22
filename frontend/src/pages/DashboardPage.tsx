import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  FileText,
  Eye,
  BarChart3,
  MessageSquare,
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
} from 'lucide-react';
import api from '@/lib/api';
import { Form } from '@/types';

interface FormWithStats extends Form {
  responseCount?: number;
  viewCount?: number;
  _count?: {
    responses: number;
  };
}

export default function DashboardPage() {
  const [forms, setForms] = useState<FormWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  // Prevent text selection (Ctrl+A) globally on this page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+A (Cmd+A on Mac) - but allow in input fields
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const target = e.target as HTMLElement;
        // Allow Ctrl+A in input, textarea, and contenteditable elements
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  const loadForms = async () => {
    try {
      const response = await api.get('/forms');
      // Backend returns { forms: [...] } or array directly
      const formsData = response.data?.forms || (Array.isArray(response.data) ? response.data : []);
      setForms(formsData);
    } catch (error) {
      console.error('Failed to load forms:', error);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const createNewForm = async () => {
    // สร้าง form ใน local state ก่อน ไม่เซฟอัตโนมัติ
    const tempId = `temp-${Date.now()}`;
    window.location.href = `/forms/${tempId}/builder?new=true`;
  };

  const handleDeleteForm = async (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/forms/${formId}`);
      loadForms(); // Reload forms after deletion
    } catch (error) {
      console.error('Failed to delete form:', error);
      alert('Failed to delete form. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto bg-white select-none" onKeyDown={(e) => {
      // Prevent Ctrl+A (Cmd+A on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        e.stopPropagation();
      }
    }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage and create your forms
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search forms by title or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <select className="px-3 py-2 border border-gray-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black">
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
          <select className="px-3 py-2 border border-gray-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black">
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Most Views</option>
            <option>Most Responses</option>
          </select>
          <button
            onClick={createNewForm}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Form
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Showing {forms.length} of {forms.length} forms
      </p>

      {forms.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-black">No forms</h3>
          <p className="mt-1 text-sm text-gray-600">
            Get started by creating a new form.
          </p>
          <div className="mt-6">
            <button
              onClick={createNewForm}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => {
            const responseCount = form.responseCount || form._count?.responses || 0;
            const viewCount = form.viewCount || 0;

            return (
              <div
                key={form.id}
                className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-1">
                        {form.title}
                      </h3>
                      <p className="text-sm text-gray-600">{form.description || 'No description'}</p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteForm(form.id, e)}
                      className="ml-2 text-black hover:text-gray-700 p-1"
                      title="Delete form"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        form.status === 'PUBLISHED'
                          ? 'bg-gray-200 text-black'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {form.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1.5" />
                      <span>{responseCount} responses</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1.5" />
                      <span>{viewCount} views</span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-gray-600 mb-4">
                    <Calendar className="h-3 w-3 mr-1.5" />
                    <span>Updated {formatDate(form.updatedAt)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-300">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/forms/${form.id}/builder`}
                      className="flex items-center justify-center px-3 py-2 text-sm font-medium text-black bg-white border border-gray-400 rounded-md hover:bg-gray-100"
                    >
                      <FileText className="h-4 w-4 mr-1.5" />
                      Edit
                    </Link>
                    <Link
                      to={`/forms/${form.id}/preview`}
                      className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                    >
                      Preview
                    </Link>
                    <Link
                      to={`/forms/${form.id}/responses`}
                      className="flex items-center justify-center px-3 py-2 text-sm font-medium text-black bg-white border border-gray-400 rounded-md hover:bg-gray-100"
                    >
                      <BarChart3 className="h-4 w-4 mr-1.5" />
                      Analytics
                    </Link>
                    <Link
                      to={`/forms/${form.id}/activity`}
                      className="flex items-center justify-center px-3 py-2 text-sm font-medium text-black bg-white border border-gray-400 rounded-md hover:bg-gray-100"
                    >
                      <Clock className="h-4 w-4 mr-1.5" />
                      Activity
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
