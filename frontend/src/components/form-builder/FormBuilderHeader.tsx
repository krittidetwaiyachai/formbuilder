import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Edit2, Undo2, Redo2, Eye, Share2, Copy, ExternalLink, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Form, FormStatus } from '@/types';
import { useFormStore } from '@/store/formStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CollaboratorListModal from '@/components/dashboard/CollaboratorListModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/custom-select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import QRCode from 'react-qr-code';
import { useTranslation } from 'react-i18next';

interface FormBuilderHeaderProps {
  currentForm: Form | null;
  saving: boolean;
  lastSaved: Date | null;
  message: { type: 'success' | 'error'; text: string } | null;
  handleSave: (isAutoSave: boolean) => Promise<void>;
  updateForm: (updates: Partial<Form>) => void;
}

export default function FormBuilderHeader({
  currentForm,
  saving,
  lastSaved,
  message,
  handleSave,
  updateForm
}: FormBuilderHeaderProps) {
  const navigate = useNavigate();
  const { undo, redo, historyIndex, history } = useFormStore();
  const { t } = useTranslation();
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);

  const titleEditRef = React.useRef<HTMLDivElement>(null);



  // Handle click outside to cancel editing
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

  // Sync title value when form updates
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
    <div className="bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div 
                  ref={titleEditRef}
                  className="flex items-center gap-2"
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
                  className="text-xl font-bold text-black border border-gray-400 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-black select-text"
                  autoFocus
                />
                <button
                  onClick={handleTitleSave}
                  className="text-black hover:text-gray-700 p-1"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleTitleCancel}
                  className="text-black hover:text-gray-700 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 
                  onClick={handleTitleEdit}
                  className="text-xl font-bold text-black cursor-pointer hover:text-gray-700"
                  title="Click to edit title"
                >
                  {currentForm?.title || 'Loading...'}
                </h1>
                <button
                  onClick={handleTitleEdit}
                  className="text-gray-500 hover:text-black p-1"
                  title="Edit title"
                  disabled={!currentForm}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <div
              className={`px-4 py-2 rounded-md text-sm ${
                message.type === 'success'
                  ? 'bg-gray-200 text-black'
                  : 'bg-gray-100 text-black'
              }`}
            >
              {message.text}
            </div>
          )}
          <div className="flex items-center text-sm mr-2">
            {saving ? (
              <span className="text-gray-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                {t('builder_header.saving')}
              </span>
            ) : !currentForm ? (
              <span className="text-gray-500 flex items-center gap-2">
                 <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                 {t('builder_header.loading')}
              </span>
            ) : lastSaved ? (
              <span className="text-gray-500 flex items-center">
                {t('builder_header.all_saved')} {lastSaved.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}
                <div className="ml-1.5 p-0.5 rounded-full bg-green-100">
                   <Check className="h-3 w-3 text-green-600" />
                </div>
              </span>
            ) : currentForm?.updatedAt ? (
              <span className="text-gray-500 flex items-center">
                {t('builder_header.last_saved')} {new Date(currentForm.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}
                <div className="ml-1.5 p-0.5 rounded-full bg-green-100">
                   <Check className="h-3 w-3 text-green-600" />
                </div>
              </span>
            ) : (
              <span className="text-gray-400 flex items-center">
                {t('builder_header.not_saved')}
              </span>
            )}
          </div>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          {/* Status Dropdown */}
          <div className="mr-2 w-32">
            <Select 
                value={currentForm?.status || 'DRAFT'} 
                onValueChange={(value) => updateForm({ status: value as FormStatus })}
            >
                <SelectTrigger className="h-8 text-xs font-semibold bg-gray-100 border-none hover:bg-gray-200 focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder={t('dashboard.filters.all')} />
                </SelectTrigger>
                <SelectContent>
                    {[
                        { label: t('dashboard.filters.draft'), value: FormStatus.DRAFT },
                        { label: t('dashboard.filters.published'), value: FormStatus.PUBLISHED },
                        { label: t('dashboard.filters.archived'), value: FormStatus.ARCHIVED }
                    ].map((status) => (
                        <SelectItem key={status.value} value={status.value} className="text-xs font-medium">
                            {status.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          {/* Collaborators Section */}
          <div className="flex items-center gap-2 mr-2">
            <div className="flex items-center -space-x-2">
              {/* Owner Avatar */}
              {currentForm?.createdBy && (
                <div 
                  className="relative w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm hover:z-10 transition-all hover:scale-110"
                  title={`${currentForm.createdBy.firstName || ''} ${currentForm.createdBy.lastName || ''} (Owner)`.trim() || currentForm.createdBy.email}
                >
                  {currentForm.createdBy.photoUrl ? (
                    <img src={currentForm.createdBy.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{(currentForm.createdBy.firstName?.[0] || currentForm.createdBy.email?.[0] || '?').toUpperCase()}</span>
                  )}
                </div>
              )}
              
              {/* Collaborator Avatars (max 3) */}
              {(currentForm?.collaborators || []).slice(0, 3).map((collaborator: any) => (
                <div 
                  key={collaborator.id}
                  className="relative w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm hover:z-10 transition-all hover:scale-110"
                  title={`${collaborator.firstName || ''} ${collaborator.lastName || ''}`.trim() || collaborator.email}
                >
                  {collaborator.photoUrl ? (
                    <img src={collaborator.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{(collaborator.firstName?.[0] || collaborator.email?.[0] || '?').toUpperCase()}</span>
                  )}
                </div>
              ))}

              {/* More Collaborators Count Badge */}
              {(currentForm?.collaborators || []).length > 3 && (
                <div 
                  className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold shadow-sm"
                  title={`+${(currentForm?.collaborators || []).length - 3} more`}
                >
                  +{(currentForm?.collaborators || []).length - 3}
                </div>
              )}
            </div>

            {/* Add Collaborator Button */}
            <button
              onClick={() => setIsCollaboratorModalOpen(true)}
              className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 hover:border-black flex items-center justify-center text-gray-400 hover:text-black transition-all hover:bg-gray-50"
              title={t('builder_header.invite_collaborators')}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1.5 text-gray-400 hover:text-black rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('builder_header.undo')}
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 text-gray-400 hover:text-black rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('builder_header.redo')}
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => window.open(`/forms/${currentForm?.id}/preview`, '_blank')}
            className="inline-flex items-center px-3 py-1.5 border border-gray-400 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-100"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            {t('builder_header.preview')}
          </button>
          <button
            onClick={() => {
                handleSave(true);
                setIsShareOpen(true);
            }}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            {t('builder_header.share')}
          </button>

          <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
            <DialogContent className="sm:max-w-md bg-white">
              <button
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                onClick={() => setIsShareOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
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
                   title="Open in new tab"
                >
                   <ExternalLink className="h-4 w-4" />
                </Button>
                <Button 
                    type="submit" 
                    size="sm" 
                    className="px-3" 
                    onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/forms/${currentForm?.id}/view`);
                        // Could add toast here
                    }}
                >
                  <span className="sr-only">Copy</span>
                  <Copy className="h-4 w-4" />
                </Button>
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

          {/* Collaborator Modal */}
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
              onUpdate={() => {
                // Optionally trigger a refresh of form data here
                // For now, collaborators will be updated on next page load
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
