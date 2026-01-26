import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Edit2, Undo2, Redo2, Eye, Share2, Copy, ExternalLink, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Form, FormStatus } from '@/types';
import { useFormStore } from '@/store/formStore';
import { useAuthStore } from '@/store/authStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CollaboratorListModal from '@/components/dashboard/CollaboratorListModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/custom-select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import QRCode from 'react-qr-code';
import { useTranslation } from 'react-i18next';
import UserAvatar from '@/components/common/UserAvatar';
import Loader from '@/components/common/Loader';
import { useToast } from '@/components/ui/toaster';

interface FormBuilderHeaderProps {
  currentForm: Form | null;
  saving: boolean;
  lastSaved: Date | null;
  message: { type: 'success' | 'error'; text: string } | null;
  handleSave: (isAutoSave: boolean) => Promise<void>;
  updateForm: (updates: Partial<Form>) => void;
}


function fallbackCopyTextToClipboard(text: string, onSuccess?: () => void) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
        if (onSuccess) onSuccess();
    } else {
        console.error('Fallback: unable to copy');
    }
  } catch (err) {
    console.error('Fallback: oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

export default function FormBuilderHeader({
  currentForm,
  saving,
  lastSaved,

  handleSave,
  updateForm
}: FormBuilderHeaderProps) {
  const navigate = useNavigate();
  const { undo, redo, historyIndex, history } = useFormStore();
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();
  const { t } = useTranslation();
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const titleEditRef = React.useRef<HTMLDivElement>(null);



  
  useEffect(() => {
    if (isEditingTitle) {
      const handleClickOutside = (event: MouseEvent) => {
        if (titleEditRef.current && !titleEditRef.current.contains(event.target as Node)) {
          handleTitleCancel();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditingTitle]);

  
  useEffect(() => {
    if (currentForm) {
      setTitleValue(currentForm.title);
    }
  }, [currentForm?.title]);


  const handleTitleEdit = () => {
    if (!currentForm) return;
    setTitleValue(currentForm.title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      updateForm({ title: titleValue.trim() });
      setIsEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setTitleValue(currentForm?.title || '');
    setIsEditingTitle(false);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      
      { }
      <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between gap-3">
        
        { }
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isEditingTitle ? (
              <div 
                  ref={titleEditRef}
                  className="flex items-center gap-2 w-full max-w-[300px]"
              >
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') handleTitleCancel();
                    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                      e.stopPropagation();
                    }
                  }}
                  className="text-lg md:text-xl font-bold text-black border-b-2 border-black px-1 py-0.5 w-full bg-transparent focus:outline-none rounded-none"
                  autoFocus
                />
                <button onClick={handleTitleSave} className="text-green-600 p-1"><Check className="h-4 w-4" /></button>
                <button onClick={handleTitleCancel} className="text-red-500 p-1"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0 group cursor-pointer" onClick={handleTitleEdit}>
                <h1 className="text-lg md:text-xl font-bold text-black truncate" >
                  {currentForm?.title || t('builder.header.untitled_form')}
                </h1>
                <Edit2 className="h-3.5 w-3.5 text-gray-400 group-hover:text-black opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            )}
          </div>
        </div>

        { }
        <div className="flex items-center gap-2 md:gap-3">
            
           { }
           <div className="flex items-center">
             {saving ? (
                 <div className="w-8 h-8 flex items-center justify-center">
                     <Loader size={16} />
                 </div>
             ) : (
                 <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600">
                     <Check className="h-4 w-4" />
                 </div>
             )}
             <span className="hidden md:inline text-xs text-gray-400 ml-2">
                 {saving ? t('builder_header.saving') : (
                    <span>
                       {t('builder_header.all_saved')}
                       {lastSaved && ` ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`}
                    </span>
                 )}
             </span>
           </div>

           <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block" />

           { }
           <div className="hidden md:flex items-center gap-2 group">
               { }
               <div className="flex items-center gap-1">
                    <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30 transition-colors">
                        <Undo2 className="h-4 w-4"/>
                    </button>
                    <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30 transition-colors">
                        <Redo2 className="h-4 w-4"/>
                    </button>
               </div>
               
               <div className="h-6 w-px bg-gray-200 mx-1" />
               
               { }
               {currentUser && (
                   (() => {
                       const collaborators = currentForm?.collaborators || [];
                       const allUsers = [currentUser, ...collaborators];
                       const visibleUsers = allUsers.slice(0, 3);
                       
                       return (
                           <div className="flex items-center">
                               <div 
                                   className="flex -space-x-3 overflow-hidden items-center cursor-pointer"
                                   onClick={() => setIsCollaboratorModalOpen(true)}
                                   title={t('builder.header.manage_access')}
                               >
                                   {visibleUsers.map((user, index) => (
                                       <div key={user?.id || index} className="relative transition-transform hover:scale-110 hover:z-20" style={{ zIndex: index }}>
                                           <UserAvatar 
                                               user={user} 
                                               className="h-8 w-8 ring-2 ring-white shadow-sm"
                                               title={user?.email || 'User'}
                                           />
                                       </div>
                                   ))}
                                   <div className="relative z-10 flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 ring-2 ring-white shadow-sm text-gray-500 hover:bg-gray-200 transition-colors">
                                       <Plus className="w-4 h-4" />
                                   </div>
                               </div>
                           </div>
                       );
                   })()
               )}
           </div>

           { }
           <div className="flex items-center gap-2">
               { }
               {currentForm && (
                   <Select
                       value={currentForm.status}
                       onValueChange={(value: FormStatus) => updateForm({ status: value })}
                   >
                       <SelectTrigger className="h-9 w-[110px] md:w-[130px] bg-white border-gray-200">
                           <SelectValue />
                       </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={FormStatus.DRAFT}>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <span>{t('common.status.draft')}</span>
                                </div>
                            </SelectItem>
                            <SelectItem value={FormStatus.PUBLISHED}>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span>{t('common.status.published')}</span>
                                </div>
                            </SelectItem>
                            <SelectItem value={FormStatus.ARCHIVED}>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                                    <span>{t('common.status.archived')}</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                   </Select>
               )}
               
               <button
                  onClick={() => window.open(`/forms/${currentForm?.id}/preview`, '_blank')}
                  className="h-9 w-9 md:w-auto md:px-4 md:py-2 flex items-center justify-center gap-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all bg-white text-gray-700 font-medium"
                  title={t('builder_header.preview')}
               >
                  <Eye className="h-4 w-4" />
                  <span className="hidden md:inline">{t('builder_header.preview')}</span>
               </button>

               <button
                  onClick={() => {
                    handleSave(true);
                    setIsShareOpen(true);
                  }}
                  className="h-9 w-9 md:w-auto md:px-4 md:py-2 flex items-center justify-center gap-2 rounded-lg bg-black hover:bg-zinc-800 text-white font-medium shadow-sm transition-all"
                  title={t('builder_header.share')}
               >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden md:inline">{t('builder_header.share')}</span>
               </button>
           </div>

        </div>

        { }
        <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
            <DialogContent className="sm:max-w-md bg-white">
              <button
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                onClick={() => setIsShareOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{t('builder.header.close')}</span>
              </button>
              <DialogHeader>
                <DialogTitle>{t('builder_header.share_title')}</DialogTitle>
                <DialogDescription>
                  {t('builder_header.share_description')}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/forms/${currentForm?.id}/view`}
                    className="h-9"
                  />
                </div>
                <Button 
                   type="button"
                   variant="outline"
                   size="sm"
                   className="px-3"
                   onClick={() => window.open(`${window.location.origin}/forms/${currentForm?.id}/view`, '_blank')}
                   title={t('builder.header.open_new_tab')}
                >
                   <ExternalLink className="h-4 w-4" />
                </Button>
                
                <div className="relative">
                    { }
                    <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded shadow-lg transition-all duration-200 pointer-events-none whitespace-nowrap ${isCopied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        {t('common.copied')}
                        { }
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                    </div>

                    <Button 
                        type="button" 
                        size="sm" 
                        className="px-3" 
                        onClick={() => {
                            const url = `${window.location.origin}/forms/${currentForm?.id}/view`;
                            
                            const handleSuccess = () => {
                                setIsCopied(true);
                                setTimeout(() => setIsCopied(false), 2000);
                            };

                            if (navigator.clipboard && window.isSecureContext) {
                                navigator.clipboard.writeText(url)
                                    .then(handleSuccess)
                                    .catch(() => {
                                        fallbackCopyTextToClipboard(url, handleSuccess);
                                    });
                            } else {
                                fallbackCopyTextToClipboard(url, handleSuccess);
                            }
                        }}
                    >
                        <span className="sr-only">{t('builder.header.copy')}</span>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
              </div>
              <div className="flex justify-center py-6">
                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200">
                    <QRCode
                        value={`${window.location.origin}/forms/${currentForm?.id}/view`}
                        size={200}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {currentForm && (
            <CollaboratorListModal
              isOpen={isCollaboratorModalOpen}
              onClose={() => setIsCollaboratorModalOpen(false)}
              formId={currentForm.id}
              formTitle={currentForm.title}
              collaborators={[
                ...(currentForm.createdBy ? [currentForm.createdBy] : []),
                ...(currentForm.collaborators || [])
              ]}
              onUpdate={() => {}}
            />
          )}

      </div>
    </div>
  );
}
