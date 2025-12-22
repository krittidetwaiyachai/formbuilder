import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import api from '@/lib/api';
import { FormResponse } from '@/types';

export default function ResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadResponses();
    }
  }, [id]);

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

  const loadResponses = async () => {
    try {
      const response = await api.get(`/responses/form/${id}`);
      setResponses(response.data || []);
    } catch (error) {
      console.error('Failed to load responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/responses/form/${id}/export/csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `responses_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-8 bg-white select-none" onKeyDown={(e) => {
      // Prevent Ctrl+A (Cmd+A on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        e.stopPropagation();
      }
    }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Form Responses</h1>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {responses.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-300 p-12 text-center">
          <p className="text-gray-600">No responses yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Submitted At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Answers
                </th>
                {responses[0]?.form?.isQuiz && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Percentage
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {responses.map((response) => (
                <tr key={response.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {new Date(response.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {response.answers?.length || 0} answers
                  </td>
                  {response.form?.isQuiz && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {response.score || 0} / {response.totalScore || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {response.totalScore
                          ? ((response.score || 0) / response.totalScore * 100).toFixed(1)
                          : 0}%
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

