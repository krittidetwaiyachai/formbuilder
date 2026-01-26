import React, { useState } from 'react';
import { X, Mail, User, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from '@/components/common/UserAvatar';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Collaborator {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  photoUrl?: string;
  role?: string;
}

interface CollaboratorListModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: Collaborator[];
  formTitle: string;
  formId: string;
  onUpdate: () => void;
}

export default function CollaboratorListModal({
  isOpen,
  onClose,
  collaborators,
  formTitle,
  formId,
  onUpdate,
}: CollaboratorListModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user: currentUser } = useAuthStore();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post(`/forms/${formId}/collaborators`, { email });
      setSuccess(t('dashboard.collaborators.invite_success'));
      setEmail('');
      onUpdate();
    } catch (err: any) {
      console.error('Failed to invite:', err);
      setError(err.response?.data?.message || t('dashboard.collaborators.invite_error'));
    } finally {
      setLoading(false);
    }
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<string | null>(null);

  const handleRemove = async (userId: string) => {
    setCollaboratorToRemove(userId);
    setDeleteConfirmOpen(true);
  };

  const confirmRemove = async () => {
    if (!collaboratorToRemove) return;
    
    setLoading(true);
    try {
      await api.delete(`/forms/${formId}/collaborators/${collaboratorToRemove}`);
      onUpdate();
    } catch (err: any) {
      console.error('Failed to remove:', err);
      setError(err.response?.data?.message || t('dashboard.collaborators.remove_error'));
    } finally {
      setLoading(false);
      setCollaboratorToRemove(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          { }
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('dashboard.collaborators.manage_access')}</h3>
              <p className="text-xs text-gray-500 truncate max-w-[250px]">
                {formTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
             { }
             <div className="p-5 border-b border-gray-100">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">
                    {t('dashboard.collaborators.add_people')}
                </label>
                <form onSubmit={handleInvite} className="flex gap-2">
                    <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('dashboard.collaborators.email_placeholder')}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !email}
                        className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {loading ? '...' : t('dashboard.collaborators.invite')}
                    </button>
                </form>

                { }
                <AnimatePresence mode='wait'>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 mt-3 text-xs text-red-600 bg-red-50 p-2 rounded-md"
                        >
                            <AlertCircle className="w-3.5 h-3.5" />
                            {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 mt-3 text-xs text-green-600 bg-green-50 p-2 rounded-md"
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>

             { }
             <div className="p-2">
                <label className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block mt-2">
                    {t('dashboard.collaborators.current_access')} ({collaborators.length})
                </label>
                {collaborators.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <User className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>{t('dashboard.collaborators.no_collaborators')}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {collaborators.map((user, index) => {
                       const isOwner = index === 0; 
                       const isMe = user.id === currentUser?.id;
                       
                       return (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={index} 
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                      >
                        { }
                        <div className="flex-shrink-0">
                          <UserAvatar 
                            user={user} 
                            className="w-10 h-10 rounded-full border border-gray-200 object-cover shadow-sm"
                          />
                        </div>

                        { }
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate flex items-center gap-2">
                            {user.firstName} {user.lastName}
                            {isOwner && <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200">{t('dashboard.collaborators.owner')}</span>}
                            {isMe && <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full border border-indigo-100">{t('dashboard.collaborators.you')}</span>}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{user.email || t('dashboard.collaborators.no_email')}</span>
                          </div>
                        </div>

                        { }
                        {!isOwner && (
                           <button
                             onClick={() => user.id && handleRemove(user.id)}
                             title={t('dashboard.collaborators.remove_access')}
                             className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        )}
                      </motion.div>
                    )})}
                  </div>
                )}
             </div>
          </div>
        </motion.div>
      </div>
      
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('dashboard.collaborators.remove_confirm_title')}
        description={t('dashboard.collaborators.remove_confirm')}
        onConfirm={confirmRemove}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
      />
    </AnimatePresence>
  );
}
