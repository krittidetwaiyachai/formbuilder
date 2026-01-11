import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Eye, Clock, FileText, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Form } from '@/types';
import UserAvatar from '@/components/common/UserAvatar';

interface FormDetailsModalProps {
  form: (Form & { collaborators?: any[]; createdBy?: any }) | null;
  onClose: () => void;
  onRequestLogin: () => void;
  onOpenCollaborators: () => void;
}

export default function FormDetailsModal({ form, onClose, onRequestLogin, onOpenCollaborators }: FormDetailsModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  if (!form) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      {form && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="pr-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        form.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                        {form.status}
                    </span>
                    {form.isQuiz && (
                         <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-100 text-purple-700 border border-purple-200">
                             Quiz Mode
                         </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 break-words leading-tight">
                    {form.title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="prose prose-sm max-w-none text-gray-600 mb-8 break-words whitespace-pre-wrap">
                  {form.description || <span className="italic text-gray-400">No description provided.</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Statistics</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <MessageSquare className="w-4 h-4" />
                                <span>Responses</span>
                            </div>
                            <span className="font-bold text-gray-900">{(form as any).responseCount || (form as any)._count?.responses || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Eye className="w-4 h-4" />
                                <span>Views</span>
                            </div>
                            <span className="font-bold text-gray-900">{(form as any).viewCount || 0}</span>
                        </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Timeline</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="block text-xs text-gray-400">Created</span>
                                <span className="font-medium text-gray-900">{formatDate((form as any).createdAt)}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="block text-xs text-gray-400">Last Updated</span>
                                <span className="font-medium text-gray-900">{formatDate((form as any).updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Collaborators */}
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={onOpenCollaborators}
                >
                    <div className="flex -space-x-2 overflow-hidden pl-1 pointer-events-none">
                        {([form.createdBy, ...(form.collaborators || [])].filter(Boolean) as any[]).map((editor, index) => (
                            <div key={index} className="relative z-10">
                                <UserAvatar 
                                  user={editor} 
                                  className="inline-block h-8 w-8 ring-2 ring-white shadow-sm"
                                  title={`Editor: ${editor.firstName || ''} ${editor.lastName || ''}`}
                                />
                            </div>
                        ))}
                    </div>
                    {([form.createdBy, ...(form.collaborators || [])].filter(Boolean)).length > 0 && (
                        <span className="text-xs text-gray-400 font-medium ml-2">
                            Editors
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            if (!isAuthenticated) {
                                onRequestLogin();
                            } else {
                                navigate(`/forms/${form.id}/builder`);
                            }
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        <FileText className="w-4 h-4 mr-2 text-gray-900" />
                        Edit
                    </button>
                    <button
                        onClick={() => window.open(`/forms/${form.id}/preview`, '_blank')}
                        className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                    </button>
                    <button
                        onClick={() => {
                            if (!isAuthenticated) {
                                onRequestLogin();
                            } else {
                                navigate(`/forms/${form.id}/responses`);
                            }
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        <BarChart3 className="w-4 h-4 mr-2 text-gray-900" />
                        Analytics
                    </button>
                    <button
                        onClick={() => {
                            if (!isAuthenticated) {
                                onRequestLogin();
                            } else {
                                navigate(`/forms/${form.id}/activity`);
                            }
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        <Clock className="w-4 h-4 mr-2 text-gray-900" />
                        Activity
                    </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
